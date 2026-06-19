'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Clock, Search, Plus, Trash2, Eye, Link } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import unitKpisData from '@/data/unit-kpis.json';
import academicYears from '@/data/academic-years.json';

interface CycleRecord {
  id: string;
  academicYearId: string;
  name: string;
}

interface Evidence {
  id: string;
  planItemId: string;
  evidenceType: string;
  fileName: string;
  status: string;
  reviewerNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
  submittedBy: string;
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

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Chờ duyệt', color: '#ffc107', icon: Clock },
  valid: { label: 'Hợp lệ', color: '#4caf50', icon: CheckCircle },
  needs_supplement: { label: 'Cần bổ sung', color: '#ff9800', icon: AlertTriangle },
  invalid: { label: 'Không hợp lệ', color: '#f44336', icon: AlertTriangle },
};

export default function EvidencesPage() {
  const [selectedYearId, setSelectedYearId] = useState('ay002');
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [planItems, setPlanItems] = useState<PlanItemRecord[]>([]);
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [filterPlanId, setFilterPlanId] = useState('');
  const [filterPlanItemId, setFilterPlanItemId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cycles')
      .then(r => r.json())
      .then(data => setCycles(data))
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [plansData, planItemsData, evData] = await Promise.all([
        apiGet<PlanRecord[]>('/api/plans'),
        apiGet<PlanItemRecord[]>('/api/plan-items'),
        apiGet<Evidence[]>('/api/evidences'),
      ]);
      setPlans(plansData);
      setPlanItems(planItemsData);
      setEvidences(evData);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const cycleYearMap = new Map(cycles.map(c => [c.id, c.academicYearId]));
  const planItemMap = new Map(planItems.map(pi => [pi.id, pi]));
  const planMap = new Map(plans.map(p => [p.id, p]));

  const filteredPlanItems = filterPlanId ? planItems.filter(pi => pi.planId === filterPlanId) : planItems;
  const filteredEvidences = evidences.filter(ev => {
    if (filterPlanItemId && ev.planItemId !== filterPlanItemId) return false;
    const pi = planItemMap.get(ev.planItemId);
    if (filterPlanId) {
      if (!pi || pi.planId !== filterPlanId) return false;
    }
    if (pi) {
      const plan = planMap.get(pi.planId);
      if (plan) {
        const yearId = cycleYearMap.get(plan.cycleId);
        if (yearId && yearId !== selectedYearId) return false;
      }
    }
    const matchesSearch = ev.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreate = async (data: Partial<Evidence>) => {
    await apiPost('/api/evidences', data);
    setShowCreate(false);
    loadData();
  };

  const handleReview = async (status: string, note: string) => {
    if (!selectedEvidence) return;
    await apiPut(`/api/evidences/${selectedEvidence.id}`, { status, reviewerNote: note, reviewedBy: 'Admin' });
    setShowReview(false);
    setSelectedEvidence(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa minh chứng này?')) return;
    await apiDelete(`/api/evidences/${id}`);
    loadData();
  };

  const validCount = filteredEvidences.filter(e => e.status === 'valid').length;
  const pendingCount = filteredEvidences.filter(e => e.status === 'pending').length;
  const supplementCount = filteredEvidences.filter(e => e.status === 'needs_supplement').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý minh chứng</h1>
          <p className="text-text-light mt-1">Tải lên và quản lý minh chứng KPI</p>
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
            <Plus size={16} /> Tải lên minh chứng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><FileText size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng minh chứng</p><p className="text-xl font-bold">{filteredEvidences.length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div>
            <div><p className="text-text-light text-sm">Hợp lệ</p><p className="text-xl font-bold">{validCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><Clock size={20} className="text-accent-yellow" /></div>
            <div><p className="text-text-light text-sm">Chờ duyệt</p><p className="text-xl font-bold">{pendingCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-red/20 rounded-lg"><AlertTriangle size={20} className="text-accent-red" /></div>
            <div><p className="text-text-light text-sm">Cần bổ sung</p><p className="text-xl font-bold">{supplementCount}</p></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách minh chứng</h3></div>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
              <input type="text" placeholder="Tìm kiếm minh chứng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
            </div>
            <select value={filterPlanId} onChange={(e) => { setFilterPlanId(e.target.value); setFilterPlanItemId(''); }}
              className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
              <option value="">-- Tất cả Kế hoạch --</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filterPlanItemId} onChange={(e) => setFilterPlanItemId(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
              <option value="">-- Tất cả chỉ tiêu --</option>
              {filteredPlanItems.map(pi => (
                <option key={pi.id} value={pi.id}>{getKpiName(pi.indicatorId)}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto"><table className="table">
            <thead>
              <tr><th>Chỉ tiêu KPI</th><th>Loại</th><th>Tên file</th><th>Trạng thái</th><th>Người nộp</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filteredEvidences.map((ev) => {
                const status = statusConfig[ev.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const pi = planItemMap.get(ev.planItemId);
                return (
                  <tr key={ev.id}>
                    <td>
                      <div className="font-medium text-sm">{pi ? getKpiName(pi.indicatorId) : ev.planItemId}</div>
                    </td>
                    <td><span className="badge badge-info text-xs">{ev.evidenceType}</span></td>
                    <td className="text-sm max-w-[200px] truncate">{ev.fileName}</td>
                    <td>
                      <span className="badge flex items-center gap-1 w-fit" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                        <StatusIcon size={12} />{status.label}
                      </span>
                    </td>
                    <td className="text-sm">{ev.submittedBy}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedEvidence(ev); setShowDetail(true); }} className="p-1 text-primary hover:bg-primary-light rounded"><Eye size={14} /></button>
                        {ev.status === 'pending' && (
                          <button onClick={() => { setSelectedEvidence(ev); setShowReview(true); }} className="p-1 text-accent-green hover:bg-accent-green/10 rounded"><CheckCircle size={14} /></button>
                        )}
                        <button onClick={() => handleDelete(ev.id)} className="p-1 text-accent-red hover:bg-accent-red/10 rounded"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tải lên minh chứng mới">
        <EvidenceForm plans={plans} planItems={planItems} onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      <Modal isOpen={showReview} onClose={() => { setShowReview(false); setSelectedEvidence(null); }} title="Duyệt minh chứng">
        <ReviewForm evidence={selectedEvidence} planItems={planItems} onSubmit={handleReview} onCancel={() => { setShowReview(false); setSelectedEvidence(null); }} />
      </Modal>

      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelectedEvidence(null); }} title="Chi tiết minh chứng">
        {selectedEvidence && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><span className="text-xs text-text-light">ID</span><div className="font-medium">{selectedEvidence.id}</div></div>
              <div><span className="text-xs text-text-light">KPI</span><div className="font-medium">{selectedEvidence.planItemId}</div></div>
              <div><span className="text-xs text-text-light">Loại</span><div className="font-medium">{selectedEvidence.evidenceType}</div></div>
              <div><span className="text-xs text-text-light">File/URL</span><div className="font-medium">{selectedEvidence.fileName}</div></div>
              <div><span className="text-xs text-text-light">Trạng thái</span><div>
                <span className="badge" style={{ backgroundColor: `${statusConfig[selectedEvidence.status]?.color}20`, color: statusConfig[selectedEvidence.status]?.color }}>
                  {statusConfig[selectedEvidence.status]?.label}
                </span>
              </div></div>
              <div><span className="text-xs text-text-light">Người nộp</span><div className="font-medium">{selectedEvidence.submittedBy}</div></div>
              <div><span className="text-xs text-text-light">Ngày nộp</span><div className="font-medium">{new Date(selectedEvidence.submittedAt).toLocaleDateString('vi-VN')}</div></div>
              {selectedEvidence.reviewedBy && (
                <div><span className="text-xs text-text-light">Người duyệt</span><div className="font-medium">{selectedEvidence.reviewedBy}</div></div>
              )}
              {selectedEvidence.reviewerNote && (
                <div className="col-span-2"><span className="text-xs text-text-light">Nhận xét</span><div className="font-medium">{selectedEvidence.reviewerNote}</div></div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function EvidenceForm({ plans, planItems, onSubmit, onCancel }: { plans: PlanRecord[]; planItems: PlanItemRecord[]; onSubmit: (data: Partial<Evidence>) => void; onCancel: () => void }) {
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [planItemId, setPlanItemId] = useState('');
  const [evidenceType, setEvidenceType] = useState('file');
  const [fileName, setFileName] = useState('');

  const filteredPlanItems = planItems.filter(pi => pi.planId === selectedPlanId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      planItemId,
      evidenceType,
      fileName,
      submittedBy: 'Admin',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Kế hoạch *</label>
          <select value={selectedPlanId} onChange={(e) => { setSelectedPlanId(e.target.value); setPlanItemId(''); }} required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="">-- Chọn Kế hoạch --</option>
            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Chỉ tiêu KPI *</label>
          <select value={planItemId} onChange={(e) => setPlanItemId(e.target.value)} required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="">-- Chọn chỉ tiêu --</option>
            {filteredPlanItems.map(pi => (
              <option key={pi.id} value={pi.id}>{getKpiName(pi.indicatorId)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Loại minh chứng *</label>
          <select value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="file">Tệp đính kèm</option>
            <option value="url">Đường dẫn URL</option>
            <option value="system_log">Log hệ thống</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">{evidenceType === 'url' ? 'Đường dẫn URL *' : 'Tên file *'}</label>
          <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} required
            placeholder={evidenceType === 'url' ? 'https://...' : 'ten_file.pdf'}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
        <button type="submit" className="btn-primary">Tải lên</button>
      </div>
    </form>
  );
}

function ReviewForm({ evidence, planItems, onSubmit, onCancel }: { evidence: Evidence | null; planItems: PlanItemRecord[]; onSubmit: (status: string, note: string) => void; onCancel: () => void }) {
  const [reviewStatus, setReviewStatus] = useState('valid');
  const [reviewNote, setReviewNote] = useState('');

  const pi = evidence ? planItems.find(p => p.id === evidence.planItemId) : null;

  return (
    <div className="space-y-4">
      {evidence && (
        <div className="p-4 bg-bg-cream rounded-lg border border-border">
          <div className="font-medium text-sm">{pi ? getKpiName(pi.indicatorId) : evidence.planItemId}</div>
          <div className="text-xs text-text-light mt-1">{evidence.fileName} • {evidence.evidenceType}</div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Kết quả duyệt *</label>
        <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
          <option value="valid">Hợp lệ</option>
          <option value="needs_supplement">Cần bổ sung</option>
          <option value="invalid">Không hợp lệ</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Nhận xét</label>
        <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={3}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button onClick={onCancel} className="btn-secondary">Hủy</button>
        <button onClick={() => onSubmit(reviewStatus, reviewNote)} className="btn-primary">Xác nhận duyệt</button>
      </div>
    </div>
  );
}
