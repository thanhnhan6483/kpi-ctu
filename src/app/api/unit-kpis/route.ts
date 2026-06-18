import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { UnitKPIEntry } from '@/types';

export async function GET() {
  return NextResponse.json(readDb<UnitKPIEntry>('unit-kpis'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<UnitKPIEntry>('unit-kpis');
  const newItem: UnitKPIEntry = {
    id: `unit_${generateId()}`,
    name: body.name,
    code: body.code,
    type: body.type || 'department',
    level: body.level || 'unit',
    description: body.description || '',
    kpiCount: body.kpis?.length || 0,
    kpis: body.kpis || [],
  };
  items.push(newItem);
  writeDb('unit-kpis', items);
  return NextResponse.json(newItem, { status: 201 });
}
