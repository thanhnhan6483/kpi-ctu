import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface ProgressRecord {
  id: string;
  planItemId: string;
  actualValue: number;
  progressDate: string;
  note: string;
  updatedBy: string;
  level?: 'unit' | 'individual';
  personId?: string;
  personName?: string;
  positionCode?: string;
}

export async function GET() {
  return NextResponse.json(readDb<ProgressRecord>('progress'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const records = readDb<ProgressRecord>('progress');
  const planItems = readDb<{ id: string; targetValue: number }>('plan-items');
  const planItem = planItems.find(p => p.id === body.planItemId);

  const newRecord: ProgressRecord = {
    id: `PR${generateId()}`,
    planItemId: body.planItemId,
    actualValue: body.actualValue,
    progressDate: body.progressDate || new Date().toISOString(),
    note: body.note || '',
    updatedBy: body.updatedBy,
    level: body.level,
    personId: body.personId,
    personName: body.personName,
    positionCode: body.positionCode,
  };
  records.push(newRecord);
  writeDb('progress', records);

  const target = planItem?.targetValue ?? 0;
  const progressPercent = target > 0 ? Math.round((newRecord.actualValue / target) * 100) : 0;

  return NextResponse.json({ ...newRecord, progressPercent }, { status: 201 });
}
