import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface BSCPerspective {
  id: string; name: string; code: string; description: string;
  sortOrder: number; color: string;
  status: 'active' | 'inactive';
}

export async function GET() {
  return NextResponse.json(readDb<BSCPerspective>('bsc-perspectives'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<BSCPerspective>('bsc-perspectives');
  const newItem: BSCPerspective = {
    id: `bscp${generateId()}`,
    name: body.name, code: body.code, description: body.description || '',
    sortOrder: body.sortOrder ?? 0, color: body.color || '#2196f3',
    status: body.status || 'active',
  };
  items.push(newItem); writeDb('bsc-perspectives', items);
  return NextResponse.json(newItem, { status: 201 });
}
