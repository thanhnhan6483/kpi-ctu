import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface KPITemplate {
  id: string;
  name: string;
  targetLevel: string;
  status: string;
  description: string;
  indicatorCount: number;
  totalWeight: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  activatedAt?: string;
  lockedAt?: string;
}

interface OrganizationalUnit {
  id: string;
  parentId: string | null;
  name: string;
  code: string;
  type: string;
  managerId: string;
  status: string;
}

interface CatalogItem {
  id: string;
  code: string;
  name: string;
  unitId: string;
  status: string;
}

interface MeasurementUnit {
  id: string;
  name: string;
}

interface KPITemplateItem {
  id: string;
  templateId: string;
  indicatorId: string;
  weight: number;
  targetValue: number;
  capRate: number;
}

interface UnitKPIDetail {
  id: string;
  name: string;
  target: number;
  unit: string;
  weight: number;
  indicatorId: string | null;
}

interface UnitKPIEntry {
  id: string;
  academicYearId?: string;
  name: string;
  code: string;
  type: string;
  level: string;
  description: string;
  kpiCount: number;
  kpis: UnitKPIDetail[];
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<KPITemplate>('kpi-templates');
  const item = items.find(i => i.id === id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action !== 'apply') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const body = await request.json();
  const { academicYearId } = body;
  if (!academicYearId) {
    return NextResponse.json({ error: 'Missing academicYearId' }, { status: 400 });
  }

  // Load data
  const templates = readDb<KPITemplate>('kpi-templates');
  const template = templates.find(t => t.id === id);
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  if (template.status !== 'active' && template.status !== 'locked') {
    return NextResponse.json({ error: 'Template must be active or locked' }, { status: 400 });
  }

  const templateItems = readDb<KPITemplateItem>('kpi-template-items').filter(ti => ti.templateId === id);
  if (templateItems.length === 0) {
    return NextResponse.json({ error: 'Template has no indicators' }, { status: 400 });
  }

  const units = readDb<OrganizationalUnit>('units').filter(u => u.status === 'active');
  const existingEntries = readDb<UnitKPIEntry>('unit-kpis').filter(e => e.academicYearId === academicYearId);
  const existingUnitIds = new Set(existingEntries.map(e => e.code));

  // Determine target units based on template targetLevel
  const typeFilter = (): string[] => {
    switch (template.targetLevel) {
      case 'school': return ['university'];
      case 'unit': return ['faculty', 'center', 'division'];
      case 'department': return ['department'];
      default: return [];
    }
  };

  const allowedTypes = typeFilter();
  const targetUnits = units.filter(u => allowedTypes.includes(u.type));
  if (targetUnits.length === 0) {
    return NextResponse.json({ error: 'No applicable units found' }, { status: 400 });
  }

  // Load catalogs and measurement units for name/unit resolution
  const schoolCatalog = readDb<CatalogItem>('school-kpi-catalog').filter(c => c.status === 'active');
  const unitCatalog = readDb<CatalogItem>('unit-kpi-catalog').filter(c => c.status === 'active');
  const indCatalog = readDb<CatalogItem>('individual-kpi-catalog').filter(c => c.status === 'active');
  const allCatalogs = [...schoolCatalog, ...unitCatalog, ...indCatalog];
  const catalogMap = new Map(allCatalogs.map(c => [c.id, c]));

  const measurementUnits = readDb<MeasurementUnit>('measurement-units');
  const muMap = new Map(measurementUnits.map(m => [m.id, m.name]));

  const resolveName = (indicatorId: string): string => {
    const cat = catalogMap.get(indicatorId);
    return cat ? `${cat.code} — ${cat.name}` : indicatorId;
  };

  const resolveUnit = (indicatorId: string): string => {
    const cat = catalogMap.get(indicatorId);
    if (!cat) return '';
    return muMap.get(cat.unitId) || '';
  };

  // Generate entries for target units that don't already have one for this year
  const createdEntries: UnitKPIEntry[] = [];
  const skippedUnits: string[] = [];

  for (const unit of targetUnits) {
    if (existingUnitIds.has(unit.code)) {
      skippedUnits.push(unit.name);
      continue;
    }

    const kpis: UnitKPIDetail[] = templateItems.map(ti => ({
      id: ti.indicatorId,
      name: resolveName(ti.indicatorId),
      target: ti.targetValue,
      unit: resolveUnit(ti.indicatorId),
      weight: ti.weight,
      indicatorId: ti.indicatorId,
    }));

    const entry: UnitKPIEntry = {
      id: `unit_${unit.code.toLowerCase()}_${generateId().substring(0, 4)}`,
      academicYearId,
      name: unit.name,
      code: unit.code,
      type: unit.type,
      level: template.targetLevel,
      description: '',
      kpiCount: kpis.length,
      kpis,
    };

    createdEntries.push(entry);
  }

  // Save
  const allEntries = readDb<UnitKPIEntry>('unit-kpis');
  allEntries.push(...createdEntries);
  writeDb('unit-kpis', allEntries);

  return NextResponse.json({
    success: true,
    templateId: id,
    academicYearId,
    unitsApplied: createdEntries.length,
    totalKpisCreated: createdEntries.reduce((s, e) => s + e.kpiCount, 0),
    skippedUnits,
    createdEntries,
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const items = readDb<KPITemplate>('kpi-templates');
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[index] = { ...items[index], ...body, updatedAt: new Date().toISOString() };
  writeDb('kpi-templates', items);
  return NextResponse.json(items[index]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<KPITemplate>('kpi-templates');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('kpi-templates', filtered);
  // Cascade delete related template items
  const tItems = readDb<any>('kpi-template-items');
  writeDb('kpi-template-items', tItems.filter((ti: any) => ti.templateId !== id));
  return NextResponse.json({ success: true });
}
