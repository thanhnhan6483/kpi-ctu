import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface KPIComplaint {
  id: string; cycleId: string; objectType: 'individual_evaluation' | 'unit_evaluation' | 'score';
  objectId: string; complainantId: string; complainantName: string; content: string;
  attachments: string[]; status: 'pending' | 'under_review' | 'accepted' | 'rejected' | 'supplement_needed';
  reviewerId?: string; reviewNote?: string; reviewedAt?: string; resolution?: string;
  createdAt: string; updatedAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cycleId = searchParams.get('cycleId');
  const objectType = searchParams.get('objectType');
  const status = searchParams.get('status');
  let items = readDb<KPIComplaint>('complaints');
  if (cycleId) items = items.filter(i => i.cycleId === cycleId);
  if (objectType) items = items.filter(i => i.objectType === objectType);
  if (status) items = items.filter(i => i.status === status);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<KPIComplaint>('complaints');
  const now = new Date().toISOString();
  const newItem: KPIComplaint = {
    id: `cpl${generateId()}`,
    cycleId: body.cycleId, objectType: body.objectType, objectId: body.objectId,
    complainantId: body.complainantId, complainantName: body.complainantName,
    content: body.content, attachments: body.attachments || [],
    status: 'pending', createdAt: now, updatedAt: now,
  };
  items.push(newItem); writeDb('complaints', items);
  return NextResponse.json(newItem, { status: 201 });
}
