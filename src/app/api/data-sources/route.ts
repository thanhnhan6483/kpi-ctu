import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface DataSource { id: string; name: string; code: string; description: string; responsibleUnitId: string; sourceType: string; config: unknown; status: string; }

export async function GET() { return NextResponse.json(readDb<DataSource>('data-sources')); }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<DataSource>('data-sources');
  const newItem = { id: `ds_${generateId()}`, ...body, status: body.status || 'active' };
  items.push(newItem); writeDb('data-sources', items);
  return NextResponse.json(newItem, { status: 201 });
}
