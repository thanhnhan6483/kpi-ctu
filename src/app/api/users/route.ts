import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  employeeCode: string;
  unitId: string;
  positionId: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

function stripPassword(user: User): Omit<User, 'password'> {
  const { password: _, ...rest } = user;
  return rest;
}

export async function GET() {
  const users = readDb<User>('users');
  return NextResponse.json(users.map(stripPassword));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const users = readDb<User>('users');
  const newUser: User = {
    id: `u${generateId()}`,
    username: body.username,
    password: body.password || 'ctu@2024',
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
  return NextResponse.json(stripPassword(newUser), { status: 201 });
}
