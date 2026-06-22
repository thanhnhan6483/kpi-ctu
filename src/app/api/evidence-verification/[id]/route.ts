import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

interface KPIEvidence {
  id: string; planItemId: string;
  evidenceType: 'file' | 'url' | 'system_log' | 'survey' | 'email';
  fileUrl?: string; externalUrl?: string; fileName?: string;
  status: 'pending' | 'submitted' | 'needs_supplement' | 'valid' | 'invalid' | 'locked';
  reviewerNote?: string; reviewedBy?: string; reviewedAt?: string;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<KPIEvidence>('evidences');
  const item = items.find(i => i.id === id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}
