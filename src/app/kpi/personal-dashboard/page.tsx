'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, TrendingDown, Award, Users, Building, BarChart2, Target, Calendar, Settings } from 'lucide-react';
import { apiGet } from '@/lib/api';
import planItemsData from '@/data/plan-items.json';
import plansData from '@/data/plans.json';
import scoresData from '@/data/scores.json';
import progressData from '@/data/progress.json';
import evidencesData from '@/data/evidences.json';
import evaluationsData from '@/data/evaluations.json';
import individualEvalsData from '@/data/individual-evaluations.json';
import unitsData from '@/data/units.json';
import usersData from '@/data/users.json';
import cyclesData from '@/data/cycles.json';

interface DashboardStats {
  myKPIs: number;
  myProgress: number;
  myScore: number;
  myGrade: string;
  pendingApprovals: number;
  overdueKPIs: number;
  upcomingDeadlines: number;
  completionRate: number;
}

const unitMap: Record<string, string> = {};
(unitsData as { id: string; name: string }[]).forEach(u => { unitMap[u.id] = u.name; });

function getGrade(score: number): string {
  if (score >= 90) return 'Xuất sắc';
  if (score >= 80) return 'Tốt';
  if (score >= 65) return 'Đạt';
  if (score >= 50) return 'Cần cải thiện';
  return 'Không đạt';
}

const gradeColors: Record<string, string> = { 'Xuất sắc': '#4caf50', 'Tốt': '#2196f3', 'Đạt': '#ff9800', 'Cần cải thiện': '#ffc107', 'Không đạt': '#f44336' };

const WIDGET_STORAGE_KEY = 'dashboard_widgets';

const defaultWidgets = {
  showStats: true, showRecent: true, showRanking: true, showProgress: true, showWarnings: true,
  showHeatmap: false, showTrends: false,
};

export default function PersonalDashboardPage() {
  const [activeRole, setActiveRole] = useState<'personal' | 'department' | 'unit'>('personal');
  const [stats, setStats] = useState<DashboardStats>({ myKPIs: 0, myProgress: 0, myScore: 0, myGrade: '-', pendingApprovals: 0, overdueKPIs: 0, upcomingDeadlines: 0, completionRate: 0 });
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomize, setShowCustomize] = useState(false);
  const [widgets, setWidgets] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(WIDGET_STORAGE_KEY);
      return stored ? { ...defaultWidgets, ...JSON.parse(stored) } : defaultWidgets;
    }
    return defaultWidgets;
  });

  const toggleWidget = (key: keyof typeof defaultWidgets) => {
    const next = { ...widgets, [key]: !widgets[key] };
    setWidgets(next);
    localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(next));
  };

  const load = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const planItems = planItemsData as any[];
      const plans = plansData as any[];
      const scores = scoresData as any[];
      const progress = progressData as any[];
      const evidences = evidencesData as any[];
      const evals = individualEvalsData as any[];
      const activeCycles = (cyclesData as any[]).filter(c => c.status === 'active');
      const activePlanIds = plans.filter(p => activeCycles.some(c => c.id === p.cycleId)).map(p => p.id);
      const activePlanItems = planItems.filter(pi => activePlanIds.includes(pi.planId));

      const myPlanItems = activePlanItems.slice(0, 20);
      const myProgress = progress.filter(p => myPlanItems.some((pi: any) => pi.id === p.planItemId));
      const myScores = scores.filter(s => myPlanItems.some((pi: any) => pi.id === s.planItemId));
      const avgScore = myScores.length > 0 ? Math.round(myScores.reduce((s: number, sc: any) => s + (sc.finalScore || 0), 0) / myScores.length) : 0;

      const overdue = myPlanItems.filter((pi: any) => pi.dueDate && pi.dueDate < today).length;
      const upcoming = myPlanItems.filter((pi: any) => {
        if (!pi.dueDate) return false;
        const days = Math.ceil((new Date(pi.dueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
        return days >= 0 && days <= 14;
      }).length;

      const itemsWithEvidence = new Set(evidences.filter((e: any) => e.status === 'valid').flatMap((e: any) => e.planItemIds || [])).size;
      const completionRate = myPlanItems.length > 0 ? Math.round((itemsWithEvidence / myPlanItems.length) * 100) : 0;

      setStats({
        myKPIs: myPlanItems.length,
        myProgress: myProgress.length,
        myScore: avgScore,
        myGrade: getGrade(avgScore),
        pendingApprovals: plans.filter(p => p.status === 'submitted').length,
        overdueKPIs: overdue,
        upcomingDeadlines: upcoming,
        completionRate,
      });

      const recent = myPlanItems.slice(0, 5).map((pi: any) => {
        const score = scores.find((s: any) => s.planItemId === pi.id);
        const prog = progress.filter((p: any) => p.planItemId === pi.id).sort((a: any, b: any) => b.progressDate.localeCompare(a.progressDate))[0];
        return { ...pi, score: score?.finalScore || null, actualValue: prog?.actualValue || 0, targetValue: pi.targetValue };
      });
      setRecentItems(recent);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const unitStats = useCallback(() => {
    const plans = plansData as any[];
    const planItems = planItemsData as any[];
    const scores = scoresData as any[];
    const units = (unitsData as any[]).filter(u => u.type === 'faculty' || u.type === 'department');
    return units.slice(0, 8).map(u => {
      const unitPlans = plans.filter(p => p.ownerId === u.id && p.status !== 'draft');
      const unitPlanItems = planItems.filter(pi => unitPlans.some((p: any) => p.id === pi.planId));
      const unitScores = scores.filter(s => unitPlanItems.some((pi: any) => pi.id === s.planItemId));
      const avg = unitScores.length > 0 ? Math.round(unitScores.reduce((s: number, sc: any) => s + (sc.finalScore || 0), 0) / unitScores.length) : 0;
      return { id: u.id, name: u.name, score: avg, grade: getGrade(avg), kpiCount: unitPlanItems.length };
    }).sort((a, b) => b.score - a.score);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Dashboard cá nhân</h1>
          <p className="text-text-light mt-1">Tổng quan KPI theo vai trò (XVII.1-XVII.3)</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/reports/export?type=personal-dashboard&format=csv" className="btn-secondary text-sm flex items-center gap-1" download>Xuất báo cáo</a>
          <button onClick={() => setShowCustomize(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-border text-text-dark hover:bg-bg-cream">
            <Settings size={16} /> Tùy chỉnh
          </button>
          {[
            { key: 'personal' as const, label: 'Cá nhân', icon: Users },
            { key: 'department' as const, label: 'Bộ môn', icon: Building },
            { key: 'unit' as const, label: 'Đơn vị', icon: BarChart2 },
          ].map(r => (
            <button key={r.key} onClick={() => setActiveRole(r.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${activeRole === r.key ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'} `}>
              <r.icon size={16} /> {r.label}
            </button>
          ))}
        </div>
      </div>

      {widgets.showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary-light rounded-lg"><Target size={20} className="text-primary" /></div><div><p className="text-text-light text-sm">KPI của tôi</p><p className="text-xl font-bold">{stats.myKPIs}</p></div></div></div>
          <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div><div><p className="text-text-light text-sm">Điểm trung bình</p><p className="text-xl font-bold" style={{ color: gradeColors[stats.myGrade] || '#333' }}>{stats.myScore}</p></div></div></div>
          <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-yellow/20 rounded-lg"><AlertTriangle size={20} className="text-accent-yellow" /></div><div><p className="text-text-light text-sm">Quá hạn</p><p className="text-xl font-bold">{stats.overdueKPIs}</p></div></div></div>
          <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-50 rounded-lg"><Calendar size={20} className="text-blue-600" /></div><div><p className="text-text-light text-sm">Sắp đến hạn</p><p className="text-xl font-bold">{stats.upcomingDeadlines}</p></div></div></div>
        </div>
      )}

      {widgets.showRecent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <div className="card-header"><h3 className="text-white">KPI gần đây</h3></div>
            <div className="p-0">
              <div className="overflow-x-auto"><table className="table">
                <thead><tr><th>Mã KPI</th><th>Chỉ tiêu</th><th>Mục tiêu</th><th>Thực tế</th><th>Điểm</th><th>Trạng thái</th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={6} className="text-center py-8">Đang tải...</td></tr> :
                  recentItems.length === 0 ? <tr><td colSpan={6} className="text-center py-8">Chưa có KPI</td></tr> :
                  recentItems.map((item, idx) => {
                    const percent = item.targetValue > 0 ? Math.round((item.actualValue / item.targetValue) * 100) : 0;
                    return (
                      <tr key={idx}>
                        <td><span className="badge badge-info">{item.planItemId?.substring(0, 12)}</span></td>
                        <td className="font-medium text-sm">{item.indicatorId}</td>
                        <td className="text-sm">{item.targetValue}</td>
                        <td className="text-sm font-bold">{item.actualValue}</td>
                        <td className="font-bold" style={{ color: item.score >= 80 ? '#4caf50' : item.score >= 50 ? '#ffc107' : '#f44336' }}>{item.score || '-'}</td>
                        <td><span className={`badge ${percent >= 100 ? 'badge-success' : percent >= 80 ? 'badge-warning' : 'badge-danger'}`}>{percent >= 100 ? 'Đạt' : percent >= 80 ? 'Cần cải thiện' : 'Chưa đạt'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table></div>
            </div>
          </div>

          {widgets.showRanking && (
            <div className="card">
              <div className="card-header"><h3 className="text-white">Xếp loại đơn vị</h3></div>
              <div className="p-4 space-y-3">
                {unitStats().map((u, idx) => (
                  <div key={u.id} className="flex items-center justify-between p-2 bg-bg-cream rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-light w-5">{idx + 1}</span>
                      <span className="text-sm font-medium">{u.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: gradeColors[u.grade] || '#333' }}>{u.score}</span>
                      <span className="badge" style={{ backgroundColor: `${gradeColors[u.grade]}20`, color: gradeColors[u.grade] }}>{u.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {widgets.showProgress && (
          <div className="card p-4">
            <h3 className="font-heading font-bold text-sm mb-3 flex items-center gap-2"><Clock size={14} /> Tiến độ thực hiện</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-text-light">Tổng KPI đang thực hiện</span><span className="font-bold">{stats.myKPIs}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-light">Đã có tiến độ</span><span className="font-bold text-accent-green">{stats.myProgress}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-light">Tỷ lệ hoàn thành</span><span className="font-bold">{stats.completionRate}%</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${stats.completionRate}%`, backgroundColor: stats.completionRate >= 80 ? '#4caf50' : stats.completionRate >= 50 ? '#ffc107' : '#f44336' }} /></div>
            </div>
          </div>
        )}

        {widgets.showWarnings && (
          <div className="card p-4">
            <h3 className="font-heading font-bold text-sm mb-3 flex items-center gap-2"><AlertTriangle size={14} /> Cảnh báo & Nhắc nhở</h3>
            <div className="space-y-2">
              {stats.overdueKPIs > 0 && (
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                  <AlertTriangle size={14} className="text-accent-red" />
                  <span className="text-sm text-accent-red">{stats.overdueKPIs} KPI đã quá hạn</span>
                </div>
              )}
              {stats.upcomingDeadlines > 0 && (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                  <Clock size={14} className="text-accent-yellow" />
                  <span className="text-sm text-accent-yellow">{stats.upcomingDeadlines} KPI sắp đến hạn (≤14 ngày)</span>
                </div>
              )}
              {stats.pendingApprovals > 0 && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <FileText size={14} className="text-blue-600" />
                  <span className="text-sm text-blue-600">{stats.pendingApprovals} kế hoạch chờ duyệt</span>
                </div>
              )}
              {stats.overdueKPIs === 0 && stats.upcomingDeadlines === 0 && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <CheckCircle size={14} className="text-accent-green" />
                  <span className="text-sm text-accent-green">Không có cảnh báo nào</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showCustomize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCustomize(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-heading font-bold text-text-dark mb-4">Tùy chỉnh Dashboard</h2>
            <div className="space-y-3">
              {Object.entries(widgets).map(([key, val]) => {
                const labels: Record<string, { label: string; desc: string }> = {
                  showStats: { label: 'Thống kê tổng quan', desc: 'Số KPI, điểm TB, quá hạn, sắp hạn' },
                  showRecent: { label: 'KPI gần đây & Xếp loại', desc: 'Danh sách KPI và bảng xếp hạng đơn vị' },
                  showRanking: { label: 'Xếp loại đơn vị', desc: 'Bảng xếp hạng điểm số các đơn vị' },
                  showProgress: { label: 'Tiến độ thực hiện', desc: 'Tỷ lệ hoàn thành và trạng thái KPI' },
                  showWarnings: { label: 'Cảnh báo & Nhắc nhở', desc: 'KPI quá hạn, sắp hạn, chờ duyệt' },
                  showHeatmap: { label: 'Heatmap KPI', desc: 'Ma trận mật độ hoàn thành theo thời gian' },
                  showTrends: { label: 'Xu hướng KPI', desc: 'Biểu đồ xu hướng điểm số qua các kỳ' },
                };
                const info = labels[key] || { label: key, desc: '' };
                return (
                  <label key={key} className="flex items-center justify-between p-3 bg-bg-cream rounded-lg cursor-pointer group">
                    <div className="flex-1">
                      <span className="text-sm font-medium">{info.label}</span>
                      <p className="text-xs text-text-light mt-0.5">{info.desc}</p>
                    </div>
                    <input type="checkbox" checked={val as boolean} onChange={() => toggleWidget(key as keyof typeof defaultWidgets)} className="rounded ml-2" />
                  </label>
                );
              })}
            </div>
            <button onClick={() => setShowCustomize(false)} className="mt-4 w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
