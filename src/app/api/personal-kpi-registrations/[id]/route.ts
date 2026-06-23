import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<PersonalKPIRegistration>('personal-kpi-registrations');
  const item = items.find(i => i.id === id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const items = readDb<PersonalKPIRegistration>('personal-kpi-registrations');
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[index] = { ...items[index], ...body, updatedAt: new Date().toISOString() };
  writeDb('personal-kpi-registrations', items);
  return NextResponse.json(items[index]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<PersonalKPIRegistration>('personal-kpi-registrations');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('personal-kpi-registrations', filtered);
  return NextResponse.json({ success: true });
}
