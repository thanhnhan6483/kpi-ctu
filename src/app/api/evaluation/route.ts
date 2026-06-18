import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface EvaluationRecord {
  id: string;
  planId: string;
  evaluatorId: string;
  evaluationType: 'self' | 'manager' | 'council';
  comment: string;
  status: 'pending' | 'submitted' | 'approved';
  level?: 'unit' | 'individual';
  personId?: string;
  personName?: string;
  positionCode?: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level');
  let evaluations = readDb<EvaluationRecord>('evaluations');
  if (level === 'individual') {
    evaluations = evaluations.filter(e => e.level === 'individual');
  } else if (level === 'unit') {
    evaluations = evaluations.filter(e => e.level !== 'individual');
  }
  return NextResponse.json(evaluations);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const evaluations = readDb<EvaluationRecord>('evaluations');
  const now = new Date().toISOString();
  const newEval: EvaluationRecord = {
    id: `EVL${generateId()}`,
    planId: body.planId,
    evaluatorId: body.evaluatorId,
    evaluationType: body.evaluationType,
    comment: body.comment || '',
    status: 'pending',
    level: body.level || 'unit',
    personId: body.personId,
    personName: body.personName,
    positionCode: body.positionCode,
    createdAt: now,
    updatedAt: now,
  };
  evaluations.push(newEval);
  writeDb('evaluations', evaluations);
  return NextResponse.json(newEval, { status: 201 });
}
