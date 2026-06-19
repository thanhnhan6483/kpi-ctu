import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface GradingLevel { id: string; name: string; code: string; minScore: number; maxScore: number; color: string; description: string; status: string; }

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await request.json();
  const items = readDb<GradingLevel>('grading-levels');
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[idx] = { ...items[idx], ...body }; writeDb('grading-levels', items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<GradingLevel>('grading-levels');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('grading-levels', filtered); return NextResponse.json({ success: true });
}
