import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface EvidenceRecord {
  id: string;
  planItemId: string;
  evidenceType: 'file' | 'url' | 'system_log' | 'survey' | 'email';
  fileName?: string;
  fileUrl?: string;
  externalUrl?: string;
  status: 'pending' | 'submitted' | 'needs_supplement' | 'valid' | 'invalid' | 'locked';
  reviewerNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
  submittedBy: string;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evidences = readDb<EvidenceRecord>('evidences');
  const evidence = evidences.find(e => e.id === id);
  if (!evidence) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(evidence);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const evidences = readDb<EvidenceRecord>('evidences');
  const index = evidences.findIndex(e => e.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (body.status !== undefined && body.status !== evidences[index].status) {
    evidences[index] = { ...evidences[index], ...body, reviewedAt: new Date().toISOString() };
  } else {
    evidences[index] = { ...evidences[index], ...body };
  }
  writeDb('evidences', evidences);
  return NextResponse.json(evidences[index]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evidences = readDb<EvidenceRecord>('evidences');
  const filtered = evidences.filter(e => e.id !== id);
  if (filtered.length === evidences.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('evidences', filtered);
  return NextResponse.json({ success: true });
}
