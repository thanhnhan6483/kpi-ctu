import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface SLAConfig {
  id: string; name: string;
  processType: 'registration' | 'approval' | 'evidence_review' | 'evaluation' | 'complaint' | 'council_review';
  targetHours: number; warningHours: number; escalationUserId?: string;
  isActive: boolean; createdAt: string; updatedAt: string;
}

export async function GET() {
  return NextResponse.json(readDb<SLAConfig>('sla-configs'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<SLAConfig>('sla-configs');
  const now = new Date().toISOString();
  const newItem: SLAConfig = {
    id: `sla${generateId()}`,
    name: body.name, processType: body.processType,
    targetHours: body.targetHours, warningHours: body.warningHours,
    escalationUserId: body.escalationUserId, isActive: body.isActive ?? true,
    createdAt: now, updatedAt: now,
  };
  items.push(newItem); writeDb('sla-configs', items);
  return NextResponse.json(newItem, { status: 201 });
}
