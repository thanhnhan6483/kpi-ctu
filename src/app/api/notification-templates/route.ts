import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface NotificationTemplate { id: string; name: string; type: string; title: string; content: string; event: string; status: string; }

export async function GET() { return NextResponse.json(readDb<NotificationTemplate>('notification-templates')); }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<NotificationTemplate>('notification-templates');
  const newItem = { id: `nt${generateId()}`, name: body.name, type: body.type || 'info', title: body.title, content: body.content, event: body.event || '', status: 'active' };
  items.push(newItem); writeDb('notification-templates', items);
  return NextResponse.json(newItem, { status: 201 });
}
