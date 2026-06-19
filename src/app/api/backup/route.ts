import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'src', 'data');
const BACKUP_DIR = join(process.cwd(), 'backups');

const dataFiles = [
  'academic-years', 'approvals', 'audit-logs', 'cascade-assignments', 'cycles',
  'evaluations', 'evidence-types', 'evidences', 'exemption-coefficients',
  'grading-levels', 'individual-evaluations', 'individual-kpis', 'indicators',
  'job-positions', 'kpi-groups', 'measurement-units', 'notifications',
  'permissions', 'plan-items', 'plans', 'positions', 'progress', 'roles',
  'scores', 'strategic-objectives', 'unit-kpis', 'units', 'user-roles', 'users',
];

export async function POST() {
  try {
    if (!existsSync(BACKUP_DIR)) { mkdirSync(BACKUP_DIR, { recursive: true }); }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData: Record<string, any> = {};
    let totalRecords = 0;

    dataFiles.forEach(filename => {
      try {
        const data = readDb(filename);
        backupData[filename] = data;
        totalRecords += Array.isArray(data) ? data.length : 0;
      } catch { /* skip */ }
    });

    const backupFile = join(BACKUP_DIR, `backup_${timestamp}.json`);
    writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Đã sao lưu ${totalRecords} records từ ${dataFiles.length} files`,
      file: backupFile,
      timestamp,
      totalRecords,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Lỗi khi sao lưu dữ liệu' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!existsSync(BACKUP_DIR)) { return NextResponse.json([]); }
    const { readdirSync, statSync } = await import('fs');
    const files = readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
      .map(f => {
        const stat = statSync(join(BACKUP_DIR, f));
        return { name: f, size: stat.size, createdAt: stat.birthtime.toISOString() };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json(files);
  } catch {
    return NextResponse.json([]);
  }
}
