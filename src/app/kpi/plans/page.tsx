'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, Search, Plus, Eye, Send, XCircle, MessageSquare, Edit } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import unitKpisData from '@/data/unit-kpis.json';

interface PlanRecord {
  id: string;
  cycleId: string;
  ownerType: string;
  ownerId: string;
  status: string;
  submittedAt?: string;
  approvedAt?: string;
  createdAt?: string;
}

interface UnitKPIEntry {
  id: string;
  name: string;
  code: string;
  type: string;
  level: string;
  description: string;
  kpiCount: number;
  kpis: { id: string; name: string; indicatorId: string | null }[];
}

interface CycleRecord {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Bản nháp', color: '#6b7280' },
  submitted: { label: 'Chờ duyệt', color: '#eab308' },
  needs_revision: { label: 'Cần chỉnh sửa', color: '#f97316' },
  approved: { label: 'Đã duyệt', color: '#22c55e' },
  in_progress: { label: 'Đang thực hiện', color: '#3b82f6' },
};

const statusFilters = [
  { value: 'all', label: 'Tất cả' },
  { value: 'draft', label: 'Bản nháp' },
  { value: 'submitted', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
];

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [unitMap, setUnitMap] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanRecord | null>(null);
  const [showAction, setShowAction] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'revision' | 'reject'>('approve');
  const [actionNote, setActionNote] = useState('');

  useEffect(() => {
    const yearId = localStorage.getItem('selectedAcademicYear');
    if (yearId) {
      fetch(`/api/cycles?academicYearId=${yearId}`)
        .then(r => r.json())
        .then(data => setCycles(data))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    fetch('/api/unit-kpis')
      .then(r => r.json())
      .then(data => {
        const map: Record<string, string> = {};
        (data as UnitKPIEntry[]).forEach(u => { map[u.id] = u.name; });
        setUnitMap(map);
      })
      .catch(() => {});
  }, []);

  const loadPlans = useCallback(async () => {
    try {
      const data = await apiGet<PlanRecord[]>('/api/plans');
      setPlans(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const activeCycleIds = cycles.map(c => c.id);
  const cycleFilteredPlans = activeCycleIds.length > 0
    ? plans.filter(p => activeCycleIds.includes(p.cycleId))
    : plans;

  const filtered = cycleFilteredPlans.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const unitName = unitMap[p.ownerId] || '';
    const cycleName = cycles.find(c => c.id === p.cycleId)?.name || '';
    const matchesSearch = unitName.toLowerCase().includes(searchTerm.toLowerCase()) || cycleName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const draftCount = cycleFilteredPlans.filter(p => p.status === 'draft').length;
  const submittedCount = cycleFilteredPlans.filter(p => p.status === 'submitted').length;
  const approvedCount = cycleFilteredPlans.filter(p => p.status === 'approved').length;

  const handleCreate = async (cycleId: string, unitId: string) => {
    const plan = await apiPost<PlanRecord>('/api/plans', { cycleId, ownerType: 'unit', ownerId: unitId });
    const unit = (unitKpisData as UnitKPIEntry[]).find(u => u.id === unitId);
    if (unit) {
      for (const kpi of unit.kpis) {
        const item = await apiPost<{ id: string }>('/api/plan-items', {
          planId: plan.id,
          indicatorId: kpi.indicatorId || kpi.id,
          targetValue: 0,
          weight: 0,
          dueDate: '',
        });
        await apiPost('/api/scores', { planItemId: item.id, selfScore: 0, managerScore: 0, councilScore: 0, finalScore: 0 });
      }
    }
    setShowCreate(false);
    loadPlans();
  };

  const handleSubmit = async () => {
    if (!selectedPlan) return;
    await apiPost(`/api/plans/${selectedPlan.id}/submit`, {});
    setShowSubmit(false);
    setSelectedPlan(null);
    loadPlans();
  };

  const handleAction = async () => {
    if (!selectedPlan) return;
    if (actionType === 'approve') {
      await apiPost(`/api/plans/${selectedPlan.id}/approve`, {});
    } else if (actionType === 'revision') {
      await apiPost(`/api/plans/${selectedPlan.id}/revision`, { note: actionNote });
    } else {
      await apiPut(`/api/plans/${selectedPlan.id}`, { status: 'draft' });
    }
    setShowAction(false);
    setSelectedPlan(null);
    setActionNote('');
    loadPlans();
  };

  const openSubmit = (plan: PlanRecord) => {
    setSelectedPlan(plan);
    setShowSubmit(true);
  };

  const openAction = (plan: PlanRecord, type: 'approve' | 'revision' | 'reject') => {
    setSelectedPlan(plan);
    setActionType(type);
    setActionNote('');
    setShowAction(true);
  };

  const getCycleName = (cycleId: string) => cycles.find(c => c.id === cycleId)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Kế hoạch KPI</h1>
          <p className="text-text-light mt-1">Quản lý kế hoạch thực hiện KPI các đơn vị</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tạo kế hoạch
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
            <div><p className="text-text-light text-sm">Đã duyệt</p><p className="text-xl font-bold">{approvedCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><Clock size={20} className="text-accent-yellow" /></div>
            <div><p className="text-text-light text-sm">Chờ duyệt</p><p className="text-xl font-bold">{submittedCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg"><Edit size={20} className="text-gray-500" /></div>
            <div><p className="text-text-light text-sm">Bản nháp</p><p className="text-xl font-bold">{draftCount}</p></div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="flex gap-2">
          {statusFilters.map((s) => (
            <button key={s.value} onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === s.value ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách kế hoạch</h3></div>
        <div className="p-0">
          <table className="table">
            <thead>
              <tr><th>Đơn vị</th><th>Chu kỳ</th><th>Trạng thái</th><th>Ngày tạo</th><th>Ngày gửi duyệt</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filtered.map((plan) => {
                const status = statusConfig[plan.status] || statusConfig.draft;
                const unitName = unitMap[plan.ownerId] || plan.ownerId;
                return (
                  <tr key={plan.id}>
                    <td className="text-sm font-medium">{unitName}</td>
                    <td className="text-sm">{getCycleName(plan.cycleId)}</td>
                    <td>
                      <span className="badge flex items-center gap-1 w-fit" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                        {status.label}
                      </span>
                    </td>
                    <td className="text-sm text-text-light">{plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                    <td className="text-sm text-text-light">{plan.submittedAt ? new Date(plan.submittedAt).toLocaleDateString('vi-VN') : '-'}</td>
                    <td>
                      <div className="flex gap-1">
                        {plan.status === 'draft' && (
                          <button onClick={() => openSubmit(plan)} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded" title="Gửi duyệt"><Send size={14} /></button>
                        )}
                        {plan.status === 'submitted' && (
                          <>
                            <button onClick={() => openAction(plan, 'approve')} className="p-1 text-accent-green hover:bg-accent-green/10 rounded" title="Phê duyệt"><CheckCircle size={14} /></button>
                            <button onClick={() => openAction(plan, 'revision')} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded" title="Yêu cầu chỉnh sửa"><MessageSquare size={14} /></button>
                            <button onClick={() => openAction(plan, 'reject')} className="p-1 text-accent-red hover:bg-accent-red/10 rounded" title="Từ chối"><XCircle size={14} /></button>
                          </>
                        )}
                        {(plan.status === 'approved' || plan.status === 'in_progress') && (
                          <button className="p-1 text-primary hover:bg-primary-light rounded" title="Xem"><Eye size={14} /></button>
                        )}
                        {plan.status === 'needs_revision' && (
                          <>
                            <button className="p-1 text-primary hover:bg-primary-light rounded" title="Sửa"><Edit size={14} /></button>
                            <button onClick={() => openSubmit(plan)} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded" title="Gửi duyệt"><Send size={14} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo kế hoạch mới">
        <CreatePlanForm
          unitKpisData={unitKpisData as UnitKPIEntry[]}
          cycles={cycles}
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      <Modal isOpen={showSubmit} onClose={() => { setShowSubmit(false); setSelectedPlan(null); }} title="Gửi duyệt kế hoạch">
        <div className="space-y-4">
          <div className="p-4 bg-bg-cream rounded-lg border border-border">
            <div className="font-medium text-sm">Đơn vị: {selectedPlan ? unitMap[selectedPlan.ownerId] || selectedPlan.ownerId : '-'}</div>
            <div className="text-xs text-text-light mt-1">Chu kỳ: {selectedPlan ? getCycleName(selectedPlan.cycleId) : '-'}</div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => { setShowSubmit(false); setSelectedPlan(null); }} className="btn-secondary">Hủy</button>
            <button onClick={handleSubmit} className="btn-primary">Gửi duyệt</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAction} onClose={() => { setShowAction(false); setSelectedPlan(null); }}
        title={actionType === 'approve' ? 'Phê duyệt' : actionType === 'reject' ? 'Từ chối' : 'Yêu cầu chỉnh sửa'}>
        <div className="space-y-4">
          <div className="p-4 bg-bg-cream rounded-lg border border-border">
            <div className="font-medium text-sm">Đơn vị: {selectedPlan ? unitMap[selectedPlan.ownerId] || selectedPlan.ownerId : '-'}</div>
            <div className="text-xs text-text-light mt-1">Chu kỳ: {selectedPlan ? getCycleName(selectedPlan.cycleId) : '-'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">
              {actionType === 'approve' ? 'Nhận xét (tùy chọn)' : 'Nội dung *'}
            </label>
            <textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)} rows={3}
              placeholder={actionType === 'approve' ? 'Nhận xét...' : 'Nhập nội dung...'}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => { setShowAction(false); setSelectedPlan(null); }} className="btn-secondary">Hủy</button>
            <button onClick={handleAction}
              className={actionType === 'approve' ? 'btn-primary' : actionType === 'reject' ? 'btn-danger' : 'btn-secondary'}>
              {actionType === 'approve' ? 'Phê duyệt' : actionType === 'reject' ? 'Từ chối' : 'Gửi yêu cầu'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CreatePlanForm({ unitKpisData, cycles, onSubmit, onCancel }: {
  unitKpisData: UnitKPIEntry[];
  cycles: CycleRecord[];
  onSubmit: (cycleId: string, unitId: string) => void;
  onCancel: () => void;
}) {
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedCycleId, setSelectedCycleId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedCycleId, selectedUnitId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Đơn vị *</label>
        <select value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)} required
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
          <option value="">-- Chọn đơn vị --</option>
          {unitKpisData.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Chu kỳ *</label>
        <select value={selectedCycleId} onChange={(e) => setSelectedCycleId(e.target.value)} required
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
          <option value="">-- Chọn chu kỳ --</option>
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {selectedUnitId && selectedCycleId && (
        <div className="p-3 bg-bg-cream rounded-lg border border-border">
          <span className="text-sm text-text-light">Số lượng KPI sẽ được tạo: </span>
          <span className="font-bold">
            {(unitKpisData.find(u => u.id === selectedUnitId)?.kpis.length || 0)}
          </span>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
        <button type="submit" className="btn-primary">Tạo kế hoạch</button>
      </div>
    </form>
  );
}
