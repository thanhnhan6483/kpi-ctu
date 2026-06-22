'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, HelpCircle, Search, Send } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface SupportTicket {
  id: string;
  code: string;
  title: string;
  content: string;
  requesterName: string;
  priority: string;
  status: string;
  response: string;
  createdAt: string;
}

export default function SupportTicketsPage() {
  const [items, setItems] = useState<SupportTicket[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<SupportTicket | null>(null);
  const [replyItem, setReplyItem] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await apiGet<SupportTicket[]>('/api/support-tickets');
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: any) => {
    if (editItem) {
      await apiPut(`/api/support-tickets/${editItem.id}`, data);
    } else {
      await apiPost('/api/support-tickets', data);
    }
    setShowModal(false); setEditItem(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa yêu cầu này?')) return;
    await apiDelete(`/api/support-tickets/${id}`);
    load();
  };

  const handleReply = async () => {
    if (!replyItem) return;
    await apiPut(`/api/support-tickets/${replyItem.id}`, { ...replyItem, status: 'resolved' });
    setReplyItem(null); load();
  };

  const filtered = items.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return item.title.toLowerCase().includes(s) || item.requesterName.toLowerCase().includes(s);
    }
    return true;
  });

  const statusOptions = ['all', 'open', 'in_progress', 'resolved', 'closed'];
  const statusLabels: Record<string, string> = { all: 'Tất cả', open: 'Mở', in_progress: 'Đang xử lý', resolved: 'Đã giải quyết', closed: 'Đã đóng' };
  const statusBadge: Record<string, string> = { open: 'badge-warning', in_progress: 'badge-info', resolved: 'badge-success', closed: 'badge-danger' };
  const priorityColor = (p: string) => p === 'high' ? 'text-accent-red' : p === 'medium' ? 'text-accent-yellow' : 'text-text-light';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Yêu cầu hỗ trợ</h1>
          <p className="text-text-light mt-1">Quản lý yêu cầu hỗ trợ kỹ thuật hệ thống KPI (XXI.25)</p>
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
        <div className="card-header"><h3 className="text-white">Danh sách yêu cầu</h3></div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-text-light">Đang tải...</div>
          ) : (
            <table className="table">
              <thead><tr><th>STT</th><th>Mã</th><th>Tiêu đề</th><th>Người yêu cầu</th><th>Mức độ</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
              <tbody>{filtered.length === 0 ? <tr><td colSpan={8} className="text-center py-8">Không có dữ liệu</td></tr> :
                filtered.map((item, i) => (<tr key={item.id}>
                  <td>{i + 1}</td>
                  <td className="font-mono text-xs">{item.code}</td>
                  <td className="font-medium text-sm">{item.title}</td>
                  <td className="text-sm">{item.requesterName}</td>
                  <td><span className={`text-xs font-medium ${priorityColor(item.priority)}`}>{item.priority === 'high' ? 'Cao' : item.priority === 'medium' ? 'Trung bình' : 'Thấp'}</span></td>
                  <td><span className={`badge ${statusBadge[item.status] || 'badge-info'}`}>{statusLabels[item.status]}</span></td>
                  <td className="text-sm text-text-light">{item.createdAt}</td>
                  <td><div className="flex gap-1">
                    <button onClick={() => setReplyItem({ ...item })} className="p-1 hover:bg-green-50 rounded" title="Phản hồi"><Send size={12} className="text-green-600" /></button>
                    <button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button>
                  </div></td>
                </tr>))}</tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Chỉnh sửa yêu cầu' : 'Thêm yêu cầu hỗ trợ'}>
        <TicketForm initial={editItem} onSubmit={handleSave} />
      </Modal>

      <Modal isOpen={!!replyItem} onClose={() => setReplyItem(null)} title="Phản hồi yêu cầu hỗ trợ">
        {replyItem && (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Tiêu đề</label><div className="text-sm font-medium">{replyItem.title}</div></div>
            <div><label className="block text-sm font-medium mb-1">Nội dung yêu cầu</label><div className="text-sm p-3 bg-bg-cream rounded-lg">{replyItem.content}</div></div>
            <div><label className="block text-sm font-medium mb-1">Phản hồi</label><textarea value={replyItem.response || ''} onChange={e => setReplyItem({ ...replyItem, response: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={4} placeholder="Nhập nội dung phản hồi..." /></div>
            <div className="flex justify-end"><button onClick={handleReply} className="btn-primary text-xs">Gửi phản hồi & đóng yêu cầu</button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function TicketForm({ initial, onSubmit }: { initial?: SupportTicket | null; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { code: '', title: '', content: '', requesterName: '', priority: 'medium', status: 'open', response: '', createdAt: '' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mã *</label><input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
        <div><label className="block text-sm font-medium mb-1">Tiêu đề *</label><input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Người yêu cầu *</label><input value={f.requesterName} onChange={e => setF({ ...f, requesterName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
        <div><label className="block text-sm font-medium mb-1">Mức độ</label>
          <select value={f.priority} onChange={e => setF({ ...f, priority: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="low">Thấp</option><option value="medium">Trung bình</option><option value="high">Cao</option>
          </select>
        </div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Nội dung *</label><textarea value={f.content} onChange={e => setF({ ...f, content: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} required /></div>
      <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
    </form>
  );
}
