import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { KPIGroup, KPIIndicator, UnitKPIEntry, IndividualKPIEntry, BSCMapLink } from '@/types';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fromYear = searchParams.get('fromYear');
  const toYear = searchParams.get('toYear');

  if (!fromYear || !toYear) {
    return NextResponse.json({ error: 'Missing fromYear or toYear' }, { status: 400 });
  }
  if (fromYear === toYear) {
    return NextResponse.json({ error: 'fromYear must differ from toYear' }, { status: 400 });
  }

  // Check target year already has data
  const existingGroups = readDb<KPIGroup>('kpi-groups');
  const existingIndicators = readDb<KPIIndicator>('indicators');
  const existingUnitKpis = readDb<UnitKPIEntry>('unit-kpis');
  const existingIndKpis = readDb<IndividualKPIEntry>('individual-kpis');

  const hasData = (items: any[]) => items.some(i => i.academicYearId === toYear);
  if (hasData(existingGroups) || hasData(existingIndicators) || hasData(existingUnitKpis) || hasData(existingIndKpis)) {
    return NextResponse.json({ error: 'Năm đích đã có dữ liệu. Vui lòng xóa trước khi clone.' }, { status: 409 });
  }

  // Clone kpi-groups
  const sourceGroups = existingGroups.filter(i => i.academicYearId === fromYear);
  const idMap = new Map<string, string>();
  const clonedGroups = sourceGroups.map(g => {
    const newId = `grp_${generateId()}`;
    idMap.set(g.id, newId);
    return { ...g, id: newId, academicYearId: toYear };
  });

  // Clone indicators (map categoryId via idMap)
  const sourceIndicators = existingIndicators.filter(i => i.academicYearId === fromYear);
  const idMapInd = new Map<string, string>();
  const clonedIndicators = sourceIndicators.map(ind => {
    const newId = `CTU-KPI-${generateId()}`;
    idMapInd.set(ind.id, newId);
    return {
      ...ind,
      id: newId,
      academicYearId: toYear,
      categoryId: idMap.get(ind.categoryId) || ind.categoryId,
    };
  });

  // Clone unit-kpis (remap indicatorId in kpis)
  const sourceUnitKpis = existingUnitKpis.filter(i => i.academicYearId === fromYear);
  const idMapUnit = new Map<string, string>();
  const clonedUnitKpis = sourceUnitKpis.map(u => {
    const newId = `unit_${generateId()}`;
    idMapUnit.set(u.id, newId);
    return {
      ...u,
      id: newId,
      academicYearId: toYear,
      kpis: u.kpis.map(k => ({
        ...k,
        indicatorId: k.indicatorId ? idMapInd.get(k.indicatorId) || k.indicatorId : null,
      })),
    };
  });

  // Clone individual-kpis (remap unitKpiId in kpis)
  const sourceIndKpis = existingIndKpis.filter(i => i.academicYearId === fromYear);
  const clonedIndKpis = sourceIndKpis.map(p => {
    const newId = `pos_${generateId()}`;
    return {
      ...p,
      id: newId,
      academicYearId: toYear,
      kpis: p.kpis.map(k => ({
        ...k,
        unitKpiId: k.unitKpiId ? idMapUnit.get(k.unitKpiId) || k.unitKpiId : null,
      })),
    };
  });

  // Clone bsc-map-links for objective_to_indicator (code is preserved, no remap needed)
  const existingLinks = readDb<BSCMapLink>('bsc-map-links');
  const sourceLinks = existingLinks.filter(l => l.linkType === 'objective_to_indicator');
  const clonedLinks = sourceLinks.map(l => ({
    ...l,
    id: `bscl${generateId()}`,
  }));

  // Persist
  writeDb('kpi-groups', [...existingGroups, ...clonedGroups]);
  writeDb('indicators', [...existingIndicators, ...clonedIndicators]);
  writeDb('unit-kpis', [...existingUnitKpis, ...clonedUnitKpis]);
  writeDb('individual-kpis', [...existingIndKpis, ...clonedIndKpis]);
  writeDb('bsc-map-links', [...existingLinks, ...clonedLinks]);

  return NextResponse.json({
    groups: clonedGroups.length,
    indicators: clonedIndicators.length,
    unitKpis: clonedUnitKpis.length,
    individualKpis: clonedIndKpis.length,
    bscMapLinks: clonedLinks.length,
  });
}
