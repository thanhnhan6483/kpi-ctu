'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, Clock, Search, Plus, Edit, Trash2, Bell, Send, AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface NotificationTemplate { id: string; name: string; type: string; title: string; content: string; event: string; status: string; }

const typeConfig: Record<string, { label: string; color: string }> = {
  info: { label: 'Thông tin', color: '#3b82f6' },
  warning: { label: 'Cảnh báo', color: '#f59e0b' },
  reminder: { label: 'Nhắc nhở', color: '#eab308' },
  approval: { label: 'Phê duyệt', color: '#8b5cf6' },
};

export default function NotificationTemplatesPage() {
  const [items, setItems] = useState<NotificationTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<NotificationTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setItems(await apiGet<NotificationTemplate[]>('/api/notification-templates')); }
    catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => { if (search) { const s = search.toLowerCase(); return i.name.toLowerCase().includes(s) || i.title.toLowerCase().includes(s); } return true; });

  const handleCreate = async (data: Partial<NotificationTemplate>) => { await apiPost<NotificationTemplate>('/api/notification-templates', data); setShowCreate(false); load(); };
  const handleUpdate = async (data: Partial<NotificationTemplate>) => { if (!selected) return; await apiPut(`/api/notification-templates/${selected.id}`, data); setShowEdit(false); load(); };
  const handleDelete = async (id: string) => { if (!confirm('Xóa mẫu thông báo này?')) return; await apiDelete(`/api/notification-templates/${id}`); load(); };

  const Form = ({ onSubmit, initial }: { onSubmit: (d: Partial<NotificationTemplate>) => void; initial?: NotificationTemplate }) => {
    const [form, setForm] = useState(initial || { name: '', type: 'info', title: '', content: '', event: '', status: 'active' });
    return (
      <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Tên mẫu *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Loại thông báo</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"><option value="info">Thông tin</option><option value="warning">Cảnh báo</option><option value="reminder">Nhắc nhở</option><option value="approval">Phê duyệt</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Sự kiện kích hoạt</label><input value={form.event} onChange={e => setForm({ ...form, event: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" placeholder="VD: kpi_assigned, plan_approved" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Tiêu đề *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required /></div>
        <div><label className="block text-sm font-medium mb-1">Nội dung mẫu *</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" rows={3} required /><p className="text-xs text-text-light mt-1">Biến: {'{kpiName}'}, {'{targetValue}'}, {'{unit}'}, {'{cycleName}'}, {'{deadline}'}, {'{count}'}, {'{days}'}, {'{score}'}, {'{grade}'}, {'{planName}'}, {'{approver}'}, {'{reason}'}</p></div>
        <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg-cream">Hủy</button><button type="submit" className="btn-primary">Lưu</button></div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Mẫu thông báo & Cấu hình</h1>
          <p className="text-text-light mt-1">Quản lý mẫu thông báo tự động (XIX.5)</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Thêm mẫu mới</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary-light rounded-lg"><Bell size={20} className="text-primary" /></div><div><p className="text-text-light text-sm">Tổng mẫu</p><p className="text-xl font-bold">{items.length}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-50 rounded-lg"><Send size={20} className="text-blue-600" /></div><div><p className="text-text-light text-sm">Thông tin</p><p className="text-xl font-bold">{items.filter(i => i.type === 'info').length}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-yellow/20 rounded-lg"><AlertTriangle size={20} className="text-accent-yellow" /></div><div><p className="text-text-light text-sm">Cảnh báo</p><p className="text-xl font-bold">{items.filter(i => i.type === 'warning').length}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div><div><p className="text-text-light text-sm">Đang kích hoạt</p><p className="text-xl font-bold">{items.filter(i => i.status === 'active').length}</p></div></div></div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm mẫu..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách mẫu thông báo</h3></div>
        <div className="p-0">
          <div className="overflow-x-auto"><table className="table">
            <thead><tr><th>STT</th><th>Tên mẫu</th><th>Loại</th><th>Tiêu đề</th><th>Sự kiện</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="text-center py-8">Đang tải...</td></tr> :
              filtered.length === 0 ? <tr><td colSpan={7} className="text-center py-8">Không có mẫu nào</td></tr> :
              filtered.map((item, idx) => {
                const tc = typeConfig[item.type] || typeConfig.info;
                return (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td className="font-medium">{item.name}</td>
                    <td><span className="badge" style={{ backgroundColor: `${tc.color}20`, color: tc.color }}>{tc.label}</span></td>
                    <td className="text-sm max-w-[200px] truncate">{item.title}</td>
                    <td className="text-xs font-mono">{item.event}</td>
                    <td><span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{item.status === 'active' ? 'Kích hoạt' : 'Tắt'}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelected(item); setShowEdit(true); }} className="p-1 hover:bg-blue-50 rounded" title="Chỉnh sửa"><Edit size={14} className="text-blue-600" /></button>
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

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Thêm mẫu thông báo mới"><Form onSubmit={handleCreate} /></Modal>
      <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setSelected(null); }} title="Chỉnh sửa mẫu thông báo">{selected && <Form onSubmit={handleUpdate} initial={selected} />}</Modal>
    </div>
  );
}
