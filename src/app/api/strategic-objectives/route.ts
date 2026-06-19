import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { StrategicObjective } from '@/types';

export async function GET() {
  return NextResponse.json(readDb<StrategicObjective>('strategic-objectives'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<StrategicObjective>('strategic-objectives');
  const now = new Date().toISOString();
  const newItem: StrategicObjective = {
    id: `so${generateId()}`,
    academicYearId: body.academicYearId,
    name: body.name,
    description: body.description || '',
    field: body.field || '',
    leadUnitId: body.leadUnitId || '',
    supportUnitIds: body.supportUnitIds || [],
    indicatorIds: body.indicatorIds || [],
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  items.push(newItem);
  writeDb('strategic-objectives', items);
  return NextResponse.json(newItem, { status: 201 });
}
