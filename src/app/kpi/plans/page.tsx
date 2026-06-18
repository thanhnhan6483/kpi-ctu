'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, FileText, Clock, CheckCircle, AlertTriangle, Edit, Trash2, Send, Eye, TrendingUp } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import unitsData from '@/data/units.json';
import indicatorsData from '@/data/indicators.json';
import unitKpisData from '@/data/unit-kpis.json';

interface PlanItem {
  id: string;
  indicatorId: string;
  indicatorName: string;
  targetValue: number;
  actualValue: number;
  unit: string;
  weight: number;
  dueDate: string;
  status: 'draft' | 'in_progress' | 'completed';
  note: string;
}

interface KPIPlan {
  id: string;
  unitId: string;
  unitName: string;
  cycleId: string;
  cycleName: string;
  status: string;
  items: PlanItem[];
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const statusFilters = [
  { value: 'all', label: 'Tất cả' },
  { value: 'draft', label: 'Nháp' },
  { value: 'submitted', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'in_progress', label: 'Đang theo dõi' },
  { value: 'evaluated', label: 'Đã đánh giá' },
  { value: 'locked', label: 'Đã khóa' },
];

const statusColors: Record<string, string> = {
  draft: '#9e9e9e', submitted: '#2196f3', needs_revision: '#ff9800', approved: '#4caf50',
  in_progress: '#00afef', evaluated: '#3f51b5', locked: '#607d8b',
};

const statusLabels: Record<string, string> = {
  draft: 'Nháp', submitted: 'Chờ duyệt', needs_revision: 'Yêu cầu chỉnh sửa',
  approved: 'Đã duyệt', in_progress: 'Đang theo dõi', evaluated: 'Đã đánh giá', locked: 'Đã khóa',
};

function getUnitKpis(unitId: string) {
  const unitKpiEntry = (unitKpisData as Record<string, unknown>[]).find((u: Record<string, unknown>) => {
    const unit = (unitsData as Record<string, unknown>[]).find((u2: Record<string, unknown>) => u2.id === unitId);
    return unit && u.code === unit.code;
  });
  return unitKpiEntry ? (unitKpiEntry.kpis as Array<Record<string, unknown>>) : [];
}

export default function KPIPlansPage() {
  const [plans, setPlans] = useState<KPIPlan[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<KPIPlan | null>(null);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [evalList, setEvalList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<{ id: string; name: string }[]>([]);
  const [filteredCycleIds, setFilteredCycleIds] = useState<string[]>([]);

  useEffect(() => {
    const yearId = localStorage.getItem('selectedAcademicYear');
    if (yearId) {
      fetch(`/api/cycles?academicYearId=${yearId}`)
        .then(r => r.json())
        .then(data => {
          setCycles(data);
          setFilteredCycleIds(data.map((c: any) => c.id));
        })
        .catch(() => {});
    }
  }, []);

  const loadPlans = useCallback(async () => {
    try {
      const [plansData, progressData, evidenceData, evalData] = await Promise.all([
        apiGet<KPIPlan[]>('/api/plans'),
        apiGet<any[]>('/api/progress'),
        apiGet<any[]>('/api/evidences'),
        apiGet<any[]>('/api/evaluation'),
      ]);
      setPlans(plansData);
      setProgressList(progressData);
      setEvidenceList(evidenceData);
      setEvalList(evalData);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  const cycleFilteredPlans = filteredCycleIds.length > 0
    ? plans.filter(p => filteredCycleIds.includes(p.cycleId))
    : plans;

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const filteredPlans = cycleFilteredPlans.filter(plan => {
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    const matchesSearch = plan.unitName.toLowerCase().includes(searchTerm.toLowerCase()) || plan.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const progressByPlanId: Record<string, any[]> = {};
  progressList.forEach(p => {
    if (!progressByPlanId[p.planId]) progressByPlanId[p.planId] = [];
    progressByPlanId[p.planId].push(p);
  });
  const evidenceByPlanId: Record<string, any[]> = {};
  evidenceList.forEach(e => {
    if (!evidenceByPlanId[e.planId]) evidenceByPlanId[e.planId] = [];
    evidenceByPlanId[e.planId].push(e);
  });
  const evalByPlanId: Record<string, any> = {};
  evalList.forEach(e => { evalByPlanId[e.planId] = e; });

  const handleCreate = async (data: Partial<KPIPlan>) => {
    await apiPost('/api/plans', data);
    setShowCreate(false);
    loadPlans();
  };

  const handleUpdate = async (data: Partial<KPIPlan>) => {
    if (!selectedPlan) return;
    await apiPut(`/api/plans/${selectedPlan.id}`, data);
    setShowEdit(false);
    setSelectedPlan(null);
    loadPlans();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa kế hoạch này?')) return;
    await apiDelete(`/api/plans/${id}`);
    loadPlans();
  };

  const handleSubmit = async (plan: KPIPlan) => {
    await apiPut(`/api/plans/${plan.id}`, { status: 'submitted', submittedAt: new Date().toISOString() });
    await apiPost('/api/approvals', {
      objectType: 'plan', objectId: plan.id, objectTitle: `Kế hoạch KPI ${plan.unitName}`,
      unitName: plan.unitName, submitter: plan.unitName,
    });
    loadPlans();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Kế hoạch KPI</h1>
          <p className="text-text-light mt-1">Quản lý kế hoạch KPI các đơn vị</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tạo kế hoạch mới
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><FileText size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng kế hoạch</p><p className="text-xl font-bold">{cycleFilteredPlans.length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div>
            <div><p className="text-text-light text-sm">Đã duyệt</p><p className="text-xl font-bold">{cycleFilteredPlans.filter(p => p.status === 'approved').length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><Clock size={20} className="text-accent-yellow" /></div>
            <div><p className="text-text-light text-sm">Chờ duyệt</p><p className="text-xl font-bold">{cycleFilteredPlans.filter(p => p.status === 'submitted').length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-red/20 rounded-lg"><AlertTriangle size={20} className="text-accent-red" /></div>
            <div><p className="text-text-light text-sm">Nháp</p><p className="text-xl font-bold">{cycleFilteredPlans.filter(p => p.status === 'draft').length}</p></div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm kế hoạch..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary">
          {statusFilters.map((f) => (<option key={f.value} value={f.value}>{f.label}</option>))}
        </select>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách kế hoạch</h3></div>
        <div className="p-0">
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th><th>Đơn vị</th><th>Chu kỳ</th><th>KPI</th><th>Tiến độ</th><th>MC</th><th>Điểm</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((plan) => {
                const planProgress = progressByPlanId[plan.id] || [];
                const avgProgress = planProgress.length > 0 ? planProgress.reduce((s: number, r: any) => s + (r.progressPercent || 0), 0) / planProgress.length : 0;
                const evCount = evidenceByPlanId[plan.id]?.length || 0;
                const planEval = evalByPlanId[plan.id];
                return (
                  <tr key={plan.id}>
                    <td><span className="badge badge-info">{plan.id}</span></td>
                    <td className="font-medium">{plan.unitName}</td>
                    <td className="text-sm">{plan.cycleName}</td>
                    <td>{plan.items.length}</td>
                    <td>
                      {planProgress.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="progress-bar w-16"><div className="progress-fill" style={{ width: `${Math.min(avgProgress, 100)}%`, backgroundColor: avgProgress >= 100 ? '#4caf50' : avgProgress >= 80 ? '#ffc107' : '#f44336' }} /></div>
                          <span className={`text-xs font-medium ${avgProgress >= 100 ? 'text-accent-green' : avgProgress >= 80 ? 'text-accent-yellow' : 'text-accent-red'}`}>{avgProgress.toFixed(0)}%</span>
                        </div>
                      ) : <span className="text-text-light text-xs">-</span>}
                    </td>
                    <td className="text-center text-sm">{evCount > 0 ? <span className="font-medium text-primary">{evCount}</span> : <span className="text-text-light">-</span>}</td>
                    <td className="text-center">
                      {planEval?.finalScore != null ? (
                        <span className="font-bold text-primary">{planEval.finalScore}</span>
                      ) : (
                        <span className="text-text-light text-xs">-</span>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: `${statusColors[plan.status] || '#9e9e9e'}20`, color: statusColors[plan.status] || '#9e9e9e' }}>
                        {statusLabels[plan.status] || plan.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedPlan(plan); setShowDetail(true); }} className="p-1 text-primary hover:bg-primary-light rounded" title="Xem"><Eye size={14} /></button>
                        {(plan.status === 'draft' || plan.status === 'needs_revision') && (
                          <>
                            <button onClick={() => { setSelectedPlan(plan); setShowEdit(true); }} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded" title="Sửa"><Edit size={14} /></button>
                            <button onClick={() => handleDelete(plan.id)} className="p-1 text-accent-red hover:bg-accent-red/10 rounded" title="Xóa"><Trash2 size={14} /></button>
                          </>
                        )}
                        {plan.status === 'draft' && (
                          <button onClick={() => handleSubmit(plan)} className="p-1 text-accent-green hover:bg-accent-green/10 rounded" title="Gửi duyệt"><Send size={14} /></button>
                        )}
                        <a href={`/kpi/progress?planId=${plan.id}`} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Xem tiến độ"><TrendingUp size={14} /></a>
                        <a href={`/kpi/evidences?planId=${plan.id}`} className="p-1 text-green-500 hover:bg-green-50 rounded" title="Xem minh chứng"><FileText size={14} /></a>
                        <a href={`/kpi/evaluation?planId=${plan.id}`} className="p-1 text-purple-500 hover:bg-purple-50 rounded" title="Xem đánh giá"><CheckCircle size={14} /></a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo kế hoạch KPI mới">
        <PlanForm cycles={cycles} onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setSelectedPlan(null); }} title="Sửa kế hoạch KPI">
        {selectedPlan && <PlanForm plan={selectedPlan} cycles={cycles} onSubmit={handleUpdate} onCancel={() => { setShowEdit(false); setSelectedPlan(null); }} />}
      </Modal>

      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelectedPlan(null); }} title="Chi tiết kế hoạch KPI" maxWidth="max-w-4xl">
        {selectedPlan && <PlanDetail plan={selectedPlan} />}
      </Modal>
    </div>
  );
}

function PlanForm({ plan, cycles, onSubmit, onCancel }: { plan?: KPIPlan; cycles: { id: string; name: string }[]; onSubmit: (data: Partial<KPIPlan>) => void; onCancel: () => void }) {
  const [unitId, setUnitId] = useState(plan?.unitId || '');
  const [cycleId, setCycleId] = useState(plan?.cycleId || cycles[0]?.id || '');
  const [items, setItems] = useState<PlanItem[]>(plan?.items || []);

  const selectedUnit = (unitsData as Record<string, unknown>[]).find((u: Record<string, unknown>) => u.id === unitId) as Record<string, unknown> | undefined;
  const unitKpis = getUnitKpis(unitId);

  useEffect(() => {
    if (unitId && !plan) {
      const kpis = getUnitKpis(unitId);
      setItems(kpis.map((k: Record<string, unknown>) => ({
        id: `item-${k.id}`,
        indicatorId: k.id as string,
        indicatorName: k.name as string,
        targetValue: k.target as number,
        actualValue: 0,
        unit: k.unit as string,
        weight: k.weight as number,
        dueDate: '2026-06-30',
        status: 'draft' as const,
        note: '',
      })));
    }
  }, [unitId, plan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      unitId,
      unitName: (selectedUnit?.name as string) || '',
      cycleId,
      cycleName: cycles.find((c) => c.id === cycleId)?.name || '',
      items,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Đơn vị *</label>
          <select value={unitId} onChange={(e) => setUnitId(e.target.value)} required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="">-- Chọn đơn vị --</option>
            {(unitsData as Record<string, unknown>[]).filter((u: Record<string, unknown>) => u.type !== 'university').map((u: Record<string, unknown>) => (
              <option key={u.id as string} value={u.id as string}>{u.name as string}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Chu kỳ KPI</label>
          <select value={cycleId} onChange={(e) => setCycleId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {items.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Chỉ tiêu KPI ({items.length} KPI)</label>
          <div className="max-h-[300px] overflow-y-auto border border-border rounded-lg">
            <table className="table text-xs">
              <thead><tr><th>Mã</th><th>Tên KPI</th><th>Chỉ tiêu</th><th>Đơn vị</th><th>Trọng số</th><th>Hạn</th></tr></thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td><span className="badge badge-info text-[10px]">{item.indicatorId}</span></td>
                    <td>{item.indicatorName}</td>
                    <td>
                      <input type="number" value={item.targetValue} onChange={(e) => {
                        const newItems = [...items]; newItems[idx] = { ...newItems[idx], targetValue: Number(e.target.value) }; setItems(newItems);
                      }} className="w-16 px-1 py-0.5 border rounded text-xs" />
                    </td>
                    <td>{item.unit}</td>
                    <td>{item.weight}%</td>
                    <td>
                      <input type="date" value={item.dueDate} onChange={(e) => {
                        const newItems = [...items]; newItems[idx] = { ...newItems[idx], dueDate: e.target.value }; setItems(newItems);
                      }} className="px-1 py-0.5 border rounded text-xs" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
        <button type="submit" className="btn-primary">{plan ? 'Cập nhật' : 'Tạo mới'}</button>
      </div>
    </form>
  );
}

function PlanDetail({ plan }: { plan: KPIPlan }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div><span className="text-xs text-text-light">Mã kế hoạch</span><div className="font-medium">{plan.id}</div></div>
        <div><span className="text-xs text-text-light">Đơn vị</span><div className="font-medium">{plan.unitName}</div></div>
        <div><span className="text-xs text-text-light">Chu kỳ</span><div className="font-medium">{plan.cycleName}</div></div>
        <div><span className="text-xs text-text-light">Trạng thái</span><div>
          <span className="badge" style={{ backgroundColor: `${statusColors[plan.status]}20`, color: statusColors[plan.status] }}>
            {statusLabels[plan.status]}
          </span>
        </div></div>
        <div><span className="text-xs text-text-light">Ngày tạo</span><div className="font-medium">{new Date(plan.createdAt).toLocaleDateString('vi-VN')}</div></div>
        <div><span className="text-xs text-text-light">Cập nhật</span><div className="font-medium">{new Date(plan.updatedAt).toLocaleDateString('vi-VN')}</div></div>
      </div>
      {plan.items.length > 0 && (
        <div>
          <h4 className="font-heading font-bold text-sm mb-2">Chi tiết chỉ tiêu ({plan.items.length} KPI)</h4>
          <table className="table text-xs">
            <thead><tr><th>Mã</th><th>Tên KPI</th><th>Chỉ tiêu</th><th>Thực tế</th><th>Tỷ lệ</th><th>Trọng số</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead>
            <tbody>
              {plan.items.map((item) => {
                const rate = item.targetValue > 0 ? (item.actualValue / item.targetValue * 100) : 0;
                return (
                  <tr key={item.id}>
                    <td><span className="badge badge-info">{item.indicatorId}</span></td>
                    <td>{item.indicatorName}</td>
                    <td>{item.targetValue}{item.unit}</td>
                    <td className="font-bold">{item.actualValue}{item.unit}</td>
                    <td><span className={rate >= 100 ? 'text-accent-green' : rate >= 80 ? 'text-accent-yellow' : 'text-accent-red'}>{rate.toFixed(1)}%</span></td>
                    <td>{item.weight}%</td>
                    <td>
                      <span className={`badge ${item.status === 'completed' ? 'badge-success' : item.status === 'in_progress' ? 'badge-info' : 'badge-warning'}`}>
                        {item.status === 'completed' ? 'Hoàn thành' : item.status === 'in_progress' ? 'Đang thực hiện' : 'Nháp'}
                      </span>
                    </td>
                    <td className="text-text-light max-w-[150px] truncate">{item.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
