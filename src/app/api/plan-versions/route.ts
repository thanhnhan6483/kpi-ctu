import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface PlanVersion {
  id: string;
  planId: string;
  version: number;
  data: any;
  changedBy: string;
  changeType: 'create' | 'update' | 'submit' | 'approve' | 'revision' | 'lock' | 'unlock';
  note: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get('planId');
  let versions = readDb<PlanVersion>('plan-versions');
  if (planId) {
    versions = versions.filter(v => v.planId === planId);
  }
  versions.sort((a, b) => b.version - a.version);
  return NextResponse.json(versions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const versions = readDb<PlanVersion>('plan-versions');
  const existingVersions = versions.filter(v => v.planId === body.planId);
  const maxVersion = existingVersions.length > 0 ? Math.max(...existingVersions.map(v => v.version)) : 0;

  const newVersion: PlanVersion = {
    id: `pv${generateId()}`,
    planId: body.planId,
    version: maxVersion + 1,
    data: body.data || {},
    changedBy: body.changedBy || 'system',
    changeType: body.changeType || 'update',
    note: body.note || '',
    createdAt: new Date().toISOString(),
  };

  versions.push(newVersion);
  writeDb('plan-versions', versions);
  return NextResponse.json(newVersion, { status: 201 });
}
