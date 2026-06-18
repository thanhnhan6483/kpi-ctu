'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, Search, Award, Eye, Lock, Star, Edit } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPut } from '@/lib/api';

interface Evaluation {
  id: string;
  unitId: string;
  unitName: string;
  cycleName: string;
  selfScore: number | null;
  selfComment: string;
  managerScore: number | null;
  managerComment: string;
  councilScore: number | null;
  councilComment: string;
  finalScore: number | null;
  grade: string | null;
  status: string;
  selfEvaluatedAt?: string;
  managerReviewedAt?: string;
  councilReviewedAt?: string;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
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
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetail, setShowDetail] = useState(false);
  const [showSelfEval, setShowSelfEval] = useState(false);
  const [showManagerEval, setShowManagerEval] = useState(false);
  const [showCouncilEval, setShowCouncilEval] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [validCycleNames, setValidCycleNames] = useState<string[]>([]);

  useEffect(() => {
    const yearId = localStorage.getItem('selectedAcademicYear');
    if (yearId) {
      fetch(`/api/cycles?academicYearId=${yearId}`)
        .then(r => r.json())
        .then(data => setValidCycleNames(data.map((c: any) => c.name)))
        .catch(() => {});
    }
  }, []);

  const loadEvals = useCallback(async () => {
    try {
      const data = await apiGet<Evaluation[]>('/api/evaluation');
      setEvaluations(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadEvals(); }, [loadEvals]);

  const cycleFilteredEvals = validCycleNames.length > 0
    ? evaluations.filter(ev => validCycleNames.includes(ev.cycleName))
    : evaluations;

  const filtered = cycleFilteredEvals.filter((ev) => {
    const matchesSearch = ev.unitName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelfEval = async (score: number, comment: string) => {
    if (!selectedEval) return;
    await apiPut(`/api/evaluation/${selectedEval.id}`, { selfScore: score, selfComment: comment });
    setShowSelfEval(false);
    setSelectedEval(null);
    loadEvals();
  };

  const handleManagerEval = async (score: number, comment: string) => {
    if (!selectedEval) return;
    await apiPut(`/api/evaluation/${selectedEval.id}`, { managerScore: score, managerComment: comment });
    setShowManagerEval(false);
    setSelectedEval(null);
    loadEvals();
  };

  const handleCouncilEval = async (score: number, comment: string) => {
    if (!selectedEval) return;
    await apiPut(`/api/evaluation/${selectedEval.id}`, { councilScore: score, councilComment: comment });
    setShowCouncilEval(false);
    setSelectedEval(null);
    loadEvals();
  };

  const handleLock = async () => {
    if (!selectedEval) return;
    await apiPut(`/api/evaluation/${selectedEval.id}`, { status: 'locked' });
    setShowLock(false);
    setSelectedEval(null);
    loadEvals();
  };

  const totalEval = cycleFilteredEvals.length;
  const lockedCount = cycleFilteredEvals.filter((e) => e.status === 'locked').length;
  const pendingCount = cycleFilteredEvals.filter((e) => e.status === 'pending' || e.status === 'self_evaluated').length;
  const scores = cycleFilteredEvals.filter((e) => e.finalScore).map((e) => e.finalScore!);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Đánh giá KPI Đơn vị</h1>
          <p className="text-text-light mt-1">Tự đánh giá → Cấp trên → Hội đồng → Khóa</p>
        </div>
        <a href="/kpi/evaluation/individual" className="btn-secondary text-sm">Đánh giá cá nhân →</a>
      </div>

      <div className="grid grid-cols-4 gap-4">
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
            <div><p className="text-text-light text-sm">Điểm TB</p><p className="text-xl font-bold">{avgScore ? avgScore.toFixed(1) : '-'}</p></div>
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
          <table className="table">
            <thead>
              <tr><th>Mã</th><th>Đơn vị</th><th>Chu kỳ</th><th>Tự ĐG</th><th>Cấp trên</th><th>Hội đồng</th><th>Điểm cuối</th><th>Xếp loại</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filtered.map((ev) => {
                const gradeStyle = ev.grade ? gradeConfig[ev.grade] : null;
                const status = statusConfig[ev.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <tr key={ev.id}>
                    <td><span className="badge badge-info">{ev.id}</span></td>
                    <td className="font-medium">{ev.unitName}</td>
                    <td className="text-sm">{ev.cycleName}</td>
                    <td className="text-center font-medium">{ev.selfScore ?? '-'}</td>
                    <td className="text-center font-medium">{ev.managerScore ?? '-'}</td>
                    <td className="text-center font-medium">{ev.councilScore ?? '-'}</td>
                    <td className="text-center font-bold text-primary">{ev.finalScore ?? '-'}</td>
                    <td>{ev.grade && gradeStyle ? (
                      <span className="badge" style={{ backgroundColor: gradeStyle.bg, color: gradeStyle.color }}>{ev.grade}</span>
                    ) : <span className="text-text-light">-</span>}</td>
                    <td>
                      <span className="badge flex items-center gap-1 w-fit" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                        <StatusIcon size={12} />{status.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedEval(ev); setShowDetail(true); }} className="p-1 text-primary hover:bg-primary-light rounded"><Eye size={14} /></button>
                        {(ev.status === 'pending' || ev.status === 'self_evaluated') && (
                          <button onClick={() => { setSelectedEval(ev); setShowSelfEval(true); }} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded" title="Tự đánh giá"><Star size={14} /></button>
                        )}
                        {ev.status === 'self_evaluated' && (
                          <button onClick={() => { setSelectedEval(ev); setShowManagerEval(true); }} className="p-1 text-accent-green hover:bg-accent-green/10 rounded" title="Đánh giá cấp trên"><Edit size={14} /></button>
                        )}
                        {ev.status === 'manager_review' && (
                          <button onClick={() => { setSelectedEval(ev); setShowCouncilEval(true); }} className="p-1 text-accent-red hover:bg-accent-red/10 rounded" title="Hội đồng rà soát"><Award size={14} /></button>
                        )}
                        {ev.status === 'evaluated' && (
                          <button onClick={() => { setSelectedEval(ev); setShowLock(true); }} className="p-1 text-primary hover:bg-primary-light rounded" title="Khóa kết quả"><Lock size={14} /></button>
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

      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelectedEval(null); }} title="Chi tiết đánh giá" maxWidth="max-w-4xl">
        {selectedEval && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-light">{selectedEval.unitName} • {selectedEval.cycleName}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-bg-cream rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2"><Star size={16} className="text-primary" /><span className="font-medium text-sm">Tự đánh giá</span></div>
                <div className="text-2xl font-bold text-primary mb-2">{selectedEval.selfScore ?? '-'}</div>
                <p className="text-xs text-text-light">{selectedEval.selfComment || 'Chưa có nhận xét'}</p>
                {selectedEval.selfEvaluatedAt && <p className="text-[10px] text-text-light mt-2">{new Date(selectedEval.selfEvaluatedAt).toLocaleString('vi-VN')}</p>}
              </div>
              <div className="p-4 bg-bg-cream rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2"><Eye size={16} className="text-accent-yellow" /><span className="font-medium text-sm">Cấp trên</span></div>
                <div className="text-2xl font-bold text-primary mb-2">{selectedEval.managerScore ?? '-'}</div>
                <p className="text-xs text-text-light">{selectedEval.managerComment || 'Chưa có nhận xét'}</p>
                {selectedEval.managerReviewedAt && <p className="text-[10px] text-text-light mt-2">{new Date(selectedEval.managerReviewedAt).toLocaleString('vi-VN')}</p>}
              </div>
              <div className="p-4 bg-bg-cream rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2"><Award size={16} className="text-accent-green" /><span className="font-medium text-sm">Hội đồng</span></div>
                <div className="text-2xl font-bold text-primary mb-2">{selectedEval.councilScore ?? '-'}</div>
                <p className="text-xs text-text-light">{selectedEval.councilComment || 'Chưa có nhận xét'}</p>
                {selectedEval.councilReviewedAt && <p className="text-[10px] text-text-light mt-2">{new Date(selectedEval.councilReviewedAt).toLocaleString('vi-VN')}</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showSelfEval} onClose={() => { setShowSelfEval(false); setSelectedEval(null); }} title="Tự đánh giá KPI">
        <EvalForm label="Điểm tự đánh giá" onSubmit={handleSelfEval} onCancel={() => { setShowSelfEval(false); setSelectedEval(null); }} />
      </Modal>

      <Modal isOpen={showManagerEval} onClose={() => { setShowManagerEval(false); setSelectedEval(null); }} title="Đánh giá cấp trên">
        <EvalForm label="Điểm cấp trên" onSubmit={handleManagerEval} onCancel={() => { setShowManagerEval(false); setSelectedEval(null); }} />
      </Modal>

      <Modal isOpen={showCouncilEval} onClose={() => { setShowCouncilEval(false); setSelectedEval(null); }} title="Hội đồng rà soát KPI">
        <div className="space-y-4">
          <div className="p-3 bg-bg-cream rounded-lg border border-border">
            <div className="font-medium text-sm">{selectedEval?.unitName}</div>
            <div className="text-xs text-text-light mt-1">Điểm tự ĐG: {selectedEval?.selfScore} | Điểm cấp trên: {selectedEval?.managerScore}</div>
          </div>
          <EvalForm label="Điểm Hội đồng" onSubmit={handleCouncilEval} onCancel={() => { setShowCouncilEval(false); setSelectedEval(null); }} />
        </div>
      </Modal>

      <Modal isOpen={showLock} onClose={() => { setShowLock(false); setSelectedEval(null); }} title="Khóa kết quả đánh giá">
        <div className="space-y-4">
          <div className="p-4 bg-bg-cream rounded-lg border border-border">
            <div className="font-medium text-sm mb-2">Xác nhận khóa kết quả</div>
            <div className="text-xs text-text-light">Sau khi khóa, kết quả đánh giá không thể chỉnh sửa.</div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div><span className="text-text-light">Tự ĐG:</span> <span className="font-bold">{selectedEval?.selfScore ?? '-'}</span></div>
              <div><span className="text-text-light">Cấp trên:</span> <span className="font-bold">{selectedEval?.managerScore ?? '-'}</span></div>
              <div><span className="text-text-light">Hội đồng:</span> <span className="font-bold">{selectedEval?.councilScore ?? '-'}</span></div>
            </div>
            <div className="mt-2 text-sm"><span className="text-text-light">Điểm cuối:</span> <span className="font-bold text-primary">{selectedEval?.finalScore ?? '-'}</span></div>
            <div className="mt-1 text-sm"><span className="text-text-light">Xếp loại:</span> <span className="font-bold">{selectedEval?.grade ?? '-'}</span></div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => { setShowLock(false); setSelectedEval(null); }} className="btn-secondary">Hủy</button>
            <button onClick={handleLock} className="btn-primary flex items-center gap-2"><Lock size={14} /> Khóa kết quả</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function EvalForm({ label, onSubmit, onCancel }: { label: string; onSubmit: (score: number, comment: string) => void; onCancel: () => void }) {
  const [score, setScore] = useState(80);
  const [comment, setComment] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">{label} *</label>
        <input type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} min={0} max={120}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        <p className="text-xs text-text-light mt-1">0-120 điểm. Xuất sắc ≥90, Tốt 80-89, Đạt 65-79, Cải thiện 50-64, Không đạt &lt;50</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Nhận xét</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button onClick={onCancel} className="btn-secondary">Hủy</button>
        <button onClick={() => onSubmit(score, comment)} className="btn-primary">Xác nhận</button>
      </div>
    </div>
  );
}
