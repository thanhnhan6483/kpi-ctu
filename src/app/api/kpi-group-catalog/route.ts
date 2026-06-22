import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { KPIGroupCatalog } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  let items = readDb<KPIGroupCatalog>('kpi-group-catalog');
  if (status) items = items.filter(i => i.status === status);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<KPIGroupCatalog>('kpi-group-catalog');
  const newItem: KPIGroupCatalog = {
    id: `grp_${generateId()}`,
    code: body.code,
    name: body.name,
    defaultWeight: body.defaultWeight,
    targetLevel: body.targetLevel || 'school',
    status: 'active',
  };
  items.push(newItem);
  writeDb('kpi-group-catalog', items);
  return NextResponse.json(newItem, { status: 201 });
}
