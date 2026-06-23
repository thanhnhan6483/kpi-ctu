import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { KPICascadeAssignment } from '@/types';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<KPICascadeAssignment>('cascade-assignments');
  const item = items.find(i => i.id === id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const items = readDb<KPICascadeAssignment>('cascade-assignments');
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const now = new Date().toISOString();
  items[index] = { ...items[index], ...body, updatedAt: now };
  if (body.status === 'assigned' && !items[index].assignedAt) items[index].assignedAt = now;
  if (body.status === 'accepted' && !items[index].acceptedAt) items[index].acceptedAt = now;
  writeDb('cascade-assignments', items);
  return NextResponse.json(items[index]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<KPICascadeAssignment>('cascade-assignments');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('cascade-assignments', filtered);
  return NextResponse.json({ success: true });
}
