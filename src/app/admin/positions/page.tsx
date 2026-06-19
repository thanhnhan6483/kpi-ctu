'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Briefcase } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface Position {
  id: string;
  name: string;
  code: string;
  level: string;
  category: string;
  status: 'active' | 'inactive';
}

export default function PositionsPage() {
  const [items, setItems] = useState<Position[]>([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setItems(await apiGet<Position[]>('/api/positions')); }
    catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.code.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(items.map(i => i.category))];

  const handleCreate = async (data: Partial<Position>) => {
    await apiPost<Position>('/api/positions', data);
    setShowCreate(false);
    load();
  };

  const handleUpdate = async (data: Partial<Position>) => {
    if (!selected) return;
    await apiPut(`/api/positions/${selected.id}`, data);
    setShowEdit(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa chức vụ này?')) return;
    await apiDelete(`/api/positions/${id}`);
    load();
  };

  const Form = ({ onSubmit, initial }: { onSubmit: (d: Partial<Position>) => void; initial?: Position }) => {
    const [form, setForm] = useState(initial || { name: '', code: '', level: '', category: '', status: 'active' as const });
    return (
      <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên chức vụ *</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mã *</label>
            <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cấp bậc</label>
            <input value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nhóm chức danh</label>
          <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="VD: Giảng viên, Quản lý, Viên chức" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => initial ? setShowEdit(false) : setShowCreate(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Lưu</button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Chức vụ / Chức danh</h1>
          <p className="text-text-light text-sm mt-1">Quản lý danh mục chức vụ, chức danh trong hệ thống</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark">
          <Plus size={16} /> Thêm mới
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm chức vụ..." className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full sm:w-80" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-cream">
              <tr>
                <th className="text-left px-4 py-3 font-medium">STT</th>
                <th className="text-left px-4 py-3 font-medium">Mã</th>
                <th className="text-left px-4 py-3 font-medium">Tên chức vụ</th>
                <th className="text-left px-4 py-3 font-medium">Cấp bậc</th>
                <th className="text-left px-4 py-3 font-medium">Nhóm</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                <th className="text-right px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-text-light">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-text-light">Không có dữ liệu</td></tr>
              ) : filtered.map((item, idx) => (
                <tr key={item.id} className="hover:bg-bg-cream/50">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs">{item.code}</td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.level}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.status === 'active' ? 'Đang dùng' : 'Ngừng dùng'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setSelected(item); setShowEdit(true); }} className="p-1.5 hover:bg-blue-50 rounded"><Edit size={14} className="text-blue-600" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-600" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t text-sm text-text-light">Tổng: {filtered.length} chức vụ</div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Thêm chức vụ mới">
        <Form onSubmit={handleCreate} />
      </Modal>
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Chỉnh sửa chức vụ">
        {selected && <Form onSubmit={handleUpdate} initial={selected} />}
      </Modal>
    </div>
  );
}
