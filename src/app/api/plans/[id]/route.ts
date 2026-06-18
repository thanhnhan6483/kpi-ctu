import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plans = readDb<KPIPlan>('plans');
  const plan = plans.find(p => p.id === id);
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(plan);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const plans = readDb<KPIPlan>('plans');
  const index = plans.findIndex(p => p.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  plans[index] = { ...plans[index], ...body, updatedAt: new Date().toISOString() };
  writeDb('plans', plans);
  return NextResponse.json(plans[index]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plans = readDb<KPIPlan>('plans');
  const filtered = plans.filter(p => p.id !== id);
  if (filtered.length === plans.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('plans', filtered);
  return NextResponse.json({ success: true });
}
