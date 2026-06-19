'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Edit, CheckCircle, AlertTriangle, Search, Plus, Trash2, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import unitKpisData from '@/data/unit-kpis.json';
import academicYears from '@/data/academic-years.json';

interface CycleRecord {
  id: string;
  academicYearId: string;
  name: string;
}

interface ProgressRecord {
  id: string;
  planItemId: string;
  actualValue: number;
  progressDate: string;
  note: string;
  updatedBy: string;
  level?: string;
  personId?: string;
  personName?: string;
  positionCode?: string;
}

interface PlanItemRecord {
  id: string;
  planId: string;
  indicatorId: string;
  targetValue: number;
  weight: number;
  dueDate: string;
}

interface PlanRecord {
  id: string;
  name: string;
  cycleId: string;
  unitId: string;
  status: string;
}

interface UnitKpi {
  id: string;
  name: string;
  code: string;
  kpis: { id: string; name: string; indicatorId: string | null }[];
}

function getKpiName(indicatorId: string): string {
  for (const unit of unitKpisData as UnitKpi[]) {
    const kpi = unit.kpis.find(k => k.indicatorId === indicatorId);
    if (kpi) return kpi.name;
  }
  return indicatorId;
}

function getUnitName(unitId: string): string {
  const unit = (unitKpisData as UnitKpi[]).find(u => u.id === unitId);
  return unit?.name || unitId;
}

const groups = ['Tất cả', 'Đào tạo', 'KHCN', 'Đội ngũ', 'Quốc tế', 'CĐS', 'Phục vụ'];

export default function ProgressPage() {
  const [selectedYearId, setSelectedYearId] = useState('ay002');
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [planItems, setPlanItems] = useState<PlanItemRecord[]>([]);
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('Tất cả');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ProgressRecord | null>(null);
  const [indicatorFilter, setIndicatorFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const iid = params.get('indicatorId');
    if (iid) setIndicatorFilter(iid);
    fetch('/api/cycles')
      .then(r => r.json())
      .then(data => setCycles(data))
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [plansData, planItemsData, progressData] = await Promise.all([
        apiGet<PlanRecord[]>('/api/plans'),
        apiGet<PlanItemRecord[]>('/api/plan-items'),
        apiGet<ProgressRecord[]>('/api/progress'),
      ]);
      setPlans(plansData);
      setPlanItems(planItemsData);
      setRecords(progressData);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const cycleYearMap = new Map(cycles.map(c => [c.id, c.academicYearId]));
  const planItemMap = new Map(planItems.map(pi => [pi.id, pi]));
  const planMap = new Map(plans.map(p => [p.id, p]));

  const enrichedRecords = records.map(r => {
    const pi = planItemMap.get(r.planItemId);
    const plan = pi ? planMap.get(pi.planId) : undefined;
    const targetValue = pi?.targetValue ?? 0;
    const progressPercent = targetValue > 0 ? Math.round((r.actualValue / targetValue) * 100) : 0;
    return {
      ...r,
      indicatorId: pi?.indicatorId ?? '',
      indicatorName: pi ? getKpiName(pi.indicatorId) : '',
      unitName: plan ? getUnitName(plan.unitId) : '',
      targetValue,
      progressPercent,
      cycleId: plan?.cycleId ?? '',
    };
  });

  const yearFilteredRecords = enrichedRecords.filter(r => {
    const yearId = cycleYearMap.get(r.cycleId);
    return !yearId || yearId === selectedYearId;
  });

  const filtered = yearFilteredRecords.filter((p) => {
    const matchesSearch = p.indicatorName.toLowerCase().includes(searchTerm.toLowerCase()) || p.planItemId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndicator = !indicatorFilter || p.indicatorId === indicatorFilter;
    return matchesSearch && matchesIndicator;
  });

  const achievedCount = yearFilteredRecords.filter((p) => p.progressPercent >= 100).length;
  const warningCount = yearFilteredRecords.filter((p) => p.progressPercent >= 80 && p.progressPercent < 100).length;
  const notAchievedCount = yearFilteredRecords.filter((p) => p.progressPercent < 80).length;

  const handleCreate = async (data: Partial<ProgressRecord>) => {
    await apiPost('/api/progress', data);
    setShowCreate(false);
    loadData();
  };

  const handleUpdate = async (data: Partial<ProgressRecord>) => {
    if (!selectedRecord) return;
    await apiPut(`/api/progress/${selectedRecord.id}`, data);
    setShowEdit(false);
    setSelectedRecord(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa bản ghi này?')) return;
    await apiDelete(`/api/progress/${id}`);
    loadData();
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
              <button key={ay.id} onClick={() => setSelectedYearId(ay.id)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${selectedYearId === ay.id ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>
                {ay.name}
              </button>
            ))}
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Cập nhật mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><Clock size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng KPI</p><p className="text-xl font-bold">{yearFilteredRecords.length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><TrendingUp size={20} className="text-accent-green" /></div>
            <div><p className="text-text-light text-sm">Đạt chỉ tiêu</p><p className="text-xl font-bold">{achievedCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><AlertTriangle size={20} className="text-accent-yellow" /></div>
            <div><p className="text-text-light text-sm">Cần cải thiện</p><p className="text-xl font-bold">{warningCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-red/20 rounded-lg"><TrendingDown size={20} className="text-accent-red" /></div>
            <div><p className="text-text-light text-sm">Chưa đạt</p><p className="text-xl font-bold">{notAchievedCount}</p></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm KPI..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Tiến độ thực hiện KPI</h3></div>
        <div className="p-0">
          <div className="overflow-x-auto"><table className="table">
            <thead>
              <tr><th>Mã KPI</th><th>Tên KPI</th><th>Đơn vị</th><th>Chỉ tiêu</th><th>Thực tế</th><th>Tiến độ</th><th>MC</th><th>Cập nhật</th><th>Ghi chú</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isAchieved = item.progressPercent >= 100;
                const isWarning = item.progressPercent >= 80 && item.progressPercent < 100;
                return (
                  <tr key={item.id}>
                    <td><span className="badge badge-info">{item.planItemId}</span></td>
                    <td className="font-medium text-sm">{item.indicatorName}</td>
                    <td className="text-sm">{item.unitName}</td>
                    <td>{item.targetValue}</td>
                    <td className="font-bold">{item.actualValue}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-20">
                          <div className="progress-fill" style={{ width: `${Math.min(item.progressPercent, 100)}%`, backgroundColor: isAchieved ? '#4caf50' : isWarning ? '#ffc107' : '#f44336' }} />
                        </div>
                        <span className={`text-sm font-medium ${isAchieved ? 'text-accent-green' : isWarning ? 'text-accent-yellow' : 'text-accent-red'}`}>
                          {item.progressPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <a href={`/kpi/evidences?planItemId=${item.planItemId}`} className="text-primary hover:underline text-sm">
                        <FileText size={14} className="inline" />
                      </a>
                    </td>
                    <td className="text-xs text-text-light">{new Date(item.progressDate).toLocaleDateString('vi-VN')}</td>
                    <td className="text-xs max-w-[150px] truncate">{item.note}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedRecord(item); setShowEdit(true); }} className="p-1 text-primary hover:bg-primary-light rounded"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-accent-red hover:bg-accent-red/10 rounded"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Cập nhật tiến độ mới">
        <ProgressForm plans={plans} planItems={planItems} onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setSelectedRecord(null); }} title="Sửa tiến độ">
        {selectedRecord && <ProgressForm record={selectedRecord} plans={plans} planItems={planItems} onSubmit={handleUpdate} onCancel={() => { setShowEdit(false); setSelectedRecord(null); }} />}
      </Modal>
    </div>
  );
}

function ProgressForm({ record, plans, planItems, onSubmit, onCancel }: { record?: ProgressRecord; plans: PlanRecord[]; planItems: PlanItemRecord[]; onSubmit: (data: Partial<ProgressRecord>) => void; onCancel: () => void }) {
  const [selectedPlanId, setSelectedPlanId] = useState(() => {
    if (record) {
      const pi = planItems.find(p => p.id === record.planItemId);
      return pi?.planId || '';
    }
    return '';
  });
  const [planItemId, setPlanItemId] = useState(record?.planItemId || '');
  const [actualValue, setActualValue] = useState(record?.actualValue || 0);
  const [note, setNote] = useState(record?.note || '');

  const approvedPlans = plans.filter(p => p.status === 'approved');
  const filteredPlanItems = planItems.filter(pi => pi.planId === selectedPlanId);
  const selectedPlanItem = planItems.find(pi => pi.id === planItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      planItemId,
      actualValue,
      note,
      progressDate: new Date().toISOString(),
      updatedBy: 'Admin',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Kế hoạch *</label>
          <select value={selectedPlanId} onChange={(e) => { setSelectedPlanId(e.target.value); setPlanItemId(''); }} required disabled={!!record}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary disabled:opacity-50">
            <option value="">-- Chọn Kế hoạch --</option>
            {approvedPlans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Chỉ tiêu KPI *</label>
          <select value={planItemId} onChange={(e) => setPlanItemId(e.target.value)} required disabled={!!record}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary disabled:opacity-50">
            <option value="">-- Chọn chỉ tiêu --</option>
            {filteredPlanItems.map((pi) => (
              <option key={pi.id} value={pi.id}>{getKpiName(pi.indicatorId)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Thực tế *</label>
          <input type="number" value={actualValue} onChange={(e) => setActualValue(Number(e.target.value))} required step="any"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Chỉ tiêu (từ KH)</label>
          <input type="number" value={selectedPlanItem?.targetValue ?? 0} disabled
            className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-gray-50 focus:outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Ghi chú</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
      </div>
      {selectedPlanItem && selectedPlanItem.targetValue > 0 && (
        <div className="p-3 bg-bg-cream rounded-lg border border-border">
          <span className="text-sm text-text-light">Tỉ lệ hoàn thành: </span>
          <span className={`font-bold ${actualValue / selectedPlanItem.targetValue * 100 >= 100 ? 'text-accent-green' : 'text-accent-red'}`}>
            {(actualValue / selectedPlanItem.targetValue * 100).toFixed(1)}%
          </span>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
        <button type="submit" className="btn-primary">{record ? 'Cập nhật' : 'Thêm mới'}</button>
      </div>
    </form>
  );
}
