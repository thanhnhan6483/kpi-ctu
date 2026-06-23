import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { IndividualKPIEntry } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const academicYearId = searchParams.get('academicYearId');
  let items = readDb<IndividualKPIEntry>('individual-kpis');
  if (academicYearId) items = items.filter(i => i.academicYearId === academicYearId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<IndividualKPIEntry>('individual-kpis');
  const newItem: IndividualKPIEntry = {
    id: `pos_${generateId()}`,
    academicYearId: body.academicYearId,
    name: body.name,
    code: body.code,
    kpis: body.kpis || [],
  };
  items.push(newItem);
  writeDb('individual-kpis', items);
  return NextResponse.json(newItem, { status: 201 });
}
