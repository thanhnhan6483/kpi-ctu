import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { KPITemplateItem } from '@/types';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const items = readDb<KPITemplateItem>('kpi-template-items');
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[index] = { ...items[index], ...body };
  writeDb('kpi-template-items', items);

  // Recalc template
  const templates = readDb<any>('kpi-templates');
  const tIdx = templates.findIndex((t: any) => t.id === items[index].templateId);
  if (tIdx !== -1) {
    const tItems = items.filter(i => i.templateId === items[index].templateId);
    templates[tIdx].indicatorCount = tItems.length;
    templates[tIdx].totalWeight = tItems.reduce((s, i) => s + i.weight, 0);
    templates[tIdx].updatedAt = new Date().toISOString();
    writeDb('kpi-templates', templates);
  }

  return NextResponse.json(items[index]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<KPITemplateItem>('kpi-template-items');
  const target = items.find(i => i.id === id);
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('kpi-template-items', filtered);

  // Recalc template
  if (target) {
    const templates = readDb<any>('kpi-templates');
    const tIdx = templates.findIndex((t: any) => t.id === target.templateId);
    if (tIdx !== -1) {
      const tItems = filtered.filter(i => i.templateId === target.templateId);
      templates[tIdx].indicatorCount = tItems.length;
      templates[tIdx].totalWeight = tItems.reduce((s, i) => s + i.weight, 0);
      templates[tIdx].updatedAt = new Date().toISOString();
      writeDb('kpi-templates', templates);
    }
  }

  return NextResponse.json({ success: true });
}
