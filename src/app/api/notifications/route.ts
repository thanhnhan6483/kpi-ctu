import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  readStatus: boolean;
  createdAt: string;
  type: 'reminder' | 'warning' | 'info' | 'approval';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const type = searchParams.get('type');
  const unreadOnly = searchParams.get('unread') === 'true';

  let items = readDb<Notification>('notifications');
  if (userId) items = items.filter(i => i.userId === userId);
  if (type) items = items.filter(i => i.type === type);
  if (unreadOnly) items = items.filter(i => !i.readStatus);

  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<Notification>('notifications');
  const newNotification: Notification = {
    id: `n${generateId()}`,
    userId: body.userId,
    title: body.title,
    content: body.content,
    readStatus: false,
    createdAt: new Date().toISOString(),
    type: body.type || 'info',
  };
  items.push(newNotification);
  writeDb('notifications', items);
  return NextResponse.json(newNotification, { status: 201 });
}
