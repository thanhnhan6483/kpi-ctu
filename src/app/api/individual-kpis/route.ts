import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { IndividualKPIEntry } from '@/types';

export async function GET() {
  return NextResponse.json(readDb<IndividualKPIEntry>('individual-kpis'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<IndividualKPIEntry>('individual-kpis');
  const newItem: IndividualKPIEntry = {
    id: `pos_${generateId()}`,
    name: body.name,
    code: body.code,
    kpis: body.kpis || [],
  };
  items.push(newItem);
  writeDb('individual-kpis', items);
  return NextResponse.json(newItem, { status: 201 });
}
