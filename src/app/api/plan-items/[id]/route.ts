import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface PlanItemRecord {
  id: string;
  planId: string;
  indicatorId: string;
  targetValue: number;
  weight: number;
  dueDate: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const records = readDb<PlanItemRecord>('plan-items');
  const record = records.find(r => r.id === id);
  if (!record) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(record);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const records = readDb<PlanItemRecord>('plan-items');
  const index = records.findIndex(r => r.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  records[index] = {
    ...records[index],
    ...body,
    id: records[index].id,
  };
  writeDb('plan-items', records);
  return NextResponse.json(records[index]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const records = readDb<PlanItemRecord>('plan-items');
  const filtered = records.filter(r => r.id !== id);
  if (filtered.length === records.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  writeDb('plan-items', filtered);
  return NextResponse.json({ success: true });
}
