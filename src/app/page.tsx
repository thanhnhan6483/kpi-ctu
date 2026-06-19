'use client';

import { useState, useEffect } from 'react';
import {
  BarChart2, TrendingUp, Users, FileText, AlertTriangle, CheckCircle,
  Building, Clock, Award, BookOpen, Globe, Laptop, Landmark, Heart,
  Target, Activity, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { calcCompletionRate } from '@/lib/kpi';
import indicatorsData from '@/data/indicators.json';
import kpiGroupsData from '@/data/kpi-groups.json';
import unitKPIsData from '@/data/unit-kpis.json';
import academicYears from '@/data/academic-years.json';

const demoActual: Record<string, number> = {
  'CTU-KPI-01': 52, 'CTU-KPI-02': 12, 'CTU-KPI-03': 8, 'CTU-KPI-04': 11,
  'CTU-KPI-05': 92, 'CTU-KPI-06': 75, 'CTU-KPI-07': 12, 'CTU-KPI-08': 88,
  'CTU-KPI-09': 72, 'CTU-KPI-10': 85, 'CTU-KPI-11': 68, 'CTU-KPI-12': 11,
  'CTU-KPI-13': 1.4, 'CTU-KPI-14': 0.5, 'CTU-KPI-15': 10, 'CTU-KPI-16': 18,
  'CTU-KPI-17': 380, 'CTU-KPI-18': 12, 'CTU-KPI-19': 650, 'CTU-KPI-20': 95,
  'CTU-KPI-21': 12, 'CTU-KPI-22': 85, 'CTU-KPI-23': 95,
  'DT-01': 92, 'DT-02': 98, 'DT-03': 92, 'DT-04': 12, 'DT-05': 78,
  'DT-06': 96, 'DT-07': 88, 'DT-08': 4.2, 'DT-09': 100, 'DT-10': 92,
  'KHCN-01': 1.4, 'KHCN-02': 0.5, 'KHCN-03': 10, 'KHCN-04': 18,
  'KHCN-05': 380, 'KHCN-06': 88, 'KHCN-07': 11, 'KHCN-08': 85,
  'KHCN-09': 8, 'KHCN-10': 92,
  'TCCB-01': 52, 'TCCB-02': 12, 'TCCB-03': 92, 'TCCB-04': 98,
  'TCCB-05': 100, 'TCCB-06': 75, 'TCCB-07': 88, 'TCCB-08': 95, 'TCCB-09': 3.8,
  'CNTT-01': 85, 'CNTT-02': 99.5, 'CNTT-03': 92, 'CNTT-04': 88,
  'CNTT-05': 65, 'CNTT-06': 100, 'CNTT-07': 100, 'CNTT-08': 4.1,
  'CNTT-09': 85, 'CNTT-10': 3,
  'GV-01': 105, 'GV-02': 85, 'GV-03': 92, 'GV-04': 1, 'GV-05': 2,
  'GV-06': 2, 'GV-07': 1,
  'NCV-01': 2, 'NCV-02': 1, 'NCV-03': 2, 'NCV-04': 90,
  'NCV-05': 1, 'NCV-06': 88, 'NCV-07': 1,
  'CV-01': 92, 'CV-02': 98, 'CV-03': 95, 'CV-04': 4.2, 'CV-05': 1, 'CV-06': 100,
};

const groupConfig: Record<string, { label: string; short: string; icon: any; color: string }> = {
  grp_dao_tao: { label: 'Đào tạo & ĐBCLGD', short: 'Đào tạo', icon: BookOpen, color: '#00afef' },
  grp_khcn: { label: 'KHCN, ĐMST & SHTT', short: 'KHCN', icon: Award, color: '#4caf50' },
  grp_doi_ngu: { label: 'Đội ngũ & PT Giảng viên', short: 'Đội ngũ', icon: Users, color: '#ff9800' },
  grp_quoc_te: { label: 'Hợp tác Quốc tế', short: 'Quốc tế', icon: Globe, color: '#9c27b0' },
  grp_quan_tri: { label: 'Quản trị & Tài chính', short: 'Quản trị', icon: Landmark, color: '#f44336' },
  grp_chuyen_so: { label: 'Chuyển đổi Số', short: 'CĐS', icon: Laptop, color: '#00bcd4' },
  grp_phuc_vu: { label: 'Phục vụ Cộng đồng', short: 'Phục vụ', icon: Heart, color: '#e91e63' },
};

const gradeColors: Record<string, string> = {
  'Xuất sắc': '#4caf50', 'Tốt': '#2196f3', 'Đạt': '#ff9800',
  'Cần cải thiện': '#ffc107', 'Không đạt': '#f44336',
};

const recentActivities = [
  { id: 1, action: 'Cập nhật kết quả', kpi: 'CTU-KPI-05', user: 'Phòng Đào tạo', time: '2 giờ trước', type: 'update' },
  { id: 2, action: 'Nộp minh chứng', kpi: 'CTU-KPI-13', user: 'Phòng KHCN', time: '3 giờ trước', type: 'evidence' },
  { id: 3, action: 'Duyệt đánh giá', kpi: 'CTU-KPI-22', user: 'Trung tâm CNTT', time: '5 giờ trước', type: 'approve' },
  { id: 4, action: 'Yêu cầu chỉnh sửa', kpi: 'CTU-KPI-01', user: 'Phòng TCCB', time: '1 ngày trước', type: 'revision' },
  { id: 5, action: 'Phê duyệt kế hoạch', kpi: 'Kế hoạch Khoa CNTT', user: 'Ban Giám hiệu', time: '2 ngày trước', type: 'plan' },
  { id: 6, action: 'Khóa kết quả', kpi: 'Đánh giá TT CNTT', user: 'Hội đồng KPI', time: '3 ngày trước', type: 'lock' },
];

const unitPerformance = [
  { name: 'Trung tâm CNTT', score: 91, grade: 'Xuất sắc', kpiCount: 10, achieved: 9 },
  { name: 'Phòng Đào tạo', score: 84, grade: 'Tốt', kpiCount: 10, achieved: 8 },
  { name: 'Phòng ĐBCL', score: 87, grade: 'Tốt', kpiCount: 10, achieved: 8 },
  { name: 'Phòng KHCN', score: 79, grade: 'Đạt', kpiCount: 10, achieved: 7 },
  { name: 'Phòng TCCB', score: 75, grade: 'Đạt', kpiCount: 9, achieved: 5 },
  { name: 'Khoa CNTT', score: 78, grade: 'Đạt', kpiCount: 11, achieved: 6 },
];

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0; const end = value;
    const step = Math.max(1, Math.ceil(end / 60));
    const timer = setInterval(() => {
      start += step; if (start >= end) { start = end; clearInterval(timer); }
      setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

export default function DashboardPage() {
  const [selectedYearId, setSelectedYearId] = useState('ay002');

  const activeYear = academicYears.find(y => y.id === selectedYearId)!;
  const yearIndicators = indicatorsData.filter(i => i.academicYearId === selectedYearId);
  const yearGroups = kpiGroupsData.filter(g => g.academicYearId === selectedYearId);
  const yearUnitKPIs = unitKPIsData.filter(u => u.academicYearId === selectedYearId);

  const indicatorRates = yearIndicators.map(ind => {
    const actual = demoActual[ind.code] ?? 0;
    const target = ind.targetValue ?? 0;
    const rawRate = target > 0 ? calcCompletionRate(actual, target, ind.direction as 'higher_better' | 'lower_better') : 0;
    return { ...ind, actual, rawRate: Math.round(rawRate), displayRate: Math.min(Math.round(rawRate), 120) };
  });

  const totalWeight = indicatorRates.reduce((s, i) => s + i.weight, 0);
  const achieved = indicatorRates.filter(i => i.rawRate >= 100).length;
  const warning = indicatorRates.filter(i => i.rawRate >= 80 && i.rawRate < 100).length;
  const notAchieved = indicatorRates.filter(i => i.rawRate < 80).length;

  const overallRate = totalWeight > 0
    ? indicatorRates.reduce((s, i) => s + Math.min(i.rawRate, 120) * i.weight, 0) / totalWeight
    : 0;

  const groupStats = yearGroups.map(g => {
    const items = indicatorRates.filter(i => i.categoryId === g.id);
    const gw = items.reduce((s, i) => s + i.weight, 0);
    const rate = gw > 0 ? items.reduce((s, i) => s + Math.min(i.rawRate, 120) * i.weight, 0) / gw : 0;
    const cfg = groupConfig[g.id] || { label: g.name, short: g.name, icon: BarChart2, color: '#666' };
    return { ...g, ...cfg, items, groupWeight: gw, rate: Math.round(rate) };
  });

  const pieData = [
    { name: 'Đạt', value: achieved, color: '#4caf50' },
    { name: 'Cần cải thiện', value: warning, color: '#ffc107' },
    { name: 'Chưa đạt', value: notAchieved, color: '#f44336' },
  ].filter(d => d.value > 0);

  const barData = groupStats.map(g => ({ name: g.short, rate: g.rate, fill: g.color }));

  const radarData = groupStats.map(g => ({ category: g.short, 'Thực tế': g.rate, 'Mục tiêu': 100 }));

  const warningItems = indicatorRates
    .filter(i => i.rawRate < 100).sort((a, b) => a.rawRate - b.rawRate).slice(0, 4);

  const typeColors: Record<string, string> = {
    update: '#2196f3', evidence: '#4caf50', approve: '#4caf50',
    revision: '#ff9800', plan: '#9c27b0', lock: '#607d8b',
  };

  const completionStatus = (rate: number) => {
    if (rate >= 100) return { label: 'Đạt', color: 'text-accent-green', badge: 'badge-success' };
    if (rate >= 80) return { label: 'Cần cải thiện', color: 'text-accent-yellow', badge: 'badge-warning' };
    return { label: 'Chưa đạt', color: 'text-accent-red', badge: 'badge-danger' };
  };

  const healthColor = (rate: number) => {
    if (rate >= 100) return 'bg-accent-green';
    if (rate >= 80) return 'bg-accent-yellow';
    return 'bg-accent-red';
  };

  const sortedIndicators = [...indicatorRates].sort((a, b) => a.rawRate - b.rawRate);

  const unitCount = yearUnitKPIs.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Tổng quan Hệ thống KPI</h1>
          <p className="text-text-light mt-1">Đại học Cần Thơ — {activeYear?.name || ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-border rounded-lg overflow-hidden">
            {academicYears.map(ay => (
              <button key={ay.id} onClick={() => setSelectedYearId(ay.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${selectedYearId === ay.id ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>
                {ay.name}
              </button>
            ))}
          </div>
          <a href="/reports" className="btn-secondary text-sm">Xuất báo cáo</a>
          <a href="/kpi/progress" className="btn-primary text-sm">Cập nhật KPI</a>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Tổng KPI cấp Trường', value: indicatorRates.length, icon: BarChart2, color: 'bg-primary' },
          { label: 'KPI đã đạt', value: achieved, icon: CheckCircle, color: 'bg-accent-green' },
          { label: 'Cần cải thiện', value: warning, icon: AlertTriangle, color: 'bg-accent-yellow' },
          { label: 'KPI chưa đạt', value: notAchieved, icon: AlertTriangle, color: 'bg-accent-red' },
          { label: 'Đơn vị tham gia', value: unitCount, icon: Building, color: 'bg-primary' },
          { label: 'Điểm tổng thể', value: Math.round(overallRate), icon: Target, color: 'bg-primary' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-4 flex items-center justify-between">
              <div>
                <p className="text-text-light text-xs font-medium uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-heading font-bold text-primary mt-1">
                  {stat.label === 'Điểm tổng thể'
                    ? <><AnimatedNumber value={stat.value as number} />%</>
                    : stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} shrink-0`}>
                <Icon size={22} className="text-white" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-4 flex flex-col items-center justify-center">
          <h3 className="font-heading font-bold text-sm text-text-dark mb-3 self-start">Phân loại KPI</h3>
          <div className="relative">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie data={pieData.length > 0 ? pieData : [{ name: 'Chưa có dữ liệu', value: 1, color: '#e0e0e0' }]}
                  cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" stroke="none">
                  {(pieData.length > 0 ? pieData : [{ name: 'Chưa có dữ liệu', value: 1, color: '#e0e0e0' }]).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} KPI`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-heading font-bold text-primary">
                <AnimatedNumber value={Math.round(overallRate)} />%
              </span>
              <span className="text-[10px] text-text-light mt-0.5">hoàn thành</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.name}</span>
                <span className="font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 lg:col-span-1">
          <h3 className="font-heading font-bold text-sm text-text-dark mb-3">Hoàn thành theo lĩnh vực</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 120]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v}%`, 'Hoàn thành']} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="font-heading font-bold text-sm text-text-dark mb-3">Đa chiều lĩnh vực</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <PolarGrid stroke="#e0e0e0" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 120]} tick={{ fontSize: 9 }} />
              <Radar name="Mục tiêu" dataKey="Mục tiêu" stroke="#e0e0e0" fill="#e0e0e0" fillOpacity={0.1} />
              <Radar name="Thực tế" dataKey="Thực tế" stroke="#0d47a1" fill="#0d47a1" fillOpacity={0.15} />
              <Tooltip formatter={(v) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-white">Ma trận sức khỏe KPI cấp Trường</h3>
            <span className="text-white/80 text-sm">{indicatorRates.length} chỉ tiêu</span>
          </div>
          <div className="p-4">
            {groupStats.map(g => {
              const Icon = g.icon;
              return (
                <div key={g.id} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} style={{ color: g.color }} />
                    <span className="text-sm font-medium text-text-dark">{g.label}</span>
                    <span className="text-xs text-text-light">({g.items.length} KPI · {g.groupWeight}%)</span>
                    <span className={`ml-auto text-xs font-bold ${g.rate >= 100 ? 'text-accent-green' : g.rate >= 80 ? 'text-accent-yellow' : 'text-accent-red'}`}>
                      {g.rate}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                    {g.items.map(ind => (
                      <a key={ind.id} href={`/kpi/progress?indicatorId=${ind.code}`}
                        className={`${healthColor(ind.rawRate)}/85 rounded-lg p-2 text-white hover:brightness-110 transition-all`}>
                        <div className="text-[10px] font-bold opacity-80">{ind.code}</div>
                        <div className="text-sm font-bold">{Math.min(ind.rawRate, 999)}%</div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-white">Cảnh báo sớm</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {warningItems.length === 0 && (
                <p className="text-sm text-text-light text-center py-4">Không có cảnh báo</p>
              )}
              {warningItems.map(w => {
                const st = completionStatus(w.rawRate);
                return (
                  <div key={w.id} className="p-3 bg-bg-cream rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={14} className="text-accent-yellow" />
                      <a href={`/kpi/progress?indicatorId=${w.code}`} className="font-medium text-sm text-primary hover:underline">{w.code}</a>
                    </div>
                    <p className="text-sm text-text-dark line-clamp-2">{w.name}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-light">Hoàn thành</span>
                        <span className="text-xs font-medium">{w.displayRate}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${Math.min(w.displayRate, 100)}%`,
                          backgroundColor: w.displayRate >= 80 ? '#ffc107' : '#f44336',
                        }} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`badge ${st.badge} text-[10px]`}>{st.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <a href="/kpi/evaluation" className="font-medium text-sm text-text-dark hover:text-primary truncate">{unit.name}</a>
                      <span className="text-sm font-bold shrink-0 ml-2" style={{ color: gradeColors[unit.grade] }}>
                        {unit.score}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="progress-bar flex-1">
                        <div className="progress-fill" style={{
                          width: `${unit.score}%`,
                          backgroundColor: gradeColors[unit.grade],
                        }} />
                      </div>
                      <span className="text-xs shrink-0" style={{ color: gradeColors[unit.grade] }}>{unit.grade}</span>
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
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-bg-cream">
                  <div className="mt-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: typeColors[activity.type] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <a href={activity.type === 'update' ? '/kpi/progress' : activity.type === 'evidence' ? '/kpi/evidences' : activity.type === 'lock' ? '/kpi/evaluation' : '/kpi/approvals'}
                        className="font-medium text-sm text-text-dark hover:text-primary truncate">{activity.action}</a>
                      <span className="badge badge-info text-[10px] shrink-0">{activity.kpi}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-light">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-white">Bảng xếp loại KPI cấp Trường</h3>
          <span className="text-white/80 text-sm">Sắp xếp theo tỷ lệ hoàn thành</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Mã KPI</th>
                <th>Tên KPI</th>
                <th>Lĩnh vực</th>
                <th className="text-right">Chỉ tiêu</th>
                <th className="text-right">Thực tế</th>
                <th className="text-right">Tỷ lệ</th>
                <th className="text-right">Trọng số</th>
                <th className="text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {sortedIndicators.map(kpi => {
                const st = completionStatus(kpi.rawRate);
                const grp = groupConfig[kpi.categoryId];
                return (
                  <tr key={kpi.id}>
                    <td><a href={`/kpi/progress?indicatorId=${kpi.code}`}><span className="badge badge-info hover:bg-primary-light cursor-pointer">{kpi.code}</span></a></td>
                    <td className="font-medium max-w-xs truncate" title={kpi.name}>{kpi.name}</td>
                    <td className="text-sm">{grp?.short || kpi.categoryId}</td>
                    <td className="text-right font-mono text-sm">{kpi.targetValue}{kpi.unit}</td>
                    <td className="text-right font-bold font-mono text-sm">{kpi.actual}{kpi.unit}</td>
                    <td className="text-right">
                      <span className={`font-bold font-mono text-sm ${st.color}`}>
                        {kpi.displayRate}%
                      </span>
                    </td>
                    <td className="text-right font-mono text-sm">{kpi.weight}%</td>
                    <td className="text-center">
                      <span className={`badge ${st.badge}`}>{st.label}</span>
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
