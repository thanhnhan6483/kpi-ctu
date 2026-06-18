import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface ScoreRecord {
  id: string;
  planItemId: string;
  selfScore: number | null;
  managerScore: number | null;
  councilScore: number | null;
  finalScore: number | null;
}

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
  const planItemId = searchParams.get('planItemId');
  const planId = searchParams.get('planId');

  if (planId) {
    const planItems = readDb<PlanItemRecord>('plan-items');
    const itemIds = planItems.filter(p => p.planId === planId).map(p => p.id);
    const allScores = readDb<ScoreRecord>('scores');
    return NextResponse.json(allScores.filter(s => itemIds.includes(s.planItemId)));
  }

  if (planItemId) {
    const allScores = readDb<ScoreRecord>('scores');
    return NextResponse.json(allScores.filter(s => s.planItemId === planItemId));
  }

  return NextResponse.json(readDb<ScoreRecord>('scores'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const records = readDb<ScoreRecord>('scores');
  const newRecord: ScoreRecord = {
    id: `SC${generateId()}`,
    planItemId: body.planItemId,
    selfScore: body.selfScore ?? null,
    managerScore: body.managerScore ?? null,
    councilScore: body.councilScore ?? null,
    finalScore: body.finalScore ?? null,
  };
  records.push(newRecord);
  writeDb('scores', records);
  return NextResponse.json(newRecord, { status: 201 });
}
