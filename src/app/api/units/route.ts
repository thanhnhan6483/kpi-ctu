import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface Unit {
  id: string;
  parentId: string | null;
  name: string;
  code: string;
  type: string;
  managerId: string;
  status: 'active' | 'inactive';
}

export async function GET() {
  return NextResponse.json(readDb<Unit>('units'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const units = readDb<Unit>('units');
  const newUnit: Unit = {
    id: `u${generateId()}`,
    parentId: body.parentId || null,
    name: body.name,
    code: body.code,
    type: body.type,
    managerId: body.managerId || '',
    status: 'active',
  };
  units.push(newUnit);
  writeDb('units', units);
  return NextResponse.json(newUnit, { status: 201 });
}
