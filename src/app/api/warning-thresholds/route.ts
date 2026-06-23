import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface WarningThreshold { id: string; name: string; code: string; description: string; thresholdType: string; operator: string; value: number; color: string; icon: string; isSystem: boolean; status: string; }

export async function GET() { return NextResponse.json(readDb<WarningThreshold>('warning-thresholds')); }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<WarningThreshold>('warning-thresholds');
  const newItem = { id: `wt_${generateId()}`, ...body, status: body.status || 'active' };
  items.push(newItem); writeDb('warning-thresholds', items);
  return NextResponse.json(newItem, { status: 201 });
}
