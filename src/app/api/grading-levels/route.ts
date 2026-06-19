import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface GradingLevel { id: string; name: string; code: string; minScore: number; maxScore: number; color: string; description: string; status: string; }

export async function GET() { return NextResponse.json(readDb<GradingLevel>('grading-levels')); }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<GradingLevel>('grading-levels');
  const newItem = { id: `gl${generateId()}`, name: body.name, code: body.code, minScore: body.minScore || 0, maxScore: body.maxScore || 100, color: body.color || '#4caf50', description: body.description || '', status: 'active' };
  items.push(newItem); writeDb('grading-levels', items);
  return NextResponse.json(newItem, { status: 201 });
}
