import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface BSCMapLink {
  id: string; academicYearId: string; perspectiveId: string;
  objectiveId: string; indicatorId?: string;
  linkType: 'perspective_to_objective' | 'objective_to_indicator';
  weight: number; createdAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const academicYearId = searchParams.get('academicYearId');
  const perspectiveId = searchParams.get('perspectiveId');
  let items = readDb<BSCMapLink>('bsc-map-links');
  if (academicYearId) items = items.filter(i => i.academicYearId === academicYearId);
  if (perspectiveId) items = items.filter(i => i.perspectiveId === perspectiveId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = readDb<BSCMapLink>('bsc-map-links');
  const newItem: BSCMapLink = {
    id: `bscl${generateId()}`,
    academicYearId: body.academicYearId, perspectiveId: body.perspectiveId,
    objectiveId: body.objectiveId, indicatorId: body.indicatorId,
    linkType: body.linkType, weight: body.weight ?? 1,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem); writeDb('bsc-map-links', items);
  return NextResponse.json(newItem, { status: 201 });
}
