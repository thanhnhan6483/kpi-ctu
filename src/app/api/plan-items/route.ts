import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface PlanItemRecord {
  id: string;
  planId: string;
  indicatorId: string;
  targetValue: number;
  weight: number;
  dueDate: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get('planId');
  const records = readDb<PlanItemRecord>('plan-items');
  if (planId) {
    return NextResponse.json(records.filter(r => r.planId === planId));
  }
  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const records = readDb<PlanItemRecord>('plan-items');
  const newRecord: PlanItemRecord = {
    id: `PI${generateId()}`,
    planId: body.planId,
    indicatorId: body.indicatorId,
    targetValue: body.targetValue,
    weight: body.weight,
    dueDate: body.dueDate,
  };
  records.push(newRecord);
  writeDb('plan-items', records);
  return NextResponse.json(newRecord, { status: 201 });
}
