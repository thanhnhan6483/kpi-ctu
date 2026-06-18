import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface ProgressRecord {
  id: string;
  indicatorId: string;
  indicatorName: string;
  unitId: string;
  unitName: string;
  targetValue: number;
  actualValue: number;
  unit: string;
  progressPercent: number;
  lastUpdated: string;
  updatedBy: string;
  note: string;
  cycleName: string;
}

export async function GET() {
  return NextResponse.json(readDb<ProgressRecord>('progress'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const records = readDb<ProgressRecord>('progress');
  const now = new Date().toISOString();
  const newRecord: ProgressRecord = {
    id: `PR${generateId()}`,
    indicatorId: body.indicatorId,
    indicatorName: body.indicatorName,
    unitId: body.unitId,
    unitName: body.unitName,
    targetValue: body.targetValue,
    actualValue: body.actualValue,
    unit: body.unit,
    progressPercent: body.targetValue > 0 ? Math.round((body.actualValue / body.targetValue) * 100) : 0,
    lastUpdated: now,
    updatedBy: body.updatedBy,
    note: body.note || '',
    cycleName: body.cycleName,
  };
  records.push(newRecord);
  writeDb('progress', records);
  return NextResponse.json(newRecord, { status: 201 });
}
