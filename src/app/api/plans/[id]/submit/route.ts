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

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const records = readDb<PlanRecord>('plans');
  const index = records.findIndex(r => r.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (records[index].status !== 'draft') {
    return NextResponse.json({ error: 'Only draft plans can be submitted' }, { status: 400 });
  }
  const now = new Date().toISOString();
  records[index] = {
    ...records[index],
    status: 'submitted',
    submittedAt: now,
    updatedAt: now,
  };
  writeDb('plans', records);
  return NextResponse.json(records[index]);
}
