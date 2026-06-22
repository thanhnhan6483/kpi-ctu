import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface UnlockRequest {
  id: string; objectType: 'cycle' | 'evaluation' | 'score' | 'evidence';
  objectId: string; requestedBy: string; reason: string; scope: string;
  durationHours: number; approvedBy?: string; approvedAt?: string;
  status: 'pending' | 'approved' | 'rejected'; note?: string; createdAt: string;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await request.json();
  const items = readDb<UnlockRequest>('unlock-requests');
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[idx] = { ...items[idx], ...body }; writeDb('unlock-requests', items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<UnlockRequest>('unlock-requests');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('unlock-requests', filtered); return NextResponse.json({ success: true });
}
