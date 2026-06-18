import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

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

interface ApprovalRecord {
  id: string;
  objectType: string;
  objectId: string;
  status: string;
  action: string;
  createdAt: string;
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
  if (records[index].status !== 'submitted') {
    return NextResponse.json({ error: 'Only submitted plans can be approved' }, { status: 400 });
  }
  const now = new Date().toISOString();
  records[index] = {
    ...records[index],
    status: 'approved',
    approvedAt: now,
    updatedAt: now,
  };
  writeDb('plans', records);

  const approvals = readDb<ApprovalRecord>('approvals');
  const approval: ApprovalRecord = {
    id: `AP${generateId()}`,
    objectType: 'plan',
    objectId: id,
    status: 'approved',
    action: 'approve',
    createdAt: now,
  };
  approvals.push(approval);
  writeDb('approvals', approvals);

  return NextResponse.json(records[index]);
}
