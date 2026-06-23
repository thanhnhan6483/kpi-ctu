'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, Search, Award, Eye, Lock, Star, Edit, MessageSquare } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPut, apiPost } from '@/lib/api';
import unitKpisData from '@/data/unit-kpis.json';
import academicYears from '@/data/academic-years.json';

interface CycleRecord {
  id: string;
  academicYearId: string;
  name: string;
}

interface Evaluation {
  id: string;
  planId: string;
  evaluatorId: string;
  evaluationType: string;
  comment: string;
  status: string;
  level?: string;
  personId?: string;
  personName?: string;
  positionCode?: string;
  unitName?: string;
  createdAt: string;
  updatedAt: string;
}

interface PlanRecord {
  id: string;
  cycleId: string;
  ownerType: string;
  ownerId: string;
  status: string;
}

interface PlanItemRecord {
  id: string;
  planId: string;
  indicatorId: string;
  targetValue: number;
  weight: number;
  dueDate: string;
}

interface ScoreRecord {
  id: string;
  planItemId: string;
  selfScore: number | null;
  managerScore: number | null;
  councilScore: number | null;
  finalScore: number | null;
}

interface UnitKpi {
  id: string;
  name: string;
  code: string;
  kpis: { id: string; name: string; indicatorId: string | null }[];
}

function getUnitName(unitId: string): string {
  const unit = (unitKpisData as UnitKpi[]).find(u => u.id === unitId);
  return unit?.name || unitId;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Chưa bắt đầu', color: '#9e9e9e', icon: Clock },
  self_evaluated: { label: 'Tự đánh giá', color: '#2196f3', icon: Star },
  manager_review: { label: 'Cấp trên đánh giá', color: '#ff9800', icon: Eye },
  council_review: { label: 'Hội đồng rà soát', color: '#9c27b0', icon: Award },
  evaluated: { label: 'Đã đánh giá', color: '#4caf50', icon: CheckCircle },
  locked: { label: 'Đã khóa', color: '#607d8b', icon: Lock },
};

const gradeConfig: Record<string, { color: string; bg: string }> = {
  'Xuất sắc': { color: '#4caf50', bg: '#e8f5e9' },
  'Tốt': { color: '#2196f3', bg: '#e3f2fd' },
  'Đạt': { color: '#ff9800', bg: '#fff3e0' },
  'Cần cải thiện': { color: '#ffc107', bg: '#fffde7' },
  'Không đạt': { color: '#f44336', bg: '#ffebee' },
};

export default function EvaluationPage() {
  const [selectedYearId, setSelectedYearId] = useState('ay002');
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [planItems, setPlanItems] = useState<PlanItemRecord[]>([]);
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetail, setShowDetail] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [complaintContent, setComplaintContent] = useState('');
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [editScores, setEditScores] = useState<Record<string, { selfScore: number; managerScore: number; councilScore: number }>>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [evalsData, plansData, planItemsData] = await Promise.all([
        apiGet<Evaluation[]>('/api/evaluation'),
        apiGet<PlanRecord[]>('/api/plans'),
        apiGet<PlanItemRecord[]>('/api/plan-items'),
      ]);
      setEvaluations(evalsData);
      setPlans(plansData);
      setPlanItems(planItemsData);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetch('/api/cycles')
      .then(r => r.json())
      .then(data => setCycles(data))
      .catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const cycleYearMap = new Map(cycles.map(c => [c.id, c.academicYearId]));
  const planMap = new Map(plans.map(p => [p.id, p]));
  const planItemMap = new Map(planItems.map(pi => [pi.id, pi]));

  const enrichedEvals = evaluations.map(ev => {
    const plan = planMap.get(ev.planId);
    return {
      ...ev,
      unitName: plan ? getUnitName(plan.ownerId) : '',
      cycleId: plan?.cycleId ?? '',
    };
  });

  const yearFilteredEvals = enrichedEvals.filter(ev => {
    const yearId = cycleYearMap.get(ev.cycleId);
    return !yearId || yearId === selectedYearId;
  });

  const filtered = yearFilteredEvals.filter((ev) => {
    const matchesSearch = ev.unitName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const loadScores = async (planId: string) => {
    const data = await apiGet<ScoreRecord[]>(`/api/scores?planId=${planId}`);
    setScores(data);
    const initEditScores: Record<string, { selfScore: number; managerScore: number; councilScore: number }> = {};
    data.forEach(s => {
      initEditScores[s.planItemId] = {
        selfScore: s.selfScore ?? 0,
        managerScore: s.managerScore ?? 0,
        councilScore: s.councilScore ?? 0,
      };
    });
    setEditScores(initEditScores);
  };

  const handleOpenScoreModal = async (ev: Evaluation) => {
    setSelectedEval(ev);
    await loadScores(ev.planId);
    setShowScoreModal(true);
  };

  const handleSaveScores = async () => {
    for (const score of scores) {
      const edits = editScores[score.planItemId];
      if (edits) {
        const payload: Record<string, number | null> = {};
        const isSelf = selectedEval?.evaluationType === 'self' || selectedEval?.status === 'pending' || selectedEval?.status === 'self_evaluated';
        const isManager = selectedEval?.evaluationType === 'manager' || selectedEval?.status === 'manager_review';
        const isCouncil = selectedEval?.evaluationType === 'council' || selectedEval?.status === 'council_review';
        if (edits.selfScore !== score.selfScore && (isSelf || score.selfScore !== null || edits.selfScore !== 0)) payload.selfScore = edits.selfScore;
        if (edits.managerScore !== score.managerScore && (isManager || score.managerScore !== null || edits.managerScore !== 0)) payload.managerScore = edits.managerScore;
        if (edits.councilScore !== score.councilScore && (isCouncil || score.councilScore !== null || edits.councilScore !== 0)) payload.councilScore = edits.councilScore;
        if (Object.keys(payload).length > 0) {
          await apiPut(`/api/scores/${score.id}`, payload);
        }
      }
    }
    setShowScoreModal(false);
    setSelectedEval(null);
    loadData();
  };

  const handleLock = async () => {
    if (!selectedEval) return;
    await apiPut(`/api/evaluation/${selectedEval.id}`, { status: 'approved' });
    setShowLock(false);
    setSelectedEval(null);
    loadData();
  };

  const totalEval = yearFilteredEvals.length;
  const lockedCount = yearFilteredEvals.filter((e) => e.status === 'locked').length;
  const pendingCount = yearFilteredEvals.filter((e) => e.status === 'pending' || e.status === 'self_evaluated').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Đánh giá KPI Đơn vị</h1>
          <p className="text-text-light mt-1">Tự đánh giá → Cấp trên → Hội đồng → Khóa</p>
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
          <a href="/kpi/evaluation/individual" className="btn-secondary text-sm">Đánh giá cá nhân →</a>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><Award size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng đánh giá</p><p className="text-xl font-bold">{totalEval}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><Lock size={20} className="text-accent-green" /></div>
            <div><p className="text-text-light text-sm">Đã khóa</p><p className="text-xl font-bold">{lockedCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><Clock size={20} className="text-accent-yellow" /></div>
            <div><p className="text-text-light text-sm">Chưa hoàn thành</p><p className="text-xl font-bold">{pendingCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-red/20 rounded-lg"><Star size={20} className="text-accent-red" /></div>
            <div><p className="text-text-light text-sm">Điểm TB</p>            <p className="text-xl font-bold">{scores.length > 0 ? (scores.reduce((sum, s) => sum + (s.finalScore ?? 0), 0) / scores.length).toFixed(1) : '-'}</p></div>
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
          {['all', 'pending', 'self_evaluated', 'manager_review', 'evaluated', 'locked'].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === status ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>
              {status === 'all' ? 'Tất cả' : statusConfig[status]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Kết quả đánh giá</h3></div>
        <div className="p-0">
          <div className="overflow-x-auto"><table className="table">
            <thead>
              <tr><th>Mã</th><th>Đơn vị</th><th>Chu kỳ</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filtered.map((ev) => {
                const status = statusConfig[ev.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <tr key={ev.id}>
                    <td><span className="badge badge-info">{ev.id}</span></td>
                    <td className="font-medium">{ev.unitName}</td>
                    <td className="text-sm">{ev.cycleId}</td>
                    <td>
                      <span className="badge flex items-center gap-1 w-fit" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                        <StatusIcon size={12} />{status.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => handleOpenScoreModal(ev)} className="p-1 text-primary hover:bg-primary-light rounded" title="Đánh giá"><Eye size={14} /></button>
                        {ev.status === 'evaluated' && (
                          <button onClick={() => { setSelectedEval(ev); setShowLock(true); }} className="p-1 text-primary hover:bg-primary-light rounded" title="Khóa kết quả"><Lock size={14} /></button>
                        )}
                        <button onClick={() => { setSelectedEval(ev); setComplaintContent(''); setShowComplaint(true); }} className="p-1 text-orange-600 hover:bg-orange-50 rounded" title="Khiếu nại"><MessageSquare size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      </div>

      <Modal isOpen={showScoreModal} onClose={() => { setShowScoreModal(false); setSelectedEval(null); }} title="Đánh giá chi tiết" maxWidth="max-w-4xl">
        {selectedEval && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-light">{getUnitName(planMap.get(selectedEval.planId)?.ownerId ?? '')} • {planMap.get(selectedEval.planId)?.cycleId ?? ''}</span>
            </div>
            <div className="overflow-x-auto"><table className="table">
              <thead>
                <tr><th>Chỉ tiêu</th><th>Tự ĐG</th><th>Cấp trên</th><th>Hội đồng</th><th>Tổng</th></tr>
              </thead>
              <tbody>
                {scores.map((score) => {
                  const pi = planItemMap.get(score.planItemId);
                  const edits = editScores[score.planItemId] || { selfScore: 0, managerScore: 0, councilScore: 0 };
                  return (
                    <tr key={score.id}>
                      <td className="font-medium text-sm">{pi ? pi.indicatorId : score.planItemId}</td>
                      <td>
                        <input type="number" value={edits.selfScore} onChange={(e) => setEditScores(prev => ({ ...prev, [score.planItemId]: { ...prev[score.planItemId], selfScore: Number(e.target.value) } }))}
                          className="w-20 px-2 py-1 rounded border border-border text-sm text-center" min={0} max={120} />
                      </td>
                      <td>
                        <input type="number" value={edits.managerScore} onChange={(e) => setEditScores(prev => ({ ...prev, [score.planItemId]: { ...prev[score.planItemId], managerScore: Number(e.target.value) } }))}
                          className="w-20 px-2 py-1 rounded border border-border text-sm text-center" min={0} max={120} />
                      </td>
                      <td>
                        <input type="number" value={edits.councilScore} onChange={(e) => setEditScores(prev => ({ ...prev, [score.planItemId]: { ...prev[score.planItemId], councilScore: Number(e.target.value) } }))}
                          className="w-20 px-2 py-1 rounded border border-border text-sm text-center" min={0} max={120} />
                      </td>
                      <td className="text-center font-bold text-primary">{score.finalScore ?? '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button onClick={() => { setShowScoreModal(false); setSelectedEval(null); }} className="btn-secondary">Hủy</button>
              <button onClick={handleSaveScores} className="btn-primary">Lưu điểm số</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showLock} onClose={() => { setShowLock(false); setSelectedEval(null); }} title="Khóa kết quả đánh giá">
        <div className="space-y-4">
          <div className="p-4 bg-bg-cream rounded-lg border border-border">
            <div className="font-medium text-sm mb-2">Xác nhận khóa kết quả</div>
            <div className="text-xs text-text-light">Sau khi khóa, kết quả đánh giá không thể chỉnh sửa.</div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => { setShowLock(false); setSelectedEval(null); }} className="btn-secondary">Hủy</button>
            <button onClick={handleLock} className="btn-primary flex items-center gap-2"><Lock size={14} /> Khóa kết quả</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showComplaint} onClose={() => { setShowComplaint(false); setSelectedEval(null); }} title="Gửi khiếu nại / Giải trình">
        <div className="space-y-4">
          <div className="p-3 bg-bg-cream rounded-lg border border-border text-sm">
            <div className="font-medium">Đơn vị: {selectedEval?.unitName}</div>
            <div className="text-xs text-text-light mt-1">Mã đánh giá: {selectedEval?.id}</div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Nội dung khiếu nại *</label><textarea value={complaintContent} onChange={e => setComplaintContent(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" rows={4} placeholder="Mô tả lý do khiếu nại..." required /></div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={() => { setShowComplaint(false); setSelectedEval(null); }} className="px-4 py-2 border border-border rounded-lg text-sm">Hủy</button>
            <button onClick={async () => {
              if (!complaintContent.trim()) { alert('Vui lòng nhập nội dung khiếu nại'); return; }
              await apiPost('/api/complaints', { title: `Khiếu nại đánh giá ${selectedEval?.id}`, content: complaintContent, unitName: selectedEval?.unitName || '', priority: 'medium', status: 'pending', code: `CMP${Date.now()}` });
              setShowComplaint(false); setSelectedEval(null);
            }} className="btn-primary flex items-center gap-1"><MessageSquare size={14} /> Gửi khiếu nại</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
