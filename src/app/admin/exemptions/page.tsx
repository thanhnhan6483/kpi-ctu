'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, Clock, Search, Plus, Edit, Trash2, Percent } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface ExemptionCoefficient { id: string; name: string; code: string; coefficient: number; description: string; applicablePositions: string[]; status: string; }

const positionLabels: Record<string, string> = { GV: 'Giảng viên', GVQL: 'Giảng viên QL', BM: 'Trưởng bộ môn', LD: 'Lãnh đạo', NCV: 'Nghiên cứu viên', CV: 'Viên chức', CVDT: 'CV Chuyển đổi số' };

export default function ExemptionsPage() {
  const [items, setItems] = useState<ExemptionCoefficient[]>([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<ExemptionCoefficient | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setItems(await apiGet<ExemptionCoefficient[]>('/api/exemption-coefficients')); }
    catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => { if (search) { const s = search.toLowerCase(); return i.name.toLowerCase().includes(s) || i.description.toLowerCase().includes(s); } return true; });

  const handleCreate = async (data: Partial<ExemptionCoefficient>) => { await apiPost<ExemptionCoefficient>('/api/exemption-coefficients', data); setShowCreate(false); load(); };
  const handleUpdate = async (data: Partial<ExemptionCoefficient>) => { if (!selected) return; await apiPut(`/api/exemption-coefficients/${selected.id}`, data); setShowEdit(false); load(); };
  const handleDelete = async (id: string) => { if (!confirm('Xóa hệ số này?')) return; await apiDelete(`/api/exemption-coefficients/${id}`); load(); };

  const Form = ({ onSubmit, initial }: { onSubmit: (d: Partial<ExemptionCoefficient>) => void; initial?: ExemptionCoefficient }) => {
    const [form, setForm] = useState(initial || { name: '', code: '', coefficient: 1.0, description: '', applicablePositions: [] as string[], status: 'active' });
    return (
      <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Tên hệ số *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Mã *</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required /></div>
          <div><label className="block text-sm font-medium mb-1">Hệ số (0-1) *</label><input type="number" value={form.coefficient} onChange={e => setForm({ ...form, coefficient: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" min={0} max={1} step={0.05} required /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" rows={2} /></div>
        <div><label className="block text-sm font-medium mb-1">Vị trí áp dụng</label><div className="flex flex-wrap gap-2">{Object.entries(positionLabels).map(([code, label]) => (<label key={code} className="flex items-center gap-1 text-sm"><input type="checkbox" checked={form.applicablePositions.includes(code)} onChange={e => { const positions = e.target.checked ? [...form.applicablePositions, code] : form.applicablePositions.filter(p => p !== code); setForm({ ...form, applicablePositions: positions }); }} className="rounded" />{label}</label>))}</div></div>
        <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg-cream">Hủy</button><button type="submit" className="btn-primary">Lưu</button></div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Hệ số miễn giảm & Chính sách</h1>
          <p className="text-text-light mt-1">Quản lý hệ số miễn giảm, kiêm nhiệm, thâm niên (XV.3)</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Thêm mới</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary-light rounded-lg"><Percent size={20} className="text-primary" /></div><div><p className="text-text-light text-sm">Tổng hệ số</p><p className="text-xl font-bold">{items.length}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div><div><p className="text-text-light text-sm">Đang áp dụng</p><p className="text-xl font-bold">{items.filter(i => i.status === 'active').length}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-yellow/20 rounded-lg"><Clock size={20} className="text-accent-yellow" /></div><div><p className="text-text-light text-sm">Hệ số thấp nhất</p><p className="text-xl font-bold">{items.length > 0 ? Math.min(...items.map(i => i.coefficient)) : '-'}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-blue/20 rounded-lg"><FileText size={20} className="text-blue-600" /></div><div><p className="text-text-light text-sm">Hệ số cao nhất</p><p className="text-xl font-bold">{items.length > 0 ? Math.max(...items.map(i => i.coefficient)) : '-'}</p></div></div></div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm hệ số..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách hệ số miễn giảm</h3></div>
        <div className="p-0">
          <div className="overflow-x-auto"><table className="table">
            <thead><tr><th>STT</th><th>Mã</th><th>Tên hệ số</th><th>Hệ số</th><th>Vị trí áp dụng</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="text-center py-8">Đang tải...</td></tr> :
              filtered.length === 0 ? <tr><td colSpan={8} className="text-center py-8">Không có dữ liệu</td></tr> :
              filtered.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td className="font-mono text-xs">{item.code}</td>
                  <td className="font-medium">{item.name}</td>
                  <td><span className={`badge ${item.coefficient < 1 ? 'badge-warning' : 'badge-success'}`}>{(item.coefficient * 100).toFixed(0)}%</span></td>
                  <td className="text-xs">{item.applicablePositions.map(p => positionLabels[p] || p).join(', ')}</td>
                  <td className="text-sm text-text-light max-w-[200px] truncate">{item.description}</td>
                  <td><span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{item.status === 'active' ? 'Đang dùng' : 'Ngừng'}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => { setSelected(item); setShowEdit(true); }} className="p-1 hover:bg-blue-50 rounded" title="Chỉnh sửa"><Edit size={14} className="text-blue-600" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded" title="Xóa"><Trash2 size={14} className="text-red-600" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Thêm hệ số miễn giảm"><Form onSubmit={handleCreate} /></Modal>
      <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setSelected(null); }} title="Chỉnh sửa hệ số">{selected && <Form onSubmit={handleUpdate} initial={selected} />}</Modal>
    </div>
  );
}
