'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, Search, Plus, Send, ArrowRight, GitBranch, Edit, Trash2, XCircle, Calculator, Users } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import unitsData from '@/data/units.json';
import usersData from '@/data/users.json';
import type { KPIIndicator, AcademicYear } from '@/types';

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

export default function CascadeAssignmentsPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [cycles, setCycles] = useState<KPICycle[]>([]);
  const [indicators, setIndicators] = useState<KPIIndicator[]>([]);
  const [items, setItems] = useState<KPICascadeAssignment[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const selectedCycleIdRef = useRef(selectedCycleId);
  selectedCycleIdRef.current = selectedCycleId;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailTab, setDetailTab] = useState<'list' | 'ratio'>('list');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<KPICascadeAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  const loadYears = useCallback(async () => {
    const y = await apiGet<AcademicYear[]>('/api/academic-years');
    setYears(y);
    if (!selectedYearId) {
      const active = y.find(ay => ay.status === 'active');
      if (active) setSelectedYearId(active.id);
    }
  }, [selectedYearId]);

  const load = useCallback(async (yearId: string) => {
    if (!yearId) return;
    try {
      const [c, a, ind] = await Promise.all([
        apiGet<KPICycle[]>('/api/cycles'),
        apiGet<KPICascadeAssignment[]>('/api/cascade-assignments'),
        apiGet<KPIIndicator[]>(`/api/indicators?academicYearId=${yearId}`),
      ]);
      const yearCycles = c.filter(cy => cy.academicYearId === yearId);
      setCycles(yearCycles);
      setItems(a);
      setIndicators(ind);
      if (!selectedCycleIdRef.current && yearCycles.length > 0) {
        const active = yearCycles.find(cy => cy.status === 'active');
        setSelectedCycleId(active?.id || yearCycles[0].id);
      }
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadYears(); }, [loadYears]);
  useEffect(() => { if (selectedYearId) load(selectedYearId); }, [selectedYearId, load]);

  const indicatorMap: Record<string, { name: string; unit: string }> = {};
  indicators.forEach(i => { indicatorMap[i.id] = { name: i.name, unit: i.unit }; });

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
    load(selectedYearId);
  };

  const handleUpdate = async (data: Partial<KPICascadeAssignment>) => {
    if (!selected) return;
    await apiPut(`/api/cascade-assignments/${selected.id}`, data);
    setShowEdit(false);
    load(selectedYearId);
  };

  const handleStatusChange = async (item: KPICascadeAssignment, status: string) => {
    const labels: Record<string, string> = { assigned: 'giao KPI', accepted: 'nhận KPI', rejected: 'từ chối', in_progress: 'bắt đầu thực hiện' };
    if (!confirm(`${labels[status] || status} cho "${item.indicatorName}"?`)) return;
    await apiPut(`/api/cascade-assignments/${item.id}`, { status });
    load(selectedYearId);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa phân bổ KPI này?')) return;
    await apiDelete(`/api/cascade-assignments/${id}`);
    load(selectedYearId);
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
        <div>
          <label className="block text-sm font-medium mb-1">Đơn vị nhận *</label>
          <select value={form.toUnitId} onChange={e => setForm({ ...form, toUnitId: e.target.value })} required
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary">
            <option value="">-- Chọn đơn vị --</option>
            {(unitsData as { id: string; name: string }[]).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Chỉ tiêu Trường *</label>
          <select value={form.indicatorId} onChange={e => handleIndicatorChange(e.target.value)} required
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary">
            <option value="">-- Chọn chỉ tiêu --</option>
            {indicators.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mục tiêu *</label>
            <input type="number" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: Number(e.target.value) })} required
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Đơn vị đo</label>
            <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trọng số (%) *</label>
            <input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: Number(e.target.value) })} required min={0} max={100}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hạn thực hiện</label>
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.evidenceRequired} onChange={e => setForm({ ...form, evidenceRequired: e.target.checked })} className="rounded" />
              Yêu cầu minh chứng
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ghi chú</label>
          <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" rows={2} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => initial ? setShowEdit(false) : setShowCreate(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg-cream">Hủy</button>
          <button type="submit" className="btn-primary">Lưu</button>
        </div>
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

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-text-dark">Năm học:</span>
        {years.map(ay => (
          <button key={ay.id} onClick={() => { setSelectedYearId(ay.id); setSelectedCycleId(''); }}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${selectedYearId === ay.id ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>
            {ay.name}
          </button>
        ))}
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

      <div className="flex gap-1 bg-white border border-border rounded-lg p-0.5 w-fit">
        <button onClick={() => setDetailTab('list')} className={`px-4 py-1.5 rounded text-sm font-medium ${detailTab === 'list' ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>Danh sách phân bổ</button>
        <button onClick={() => setDetailTab('ratio')} className={`px-4 py-1.5 rounded text-sm font-medium ${detailTab === 'ratio' ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>Tỷ lệ đóng góp (VI.6)</button>
      </div>

      {detailTab === 'list' && (
        <>
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
                    <tr><th>STT</th><th>Chỉ tiêu KPI</th><th>Đơn vị nhận</th><th>Mục tiêu</th><th>Trọng số</th><th>Hạn</th><th>Trạng thái</th><th>Thao tác</th></tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} className="text-center py-8">Đang tải...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8">Chưa có phân bổ KPI nào</td></tr>
                    ) : filtered.map((item, idx) => {
                      const status = statusConfig[item.status] || statusConfig.draft;
                      return (
                        <tr key={item.id}>
                          <td className="text-sm text-text-light">{idx + 1}</td>
                          <td className="text-sm font-medium">{item.indicatorName}</td>
                          <td className="text-sm">{unitMap[item.toUnitId] || '-'}</td>
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
        </>
      )}

      {detailTab === 'ratio' && (
        <div className="card">
          <div className="card-header"><h3 className="text-white flex items-center gap-2"><Calculator size={16} /> Tỷ lệ đóng góp (VI.6)</h3></div>
          <div className="p-4">
            <ContributionRatioTable indicatorsData={indicators} cascadeItems={cycleFiltered} unitsData={unitsData as { id: string; name: string }[]} />
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><h3 className="text-white flex items-center gap-2"><Calculator size={16} /> Phân bổ gợi ý</h3></div>
        <div className="p-4">
          <SuggestedDistribution cycleId={selectedCycleId} items={cycleFiltered} unitsData={unitsData as { id: string; name: string }[]} onApply={() => load()} />
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

function ContributionRatioTable({ indicatorsData, cascadeItems, unitsData }: {
  indicatorsData: { id: string; name: string; targetValue: number; unit: string }[];
  cascadeItems: { indicatorId: string; indicatorName: string; toUnitId: string; targetValue: number; unit: string }[];
  unitsData: { id: string; name: string }[];
}) {
  const unitMap = useMemo(() => {
    const m: Record<string, string> = {};
    (unitsData as { id: string; name: string }[]).forEach(u => { m[u.id] = u.name; });
    return m;
  }, [unitsData]);

  const grouped = useMemo(() => {
    const map: Record<string, { total: number; units: Record<string, number> }> = {};
    cascadeItems.forEach(item => {
      if (!map[item.indicatorId]) map[item.indicatorId] = { total: 0, units: {} };
      map[item.indicatorId].total += item.targetValue;
      map[item.indicatorId].units[item.toUnitId] = (map[item.indicatorId].units[item.toUnitId] || 0) + item.targetValue;
    });
    return map;
  }, [cascadeItems]);

  const schoolIndicators = indicatorsData.filter(i => i.id.startsWith('CTU'));

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-light">
        Tỷ lệ đóng góp của từng đơn vị cho chỉ tiêu cấp Trường (tự động từ kết quả phân bổ Cascade).
      </p>
      <div className="overflow-x-auto">
        <table className="table text-sm">
          <thead>
            <tr>
              <th>Chỉ tiêu Trường</th>
              <th>Mục tiêu</th>
              <th>Tổng đơn vị</th>
              <th>Tỷ lệ</th>
            </tr>
          </thead>
          <tbody>
            {schoolIndicators.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-6 text-text-light">Chưa có KPI cấp Trường</td></tr>
            ) : schoolIndicators.map(ind => {
              const g = grouped[ind.id];
              const totalUnit = g?.total || 0;
              const schoolTarget = ind.targetValue;
              const ratio = schoolTarget > 0 ? Math.min(Math.round((totalUnit / schoolTarget) * 100), 100) : 0;
              const units = g?.units || {};
              return (
                <tr key={ind.id}>
                  <td className="font-medium">{ind.name}</td>
                  <td>{schoolTarget} {ind.unit}</td>
                  <td className={`font-bold ${totalUnit >= schoolTarget ? 'text-accent-green' : 'text-accent-red'}`}>
                    {totalUnit} {ind.unit}
                  </td>
                  <td>
                    <span className={`badge ${ratio >= 100 ? (totalUnit > schoolTarget ? 'badge-danger' : 'badge-success') : 'badge-warning'}`}>{ratio}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SuggestedDistribution({ cycleId, items, unitsData, onApply }: { cycleId: string; items: KPICascadeAssignment[]; unitsData: { id: string; name: string }[]; onApply: () => void }) {
  const [staffCounts, setStaffCounts] = useState<Record<string, number>>({});
  const [suggestions, setSuggestions] = useState<Record<string, number> | null>(null);
  const [totalStaff, setTotalStaff] = useState(0);

  const unitIds = [...new Set(items.filter(i => i.status === 'draft').map(i => i.toUnitId))];

  const handleCalculate = () => {
    const total = Object.values(staffCounts).reduce((s, v) => s + v, 0);
    setTotalStaff(total);
    if (total === 0) return;
    const dist: Record<string, number> = {};
    for (const item of items) {
      if (item.status !== 'draft') continue;
      const pct = (staffCounts[item.toUnitId] || 0) / total;
      dist[item.id] = Math.round(item.targetValue * pct);
    }
    setSuggestions(dist);
  };

  const handleAccept = async () => {
    for (const item of items) {
      if (item.status !== 'draft' || !suggestions) continue;
      const val = suggestions[item.id];
      if (val !== undefined) {
        await apiPut(`/api/cascade-assignments/${item.id}`, { targetValue: val });
      }
    }
    setSuggestions(null);
    onApply();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-light">Nhập số giảng viên/quy mô cho từng đơn vị để tính gợi ý phân bổ chỉ tiêu theo tỷ lệ.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {unitIds.map(uid => (
          <div key={uid}>
            <label className="block text-xs font-medium mb-1">{unitsData.find(u => u.id === uid)?.name || uid}</label>
            <input type="number" min={0} value={staffCounts[uid] ?? ''} onChange={e => setStaffCounts({ ...staffCounts, [uid]: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm" placeholder="Số GV" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={handleCalculate} disabled={unitIds.length === 0} className="btn-primary flex items-center gap-1 text-sm"><Calculator size={14} /> Tính toán gợi ý</button>
        {suggestions && <button onClick={handleAccept} className="px-4 py-2 bg-accent-green text-white rounded-lg text-sm flex items-center gap-1 hover:opacity-90"><CheckCircle size={14} /> Áp dụng</button>}
      </div>
      {suggestions && (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="table text-sm">
            <thead><tr><th>Chỉ tiêu</th><th>Giá trị cũ</th><th>Gợi ý</th></tr></thead>
            <tbody>
              {items.filter(i => i.status === 'draft').map(item => (
                <tr key={item.id}>
                  <td className="font-medium">{item.indicatorName}</td>
                  <td>{item.targetValue} {item.unit}</td>
                  <td className="font-bold text-primary">{suggestions[item.id] ?? item.targetValue} {item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
