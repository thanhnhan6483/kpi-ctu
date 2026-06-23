import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface SyncLog {
  id: string; apiConfigId: string; systemType: string;
  syncType: 'manual' | 'scheduled'; status: 'running' | 'success' | 'partial' | 'error';
  startedAt: string; completedAt?: string;
  recordsTotal: number; recordsSuccess: number; recordsFailed: number;
  errors: { record: string; message: string }[]; createdBy: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiConfigId = searchParams.get('apiConfigId');
  const systemType = searchParams.get('systemType');
  const status = searchParams.get('status');
  let items = readDb<SyncLog>('sync-logs');
  if (apiConfigId) items = items.filter(i => i.apiConfigId === apiConfigId);
  if (systemType) items = items.filter(i => i.systemType === systemType);
  if (status) items = items.filter(i => i.status === status);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<SyncLog>('sync-logs');
  const newItem: SyncLog = {
    id: `sl${generateId()}`,
    apiConfigId: body.apiConfigId, systemType: body.systemType,
    syncType: body.syncType || 'manual', status: 'running',
    startedAt: new Date().toISOString(),
    recordsTotal: 0, recordsSuccess: 0, recordsFailed: 0,
    errors: [], createdBy: body.createdBy,
  };
  items.push(newItem); writeDb('sync-logs', items);
  return NextResponse.json(newItem, { status: 201 });
}
