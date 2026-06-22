import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface BSCPerspective {
  id: string; name: string; code: string; description: string;
  sortOrder: number; color: string;
  status: 'active' | 'inactive';
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await request.json();
  const items = readDb<BSCPerspective>('bsc-perspectives');
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[idx] = { ...items[idx], ...body }; writeDb('bsc-perspectives', items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<BSCPerspective>('bsc-perspectives');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('bsc-perspectives', filtered); return NextResponse.json({ success: true });
}
