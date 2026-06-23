'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, MessageSquare, Search, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface Complaint {
  id: string;
  code: string;
  title: string;
  content: string;
  unitName: string;
  status: string;
  priority: string;
  response: string;
  createdAt: string;
}

export default function ComplaintsPage() {
  const [items, setItems] = useState<Complaint[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Complaint | null>(null);
  const [reviewItem, setReviewItem] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await apiGet<Complaint[]>('/api/complaints');
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: any) => {
    if (editItem) {
      await apiPut(`/api/complaints/${editItem.id}`, data);
    } else {
      await apiPost('/api/complaints', data);
    }
    setShowModal(false); setEditItem(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa khiếu nại này?')) return;
    await apiDelete(`/api/complaints/${id}`);
    load();
  };

  const handleReview = async () => {
    if (!reviewItem) return;
    await apiPut(`/api/complaints/${reviewItem.id}`, reviewItem);
    setReviewItem(null); load();
  };

  const filtered = items.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return item.title.toLowerCase().includes(s) || item.unitName.toLowerCase().includes(s);
    }
    return true;
  });

  const statusOptions = ['all', 'pending', 'reviewing', 'resolved', 'rejected'];
  const statusLabels: Record<string, string> = { all: 'Tất cả', pending: 'Chờ xử lý', reviewing: 'Đang xem xét', resolved: 'Đã giải quyết', rejected: 'Từ chối' };
  const statusBadge: Record<string, string> = { pending: 'badge-warning', reviewing: 'badge-info', resolved: 'badge-success', rejected: 'badge-danger' };
  const priorityColor = (p: string) => p === 'high' ? 'text-accent-red' : p === 'medium' ? 'text-accent-yellow' : 'text-text-light';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Khiếu nại / Giải trình</h1>
          <p className="text-text-light mt-1">Quản lý khiếu nại và giải trình kết quả KPI (XIV.3, XXI.12)</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm mới
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>{statusLabels[s]}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách khiếu nại</h3></div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-text-light">Đang tải...</div>
          ) : (
            <table className="table">
              <thead><tr><th>STT</th><th>Mã</th><th>Tiêu đề</th><th>Đơn vị</th><th>Mức độ</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
              <tbody>{filtered.length === 0 ? <tr><td colSpan={8} className="text-center py-8">Không có dữ liệu</td></tr> :
                filtered.map((item, i) => (<tr key={item.id}>
                  <td>{i + 1}</td>
                  <td className="font-mono text-xs">{item.code}</td>
                  <td className="font-medium text-sm">{item.title}</td>
                  <td className="text-sm">{item.unitName}</td>
                  <td><span className={`text-xs font-medium ${priorityColor(item.priority)}`}>{item.priority === 'high' ? 'Cao' : item.priority === 'medium' ? 'Trung bình' : 'Thấp'}</span></td>
                  <td><span className={`badge ${statusBadge[item.status] || 'badge-info'}`}>{statusLabels[item.status]}</span></td>
                  <td className="text-sm text-text-light">{item.createdAt}</td>
                  <td><div className="flex gap-1">
                    <button onClick={() => setReviewItem({ ...item })} className="p-1 hover:bg-green-50 rounded" title="Xem xét"><CheckCircle size={12} className="text-green-600" /></button>
                    <button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button>
                  </div></td>
                </tr>))}</tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Chỉnh sửa khiếu nại' : 'Thêm khiếu nại'}>
        <ComplaintForm initial={editItem} onSubmit={handleSave} />
      </Modal>

      <Modal isOpen={!!reviewItem} onClose={() => setReviewItem(null)} title="Xem xét khiếu nại">
        {reviewItem && (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Tiêu đề</label><div className="text-sm font-medium">{reviewItem.title}</div></div>
            <div><label className="block text-sm font-medium mb-1">Nội dung</label><div className="text-sm p-3 bg-bg-cream rounded-lg">{reviewItem.content}</div></div>
            <div><label className="block text-sm font-medium mb-1">Phản hồi</label><textarea value={reviewItem.response || ''} onChange={e => setReviewItem({ ...reviewItem, response: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={4} placeholder="Nhập phản hồi..." /></div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setReviewItem({ ...reviewItem, status: 'resolved' })} className="btn-primary text-xs">Xác nhận giải quyết</button>
              <button onClick={() => setReviewItem({ ...reviewItem, status: 'rejected' })} className="btn-danger text-xs">Từ chối</button>
              <button onClick={() => setReviewItem({ ...reviewItem, status: 'reviewing' })} className="btn-secondary text-xs">Đang xem xét</button>
            </div>
            <div className="flex justify-end"><button onClick={handleReview} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Lưu phản hồi</button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ComplaintForm({ initial, onSubmit }: { initial?: Complaint | null; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { code: '', title: '', content: '', unitName: '', priority: 'medium', status: 'pending', response: '', createdAt: '' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mã *</label><input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
        <div><label className="block text-sm font-medium mb-1">Tiêu đề *</label><input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Đơn vị *</label><input value={f.unitName} onChange={e => setF({ ...f, unitName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      <div><label className="block text-sm font-medium mb-1">Nội dung *</label><textarea value={f.content} onChange={e => setF({ ...f, content: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mức độ</label>
          <select value={f.priority} onChange={e => setF({ ...f, priority: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="low">Thấp</option><option value="medium">Trung bình</option><option value="high">Cao</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium mb-1">Trạng thái</label>
          <select value={f.status} onChange={e => setF({ ...f, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="pending">Chờ xử lý</option><option value="reviewing">Đang xem xét</option><option value="resolved">Đã giải quyết</option><option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
    </form>
  );
}
