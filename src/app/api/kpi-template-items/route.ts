import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { KPITemplateItem } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get('templateId');
  let items = readDb<KPITemplateItem>('kpi-template-items');
  if (templateId) {
    items = items.filter(i => i.templateId === templateId);
  }
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<KPITemplateItem>('kpi-template-items');
  const newItem: KPITemplateItem = {
    id: `ti${generateId()}`,
    templateId: body.templateId,
    indicatorId: body.indicatorId,
    weight: body.weight ?? 5,
    targetValue: body.targetValue ?? 0,
    capRate: body.capRate ?? 100,
  };
  items.push(newItem);
  writeDb('kpi-template-items', items);

  // Recalc template indicatorCount + totalWeight
  const templates = readDb<any>('kpi-templates');
  const tIdx = templates.findIndex((t: any) => t.id === body.templateId);
  if (tIdx !== -1) {
    const tItems = items.filter(i => i.templateId === body.templateId);
    templates[tIdx].indicatorCount = tItems.length;
    templates[tIdx].totalWeight = tItems.reduce((s, i) => s + i.weight, 0);
    templates[tIdx].updatedAt = new Date().toISOString();
    writeDb('kpi-templates', templates);
  }

  return NextResponse.json(newItem, { status: 201 });
}
