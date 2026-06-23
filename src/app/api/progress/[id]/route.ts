import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface ProgressRecord {
  id: string;
  planItemId: string;
  actualValue: number;
  progressDate: string;
  note: string;
  updatedBy: string;
  level?: 'unit' | 'individual';
  personId?: string;
  personName?: string;
  positionCode?: string;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const records = readDb<ProgressRecord>('progress');
  const record = records.find(r => r.id === id);
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const planItems = readDb<{ id: string; targetValue: number }>('plan-items');
  const planItem = planItems.find(p => p.id === record.planItemId);
  const target = planItem?.targetValue ?? 0;
  const progressPercent = target > 0 ? Math.round((record.actualValue / target) * 100) : 0;

  return NextResponse.json({ ...record, progressPercent });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const records = readDb<ProgressRecord>('progress');
  const index = records.findIndex(r => r.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const allowed = ['planItemId', 'actualValue', 'progressDate', 'note', 'updatedBy', 'level', 'personId', 'personName', 'positionCode'];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      (records[index] as any)[key] = body[key];
    }
  }

  writeDb('progress', records);

  const planItems = readDb<{ id: string; targetValue: number }>('plan-items');
  const planItem = planItems.find(p => p.id === records[index].planItemId);
  const target = planItem?.targetValue ?? 0;
  const progressPercent = target > 0 ? Math.round((records[index].actualValue / target) * 100) : 0;

  return NextResponse.json({ ...records[index], progressPercent });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const records = readDb<ProgressRecord>('progress');
  const filtered = records.filter(r => r.id !== id);
  if (filtered.length === records.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('progress', filtered);
  return NextResponse.json({ success: true });
}
