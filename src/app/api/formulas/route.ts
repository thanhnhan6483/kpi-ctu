import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface Formula { id: string; name: string; code: string; description: string; expression: string; variables: unknown; type: string; status: string; }

export async function GET() { return NextResponse.json(readDb<Formula>('formulas')); }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<Formula>('formulas');
  const newItem = { id: `fm_${generateId()}`, ...body, status: body.status || 'active' };
  items.push(newItem); writeDb('formulas', items);
  return NextResponse.json(newItem, { status: 201 });
}
