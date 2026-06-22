import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { SchoolKPICatalog } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  let items = readDb<SchoolKPICatalog>('school-kpi-catalog');
  if (status) items = items.filter(i => i.status === status);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<SchoolKPICatalog>('school-kpi-catalog');
  const newItem: SchoolKPICatalog = {
    id: `CTU-KPI-${generateId()}`,
    code: body.code,
    name: body.name,
    categoryId: body.categoryId,
    formula: body.formula,
    unit: body.unit,
    direction: body.direction || 'higher_better',
    requiredEvidence: body.requiredEvidence ?? true,
    maxScore: body.maxScore,
    status: 'active',
  };
  items.push(newItem);
  writeDb('school-kpi-catalog', items);
  return NextResponse.json(newItem, { status: 201 });
}
