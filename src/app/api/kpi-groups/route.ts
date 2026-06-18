import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import type { KPIGroup } from '@/types';

export async function GET() {
  return NextResponse.json(readDb<KPIGroup>('kpi-groups'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<KPIGroup>('kpi-groups');
  const newItem: KPIGroup = {
    id: `grp_${generateId()}`,
    name: body.name,
    code: body.code,
    defaultWeight: body.defaultWeight,
    targetLevel: body.targetLevel || 'school',
  };
  items.push(newItem);
  writeDb('kpi-groups', items);
  return NextResponse.json(newItem, { status: 201 });
}
