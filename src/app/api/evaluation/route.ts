import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface Evaluation {
  id: string;
  unitId: string;
  unitName: string;
  cycleName: string;
  selfScore: number | null;
  selfComment: string;
  managerScore: number | null;
  managerComment: string;
  councilScore: number | null;
  councilComment: string;
  finalScore: number | null;
  grade: string | null;
  status: 'pending' | 'self_evaluated' | 'manager_review' | 'council_review' | 'evaluated' | 'locked';
  level?: 'unit' | 'individual';
  personId?: string;
  personName?: string;
  positionCode?: string;
  personUnitId?: string;
  selfEvaluatedAt?: string;
  managerReviewedAt?: string;
  councilReviewedAt?: string;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level');
  let evaluations = readDb<Evaluation>('evaluations');
  if (level === 'individual') {
    evaluations = evaluations.filter(e => e.level === 'individual');
  } else if (level === 'unit') {
    evaluations = evaluations.filter(e => e.level !== 'individual');
  }
  return NextResponse.json(evaluations);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const evaluations = readDb<Evaluation>('evaluations');
  const now = new Date().toISOString();
  const newEval: Evaluation = {
    id: `EVL${generateId()}`,
    unitId: body.unitId || '',
    unitName: body.unitName || '',
    cycleName: body.cycleName || 'Năm học 2025-2026',
    selfScore: null,
    selfComment: '',
    managerScore: null,
    managerComment: '',
    councilScore: null,
    councilComment: '',
    finalScore: null,
    grade: null,
    status: 'pending',
    level: body.level || 'unit',
    personId: body.personId,
    personName: body.personName,
    positionCode: body.positionCode,
    personUnitId: body.personUnitId,
    createdAt: now,
    updatedAt: now,
  };
  evaluations.push(newEval);
  writeDb('evaluations', evaluations);
  return NextResponse.json(newEval, { status: 201 });
}
