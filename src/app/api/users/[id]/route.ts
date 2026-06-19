import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

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
  const { password: _pw, ...rest } = user;
  void _pw;
  return rest;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const users = readDb<User>('users');
  const user = users.find(u => u.id === id);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(stripPassword(user));
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const users = readDb<User>('users');
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  users[index] = { ...users[index], ...body };
  writeDb('users', users);
  return NextResponse.json(stripPassword(users[index]));
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const users = readDb<User>('users');
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeDb('users', filtered);
  return NextResponse.json({ success: true });
}
