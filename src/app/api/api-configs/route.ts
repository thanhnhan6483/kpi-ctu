import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface APIConfig {
  id: string; name: string; code: string; description: string; baseUrl: string; apiKey: string;
  authType: 'api_key' | 'basic' | 'oauth2' | 'none';
  username?: string; password?: string;
  systemType: 'hrm' | 'lms' | 'eoffice' | 'khcn' | 'finance' | 'survey' | 'other';
  syncInterval: 'manual' | 'daily' | 'weekly' | 'monthly';
  lastSyncAt?: string; syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastError?: string; status: 'active' | 'inactive'; createdAt: string; updatedAt: string;
}

export async function GET() {
  return NextResponse.json(readDb<APIConfig>('api-configs'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<APIConfig>('api-configs');
  const now = new Date().toISOString();
  const newItem: APIConfig = {
    id: `apic${generateId()}`,
    name: body.name, code: body.code, description: body.description || '',
    baseUrl: body.baseUrl, apiKey: body.apiKey, authType: body.authType,
    username: body.username, password: body.password,
    systemType: body.systemType, syncInterval: body.syncInterval || 'manual',
    syncStatus: 'idle', status: body.status || 'active',
    createdAt: now, updatedAt: now,
  };
  items.push(newItem); writeDb('api-configs', items);
  return NextResponse.json(newItem, { status: 201 });
}
