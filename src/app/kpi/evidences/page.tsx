'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Clock, Search, Plus, Trash2, Eye, Link } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import indicatorsData from '@/data/indicators.json';
import unitsData from '@/data/units.json';
import plansData from '@/data/plans.json';

interface Evidence {
  id: string;
  planId: string;
  indicatorId: string;
  indicatorName: string;
  unitId: string;
  unitName: string;
  type: 'file' | 'url' | 'system_log';
  fileName: string;
  status: string;
  submittedAt: string;
  submittedBy: string;
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Chờ duyệt', color: '#ffc107', icon: Clock },
  valid: { label: 'Hợp lệ', color: '#4caf50', icon: CheckCircle },
  needs_supplement: { label: 'Cần bổ sung', color: '#ff9800', icon: AlertTriangle },
  invalid: { label: 'Không hợp lệ', color: '#f44336', icon: AlertTriangle },
};

export default function EvidencesPage() {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [planFilter, setPlanFilter] = useState('');
  const [indicatorFilter, setIndicatorFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [validPlanIds, setValidPlanIds] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('planId');
    if (pid) setPlanFilter(pid);
    const iid = params.get('indicatorId');
    if (iid) setIndicatorFilter(iid);
  }, []);

  useEffect(() => {
    const yearId = localStorage.getItem('selectedAcademicYear');
    if (yearId) {
      fetch(`/api/cycles?academicYearId=${yearId}`)
        .then(r => r.json())
        .then(cycles => {
          const cycleIds = cycles.map((c: any) => c.id);
          fetch('/api/plans')
            .then(r => r.json())
            .then(plans => setValidPlanIds(plans.filter((p: any) => cycleIds.includes(p.cycleId)).map((p: any) => p.id)))
            .catch(() => {});
        })
        .catch(() => {});
    }
  }, []);

  const loadEvidences = useCallback(async () => {
    try {
      const data = await apiGet<Evidence[]>('/api/evidences');
      setEvidences(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadEvidences(); }, [loadEvidences]);

  const planNames: Record<string, string> = {};
  (plansData as Record<string, unknown>[]).forEach((p: Record<string, unknown>) => { planNames[p.id as string] = p.unitName as string; });

  const cycleFilteredEvidences = validPlanIds.length > 0
    ? evidences.filter(ev => validPlanIds.includes(ev.planId))
    : evidences;

  const filtered = cycleFilteredEvidences.filter(ev => {
    const matchesSearch = ev.indicatorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.indicatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = !planFilter || ev.planId === planFilter;
    const matchesIndicator = !indicatorFilter || ev.indicatorId === indicatorFilter;
    return matchesSearch && matchesPlan && matchesIndicator;
  });

  const handleCreate = async (data: Partial<Evidence>) => {
    await apiPost('/api/evidences', data);
    setShowCreate(false);
    loadEvidences();
  };

  const handleReview = async (status: string, note: string) => {
    if (!selectedEvidence) return;
    await apiPut(`/api/evidences/${selectedEvidence.id}`, { status, reviewNote: note, reviewedBy: 'Admin' });
    setShowReview(false);
    setSelectedEvidence(null);
    loadEvidences();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa minh chứng này?')) return;
    await apiDelete(`/api/evidences/${id}`);
    loadEvidences();
  };

  const validCount = cycleFilteredEvidences.filter(e => e.status === 'valid').length;
  const pendingCount = cycleFilteredEvidences.filter(e => e.status === 'pending').length;
  const supplementCount = cycleFilteredEvidences.filter(e => e.status === 'needs_supplement').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý minh chứng</h1>
          <p className="text-text-light mt-1">Tải lên và quản lý minh chứng KPI</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tải lên minh chứng
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><FileText size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng minh chứng</p><p className="text-xl font-bold">{cycleFilteredEvidences.length}</p></div>
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
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
            <input type="text" placeholder="Tìm kiếm minh chứng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
          </div>
          <table className="table">
            <thead>
              <tr><th>Mã</th><th>KPI</th><th>Kế hoạch</th><th>Loại</th><th>Tên file/URL</th><th>Đơn vị</th><th>Trạng thái</th><th>Người nộp</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filtered.map((ev) => {
                const status = statusConfig[ev.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <tr key={ev.id}>
                    <td><span className="badge badge-info">{ev.id}</span></td>
                    <td>
                      <div className="font-medium text-sm">{ev.indicatorId}</div>
                      <div className="text-xs text-text-light">{ev.indicatorName}</div>
                    </td>
                    <td className="text-sm">
                      <a href={`/kpi/plans?detail=${ev.planId}`} className="text-primary hover:underline">{planNames[ev.planId] || ev.planId}</a>
                    </td>
                    <td><span className="badge badge-info text-xs">{ev.type}</span></td>
                    <td className="text-sm max-w-[200px] truncate">{ev.fileName}</td>
                    <td className="text-sm">{ev.unitName}</td>
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
          </table>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tải lên minh chứng mới">
        <EvidenceForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      <Modal isOpen={showReview} onClose={() => { setShowReview(false); setSelectedEvidence(null); }} title="Duyệt minh chứng">
        <ReviewForm evidence={selectedEvidence} onSubmit={handleReview} onCancel={() => { setShowReview(false); setSelectedEvidence(null); }} />
      </Modal>

      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelectedEvidence(null); }} title="Chi tiết minh chứng">
        {selectedEvidence && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-xs text-text-light">ID</span><div className="font-medium">{selectedEvidence.id}</div></div>
              <div><span className="text-xs text-text-light">KPI</span><div className="font-medium">{selectedEvidence.indicatorId} - {selectedEvidence.indicatorName}</div></div>
              <div><span className="text-xs text-text-light">Đơn vị</span><div className="font-medium">{selectedEvidence.unitName}</div></div>
              <div><span className="text-xs text-text-light">Loại</span><div className="font-medium">{selectedEvidence.type}</div></div>
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
              {selectedEvidence.reviewNote && (
                <div className="col-span-2"><span className="text-xs text-text-light">Nhận xét</span><div className="font-medium">{selectedEvidence.reviewNote}</div></div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function EvidenceForm({ onSubmit, onCancel }: { onSubmit: (data: Partial<Evidence>) => void; onCancel: () => void }) {
  const [planId, setPlanId] = useState('');
  const [indicatorId, setIndicatorId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [type, setType] = useState<'file' | 'url' | 'system_log'>('file');
  const [fileName, setFileName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const indicator = (indicatorsData as Record<string, unknown>[]).find((i: Record<string, unknown>) => i.id === indicatorId);
    const unit = (unitsData as Record<string, unknown>[]).find((u: Record<string, unknown>) => u.id === unitId);
    onSubmit({
      indicatorId,
      indicatorName: (indicator?.name as string) || '',
      unitId,
      unitName: (unit?.name as string) || '',
      type,
      fileName,
      submittedBy: 'Admin',
      planId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Kế hoạch *</label>
          <select value={planId} onChange={(e) => setPlanId(e.target.value)} required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="">-- Chọn kế hoạch --</option>
            {(plansData as Record<string, unknown>[]).map((p: Record<string, unknown>) => (
              <option key={p.id as string} value={p.id as string}>{p.unitName as string} ({p.id as string})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">KPI liên quan *</label>
          <select value={indicatorId} onChange={(e) => setIndicatorId(e.target.value)} required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="">-- Chọn KPI --</option>
            {(indicatorsData as Record<string, unknown>[]).map((i: Record<string, unknown>) => (
              <option key={i.id as string} value={i.id as string}>{i.code as string} - {i.name as string}</option>
            ))}
          </select>
        </div>
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
          <label className="block text-sm font-medium text-text-dark mb-1">Loại minh chứng *</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'file' | 'url' | 'system_log')}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="file">Tệp đính kèm</option>
            <option value="url">Đường dẫn URL</option>
            <option value="system_log">Log hệ thống</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">{type === 'url' ? 'Đường dẫn URL *' : 'Tên file *'}</label>
          <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} required
            placeholder={type === 'url' ? 'https://...' : 'ten_file.pdf'}
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

function ReviewForm({ evidence, onSubmit, onCancel }: { evidence: Evidence | null; onSubmit: (status: string, note: string) => void; onCancel: () => void }) {
  const [reviewStatus, setReviewStatus] = useState('valid');
  const [reviewNote, setReviewNote] = useState('');

  return (
    <div className="space-y-4">
      {evidence && (
        <div className="p-4 bg-bg-cream rounded-lg border border-border">
          <div className="font-medium text-sm">{evidence.indicatorId} - {evidence.indicatorName}</div>
          <div className="text-xs text-text-light mt-1">{evidence.fileName} • {evidence.unitName}</div>
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
