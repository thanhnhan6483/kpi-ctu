import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface Approval {
  id: string;
  objectType: 'plan' | 'evidence' | 'evaluation';
  objectId: string;
  objectTitle: string;
  unitName: string;
  submitter: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  approverId?: string;
  approverName?: string;
  note?: string;
  submittedAt: string;
  decidedAt?: string;
}

export async function GET() {
  return NextResponse.json(readDb<Approval>('approvals'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const approvals = readDb<Approval>('approvals');
  const now = new Date().toISOString();
  const newApproval: Approval = {
    id: `AP${generateId()}`,
    objectType: body.objectType,
    objectId: body.objectId,
    objectTitle: body.objectTitle,
    unitName: body.unitName,
    submitter: body.submitter,
    status: 'pending',
    submittedAt: now,
  };
  approvals.push(newApproval);
  writeDb('approvals', approvals);
  return NextResponse.json(newApproval, { status: 201 });
}
