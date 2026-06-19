import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

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

export async function GET() {
  const evaluations = readDb<IndividualEvaluation>('individual-evaluations');
  return NextResponse.json(evaluations);
}
