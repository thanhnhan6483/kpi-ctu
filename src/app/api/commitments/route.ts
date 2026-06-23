import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface PlanRecord {
  id: string; cycleId: string; ownerType: 'unit' | 'individual'; ownerId: string;
  status: string; submittedAt: string | null; approvedAt: string | null;
  createdAt: string; updatedAt: string;
}

interface IndividualPlan {
  id: string; userId: string; cycleId: string; positionId: string;
  positionName: string; status: string; submittedAt?: string;
  approvedAt?: string; createdAt: string; updatedAt: string;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, id, action } = body;

  if (!type || !id || !action) {
    return NextResponse.json({ error: 'Missing type, id, or action' }, { status: 400 });
  }
  if (!['plan', 'registration'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
  if (!['commit', 'confirm'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const statusMap: Record<string, string> = { commit: 'committed', confirm: 'confirmed' };
  const filename = type === 'plan' ? 'plans' : 'personal-kpi-registrations';
  const items = readDb<Record<string, unknown>>(filename);
  const idx = items.findIndex((i: Record<string, unknown>) => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const now = new Date().toISOString();
  items[idx] = { ...items[idx], status: statusMap[action], updatedAt: now };
  writeDb(filename, items);
  return NextResponse.json(items[idx]);
}
