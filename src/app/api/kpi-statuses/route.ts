import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface KpiStatus { id: string; name: string; code: string; description: string; color: string; sortOrder: number; category: string; }

export async function GET() { return NextResponse.json(readDb<KpiStatus>('kpi-statuses')); }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<KpiStatus>('kpi-statuses');
  const newItem = { id: `ks_${generateId()}`, ...body, status: body.status || 'active' };
  items.push(newItem); writeDb('kpi-statuses', items);
  return NextResponse.json(newItem, { status: 201 });
}
