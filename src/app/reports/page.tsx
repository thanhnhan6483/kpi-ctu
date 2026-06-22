'use client';

import { useState, useMemo } from 'react';
import { FileText, Download, Filter, Calendar, BarChart2, PieChart, TrendingUp, Users, Award, AlertTriangle, Building, Clock, User, FileWarning, Edit3, Plus } from 'lucide-react';
import progressData from '@/data/progress.json';
import evidencesData from '@/data/evidences.json';
import planItemsData from '@/data/plan-items.json';
import unitsData from '@/data/units.json';
import usersData from '@/data/users.json';
import indicatorsData from '@/data/indicators.json';
import kpiGroupsData from '@/data/kpi-groups.json';
import individualEvalsData from '@/data/individual-evaluations.json';
import cyclesData from '@/data/cycles.json';
import { calcCompletionRate } from '@/lib/kpi';

const reportTypes = [
  { id: 'summary', name: 'Báo cáo tổng hợp KPI', description: 'Tổng điểm, mức xếp loại, KPI đạt/chưa đạt', icon: FileText, priority: 'high' },
  { id: 'progress', name: 'Báo cáo tiến độ KPI', description: 'Tiến độ từng KPI, % hoàn thành', icon: TrendingUp, priority: 'high' },
  { id: 'evidence', name: 'Báo cáo minh chứng', description: 'Tình trạng minh chứng, hồ sơ thiếu', icon: FileText, priority: 'medium' },
  { id: 'warning', name: 'Báo cáo KPI chưa đạt', description: 'Nguyên nhân, giải pháp, thời hạn khắc phục', icon: AlertTriangle, priority: 'high' },
  { id: 'compare', name: 'Báo cáo so sánh đơn vị', description: 'So sánh các đơn vị cùng nhóm', icon: PieChart, priority: 'medium' },
  { id: 'trend', name: 'Báo cáo xu hướng 3 năm', description: 'Xu hướng KPI theo thời gian', icon: BarChart2, priority: 'low' },
  { id: 'reward', name: 'Báo cáo thi đua/xếp loại', description: 'Điểm KPI, xếp loại, đề xuất khen thưởng', icon: Award, priority: 'high' },
  { id: 'improvement', name: 'Báo cáo cải tiến chất lượng (XVI.6)', description: 'KPI chưa đạt, nguyên nhân, kế hoạch', icon: TrendingUp, priority: 'medium' },
  { id: 'missing-evidence', name: 'Báo cáo thiếu MC & chậm tiến độ (XVI.5)', description: 'KPI thiếu minh chứng, quá hạn, sắp đến hạn', icon: FileWarning, priority: 'high' },
  { id: 'reward-export', name: 'Kết xuất dữ liệu khen thưởng (XV.6)', description: 'Dữ liệu lương/thưởng theo kỳ, xếp loại', icon: Award, priority: 'medium' },
];

const reportHistory = [
  { id: 1, name: 'Báo cáo tổng hợp Q1/2026', type: 'summary', date: '31/03/2026', status: 'completed', size: '2.4 MB' },
  { id: 2, name: 'Báo cáo tiến độ tháng 3/2026', type: 'progress', date: '31/03/2026', status: 'completed', size: '1.8 MB' },
  { id: 3, name: 'Báo cáo minh chứng Q1/2026', type: 'evidence', date: '31/03/2026', status: 'completed', size: '3.1 MB' },
  { id: 4, name: 'Báo cáo so sánh đơn vị 2025-2026', type: 'compare', date: '15/06/2026', status: 'pending', size: '-' },
  { id: 5, name: 'Báo cáo KPI chưa đạt Q1/2026', type: 'warning', date: '01/04/2026', status: 'completed', size: '1.2 MB' },
  { id: 6, name: 'Báo cáo thi đua năm 2025-2026', type: 'reward', date: '15/06/2026', status: 'pending', size: '-' },
];

const unitSummary = [
  { name: 'Phòng Đào tạo', total: 10, achieved: 8, warning: 1, notAchieved: 1, score: 85, grade: 'Tốt' },
  { name: 'Phòng KHCN', total: 10, achieved: 7, warning: 2, notAchieved: 1, score: 82, grade: 'Tốt' },
  { name: 'Khoa CNTT', total: 11, achieved: 6, warning: 3, notAchieved: 2, score: 78, grade: 'Đạt' },
  { name: 'Phòng TCCB', total: 9, achieved: 5, warning: 2, notAchieved: 2, score: 75, grade: 'Đạt' },
  { name: 'Trung tâm CNTT', total: 10, achieved: 9, warning: 1, notAchieved: 0, score: 92, grade: 'Xuất sắc' },
  { name: 'Phòng ĐBCL', total: 10, achieved: 8, warning: 1, notAchieved: 1, score: 87, grade: 'Tốt' },
  { name: 'Phòng HTQT', total: 9, achieved: 6, warning: 2, notAchieved: 1, score: 79, grade: 'Đạt' },
  { name: 'Phòng KHTC', total: 9, achieved: 7, warning: 1, notAchieved: 1, score: 81, grade: 'Tốt' },
];

const gradeColors: Record<string, string> = {
  'Xuất sắc': '#4caf50',
  'Tốt': '#2196f3',
  'Đạt': '#ff9800',
  'Cần cải thiện': '#ffc107',
  'Không đạt': '#f44336',
};

const unitMap: Record<string, string> = {};
(unitsData as { id: string; name: string }[]).forEach(u => { unitMap[u.id] = u.name; });

function getEvidenceStats() {
  const evidences = evidencesData as any[];
  const planItems = planItemsData as any[];
  const totalPlanItems = planItems.length;
  const itemsWithEvidence = new Set(evidences.map((e: any) => e.planItemId)).size;
  const itemsWithoutEvidence = totalPlanItems - itemsWithEvidence;
  const pendingReview = evidences.filter((e: any) => e.status === 'submitted' || e.status === 'pending').length;
  return { totalPlanItems, itemsWithEvidence, itemsWithoutEvidence, pendingReview };
}

const unitCodeMap: Record<string, string> = {
  'DT': 'Phòng Đào tạo',
  'KHCN': 'Phòng KHCN',
  'CNTT': 'Khoa CNTT',
  'TCCB': 'Phòng TCCB',
  'DBCL': 'Phòng ĐBCL',
  'HTQT': 'Phòng HTQT',
  'KHTC': 'Phòng KHTC',
  'TTTD': 'Trung tâm CNTT',
  'VPT': 'Văn phòng Trường',
  'BM': 'Bộ môn trực thuộc',
  'DV': 'Đơn vị dịch vụ',
  'KTV': 'Khối kỹ thuật viên',
  'KTX': 'Ký túc xá',
  'NC': 'Khối nghiên cứu',
  'TV': 'Khối thư viện',
};

function getUnitFromPlanItem(planItem: any): string {
  const match = (planItem.id || '').match(/^pi_([^-]+)/);
  if (match && unitCodeMap[match[1]]) return unitCodeMap[match[1]];
  if (planItem.planId) {
    const m2 = planItem.planId.match(/plan_unit_([^_]+)/);
    if (m2) {
      const codeUpper = m2[1].toUpperCase();
      if (unitCodeMap[codeUpper]) return unitCodeMap[codeUpper];
    }
  }
  return 'Đơn vị khác';
}

function getKpiName(indicatorId: string | null): string {
  if (!indicatorId) return 'Mục tiêu tự đặt';
  const ind = (indicatorsData as any[]).find(i => i.id === indicatorId || i.code === indicatorId);
  return ind ? ind.name : indicatorId;
}

function getMissingEvidenceItems() {
  const today = new Date().toISOString().split('T')[0];
  const planItems = planItemsData as any[];
  const evidencePlanItemIds = new Set((evidencesData as any[]).map((e: any) => e.planItemId));
  const progressMap = new Map<string, number>();
  (progressData as any[]).forEach(p => {
    const key = p.indicatorId || p.planItemId || '';
    if (key && !progressMap.has(key)) progressMap.set(key, p.actualValue);
  });

  return planItems
    .map(p => {
      const hasEvidence = evidencePlanItemIds.has(p.id);
      const isOverdue = p.dueDate && p.dueDate < today;
      const progressVal = progressMap.get(p.indicatorId || '') || progressMap.get(p.id || '') || 0;
      const targetVal = p.targetValue || 100;
      const pct = targetVal > 0 ? Math.min(Math.round((progressVal / targetVal) * 100), 100) : 0;
      let status: string;
      let statusVariant: string;
      if (hasEvidence && !isOverdue && p.dueDate) {
        status = 'Đã có MC + Đúng hạn';
        statusVariant = 'success';
      } else if (!hasEvidence && !isOverdue) {
        status = 'Thiếu MC';
        statusVariant = 'danger';
      } else if (isOverdue) {
        status = 'Quá hạn';
        statusVariant = 'danger';
      } else {
        const days = p.dueDate ? Math.ceil((new Date(p.dueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)) : 999;
        status = days >= 0 && days <= 14 ? 'Sắp đến hạn' : 'Còn hạn';
        statusVariant = days >= 0 && days <= 14 ? 'warning' : 'success';
      }
      return {
        id: p.id,
        indicatorId: p.indicatorId,
        kpiName: getKpiName(p.indicatorId),
        unit: getUnitFromPlanItem(p),
        dueDate: p.dueDate || 'Chưa có',
        hasEvidence,
        progress: pct,
        status,
        statusVariant,
      };
    })
    .filter(p => !p.hasEvidence || p.status === 'Quá hạn' || p.status === 'Sắp đến hạn')
    .sort((a, b) => {
      if (a.statusVariant === 'danger' && b.statusVariant !== 'danger') return -1;
      if (a.statusVariant !== 'danger' && b.statusVariant === 'danger') return 1;
      return 0;
    });
}

function getBelowTargetIndicators() {
  const indicators = indicatorsData as any[];
  const progresses = progressData as any[];
  const progressByIndicator = new Map<string, number>();
  progresses.forEach(p => {
    if (p.indicatorId && p.level === 'school') {
      progressByIndicator.set(p.indicatorId, p.actualValue);
    }
  });

  return indicators
    .map(ind => {
      const actualVal = progressByIndicator.get(ind.id) || progressByIndicator.get(ind.code) || 0;
      const targetVal = ind.targetValue || 1;
      const rawRate = actualVal > 0
        ? calcCompletionRate(actualVal, targetVal, ind.direction || 'higher_better')
        : 0;
      const gap = targetVal - actualVal;
      return { ...ind, actualValue: actualVal, rawRate, gap };
    })
    .filter(ind => ind.rawRate < 100 || ind.rawRate === 0)
    .sort((a, b) => a.rawRate - b.rawRate);
}

function getUnitSummaryFromEvals() {
  const evals = individualEvalsData as any[];
  const grouped: Record<string, { total: number; sumScore: number; count: number }> = {};
  evals.forEach((e: any) => {
    const score = e.finalScore || e.councilScore || e.managerScore || e.selfScore || 0;
    const unitName = e.unitName || 'Không xác định';
    if (!grouped[unitName]) grouped[unitName] = { total: 0, sumScore: 0, count: 0 };
    grouped[unitName].total += 1;
    grouped[unitName].sumScore += score;
    grouped[unitName].count += 1;
  });
  let worstUnit = '';
  let worstAvg = 100;
  Object.entries(grouped).forEach(([name, g]) => {
    const avg = g.sumScore / g.count;
    if (avg < worstAvg) { worstAvg = avg; worstUnit = name; }
  });
  const totalKpiBelow = Object.keys(grouped).length;
  const totalSum = Object.values(grouped).reduce((s, g) => s + g.sumScore, 0);
  const totalCount = Object.values(grouped).reduce((s, g) => s + g.count, 0);
  const avgCompletion = totalCount > 0 ? totalSum / totalCount : 0;
  return { totalKpiBelow, avgCompletion, worstUnit, worstAvg };
}

function getGradeLevel(score: number | null): string {
  if (score == null) return 'Chưa xếp loại';
  if (score >= 90) return 'Xuất sắc';
  if (score >= 80) return 'Tốt';
  if (score >= 65) return 'Đạt';
  if (score >= 50) return 'Cần cải thiện';
  return 'Không đạt';
}

function csvEscape(val: string | number): string {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const bom = '\uFEFF';
  const csv = bom + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getDeadlineWarnings() {
  const today = new Date().toISOString().split('T')[0];
  const planItems = planItemsData as any[];
  const overdue = planItems.filter((p: any) => p.dueDate && p.dueDate < today);
  const upcoming = planItems.filter((p: any) => {
    if (!p.dueDate) return false;
    const days = Math.ceil((new Date(p.dueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 14;
  });
  return { overdue: overdue.length, upcoming: upcoming.length };
}

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState('summary');
  const [dateRange, setDateRange] = useState({ start: '2025-09-01', end: '2026-06-30' });
  const [reportFormat, setReportFormat] = useState('pdf');
  const [rewardCycle, setRewardCycle] = useState('');
  const [rewardGrade, setRewardGrade] = useState('all');
  const [rewardFormat, setRewardFormat] = useState('csv');
  const [showRewardPreview, setShowRewardPreview] = useState(false);

  const rewardPreviewData = useMemo(() => {
    const evals = individualEvalsData as any[];
    const users = usersData as any[];
    const userMap = new Map(users.map((u: any) => [u.id, u]));
    if (!rewardCycle) return [];
    let filtered = evals.filter((e: any) => e.cycleName === rewardCycle || e.id.includes(rewardCycle));
    if (rewardGrade !== 'all') {
      filtered = filtered.filter((e: any) => {
        const grade = getGradeLevel(e.finalScore ?? e.councilScore ?? e.managerScore ?? e.selfScore ?? 0);
        return grade === rewardGrade;
      });
    }
    return filtered.slice(0, 50).map((e: any) => {
      const u = userMap.get(e.personId);
      const score = e.finalScore ?? e.councilScore ?? e.managerScore ?? e.selfScore ?? 0;
      const grade = getGradeLevel(score);
      const coeff = grade === 'Xuất sắc' ? 1.5 : grade === 'Tốt' ? 1.2 : grade === 'Đạt' ? 1.0 : grade === 'Cần cải thiện' ? 0.7 : 0.5;
      const baseSalary = 3500000;
      const amount = Math.round(baseSalary * coeff);
      return {
        fullName: e.personName || u?.fullName || 'N/A',
        employeeCode: u?.employeeCode || 'N/A',
        unitName: e.unitName || 'N/A',
        score,
        grade,
        coeff,
        amount,
      };
    });
  }, [rewardCycle, rewardGrade]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Báo cáo & Thống kê</h1>
          <p className="text-text-light mt-1">Xuất báo cáo theo nhiều tiêu chí và định dạng</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <div className="card-header">
            <h3 className="text-white">Tạo báo cáo mới</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Loại báo cáo</label>
              <div className="grid grid-cols-2 gap-3">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedType === type.id
                          ? 'border-primary bg-primary-light'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} className={selectedType === type.id ? 'text-primary' : 'text-text-light'} />
                        <div>
                          <div className="font-medium text-sm">{type.name}</div>
                          <div className="text-xs text-text-light">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Từ ngày</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Đến ngày</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Định dạng</label>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="word">Word</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <a href="/kpi/evaluation" className="btn-primary flex items-center gap-2">
                <FileText size={16} />
                Xem kết quả
              </a>
              <a href="/api/reports/export?type=unit&format=csv" className="px-4 py-2 bg-accent-green text-white rounded-lg text-sm flex items-center gap-2 hover:opacity-90" download>
                <Download size={16} /> Xuất CSV Đơn vị
              </a>
              <a href="/api/reports/export?type=individual&format=csv" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 hover:opacity-90" download>
                <Download size={16} /> Xuất CSV Cá nhân
              </a>
              <a href="/api/reports/export?type=reward&format=csv" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center gap-2 hover:opacity-90" download>
                <Download size={16} /> Xuất CSV Thi đua
              </a>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-white">Lịch sử báo cáo</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {reportHistory.map((report) => (
                <div key={report.id} className="p-3 bg-bg-cream rounded-lg border border-border">
                  <div className="font-medium text-sm">{report.name}</div>
                  <div className="text-xs text-text-light mt-1">{report.date} • {report.size}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`badge ${report.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                      {report.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                    </span>
                    {report.status === 'completed' && (
                      <button className="text-primary text-xs hover:underline flex items-center gap-1">
                        <Download size={12} />
                        Tải về
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-white">Báo cáo nhanh theo đơn vị</h3>
        </div>
        <div className="p-0">
          <table className="table">
            <thead>
              <tr>
                <th>Đơn vị</th>
                <th>Tổng KPI</th>
                <th>Đạt</th>
                <th>Cần cải thiện</th>
                <th>Chưa đạt</th>
                <th>Điểm TB</th>
                <th>Xếp loại</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {unitSummary.map((unit) => (
                <tr key={unit.name}>
                  <td className="font-medium">{unit.name}</td>
                  <td>{unit.total}</td>
                  <td><span className="badge badge-success">{unit.achieved}</span></td>
                  <td><span className="badge badge-warning">{unit.warning}</span></td>
                  <td><span className="badge badge-danger">{unit.notAchieved}</span></td>
                  <td className="font-bold" style={{ color: gradeColors[unit.grade] }}>{unit.score}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: `${gradeColors[unit.grade]}20`, color: gradeColors[unit.grade] }}>
                      {unit.grade}
                    </span>
                  </td>
                  <td>
                    <a href="/kpi/evaluation" className="text-primary text-sm hover:underline">Chi tiết</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Báo cáo thiếu minh chứng / chậm tiến độ (XVI.5) */}
      {(() => {
        const items = getMissingEvidenceItems();
        const totalItems = items.length;
        const displayItems = items.slice(0, 20);
        return (
          <div className="card">
            <div className="card-header">
              <h3 className="text-white">Báo cáo thiếu minh chứng & chậm tiến độ (XVI.5)</h3>
            </div>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <p className="text-sm text-text-light">
                Tổng số KPI có vấn đề: <span className="font-bold text-red-600">{totalItems}</span>
              </p>
              <button
                onClick={() => {
                  const headers = ['STT', 'KPI/Chỉ tiêu', 'Đơn vị', 'Hạn nộp', 'Trạng thái MC', 'Tiến độ (%)', 'Tình trạng'];
                  const rows = displayItems.map((item, i) => [
                    String(i + 1),
                    item.kpiName,
                    item.unit,
                    item.dueDate,
                    item.hasEvidence ? 'Có' : 'Thiếu',
                    String(item.progress),
                    item.status,
                  ]);
                  downloadCsv('bao-cao-thieu-minh-chung.csv', headers, rows);
                }}
                className="px-3 py-1.5 bg-accent-green text-white rounded-lg text-sm flex items-center gap-1.5 hover:opacity-90"
              >
                <Download size={14} /> Xuất CSV
              </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="w-10">STT</th>
                    <th>KPI/Chỉ tiêu</th>
                    <th>Đơn vị</th>
                    <th>Hạn nộp</th>
                    <th>Trạng thái MC</th>
                    <th>Tiến độ (%)</th>
                    <th>Tình trạng</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-text-light py-8">Không có KPI nào thiếu minh chứng hoặc chậm tiến độ.</td>
                    </tr>
                  ) : displayItems.map((item, i) => (
                    <tr key={item.id}>
                      <td className="text-text-light">{i + 1}</td>
                      <td className="font-medium text-sm max-w-[280px] truncate" title={item.kpiName}>{item.kpiName}</td>
                      <td className="text-sm">{item.unit}</td>
                      <td className="text-sm">{item.dueDate}</td>
                      <td>
                        <span className={`badge ${item.hasEvidence ? 'badge-success' : 'badge-danger'}`}>
                          {item.hasEvidence ? 'Có' : 'Thiếu'}
                        </span>
                      </td>
                      <td className="text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-gray-200">
                            <div
                              className={`h-full rounded-full ${item.progress >= 80 ? 'bg-green-500' : item.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span>{item.progress}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${item.statusVariant}`}>{item.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalItems > 20 && (
              <div className="p-3 text-center border-t border-border">
                <a href="/kpi/evidences" className="text-primary text-sm hover:underline">Xem thêm ({totalItems - 20} KPI khác) →</a>
              </div>
            )}
          </div>
        );
      })()}

      {/* Báo cáo cải tiến chất lượng (XVI.6) */}
      {(() => {
        const indicators = getBelowTargetIndicators();
        const kpiGroups = kpiGroupsData as any[];
        const groupMap = new Map(kpiGroups.map((g: any) => [g.id, g.name]));
        const summary = getUnitSummaryFromEvals();
        const totalBelow = indicators.length;
        const avgRate = indicators.length > 0
          ? Math.round(indicators.reduce((s, i) => s + i.rawRate, 0) / indicators.length)
          : 0;
        return (
          <div className="card">
            <div className="card-header">
              <h3 className="text-white">Báo cáo cải tiến chất lượng (XVI.6)</h3>
            </div>
            <div className="p-4 border-b border-border grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="text-xs text-text-light">KPI chưa đạt chỉ tiêu</div>
                <div className="text-xl font-bold text-red-600">{totalBelow}</div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="text-xs text-text-light">Tỷ lệ hoàn thành TB</div>
                <div className="text-xl font-bold text-yellow-700">{avgRate}%</div>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="text-xs text-text-light">Lĩnh vực yếu nhất</div>
                <div className="text-xl font-bold text-orange-700 truncate">{summary.worstUnit || 'Chưa xác định'}</div>
              </div>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã KPI</th>
                    <th>Tên KPI</th>
                    <th>Lĩnh vực</th>
                    <th>Chỉ tiêu</th>
                    <th>Thực tế</th>
                    <th>Tỷ lệ (%)</th>
                    <th>Khoảng cách</th>
                    <th>Đề xuất cải tiến</th>
                  </tr>
                </thead>
                <tbody>
                  {indicators.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-text-light py-8">
                        Tất cả KPI đều đạt chỉ tiêu. Không có KPI nào cần cải tiến.
                      </td>
                    </tr>
                  ) : indicators.slice(0, 30).map((ind: any) => (
                    <tr key={ind.id}>
                      <td className="text-sm font-mono">{ind.code}</td>
                      <td className="text-sm max-w-[240px] truncate" title={ind.name}>{ind.name}</td>
                      <td className="text-sm">{groupMap.get(ind.categoryId) || ind.categoryId}</td>
                      <td className="text-sm">{ind.targetValue}{ind.unit === '%' ? '%' : ''}</td>
                      <td className="text-sm">{ind.actualValue}{ind.unit === '%' ? '%' : ''}</td>
                      <td>
                        <span className={`badge ${ind.rawRate >= 100 ? 'badge-success' : 'badge-danger'}`}>
                          {Math.round(ind.rawRate)}%
                        </span>
                      </td>
                      <td className="text-sm">
                        <span className="text-red-600">
                          {ind.gap > 0 ? `-${ind.gap}` : ind.gap}{ind.unit === '%' ? '%' : ''}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-light italic">Chưa có đề xuất</span>
                          <button className="text-primary hover:text-primary-dark" title="Thêm đề xuất">
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {indicators.length > 30 && (
              <div className="p-3 text-center border-t border-border">
                <a href="/kpi/evaluation" className="text-primary text-sm hover:underline">Xem thêm ({indicators.length - 30} KPI khác) →</a>
              </div>
            )}
          </div>
        );
      })()}

      <div className="grid grid-cols-3 gap-6">
        <div className="card p-4">
          <h4 className="font-heading font-bold text-sm mb-3">Thống kê tổng quát</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-light">Tổng KPI cấp Trường</span>
              <span className="font-bold">23</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-light">Tổng KPI cấp Đơn vị</span>
              <span className="font-bold">{unitSummary.reduce((s, u) => s + u.total, 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-light">Tổng đơn vị tham gia</span>
              <span className="font-bold">{unitSummary.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-light">Tổng người dùng</span>
              <span className="font-bold">13</span>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <h4 className="font-heading font-bold text-sm mb-3">Phân loại KPI</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent-green" />
              <span className="text-sm flex-1">Đạt chỉ tiêu</span>
              <span className="font-bold">15 (65%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent-yellow" />
              <span className="text-sm flex-1">Cần cải thiện</span>
              <span className="font-bold">5 (22%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent-red" />
              <span className="text-sm flex-1">Chưa đạt</span>
              <span className="font-bold">3 (13%)</span>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <h4 className="font-heading font-bold text-sm mb-3">Xếp loại đơn vị</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: gradeColors['Xuất sắc'] }} />
              <span className="text-sm flex-1">Xuất sắc</span>
              <span className="font-bold">1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: gradeColors['Tốt'] }} />
              <span className="text-sm flex-1">Tốt</span>
              <span className="font-bold">4</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: gradeColors['Đạt'] }} />
              <span className="text-sm flex-1">Đạt</span>
              <span className="font-bold">3</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: gradeColors['Cần cải thiện'] }} />
              <span className="text-sm flex-1">Cần cải thiện</span>
              <span className="font-bold">0</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="card p-4">
          <h4 className="font-heading font-bold text-sm mb-3 flex items-center gap-2"><User size={14} /> Báo cáo KPI cá nhân</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text-light">Tổng người dùng</span><span className="font-bold">{(usersData as any[]).length}</span></div>
            <div className="flex justify-between"><span className="text-text-light">Đang hoạt động</span><span className="font-bold text-green-600">{(usersData as any[]).filter((u: any) => u.status === 'active').length}</span></div>
            <div className="flex justify-between"><span className="text-text-light">Tổng KPI cá nhân</span><span className="font-bold">{(planItemsData as any[]).length}</span></div>
          </div>
          <a href="/kpi/my-kpi-registration" className="mt-3 block text-center text-primary text-xs hover:underline">Xem phiếu KPI cá nhân →</a>
        </div>
        <div className="card p-4">
          <h4 className="font-heading font-bold text-sm mb-3 flex items-center gap-2"><FileWarning size={14} /> Thiếu minh chứng</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text-light">Tổng mục tiêu</span><span className="font-bold">{getEvidenceStats().totalPlanItems}</span></div>
            <div className="flex justify-between"><span className="text-text-light">Có minh chứng</span><span className="font-bold text-green-600">{getEvidenceStats().itemsWithEvidence}</span></div>
            <div className="flex justify-between"><span className="text-text-light">Thiếu minh chứng</span><span className="font-bold text-red-600">{getEvidenceStats().itemsWithoutEvidence}</span></div>
            <div className="flex justify-between"><span className="text-text-light">Chờ duyệt MC</span><span className="font-bold text-yellow-600">{getEvidenceStats().pendingReview}</span></div>
          </div>
          <a href="/kpi/evidences" className="mt-3 block text-center text-primary text-xs hover:underline">Quản lý minh chứng →</a>
        </div>
        <div className="card p-4">
          <h4 className="font-heading font-bold text-sm mb-3 flex items-center gap-2"><Clock size={14} /> Deadline & Tiến độ</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text-light">Quá hạn</span><span className="font-bold text-red-600">{getDeadlineWarnings().overdue}</span></div>
            <div className="flex justify-between"><span className="text-text-light">Sắp đến hạn (≤14 ngày)</span><span className="font-bold text-yellow-600">{getDeadlineWarnings().upcoming}</span></div>
            <div className="flex justify-between"><span className="text-text-light">Đơn vị tham gia</span><span className="font-bold">{(unitsData as any[]).filter((u: any) => u.status === 'active').length}</span></div>
          </div>
          <a href="/kpi/warnings" className="mt-3 block text-center text-primary text-xs hover:underline">Xem cảnh báo →</a>
        </div>
      </div>

      {/* Kết xuất dữ liệu lương / thưởng (XV.6) */}
      {(() => {
        const cycles = cyclesData as any[];
        const previewData = rewardPreviewData;

        const gradeOrder = ['all', 'Xuất sắc', 'Tốt', 'Đạt', 'Cần cải thiện', 'Không đạt'];
        const gradeColorsLocal: Record<string, string> = {
          'Xuất sắc': '#4caf50',
          'Tốt': '#2196f3',
          'Đạt': '#ff9800',
          'Cần cải thiện': '#ffc107',
          'Không đạt': '#f44336',
        };

        return (
          <div className="card">
            <div className="card-header">
              <h3 className="text-white">Kết xuất dữ liệu chính sách (XV.6)</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Kỳ đánh giá</label>
                  <select
                    value={rewardCycle}
                    onChange={(e) => { setRewardCycle(e.target.value); setShowRewardPreview(false); }}
                    className="w-full px-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Chọn kỳ --</option>
                    {cycles.map((c: any) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Xếp loại tối thiểu</label>
                  <select
                    value={rewardGrade}
                    onChange={(e) => { setRewardGrade(e.target.value); setShowRewardPreview(false); }}
                    className="w-full px-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
                  >
                    {gradeOrder.map(g => (
                      <option key={g} value={g}>{g === 'all' ? 'Tất cả' : g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Định dạng</label>
                  <select
                    value={rewardFormat}
                    onChange={(e) => setRewardFormat(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRewardPreview(true)}
                  disabled={!rewardCycle}
                  className={`btn-primary flex items-center gap-2 ${!rewardCycle ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Plus size={16} />
                  Xem trước
                </button>
                <button
                  onClick={() => {
                    const headers = ['Họ tên', 'Mã NV', 'Đơn vị', 'Điểm', 'Xếp loại', 'Hệ số lương', 'Thành tiền'];
                    const rows = previewData.map(r => [
                      r.fullName, r.employeeCode, r.unitName, String(r.score), r.grade, String(r.coeff), String(r.amount),
                    ]);
                    downloadCsv('ket-xuat-luong-thuong.csv', headers, rows);
                  }}
                  disabled={!rewardCycle || previewData.length === 0}
                  className={`px-4 py-2 bg-accent-green text-white rounded-lg text-sm flex items-center gap-2 hover:opacity-90 ${!rewardCycle || previewData.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Download size={16} /> Kết xuất
                </button>
              </div>
              {showRewardPreview && previewData.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-text-light mb-2">
                    Hiển thị {previewData.length} kết quả
                    {previewData.length >= 50 && ' (tối đa 50)'}
                  </p>
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Họ tên</th>
                          <th>Mã NV</th>
                          <th>Đơn vị</th>
                          <th>Điểm</th>
                          <th>Xếp loại</th>
                          <th>Hệ số</th>
                          <th>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((r, i) => (
                          <tr key={i}>
                            <td className="font-medium text-sm">{r.fullName}</td>
                            <td className="text-sm">{r.employeeCode}</td>
                            <td className="text-sm">{r.unitName}</td>
                            <td className="text-sm">{r.score}</td>
                            <td>
                              <span className="badge" style={{ backgroundColor: `${gradeColorsLocal[r.grade] || '#888'}20`, color: gradeColorsLocal[r.grade] || '#888' }}>
                                {r.grade}
                              </span>
                            </td>
                            <td className="text-sm">{r.coeff}</td>
                            <td className="text-sm font-medium">{r.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {showRewardPreview && previewData.length === 0 && (
                <div className="mt-4 p-8 text-center text-text-light border border-dashed border-border rounded-lg">
                  Không có dữ liệu phù hợp với bộ lọc đã chọn.
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
