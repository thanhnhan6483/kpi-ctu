import { NextResponse } from 'next/server';
import { runAllChecks } from '@/lib/notification-engine';

export async function POST() {
  try {
    const results = runAllChecks();
    return NextResponse.json({
      success: true,
      message: `Đã kiểm tra: ${results.deadlineWarnings} cảnh báo deadline, ${results.missingEvidence} cảnh báo thiếu minh chứng`,
      results,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Lỗi khi kiểm tra tự động' }, { status: 500 });
  }
}
