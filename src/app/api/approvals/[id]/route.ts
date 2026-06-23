import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface Approval {
  id: string;
  objectType: string;
  objectId: string;
  objectTitle: string;
  unitName: string;
  submitter: string;
  status: string;
  approverId?: string;
  approverName?: string;
  note?: string;
  submittedAt: string;
  decidedAt?: string;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const approvals = readDb<Approval>('approvals');
  const approval = approvals.find(a => a.id === id);
  if (!approval) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(approval);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const approvals = readDb<Approval>('approvals');
  const index = approvals.findIndex(a => a.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  approvals[index] = {
    ...approvals[index],
    ...body,
    decidedAt: body.status === 'approved' || body.status === 'rejected' ? new Date().toISOString() : approvals[index].decidedAt,
  };
  writeDb('approvals', approvals);
  return NextResponse.json(approvals[index]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const approvals = readDb<Approval>('approvals');
  const filtered = approvals.filter(a => a.id !== id);
  if (filtered.length === approvals.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('approvals', filtered);
  return NextResponse.json({ success: true });
}
