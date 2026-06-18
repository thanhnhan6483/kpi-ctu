import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { KPICycle } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const academicYearId = searchParams.get('academicYearId');
  const all = readDb<KPICycle>('cycles');
  if (academicYearId) {
    return NextResponse.json(all.filter(c => c.academicYearId === academicYearId));
  }
  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<KPICycle>('cycles');
  const newItem: KPICycle = {
    id: `c${generateId()}`,
    academicYearId: body.academicYearId,
    name: body.name,
    startDate: body.startDate,
    endDate: body.endDate,
    status: body.status || 'draft',
  };
  items.push(newItem);
  writeDb('cycles', items);
  return NextResponse.json(newItem, { status: 201 });
}
