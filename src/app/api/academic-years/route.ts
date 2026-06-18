import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { AcademicYear } from '@/types';

export async function GET() {
  return NextResponse.json(readDb<AcademicYear>('academic-years'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<AcademicYear>('academic-years');
  const newItem: AcademicYear = {
    id: `ay${generateId()}`,
    name: body.name,
    startDate: body.startDate,
    endDate: body.endDate,
    status: body.status || 'inactive',
  };
  items.push(newItem);
  writeDb('academic-years', items);
  return NextResponse.json(newItem, { status: 201 });
}
