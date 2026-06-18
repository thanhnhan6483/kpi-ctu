import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { KPIGroup } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const academicYearId = searchParams.get('academicYearId');
  let items = readDb<KPIGroup>('kpi-groups');
  if (academicYearId) items = items.filter(i => i.academicYearId === academicYearId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<KPIGroup>('kpi-groups');
  const newItem: KPIGroup = {
    id: `grp_${generateId()}`,
    academicYearId: body.academicYearId,
    name: body.name,
    code: body.code,
    defaultWeight: body.defaultWeight,
    targetLevel: body.targetLevel || 'school',
  };
  items.push(newItem);
  writeDb('kpi-groups', items);
  return NextResponse.json(newItem, { status: 201 });
}
