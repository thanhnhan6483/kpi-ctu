import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface Evidence {
  id: string;
  indicatorId: string;
  indicatorName: string;
  unitId: string;
  unitName: string;
  type: 'file' | 'url' | 'system_log';
  fileName: string;
  status: 'pending' | 'valid' | 'needs_supplement' | 'invalid';
  submittedAt: string;
  submittedBy: string;
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: string;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evidences = readDb<Evidence>('evidences');
  const evidence = evidences.find(e => e.id === id);
  if (!evidence) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(evidence);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const evidences = readDb<Evidence>('evidences');
  const index = evidences.findIndex(e => e.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  evidences[index] = { ...evidences[index], ...body, reviewedAt: body.status !== evidences[index].status ? new Date().toISOString() : evidences[index].reviewedAt };
  writeDb('evidences', evidences);
  return NextResponse.json(evidences[index]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evidences = readDb<Evidence>('evidences');
  const filtered = evidences.filter(e => e.id !== id);
  if (filtered.length === evidences.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('evidences', filtered);
  return NextResponse.json({ success: true });
}
