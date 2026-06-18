import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface Evidence {
  id: string;
  planId: string;
  indicatorId: string;
  indicatorName: string;
  unitId: string;
  unitName: string;
  type: 'file' | 'url' | 'system_log';
  fileName: string;
  status: 'pending' | 'valid' | 'needs_supplement' | 'invalid';
  submittedAt: string;
  submittedBy: string;
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: string;
}

export async function GET() {
  return NextResponse.json(readDb<Evidence>('evidences'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const evidences = readDb<Evidence>('evidences');
  const now = new Date().toISOString();
  const newEvidence: Evidence = {
    id: `EV${generateId()}`,
    planId: body.planId,
    indicatorId: body.indicatorId,
    indicatorName: body.indicatorName,
    unitId: body.unitId,
    unitName: body.unitName,
    type: body.type,
    fileName: body.fileName,
    status: 'pending',
    submittedAt: now,
    submittedBy: body.submittedBy,
  };
  evidences.push(newEvidence);
  writeDb('evidences', evidences);
  return NextResponse.json(newEvidence, { status: 201 });
}
