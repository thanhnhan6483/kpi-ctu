import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { Position } from '@/types';

export async function GET() {
  return NextResponse.json(readDb<Position>('positions'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<Position>('positions');
  const newItem: Position = {
    id: `pos${generateId()}`,
    name: body.name,
    code: body.code,
    level: body.level || '',
    category: body.category || '',
    status: 'active',
  };
  items.push(newItem);
  writeDb('positions', items);
  return NextResponse.json(newItem, { status: 201 });
}
