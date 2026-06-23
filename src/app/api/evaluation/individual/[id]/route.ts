import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface IndividualEvaluation {
  id: string;
  unitId: string;
  unitName: string;
  cycleName: string;
  level?: string;
  personId?: string;
  personName?: string;
  positionCode?: string;
  personUnitId?: string;
  selfScore: number | null;
  selfComment: string;
  managerScore: number | null;
  managerComment: string;
  councilScore: number | null;
  councilComment: string;
  finalScore: number | null;
  grade: string | null;
  status: string;
  selfEvaluatedAt?: string;
  managerReviewedAt?: string;
  councilReviewedAt?: string;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evaluations = readDb<IndividualEvaluation>('individual-evaluations');
  const evaluation = evaluations.find(e => e.id === id);
  if (!evaluation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(evaluation);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const evaluations = readDb<IndividualEvaluation>('individual-evaluations');
  const index = evaluations.findIndex(e => e.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const allowed = [
    'selfScore', 'selfComment', 'managerScore', 'managerComment',
    'councilScore', 'councilComment', 'finalScore', 'grade', 'status',
    'selfEvaluatedAt', 'managerReviewedAt', 'councilReviewedAt', 'lockedAt',
  ];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      (evaluations[index] as any)[key] = body[key];
    }
  }
  evaluations[index].updatedAt = new Date().toISOString();

  writeDb('individual-evaluations', evaluations);
  return NextResponse.json(evaluations[index]);
}
