import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface KPITemplate {
  id: string;
  name: string;
  academicYearId: string;
  targetLevel: string;
  status: string;
  description: string;
  indicatorCount: number;
  totalWeight: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  activatedAt?: string;
  lockedAt?: string;
}

export async function GET() {
  return NextResponse.json(readDb<KPITemplate>('kpi-templates'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<KPITemplate>('kpi-templates');
  const now = new Date().toISOString();
  const newItem: KPITemplate = {
    id: `tpl${generateId()}`,
    name: body.name,
    academicYearId: body.academicYearId || 'ay001',
    targetLevel: body.targetLevel || 'school',
    status: 'draft',
    description: body.description || '',
    indicatorCount: body.indicatorCount || 0,
    totalWeight: body.totalWeight || 0,
    createdAt: now,
    updatedAt: now,
  };
  items.push(newItem);
  writeDb('kpi-templates', items);
  return NextResponse.json(newItem, { status: 201 });
}
