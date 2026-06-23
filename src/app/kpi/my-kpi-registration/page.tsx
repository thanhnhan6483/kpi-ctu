'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, Search, Plus, Send, User, Trash2, History, Lock, Eye, Edit } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import indicatorsData from '@/data/indicators.json';
import usersData from '@/data/users.json';
import type { KPITemplate, KPITemplateItem } from '@/types';

interface PersonalKPIRegistration {
  id: string;
  cycleId: string;
  userId: string;
  positionCode: string;
  items: PersonalKPIItem[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'committed';
  submittedAt?: string;
  approvedAt?: string;
  committedAt?: string;
  approverComment?: string;
  createdAt: string;
  updatedAt: string;
}

interface PersonalKPIItem {
  id: string;
  indicatorId: string;
  indicatorName: string;
  targetValue: number;
  unit: string;
  weight: number;
  actionPlan: string;
  evidencePlan: string;
  dueDate: string;
}

interface KPICycle { id: string; name: string; status: string; }

const indicatorMap: Record<string, { name: string; unit: string; maxScore: number }> = {};
(indicatorsData as { id: string; name: string; unit: string; maxScore: number }[]).forEach(i => { indicatorMap[i.id] = { name: i.name, unit: i.unit, maxScore: i.maxScore }; });

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Bản nháp', color: '#6b7280' },
  submitted: { label: 'Chờ duyệt', color: '#eab308' },
  approved: { label: 'Đã duyệt', color: '#22c55e' },
  rejected: { label: 'Bị từ chối', color: '#ef4444' },
  committed: { label: 'Đã cam kết', color: '#3b82f6' },
};

const statusFilters = [
  { value: 'all', label: 'Tất cả' },
  { value: 'draft', label: 'Bản nháp' },
  { value: 'submitted', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'committed', label: 'Đã cam kết' },
];

export default function MyKPIRegistrationPage() {
  const [cycles, setCycles] = useState<KPICycle[]>([]);
  const [items, setItems] = useState<PersonalKPIRegistration[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'register' | 'history'>('register');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<PersonalKPIRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<KPITemplate[]>([]);
  const [templateItems, setTemplateItems] = useState<KPITemplateItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const currentUserId = 'u002';

  const load = useCallback(async () => {
    try {
      const c = await apiGet<KPICycle[]>('/api/cycles');
      setCycles(c);
      if (!selectedCycleId && c.length > 0) {
        const active = c.find(cy => cy.status === 'active');
        setSelectedCycleId(active?.id || c[0].id);
      }
      const data = await apiGet<PersonalKPIRegistration[]>('/api/personal-kpi-registrations');
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, [selectedCycleId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    Promise.all([
      apiGet<KPITemplate[]>('/api/kpi-templates'),
      apiGet<KPITemplateItem[]>('/api/kpi-template-items'),
    ]).then(([t, ti]) => { setTemplates(t); setTemplateItems(ti); }).catch(() => {});
  }, []);

  const myRegistrations = items.filter(i => i.cycleId === selectedCycleId && i.userId === currentUserId);
  const filtered = statusFilter === 'all' ? myRegistrations : myRegistrations.filter(i => i.status === statusFilter);

  const draftCount = myRegistrations.filter(i => i.status === 'draft').length;
  const submittedCount = myRegistrations.filter(i => i.status === 'submitted').length;
  const approvedCount = myRegistrations.filter(i => i.status === 'approved').length;
  const committedCount = myRegistrations.filter(i => i.status === 'committed').length;

  const handleCreate = async (templateId?: string) => {
    const addedIndicatorIds = new Set<string>();
    const regItems: PersonalKPIItem[] = [];

    const userUnitId = (usersData as { id: string; unitId: string }[]).find(u => u.id === currentUserId)?.unitId;
    if (userUnitId) {
      const deptPlans = await apiGet<{ id: string; cycleId: string; departmentId: string }[]>('/api/department-plans');
      const deptPlan = deptPlans.find(p => p.cycleId === selectedCycleId && p.departmentId === userUnitId);
      if (deptPlan) {
        const deptItems = await apiGet<{ indicatorId: string; indicatorName: string; targetValue: number; unit: string; weight: number; dueDate: string }[]>(
          `/api/department-plans/${deptPlan.id}`
        );
        const planData = deptItems as any;
        if (planData.items) {
          for (const di of planData.items) {
            regItems.push({
              id: `pki${Date.now()}_${di.indicatorId}`,
              indicatorId: di.indicatorId,
              indicatorName: di.indicatorName || di.indicatorId,
              targetValue: di.targetValue || 0,
              unit: di.unit || '%',
              weight: di.weight || 0,
              actionPlan: '',
              evidencePlan: '',
              dueDate: di.dueDate || '',
            });
            addedIndicatorIds.add(di.indicatorId);
          }
        }
      }
    }

    if (templateId) {
      const tItems = templateItems.filter(ti => ti.templateId === templateId);
      for (const ti of tItems) {
        if (addedIndicatorIds.has(ti.indicatorId)) continue;
        regItems.push({
          id: `pki${Date.now()}_${ti.indicatorId}`,
          indicatorId: ti.indicatorId,
          indicatorName: (indicatorsData as { id: string; name: string }[]).find(i => i.id === ti.indicatorId)?.name || ti.indicatorId,
          targetValue: ti.targetValue || 0,
          unit: '%',
          weight: ti.weight,
          actionPlan: '',
          evidencePlan: '',
          dueDate: '',
        });
        addedIndicatorIds.add(ti.indicatorId);
      }
    }

    const newItem = await apiPost<PersonalKPIRegistration>('/api/personal-kpi-registrations', {
      cycleId: selectedCycleId,
      userId: currentUserId,
      positionCode: 'GV',
      items: regItems,
    });
    setItems([...items, newItem]);
    setShowCreate(false);
  };

  const handleAddItem = async (item: PersonalKPIItem) => {
    const reg = myRegistrations[0];
    if (!reg) return;
    const updatedItems = [...reg.items, item];
    await apiPut(`/api/personal-kpi-registrations/${reg.id}`, { items: updatedItems });
    setItems(items.map(i => i.id === reg.id ? { ...i, items: updatedItems } : i));
    setShowAddItem(false);
  };

  const handleRemoveItem = async (regId: string, itemId: string) => {
    const reg = items.find(i => i.id === regId);
    if (!reg) return;
    const updatedItems = reg.items.filter(item => item.id !== itemId);
    await apiPut(`/api/personal-kpi-registrations/${regId}`, { items: updatedItems });
    setItems(items.map(i => i.id === regId ? { ...i, items: updatedItems } : i));
  };

  const handleStatusChange = async (regId: string, status: string) => {
    const labels: Record<string, string> = { submitted: 'gửi đăng ký', approved: 'phê duyệt', committed: 'cam kết thực hiện' };
    if (!confirm(`${labels[status] || status} phiếu KPI?`)) return;
    const now = new Date().toISOString();
    const updates: Partial<PersonalKPIRegistration> = { status: status as any };
    if (status === 'submitted') updates.submittedAt = now;
    if (status === 'committed') updates.committedAt = now;
    await apiPut(`/api/personal-kpi-registrations/${regId}`, updates);
    setItems(items.map(i => i.id === regId ? { ...i, ...updates } : i));
  };

  const handleDelete = async (regId: string) => {
    if (!confirm('Xóa phiếu đăng ký KPI?')) return;
    await apiDelete(`/api/personal-kpi-registrations/${regId}`);
    setItems(items.filter(i => i.id !== regId));
  };

  const currentReg = myRegistrations[0];
  const totalWeight = currentReg?.items.reduce((sum, i) => sum + i.weight, 0) || 0;

  const ItemForm = ({ onSubmit }: { onSubmit: (item: PersonalKPIItem) => void }) => {
    const [form, setForm] = useState({ indicatorId: '', targetValue: 0, unit: '%', weight: 0, actionPlan: '', evidencePlan: '', dueDate: '' });
    const handleIndicatorChange = (id: string) => {
      const ind = indicatorMap[id];
      setForm({ ...form, indicatorId: id, unit: ind?.unit || '%' });
    };
    return (
      <form onSubmit={e => { e.preventDefault(); const ind = indicatorMap[form.indicatorId]; onSubmit({ ...form, id: `pki${Date.now()}`, indicatorName: ind?.name || '' }); }} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Chỉ tiêu KPI *</label><select value={form.indicatorId} onChange={e => handleIndicatorChange(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required><option value="">-- Chọn chỉ tiêu --</option>{(indicatorsData as { id: string; name: string }[]).map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1">Chỉ tiêu mục tiêu *</label><input type="number" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required /></div>
          <div><label className="block text-sm font-medium mb-1">Đơn vị đo</label><input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" /></div>
          <div><label className="block text-sm font-medium mb-1">Trọng số (%) *</label><input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required min={0} max={100} /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Kế hoạch hành động</label><textarea value={form.actionPlan} onChange={e => setForm({ ...form, actionPlan: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" rows={2} placeholder="Mô tả kế hoạch thực hiện..." /></div>
        <div><label className="block text-sm font-medium mb-1">Minh chứng dự kiến</label><input value={form.evidencePlan} onChange={e => setForm({ ...form, evidencePlan: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" placeholder="VD: Báo cáo, quyết định, link..." /></div>
        <div><label className="block text-sm font-medium mb-1">Hạn thực hiện</label><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" /></div>
        <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => onSubmit({ id: '', indicatorId: '', indicatorName: '', targetValue: 0, unit: '', weight: 0, actionPlan: '', evidencePlan: '', dueDate: '' })} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg-cream">Hủy</button><button type="submit" className="btn-primary">Thêm KPI</button></div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Đăng ký KPI cá nhân</h1>
          <p className="text-text-light mt-1">Đăng ký, gửi và cam kết KPI cá nhân (IX.1-IX.6)</p>
        </div>
        <div className="flex items-center gap-3">
          {!currentReg && (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Tạo phiếu đăng ký
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><FileText size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng phiếu</p><p className="text-xl font-bold">{myRegistrations.length}</p></div>
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
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><Clock size={20} className="text-accent-yellow" /></div>
            <div><p className="text-text-light text-sm">Chờ duyệt</p><p className="text-xl font-bold">{submittedCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><CheckCircle size={20} className="text-blue-600" /></div>
            <div><p className="text-text-light text-sm">Đã cam kết</p><p className="text-xl font-bold">{committedCount}</p></div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-white border border-border rounded-lg p-0.5 w-fit mb-4">
        <button onClick={() => setActiveTab('register')} className={`px-4 py-1.5 rounded text-sm font-medium ${activeTab === 'register' ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>Đăng ký</button>
        <button onClick={() => setActiveTab('history')} className={`px-4 py-1.5 rounded text-sm font-medium ${activeTab === 'history' ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>Lịch sử</button>
      </div>

      {activeTab === 'history' ? (
        <div className="card">
          <div className="card-header"><h3 className="text-white flex items-center gap-2"><History size={16} /> Lịch sử thay đổi</h3></div>
          <div className="p-4">
            {!currentReg ? (
              <p className="text-sm text-text-light">Chưa có phiếu đăng ký</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0"><div className="w-3 h-3 rounded-full bg-green-500" /></div>
                  <div><p className="text-sm font-medium">Tạo phiếu</p><p className="text-xs text-text-light">{new Date(currentReg.createdAt).toLocaleString('vi-VN')}</p></div>
                </div>
                {currentReg.submittedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Send size={14} className="text-blue-600" /></div>
                    <div><p className="text-sm font-medium">Gửi đăng ký</p><p className="text-xs text-text-light">{new Date(currentReg.submittedAt).toLocaleString('vi-VN')}</p></div>
                  </div>
                )}
                {currentReg.approvedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0"><CheckCircle size={14} className="text-green-600" /></div>
                    <div><p className="text-sm font-medium">Phê duyệt</p><p className="text-xs text-text-light">{new Date(currentReg.approvedAt).toLocaleString('vi-VN')}</p></div>
                  </div>
                )}
                {currentReg.committedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0"><CheckCircle size={14} className="text-purple-600" /></div>
                    <div><p className="text-sm font-medium">Cam kết thực hiện</p><p className="text-xs text-text-light">{new Date(currentReg.committedAt).toLocaleString('vi-VN')}</p></div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><FileText size={14} className="text-gray-500" /></div>
                  <div><p className="text-sm font-medium">Cập nhật lần cuối</p><p className="text-xs text-text-light">{new Date(currentReg.updatedAt).toLocaleString('vi-VN')}</p></div>
                </div>
                <div className="flex items-center gap-1 text-xs text-text-light mt-2">
                  <span className="badge" style={{ backgroundColor: `${statusConfig[currentReg.status]?.color}20`, color: statusConfig[currentReg.status]?.color }}>{statusConfig[currentReg.status]?.label}</span>
                  <span>— trạng thái hiện tại</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm phiếu đăng ký..." readOnly className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
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
        <div className="card-header"><h3 className="text-white">Phiếu đăng ký KPI cá nhân</h3></div>
        <div className="p-0">
          {!currentReg ? (
            <div className="p-8 text-center">
              <User size={48} className="mx-auto text-text-light mb-3" />
              <p className="text-text-light mb-4">Chưa có phiếu đăng ký KPI cá nhân cho chu kỳ này</p>
              <button onClick={() => setShowCreate(true)} className="btn-primary">Tạo phiếu đăng ký</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr><th>STT</th><th>Chỉ tiêu KPI</th><th>Mục tiêu</th><th>Trọng số</th><th>Kế hoạch</th><th>Hạn</th><th>Trạng thái</th><th>Thao tác</th></tr>
                </thead>
                <tbody>
                  {currentReg.items.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8">Chưa có KPI nào. Nhấn &quot;Thêm KPI&quot; để bắt đầu.</td></tr>
                  ) : currentReg.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td className="font-medium">{item.indicatorName}</td>
                      <td>{item.targetValue} {item.unit}</td>
                      <td>{item.weight}%</td>
                      <td className="text-sm text-text-light max-w-[200px] truncate">{item.actionPlan || '-'}</td>
                      <td className="text-text-light">{item.dueDate || '-'}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: `${statusConfig[currentReg.status]?.color}20`, color: statusConfig[currentReg.status]?.color }}>
                          {statusConfig[currentReg.status]?.label}
                        </span>
                      </td>
                      <td>
                        {currentReg.status === 'draft' && (
                          <button onClick={() => handleRemoveItem(currentReg.id, item.id)} className="p-1 hover:bg-red-50 rounded" title="Xóa"><Trash2 size={14} className="text-red-600" /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {currentReg && (
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm">
              Tổng trọng số: <span className={`font-bold ${totalWeight === 100 ? 'text-accent-green' : totalWeight > 100 ? 'text-accent-red' : 'text-accent-yellow'}`}>{totalWeight}%</span>
              {totalWeight !== 100 && <span className="text-xs text-text-light ml-2">(Cần = 100%)</span>}
            </div>
            <div className="flex gap-2">
              {currentReg.status === 'draft' && (
                <>
                  <button onClick={() => setShowAddItem(true)} className="btn-primary flex items-center gap-1">
                    <Plus size={14} /> Thêm KPI
                  </button>
                  {currentReg.items.length > 0 && (
                    <button onClick={() => handleStatusChange(currentReg.id, 'submitted')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700">
                      <Send size={14} /> Gửi đăng ký
                    </button>
                  )}
                  <button onClick={() => handleDelete(currentReg.id)} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50">Xóa</button>
                </>
              )}
              {currentReg.status === 'submitted' && (
                <span className="text-sm text-text-light flex items-center gap-1"><Clock size={14} /> Đang chờ phê duyệt</span>
              )}
              {currentReg.status === 'approved' && (
                <button onClick={() => handleStatusChange(currentReg.id, 'committed')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700">
                  <CheckCircle size={14} /> Cam kết thực hiện
                </button>
              )}
              {currentReg.status === 'committed' && (
                <span className="text-sm text-accent-green flex items-center gap-1"><CheckCircle size={14} /> Đã cam kết thực hiện</span>
              )}
            </div>
          </div>
        )}
      </div>
        </>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo phiếu đăng ký KPI cá nhân">
        <CreateRegForm
          templates={templates}
          templateItems={templateItems}
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      <Modal isOpen={showAddItem} onClose={() => setShowAddItem(false)} title="Thêm KPI cá nhân">
        <ItemForm onSubmit={handleAddItem} />
      </Modal>
    </div>
  );
}

function CreateRegForm({ templates, templateItems, onSubmit, onCancel }: {
  templates: KPITemplate[];
  templateItems: KPITemplateItem[];
  onSubmit: (templateId?: string) => void;
  onCancel: () => void;
}) {
  const [templateId, setTemplateId] = useState('');
  const indTemplates = templates.filter(t => t.targetLevel === 'individual' && (t.status === 'active' || t.status === 'locked'));
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Bộ KPI mẫu</label>
        <select value={templateId} onChange={e => setTemplateId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
          <option value="">-- Không dùng mẫu (tự thêm KPI) --</option>
          {indTemplates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.indicatorCount} chỉ tiêu)</option>)}
        </select>
        <p className="text-xs text-text-light mt-1">Chọn bộ KPI mẫu để tự động thêm chỉ tiêu, hoặc bỏ trống để tự thêm sau</p>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button onClick={onCancel} className="btn-secondary">Hủy</button>
        <button onClick={() => onSubmit(templateId || undefined)} className="btn-primary">Tạo phiếu</button>
      </div>
    </div>
  );
}
