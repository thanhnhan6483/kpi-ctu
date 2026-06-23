'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, Search, Plus, Eye, Send, XCircle, MessageSquare, Edit, History, PenLine, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import unitKpisData from '@/data/unit-kpis.json';
import academicYears from '@/data/academic-years.json';
import usersData from '@/data/users.json';
import type { KPITemplate, KPITemplateItem } from '@/types';

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
  committed: { label: 'Đã cam kết', color: '#8b5cf6' },
  in_progress: { label: 'Đang thực hiện', color: '#3b82f6' },
};

const statusFilters = [
  { value: 'all', label: 'Tất cả' },
  { value: 'draft', label: 'Bản nháp' },
  { value: 'submitted', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'committed', label: 'Đã cam kết' },
];

export default function PlansPage() {
  const [selectedYearId, setSelectedYearId] = useState('ay002');
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [templates, setTemplates] = useState<KPITemplate[]>([]);
  const [templateItems, setTemplateItems] = useState<KPITemplateItem[]>([]);
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
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [showCommit, setShowCommit] = useState(false);
  const [commitPlan, setCommitPlan] = useState<PlanRecord | null>(null);
  const [commitChecked, setCommitChecked] = useState(false);
  const [commitDate, setCommitDate] = useState(new Date().toISOString().split('T')[0]);
  const [detailPlan, setDetailPlan] = useState<PlanRecord | null>(null);
  const [planItems, setPlanItems] = useState<any[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  useEffect(() => {
    fetch(`/api/cycles?academicYearId=${selectedYearId}`)
      .then(r => r.json())
      .then(data => setCycles(data))
      .catch(() => {});
  }, [selectedYearId]);

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

  useEffect(() => {
    Promise.all([
      apiGet<KPITemplate[]>('/api/kpi-templates'),
      apiGet<KPITemplateItem[]>('/api/kpi-template-items'),
    ]).then(([t, ti]) => { setTemplates(t); setTemplateItems(ti); }).catch(() => {});
  }, []);

  const [indicators, setIndicators] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    apiGet<{ id: string; name: string }[]>('/api/indicators').then(setIndicators).catch(() => {});
  }, []);
  const indicatorMap: Record<string, { name: string }> = {};
  indicators.forEach(i => { indicatorMap[i.id] = { name: i.name }; });
  (unitKpisData as UnitKPIEntry[]).forEach(u => {
    u.kpis.forEach(k => { if (k.id && !indicatorMap[k.id]) indicatorMap[k.id] = { name: k.name }; });
  });

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

  const handleCreate = async (cycleId: string, unitId: string, templateId: string) => {
    const plan = await apiPost<PlanRecord>('/api/plans', { cycleId, ownerType: 'unit', ownerId: unitId });

    const cascadeItems = await apiGet<{ indicatorId: string; indicatorName: string; targetValue: number; weight: number; dueDate: string }[]>(
      `/api/cascade-assignments?cycleId=${cycleId}&toUnitId=${unitId}`
    );

    const addedIndicatorIds = new Set<string>();

    for (const c of cascadeItems) {
      const item = await apiPost<{ id: string }>('/api/plan-items', {
        planId: plan.id, indicatorId: c.indicatorId,
        targetValue: c.targetValue, weight: c.weight, dueDate: c.dueDate || '',
      });
      await apiPost('/api/scores', { planItemId: item.id, selfScore: 0, managerScore: 0, councilScore: 0, finalScore: 0 });
      addedIndicatorIds.add(c.indicatorId);
    }

    if (templateId) {
      const tItems = templateItems.filter(ti => ti.templateId === templateId);
      for (const ti of tItems) {
        if (addedIndicatorIds.has(ti.indicatorId)) continue;
        const item = await apiPost<{ id: string }>('/api/plan-items', {
          planId: plan.id, indicatorId: ti.indicatorId,
          targetValue: ti.targetValue || 0, weight: ti.weight, dueDate: '',
        });
        await apiPost('/api/scores', { planItemId: item.id, selfScore: 0, managerScore: 0, councilScore: 0, finalScore: 0 });
        addedIndicatorIds.add(ti.indicatorId);
      }
    }

    if (addedIndicatorIds.size === 0) {
      const unit = (unitKpisData as UnitKPIEntry[]).find(u => u.id === unitId);
      if (unit) {
        for (const kpi of unit.kpis) {
          const item = await apiPost<{ id: string }>('/api/plan-items', {
            planId: plan.id, indicatorId: kpi.indicatorId || kpi.id,
            targetValue: 0, weight: 0, dueDate: '',
          });
          await apiPost('/api/scores', { planItemId: item.id, selfScore: 0, managerScore: 0, councilScore: 0, finalScore: 0 });
        }
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

  const openVersions = async (planId: string) => {
    setVersionsLoading(true);
    try {
      const res = await fetch(`/api/plan-versions?planId=${planId}`);
      setVersions(await res.json());
    } catch { setVersions([]); }
    setVersionsLoading(false);
    setShowVersions(true);
  };

  const getCycleName = (cycleId: string) => cycles.find(c => c.id === cycleId)?.name || '';

  const openDetail = async (plan: PlanRecord) => {
    setDetailPlan(plan);
    const items = await apiGet<any[]>(`/api/plan-items?planId=${plan.id}`);
    setPlanItems(items);
    setShowDetail(true);
  };

  const openCommit = (plan: PlanRecord) => {
    setCommitPlan(plan);
    setCommitChecked(false);
    setCommitDate(new Date().toISOString().split('T')[0]);
    setShowCommit(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Xóa kế hoạch này?')) return;
    await apiDelete(`/api/plans/${planId}`);
    loadPlans();
  };

  const handleCommit = async () => {
    if (!commitPlan || !commitChecked) return;
    await apiPut(`/api/plans/${commitPlan.id}`, { status: 'committed', committedAt: new Date(commitDate).toISOString() });
    await apiPost('/api/audit-logs', {
      userId: 'current-user',
      action: 'commit',
      objectType: 'kpi_plan',
      objectId: commitPlan.id,
      detail: `Ký cam kết kế hoạch KPI đơn vị ${unitMap[commitPlan.ownerId] || commitPlan.ownerId} - ngày ${commitDate}`,
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    });
    setShowCommit(false);
    setCommitPlan(null);
    loadPlans();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Kế hoạch KPI</h1>
          <p className="text-text-light mt-1">Quản lý kế hoạch thực hiện KPI các đơn vị</p>
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
            <Plus size={16} /> Tạo kế hoạch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="flex flex-wrap gap-2">
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
          <div className="overflow-x-auto"><table className="table">
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
                        <button onClick={() => openDetail(plan)} className="p-1 text-primary hover:bg-primary-light rounded" title="Xem chi tiết"><Eye size={14} /></button>
                        {plan.status === 'draft' && (
                          <>
                            <button onClick={() => openSubmit(plan)} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded" title="Gửi duyệt"><Send size={14} /></button>
                            <button onClick={() => handleDeletePlan(plan.id)} className="p-1 text-accent-red hover:bg-accent-red/10 rounded" title="Xóa"><Trash2 size={14} /></button>
                          </>
                        )}
                        {plan.status === 'submitted' && (
                          <>
                            <button onClick={() => openAction(plan, 'approve')} className="p-1 text-accent-green hover:bg-accent-green/10 rounded" title="Phê duyệt"><CheckCircle size={14} /></button>
                            <button onClick={() => openAction(plan, 'revision')} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded" title="Yêu cầu chỉnh sửa"><MessageSquare size={14} /></button>
                            <button onClick={() => openAction(plan, 'reject')} className="p-1 text-accent-red hover:bg-accent-red/10 rounded" title="Từ chối"><XCircle size={14} /></button>
                          </>
                        )}
                        {plan.status === 'approved' && (
                          <>
                            <button className="p-1 text-primary hover:bg-primary-light rounded" title="Xem"><Eye size={14} /></button>
                            <button onClick={() => openCommit(plan)} className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Ký cam kết"><PenLine size={14} /></button>
                          </>
                        )}
                        {plan.status === 'in_progress' && (
                          <button className="p-1 text-primary hover:bg-primary-light rounded" title="Xem"><Eye size={14} /></button>
                        )}
                        {plan.status === 'committed' && (
                          <>
                            <button className="p-1 text-primary hover:bg-primary-light rounded" title="Xem"><Eye size={14} /></button>
                            <span className="badge text-xs" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>Đã cam kết</span>
                          </>
                        )}
                        <button onClick={() => openVersions(plan.id)} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="Lịch sử phiên bản"><History size={14} /></button>
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
          </table></div>
        </div>
      </div>

      <Modal isOpen={showVersions} onClose={() => setShowVersions(false)} title="Lịch sử phiên bản">
        <div className="space-y-3">
          {versionsLoading ? <div className="text-center py-8 text-text-light">Đang tải...</div> :
          versions.length === 0 ? <div className="text-center py-8 text-text-light">Chưa có lịch sử phiên bản</div> :
          versions.map((v: any, i: number) => (
            <div key={v.id} className="flex gap-3 p-3 bg-bg-cream rounded-lg border border-border">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">{v.version}</div>
                {i < versions.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">v{v.version}</span>
                  <span className="badge text-xs" style={{ backgroundColor: v.changeType === 'approve' ? '#22c55e20' : v.changeType === 'create' ? '#3b82f620' : '#eab30820', color: v.changeType === 'approve' ? '#22c55e' : v.changeType === 'create' ? '#3b82f6' : '#eab308' }}>
                    {v.changeType === 'create' ? 'Tạo' : v.changeType === 'update' ? 'Cập nhật' : v.changeType === 'submit' ? 'Gửi duyệt' : v.changeType === 'approve' ? 'Phê duyệt' : v.changeType === 'revision' ? 'Yêu cầu sửa' : v.changeType}
                  </span>
                </div>
                <div className="text-xs text-text-light mt-1">
                  {v.changedBy} - {new Date(v.createdAt).toLocaleString('vi-VN')}
                </div>
                {v.note && <div className="text-xs text-text-dark mt-1">{v.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo kế hoạch mới">
        <CreatePlanForm
          unitKpisData={unitKpisData as UnitKPIEntry[]}
          cycles={cycles}
          templates={templates}
          templateItems={templateItems}
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

      <Modal isOpen={showCommit} onClose={() => { setShowCommit(false); setCommitPlan(null); }} title="Ký cam kết điện tử">
        <div className="space-y-4">
          <div className="p-4 bg-bg-cream rounded-lg border border-border">
            <div className="font-medium text-sm">Đơn vị: {commitPlan ? unitMap[commitPlan.ownerId] || commitPlan.ownerId : '-'}</div>
            <div className="text-xs text-text-light mt-1">Chu kỳ: {commitPlan ? getCycleName(commitPlan.cycleId) : '-'}</div>
          </div>
          <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-bg-cream">
            <input type="checkbox" checked={commitChecked} onChange={e => setCommitChecked(e.target.checked)} className="mt-0.5 rounded" />
            <span className="text-sm">Tôi cam kết thực hiện các KPI đã được phê duyệt theo đúng kế hoạch của đơn vị</span>
          </label>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày ký cam kết</label>
            <input type="date" value={commitDate} onChange={e => setCommitDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => { setShowCommit(false); setCommitPlan(null); }} className="btn-secondary">Hủy</button>
            <button onClick={handleCommit} disabled={!commitChecked} className="btn-primary flex items-center gap-2">
              <PenLine size={14} /> Xác nhận cam kết
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setDetailPlan(null); }} title={`Chi tiết kế hoạch — ${detailPlan ? unitMap[detailPlan.ownerId] || '' : ''}`} maxWidth="max-w-4xl">
        {detailPlan && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-light">
                Chu kỳ: {getCycleName(detailPlan.cycleId)} | Trạng thái: <span className="badge" style={{ backgroundColor: `${statusConfig[detailPlan.status]?.color}20`, color: statusConfig[detailPlan.status]?.color }}>{statusConfig[detailPlan.status]?.label}</span>
              </div>
              {detailPlan.status === 'draft' && (
                <button onClick={() => setShowAddItem(true)} className="btn-primary text-xs flex items-center gap-1"><Plus size={14} /> Thêm KPI riêng</button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="table text-sm">
                <thead>
                  <tr><th>STT</th><th>Chỉ tiêu KPI</th><th>Nguồn</th><th>Mục tiêu</th><th>Trọng số</th><th>Hạn</th></tr>
                </thead>
                <tbody>
                  {planItems.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-6 text-text-light">Chưa có chỉ tiêu nào</td></tr>
                  ) : planItems.map((item, idx) => {
                    const isCascade = item.indicatorId && item.indicatorId.startsWith('CTU');
                    const indicatorName = indicatorMap[item.indicatorId]?.name || item.indicatorId || 'KPI riêng';
                    return (
                      <tr key={item.id} className={isCascade ? '' : 'bg-blue-50/50'}>
                        <td>{idx + 1}</td>
                        <td className="font-medium">{indicatorName}</td>
                        <td>
                          {isCascade ? (
                            <span className="badge badge-success text-[10px]">Phân bổ</span>
                          ) : (
                            <span className="badge badge-info text-[10px]">Riêng</span>
                          )}
                        </td>
                        <td>{item.targetValue}</td>
                        <td>{item.weight}%</td>
                        <td className="text-text-light">{item.dueDate || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-light">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-border"></span> KPI từ phân bổ Cascade</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-50 border border-blue-200"></span> KPI riêng đơn vị</span>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showAddItem} onClose={() => setShowAddItem(false)} title="Thêm KPI riêng đơn vị">
        <AddPlanItemForm
          planId={detailPlan?.id || ''}
          onSubmit={async (data) => {
            await apiPost('/api/plan-items', { planId: detailPlan?.id, ...data });
            setShowAddItem(false);
            if (detailPlan) {
              const items = await apiGet<any[]>(`/api/plan-items?planId=${detailPlan.id}`);
              setPlanItems(items);
            }
          }}
          onCancel={() => setShowAddItem(false)}
        />
      </Modal>
    </div>
  );
}

function CreatePlanForm({ unitKpisData, cycles, templates, templateItems, onSubmit, onCancel }: {
  unitKpisData: UnitKPIEntry[];
  cycles: CycleRecord[];
  templates: KPITemplate[];
  templateItems: KPITemplateItem[];
  onSubmit: (cycleId: string, unitId: string, templateId: string) => void;
  onCancel: () => void;
}) {
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedCycleId, selectedUnitId, selectedTemplateId);
  };

  const activeTemplates = templates.filter(t => (t.status === 'active' || t.status === 'locked') && t.targetLevel === 'unit');
  const templateItemCount = selectedTemplateId ? templateItems.filter(ti => ti.templateId === selectedTemplateId).length : 0;

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
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Bộ KPI mẫu</label>
        <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
          <option value="">-- Không dùng mẫu (lấy từ Cascade) --</option>
          {activeTemplates.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.indicatorCount} chỉ tiêu, {t.totalWeight}%)</option>
          ))}
        </select>
        <p className="text-xs text-text-light mt-1">Chọn bộ KPI mẫu hoặc bỏ trống để lấy từ kết quả phân bổ Cascade</p>
      </div>
      {selectedUnitId && selectedCycleId && (
        <div className="p-3 bg-bg-cream rounded-lg border border-border">
          <span className="text-sm text-text-light">Số lượng KPI sẽ được tạo: </span>
          <span className="font-bold">
            {selectedTemplateId ? templateItemCount : (unitKpisData.find(u => u.id === selectedUnitId)?.kpis.length || 0)}
          </span>
          {selectedTemplateId && <span className="text-xs text-text-light ml-2">(từ bộ KPI mẫu)</span>}
        </div>
      )}
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
        <button type="submit" className="btn-primary">Tạo kế hoạch</button>
      </div>
    </form>
  );
}

function AddPlanItemForm({ planId, onSubmit, onCancel }: {
  planId: string;
  onSubmit: (data: { indicatorId: string; targetValue: number; weight: number; dueDate: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [targetValue, setTargetValue] = useState(0);
  const [weight, setWeight] = useState(5);
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ indicatorId: name, targetValue, weight, dueDate });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Tên chỉ tiêu riêng *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="VD: Tỉ lệ tham gia hội thảo"
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        <p className="text-xs text-text-light mt-1">Nhập tên chỉ tiêu riêng của đơn vị (không liên kết Chỉ tiêu Trường)</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Mục tiêu *</label>
          <input type="number" value={targetValue} onChange={e => setTargetValue(Number(e.target.value))} required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Trọng số (%) *</label>
          <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} required min={0} max={100}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Hạn thực hiện</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
        <button type="submit" className="btn-primary">Thêm KPI</button>
      </div>
    </form>
  );
}
