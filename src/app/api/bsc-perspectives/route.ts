import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface BSCPerspective {
  id: string; name: string; code: string; description: string;
  sortOrder: number; color: string; academicYearId: string;
  status: 'active' | 'inactive';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const academicYearId = searchParams.get('academicYearId');
  let items = readDb<BSCPerspective>('bsc-perspectives');
  if (academicYearId) items = items.filter(i => i.academicYearId === academicYearId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<BSCPerspective>('bsc-perspectives');
  const newItem: BSCPerspective = {
    id: `bscp${generateId()}`,
    name: body.name, code: body.code, description: body.description || '',
    sortOrder: body.sortOrder ?? 0, color: body.color || '#2196f3',
    academicYearId: body.academicYearId, status: body.status || 'active',
  };
  items.push(newItem); writeDb('bsc-perspectives', items);
  return NextResponse.json(newItem, { status: 201 });
}
