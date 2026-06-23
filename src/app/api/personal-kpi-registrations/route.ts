import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface PersonalKPIRegistration {
  id: string;
  cycleId: string;
  userId: string;
  positionCode: string;
  items: any[];
  status: string;
  submittedAt?: string;
  approvedAt?: string;
  committedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const cycleId = searchParams.get('cycleId');
  let items = readDb<PersonalKPIRegistration>('personal-kpi-registrations');
  if (userId) items = items.filter(i => i.userId === userId);
  if (cycleId) items = items.filter(i => i.cycleId === cycleId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<PersonalKPIRegistration>('personal-kpi-registrations');
  const now = new Date().toISOString();
  const newItem: PersonalKPIRegistration = {
    id: `pkpi${generateId()}`,
    cycleId: body.cycleId,
    userId: body.userId,
    positionCode: body.positionCode || 'GV',
    items: body.items || [],
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  items.push(newItem);
  writeDb('personal-kpi-registrations', items);
  return NextResponse.json(newItem, { status: 201 });
}
