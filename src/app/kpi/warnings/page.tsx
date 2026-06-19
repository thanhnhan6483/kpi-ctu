'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, Search, TrendingUp, TrendingDown, Bell } from 'lucide-react';
import { apiGet } from '@/lib/api';
import planItemsData from '@/data/plan-items.json';
import plansData from '@/data/plans.json';
import unitKpisData from '@/data/unit-kpis.json';
import unitsData from '@/data/units.json';

interface ProgressRecord { id: string; planItemId: string; actualValue: number; progressDate: string; note: string; updatedBy: string; level?: string; personId?: string; personName?: string; }
interface PlanItem { id: string; planId: string; indicatorId: string; targetValue: number; weight: number; dueDate: string; }
interface Plan { id: string; cycleId: string; ownerType: string; ownerId: string; status: string; }

const unitMap: Record<string, string> = {};
(unitsData as { id: string; name: string }[]).forEach(u => { unitMap[u.id] = u.name; });

function getKpiName(indicatorId: string): string {
  for (const unit of unitKpisData as { id: string; kpis: { id: string; name: string; indicatorId: string | null }[] }[]) { const kpi = unit.kpis.find(k => k.indicatorId === indicatorId); if (kpi) return kpi.name; }
  return indicatorId;
}

function getUnitNameForPlan(planId: string): string {
  const plan = (plansData as Plan[]).find(p => p.id === planId);
  return plan ? (unitMap[plan.ownerId] || plan.ownerId) : '-';
}

export default function WarningsPage() {
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'overdue' | 'warning' | 'ontrack'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const load = useCallback(async () => {
    try { const p = await apiGet<ProgressRecord[]>('/api/progress'); setProgress(p); }
    catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = new Date().toISOString().split('T')[0];

  const analysis = (planItemsData as PlanItem[]).map(item => {
    const itemProgress = progress.filter(p => p.planItemId === item.id);
    const latestProgress = itemProgress.sort((a, b) => b.progressDate.localeCompare(a.progressDate))[0];
    const actualValue = latestProgress?.actualValue || 0;
    const target = item.targetValue;
    const percent = target > 0 ? Math.round((actualValue / target) * 100) : 0;
    const dueDate = item.dueDate;
    const isOverdue = dueDate && dueDate < today;
    const daysUntilDue = dueDate ? Math.ceil((new Date(dueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isWarning = daysUntilDue !== null && daysUntilDue <= 14 && daysUntilDue >= 0 && percent < 80;
    const plan = (plansData as Plan[]).find(p => p.id === item.planId);
    const unitName = plan ? (unitMap[plan.ownerId] || plan.ownerId) : '-';
    let status: 'overdue' | 'warning' | 'ontrack' | 'completed' = 'ontrack';
    if (percent >= 100) status = 'completed';
    else if (isOverdue) status = 'overdue';
    else if (isWarning) status = 'warning';
    return { ...item, kpiName: getKpiName(item.indicatorId), actualValue, targetValue: target, percent, dueDate, daysUntilDue, isOverdue, isWarning, unitName, status };
  });

  const filtered = analysis.filter(item => {
    if (filterType !== 'all' && item.status !== filterType) return false;
    if (searchTerm) { const s = searchTerm.toLowerCase(); return item.kpiName.toLowerCase().includes(s) || item.unitName.toLowerCase().includes(s); }
    return true;
  });

  const stats = { total: analysis.length, overdue: analysis.filter(i => i.status === 'overdue').length, warning: analysis.filter(i => i.status === 'warning').length, ontrack: analysis.filter(i => i.status === 'ontrack').length, completed: analysis.filter(i => i.status === 'completed').length };

  const statusColor = (s: string) => {
    switch (s) {
      case 'overdue': return { label: 'Quá hạn', color: '#ef4444' };
      case 'warning': return { label: 'Cảnh báo', color: '#eab308' };
      case 'completed': return { label: 'Hoàn thành', color: '#22c55e' };
      default: return { label: 'Đúng tiến độ', color: '#3b82f6' };
    }
  };

  const statusFilters = [
    { value: 'all', label: 'Tất cả' },
    { value: 'overdue', label: 'Quá hạn' },
    { value: 'warning', label: 'Cảnh báo' },
    { value: 'ontrack', label: 'Đúng tiến độ' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Cảnh báo & Theo dõi tiến độ</h1>
          <p className="text-text-light mt-1">So sánh tiến độ với chỉ tiêu, cảnh báo KPI chậm tiến độ, sắp đến hạn (X.3-X.5)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary-light rounded-lg"><FileText size={20} className="text-primary" /></div><div><p className="text-text-light text-sm">Tổng KPI</p><p className="text-xl font-bold">{stats.total}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-red/20 rounded-lg"><AlertTriangle size={20} className="text-accent-red" /></div><div><p className="text-text-light text-sm">Quá hạn</p><p className="text-xl font-bold">{stats.overdue}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-yellow/20 rounded-lg"><Clock size={20} className="text-accent-yellow" /></div><div><p className="text-text-light text-sm">Cảnh báo</p><p className="text-xl font-bold">{stats.warning}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div><div><p className="text-text-light text-sm">Hoàn thành</p><p className="text-xl font-bold">{stats.completed}</p></div></div></div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm KPI..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((s) => (
            <button key={s.value} onClick={() => setFilterType(s.value as any)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filterType === s.value ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>{s.label}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách KPI theo dõi</h3></div>
        <div className="p-0">
          <div className="overflow-x-auto"><table className="table">
            <thead><tr><th>STT</th><th>Đơn vị</th><th>Chỉ tiêu KPI</th><th>Mục tiêu</th><th>Thực tế</th><th>Hoàn thành</th><th>Hạn</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="text-center py-8">Đang tải...</td></tr> :
              filtered.length === 0 ? <tr><td colSpan={8} className="text-center py-8">Không có dữ liệu</td></tr> :
              filtered.map((item, idx) => {
                const sc = statusColor(item.status);
                return (
                  <tr key={item.id} className={item.status === 'overdue' ? 'bg-red-50/50' : item.status === 'warning' ? 'bg-yellow-50/50' : ''}>
                    <td>{idx + 1}</td>
                    <td className="font-medium text-sm">{item.unitName}</td>
                    <td className="text-sm">{item.kpiName}</td>
                    <td className="text-sm">{item.targetValue}</td>
                    <td className="text-sm font-bold">{item.actualValue}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-16"><div className="progress-fill" style={{ width: `${Math.min(item.percent, 100)}%`, backgroundColor: item.percent >= 100 ? '#4caf50' : item.percent >= 80 ? '#2196f3' : item.percent >= 50 ? '#ffc107' : '#f44336' }} /></div>
                        <span className="text-sm font-medium" style={{ color: item.percent >= 100 ? '#4caf50' : item.percent >= 80 ? '#2196f3' : item.percent >= 50 ? '#ffc107' : '#f44336' }}>{item.percent}%</span>
                      </div>
                    </td>
                    <td className="text-sm">
                      <div>{item.dueDate || '-'}</div>
                      {item.daysUntilDue !== null && item.daysUntilDue < 0 && <div className="text-accent-red text-xs">Quá {Math.abs(item.daysUntilDue)} ngày</div>}
                      {item.daysUntilDue !== null && item.daysUntilDue >= 0 && item.daysUntilDue <= 14 && <div className="text-accent-yellow text-xs">Còn {item.daysUntilDue} ngày</div>}
                    </td>
                    <td><span className="badge" style={{ backgroundColor: `${sc.color}20`, color: sc.color }}>{sc.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}
