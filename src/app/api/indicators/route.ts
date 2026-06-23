import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { KPIIndicator } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const academicYearId = searchParams.get('academicYearId');
  let items = readDb<KPIIndicator>('indicators');
  if (academicYearId) items = items.filter(i => i.academicYearId === academicYearId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<KPIIndicator>('indicators');
  const newItem: KPIIndicator = {
    id: `CTU-KPI-${generateId()}`,
    academicYearId: body.academicYearId,
    code: body.code,
    name: body.name,
    categoryId: body.categoryId,
    formula: body.formula,
    unit: body.unit,
    direction: body.direction || 'higher_better',
    requiredEvidence: body.requiredEvidence ?? true,
    maxScore: body.maxScore,
    targetValue: body.targetValue,
    weight: body.weight,
  };
  items.push(newItem);
  writeDb('indicators', items);
  return NextResponse.json(newItem, { status: 201 });
}
