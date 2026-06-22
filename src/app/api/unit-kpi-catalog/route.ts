import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { UnitKPICatalog } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  let items = readDb<UnitKPICatalog>('unit-kpi-catalog');
  if (status) items = items.filter(i => i.status === status);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<UnitKPICatalog>('unit-kpi-catalog');
  const newItem: UnitKPICatalog = {
    id: `catuk_${generateId()}`,
    code: body.code,
    name: body.name,
    unit: body.unit,
    linkedCatalogId: body.linkedCatalogId || null,
    status: 'active',
  };
  items.push(newItem);
  writeDb('unit-kpi-catalog', items);
  return NextResponse.json(newItem, { status: 201 });
}
