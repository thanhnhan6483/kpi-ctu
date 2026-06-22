import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface ReportTemplate { id: string; name: string; code: string; description: string; category: string; config: unknown; isSystem: boolean; status: string; }

export async function GET() { return NextResponse.json(readDb<ReportTemplate>('report-templates')); }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<ReportTemplate>('report-templates');
  const newItem = { id: `rt_${generateId()}`, ...body, status: body.status || 'active' };
  items.push(newItem); writeDb('report-templates', items);
  return NextResponse.json(newItem, { status: 201 });
}
