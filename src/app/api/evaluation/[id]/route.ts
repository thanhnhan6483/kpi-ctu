import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

function calcGrade(score: number): string {
  if (score >= 90) return 'Xuất sắc';
  if (score >= 80) return 'Tốt';
  if (score >= 65) return 'Đạt';
  if (score >= 50) return 'Cần cải thiện';
  return 'Không đạt';
}

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
  const evaluations = readDb<Evaluation>('evaluations');
  const evaluation = evaluations.find(e => e.id === id);
  if (!evaluation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(evaluation);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const evaluations = readDb<Evaluation>('evaluations');
  const index = evaluations.findIndex(e => e.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const now = new Date().toISOString();
  const eval_ = evaluations[index];

  if (body.selfScore !== undefined) {
    eval_.selfScore = body.selfScore;
    eval_.selfComment = body.selfComment || eval_.selfComment;
    eval_.selfEvaluatedAt = now;
    eval_.status = 'self_evaluated';
  }
  if (body.managerScore !== undefined) {
    eval_.managerScore = body.managerScore;
    eval_.managerComment = body.managerComment || eval_.managerComment;
    eval_.managerReviewedAt = now;
    eval_.status = 'manager_review';
  }
  if (body.councilScore !== undefined) {
    eval_.councilScore = body.councilScore;
    eval_.councilComment = body.councilComment || eval_.councilComment;
    eval_.councilReviewedAt = now;
    eval_.status = 'evaluated';
  }
  if (body.status === 'locked') {
    eval_.status = 'locked';
    eval_.lockedAt = now;
  }

  const scores = [eval_.selfScore, eval_.managerScore, eval_.councilScore].filter(s => s !== null) as number[];
  if (scores.length > 0) {
    eval_.finalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    eval_.grade = calcGrade(eval_.finalScore);
  }
  eval_.updatedAt = now;

  evaluations[index] = eval_;
  writeDb('evaluations', evaluations);
  return NextResponse.json(evaluations[index]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evaluations = readDb<Evaluation>('evaluations');
  const filtered = evaluations.filter(e => e.id !== id);
  if (filtered.length === evaluations.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('evaluations', filtered);
  return NextResponse.json({ success: true });
}
