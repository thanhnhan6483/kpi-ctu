import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface SyncLog {
  id: string; apiConfigId: string; systemType: string;
  syncType: 'manual' | 'scheduled'; status: 'running' | 'success' | 'partial' | 'error';
  startedAt: string; completedAt?: string;
  recordsTotal: number; recordsSuccess: number; recordsFailed: number;
  errors: { record: string; message: string }[]; createdBy: string;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await request.json();
  const items = readDb<SyncLog>('sync-logs');
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[idx] = { ...items[idx], ...body, completedAt: body.status && body.status !== 'running' ? new Date().toISOString() : items[idx].completedAt };
  writeDb('sync-logs', items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<SyncLog>('sync-logs');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('sync-logs', filtered); return NextResponse.json({ success: true });
}
