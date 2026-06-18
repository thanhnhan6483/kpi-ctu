import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evaluations = readDb<EvaluationRecord>('evaluations');
  const evaluation = evaluations.find(e => e.id === id);
  if (!evaluation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(evaluation);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const evaluations = readDb<EvaluationRecord>('evaluations');
  const index = evaluations.findIndex(e => e.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const allowed = ['planId', 'evaluatorId', 'evaluationType', 'comment', 'status', 'level', 'personId', 'personName', 'positionCode'];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      (evaluations[index] as any)[key] = body[key];
    }
  }
  evaluations[index].updatedAt = new Date().toISOString();

  writeDb('evaluations', evaluations);
  return NextResponse.json(evaluations[index]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evaluations = readDb<EvaluationRecord>('evaluations');
  const filtered = evaluations.filter(e => e.id !== id);
  if (filtered.length === evaluations.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('evaluations', filtered);
  return NextResponse.json({ success: true });
}
