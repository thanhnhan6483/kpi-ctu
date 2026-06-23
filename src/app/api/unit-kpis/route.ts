import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { UnitKPIEntry } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const academicYearId = searchParams.get('academicYearId');
  let items = readDb<UnitKPIEntry>('unit-kpis');
  if (academicYearId) items = items.filter(i => i.academicYearId === academicYearId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<UnitKPIEntry>('unit-kpis');
  const newItem: UnitKPIEntry = {
    id: `unit_${generateId()}`,
    academicYearId: body.academicYearId,
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
