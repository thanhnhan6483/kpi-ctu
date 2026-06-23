import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface MeasurementUnit { id: string; name: string; description: string; status: string; }

export async function GET() { return NextResponse.json(readDb<MeasurementUnit>('measurement-units')); }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<MeasurementUnit>('measurement-units');
  const newItem = { id: `mu${generateId()}`, name: body.name, description: body.description || '', status: 'active' };
  items.push(newItem); writeDb('measurement-units', items);
  return NextResponse.json(newItem, { status: 201 });
}
