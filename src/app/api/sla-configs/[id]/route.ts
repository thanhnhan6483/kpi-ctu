import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface SLAConfig {
  id: string; name: string;
  processType: 'registration' | 'approval' | 'evidence_review' | 'evaluation' | 'complaint' | 'council_review';
  targetHours: number; warningHours: number; escalationUserId?: string;
  isActive: boolean; createdAt: string; updatedAt: string;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await request.json();
  const items = readDb<SLAConfig>('sla-configs');
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[idx] = { ...items[idx], ...body, updatedAt: new Date().toISOString() }; writeDb('sla-configs', items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<SLAConfig>('sla-configs');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('sla-configs', filtered); return NextResponse.json({ success: true });
}
