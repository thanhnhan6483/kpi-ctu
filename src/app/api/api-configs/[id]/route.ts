import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface APIConfig {
  id: string; name: string; code: string; description: string; baseUrl: string; apiKey: string;
  authType: 'api_key' | 'basic' | 'oauth2' | 'none';
  username?: string; password?: string;
  systemType: 'hrm' | 'lms' | 'eoffice' | 'khcn' | 'finance' | 'survey' | 'other';
  syncInterval: 'manual' | 'daily' | 'weekly' | 'monthly';
  lastSyncAt?: string; syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastError?: string; status: 'active' | 'inactive'; createdAt: string; updatedAt: string;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await request.json();
  const items = readDb<APIConfig>('api-configs');
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[idx] = { ...items[idx], ...body, updatedAt: new Date().toISOString() }; writeDb('api-configs', items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = readDb<APIConfig>('api-configs');
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('api-configs', filtered); return NextResponse.json({ success: true });
}
