import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface PlanItem {
  id: string;
  indicatorId: string;
  indicatorName: string;
  targetValue: number;
  actualValue: number;
  unit: string;
  weight: number;
  dueDate: string;
  status: 'draft' | 'in_progress' | 'completed';
  note: string;
}

interface KPIPlan {
  id: string;
  unitId: string;
  unitName: string;
  cycleId: string;
  cycleName: string;
  status: 'draft' | 'submitted' | 'needs_revision' | 'approved' | 'in_progress' | 'evaluated' | 'locked';
  items: PlanItem[];
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET() {
  const plans = readDb<KPIPlan>('plans');
  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const plans = readDb<KPIPlan>('plans');
  const now = new Date().toISOString();
  const newPlan: KPIPlan = {
    id: `PL${generateId()}`,
    unitId: body.unitId,
    unitName: body.unitName,
    cycleId: body.cycleId,
    cycleName: body.cycleName,
    status: 'draft',
    items: body.items || [],
    createdAt: now,
    updatedAt: now,
  };
  plans.push(newPlan);
  writeDb('plans', plans);
  return NextResponse.json(newPlan, { status: 201 });
}
