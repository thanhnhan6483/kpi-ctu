import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { KPICascadeAssignment } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cycleId = searchParams.get('cycleId');
  const fromUnitId = searchParams.get('fromUnitId');
  const toUnitId = searchParams.get('toUnitId');
  const fromLevel = searchParams.get('fromLevel');
  const toLevel = searchParams.get('toLevel');

  let items = readDb<KPICascadeAssignment>('cascade-assignments');

  if (cycleId) items = items.filter(i => i.cycleId === cycleId);
  if (fromUnitId) items = items.filter(i => i.fromUnitId === fromUnitId);
  if (toUnitId) items = items.filter(i => i.toUnitId === toUnitId);
  if (fromLevel) items = items.filter(i => i.fromLevel === fromLevel);
  if (toLevel) items = items.filter(i => i.toLevel === toLevel);

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<KPICascadeAssignment>('cascade-assignments');
  const now = new Date().toISOString();
  const newItem: KPICascadeAssignment = {
    id: `ca${generateId()}`,
    cycleId: body.cycleId,
    fromLevel: body.fromLevel,
    fromUnitId: body.fromUnitId,
    toLevel: body.toLevel,
    toUnitId: body.toUnitId,
    toUserId: body.toUserId || undefined,
    indicatorId: body.indicatorId,
    indicatorName: body.indicatorName || '',
    targetValue: body.targetValue || 0,
    unit: body.unit || '%',
    weight: body.weight || 0,
    dueDate: body.dueDate || '',
    evidenceRequired: body.evidenceRequired ?? true,
    note: body.note || '',
    status: 'draft',
    assignerId: body.assignerId || '',
    createdAt: now,
    updatedAt: now,
  };
  items.push(newItem);
  writeDb('cascade-assignments', items);
  return NextResponse.json(newItem, { status: 201 });
}
