import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface SupportTicket {
  id: string; userId: string; userName: string; subject: string; description: string;
  category: 'bug' | 'feature_request' | 'question' | 'data_issue' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments: string[]; status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigneeId?: string; resolution?: string; createdAt: string; updatedAt: string; resolvedAt?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const priority = searchParams.get('priority');
  let items = readDb<SupportTicket>('support-tickets');
  if (status) items = items.filter(i => i.status === status);
  if (category) items = items.filter(i => i.category === category);
  if (priority) items = items.filter(i => i.priority === priority);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<SupportTicket>('support-tickets');
  const now = new Date().toISOString();
  const newItem: SupportTicket = {
    id: `st${generateId()}`,
    userId: body.userId, userName: body.userName, subject: body.subject,
    description: body.description, category: body.category, priority: body.priority,
    attachments: body.attachments || [], status: 'open',
    createdAt: now, updatedAt: now,
  };
  items.push(newItem); writeDb('support-tickets', items);
  return NextResponse.json(newItem, { status: 201 });
}
