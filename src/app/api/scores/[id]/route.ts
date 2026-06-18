import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface ScoreRecord {
  id: string;
  planItemId: string;
  selfScore: number | null;
  managerScore: number | null;
  councilScore: number | null;
  finalScore: number | null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const records = readDb<ScoreRecord>('scores');
  const record = records.find(r => r.id === id);
  if (!record) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(record);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const records = readDb<ScoreRecord>('scores');
  const index = records.findIndex(r => r.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const updated: ScoreRecord = {
    ...records[index],
    selfScore: body.selfScore ?? records[index].selfScore,
    managerScore: body.managerScore ?? records[index].managerScore,
    councilScore: body.councilScore ?? records[index].councilScore,
  };

  if (
    updated.selfScore !== null &&
    updated.managerScore !== null &&
    updated.councilScore !== null
  ) {
    updated.finalScore = Math.round(
      (updated.selfScore + updated.managerScore + updated.councilScore) / 3
    );
  }

  records[index] = updated;
  writeDb('scores', records);
  return NextResponse.json(records[index]);
}
