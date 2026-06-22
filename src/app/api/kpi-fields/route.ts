import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface KpiField { id: string; name: string; code: string; description: string; status: string; sortOrder: number; }

export async function GET() { return NextResponse.json(readDb<KpiField>('kpi-fields')); }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<KpiField>('kpi-fields');
  const newItem = { id: `kf_${generateId()}`, ...body, status: body.status || 'active' };
  items.push(newItem); writeDb('kpi-fields', items);
  return NextResponse.json(newItem, { status: 201 });
}
