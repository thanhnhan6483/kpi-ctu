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
import progressData from '@/data/progress.json';

const groupConfig: Record<string, { label: string; short: string; icon: any; color: string }> = {
  grp_dao_tao: { label: 'Đào tạo & ĐBCLGD', short: 'Đào tạo', icon: BookOpen, color: '#00afef' },
  grp_khcn: { label: 'KHCN, ĐMST & SHTT', short: 'KHCN', icon: Award, color: '#4caf50' },
  grp_doi_ngu: { label: 'Đội ngũ & PT Giảng viên', short: 'Đội ngũ', icon: Users, color: '#ff9800' },
  grp_quoc_te: { label: 'Hợp tác Quốc tế', short: 'Quốc tế', icon: Globe, color: '#9c27b0' },
  grp_quan_tri: { label: 'Quản trị & Tài chính', short: 'Quản trị', icon: Landmark, color: '#f44336' },
  grp_chuyen_so: { label: 'Chuyển đổi Số', short: 'CĐS', icon: Laptop, color: '#00bcd4' },
  grp_phuc_vu: { label: 'Phục vụ Cộng đồng', short: 'Phục vụ', icon: Heart, color: '#e91e63' },
};

const groupConfigByName: Record<string, { label: string; short: string; icon: any; color: string }> = {};
kpiGroupsData
  .filter(g => g.academicYearId === 'ay002')
  .forEach(g => { groupConfigByName[g.name] = groupConfig[g.id]; });

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

  const progressLookup: Record<string, number> = {};
  (progressData as Array<{ level: string; indicatorId: string; actualValue: number }>)
    .filter(p => p.level === 'school')
    .forEach(p => { progressLookup[p.indicatorId] = p.actualValue; });

  const indicatorRates = yearIndicators.map(ind => {
    const actual = progressLookup[ind.id] ?? 0;
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
    const cfg = groupConfig[g.id] || groupConfigByName[g.name] || { label: g.name, short: g.name, icon: BarChart2, color: '#666' };
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

  const unitProgressAll = (progressData as Array<{ level: string; indicatorName: string; actualValue: number }>)
    .filter(p => p.level === 'unit');

  const unitPerformance = yearUnitKPIs.map(unit => {
    const kpis = unit.kpis || [];
    const kpiRates = kpis.map(k => {
      const rec = unitProgressAll.find(p => p.indicatorName === k.name);
      const actual = rec ? rec.actualValue : 0;
      const target = k.target || 1;
      const rate = target > 0 ? Math.min((actual / target) * 100, 120) : 0;
      return { ...k, actual, rate };
    });
    const achieved = kpiRates.filter(k => k.rate >= 100).length;
    const totalWeight = kpis.reduce((s, k) => s + (k.weight || 1), 0);
    const weightedScore = kpiRates.reduce((s, k) => s + k.rate * (k.weight || 1), 0);
    const score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
    let grade = 'Không đạt';
    if (score >= 90) grade = 'Xuất sắc';
    else if (score >= 75) grade = 'Tốt';
    else if (score >= 60) grade = 'Đạt';
    else if (score >= 40) grade = 'Cần cải thiện';
    return { name: unit.name, score, grade, kpiCount: kpis.length, achieved };
  }).sort((a, b) => b.score - a.score);

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
          <a href="/api/reports/export?type=dashboard&format=csv" className="btn-secondary text-sm flex items-center gap-1" download>Xuất báo cáo</a>
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
            <h3 className="text-white">Bảng theo dõi KPI</h3>
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
                        className={`${healthColor(ind.rawRate)} rounded-lg p-2 text-white hover:brightness-110 transition-all`}>
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
      <div className="card">
        <div className="card-header">
          <h3 className="text-white flex items-center gap-2"><Building size={16} /> Heatmap so sánh đơn vị theo lĩnh vực</h3>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">Đơn vị</th>
                {groupStats.map(g => (
                  <th key={g.id} className="text-center py-2 px-3 font-medium text-xs">{g.short}</th>
                ))}
                <th className="text-center py-2 px-3 font-medium">TB</th>
              </tr>
            </thead>
            <tbody>
              {unitPerformance.slice(0, 8).map((unit, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2 px-3 font-medium text-xs">{unit.name}</td>
                  {groupStats.map(g => {
                    const unitItems = (unitKPIsData as any[]).find((u: any) => u.name === unit.name);
                    const groupKpis = unitItems?.kpis?.filter((k: any) => {
                      const ind = (indicatorsData as any[]).find((i: any) => i.id === k.indicatorId);
                      return ind?.categoryId === g.id;
                    }) || [];
                    const avg = groupKpis.length > 0 ? Math.round(groupKpis.reduce((s: number, k: any) => s + Math.min(((k.target || 1) > 0 ? ((progressLookup[k.name] ?? 0) / k.target) * 100 : 0), 120), 0) / groupKpis.length) : 0;
                    const bg = avg >= 100 ? 'bg-green-100 text-green-700' : avg >= 80 ? 'bg-yellow-100 text-yellow-700' : avg > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-50 text-gray-400';
                    return <td key={g.id} className={`text-center py-2 px-3 text-xs font-medium ${bg}`}>{groupKpis.length > 0 ? `${avg}%` : '-'}</td>;
                  })}
                  <td className={`text-center py-2 px-3 text-xs font-bold ${unit.score >= 80 ? 'text-green-600' : unit.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{unit.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
