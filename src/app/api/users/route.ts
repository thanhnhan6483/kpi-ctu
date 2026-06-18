import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  employeeCode: string;
  unitId: string;
  positionId: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export async function GET() {
  return NextResponse.json(readDb<User>('users'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const users = readDb<User>('users');
  const newUser: User = {
    id: `u${generateId()}`,
    username: body.username,
    fullName: body.fullName,
    email: body.email,
    employeeCode: body.employeeCode,
    unitId: body.unitId,
    positionId: body.positionId,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeDb('users', users);
  return NextResponse.json(newUser, { status: 201 });
}
