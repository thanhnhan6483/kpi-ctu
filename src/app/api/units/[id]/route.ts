import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface Unit {
  id: string;
  parentId: string | null;
  name: string;
  code: string;
  type: string;
  managerId: string;
  status: 'active' | 'inactive';
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const units = readDb<Unit>('units');
  const unit = units.find(u => u.id === id);
  if (!unit) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(unit);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const units = readDb<Unit>('units');
  const index = units.findIndex(u => u.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  units[index] = { ...units[index], ...body };
  writeDb('units', units);
  return NextResponse.json(units[index]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const units = readDb<Unit>('units');
  const filtered = units.filter(u => u.id !== id);
  if (filtered.length === units.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('units', filtered);
  return NextResponse.json({ success: true });
}
