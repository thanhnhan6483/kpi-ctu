'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Target, Send, CheckCircle, Lock, Compass, XCircle, History } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import unitsData from '@/data/units.json';

interface StrategicObjective {
  id: string;
  name: string;
  description: string;
  field: string;
  leadUnitId: string;
  supportUnitIds: string[];
  status: 'draft' | 'submitted' | 'approved' | 'locked';
  createdAt: string;
  updatedAt: string;
}

interface AcademicYear { id: string; name: string; status: string; }

const unitMap: Record<string, string> = {};
(unitsData as { id: string; name: string }[]).forEach(u => { unitMap[u.id] = u.name; });

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
  locked: { label: 'Đã khóa', color: 'bg-red-100 text-red-600' },
};

const fields = ['Đào tạo & Đảm bảo chất lượng', 'KHCN & Đổi mới sáng tạo', 'Đội ngũ & Phát triển giảng viên', 'Hợp tác Quốc tế', 'Quản trị & Tài chính', 'Chuyển đổi Số', 'Phục vụ Cộng đồng'];

export default function StrategicObjectivesPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [items, setItems] = useState<StrategicObjective[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'staff' | 'approver'>('staff');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<StrategicObjective | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [y, s] = await Promise.all([
        apiGet<AcademicYear[]>('/api/academic-years'),
        apiGet<StrategicObjective[]>('/api/strategic-objectives'),
      ]);
      setYears(y);
      setItems(s);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) || i.field.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: Partial<StrategicObjective>) => {
    await apiPost<StrategicObjective>('/api/strategic-objectives', data);
    setShowCreate(false);
    load();
  };

  const handleUpdate = async (data: Partial<StrategicObjective>) => {
    if (!selected) return;
    await apiPut(`/api/strategic-objectives/${selected.id}`, data);
    setShowEdit(false);
    load();
  };

  const handleStatusChange = async (item: StrategicObjective, status: string) => {
    const labels: Record<string, string> = { submitted: 'trình duyệt', approved: 'phê duyệt', locked: 'khóa', draft: 'yêu cầu chỉnh sửa' };
    if (!confirm(`${labels[status] || status} mục tiêu "${item.name}"?`)) return;
    await apiPut(`/api/strategic-objectives/${item.id}`, { status });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa mục tiêu chiến lược này?')) return;
    await apiDelete(`/api/strategic-objectives/${id}`);
    load();
  };

  const Form = ({ onSubmit, initial }: { onSubmit: (d: Partial<StrategicObjective>) => void; initial?: StrategicObjective }) => {
    const [form, setForm] = useState(initial || { name: '', description: '', field: '', leadUnitId: '', supportUnitIds: [] as string[] });
    return (
      <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên mục tiêu chiến lược *</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Lĩnh vực *</label>
          <select value={form.field} onChange={e => setForm({ ...form, field: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required>
            <option value="">-- Chọn lĩnh vực --</option>
            {fields.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Đơn vị chủ trì *</label>
          <select value={form.leadUnitId} onChange={e => setForm({ ...form, leadUnitId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required>
            <option value="">-- Chọn đơn vị --</option>
            {(unitsData as { id: string; name: string }[]).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
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
          <h1 className="text-2xl font-heading font-bold text-text-dark flex items-center gap-2">
            <Compass size={24} /> Mục tiêu chiến lược cấp Trường
          </h1>
          <p className="text-text-light mt-1">Quản lý mục tiêu chiến lược và liên kết KPI cấp Trường (V.1-V.5)</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm mục tiêu
        </button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách mục tiêu chiến lược</h3></div>
        <div className="p-4">
          <div className="flex gap-4 mb-4 flex-wrap items-center">
            <div className="flex gap-1 bg-white border border-border rounded-lg p-0.5">
              <button onClick={() => setRole('staff')} className={`px-3 py-1 rounded text-xs font-medium ${role === 'staff' ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>Cán bộ KPI</button>
              <button onClick={() => setRole('approver')} className={`px-3 py-1 rounded text-xs font-medium ${role === 'approver' ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>Người duyệt</button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..." className="pl-10 pr-4 py-1.5 border rounded-lg text-sm w-60" />
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-text-light">Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-text-light">Chưa có mục tiêu chiến lược nào</div>
            ) : filtered.map(item => (
              <div key={item.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Target size={16} className="text-primary" />
                      <h3 className="font-medium text-text-dark">{item.name}</h3>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[item.status]?.color}`}>
                        {statusConfig[item.status]?.label}
                      </span>
                    </div>
                    <p className="text-sm text-text-light mb-2">{item.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-text-light">
                      <span className="bg-primary-light text-primary px-2 py-0.5 rounded">{item.field}</span>
                      <span>Chủ trì: {unitMap[item.leadUnitId] || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    {item.status === 'draft' && role === 'staff' && (
                      <button onClick={() => handleStatusChange(item, 'submitted')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Trình duyệt">
                        <Send size={14} />
                      </button>
                    )}
                    {item.status === 'submitted' && role === 'approver' && (
                      <>
                        <button onClick={() => handleStatusChange(item, 'approved')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Phê duyệt">
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => handleStatusChange(item, 'draft')} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded" title="Yêu cầu chỉnh sửa">
                          <XCircle size={14} />
                        </button>
                      </>
                    )}
                    {item.status === 'submitted' && role === 'staff' && (
                      <span className="text-xs text-text-light italic">Đã trình</span>
                    )}
                    {item.status === 'approved' && (
                      <button onClick={() => handleStatusChange(item, 'locked')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Khóa">
                        <Lock size={14} />
                      </button>
                    )}
                    <button onClick={() => { setSelected(item); setShowEdit(true); }} className="p-1.5 hover:bg-blue-50 rounded"><Edit size={14} className="text-blue-600" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-600" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white flex items-center gap-2"><History size={16} /> Luồng phê duyệt</h3></div>
        <div className="p-4">
          <div className="flex items-center gap-0 text-sm">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-l-lg text-gray-600 font-medium">Nháp</div>
            <div className="w-6 h-0.5 bg-gray-300" />
            <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 font-medium">Trình duyệt</div>
            <div className="w-6 h-0.5 bg-gray-300" />
            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 font-medium">Phê duyệt</div>
            <div className="w-6 h-0.5 bg-gray-300" />
            <div className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-r-lg font-medium">Khóa</div>
          </div>
          <p className="text-xs text-text-light mt-2">Vai trò hiện tại: <strong>{role === 'approver' ? 'Người duyệt' : 'Cán bộ KPI'}</strong></p>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Thêm mục tiêu chiến lược mới">
        <Form onSubmit={handleCreate} />
      </Modal>
      <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setSelected(null); }} title="Chỉnh sửa mục tiêu chiến lược">
        {selected && <Form onSubmit={handleUpdate} initial={selected} />}
      </Modal>
    </div>
  );
}
