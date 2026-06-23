import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';

interface Evaluation {
  id: string;
  status: string;
  lockedAt?: string;
  [key: string]: any;
}

interface Score {
  id: string;
  [key: string]: any;
}

interface IndividualEvaluation {
  id: string;
  status: string;
  lockedAt?: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { entityType, entityId, reason, scope } = body;

  if (!entityType || !entityId || !reason) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const now = new Date().toISOString();

  if (entityType === 'evaluation') {
    const evaluations = readDb<Evaluation>('evaluations');
    const idx = evaluations.findIndex(e => e.id === entityId);
    if (idx === -1) return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    if (evaluations[idx].status !== 'locked') {
      return NextResponse.json({ error: 'Only locked evaluations can be unlocked' }, { status: 400 });
    }
    evaluations[idx].status = 'evaluated';
    evaluations[idx].lockedAt = undefined;
    evaluations[idx].unlockedAt = now;
    evaluations[idx].unlockReason = reason;
    writeDb('evaluations', evaluations);
  } else if (entityType === 'individual_evaluation') {
    const evals = readDb<IndividualEvaluation>('individual-evaluations');
    const idx = evals.findIndex(e => e.id === entityId);
    if (idx === -1) return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    if (evals[idx].status !== 'locked') {
      return NextResponse.json({ error: 'Only locked evaluations can be unlocked' }, { status: 400 });
    }
    evals[idx].status = 'evaluated';
    evals[idx].lockedAt = undefined;
    evals[idx].unlockedAt = now;
    evals[idx].unlockReason = reason;
    writeDb('individual-evaluations', evals);
  }

  const auditLogs = readDb<any>('audit-logs');
  auditLogs.push({
    id: `log${generateId()}`,
    userId: 'u001',
    action: 'unlock',
    objectType: entityType,
    objectId: entityId,
    ipAddress: '127.0.0.1',
    createdAt: now,
    detail: `Mở khóa ${entityType} ${entityId}. Lý do: ${reason}`,
  });
  writeDb('audit-logs', auditLogs);

  return NextResponse.json({ success: true, message: `Đã mở khóa ${entityType} ${entityId}` });
}
