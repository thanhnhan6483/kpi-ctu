'use client';

import { useState, useMemo, useRef } from 'react';
import {
  BarChart3, PieChart, TrendingUp, Download, Printer,
  FileSpreadsheet, X, Settings, Eye, EyeOff,
  ChevronDown, ChevronRight, Maximize2, Minimize2,
  LayoutDashboard,
} from 'lucide-react';
import {
  PieChart as RePieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer,
} from 'recharts';
import { calcCompletionRate, getCompletionStatus, getGrade } from '@/lib/kpi';
import schoolIndicators from '@/data/indicators.json';
import unitKPIsData from '@/data/unit-kpis.json';
import units from '@/data/units.json';
import kpiGroups from '@/data/kpi-groups.json';
import academicYears from '@/data/academic-years.json';
import progressData from '@/data/progress.json';
import bscPerspectives from '@/data/bsc-perspectives.json';
import strategicObjectives from '@/data/strategic-objectives.json';
import bscMapLinks from '@/data/bsc-map-links.json';
import cycles from '@/data/cycles.json';
import evaluations from '@/data/evaluations.json';
import scores from '@/data/scores.json';

const unitNameByCode: Record<string, string> = {};
(units as any[]).forEach(u => { unitNameByCode[u.code] = u.name; });

const unitNames: Array<{ id: string; name: string; code: string; type: string }> = [];
(units as any[]).forEach(u => { if (u.code !== 'CTU') unitNames.push(u); });

const catShortLabel: Record<string, string> = {
  grp_dao_tao: 'Đào tạo & ĐBCL',
  grp_khcn: 'KHCN & Đổi mới Sáng tạo',
  grp_doi_ngu: 'Đội ngũ & Phát triển',
  grp_quoc_te: 'Hợp tác Quốc tế',
  grp_quan_tri: 'Quản trị & Tài chính',
  grp_chuyen_so: 'Chuyển đổi Số',
  grp_phuc_vu: 'Phục vụ Cộng đồng',
};

const categoryMap: Record<string, string> = {};
(kpiGroups as any[]).forEach(g => { categoryMap[g.id] = g.name; });

const groupConfig: Array<{ id: string; label: string }> = [
  { id: 'grp_dao_tao', label: 'Đào tạo' },
  { id: 'grp_khcn', label: 'KHCN' },
  { id: 'grp_doi_ngu', label: 'Đội ngũ' },
  { id: 'grp_quoc_te', label: 'Quốc tế' },
  { id: 'grp_quan_tri', label: 'Quản trị' },
  { id: 'grp_chuyen_so', label: 'CĐ số' },
  { id: 'grp_phuc_vu', label: 'Phục vụ' },
];

const gradeColors: Record<string, string> = {
  xuat_sac: '#4caf50',
  tot: '#2196f3',
  dat: '#ff9800',
  can_cai_thien: '#ffc107',
  khong_dat: '#f44336',
};

const gradeLabels: Record<string, string> = {
  xuat_sac: 'Xuất sắc',
  tot: 'Tốt',
  dat: 'Đạt',
  can_cai_thien: 'Cần cải thiện',
  khong_dat: 'Không đạt',
};

const statusColors: Record<string, string> = {
  active: '#4caf50',
  inactive: '#9e9e9e',
  draft: '#ff9800',
  locked: '#f44336',
  approved: '#2196f3',
  pending: '#ffc107',
  submitted: '#2196f3',
};

type WidgetId = 'bsc' | 'kpiCharts' | 'heatmap' | 'unitTable';

const defaultWidgets: Record<WidgetId, boolean> = {
  bsc: true,
  kpiCharts: true,
  heatmap: true,
  unitTable: true,
};

const widgetLabels: Record<WidgetId, string> = {
  bsc: 'BSC Strategic Overview',
  kpiCharts: 'KPI School-level Summary',
  heatmap: 'Heatmap so sánh đơn vị',
  unitTable: 'Unit Performance Table',
};

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  return <>{Math.round(value)}{suffix}</>;
}

function heatColor(rate: number): { bg: string; text: string } {
  if (rate >= 100) return { bg: '#4caf50', text: '#fff' };
  if (rate >= 80) return { bg: '#ffc107', text: '#000' };
  if (rate > 0) return { bg: '#f44336', text: '#fff' };
  return { bg: '#e0e0e0', text: '#9e9e9e' };
}

function exportCSV(headers: string[], rows: string[][], filename: string) {
  const bom = '\uFEFF';
  const csv = bom + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportExcel(tableId: string, filename: string) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const clone = table.cloneNode(true) as HTMLElement;
  const html = `<html><head><meta charset="utf-8"></head><body>${clone.outerHTML}</body></html>`;
  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function ExecutiveDashboard() {
  const [selectedYearId, setSelectedYearId] = useState('ay002');
  const [showCustomize, setShowCustomize] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<Record<WidgetId, boolean>>(defaultWidgets);
  const [collapseKpiCharts, setCollapseKpiCharts] = useState(false);
  const [collapseBsc, setCollapseBsc] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const activeYear = (academicYears as any[]).find(y => y.id === selectedYearId)!;
  const activeCycle = (cycles as any[]).find(c => c.academicYearId === selectedYearId);

  const schoolLookup: Record<string, number> = {};
  (progressData as any[])
    .filter(p => p.level === 'school')
    .forEach(p => {
      const id = p.indicatorId || p.indicatorName;
      schoolLookup[id] = p.actualValue;
    });

  const unitLookup: Record<string, number> = {};
  (progressData as any[])
    .filter(p => p.level === 'unit')
    .forEach(p => {
      const name = p.indicatorName || p.indicatorId;
      if (name) unitLookup[name] = p.actualValue;
    });

  const yearSchoolIndicators = useMemo(
    () => (schoolIndicators as any[]).filter(si => si.academicYearId === selectedYearId),
    [selectedYearId],
  );

  const yearUnitKPIs = useMemo(
    () => (unitKPIsData as any[]).filter(u => u.academicYearId === selectedYearId),
    [selectedYearId],
  );

  const schoolItems = useMemo(
    () => yearSchoolIndicators.map((si: any) => ({
      ...si,
      target: si.targetValue ?? 0,
      weight: si.weight ?? si.maxScore,
      actual: schoolLookup[si.id] ?? 0,
      category: catShortLabel[si.categoryId] || categoryMap[si.categoryId] || si.categoryId,
      completionRate: calcCompletionRate(schoolLookup[si.id] ?? 0, si.targetValue ?? 1, si.direction || 'higher_better'),
    })),
    [yearSchoolIndicators],
  );

  const indicatorById: Record<string, any> = {};
  schoolItems.forEach(si => { indicatorById[si.id] = si; });

  const unitKpiList = useMemo(() => {
    const list: Array<{ unitCode: string; unitName: string; unitType: string; kpi: any }> = [];
    yearUnitKPIs.forEach((u: any) => {
      const uname = unitNameByCode[u.code] || u.name;
      u.kpis.forEach((k: any) => {
        list.push({ unitCode: u.code, unitName: uname, unitType: u.type, kpi: { ...k, actual: unitLookup[k.name] ?? 0 } });
      });
    });
    return list;
  }, [yearUnitKPIs]);

  const unitPerformance = useMemo(() => {
    const map: Record<string, { code: string; name: string; type: string; kpis: any[]; totalScore: number }> = {};
    unitKpiList.forEach(item => {
      if (!map[item.unitCode]) {
        map[item.unitCode] = { code: item.unitCode, name: item.unitName, type: item.unitType, kpis: [], totalScore: 0 };
      }
      map[item.unitCode].kpis.push(item.kpi);
    });
    return Object.values(map).map(u => {
      const rates = u.kpis.map(k => calcCompletionRate(k.actual, k.target || 1, 'higher_better'));
      const avgRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
      const grade = getGrade(avgRate);
      return { ...u, avgRate, grade, kpiCount: u.kpis.length };
    }).sort((a, b) => b.avgRate - a.avgRate);
  }, [unitKpiList]);

  const topUnits = useMemo(() => unitPerformance.slice(0, 10), [unitPerformance]);

  const groups = useMemo(
    () => (kpiGroups as any[]).filter(g => g.academicYearId === selectedYearId),
    [selectedYearId],
  );

  const heatmapData = useMemo(() => {
    const groupsForYear = groups;
    const rows = topUnits.map(u => {
      const row: Record<string, any> = { unitCode: u.code, unitName: u.name };
      let totalRate = 0;
      let count = 0;
      groupsForYear.forEach((g: any) => {
        const groupKpis = unitKpiList.filter(k => k.unitCode === u.code);
        const relevant = groupKpis.filter(k => {
          const ind = indicatorById[k.kpi.indicatorId];
          return ind && ind.categoryId === g.id;
        });
        if (relevant.length > 0) {
          const avg = relevant.reduce((s, r) => s + calcCompletionRate(r.kpi.actual, r.kpi.target || 1, 'higher_better'), 0) / relevant.length;
          row[g.id] = avg;
          totalRate += avg;
          count++;
        } else {
          row[g.id] = null;
        }
      });
      row.overallAvg = count > 0 ? totalRate / count : 0;
      return row;
    });

    const groupAvgs: Record<string, any> = { unitCode: '', unitName: 'Trung bình', overallAvg: 0 };
    groupsForYear.forEach((g: any) => {
      const vals = rows.map(r => r[g.id]).filter((v: any) => v !== null) as number[];
      groupAvgs[g.id] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    });
    const overallVals = rows.map(r => r.overallAvg).filter(v => v > 0);
    groupAvgs.overallAvg = overallVals.length > 0 ? overallVals.reduce((a, b) => a + b, 0) / overallVals.length : 0;

    return { rows, groupAvgs };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topUnits, unitKpiList, groups]);

  const bscData = useMemo(() => {
    return (bscPerspectives as any[]).map(p => {
      const links = (bscMapLinks as any[]).filter(l => l.perspectiveId === p.id && l.linkType === 'perspective_to_objective');
      const objIds = links.map(l => l.objectiveId);
      const objs = (strategicObjectives as any[]).filter(o => objIds.includes(o.id));
      const objWithCompletion = objs.map((o: any) => {
        const objLinks = (bscMapLinks as any[]).filter(l => l.objectiveId === o.id && l.linkType === 'objective_to_indicator');
        const indIds = objLinks.map(l => l.indicatorId).filter(Boolean);
        const related = schoolItems.filter(si => indIds.includes(si.id) || indIds.includes(si.code));
        const rates = related.map((r: any) => r.completionRate).filter((r: number) => r > 0);
        const avgCompletion = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
        const status = rates.length > 0 ? getCompletionStatus(avgCompletion) : { label: 'Chưa có dữ liệu', color: '#9e9e9e' };
        return { ...o, avgCompletion, status, indicatorCount: related.length };
      });
      const allRates = objWithCompletion.map((o: any) => o.avgCompletion).filter((r: number) => r > 0);
      const perspectiveAvg = allRates.length > 0 ? allRates.reduce((a, b) => a + b, 0) / allRates.length : 0;
      return { ...p, objectives: objWithCompletion, avgCompletion: perspectiveAvg };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [schoolItems]);

  const categoryDistribution = useMemo(() => {
    const map: Record<string, { name: string; count: number; value: number }> = {};
    schoolItems.forEach((si: any) => {
      const cat = si.category;
      if (!map[cat]) map[cat] = { name: cat, count: 0, value: 0 };
      map[cat].count++;
      map[cat].value += si.completionRate;
    });
    return Object.values(map).map(m => ({ ...m, avg: m.count > 0 ? m.value / m.count : 0 }));
  }, [schoolItems]);

  const fieldBarData = useMemo(() => {
    const map: Record<string, { field: string; đạt: number; khongDat: number; total: number }> = {};
    schoolItems.forEach((si: any) => {
      const cat = si.category;
      if (!map[cat]) map[cat] = { field: cat, đạt: 0, khongDat: 0, total: 0 };
      map[cat].total++;
      if (si.completionRate >= 80) map[cat].đạt++;
      else map[cat].khongDat++;
    });
    return Object.values(map);
  }, [schoolItems]);

  const radarData = useMemo(() => {
    return groupConfig.map(g => {
      const items = schoolItems.filter((si: any) => si.categoryId === g.id);
      const avg = items.length > 0 ? items.reduce((s: number, i: any) => s + i.completionRate, 0) / items.length : 0;
      return { category: g.label, value: Math.round(avg * 10) / 10 };
    });
  }, [schoolItems]);

  const toggleWidget = (id: WidgetId) => {
    setVisibleWidgets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Đơn vị', 'Điểm TB', 'Xếp loại', 'Số KPI'];
    const rows = unitPerformance.map(u => [u.name, u.avgRate.toFixed(1), u.grade.label, String(u.kpiCount)]);
    exportCSV(headers, rows, `executive-dashboard-${activeYear?.name || ''}.csv`);
  };

  const handleExportExcel = () => {
    exportExcel('unit-table', `executive-dashboard-${activeYear?.name || ''}.xls`);
  };

  const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#f44336', '#ffc107', '#00bcd4'];

  return (
    <div className="space-y-6" ref={printRef}>
      <div className="flex items-center justify-between flex-wrap gap-4 print:flex-col print:items-start">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Dashboard Ban Giám hiệu</h1>
          <p className="text-text-light mt-1 text-sm">
            Tổng quan KPI toàn trường — {activeCycle ? activeCycle.name : ''} ({activeYear?.name || ''})
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-text-light">Năm học:</span>
          <div className="flex bg-white border border-border rounded-lg overflow-hidden">
            {(academicYears as any[]).map(ay => (
              <button key={ay.id} onClick={() => setSelectedYearId(ay.id)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${selectedYearId === ay.id ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>
                {ay.name}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
          <button onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-border rounded-lg hover:bg-bg-cream transition-colors">
            <Download size={14} /> CSV
          </button>
          <button onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-border rounded-lg hover:bg-bg-cream transition-colors">
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-border rounded-lg hover:bg-bg-cream transition-colors">
            <Printer size={14} /> In/PDF
          </button>
          <button onClick={() => setShowCustomize(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-border rounded-lg hover:bg-bg-cream transition-colors">
            <Settings size={14} /> Tùy chỉnh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-light">Chỉ tiêu cấp Trường</span>
            <BarChart3 size={16} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={schoolItems.length} /></p>
          <p className="text-xs text-text-light">KPI đang theo dõi</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-light">Đơn vị có KPI</span>
            <LayoutDashboard size={16} className="text-accent-green" />
          </div>
          <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={unitPerformance.length} /></p>
          <p className="text-xs text-text-light">đơn vị đang đánh giá</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-light">Tổng KPI đơn vị</span>
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={unitKpiList.length} /></p>
          <p className="text-xs text-text-light">chỉ tiêu các đơn vị</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-light">Xếp loại chung</span>
            <PieChart size={16} className="text-accent-yellow" />
          </div>
          {(() => {
            const avgAll = unitPerformance.length > 0
              ? unitPerformance.reduce((s, u) => s + u.avgRate, 0) / unitPerformance.length
              : 0;
            const grade = getGrade(avgAll);
            return (
              <>
                <p className="text-2xl font-bold" style={{ color: grade.color }}>{grade.label}</p>
                <p className="text-xs text-text-light">điểm TB: {avgAll.toFixed(1)}</p>
              </>
            );
          })()}
        </div>
      </div>

      {visibleWidgets.bsc && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-white">BSC Strategic Overview</h3>
              {collapseBsc ? (
                <button onClick={() => setCollapseBsc(false)} className="text-white/70 hover:text-white">
                  <Maximize2 size={14} />
                </button>
              ) : (
                <button onClick={() => setCollapseBsc(true)} className="text-white/70 hover:text-white">
                  <Minimize2 size={14} />
                </button>
              )}
            </div>
            <span className="text-white/70 text-xs">{bscData.length} perspectives</span>
          </div>
          {!collapseBsc && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {bscData.map(p => {
                const statusColor = p.avgCompletion >= 80 ? '#4caf50' : p.avgCompletion >= 50 ? '#ff9800' : '#f44336';
                return (
                  <div key={p.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <div>
                        <h4 className="font-heading font-bold text-sm text-text-dark">{p.name}</h4>
                        <p className="text-xs text-text-light">{p.code} — {p.description}</p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-light">Hoàn thành</span>
                        <span className="font-medium" style={{ color: statusColor }}>{p.avgCompletion.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-bg-cream rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(p.avgCompletion, 100)}%`, backgroundColor: statusColor }} />
                      </div>
                    </div>
                    <div className="space-y-1.5 mt-3">
                      {p.objectives.map((o: any) => (
                        <div key={o.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-bg-cream">
                          <span className="text-text-dark truncate max-w-[60%]">{o.name}</span>
                          <span className="shrink-0 ml-2 font-medium" style={{ color: o.status.color }}>
                            {o.avgCompletion > 0 ? `${o.avgCompletion.toFixed(0)}%` : o.status.label}
                          </span>
                        </div>
                      ))}
                      {p.objectives.length === 0 && (
                        <p className="text-xs text-text-light italic">Chưa có mục tiêu</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {visibleWidgets.kpiCharts && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-white">KPI School-level Summary</h3>
              {collapseKpiCharts ? (
                <button onClick={() => setCollapseKpiCharts(false)} className="text-white/70 hover:text-white">
                  <Maximize2 size={14} />
                </button>
              ) : (
                <button onClick={() => setCollapseKpiCharts(true)} className="text-white/70 hover:text-white">
                  <Minimize2 size={14} />
                </button>
              )}
            </div>
            <span className="text-white/70 text-xs">{schoolItems.length} KPI</span>
          </div>
          {!collapseKpiCharts && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 border border-border">
                <h4 className="text-sm font-heading font-bold text-text-dark mb-2">Phân loại KPI theo lĩnh vực</h4>
                <ResponsiveContainer width="100%" height={240}>
                  <RePieChart>
                    <Pie data={categoryDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: any) => `${((percent ?? 0) * 100).toFixed(0)}%`}>
                      {categoryDistribution.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categoryDistribution.map((c, i) => (
                    <span key={i} className="text-xs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {c.name}: {c.count}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-border">
                <h4 className="text-sm font-heading font-bold text-text-dark mb-2">KPI đạt/không đạt theo lĩnh vực</h4>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={fieldBarData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="field" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="đạt" fill="#4caf50" name="Đạt (≥80%)" stackId="a" />
                    <Bar dataKey="khongDat" fill="#f44336" name="Chưa đạt" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg p-4 border border-border">
                <h4 className="text-sm font-heading font-bold text-text-dark mb-2">Radar đa chiều</h4>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 9 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 120]} tick={{ fontSize: 9 }} />
                    <Radar name="Tỉ lệ hoàn thành" dataKey="value" stroke="#2196f3" fill="#2196f3" fillOpacity={0.25} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {visibleWidgets.heatmap && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-white">Heatmap so sánh đơn vị theo lĩnh vực</h3>
            <span className="text-white/70 text-xs">{topUnits.length} đơn vị × {groups.length} lĩnh vực</span>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="table text-xs" id="heatmap-table">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white z-10 min-w-[140px]">Đơn vị</th>
                  {groupConfig.map(g => {
                    const gExist = groups.some((gr: any) => gr.id === g.id);
                    return gExist ? <th key={g.id} className="text-center min-w-[80px]">{g.label}</th> : null;
                  })}
                  <th className="text-center min-w-[80px] bg-bg-cream">Trung bình</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.rows.map(row => (
                  <tr key={row.unitCode}>
                    <td className="font-medium sticky left-0 bg-white z-10">{row.unitName}</td>
                    {groupConfig.map(g => {
                      const gExist = groups.some((gr: any) => gr.id === g.id);
                      if (!gExist) return null;
                      const val = row[g.id];
                      const color = val !== null ? heatColor(val) : { bg: '#e0e0e0', text: '#9e9e9e' };
                      return (
                        <td key={g.id} className="text-center p-1">
                          <span className="inline-block px-2 py-1 rounded text-xs font-medium"
                            style={{ backgroundColor: color.bg, color: color.text, minWidth: 50 }}>
                            {val !== null ? `${val.toFixed(1)}%` : '-'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="text-center font-medium bg-bg-cream">
                      {row.overallAvg > 0 ? `${row.overallAvg.toFixed(1)}%` : '-'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-bg-cream font-medium">
                  <td className="sticky left-0 bg-bg-cream z-10">Trung bình</td>
                  {groupConfig.map(g => {
                    const gExist = groups.some((gr: any) => gr.id === g.id);
                    if (!gExist) return null;
                    const val = heatmapData.groupAvgs[g.id];
                    return (
                      <td key={g.id} className="text-center">
                        {val > 0 ? `${val.toFixed(1)}%` : '-'}
                      </td>
                    );
                  })}
                  <td className="text-center font-bold">
                    {heatmapData.groupAvgs.overallAvg > 0 ? `${heatmapData.groupAvgs.overallAvg.toFixed(1)}%` : '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 flex items-center gap-4 text-xs text-text-light border-t border-border">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#4caf50' }} /> ≥100%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#ffc107' }} /> ≥80%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#f44336' }} /> {'<'}80%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#e0e0e0' }} /> Không có dữ liệu</span>
          </div>
        </div>
      )}

      {visibleWidgets.unitTable && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-white">Unit Performance Table</h3>
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-xs">{unitPerformance.length} đơn vị</span>
              <button onClick={handleExportCSV} className="text-white/70 hover:text-white">
                <Download size={14} />
              </button>
            </div>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="table text-xs" id="unit-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Đơn vị</th>
                  <th>Loại</th>
                  <th className="text-center">Số KPI</th>
                  <th className="text-center">Tỉ lệ TB</th>
                  <th className="text-center">Xếp loại</th>
                  <th className="text-center">Xu hướng</th>
                </tr>
              </thead>
              <tbody>
                {unitPerformance.map((u, i) => {
                  const aboveAvg = u.avgRate > 70;
                  const trend = aboveAvg ? 'up' : 'down';
                  return (
                    <tr key={u.code}>
                      <td className="text-text-light">{i + 1}</td>
                      <td className="font-medium">{u.name}</td>
                      <td><span className="badge badge-info">{u.type}</span></td>
                      <td className="text-center">{u.kpiCount}</td>
                      <td className="text-center font-medium">{u.avgRate.toFixed(1)}%</td>
                      <td className="text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: `${u.grade.color}20`, color: u.grade.color }}>
                          {u.grade.label}
                        </span>
                      </td>
                      <td className="text-center">
                        {trend === 'up' ? (
                          <span className="text-accent-green text-sm" title="Trên trung bình">&#9650;</span>
                        ) : (
                          <span className="text-accent-red text-sm" title="Dưới trung bình">&#9660;</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <div className="card p-4">
          <h4 className="font-heading font-bold text-sm mb-2">Thang xếp loại</h4>
          <div className="text-xs space-y-1">
            <p><span className="text-accent-green">●</span> Xuất sắc: ≥90 điểm</p>
            <p><span className="text-blue-500">●</span> Tốt: 80-89 điểm</p>
            <p><span className="text-accent-yellow">●</span> Đạt: 65-79 điểm</p>
            <p><span className="text-orange-500">●</span> Cần cải thiện: 50-64 điểm</p>
            <p><span className="text-accent-red">●</span> Không đạt: {'<'}50 điểm</p>
          </div>
        </div>
        <div className="card p-4">
          <h4 className="font-heading font-bold text-sm mb-2">Heatmap legend</h4>
          <div className="text-xs space-y-1">
            <p><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: '#4caf50' }} /> {' '}≥100% hoàn thành</p>
            <p><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: '#ffc107' }} /> {' '}80-99% hoàn thành</p>
            <p><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: '#f44336' }} /> {' '}{'<'}80% hoàn thành</p>
            <p><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: '#e0e0e0' }} /> {' '}Chưa có số liệu</p>
          </div>
        </div>
        <div className="card p-4">
          <h4 className="font-heading font-bold text-sm mb-2">Ghi chú</h4>
          <div className="text-xs text-text-light space-y-1">
            <p>• Dữ liệu được cập nhật từ tiến độ thực tế của các đơn vị</p>
            <p>• Tỉ lệ = Thực tế / Chỉ tiêu × 100% (giới hạn tối đa 120%)</p>
            <p>• Dashboard phục vụ Ban Giám hiệu đánh giá tổng quan</p>
          </div>
        </div>
      </div>

      {showCustomize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:hidden">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-bold text-text-dark">Tùy chỉnh Widget</h3>
              <button onClick={() => setShowCustomize(false)} className="text-text-light hover:text-text-dark">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-text-light mb-4">Hiện/ẩn các thành phần trên dashboard</p>
            <div className="space-y-3">
              {(Object.keys(defaultWidgets) as WidgetId[]).map(id => (
                <label key={id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border hover:bg-bg-cream cursor-pointer">
                  <span className="text-sm font-medium text-text-dark">{widgetLabels[id]}</span>
                  <button
                    onClick={() => toggleWidget(id)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${visibleWidgets[id] ? 'bg-primary' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${visibleWidgets[id] ? 'translate-x-5' : ''}`} />
                  </button>
                </label>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setVisibleWidgets(defaultWidgets)}
                className="flex-1 px-4 py-2 text-sm font-medium text-text-dark border border-border rounded-lg hover:bg-bg-cream">
                Đặt lại
              </button>
              <button onClick={() => setShowCustomize(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media print {
          .card-header { background-color: #1a237e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
