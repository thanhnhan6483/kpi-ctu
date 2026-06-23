import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface Rubric { id: string; name: string; code: string; description: string; indicatorId: string; criteria: unknown; status: string; }

export async function GET() { return NextResponse.json(readDb<Rubric>('rubrics')); }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<Rubric>('rubrics');
  const newItem = { id: `rb_${generateId()}`, ...body, status: body.status || 'active' };
  items.push(newItem); writeDb('rubrics', items);
  return NextResponse.json(newItem, { status: 201 });
}
