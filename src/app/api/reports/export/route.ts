import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

interface PlanItem { id: string; planId: string; indicatorId: string; targetValue: number; weight: number; dueDate: string; }
interface Plan { id: string; cycleId: string; ownerId: string; status: string; }
interface Score { id: string; planItemId: string; selfScore: number | null; managerScore: number | null; councilScore: number | null; finalScore: number | null; }
interface Progress { id: string; planItemId: string; actualValue: number; progressDate: string; note: string; }
interface Evidence { id: string; planItemIds: string[]; evidenceType: string; fileName?: string; status: string; }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'unit';
  const format = searchParams.get('format') || 'csv';

  const planItems = readDb<PlanItem>('plan-items');
  const plans = readDb<Plan>('plans');
  const scores = readDb<Score>('scores');
  const progress = readDb<Progress>('progress');
  const evidences = readDb<Evidence>('evidences');

  if (type === 'unit') {
    const rows = plans.map(plan => {
      const items = planItems.filter(pi => pi.planId === plan.id);
      const itemScores = items.map(item => {
        const score = scores.find(s => s.planItemId === item.id);
        const latestProgress = progress.filter(p => p.planItemId === item.id).sort((a, b) => b.progressDate.localeCompare(a.progressDate))[0];
        const hasEvidence = evidences.some(e => (e.planItemIds || []).includes(item.id));
        return {
          planId: plan.id,
          indicatorId: item.indicatorId,
          target: item.targetValue,
          actual: latestProgress?.actualValue || 0,
          percent: item.targetValue > 0 ? Math.round(((latestProgress?.actualValue || 0) / item.targetValue) * 100) : 0,
          weight: item.weight,
          selfScore: score?.selfScore || null,
          managerScore: score?.managerScore || null,
          councilScore: score?.councilScore || null,
          finalScore: score?.finalScore || null,
          hasEvidence,
        };
      });
      const totalWeight = items.reduce((s, i) => s + i.weight, 0);
      const avgScore = totalWeight > 0 ? Math.round(items.reduce((s, item) => {
        const score = scores.find(sc => sc.planItemId === item.id);
        return s + ((score?.finalScore || 0) * item.weight);
      }, 0) / totalWeight) : 0;
      return {
        unitId: plan.ownerId,
        status: plan.status,
        kpiCount: items.length,
        avgScore,
        items: itemScores,
      };
    });

    if (format === 'csv') {
      const headers = ['Đơn vị', 'Trạng thái', 'Số KPI', 'Điểm TB', 'Mã KPI', 'Chỉ tiêu mục tiêu', 'Thực tế', 'Hoàn thành %', 'Trọng số', 'Điểm tự ĐG', 'Điểm cấp trên', 'Điểm hội đồng', 'Điểm tổng kết', 'Có MC'];
      const csvRows = [headers.join(',')];
      rows.forEach(row => {
        if (row.items.length === 0) {
          csvRows.push([row.unitId, row.status, row.kpiCount, row.avgScore, '', '', '', '', '', '', '', '', '', ''].join(','));
        }
        row.items.forEach(item => {
          csvRows.push([
            row.unitId, row.status, row.kpiCount, row.avgScore,
            item.indicatorId, item.target, item.actual, item.percent, item.weight,
            item.selfScore || '', item.managerScore || '', item.councilScore || '', item.finalScore || '',
            item.hasEvidence ? 'Có' : 'Không'
          ].join(','));
        });
      });
      return new NextResponse(csvRows.join('\n'), {
        headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="baocao_kpi_donvi_${new Date().toISOString().split('T')[0]}.csv"` },
      });
    }
  }

  if (type === 'individual') {
    const evaluations = readDb<any>('individual-evaluations');
    const rows = evaluations.map((ev: any) => ({
      name: ev.personName || '',
      unit: ev.unitName || '',
      position: ev.positionCode || '',
      selfScore: ev.selfScore || '',
      managerScore: ev.managerScore || '',
      councilScore: ev.councilScore || '',
      finalScore: ev.finalScore || '',
      grade: ev.grade || '',
      status: ev.status || '',
    }));

    if (format === 'csv') {
      const headers = ['Họ tên', 'Đơn vị', 'Vị trí', 'Điểm tự ĐG', 'Điểm cấp trên', 'Điểm hội đồng', 'Điểm tổng kết', 'Xếp loại', 'Trạng thái'];
      const csvRows = [headers.join(','), ...rows.map(r => [r.name, r.unit, r.position, r.selfScore, r.managerScore, r.councilScore, r.finalScore, r.grade, r.status].join(','))];
      return new NextResponse(csvRows.join('\n'), {
        headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="baocao_kpi_canhan_${new Date().toISOString().split('T')[0]}.csv"` },
      });
    }
  }

  if (type === 'reward') {
    const evaluations = readDb<any>('individual-evaluations');
    const sorted = evaluations
      .filter((e: any) => e.finalScore && e.status === 'evaluated')
      .sort((a: any, b: any) => (b.finalScore || 0) - (a.finalScore || 0));

    if (format === 'csv') {
      const headers = ['Hạng', 'Họ tên', 'Đơn vị', 'Vị trí', 'Điểm tổng kết', 'Xếp loại', 'Đề xuất'];
      const csvRows = [headers.join(','), ...sorted.map((ev: any, idx: number) => {
        let proposal = '';
        if (ev.grade === 'Xuất sắc') proposal = 'Khen thưởng cấp Trường';
        else if (ev.grade === 'Tốt') proposal = 'Khen thưởng cấp Đơn vị';
        else if (ev.grade === 'Không đạt') proposal = 'Kiểm điểm, cải thiện';
        return [idx + 1, ev.personName || '', ev.unitName || '', ev.positionCode || '', ev.finalScore || '', ev.grade || '', proposal].join(',');
      })];
      return new NextResponse(csvRows.join('\n'), {
        headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="ketqua_thidua_${new Date().toISOString().split('T')[0]}.csv"` },
      });
    }
  }

  return NextResponse.json({ error: 'Invalid type or format' }, { status: 400 });
}
