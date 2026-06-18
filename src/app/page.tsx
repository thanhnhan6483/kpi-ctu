'use client';

import { useState } from 'react';
import { BarChart2, TrendingUp, Users, FileText, AlertTriangle, CheckCircle, Building, Clock, Eye, ChevronDown, Award, BookOpen, Globe, Laptop, Landmark } from 'lucide-react';

const stats = [
  { label: 'Tổng KPI cấp Trường', value: '23', icon: BarChart2, color: 'bg-primary' },
  { label: 'KPI đã đạt', value: '15', icon: CheckCircle, color: 'bg-accent-green' },
  { label: 'KPI cần cải thiện', value: '5', icon: AlertTriangle, color: 'bg-accent-yellow' },
  { label: 'KPI chưa đạt', value: '3', icon: AlertTriangle, color: 'bg-accent-red' },
];

const kpiCategories = [
  { name: 'Đào tạo & ĐBCLGD', weight: 35, achieved: 28, color: '#00afef', icon: BookOpen },
  { name: 'KHCN & ĐMST', weight: 30, achieved: 22, color: '#4caf50', icon: Award },
  { name: 'Đội ngũ & phát triển GV', weight: 10, achieved: 8, color: '#ff9800', icon: Users },
  { name: 'Quốc tế hóa', weight: 8, achieved: 6, color: '#9c27b0', icon: Globe },
  { name: 'Quản trị & tài chính', weight: 10, achieved: 7, color: '#f44336', icon: Landmark },
  { name: 'Chuyển đổi số', weight: 7, achieved: 5, color: '#00bcd4', icon: Laptop },
];

const recentActivities = [
  { id: 1, action: 'Cập nhật kết quả', kpi: 'CTU-KPI-05', user: 'Phòng Đào tạo', time: '2 giờ trước', type: 'update' },
  { id: 2, action: 'Nộp minh chứng', kpi: 'CTU-KPI-13', user: 'Phòng KHCN', time: '3 giờ trước', type: 'evidence' },
  { id: 3, action: 'Duyệt đánh giá', kpi: 'CTU-KPI-22', user: 'Trung tâm CNTT', time: '5 giờ trước', type: 'approve' },
  { id: 4, action: 'Yêu cầu chỉnh sửa', kpi: 'CTU-KPI-01', user: 'Phòng TCCB', time: '1 ngày trước', type: 'revision' },
  { id: 5, action: 'Phê duyệt kế hoạch', kpi: 'Kế hoạch Khoa CNTT', user: 'Ban Giám hiệu', time: '2 ngày trước', type: 'plan' },
  { id: 6, action: 'Khóa kết quả', kpi: 'Đánh giá TT CNTT', user: 'Hội đồng KPI', time: '3 ngày trước', type: 'lock' },
];

const warnings = [
  { kpi: 'CTU-KPI-19', name: 'Số lượng SV quốc tế', status: 'Chưa đạt 70%', deadline: '30/06/2026', progress: 93 },
  { kpi: 'CTU-KPI-16', name: 'Đề tài NCKH hợp tác', status: 'Thiếu minh chứng', deadline: '15/07/2026', progress: 90 },
  { kpi: 'CTU-KPI-07', name: 'CTĐT tự đánh giá', status: 'Chờ phê duyệt', deadline: '01/08/2026', progress: 86 },
  { kpi: 'CTU-KPI-01', name: 'GV có trình độ TS', status: 'Chưa đạt 90%', deadline: '30/06/2026', progress: 88 },
];

const unitPerformance = [
  { name: 'Trung tâm CNTT', score: 91, grade: 'Xuất sắc', kpiCount: 10, achieved: 9 },
  { name: 'Phòng Đào tạo', score: 84, grade: 'Tốt', kpiCount: 10, achieved: 8 },
  { name: 'Phòng ĐBCL', score: 87, grade: 'Tốt', kpiCount: 10, achieved: 8 },
  { name: 'Phòng KHCN', score: 79, grade: 'Đạt', kpiCount: 10, achieved: 7 },
  { name: 'Phòng TCCB', score: 75, grade: 'Đạt', kpiCount: 9, achieved: 5 },
  { name: 'Khoa CNTT', score: 78, grade: 'Đạt', kpiCount: 11, achieved: 6 },
];

const gradeColors: Record<string, string> = {
  'Xuất sắc': '#4caf50',
  'Tốt': '#2196f3',
  'Đạt': '#ff9800',
  'Cần cải thiện': '#ffc107',
  'Không đạt': '#f44336',
};

type ViewMode = 'overview' | 'units' | 'individuals';

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">
            Tổng quan Hệ thống KPI
          </h1>
          <p className="text-text-light mt-1">Năm học 2025-2026 | Đại học Cần Thơ</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white border border-border rounded-lg overflow-hidden">
            {(['overview', 'units', 'individuals'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === mode ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'
                }`}
              >
                {mode === 'overview' ? 'Tổng quan' : mode === 'units' ? 'Theo đơn vị' : 'Theo cá nhân'}
              </button>
            ))}
          </div>
          <a href="/reports" className="btn-secondary text-sm">Xuất báo cáo</a>
          <a href="/kpi/progress" className="btn-primary text-sm">Cập nhật KPI</a>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-light text-sm">{stat.label}</p>
                  <p className="kpi-number text-2xl mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-white">Tiến độ theo lĩnh vực</h3>
            <span className="text-white/80 text-sm">Tổng trọng số: 100%</span>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {kpiCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon size={14} style={{ color: cat.color }} />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <span className="text-sm text-text-light">
                        {cat.achieved}/{cat.weight} ({Math.round(cat.achieved / cat.weight * 100)}%)
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(cat.achieved / cat.weight * 100)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-white">Cảnh báo sớm</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {warnings.map((w) => (
                <div key={w.kpi} className="p-3 bg-bg-cream rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-accent-yellow" />
                    <a href={`/kpi/progress?indicatorId=${w.kpi}`} className="font-medium text-sm text-primary hover:underline">{w.kpi}</a>
                  </div>
                  <p className="text-sm text-text-dark">{w.name}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-light">Tiến độ</span>
                      <span className="text-xs font-medium">{w.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${w.progress}%`,
                          backgroundColor: w.progress >= 90 ? '#ffc107' : '#f44336',
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-accent-red font-medium">{w.status}</span>
                    <span className="text-xs text-text-light">Hạn: {w.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-white">Xếp hạng đơn vị</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {unitPerformance.map((unit, idx) => (
                <div key={unit.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-cream">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx < 3 ? 'bg-primary text-white' : 'bg-gray-100 text-text-light'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <a href="/kpi/evaluation" className="font-medium text-sm text-text-dark hover:text-primary">{unit.name}</a>
                      <span className="text-sm font-bold" style={{ color: gradeColors[unit.grade] }}>
                        {unit.score}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="progress-bar flex-1">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${unit.score}%`,
                            backgroundColor: gradeColors[unit.grade],
                          }}
                        />
                      </div>
                      <span className="text-xs" style={{ color: gradeColors[unit.grade] }}>{unit.grade}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-white">Hoạt động gần đây</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const typeColors: Record<string, string> = {
                  update: '#2196f3',
                  evidence: '#4caf50',
                  approve: '#4caf50',
                  revision: '#ff9800',
                  plan: '#9c27b0',
                  lock: '#607d8b',
                };
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-bg-cream">
                    <div className="mt-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: typeColors[activity.type] }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <a href={activity.type === 'update' ? '/kpi/progress' : activity.type === 'evidence' ? '/kpi/evidences' : activity.type === 'lock' ? '/kpi/evaluation' : '/kpi/approvals'} className="font-medium text-sm text-text-dark hover:text-primary">{activity.action}</a>
                        <span className="badge badge-info text-[10px]">{activity.kpi}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-text-light">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-white">Bảng xếp loại KPI cấp Trường</h3>
        </div>
        <div className="p-0">
          <table className="table">
            <thead>
              <tr>
                <th>Mã KPI</th>
                <th>Tên KPI</th>
                <th>Lĩnh vực</th>
                <th>Chỉ tiêu</th>
                <th>Thực tế</th>
                <th>Tỷ lệ</th>
                <th>Trọng số</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'CTU-KPI-01', name: 'Tỉ lệ GV có trình độ TS', group: 'Đội ngũ', target: '59%', actual: '52%', rate: 88, weight: 5 },
                { id: 'CTU-KPI-02', name: 'Tỉ lệ học phần trực tuyến', group: 'Đào tạo', target: '10%', actual: '12%', rate: 120, weight: 4 },
                { id: 'CTU-KPI-05', name: 'Tỉ lệ tuyển sinh ĐH', group: 'Đào tạo', target: '90%', actual: '92%', rate: 102, weight: 5 },
                { id: 'CTU-KPI-06', name: 'Tỉ lệ SV tốt nghiệp đúng hạn', group: 'Đào tạo', target: '80%', actual: '75%', rate: 94, weight: 5 },
                { id: 'CTU-KPI-13', name: 'Số công bố/GV', group: 'KHCN', target: '1.6', actual: '1.4', rate: 88, weight: 5 },
                { id: 'CTU-KPI-19', name: 'Số SV quốc tế', group: 'Quốc tế', target: '700', actual: '650', rate: 93, weight: 4 },
                { id: 'CTU-KPI-22', name: 'Tỉ lệ quy trình online', group: 'CĐS', target: '80%', actual: '85%', rate: 106, weight: 4 },
                { id: 'CTU-KPI-23', name: 'Văn bản ký số', group: 'CĐS', target: '100%', actual: '95%', rate: 95, weight: 3 },
              ].map((kpi) => {
                const isAchieved = kpi.rate >= 100;
                const isWarning = kpi.rate >= 80 && kpi.rate < 100;
                return (
                  <tr key={kpi.id}>
                    <td><a href={`/kpi/progress?indicatorId=${kpi.id}`}><span className="badge badge-info hover:bg-primary-light">{kpi.id}</span></a></td>
                    <td className="font-medium">{kpi.name}</td>
                    <td className="text-sm">{kpi.group}</td>
                    <td>{kpi.target}</td>
                    <td className="font-bold">{kpi.actual}</td>
                    <td>
                      <span className={`font-medium ${isAchieved ? 'text-accent-green' : isWarning ? 'text-accent-yellow' : 'text-accent-red'}`}>
                        {kpi.rate}%
                      </span>
                    </td>
                    <td>{kpi.weight}%</td>
                    <td>
                      <span className={`badge ${isAchieved ? 'badge-success' : isWarning ? 'badge-warning' : 'badge-danger'}`}>
                        {isAchieved ? 'Đạt' : isWarning ? 'Cần cải thiện' : 'Chưa đạt'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
