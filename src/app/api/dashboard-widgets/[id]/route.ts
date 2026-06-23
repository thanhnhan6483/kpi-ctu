import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface DashboardWidgetConfig {
  id: string; userId: string; widgetKey: string;
  widgetType: 'chart' | 'table' | 'stat' | 'alert' | 'progress' | 'calendar';
  title: string; config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
  isVisible: boolean; createdAt: string; updatedAt: string;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await request.json();
  const items = readDb<DashboardWidgetConfig>('dashboard-widgets');
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[idx] = { ...items[idx], ...body, updatedAt: new Date().toISOString() }; writeDb('dashboard-widgets', items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<DashboardWidgetConfig>('dashboard-widgets');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('dashboard-widgets', filtered); return NextResponse.json({ success: true });
}
