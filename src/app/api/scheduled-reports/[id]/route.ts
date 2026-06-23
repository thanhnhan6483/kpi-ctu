import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface ScheduledReport {
  id: string; name: string; reportTemplateId: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semester' | 'yearly';
  config: Record<string, unknown>; recipients: string[];
  lastSentAt?: string; nextSendAt?: string;
  isActive: boolean; createdBy: string; createdAt: string; updatedAt: string;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await request.json();
  const items = readDb<ScheduledReport>('scheduled-reports');
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[idx] = { ...items[idx], ...body, updatedAt: new Date().toISOString() }; writeDb('scheduled-reports', items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<ScheduledReport>('scheduled-reports');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('scheduled-reports', filtered); return NextResponse.json({ success: true });
}
