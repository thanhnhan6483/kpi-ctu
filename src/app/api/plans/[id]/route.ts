import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface PlanRecord {
  id: string;
  cycleId: string;
  ownerType: 'unit' | 'individual';
  ownerId: string;
  status: 'draft' | 'submitted' | 'needs_revision' | 'approved' | 'in_progress' | 'evaluated' | 'locked';
  submittedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const records = readDb<PlanRecord>('plans');
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
  const records = readDb<PlanRecord>('plans');
  const index = records.findIndex(r => r.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const now = new Date().toISOString();
  records[index] = {
    ...records[index],
    ...body,
    id: records[index].id,
    createdAt: records[index].createdAt,
    updatedAt: now,
  };
  writeDb('plans', records);
  return NextResponse.json(records[index]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const records = readDb<PlanRecord>('plans');
  const filtered = records.filter(r => r.id !== id);
  if (filtered.length === records.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  writeDb('plans', filtered);
  return NextResponse.json({ success: true });
}
