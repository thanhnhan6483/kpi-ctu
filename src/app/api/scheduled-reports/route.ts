import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface ScheduledReport {
  id: string; name: string; reportTemplateId: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semester' | 'yearly';
  config: Record<string, unknown>; recipients: string[];
  lastSentAt?: string; nextSendAt?: string;
  isActive: boolean; createdBy: string; createdAt: string; updatedAt: string;
}

export async function GET() {
  return NextResponse.json(readDb<ScheduledReport>('scheduled-reports'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<ScheduledReport>('scheduled-reports');
  const now = new Date().toISOString();
  const newItem: ScheduledReport = {
    id: `sr${generateId()}`,
    name: body.name, reportTemplateId: body.reportTemplateId,
    frequency: body.frequency, config: body.config || {},
    recipients: body.recipients || [], isActive: body.isActive ?? true,
    createdBy: body.createdBy, createdAt: now, updatedAt: now,
  };
  items.push(newItem); writeDb('scheduled-reports', items);
  return NextResponse.json(newItem, { status: 201 });
}
