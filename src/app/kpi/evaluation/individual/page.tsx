'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, Search, Award, Eye, Lock, Star, Edit, User, Building2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPut } from '@/lib/api';
import individualKpisData from '@/data/individual-kpis.json';

interface IndividualEvaluation {
  id: string;
  unitId: string;
  unitName: string;
  cycleName: string;
  level?: string;
  personId?: string;
  personName?: string;
  positionCode?: string;
  personUnitId?: string;
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

function getIndividualKpis(positionCode: string) {
  const position = (individualKpisData as Record<string, unknown>[]).find(
    (p: Record<string, unknown>) => p.code === positionCode
  );
  return position ? (position.kpis as Array<Record<string, unknown>>) : [];
}

function getPositionName(code: string) {
  const position = (individualKpisData as Record<string, unknown>[]).find(
    (p: Record<string, unknown>) => p.code === code
  );
  return position ? (position.name as string) : code;
}

export default function IndividualEvaluationPage() {
  const [evaluations, setEvaluations] = useState<IndividualEvaluation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetail, setShowDetail] = useState(false);
  const [showSelfEval, setShowSelfEval] = useState(false);
  const [showManagerEval, setShowManagerEval] = useState(false);
  const [showCouncilEval, setShowCouncilEval] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [selectedEval, setSelectedEval] = useState<IndividualEvaluation | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEvals = useCallback(async () => {
    try {
      const data = await apiGet<IndividualEvaluation[]>('/api/evaluation/individual');
      setEvaluations(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadEvals(); }, [loadEvals]);

  const filtered = evaluations.filter((ev) => {
    const matchesSearch = (ev.personName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.positionCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.unitName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalEval = evaluations.length;
  const lockedCount = evaluations.filter((e) => e.status === 'locked').length;
  const pendingCount = evaluations.filter((e) => e.status === 'pending' || e.status === 'self_evaluated').length;
  const scores = evaluations.filter((e) => e.finalScore).map((e) => e.finalScore!);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const gradeStats = {
    xuat_sac: evaluations.filter((e) => e.grade === 'Xuất sắc').length,
    tot: evaluations.filter((e) => e.grade === 'Tốt').length,
    dat: evaluations.filter((e) => e.grade === 'Đạt').length,
    can_cai_thien: evaluations.filter((e) => e.grade === 'Cần cải thiện').length,
    khong_dat: evaluations.filter((e) => e.grade === 'Không đạt').length,
  };

  const handleSelfEval = async (score: number, comment: string) => {
    if (!selectedEval) return;
    await apiPut(`/api/evaluation/individual/${selectedEval.id}`, { selfScore: score, selfComment: comment });
    setShowSelfEval(false);
    setSelectedEval(null);
    loadEvals();
  };

  const handleManagerEval = async (score: number, comment: string) => {
    if (!selectedEval) return;
    await apiPut(`/api/evaluation/individual/${selectedEval.id}`, { managerScore: score, managerComment: comment });
    setShowManagerEval(false);
    setSelectedEval(null);
    loadEvals();
  };

  const handleCouncilEval = async (score: number, comment: string) => {
    if (!selectedEval) return;
    await apiPut(`/api/evaluation/individual/${selectedEval.id}`, { councilScore: score, councilComment: comment });
    setShowCouncilEval(false);
    setSelectedEval(null);
    loadEvals();
  };

  const handleLock = async () => {
    if (!selectedEval) return;
    await apiPut(`/api/evaluation/individual/${selectedEval.id}`, { status: 'locked' });
    setShowLock(false);
    setSelectedEval(null);
    loadEvals();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Đánh giá KPI Cá nhân</h1>
          <p className="text-text-light mt-1">Tự đánh giá → Trưởng đơn vị → Hội đồng → Khóa kết quả</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><User size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng cá nhân</p><p className="text-xl font-bold">{totalEval}</p></div>
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
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/20 rounded-lg"><Award size={20} className="text-secondary" /></div>
            <div><p className="text-text-light text-sm">Xuất sắc</p><p className="text-xl font-bold">{gradeStats.xuat_sac}</p></div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h4 className="font-heading font-bold text-sm mb-3">Phân bố xếp loại</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Xuất sắc', count: gradeStats.xuat_sac, color: '#4caf50' },
            { label: 'Tốt', count: gradeStats.tot, color: '#2196f3' },
            { label: 'Đạt', count: gradeStats.dat, color: '#ff9800' },
            { label: 'Cần cải thiện', count: gradeStats.can_cai_thien, color: '#ffc107' },
            { label: 'Không đạt', count: gradeStats.khong_dat, color: '#f44336' },
          ].map((g) => (
            <div key={g.label} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${g.color}15` }}>
              <div className="text-2xl font-bold" style={{ color: g.color }}>{g.count}</div>
              <div className="text-xs text-text-light">{g.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm theo tên, vị trí, đơn vị..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
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
        <div className="card-header"><h3 className="text-white">Kết quả đánh giá cá nhân</h3></div>
        <div className="p-0">
          <div className="overflow-x-auto"><table className="table">
            <thead>
              <tr><th>Họ tên</th><th>Vị trí</th><th>Đơn vị</th><th>Tự ĐG</th><th>Trưởng đơn vị</th><th>Hội đồng</th><th>Điểm cuối</th><th>Xếp loại</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filtered.map((ev) => {
                const gradeStyle = ev.grade ? gradeConfig[ev.grade] : null;
                const status = statusConfig[ev.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <tr key={ev.id}>
                    <td className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-xs font-bold text-primary">
                          {(ev.personName || '?').charAt(0)}
                        </div>
                        <span>{ev.personName || '-'}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-info text-xs">{ev.positionCode} - {getPositionName(ev.positionCode || '')}</span></td>
                    <td className="text-sm">{ev.unitName}</td>
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
          </table></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Bảng xếp loại KPI cá nhân</h3></div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {Object.entries(gradeConfig).map(([grade, config]) => (
              <div key={grade} className="p-4 rounded-lg text-center" style={{ backgroundColor: config.bg }}>
                <div className="font-heading font-bold text-lg" style={{ color: config.color }}>{grade}</div>
                <div className="text-xs text-text-light mt-1">
                  {grade === 'Xuất sắc' && '≥90 điểm + minh chứng đầy đủ'}
                  {grade === 'Tốt' && '80-89 điểm'}
                  {grade === 'Đạt' && '65-79 điểm'}
                  {grade === 'Cần cải thiện' && '50-64 điểm'}
                  {grade === 'Không đạt' && '<50 điểm'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelectedEval(null); }} title="Chi tiết đánh giá cá nhân" maxWidth="max-w-4xl">
        {selectedEval && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-bg-cream rounded-lg border border-border">
              <div><span className="text-xs text-text-light">Họ tên</span><div className="font-medium">{selectedEval.personName}</div></div>
              <div><span className="text-xs text-text-light">Vị trí</span><div className="font-medium">{selectedEval.positionCode} - {getPositionName(selectedEval.positionCode || '')}</div></div>
              <div><span className="text-xs text-text-light">Đơn vị</span><div className="font-medium">{selectedEval.unitName}</div></div>
              <div><span className="text-xs text-text-light">Chu kỳ</span><div className="font-medium">{selectedEval.cycleName}</div></div>
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm mb-2">KPI theo vị trí: {getPositionName(selectedEval.positionCode || '')}</h4>
              <div className="max-h-[200px] overflow-y-auto border border-border rounded-lg">
                <div className="overflow-x-auto"><table className="table text-xs">
                  <thead><tr><th>Mã KPI</th><th>Tên KPI</th><th>Chỉ tiêu</th><th>Trọng số</th></tr></thead>
                  <tbody>
                    {getIndividualKpis(selectedEval.positionCode || '').map((kpi: Record<string, unknown>, idx: number) => (
                      <tr key={idx}>
                        <td><span className="badge badge-info">{kpi.id as string}</span></td>
                        <td>{kpi.name as string}</td>
                        <td>{kpi.target as string} {kpi.unit as string}</td>
                        <td>{kpi.weight as number}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-bg-cream rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2"><Star size={16} className="text-primary" /><span className="font-medium text-sm">Tự đánh giá</span></div>
                <div className="text-2xl font-bold text-primary mb-2">{selectedEval.selfScore ?? '-'}</div>
                <p className="text-xs text-text-light">{selectedEval.selfComment || 'Chưa có nhận xét'}</p>
                {selectedEval.selfEvaluatedAt && <p className="text-[10px] text-text-light mt-2">{new Date(selectedEval.selfEvaluatedAt).toLocaleString('vi-VN')}</p>}
              </div>
              <div className="p-4 bg-bg-cream rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2"><Eye size={16} className="text-accent-yellow" /><span className="font-medium text-sm">Trưởng đơn vị</span></div>
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

      <Modal isOpen={showSelfEval} onClose={() => { setShowSelfEval(false); setSelectedEval(null); }} title="Tự đánh giá KPI cá nhân">
        <EvalForm label="Điểm tự đánh giá" onSubmit={handleSelfEval} onCancel={() => { setShowSelfEval(false); setSelectedEval(null); }} />
      </Modal>

      <Modal isOpen={showManagerEval} onClose={() => { setShowManagerEval(false); setSelectedEval(null); }} title="Trưởng đơn vị đánh giá">
        <EvalForm label="Điểm đánh giá" onSubmit={handleManagerEval} onCancel={() => { setShowManagerEval(false); setSelectedEval(null); }} />
      </Modal>

      <Modal isOpen={showCouncilEval} onClose={() => { setShowCouncilEval(false); setSelectedEval(null); }} title="Hội đồng rà soát KPI cá nhân">
        <div className="space-y-4">
          <div className="p-3 bg-bg-cream rounded-lg border border-border">
            <div className="font-medium text-sm">{selectedEval?.personName} - {selectedEval?.positionCode}</div>
            <div className="text-xs text-text-light mt-1">Đơn vị: {selectedEval?.unitName}</div>
            <div className="text-xs text-text-light">Điểm tự ĐG: {selectedEval?.selfScore} | Điểm cấp trên: {selectedEval?.managerScore}</div>
          </div>
          <EvalForm label="Điểm Hội đồng" onSubmit={handleCouncilEval} onCancel={() => { setShowCouncilEval(false); setSelectedEval(null); }} />
        </div>
      </Modal>

      <Modal isOpen={showLock} onClose={() => { setShowLock(false); setSelectedEval(null); }} title="Khóa kết quả đánh giá cá nhân">
        <div className="space-y-4">
          <div className="p-4 bg-bg-cream rounded-lg border border-border">
            <div className="font-medium text-sm mb-2">Xác nhận khóa kết quả</div>
            <div className="text-xs text-text-light">Sau khi khóa, kết quả đánh giá không thể chỉnh sửa.</div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
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
