import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface TargetGroup { id: string; name: string; code: string; description: string; level: string; positionIds: string[]; kpiTemplateId: string; status: string; }

export async function GET() { return NextResponse.json(readDb<TargetGroup>('target-groups')); }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<TargetGroup>('target-groups');
  const newItem = { id: `tg_${generateId()}`, ...body, status: body.status || 'active' };
  items.push(newItem); writeDb('target-groups', items);
  return NextResponse.json(newItem, { status: 201 });
}
