import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface KPIComplaint {
  id: string; cycleId: string; objectType: 'individual_evaluation' | 'unit_evaluation' | 'score';
  objectId: string; complainantId: string; complainantName: string; content: string;
  attachments: string[]; status: 'pending' | 'under_review' | 'accepted' | 'rejected' | 'supplement_needed';
  reviewerId?: string; reviewNote?: string; reviewedAt?: string; resolution?: string;
  createdAt: string; updatedAt: string;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await request.json();
  const items = readDb<KPIComplaint>('complaints');
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[idx] = { ...items[idx], ...body, updatedAt: new Date().toISOString() }; writeDb('complaints', items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<KPIComplaint>('complaints');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('complaints', filtered); return NextResponse.json({ success: true });
}
