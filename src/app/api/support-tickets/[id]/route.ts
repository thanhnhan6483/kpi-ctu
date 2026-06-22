import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface SupportTicket {
  id: string; userId: string; userName: string; subject: string; description: string;
  category: 'bug' | 'feature_request' | 'question' | 'data_issue' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments: string[]; status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigneeId?: string; resolution?: string; createdAt: string; updatedAt: string; resolvedAt?: string;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await request.json();
  const items = readDb<SupportTicket>('support-tickets');
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[idx] = { ...items[idx], ...body, updatedAt: new Date().toISOString() }; writeDb('support-tickets', items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<SupportTicket>('support-tickets');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('support-tickets', filtered); return NextResponse.json({ success: true });
}
