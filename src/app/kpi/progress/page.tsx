'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, Search, Plus, TrendingUp, TrendingDown, Edit, Trash2, Eye } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import unitKpisData from '@/data/unit-kpis.json';
import academicYears from '@/data/academic-years.json';

interface CycleRecord { id: string; academicYearId: string; name: string; }
interface ProgressRecord { id: string; planItemId: string; actualValue: number; progressDate: string; note: string; updatedBy: string; level?: string; personId?: string; personName?: string; positionCode?: string; }
interface PlanItemRecord { id: string; planId: string; indicatorId: string; targetValue: number; weight: number; dueDate: string; }
interface PlanRecord { id: string; name: string; cycleId: string; unitId: string; status: string; }
interface UnitKpi { id: string; name: string; code: string; kpis: { id: string; name: string; indicatorId: string | null }[]; }

function getKpiName(indicatorId: string): string {
  for (const unit of unitKpisData as UnitKpi[]) { const kpi = unit.kpis.find(k => k.indicatorId === indicatorId); if (kpi) return kpi.name; }
  return indicatorId;
}

function getUnitName(unitId: string): string { const unit = (unitKpisData as UnitKpi[]).find(u => u.id === unitId); return unit?.name || unitId; }

export default function ProgressPage() {
  const [selectedYearId, setSelectedYearId] = useState('ay002');
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [planItems, setPlanItems] = useState<PlanItemRecord[]>([]);
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ProgressRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(`/api/cycles?academicYearId=${selectedYearId}`).then(r => r.json()).then(setCycles).catch(() => {}); }, [selectedYearId]);

  const loadData = useCallback(async () => {
    try {
      const [r, pi, p] = await Promise.all([apiGet<ProgressRecord[]>('/api/progress'), apiGet<PlanItemRecord[]>('/api/plan-items'), apiGet<PlanRecord[]>('/api/plans')]);
      setRecords(r); setPlanItems(pi); setPlans(p);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const activeCycleIds = cycles.map(c => c.id);
  const cycleRecords = activeCycleIds.length > 0 ? records.filter(r => { const pi = planItems.find(p => p.id === r.planItemId); return pi && plans.some(p => p.id === pi.planId && activeCycleIds.includes(p.cycleId)); }) : records;

  const yearFilteredRecords = cycleRecords;

  const enriched = yearFilteredRecords.map(rec => {
    const pi = planItems.find(p => p.id === rec.planItemId);
    const target = pi?.targetValue || 0;
    const percent = target > 0 ? Math.round((rec.actualValue / target) * 100) : 0;
    return { ...rec, targetValue: target, progressPercent: percent, indicatorName: pi ? getKpiName(pi.indicatorId) : rec.planItemId, unitName: '-' };
  });

  const filtered = enriched.filter(r => {
    if (searchTerm) { const s = searchTerm.toLowerCase(); return r.indicatorName.toLowerCase().includes(s) || r.note.toLowerCase().includes(s); }
    return true;
  });

  const achievedCount = enriched.filter(r => r.progressPercent >= 100).length;
  const warningCount = enriched.filter(r => r.progressPercent >= 80 && r.progressPercent < 100).length;
  const notAchievedCount = enriched.filter(r => r.progressPercent < 80).length;

  const handleCreate = async (data: Partial<ProgressRecord>) => { await apiPost<ProgressRecord>('/api/progress', data); setShowCreate(false); loadData(); };
  const handleUpdate = async (data: Partial<ProgressRecord>) => { if (!selectedRecord) return; await apiPut(`/api/progress/${selectedRecord.id}`, data); setShowEdit(false); loadData(); };
  const handleDelete = async (id: string) => { if (!confirm('Xóa bản ghi này?')) return; await apiDelete(`/api/progress/${id}`); loadData(); };

  const Form = ({ onSubmit, initial }: { onSubmit: (d: Partial<ProgressRecord>) => void; initial?: ProgressRecord }) => {
    const [form, setForm] = useState(initial || { planItemId: '', actualValue: 0, progressDate: new Date().toISOString().split('T')[0], note: '', updatedBy: '' });
    return (
      <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">KPI *</label><select value={form.planItemId} onChange={e => setForm({ ...form, planItemId: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required><option value="">-- Chọn KPI --</option>{planItems.map(pi => <option key={pi.id} value={pi.id}>{getKpiName(pi.indicatorId)} ({pi.targetValue})</option>)}</select></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Giá trị thực tế *</label><input type="number" value={form.actualValue} onChange={e => setForm({ ...form, actualValue: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required /></div>
          <div><label className="block text-sm font-medium mb-1">Ngày cập nhật</label><input type="date" value={form.progressDate} onChange={e => setForm({ ...form, progressDate: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Ghi chú</label><textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" rows={2} /></div>
        <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg-cream">Hủy</button><button type="submit" className="btn-primary">Lưu</button></div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Cập nhật tiến độ KPI</h1>
          <p className="text-text-light mt-1">Theo dõi và cập nhật kết quả thực hiện</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap bg-white border border-border rounded-lg overflow-hidden">
            {academicYears.map(ay => (
              <button key={ay.id} onClick={() => setSelectedYearId(ay.id)} className={`px-3 py-1.5 text-sm font-medium transition-colors ${selectedYearId === ay.id ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>{ay.name}</button>
            ))}
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Cập nhật mới</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary-light rounded-lg"><Clock size={20} className="text-primary" /></div><div><p className="text-text-light text-sm">Tổng KPI</p><p className="text-xl font-bold">{yearFilteredRecords.length}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-green/20 rounded-lg"><TrendingUp size={20} className="text-accent-green" /></div><div><p className="text-text-light text-sm">Đạt chỉ tiêu</p><p className="text-xl font-bold">{achievedCount}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-yellow/20 rounded-lg"><AlertTriangle size={20} className="text-accent-yellow" /></div><div><p className="text-text-light text-sm">Cần cải thiện</p><p className="text-xl font-bold">{warningCount}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-red/20 rounded-lg"><TrendingDown size={20} className="text-accent-red" /></div><div><p className="text-text-light text-sm">Chưa đạt</p><p className="text-xl font-bold">{notAchievedCount}</p></div></div></div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm KPI..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Tiến độ thực hiện KPI</h3></div>
        <div className="p-0">
          <div className="overflow-x-auto"><table className="table">
            <thead><tr><th>Mã KPI</th><th>Tên KPI</th><th>Chỉ tiêu</th><th>Thực tế</th><th>Tiến độ</th><th>Cập nhật</th><th>Ghi chú</th><th>Thao tác</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="text-center py-8">Đang tải...</td></tr> :
              filtered.length === 0 ? <tr><td colSpan={8} className="text-center py-8">Không có dữ liệu</td></tr> :
              filtered.map((item) => {
                const isAchieved = item.progressPercent >= 100;
                const isWarning = item.progressPercent >= 80 && item.progressPercent < 100;
                return (
                  <tr key={item.id}>
                    <td><span className="badge badge-info">{item.planItemId.substring(0, 15)}</span></td>
                    <td className="font-medium text-sm">{item.indicatorName}</td>
                    <td>{item.targetValue}</td>
                    <td className="font-bold">{item.actualValue}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-20"><div className="progress-fill" style={{ width: `${Math.min(item.progressPercent, 100)}%`, backgroundColor: isAchieved ? '#4caf50' : isWarning ? '#ffc107' : '#f44336' }} /></div>
                        <span className={`text-sm font-medium ${isAchieved ? 'text-accent-green' : isWarning ? 'text-accent-yellow' : 'text-accent-red'}`}>{item.progressPercent}%</span>
                      </div>
                    </td>
                    <td className="text-sm text-text-light">{item.progressDate ? new Date(item.progressDate).toLocaleDateString('vi-VN') : '-'}</td>
                    <td className="text-sm text-text-light max-w-[150px] truncate">{item.note || '-'}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedRecord(item); setShowEdit(true); }} className="p-1 hover:bg-blue-50 rounded" title="Chỉnh sửa"><Edit size={14} className="text-blue-600" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded" title="Xóa"><Trash2 size={14} className="text-red-600" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Cập nhật tiến độ mới"><Form onSubmit={handleCreate} /></Modal>
      <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setSelectedRecord(null); }} title="Chỉnh sửa tiến độ">{selectedRecord && <Form onSubmit={handleUpdate} initial={selectedRecord} />}</Modal>
    </div>
  );
}
