import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface DepartmentPlan {
  id: string;
  cycleId: string;
  departmentId: string;
  name: string;
  description: string;
  status: string;
  items: any[];
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cycleId = searchParams.get('cycleId');
  let items = readDb<DepartmentPlan>('department-plans');
  if (cycleId) items = items.filter(i => i.cycleId === cycleId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<DepartmentPlan>('department-plans');
  const now = new Date().toISOString();
  const newItem: DepartmentPlan = {
    id: `dp${generateId()}`,
    cycleId: body.cycleId,
    departmentId: body.departmentId,
    name: body.name,
    description: body.description || '',
    status: 'draft',
    items: body.items || [],
    createdAt: now,
    updatedAt: now,
  };
  items.push(newItem);
  writeDb('department-plans', items);
  return NextResponse.json(newItem, { status: 201 });
}
