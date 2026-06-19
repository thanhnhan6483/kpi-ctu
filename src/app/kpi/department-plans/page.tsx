'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, Search, Plus, Eye, Send, Users, Edit, Trash2, ArrowRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import unitsData from '@/data/units.json';
import usersData from '@/data/users.json';
import indicatorsData from '@/data/indicators.json';

interface DepartmentPlan {
  id: string;
  cycleId: string;
  departmentId: string;
  name: string;
  description: string;
  status: 'draft' | 'submitted' | 'approved' | 'in_progress';
  items: DepartmentPlanItem[];
  createdAt: string;
  updatedAt: string;
}

interface DepartmentPlanItem {
  id: string;
  indicatorId: string;
  indicatorName: string;
  targetValue: number;
  unit: string;
  weight: number;
  assignedTo: string;
  assignedUserName: string;
  dueDate: string;
  note: string;
}

interface KPICycle { id: string; name: string; status: string; }

const unitMap: Record<string, string> = {};
(unitsData as { id: string; name: string }[]).forEach(u => { unitMap[u.id] = u.name; });

const userMap: Record<string, string> = {};
(usersData as { id: string; fullName: string }[]).forEach(u => { userMap[u.id] = u.fullName; });

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Bản nháp', color: '#6b7280' },
  submitted: { label: 'Chờ duyệt', color: '#eab308' },
  approved: { label: 'Đã duyệt', color: '#22c55e' },
  in_progress: { label: 'Đang thực hiện', color: '#3b82f6' },
};

const statusFilters = [
  { value: 'all', label: 'Tất cả' },
  { value: 'draft', label: 'Bản nháp' },
  { value: 'submitted', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
];

export default function DepartmentPlansPage() {
  const [cycles, setCycles] = useState<KPICycle[]>([]);
  const [items, setItems] = useState<DepartmentPlan[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selected, setSelected] = useState<DepartmentPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const c = await apiGet<KPICycle[]>('/api/cycles');
      setCycles(c);
      if (!selectedCycleId && c.length > 0) {
        const active = c.find(cy => cy.status === 'active');
        setSelectedCycleId(active?.id || c[0].id);
      }
      const data = await apiGet<DepartmentPlan[]>('/api/department-plans');
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, [selectedCycleId]);

  useEffect(() => { load(); }, [load]);

  const cycleFiltered = items.filter(i => i.cycleId === selectedCycleId);

  const filtered = cycleFiltered.filter(i => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return i.name.toLowerCase().includes(s) || (unitMap[i.departmentId] || '').toLowerCase().includes(s);
    }
    return true;
  });

  const draftCount = cycleFiltered.filter(i => i.status === 'draft').length;
  const submittedCount = cycleFiltered.filter(i => i.status === 'submitted').length;
  const approvedCount = cycleFiltered.filter(i => i.status === 'approved').length;

  const handleCreate = async (data: Partial<DepartmentPlan>) => {
    const newItem = await apiPost<DepartmentPlan>('/api/department-plans', {
      cycleId: selectedCycleId,
      departmentId: data.departmentId,
      name: data.name,
      description: data.description,
    });
    setItems([...items, newItem]);
    setShowCreate(false);
  };

  const handleUpdate = async (data: Partial<DepartmentPlan>) => {
    if (!selected) return;
    await apiPut(`/api/department-plans/${selected.id}`, data);
    setItems(items.map(i => i.id === selected.id ? { ...i, ...data } : i));
    setShowEdit(false);
  };

  const handleStatusChange = async (item: DepartmentPlan, status: string) => {
    const labels: Record<string, string> = { submitted: 'trình duyệt', approved: 'phê duyệt', in_progress: 'bắt đầu thực hiện' };
    if (!confirm(`${labels[status] || status} kế hoạch "${item.name}"?`)) return;
    await apiPut(`/api/department-plans/${item.id}`, { status });
    setItems(items.map(i => i.id === item.id ? { ...i, status: status as any } : i));
  };

  const handleAddItem = async (planId: string, newItem: DepartmentPlanItem) => {
    const plan = items.find(i => i.id === planId);
    if (!plan) return;
    const updatedItems = [...plan.items, newItem];
    await apiPut(`/api/department-plans/${planId}`, { items: updatedItems });
    setItems(items.map(i => i.id === planId ? { ...i, items: updatedItems } : i));
    setShowAssign(false);
  };

  const handleRemoveItem = async (planId: string, itemId: string) => {
    const plan = items.find(i => i.id === planId);
    if (!plan) return;
    const updatedItems = plan.items.filter(item => item.id !== itemId);
    await apiPut(`/api/department-plans/${planId}`, { items: updatedItems });
    setItems(items.map(i => i.id === planId ? { ...i, items: updatedItems } : i));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa kế hoạch này?')) return;
    await apiDelete(`/api/department-plans/${id}`);
    setItems(items.filter(i => i.id !== id));
  };

  const PlanForm = ({ onSubmit, initial }: { onSubmit: (d: Partial<DepartmentPlan>) => void; initial?: DepartmentPlan }) => {
    const [form, setForm] = useState(initial || { departmentId: '', name: '', description: '' });
    return (
      <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Bộ môn/Đơn vị *</label><select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required><option value="">-- Chọn bộ môn --</option>{(unitsData as { id: string; name: string; type: string }[]).filter(u => u.type === 'department' || u.type === 'faculty').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
        <div><label className="block text-sm font-medium mb-1">Tên kế hoạch *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" placeholder="VD: Kế hoạch KPI bộ môn 2025-2026" required /></div>
        <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" rows={2} /></div>
        <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg-cream">Hủy</button><button type="submit" className="btn-primary">Lưu</button></div>
      </form>
    );
  };

  const AssignForm = ({ planId, onSubmit }: { planId: string; onSubmit: (itemId: string, item: DepartmentPlanItem) => void }) => {
    const [form, setForm] = useState({ indicatorId: '', targetValue: 0, unit: '%', weight: 0, assignedTo: '', dueDate: '', note: '' });
    const handleIndicatorChange = (id: string) => {
      const ind = (indicatorsData as { id: string; name: string; unit: string }[]).find(i => i.id === id);
      setForm({ ...form, indicatorId: id, unit: ind?.unit || '%' });
    };
    return (
      <form onSubmit={e => { e.preventDefault(); const ind = (indicatorsData as { id: string; name: string }[]).find(i => i.id === form.indicatorId); onSubmit(`dpi${Date.now()}`, { ...form, id: `dpi${Date.now()}`, indicatorName: ind?.name || '', assignedUserName: userMap[form.assignedTo] || '' }); }} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Chỉ tiêu KPI *</label><select value={form.indicatorId} onChange={e => handleIndicatorChange(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required><option value="">-- Chọn --</option>{(indicatorsData as { id: string; name: string }[]).map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1">Chỉ tiêu</label><input type="number" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" /></div>
          <div><label className="block text-sm font-medium mb-1">Đơn vị</label><input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" /></div>
          <div><label className="block text-sm font-medium mb-1">Trọng số (%)</label><input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" min={0} max={100} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Phân công cho *</label><select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required><option value="">-- Chọn giảng viên --</option>{(usersData as { id: string; fullName: string }[]).map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Hạn thực hiện</label><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => onSubmit('', { id: '', indicatorId: '', indicatorName: '', targetValue: 0, unit: '', weight: 0, assignedTo: '', assignedUserName: '', dueDate: '', note: '' })} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg-cream">Hủy</button><button type="submit" className="btn-primary">Phân công</button></div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Kế hoạch KPI Bộ môn</h1>
          <p className="text-text-light mt-1">Lập kế hoạch và phân công KPI cho giảng viên (VIII.1-VIII.4)</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tạo kế hoạch
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><FileText size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng kế hoạch</p><p className="text-xl font-bold">{cycleFiltered.length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div>
            <div><p className="text-text-light text-sm">Đã duyệt</p><p className="text-xl font-bold">{approvedCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><Clock size={20} className="text-accent-yellow" /></div>
            <div><p className="text-text-light text-sm">Chờ duyệt</p><p className="text-xl font-bold">{submittedCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg"><Edit size={20} className="text-gray-500" /></div>
            <div><p className="text-text-light text-sm">Bản nháp</p><p className="text-xl font-bold">{draftCount}</p></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm kế hoạch bộ môn..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
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
        <div className="card-header"><h3 className="text-white">Danh sách kế hoạch bộ môn</h3></div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr><th>Bộ môn</th><th>Tên kế hoạch</th><th>Số KPI</th><th>Trạng thái</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8">Đang tải...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8">Chưa có kế hoạch nào</td></tr>
                ) : filtered.map((plan) => {
                  const status = statusConfig[plan.status] || statusConfig.draft;
                  return (
                    <tr key={plan.id}>
                      <td className="text-sm font-medium">{unitMap[plan.departmentId] || plan.departmentId}</td>
                      <td className="text-sm">{plan.name}</td>
                      <td className="text-sm text-center">{plan.items.length}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: `${status.color}20`, color: status.color }}>{status.label}</span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {plan.status === 'draft' && <button onClick={() => handleStatusChange(plan, 'submitted')} className="p-1 hover:bg-blue-50 rounded" title="Trình duyệt"><Send size={14} className="text-blue-600" /></button>}
                          {plan.status === 'submitted' && <button onClick={() => handleStatusChange(plan, 'approved')} className="p-1 hover:bg-green-50 rounded" title="Phê duyệt"><CheckCircle size={14} className="text-green-600" /></button>}
                          {plan.status === 'approved' && <button onClick={() => handleStatusChange(plan, 'in_progress')} className="p-1 hover:bg-yellow-50 rounded" title="Bắt đầu"><ArrowRight size={14} className="text-yellow-600" /></button>}
                          <button onClick={() => { setSelected(plan); setShowAssign(true); }} className="p-1 hover:bg-purple-50 rounded" title="Phân công"><Users size={14} className="text-purple-600" /></button>
                          <button onClick={() => { setSelected(plan); setShowEdit(true); }} className="p-1 hover:bg-blue-50 rounded" title="Chỉnh sửa"><Edit size={14} className="text-blue-600" /></button>
                          <button onClick={() => handleDelete(plan.id)} className="p-1 hover:bg-red-50 rounded" title="Xóa"><Trash2 size={14} className="text-red-600" /></button>
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

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo kế hoạch KPI bộ môn">
        <PlanForm onSubmit={handleCreate} />
      </Modal>
      <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setSelected(null); }} title="Chỉnh sửa kế hoạch">
        {selected && <PlanForm onSubmit={handleUpdate} initial={selected} />}
      </Modal>
      <Modal isOpen={showAssign} onClose={() => { setShowAssign(false); setSelected(null); }} title="Phân công KPI cho giảng viên">
        {selected && <AssignForm planId={selected.id} onSubmit={(itemId, item) => { if (itemId) handleAddItem(selected.id, item); }} />}
      </Modal>
    </div>
  );
}
