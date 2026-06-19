import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface EvidenceType { id: string; name: string; code: string; description: string; maxSize: string; required: boolean; status: string; }

export async function GET() { return NextResponse.json(readDb<EvidenceType>('evidence-types')); }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<EvidenceType>('evidence-types');
  const newItem = { id: `et${generateId()}`, name: body.name, code: body.code, description: body.description || '', maxSize: body.maxSize || '10MB', required: body.required ?? true, status: 'active' };
  items.push(newItem); writeDb('evidence-types', items);
  return NextResponse.json(newItem, { status: 201 });
}
