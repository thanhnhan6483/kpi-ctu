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

export async function GET() {
  return NextResponse.json(readDb<PlanRecord>('plans'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const records = readDb<PlanRecord>('plans');
  const now = new Date().toISOString();
  const newRecord: PlanRecord = {
    id: `PL${generateId()}`,
    cycleId: body.cycleId,
    ownerType: body.ownerType,
    ownerId: body.ownerId,
    status: 'draft',
    submittedAt: null,
    approvedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  records.push(newRecord);
  writeDb('plans', records);
  return NextResponse.json(newRecord, { status: 201 });
}
