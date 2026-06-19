'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, Search, Plus, Send, ArrowRight, GitBranch, Edit, Trash2, XCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import unitsData from '@/data/units.json';
import indicatorsData from '@/data/indicators.json';
import usersData from '@/data/users.json';

interface KPICascadeAssignment {
  id: string;
  cycleId: string;
  fromLevel: 'school' | 'unit' | 'department';
  fromUnitId: string;
  toLevel: 'unit' | 'department' | 'individual';
  toUnitId: string;
  toUserId?: string;
  indicatorId: string;
  indicatorName: string;
  targetValue: number;
  unit: string;
  weight: number;
  dueDate: string;
  evidenceRequired: boolean;
  note: string;
  status: 'draft' | 'assigned' | 'accepted' | 'rejected' | 'in_progress';
  assignerId: string;
  assignedAt?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface KPICycle { id: string; name: string; academicYearId: string; status: string; }

const unitMap: Record<string, string> = {};
(unitsData as { id: string; name: string }[]).forEach(u => { unitMap[u.id] = u.name; });

const userMap: Record<string, string> = {};
(usersData as { id: string; fullName: string }[]).forEach(u => { userMap[u.id] = u.fullName; });

const indicatorMap: Record<string, { name: string; unit: string }> = {};
(indicatorsData as { id: string; name: string; unit: string }[]).forEach(i => { indicatorMap[i.id] = { name: i.name, unit: i.unit }; });

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Bản nháp', color: '#6b7280' },
  assigned: { label: 'Đã giao', color: '#3b82f6' },
  accepted: { label: 'Đã nhận', color: '#22c55e' },
  rejected: { label: 'Từ chối', color: '#ef4444' },
  in_progress: { label: 'Đang thực hiện', color: '#eab308' },
};

const statusFilters = [
  { value: 'all', label: 'Tất cả' },
  { value: 'draft', label: 'Bản nháp' },
  { value: 'assigned', label: 'Đã giao' },
  { value: 'accepted', label: 'Đã nhận' },
  { value: 'in_progress', label: 'Đang TH' },
];

const levelLabels: Record<string, string> = { school: 'Trường', unit: 'Đơn vị', department: 'Bộ môn', individual: 'Cá nhân' };

export default function CascadeAssignmentsPage() {
  const [cycles, setCycles] = useState<KPICycle[]>([]);
  const [items, setItems] = useState<KPICascadeAssignment[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<KPICascadeAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [c, a] = await Promise.all([
        apiGet<KPICycle[]>('/api/cycles'),
        apiGet<KPICascadeAssignment[]>('/api/cascade-assignments'),
      ]);
      setCycles(c);
      setItems(a);
      if (!selectedCycleId && c.length > 0) {
        const active = c.find(cy => cy.status === 'active');
        setSelectedCycleId(active?.id || c[0].id);
      }
    } catch { /* empty */ } finally { setLoading(false); }
  }, [selectedCycleId]);

  useEffect(() => { load(); }, [load]);

  const cycleFiltered = items.filter(i => i.cycleId === selectedCycleId);

  const filtered = cycleFiltered.filter(i => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return i.indicatorName.toLowerCase().includes(s) ||
        (unitMap[i.fromUnitId] || '').toLowerCase().includes(s) ||
        (unitMap[i.toUnitId] || '').toLowerCase().includes(s);
    }
    return true;
  });

  const draftCount = cycleFiltered.filter(i => i.status === 'draft').length;
  const assignedCount = cycleFiltered.filter(i => i.status === 'assigned').length;
  const acceptedCount = cycleFiltered.filter(i => i.status === 'accepted').length;

  const handleCreate = async (data: Partial<KPICascadeAssignment>) => {
    await apiPost<KPICascadeAssignment>('/api/cascade-assignments', { ...data, cycleId: selectedCycleId });
    setShowCreate(false);
    load();
  };

  const handleUpdate = async (data: Partial<KPICascadeAssignment>) => {
    if (!selected) return;
    await apiPut(`/api/cascade-assignments/${selected.id}`, data);
    setShowEdit(false);
    load();
  };

  const handleStatusChange = async (item: KPICascadeAssignment, status: string) => {
    const labels: Record<string, string> = { assigned: 'giao KPI', accepted: 'nhận KPI', rejected: 'từ chối', in_progress: 'bắt đầu thực hiện' };
    if (!confirm(`${labels[status] || status} cho "${item.indicatorName}"?`)) return;
    await apiPut(`/api/cascade-assignments/${item.id}`, { status });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa phân bổ KPI này?')) return;
    await apiDelete(`/api/cascade-assignments/${id}`);
    load();
  };

  const Form = ({ onSubmit, initial }: { onSubmit: (d: Partial<KPICascadeAssignment>) => void; initial?: KPICascadeAssignment }) => {
    const [form, setForm] = useState(initial || {
      fromLevel: 'school' as const, fromUnitId: 'u001', toLevel: 'unit' as const, toUnitId: '',
      indicatorId: '', indicatorName: '', targetValue: 0, unit: '%', weight: 0,
      dueDate: '', evidenceRequired: true, note: '', status: 'draft' as const, assignerId: 'u001',
    });

    const handleIndicatorChange = (indicatorId: string) => {
      const ind = indicatorMap[indicatorId];
      setForm({ ...form, indicatorId, indicatorName: ind?.name || '', unit: ind?.unit || '%' });
    };

    return (
      <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Cấp gửi (từ) *</label><select value={form.fromLevel} onChange={e => setForm({ ...form, fromLevel: e.target.value as any })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"><option value="school">Trường</option><option value="unit">Đơn vị</option><option value="department">Bộ môn</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Đơn vị gửi *</label><select value={form.fromUnitId} onChange={e => setForm({ ...form, fromUnitId: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"><option value="">-- Chọn --</option>{(unitsData as { id: string; name: string }[]).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Cấp nhận (đến) *</label><select value={form.toLevel} onChange={e => setForm({ ...form, toLevel: e.target.value as any })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"><option value="unit">Đơn vị</option><option value="department">Bộ môn</option><option value="individual">Cá nhân</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Đơn vị/nhận *</label><select value={form.toUnitId} onChange={e => setForm({ ...form, toUnitId: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"><option value="">-- Chọn --</option>{(unitsData as { id: string; name: string }[]).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
        </div>
        {form.toLevel === 'individual' && (
          <div><label className="block text-sm font-medium mb-1">Cá nhân nhận</label><select value={form.toUserId || ''} onChange={e => setForm({ ...form, toUserId: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"><option value="">-- Chọn --</option>{(usersData as { id: string; fullName: string }[]).map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}</select></div>
        )}
        <div><label className="block text-sm font-medium mb-1">Chỉ tiêu KPI *</label><select value={form.indicatorId} onChange={e => handleIndicatorChange(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required><option value="">-- Chọn chỉ tiêu --</option>{(indicatorsData as { id: string; name: string }[]).map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1">Chỉ tiêu mục tiêu *</label><input type="number" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required /></div>
          <div><label className="block text-sm font-medium mb-1">Đơn vị đo</label><input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" /></div>
          <div><label className="block text-sm font-medium mb-1">Trọng số (%) *</label><input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required min={0} max={100} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Hạn thực hiện</label><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" /></div>
          <div className="flex items-end pb-1"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.evidenceRequired} onChange={e => setForm({ ...form, evidenceRequired: e.target.checked })} className="rounded" /> Yêu cầu minh chứng</label></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Ghi chú</label><textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" rows={2} /></div>
        <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => initial ? setShowEdit(false) : setShowCreate(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg-cream">Hủy</button><button type="submit" className="btn-primary">Lưu</button></div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Phân rã & Giao KPI MBO</h1>
          <p className="text-text-light mt-1">Cascade KPI từ cấp Trường → Đơn vị → Bộ môn → Cá nhân (VI.1-VI.6)</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Phân bổ KPI
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><GitBranch size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng phân bổ</p><p className="text-xl font-bold">{cycleFiltered.length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg"><Edit size={20} className="text-gray-500" /></div>
            <div><p className="text-text-light text-sm">Bản nháp</p><p className="text-xl font-bold">{draftCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Send size={20} className="text-blue-600" /></div>
            <div><p className="text-text-light text-sm">Đã giao</p><p className="text-xl font-bold">{assignedCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div>
            <div><p className="text-text-light text-sm">Đã nhận</p><p className="text-xl font-bold">{acceptedCount}</p></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm phân bổ KPI..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((s) => (
            <button key={s.value} onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === s.value ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách phân bổ KPI</h3></div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr><th>Luồng</th><th>Chỉ tiêu KPI</th><th>Mục tiêu</th><th>Trọng số</th><th>Hạn</th><th>Trạng thái</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8">Đang tải...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8">Chưa có phân bổ KPI nào</td></tr>
                ) : filtered.map((item) => {
                  const status = statusConfig[item.status] || statusConfig.draft;
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="font-medium">{levelLabels[item.fromLevel]}</span>
                          <ArrowRight size={12} className="text-text-light" />
                          <span className="font-medium">{levelLabels[item.toLevel]}</span>
                        </div>
                        <div className="text-xs text-text-light mt-0.5">
                          {unitMap[item.fromUnitId] || '-'} → {unitMap[item.toUnitId] || '-'}
                        </div>
                      </td>
                      <td className="text-sm font-medium">{item.indicatorName}</td>
                      <td className="text-sm">{item.targetValue} {item.unit}</td>
                      <td className="text-sm">{item.weight}%</td>
                      <td className="text-sm text-text-light">{item.dueDate || '-'}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: `${status.color}20`, color: status.color }}>{status.label}</span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {item.status === 'draft' && <button onClick={() => handleStatusChange(item, 'assigned')} className="p-1 hover:bg-blue-50 rounded" title="Giao KPI"><Send size={14} className="text-blue-600" /></button>}
                          {item.status === 'assigned' && <button onClick={() => handleStatusChange(item, 'accepted')} className="p-1 hover:bg-green-50 rounded" title="Nhận KPI"><CheckCircle size={14} className="text-green-600" /></button>}
                          {item.status === 'assigned' && <button onClick={() => handleStatusChange(item, 'rejected')} className="p-1 hover:bg-red-50 rounded" title="Từ chối"><XCircle size={14} className="text-red-600" /></button>}
                          {item.status === 'accepted' && <button onClick={() => handleStatusChange(item, 'in_progress')} className="p-1 hover:bg-yellow-50 rounded" title="Bắt đầu TH"><ArrowRight size={14} className="text-yellow-600" /></button>}
                          <button onClick={() => { setSelected(item); setShowEdit(true); }} className="p-1 hover:bg-blue-50 rounded" title="Chỉnh sửa"><Edit size={14} className="text-blue-600" /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded" title="Xóa"><Trash2 size={14} className="text-red-600" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Phân bổ KPI mới">
        <Form onSubmit={handleCreate} />
      </Modal>
      <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setSelected(null); }} title="Chỉnh sửa phân bổ KPI">
        {selected && <Form onSubmit={handleUpdate} initial={selected} />}
      </Modal>
    </div>
  );
}
