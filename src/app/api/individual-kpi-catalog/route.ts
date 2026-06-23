import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { IndividualKPICatalog } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const positionCode = searchParams.get('positionCode');
  let items = readDb<IndividualKPICatalog>('individual-kpi-catalog');
  if (status) items = items.filter(i => i.status === status);
  if (positionCode) items = items.filter(i => i.positionCode === positionCode);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<IndividualKPICatalog>('individual-kpi-catalog');
  const newItem: IndividualKPICatalog = {
    id: `catin_${generateId()}`,
    code: body.code,
    name: body.name,
    positionCode: body.positionCode,
    unitId: body.unitId,
    linkedCatalogId: body.linkedCatalogId || null,
    status: 'active',
  };
  items.push(newItem);
  writeDb('individual-kpi-catalog', items);
  return NextResponse.json(newItem, { status: 201 });
}
