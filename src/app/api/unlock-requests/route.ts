import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface UnlockRequest {
  id: string; objectType: 'cycle' | 'evaluation' | 'score' | 'evidence';
  objectId: string; requestedBy: string; reason: string; scope: string;
  durationHours: number; approvedBy?: string; approvedAt?: string;
  status: 'pending' | 'approved' | 'rejected'; note?: string; createdAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const objectType = searchParams.get('objectType');
  let items = readDb<UnlockRequest>('unlock-requests');
  if (status) items = items.filter(i => i.status === status);
  if (objectType) items = items.filter(i => i.objectType === objectType);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<UnlockRequest>('unlock-requests');
  const newItem: UnlockRequest = {
    id: `ulr${generateId()}`,
    objectType: body.objectType, objectId: body.objectId,
    requestedBy: body.requestedBy, reason: body.reason, scope: body.scope,
    durationHours: body.durationHours, status: 'pending',
    createdAt: new Date().toISOString(),
  };
  items.push(newItem); writeDb('unlock-requests', items);
  return NextResponse.json(newItem, { status: 201 });
}
