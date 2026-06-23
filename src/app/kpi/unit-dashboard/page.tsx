'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Building, Users, Target, CheckCircle, AlertTriangle, TrendingUp,
  Award, BarChart2, FileText, Clock,
} from 'lucide-react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { calcCompletionRate, getGrade } from '@/lib/kpi';
import unitsData from '@/data/units.json';
import unitKPIsData from '@/data/unit-kpis.json';
import individualEvalsData from '@/data/individual-evaluations.json';
import progressData from '@/data/progress.json';
import cyclesData from '@/data/cycles.json';
import indicatorsData from '@/data/indicators.json';

type RoleLevel = 'department' | 'unit' | 'root';

const roleConfig: { key: RoleLevel; label: string; icon: any }[] = [
  { key: 'department', label: 'Bộ môn', icon: Building },
  { key: 'unit', label: 'Đơn vị', icon: Users },
  { key: 'root', label: 'Trường', icon: BarChart2 },
];

const groupConfig: Record<string, { label: string; short: string; color: string }> = {
  grp_dao_tao: { label: 'Đào tạo & ĐBCLGD', short: 'Đào tạo', color: '#00afef' },
  grp_khcn: { label: 'KHCN, ĐMST & SHTT', short: 'KHCN', color: '#4caf50' },
  grp_doi_ngu: { label: 'Đội ngũ & PT Giảng viên', short: 'Đội ngũ', color: '#ff9800' },
  grp_quoc_te: { label: 'Hợp tác Quốc tế', short: 'Quốc tế', color: '#9c27b0' },
  grp_quan_tri: { label: 'Quản trị & Tài chính', short: 'Quản trị', color: '#f44336' },
  grp_chuyen_so: { label: 'Chuyển đổi Số', short: 'CĐS', color: '#00bcd4' },
  grp_phuc_vu: { label: 'Phục vụ Cộng đồng', short: 'Phục vụ', color: '#e91e63' },
};

const gradeColors: Record<string, string> = {
  'Xuất sắc': '#4caf50', 'Tốt': '#2196f3', 'Đạt': '#ff9800',
  'Cần cải thiện': '#ffc107', 'Không đạt': '#f44336',
};

function completionStatus(rate: number) {
  if (rate >= 100) return { label: 'Đạt', color: 'text-accent-green', badge: 'badge-success' };
  if (rate >= 80) return { label: 'Cần cải thiện', color: 'text-accent-yellow', badge: 'badge-warning' };
  return { label: 'Chưa đạt', color: 'text-accent-red', badge: 'badge-danger' };
}

export default function UnitDashboardPage() {
  const [role, setRole] = useState<RoleLevel>('unit');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const units = useMemo(() => unitsData as any[], []);
  const unitKPIs = useMemo(() => unitKPIsData as any[], []);
  const evals = useMemo(() => individualEvalsData as any[], []);
  const progress = useMemo(() => progressData as any[], []);
  const cycles = useMemo(() => cyclesData as any[], []);
  const indicators = useMemo(() => indicatorsData as any[], []);

  const activeCycle = useMemo(() => cycles.find(c => c.status === 'active'), [cycles]);

  const unitMap = useMemo(() => {
    const m: Record<string, any> = {};
    units.forEach((u: any) => { m[u.id] = u; });
    return m;
  }, [units]);

  const childUnits = useMemo(() => {
    const m: Record<string, any[]> = {};
    units.forEach((u: any) => {
      const pid = u.parentId || 'root';
      if (!m[pid]) m[pid] = [];
      m[pid].push(u);
    });
    return m;
  }, [units]);

  const rootUnit = useMemo(() => units.find((u: any) => u.type === 'university'), [units]);

  const departments = useMemo(
    () => units.filter((u: any) => u.type === 'department'),
    [units],
  );

  const unitLevelUnits = useMemo(
    () => units.filter((u: any) => u.type === 'school' || u.type === 'faculty' || u.type === 'institute'),
    [units],
  );

  const unitScoreFromEvals = useMemo(() => {
    const unitScores: Record<string, { total: number; count: number; name: string }> = {};
    evals.forEach((e: any) => {
      const uid = e.unitId;
      const score = e.finalScore ?? e.councilScore ?? e.managerScore ?? e.selfScore;
      if (!uid || score == null) return;
      if (!unitScores[uid]) unitScores[uid] = { total: 0, count: 0, name: e.unitName };
      unitScores[uid].total += score;
      unitScores[uid].count += 1;
    });
    return unitScores;
  }, [evals]);

  const unitProgressByIndicator = useMemo(() => {
    const m: Record<string, number> = {};
    progress
      .filter((p: any) => p.level === 'unit')
      .forEach((p: any) => {
        m[p.indicatorName] = p.actualValue;
      });
    return m;
  }, [progress]);

  const getUnitName = (uid: string): string => {
    const u = unitMap[uid];
    if (u) return u.name;
    const uk = unitKPIs.find((k: any) => k.id === uid);
    return uk?.name || uid;
  };

  function calcUnitStats(unitId: string) {
    const unit = unitMap[unitId];
    if (!unit) return null;

    const ukEntry = unitKPIs.find((uk: any) => uk.name === unit.name || uk.code === unit.code);
    const kpis = ukEntry?.kpis || [];

    const kpiRows = kpis.map((k: any) => {
      const actual = unitProgressByIndicator[k.name] ?? 0;
      const target = k.target || 1;
      const ind = indicators.find((i: any) => i.id === k.indicatorId);
      const direction = ind?.direction || 'higher_better';
      const rawRate = target > 0 ? calcCompletionRate(actual, target, direction as 'higher_better' | 'lower_better') : 0;
      const rate = Math.round(rawRate);
      const catId = ind?.categoryId || '';
      const grp = groupConfig[catId];
      const st = completionStatus(rate);
      return {
        id: k.id,
        name: k.name,
        code: k.id,
        target,
        actual,
        unit: k.unit || '',
        weight: k.weight || 1,
        rate,
        displayRate: Math.min(rate, 120),
        status: st,
        categoryId: catId,
        groupName: grp?.short || '',
        direction,
      };
    });

    const totalWeight = kpis.reduce((s: number, k: any) => s + (k.weight || 1), 0);
    const weightedScore = kpiRows.reduce((s: number, r: any) => s + Math.min(r.rate, 120) * r.weight, 0);
    const avgScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;

    const achieved = kpiRows.filter((r: any) => r.rate >= 100).length;
    const warning = kpiRows.filter((r: any) => r.rate >= 80 && r.rate < 100).length;
    const notAchieved = kpiRows.filter((r: any) => r.rate < 80).length;

    const overdue = kpiRows.length;

    return { unit, kpiRows, avgScore, achieved, warning, notAchieved, total: kpiRows.length, overdue };
  }

  function calcChildRanking(parentId: string) {
    const children = childUnits[parentId] || [];
    return children.map((cu: any) => {
      const unitScores = Object.entries(unitScoreFromEvals)
        .filter(([uid]) => {
          const name = getUnitName(uid);
          return name === cu.name || uid === cu.id;
        });
      const scs = unitScores.map(([, v]) => v);
      const total = scs.reduce((s, v) => s + v.total, 0);
      const count = scs.reduce((s, v) => s + v.count, 0);
      const avg = count > 0 ? Math.round(total / count) : 0;
      const g = getGrade(avg);
      return { id: cu.id, name: cu.name, score: avg, grade: g.label, color: g.color, memberCount: count };
    }).sort((a, b) => b.score - a.score);
  }

  const selectedStats = useMemo(() => {
    if (!selectedUnitId) return null;
    return calcUnitStats(selectedUnitId);
  }, [selectedUnitId, unitScoreFromEvals, unitProgressByIndicator]);

  const selectedChildRanking = useMemo(() => {
    if (!selectedUnitId) return [];
    return calcChildRanking(selectedUnitId);
  }, [selectedUnitId, childUnits, unitScoreFromEvals]);

  const defaultUnitId = useMemo(() => {
    if (role === 'department' && departments.length > 0) return departments[0].id;
    if (role === 'unit' && unitLevelUnits.length > 0) return unitLevelUnits[0].id;
    if (role === 'root') return rootUnit?.id || (units.length > 0 ? units[0].id : null);
    return null;
  }, [role, departments, unitLevelUnits, rootUnit, units]);

  useEffect(() => {
    if (!selectedUnitId && defaultUnitId) {
      setSelectedUnitId(defaultUnitId);
    }
  }, [selectedUnitId, defaultUnitId]);

  const availableUnits = useMemo(() => {
    if (role === 'department') return departments;
    if (role === 'unit') return unitLevelUnits;
    return rootUnit ? [rootUnit] : [];
  }, [role, departments, unitLevelUnits, rootUnit]);

  const currentUnit = selectedUnitId ? unitMap[selectedUnitId] : null;

  const unitLevelStats = useMemo(() => {
    if (role !== 'root') return [];
    const parentId = rootUnit?.id;
    if (!parentId) return [];
    return calcChildRanking(parentId);
  }, [role, rootUnit, childUnits, unitScoreFromEvals]);

  const pieData = useMemo(() => {
    if (!selectedStats) return [];
    return [
      { name: 'Đạt', value: selectedStats.achieved, color: '#4caf50' },
      { name: 'Cần cải thiện', value: selectedStats.warning, color: '#ffc107' },
      { name: 'Chưa đạt', value: selectedStats.notAchieved, color: '#f44336' },
    ].filter(d => d.value > 0);
  }, [selectedStats]);

  const barData = useMemo(() => {
    if (!selectedStats) return [];
    const groupRates: Record<string, { sum: number; count: number; color: string; label: string }> = {};
    selectedStats.kpiRows.forEach((r: any) => {
      if (!r.groupName) return;
      if (!groupRates[r.groupName]) {
        const catCfg = groupConfig[r.categoryId] || { color: '#666', label: r.groupName };
        groupRates[r.groupName] = { sum: 0, count: 0, color: catCfg.color, label: catCfg.label };
      }
      groupRates[r.groupName].sum += r.rate;
      groupRates[r.groupName].count += 1;
    });
    return Object.entries(groupRates).map(([key, val]) => ({
      name: key,
      rate: val.count > 0 ? Math.round(val.sum / val.count) : 0,
      fill: val.color,
    }));
  }, [selectedStats]);

  const globalGrade = useMemo(() => {
    if (!selectedStats) return { label: '-', color: '#999' };
    const g = getGrade(selectedStats.avgScore);
    return { label: g.label, color: g.color };
  }, [selectedStats]);

  const filteredKPIRows = useMemo(() => {
    if (!selectedStats) return [];
    return selectedStats.kpiRows;
  }, [selectedStats]);

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUnitId(e.target.value);
  };

  const handleRoleSwitch = (r: RoleLevel) => {
    setRole(r);
    setSelectedUnitId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Dashboard đơn vị</h1>
          <p className="text-text-light mt-1">Tổng quan KPI đơn vị (XVII.2-XVII.3)</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white border border-border rounded-lg overflow-hidden">
            {roleConfig.map(r => (
              <button key={r.key} onClick={() => handleRoleSwitch(r.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${role === r.key ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>
                <r.icon size={14} /> {r.label}
              </button>
            ))}
          </div>
          <a href="/api/reports/export?type=unit-dashboard&format=csv"
            className="btn-secondary text-sm flex items-center gap-1" download>
            <FileText size={14} /> Xuất báo cáo
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-text-light">Chọn đơn vị:</label>
        <select value={selectedUnitId || ''} onChange={handleUnitChange}
          className="px-3 py-2 rounded-lg border border-border bg-white text-sm text-text-dark min-w-[220px]">
          {availableUnits.map((u: any) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        {currentUnit && (
          <span className={`badge ${role === 'department' ? 'badge-info' : role === 'unit' ? 'badge-success' : 'badge-warning'} text-xs`}>
            {currentUnit.type}
          </span>
        )}
      </div>

      {selectedStats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-light rounded-lg"><Target size={20} className="text-primary" /></div>
                <div><p className="text-text-light text-sm">Tổng KPI</p><p className="text-xl font-bold">{selectedStats.total}</p></div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div>
                <div><p className="text-text-light text-sm">Hoàn thành</p><p className="text-xl font-bold text-accent-green">{selectedStats.achieved}</p></div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-red/20 rounded-lg"><AlertTriangle size={20} className="text-accent-red" /></div>
                <div><p className="text-text-light text-sm">Chưa đạt</p><p className="text-xl font-bold text-accent-red">{selectedStats.notAchieved}</p></div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg"><Award size={20} className="text-blue-600" /></div>
                <div>
                  <p className="text-text-light text-sm">Điểm TB</p>
                  <p className="text-xl font-bold" style={{ color: globalGrade.color }}>
                    {selectedStats.avgScore}
                    <span className="text-sm ml-1 font-normal">({globalGrade.label})</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-4 flex flex-col items-center justify-center">
              <h3 className="font-heading font-bold text-sm text-text-dark mb-3 self-start">Phân loại KPI</h3>
              <div className="relative">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={pieData.length > 0 ? pieData : [{ name: 'Chưa có dữ liệu', value: 1, color: '#e0e0e0' }]}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                      {(pieData.length > 0 ? pieData : [{ name: 'Chưa có dữ liệu', value: 1, color: '#e0e0e0' }]).map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} KPI`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-heading font-bold text-primary">{selectedStats.avgScore}%</span>
                  <span className="text-[10px] text-text-light">TB</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.name}</span>
                    <span className="font-bold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4 lg:col-span-1">
              <h3 className="font-heading font-bold text-sm text-text-dark mb-3">Hoàn thành theo lĩnh vực</h3>
              <ResponsiveContainer width="100%" height={220}>
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
              {barData.length === 0 && (
                <p className="text-xs text-text-light text-center py-4">Chưa có dữ liệu theo lĩnh vực</p>
              )}
            </div>

            <div className="card p-4">
              <h3 className="font-heading font-bold text-sm text-text-dark mb-3 flex items-center gap-2">
                <TrendingUp size={14} /> Tiến độ chung
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-light">Tỷ lệ hoàn thành</span>
                    <span className="font-bold">{selectedStats.avgScore}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${Math.min(selectedStats.avgScore, 100)}%`,
                      backgroundColor: selectedStats.avgScore >= 80 ? '#4caf50' : selectedStats.avgScore >= 50 ? '#ffc107' : '#f44336',
                    }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-bg-cream rounded-lg">
                    <p className="text-lg font-bold text-accent-green">{selectedStats.achieved}</p>
                    <p className="text-[11px] text-text-light">Đã đạt</p>
                  </div>
                  <div className="p-3 bg-bg-cream rounded-lg">
                    <p className="text-lg font-bold text-accent-red">{selectedStats.notAchieved}</p>
                    <p className="text-[11px] text-text-light">Chưa đạt</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-bg-cream rounded-lg">
                  <Award size={16} style={{ color: globalGrade.color }} />
                  <span className="text-sm">Xếp loại: <strong style={{ color: globalGrade.color }}>{globalGrade.label}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card">
              <div className="card-header flex items-center justify-between">
                <h3 className="text-white">Danh sách KPI</h3>
                <span className="text-white/80 text-sm">{filteredKPIRows.length} chỉ tiêu</span>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Mã KPI</th>
                      <th>Tên KPI</th>
                      <th className="text-right">Chỉ tiêu</th>
                      <th className="text-right">Thực tế</th>
                      <th className="text-right">Tỷ lệ</th>
                      <th className="text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKPIRows.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-text-light">Chưa có KPI</td></tr>
                    ) : (
                      filteredKPIRows.map((kpi: any) => (
                        <tr key={kpi.id}>
                          <td><span className="badge badge-info">{kpi.code}</span></td>
                          <td className="font-medium max-w-xs truncate text-sm" title={kpi.name}>{kpi.name}</td>
                          <td className="text-right font-mono text-sm">{kpi.target}{kpi.unit}</td>
                          <td className="text-right font-bold font-mono text-sm">{kpi.actual}{kpi.unit}</td>
                          <td className="text-right">
                            <span className={`font-bold font-mono text-sm ${kpi.status.color}`}>
                              {kpi.displayRate}%
                            </span>
                          </td>
                          <td className="text-center">
                            <span className={`badge ${kpi.status.badge}`}>{kpi.status.label}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="text-white flex items-center gap-2"><BarChart2 size={14} /> Xếp hạng đơn vị</h3>
              </div>
              <div className="p-4">
                {selectedChildRanking.length === 0 ? (
                  <p className="text-sm text-text-light text-center py-4">Không có đơn vị con</p>
                ) : (
                  <div className="space-y-3">
                    {selectedChildRanking.map((cu, idx) => (
                      <div key={cu.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-cream">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx < 3 ? 'bg-primary text-white' : 'bg-gray-100 text-text-light'
                        }`}>{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-text-dark truncate">{cu.name}</span>
                            <span className="text-sm font-bold shrink-0 ml-2" style={{ color: cu.color }}>{cu.score}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="progress-bar flex-1">
                              <div className="progress-fill" style={{ width: `${Math.min(cu.score, 100)}%`, backgroundColor: cu.color }} />
                            </div>
                            <span className="text-xs shrink-0" style={{ color: cu.color }}>{cu.grade}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-4">
              <h3 className="font-heading font-bold text-sm mb-3 flex items-center gap-2">
                <Clock size={14} /> Chi tiết hoàn thành KPI
              </h3>
              <div className="space-y-3">
                {filteredKPIRows.slice(0, 8).map((kpi: any) => (
                  <div key={kpi.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-dark truncate mr-2">{kpi.name}</span>
                      <span className="font-bold shrink-0" style={{ color: kpi.status.color === 'text-accent-green' ? '#4caf50' : kpi.status.color === 'text-accent-yellow' ? '#ffc107' : '#f44336' }}>
                        {kpi.displayRate}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${Math.min(kpi.displayRate, 100)}%`,
                        backgroundColor: kpi.rate >= 100 ? '#4caf50' : kpi.rate >= 80 ? '#ffc107' : '#f44336',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <h3 className="font-heading font-bold text-sm mb-3 flex items-center gap-2">
                <AlertTriangle size={14} /> Cảnh báo
              </h3>
              <div className="space-y-2">
                {filteredKPIRows.filter((r: any) => r.rate < 100).length === 0 ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle size={14} className="text-accent-green" />
                    <span className="text-sm text-accent-green">Không có cảnh báo</span>
                  </div>
                ) : (
                  <>
                    {filteredKPIRows.filter((r: any) => r.rate < 80).slice(0, 5).map((kpi: any) => (
                      <div key={kpi.id} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                        <AlertTriangle size={14} className="text-accent-red shrink-0" />
                        <span className="text-sm text-accent-red truncate">{kpi.name}</span>
                        <span className="text-xs font-bold text-accent-red ml-auto shrink-0">{kpi.displayRate}%</span>
                      </div>
                    ))}
                    {filteredKPIRows.filter((r: any) => r.rate >= 80 && r.rate < 100).slice(0, 3).map((kpi: any) => (
                      <div key={kpi.id} className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                        <Clock size={14} className="text-accent-yellow shrink-0" />
                        <span className="text-sm text-accent-yellow truncate">{kpi.name}</span>
                        <span className="text-xs font-bold text-accent-yellow ml-auto shrink-0">{kpi.displayRate}%</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {role === 'root' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-white flex items-center gap-2"><Building size={16} /> Bảng xếp hạng đơn vị cấp Trường</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên đơn vị</th>
                  <th className="text-right">Điểm TB</th>
                  <th className="text-center">Xếp loại</th>
                  <th className="text-right">Số lượng đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {unitLevelStats.map((u, idx) => (
                  <tr key={u.id}>
                    <td><span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${idx < 3 ? 'bg-primary text-white' : 'bg-gray-100 text-text-light'}`}>{idx + 1}</span></td>
                    <td className="font-medium text-sm">{u.name}</td>
                    <td className="text-right font-bold" style={{ color: u.color }}>{u.score}</td>
                    <td className="text-center"><span className="badge" style={{ backgroundColor: `${u.color}20`, color: u.color }}>{u.grade}</span></td>
                    <td className="text-right text-sm text-text-light">{u.memberCount}</td>
                  </tr>
                ))}
                {unitLevelStats.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-text-light">Chưa có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!activeCycle && (
        <div className="card p-4">
          <div className="flex items-center gap-2 text-accent-yellow">
            <AlertTriangle size={16} />
            <span className="text-sm">Không có chu kỳ đánh giá đang hoạt động</span>
          </div>
        </div>
      )}
    </div>
  );
}
