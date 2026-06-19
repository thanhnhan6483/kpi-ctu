import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { Position } from '@/types';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<Position>('positions');
  const item = items.find(i => i.id === id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const items = readDb<Position>('positions');
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[index] = { ...items[index], ...body };
  writeDb('positions', items);
  return NextResponse.json(items[index]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<Position>('positions');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('positions', filtered);
  return NextResponse.json({ success: true });
}
