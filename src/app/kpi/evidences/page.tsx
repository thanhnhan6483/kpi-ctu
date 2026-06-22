'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, Search, Plus, Trash2, Eye, Link, ChevronDown, ChevronRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import planItemsData from '@/data/plan-items.json';
import plansData from '@/data/plans.json';
import indicatorsData from '@/data/indicators.json';
import unitsData from '@/data/units.json';

interface Evidence {
  id: string; planItemIds: string[]; evidenceType: 'file' | 'url' | 'system_log' | 'survey' | 'email';
  fileName?: string; fileUrl?: string; externalUrl?: string;
  status: 'pending' | 'submitted' | 'needs_supplement' | 'valid' | 'invalid' | 'locked';
  reviewerNote?: string; reviewedBy?: string; reviewedAt?: string;
  submittedAt: string; submittedBy: string; version: number; classification: 'normal' | 'internal' | 'confidential' | 'restricted';
  expiresAt?: string;
}

interface PlanItem { id: string; planId: string; indicatorId: string; }
interface Plan { id: string; ownerId: string; }

const indicatorMap: Record<string, string> = {};
(indicatorsData as { id: string; name: string }[]).forEach(i => { indicatorMap[i.id] = i.name; });

const unitMap: Record<string, string> = {};
(unitsData as { id: string; name: string }[]).forEach(u => { unitMap[u.id] = u.name; });

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Bản nháp', color: '#6b7280' },
  submitted: { label: 'Đã nộp', color: '#3b82f6' },
  needs_supplement: { label: 'Cần bổ sung', color: '#eab308' },
  valid: { label: 'Hợp lệ', color: '#22c55e' },
  invalid: { label: 'Không hợp lệ', color: '#ef4444' },
  locked: { label: 'Đã khóa', color: '#8b5cf6' },
};

const statusFilters = [
  { value: 'all', label: 'Tất cả' },
  { value: 'submitted', label: 'Chờ kiểm tra' },
  { value: 'valid', label: 'Hợp lệ' },
  { value: 'invalid', label: 'Không hợp lệ' },
  { value: 'needs_supplement', label: 'Cần bổ sung' },
];

const typeLabels: Record<string, string> = { file: 'Tệp tin', url: 'Liên kết', system_log: 'Log hệ thống', survey: 'Khảo sát', email: 'Email' };

export default function EvidencesPage() {
  const [items, setItems] = useState<Evidence[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selected, setSelected] = useState<Evidence | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setItems(await apiGet<Evidence[]>('/api/evidences')); }
    catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (searchTerm) { const s = searchTerm.toLowerCase(); return (i.fileName || '').toLowerCase().includes(s) || (i.externalUrl || '').toLowerCase().includes(s); }
    return true;
  });

  const pendingCount = items.filter(i => i.status === 'submitted').length;
  const validCount = items.filter(i => i.status === 'valid').length;
  const needsSupplementCount = items.filter(i => i.status === 'needs_supplement').length;

  const handleCreate = async (data: Partial<Evidence>) => { await apiPost<Evidence>('/api/evidences', { ...data, planItemIds: data.planItemIds || [] }); setShowCreate(false); load(); };
  const handleReview = async (id: string, status: string, note: string) => {
    await apiPut(`/api/evidences/${id}`, { status, reviewerNote: note, reviewedBy: 'u001', reviewedAt: new Date().toISOString() });
    await apiPost('/api/notifications', { userId: 'u002', title: 'Minh chứng đã được kiểm tra', content: `Minh chứng ${id} chuyển sang trạng thái ${statusConfig[status]?.label || status}` }).catch(() => {});
    setShowReview(false); load();
  };
  const handleDelete = async (id: string) => { if (!confirm('Xóa minh chứng này?')) return; await apiDelete(`/api/evidences/${id}`); load(); };

  const Form = ({ onSubmit }: { onSubmit: (d: Partial<Evidence>) => void }) => {
    const [form, setForm] = useState({ planItemIds: [] as string[], evidenceType: 'file' as const, fileName: '', externalUrl: '', submittedBy: 'u002', classification: 'normal' as const, expiresAt: '' });
    return (
      <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Liên kết với KPI *</label><select multiple value={form.planItemIds} onChange={e => setForm({ ...form, planItemIds: Array.from(e.target.selectedOptions, o => o.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" size={4} required>{(planItemsData as { id: string; indicatorId: string }[]).map(item => <option key={item.id} value={item.id}>{indicatorMap[item.indicatorId] || item.indicatorId} ({item.id})</option>)}</select><p className="text-xs text-text-light mt-1">Giữ Ctrl/Cmd để chọn nhiều KPI</p></div>
        <div><label className="block text-sm font-medium mb-1">Loại minh chứng *</label><select value={form.evidenceType} onChange={e => setForm({ ...form, evidenceType: e.target.value as any })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"><option value="file">Tệp tin</option><option value="url">Liên kết URL</option><option value="system_log">Log hệ thống</option><option value="survey">Khảo sát</option><option value="email">Email</option></select></div>
        {form.evidenceType === 'file' ? <div><label className="block text-sm font-medium mb-1">Tên tệp tin *</label><input value={form.fileName} onChange={e => setForm({ ...form, fileName: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required /></div> : <div><label className="block text-sm font-medium mb-1">URL *</label><input value={form.externalUrl} onChange={e => setForm({ ...form, externalUrl: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required /></div>}
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Phân loại</label><select value={form.classification} onChange={e => setForm({ ...form, classification: e.target.value as any })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"><option value="normal">Công khai</option><option value="internal">Nội bộ</option><option value="confidential">Nhạy cảm</option><option value="restricted">Hạn chế</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Ngày hết hạn</label><input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg-cream">Hủy</button><button type="submit" className="btn-primary">Nộp minh chứng</button></div>
      </form>
    );
  };

  const ReviewForm = ({ evidence }: { evidence: Evidence }) => {
    const [note, setNote] = useState('');
    return (
      <div className="space-y-4">
        <div className="bg-bg-cream rounded-lg p-3 text-sm"><div><strong>Loại:</strong> {typeLabels[evidence.evidenceType]}</div><div><strong>Tệp:</strong> {evidence.fileName || evidence.externalUrl}</div><div><strong>KPI liên kết:</strong> {evidence.planItemIds?.length || 0} KPI</div></div>
        <div><label className="block text-sm font-medium mb-1">Ghi chú đánh giá</label><textarea value={note} onChange={e => setNote(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" rows={3} /></div>
        <div className="flex gap-2">
          <button onClick={() => handleReview(evidence.id, 'valid', note)} className="flex-1 px-4 py-2 bg-accent-green text-white rounded-lg text-sm hover:opacity-90">Hợp lệ</button>
          <button onClick={() => handleReview(evidence.id, 'needs_supplement', note)} className="flex-1 px-4 py-2 bg-accent-yellow text-white rounded-lg text-sm hover:opacity-90">Cần bổ sung</button>
          <button onClick={() => handleReview(evidence.id, 'invalid', note)} className="flex-1 px-4 py-2 bg-accent-red text-white rounded-lg text-sm hover:opacity-90">Không hợp lệ</button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý Minh chứng số</h1>
          <p className="text-text-light mt-1">Tải lên, liên kết, kiểm tra và quản lý kho minh chứng (XI.1-XI.6)</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nộp minh chứng</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary-light rounded-lg"><FileText size={20} className="text-primary" /></div><div><p className="text-text-light text-sm">Tổng minh chứng</p><p className="text-xl font-bold">{items.length}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-yellow/20 rounded-lg"><Clock size={20} className="text-accent-yellow" /></div><div><p className="text-text-light text-sm">Chờ xử lý</p><p className="text-xl font-bold">{pendingCount}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div><div><p className="text-text-light text-sm">Hợp lệ</p><p className="text-xl font-bold">{validCount}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-red/20 rounded-lg"><AlertTriangle size={20} className="text-accent-red" /></div><div><p className="text-text-light text-sm">Cần bổ sung</p><p className="text-xl font-bold">{needsSupplementCount}</p></div></div></div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm minh chứng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((s) => (
            <button key={s.value} onClick={() => setStatusFilter(s.value)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === s.value ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>{s.label}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách minh chứng</h3></div>
        <div className="p-0">
          <div className="overflow-x-auto"><table className="table">
            <thead><tr><th>STT</th><th>Loại</th><th>Tệp/URL</th><th>KPI liên kết</th><th>Phân loại</th><th>Trạng thái</th><th>Hiệu lực</th><th>Ngày nộp</th><th>Thao tác</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={9} className="text-center py-8">Đang tải...</td></tr> :
              filtered.length === 0 ? <tr><td colSpan={9} className="text-center py-8">Chưa có minh chứng</td></tr> :
              filtered.map((item, idx) => {
                const status = statusConfig[item.status] || statusConfig.pending;
                return (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td className="text-sm">{typeLabels[item.evidenceType]}</td>
                    <td className="text-sm max-w-[150px] truncate">{item.fileName || item.externalUrl || '-'}</td>
                    <td className="text-sm">{item.planItemIds?.length || 0} KPI</td>
                    <td><span className={`badge ${item.classification === 'confidential' ? 'badge-danger' : item.classification === 'restricted' ? 'badge-danger' : item.classification === 'internal' ? 'badge-warning' : 'badge-info'}`}>{item.classification === 'confidential' ? 'Nhạy cảm' : item.classification === 'restricted' ? 'Hạn chế' : item.classification === 'internal' ? 'Nội bộ' : 'Công khai'}</span></td>
                    <td><span className="badge" style={{ backgroundColor: `${status.color}20`, color: status.color }}>{status.label}</span></td>
                    <td>{(() => { if (!item.expiresAt) return <span className="text-xs text-text-light">Vô thời hạn</span>; const now = new Date(); const exp = new Date(item.expiresAt); const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)); if (daysLeft < 0) return <span className="badge badge-danger text-xs">Hết hạn</span>; if (daysLeft <= 30) return <span className="badge badge-warning text-xs">Sắp hết hạn ({daysLeft} ngày)</span>; return <span className="badge badge-success text-xs">Còn hiệu lực</span>; })()}</td>
                    <td className="text-sm text-text-light">{item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('vi-VN') : '-'}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelected(item); setShowDetail(true); }} className="p-1 hover:bg-blue-50 rounded" title="Xem"><Eye size={14} className="text-blue-600" /></button>
                        {(item.status === 'submitted' || item.status === 'needs_supplement') && <button onClick={() => { setSelected(item); setShowReview(true); }} className="p-1 hover:bg-green-50 rounded" title="Đánh giá"><CheckCircle size={14} className="text-green-600" /></button>}
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

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nộp minh chứng mới"><Form onSubmit={handleCreate} /></Modal>
      <Modal isOpen={showReview} onClose={() => { setShowReview(false); setSelected(null); }} title="Kiểm tra minh chứng">{selected && <ReviewForm evidence={selected} />}</Modal>
      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelected(null); }} title="Chi tiết minh chứng">
        {selected && (
          <div className="space-y-3 text-sm">
            <div><strong>Loại:</strong> {typeLabels[selected.evidenceType]}</div>
            <div><strong>Tệp/URL:</strong> {selected.fileName || selected.externalUrl || '-'}</div>
            <div><strong>KPI liên kết:</strong> {selected.planItemIds?.length || 0} KPI</div>
            <div><strong>Phân loại:</strong> {selected.classification === 'confidential' ? 'Nhạy cảm' : selected.classification === 'internal' ? 'Nội bộ' : 'Bình thường'}</div>
            <div><strong>Trạng thái:</strong> {statusConfig[selected.status]?.label}</div>
            {selected.reviewerNote && <div><strong>Ghi chú:</strong> {selected.reviewerNote}</div>}
            <div><strong>Ngày nộp:</strong> {new Date(selected.submittedAt).toLocaleString('vi-VN')}</div>
            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1 text-primary text-xs font-medium mt-2">
              {showHistory ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Lịch sử thay đổi
            </button>
            {showHistory && (
              <div className="bg-bg-cream rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
                {selected.reviewedAt && <div className="flex items-start gap-2"><Clock size={12} className="mt-0.5 text-text-light shrink-0" /><div><p className="text-xs">{selected.reviewedBy || 'Người duyệt'} kiểm tra</p><p className="text-[10px] text-text-light">{new Date(selected.reviewedAt).toLocaleString('vi-VN')}</p></div></div>}
                <div className="flex items-start gap-2"><FileText size={12} className="mt-0.5 text-text-light shrink-0" /><div><p className="text-xs">Nộp minh chứng</p><p className="text-[10px] text-text-light">{new Date(selected.submittedAt).toLocaleString('vi-VN')}</p></div></div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
