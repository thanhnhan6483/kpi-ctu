import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface ProgressRecord {
  id: string;
  planId: string;
  indicatorId: string;
  indicatorName: string;
  unitId: string;
  unitName: string;
  targetValue: number;
  actualValue: number;
  unit: string;
  progressPercent: number;
  lastUpdated: string;
  updatedBy: string;
  note: string;
  cycleName: string;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const records = readDb<ProgressRecord>('progress');
  const record = records.find(r => r.id === id);
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(record);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const records = readDb<ProgressRecord>('progress');
  const index = records.findIndex(r => r.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const target = body.targetValue ?? records[index].targetValue;
  const actual = body.actualValue ?? records[index].actualValue;
  records[index] = {
    ...records[index],
    ...body,
    progressPercent: target > 0 ? Math.round((actual / target) * 100) : 0,
    lastUpdated: new Date().toISOString(),
  };
  writeDb('progress', records);
  return NextResponse.json(records[index]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const records = readDb<ProgressRecord>('progress');
  const filtered = records.filter(r => r.id !== id);
  if (filtered.length === records.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('progress', filtered);
  return NextResponse.json({ success: true });
}
