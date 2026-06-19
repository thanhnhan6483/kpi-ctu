'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, MapPin } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import kpiGroupsData from '@/data/kpi-groups.json';

interface JobPosition {
  id: string;
  name: string;
  code: string;
  description: string;
  kpiGroupId: string;
  approvalLevel: string;
  status: 'active' | 'inactive';
}

const groupNames: Record<string, string> = {};
(kpiGroupsData as { id: string; name: string }[]).forEach(g => { groupNames[g.id] = g.name; });

export default function JobPositionsPage() {
  const [items, setItems] = useState<JobPosition[]>([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<JobPosition | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setItems(await apiGet<JobPosition[]>('/api/job-positions')); }
    catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: Partial<JobPosition>) => {
    await apiPost<JobPosition>('/api/job-positions', data);
    setShowCreate(false);
    load();
  };

  const handleUpdate = async (data: Partial<JobPosition>) => {
    if (!selected) return;
    await apiPut(`/api/job-positions/${selected.id}`, data);
    setShowEdit(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa vị trí việc làm này?')) return;
    await apiDelete(`/api/job-positions/${id}`);
    load();
  };

  const Form = ({ onSubmit, initial }: { onSubmit: (d: Partial<JobPosition>) => void; initial?: JobPosition }) => {
    const [form, setForm] = useState(initial || { name: '', code: '', description: '', kpiGroupId: '', approvalLevel: '', status: 'active' as const });
    return (
      <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên vị trí việc làm *</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mã *</label>
            <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cấp phê duyệt</label>
            <select value={form.approvalLevel} onChange={e => setForm({ ...form, approvalLevel: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">-- Chọn --</option>
              <option value="Trưởng bộ môn">Trưởng bộ môn</option>
              <option value="Trưởng khoa">Trưởng khoa</option>
              <option value="Trưởng đơn vị">Trưởng đơn vị</option>
              <option value="Ban Giám hiệu">Ban Giám hiệu</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nhóm KPI chính</label>
          <select value={form.kpiGroupId} onChange={e => setForm({ ...form, kpiGroupId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">-- Chọn nhóm KPI --</option>
            {Object.entries(groupNames).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mô tả nhiệm vụ</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} />
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
          <h1 className="text-2xl font-heading font-bold text-text-dark">Vị trí việc làm</h1>
          <p className="text-text-light text-sm mt-1">Quản lý vị trí việc làm và nhóm KPI phù hợp</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark">
          <Plus size={16} /> Thêm mới
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm vị trí việc làm..." className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full sm:w-80" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-cream">
              <tr>
                <th className="text-left px-4 py-3 font-medium">STT</th>
                <th className="text-left px-4 py-3 font-medium">Mã</th>
                <th className="text-left px-4 py-3 font-medium">Tên vị trí</th>
                <th className="text-left px-4 py-3 font-medium">Nhóm KPI</th>
                <th className="text-left px-4 py-3 font-medium">Cấp duyệt</th>
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
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-text-light mt-0.5 line-clamp-1">{item.description}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">{groupNames[item.kpiGroupId] || '-'}</td>
                  <td className="px-4 py-3 text-xs">{item.approvalLevel || '-'}</td>
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
        <div className="px-4 py-3 border-t text-sm text-text-light">Tổng: {filtered.length} vị trí</div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Thêm vị trí việc làm mới">
        <Form onSubmit={handleCreate} />
      </Modal>
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Chỉnh sửa vị trí việc làm">
        {selected && <Form onSubmit={handleUpdate} initial={selected} />}
      </Modal>
    </div>
  );
}
