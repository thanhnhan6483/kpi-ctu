import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface UserRole {
  userId: string;
  roleId: string;
  scopeUnitId?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const roles = readDb<UserRole>('user-roles');
  if (userId) {
    return NextResponse.json(roles.filter(r => r.userId === userId));
  }
  return NextResponse.json(roles);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { userId, roleIds } = body as { userId: string; roleIds: string[] };
  if (!userId || !Array.isArray(roleIds)) {
    return NextResponse.json({ error: 'Missing userId or roleIds' }, { status: 400 });
  }

  const all = readDb<UserRole>('user-roles');
  const filtered = all.filter(r => r.userId !== userId);
  roleIds.forEach(roleId => {
    filtered.push({ userId, roleId });
  });
  writeDb('user-roles', filtered);
  return NextResponse.json(filtered.filter(r => r.userId === userId));
}
