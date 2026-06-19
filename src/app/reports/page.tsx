'use client';

import { useState } from 'react';
import { FileText, Download, Filter, Calendar, BarChart2, PieChart, TrendingUp, Users, Award, AlertTriangle, Building, Clock, User, FileWarning } from 'lucide-react';
import progressData from '@/data/progress.json';
import evidencesData from '@/data/evidences.json';
import planItemsData from '@/data/plan-items.json';
import unitsData from '@/data/units.json';
import usersData from '@/data/users.json';

const reportTypes = [
  { id: 'summary', name: 'Báo cáo tổng hợp KPI', description: 'Tổng điểm, mức xếp loại, KPI đạt/chưa đạt', icon: FileText, priority: 'high' },
  { id: 'progress', name: 'Báo cáo tiến độ KPI', description: 'Tiến độ từng KPI, % hoàn thành', icon: TrendingUp, priority: 'high' },
  { id: 'evidence', name: 'Báo cáo minh chứng', description: 'Tình trạng minh chứng, hồ sơ thiếu', icon: FileText, priority: 'medium' },
  { id: 'warning', name: 'Báo cáo KPI chưa đạt', description: 'Nguyên nhân, giải pháp, thời hạn khắc phục', icon: AlertTriangle, priority: 'high' },
  { id: 'compare', name: 'Báo cáo so sánh đơn vị', description: 'So sánh các đơn vị cùng nhóm', icon: PieChart, priority: 'medium' },
  { id: 'trend', name: 'Báo cáo xu hướng 3 năm', description: 'Xu hướng KPI theo thời gian', icon: BarChart2, priority: 'low' },
  { id: 'reward', name: 'Báo cáo thi đua/xếp loại', description: 'Điểm KPI, xếp loại, đề xuất khen thưởng', icon: Award, priority: 'high' },
  { id: 'improvement', name: 'Báo cáo cải tiến chất lượng', description: 'KPI chưa đạt, nguyên nhân, kế hoạch', icon: TrendingUp, priority: 'medium' },
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
    </div>
  );
}
