import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { JobPosition } from '@/types';

export async function GET() {
  return NextResponse.json(readDb<JobPosition>('job-positions'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<JobPosition>('job-positions');
  const newItem: JobPosition = {
    id: `jp${generateId()}`,
    name: body.name,
    code: body.code,
    description: body.description || '',
    kpiGroupId: body.kpiGroupId || '',
    approvalLevel: body.approvalLevel || '',
    status: 'active',
  };
  items.push(newItem);
  writeDb('job-positions', items);
  return NextResponse.json(newItem, { status: 201 });
}
