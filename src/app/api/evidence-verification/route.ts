import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface KPIEvidence {
  id: string; planItemId: string;
  evidenceType: 'file' | 'url' | 'system_log' | 'survey' | 'email';
  fileUrl?: string; externalUrl?: string; fileName?: string;
  status: 'pending' | 'submitted' | 'needs_supplement' | 'valid' | 'invalid' | 'locked';
  reviewerNote?: string; reviewedBy?: string; reviewedAt?: string;
}

export async function GET() {
  const items = readDb<KPIEvidence>('evidences');
  return NextResponse.json(items.filter(i => i.status === 'submitted'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, status, reviewerNote } = body;
  if (!id || !status) {
    return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
  }
  if (!['valid', 'invalid', 'needs_supplement'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  const items = readDb<KPIEvidence>('evidences');
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
  items[idx].status = status;
  if (reviewerNote) items[idx].reviewerNote = reviewerNote;
  writeDb('evidences', items);
  return NextResponse.json(items[idx]);
}
