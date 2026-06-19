import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  readStatus: boolean;
  createdAt: string;
  type: string;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const items = readDb<Notification>('notifications');
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[index] = { ...items[index], ...body };
  writeDb('notifications', items);
  return NextResponse.json(items[index]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<Notification>('notifications');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('notifications', filtered);
  return NextResponse.json({ success: true });
}
