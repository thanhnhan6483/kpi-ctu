import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface ExemptionCoefficient { id: string; name: string; code: string; coefficient: number; description: string; applicablePositions: string[]; status: string; }

export async function GET() { return NextResponse.json(readDb<ExemptionCoefficient>('exemption-coefficients')); }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<ExemptionCoefficient>('exemption-coefficients');
  const newItem = { id: `ec${generateId()}`, name: body.name, code: body.code, coefficient: body.coefficient || 1.0, description: body.description || '', applicablePositions: body.applicablePositions || [], status: 'active' };
  items.push(newItem); writeDb('exemption-coefficients', items);
  return NextResponse.json(newItem, { status: 201 });
}
