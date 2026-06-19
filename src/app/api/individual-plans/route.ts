import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { IndividualPlan } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const cycleId = searchParams.get('cycleId');
  let items = readDb<IndividualPlan>('individual-plans');
  if (userId) items = items.filter(i => i.userId === userId);
  if (cycleId) items = items.filter(i => i.cycleId === cycleId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<IndividualPlan>('individual-plans');
  const now = new Date().toISOString();
  const newItem: IndividualPlan = {
    id: `ipl_${generateId()}`,
    userId: body.userId,
    cycleId: body.cycleId,
    positionId: body.positionId,
    positionName: body.positionName,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    items: body.items || [],
  };
  items.push(newItem);
  writeDb('individual-plans', items);
  return NextResponse.json(newItem, { status: 201 });
}
