import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface DashboardWidgetConfig {
  id: string; userId: string; widgetKey: string;
  widgetType: 'chart' | 'table' | 'stat' | 'alert' | 'progress' | 'calendar';
  title: string; config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
  isVisible: boolean; createdAt: string; updatedAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  let items = readDb<DashboardWidgetConfig>('dashboard-widgets');
  if (userId) items = items.filter(i => i.userId === userId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<DashboardWidgetConfig>('dashboard-widgets');
  const now = new Date().toISOString();
  const newItem: DashboardWidgetConfig = {
    id: `dw${generateId()}`,
    userId: body.userId, widgetKey: body.widgetKey, widgetType: body.widgetType,
    title: body.title, config: body.config || {},
    position: body.position || { x: 0, y: 0, w: 4, h: 3 },
    isVisible: body.isVisible ?? true, createdAt: now, updatedAt: now,
  };
  items.push(newItem); writeDb('dashboard-widgets', items);
  return NextResponse.json(newItem, { status: 201 });
}
