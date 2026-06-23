'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Send, CheckCircle, Lock, Play, FileText, Layers, X, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import academicYearsData from '@/data/academic-years.json';
import type { SchoolKPICatalog, UnitKPICatalog, IndividualKPICatalog, KPITemplateItem } from '@/types';

interface KPITemplate {
  id: string;
  name: string;
  academicYearId: string;
  targetLevel: 'school' | 'unit' | 'department' | 'individual';
  status: 'draft' | 'submitted' | 'approved' | 'active' | 'locked' | 'inactive';
  description: string;
  indicatorCount: number;
  totalWeight: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  activatedAt?: string;
  lockedAt?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
  active: { label: 'Đang áp dụng', color: 'bg-blue-100 text-blue-700' },
  locked: { label: 'Đã khóa', color: 'bg-red-100 text-red-600' },
  inactive: { label: 'Ngừng sử dụng', color: 'bg-gray-100 text-gray-400' },
};

const levelLabels: Record<string, string> = { school: 'Cấp Trường', unit: 'Cấp Đơn vị', department: 'Cấp Bộ môn', individual: 'Cấp Cá nhân' };

const levelToCatalog: Record<string, string> = {
  school: 'school-catalog',
  unit: 'unit-catalog',
  department: 'unit-catalog',
  individual: 'individual-catalog',
};

export default function KPITemplatesPage() {
  const [items, setItems] = useState<KPITemplate[]>([]);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const [showIndicators, setShowIndicators] = useState(false);
  const [selected, setSelected] = useState<KPITemplate | null>(null);
  const [loading, setLoading] = useState(true);

  const [schoolCatalog, setSchoolCatalog] = useState<SchoolKPICatalog[]>([]);
  const [unitCatalog, setUnitCatalog] = useState<UnitKPICatalog[]>([]);
  const [indCatalog, setIndCatalog] = useState<IndividualKPICatalog[]>([]);
  const [measurementUnits, setMeasurementUnits] = useState<{ id: string; name: string }[]>([]);
  const [templateItems, setTemplateItems] = useState<KPITemplateItem[]>([]);

  // Add-item form state
  const [addCatalogId, setAddCatalogId] = useState('');
  const [addWeight, setAddWeight] = useState(5);
  const [addTargetValue, setAddTargetValue] = useState(0);
  const [addCapRate, setAddCapRate] = useState(100);

  const load = useCallback(async () => {
    try {
      const [data, sc, uc, ic, mu, ti] = await Promise.all([
        apiGet<KPITemplate[]>('/api/kpi-templates'),
        apiGet<SchoolKPICatalog[]>('/api/school-kpi-catalog'),
        apiGet<UnitKPICatalog[]>('/api/unit-kpi-catalog'),
        apiGet<IndividualKPICatalog[]>('/api/individual-kpi-catalog'),
        apiGet<{ id: string; name: string }[]>('/api/measurement-units'),
        apiGet<KPITemplateItem[]>('/api/kpi-template-items'),
      ]);
      setItems(data);
      setSchoolCatalog(sc.filter(s => s.status === 'active'));
      setUnitCatalog(uc.filter(u => u.status === 'active'));
      setIndCatalog(ic.filter(i => i.status === 'active'));
      setMeasurementUnits(mu);
      setTemplateItems(ti);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveToStorage = (newItems: KPITemplate[]) => {
    setItems(newItems);
    localStorage.setItem('kpiTemplates', JSON.stringify(newItems));
  };

  const filtered = items.filter(i => {
    if (filterLevel && i.targetLevel !== filterLevel) return false;
    if (search) {
      const s = search.toLowerCase();
      return i.name.toLowerCase().includes(s) || i.description.toLowerCase().includes(s);
    }
    return true;
  });

  const handleCreate = async (data: Partial<KPITemplate>) => {
    const newItem = await apiPost<KPITemplate>('/api/kpi-templates', data);
    setItems([...items, newItem]);
    setShowCreate(false);
  };

  const handleStatusChange = async (item: KPITemplate, status: string) => {
    const labels: Record<string, string> = { submitted: 'trình duyệt', approved: 'phê duyệt', active: 'kích hoạt', locked: 'khóa', inactive: 'ngừng sử dụng' };
    if (!confirm(`${labels[status] || status} bộ KPI mẫu "${item.name}"?`)) return;
    const updates: Partial<KPITemplate> = { status: status as any };
    if (status === 'approved') updates.approvedAt = new Date().toISOString();
    if (status === 'active') updates.activatedAt = new Date().toISOString();
    if (status === 'locked') updates.lockedAt = new Date().toISOString();
    await apiPut(`/api/kpi-templates/${item.id}`, updates);
    setItems(items.map(i => i.id === item.id ? { ...i, ...updates } : i));
  };

  const handleClone = async (item: KPITemplate) => {
    const cloned = await apiPost<KPITemplate>('/api/kpi-templates', {
      ...item,
      name: `${item.name} (Bản sao)`,
      status: 'draft',
    });
    setItems([...items, cloned]);
    setShowClone(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa bộ KPI mẫu này?')) return;
    // Cascade delete template items
    const relatedItems = templateItems.filter(ti => ti.templateId === id);
    for (const ti of relatedItems) {
      await apiDelete(`/api/kpi-template-items/${ti.id}`);
    }
    await apiDelete(`/api/kpi-templates/${id}`);
    setItems(items.filter(i => i.id !== id));
    setTemplateItems(templateItems.filter(ti => ti.templateId !== id));
  };

  const openIndicators = (item: KPITemplate) => {
    setSelected(item);
    setAddCatalogId('');
    setAddWeight(5);
    setAddTargetValue(0);
    setAddCapRate(100);
    setShowIndicators(true);
  };

  const currentItems = templateItems.filter(ti => ti.id === selected?.id);

  const getCatalogLabel = () => {
    if (!selected) return '';
    const catKey = levelToCatalog[selected.targetLevel];
    if (catKey === 'school-catalog') return 'Chỉ tiêu Trường';
    if (catKey === 'unit-catalog') return 'KPI Đơn vị';
    if (catKey === 'individual-catalog') return 'KPI Cá nhân';
    return 'Chỉ tiêu';
  };

  const getCatalogOptions = () => {
    if (!selected) return [];
    const catKey = levelToCatalog[selected.targetLevel];
    const usedIds = new Set(templateItems.filter(ti => ti.templateId === selected.id).map(ti => ti.indicatorId));
    if (catKey === 'school-catalog') return schoolCatalog.filter(s => !usedIds.has(s.id)).map(s => ({ id: s.id, name: s.name, code: s.code }));
    if (catKey === 'unit-catalog') return unitCatalog.filter(u => !usedIds.has(u.id)).map(u => ({ id: u.id, name: u.name, code: u.code }));
    if (catKey === 'individual-catalog') return indCatalog.filter(i => !usedIds.has(i.id)).map(i => ({ id: i.id, name: i.name, code: i.code }));
    return [];
  };

  const getIndicatorName = (indicatorId: string) => {
    const from = (arr: any[]) => arr.find((x: any) => x.id === indicatorId);
    const found = from(schoolCatalog) || from(unitCatalog) || from(indCatalog);
    return found ? `${found.code} — ${found.name}` : indicatorId;
  };

  const getIndicatorUnit = (indicatorId: string) => {
    const from = (arr: any[]) => arr.find((x: any) => x.id === indicatorId);
    const found = from(schoolCatalog) || from(unitCatalog) || from(indCatalog);
    if (!found) return '';
    const unit = measurementUnits.find(m => m.id === found.unitId);
    return unit?.name || '';
  };

  const handleAddIndicator = async () => {
    if (!selected || !addCatalogId) return;
    const newItem = await apiPost<KPITemplateItem>('/api/kpi-template-items', {
      templateId: selected.id,
      indicatorId: addCatalogId,
      weight: addWeight,
      targetValue: addTargetValue,
      capRate: addCapRate,
    });
    setTemplateItems([...templateItems, newItem]);
    // Update the template count
    const tItems = [...templateItems.filter(ti => ti.templateId === selected.id), newItem];
    setItems(items.map(i => i.id === selected.id ? { ...i, indicatorCount: tItems.length, totalWeight: tItems.reduce((s, ti) => s + ti.weight, 0) } : i));
    setAddCatalogId('');
    setAddWeight(5);
    setAddTargetValue(0);
    setAddCapRate(100);
  };

  const handleRemoveIndicator = async (itemId: string) => {
    if (!selected) return;
    await apiDelete(`/api/kpi-template-items/${itemId}`);
    const newItems = templateItems.filter(ti => ti.id !== itemId);
    setTemplateItems(newItems);
    const tItems = newItems.filter(ti => ti.templateId === selected.id);
    setItems(items.map(i => i.id === selected.id ? { ...i, indicatorCount: tItems.length, totalWeight: tItems.reduce((s, ti) => s + ti.weight, 0) } : i));
  };

  const Form = ({ onSubmit, initial }: { onSubmit: (d: Partial<KPITemplate>) => void; initial?: KPITemplate }) => {
    const [form, setForm] = useState(initial || { name: '', academicYearId: 'ay001', targetLevel: 'school' as const, description: '' });
    return (
      <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Tên bộ KPI mẫu *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Năm học</label><select value={form.academicYearId} onChange={e => setForm({ ...form, academicYearId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">{(academicYearsData as any[]).map(y => <option key={y.id} value={y.id}>{y.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Cấp áp dụng</label><select value={form.targetLevel} onChange={e => setForm({ ...form, targetLevel: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="school">Cấp Trường</option><option value="unit">Cấp Đơn vị</option><option value="department">Cấp Bộ môn</option><option value="individual">Cấp Cá nhân</option></select></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
        <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark flex items-center gap-2"><FileText size={24} /> Bộ KPI mẫu</h1>
          <p className="text-text-light mt-1">Quản lý, duyệt, kích hoạt và khóa bộ KPI mẫu (III.1-III.8)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowClone(true)} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-1"><Plus size={14} /> Sao chép từ chu kỳ trước</button>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-xs flex items-center gap-1"><Plus size={14} /> Tạo mới</button>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b flex gap-3 flex-wrap">
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="px-3 py-1.5 border rounded-lg text-xs">
            <option value="">Tất cả cấp</option>
            <option value="school">Cấp Trường</option>
            <option value="unit">Cấp Đơn vị</option>
            <option value="individual">Cấp Cá nhân</option>
          </select>
          <div className="relative ml-auto"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" size={14} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..." className="pl-8 pr-3 py-1.5 border rounded-lg text-xs w-56" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>STT</th><th>Tên bộ KPI mẫu</th><th>Cấp</th><th>Số KPI</th><th>Tổng trọng số</th><th>Trạng thái</th><th>Khai báo chỉ số</th><th>Thao tác</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="text-center py-8">Đang tải...</td></tr> :
              filtered.length === 0 ? <tr><td colSpan={8} className="text-center py-8">Chưa có bộ KPI mẫu</td></tr> :
              filtered.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td><div className="font-medium">{item.name}</div><div className="text-xs text-text-light">{item.description}</div></td>
                  <td><span className="badge badge-info">{levelLabels[item.targetLevel]}</span></td>
                  <td className="text-center">{item.indicatorCount}</td>
                  <td className="text-center">{item.totalWeight}%</td>
                  <td><span className={`badge ${statusConfig[item.status]?.color}`}>{statusConfig[item.status]?.label}</span></td>
                  <td>
                    <button onClick={() => openIndicators(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Khai báo chỉ số">
                      <Layers size={14} />
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {item.status === 'draft' && <button onClick={() => handleStatusChange(item, 'submitted')} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Trình duyệt"><Send size={12} /></button>}
                      {item.status === 'submitted' && <button onClick={() => handleStatusChange(item, 'approved')} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Phê duyệt"><CheckCircle size={12} /></button>}
                      {item.status === 'approved' && <button onClick={() => handleStatusChange(item, 'active')} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Kích hoạt"><Play size={12} /></button>}
                      {item.status === 'active' && <button onClick={() => handleStatusChange(item, 'locked')} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Khóa"><Lock size={12} /></button>}
                      {item.status === 'draft' && <button onClick={() => { setSelected(item); setShowEdit(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button>}
                      {item.status !== 'locked' && item.status !== 'active' && <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Khai báo chỉ số Modal */}
      <Modal isOpen={showIndicators} onClose={() => setShowIndicators(false)} title={`Khai báo chỉ số: ${selected?.name || ''}`} maxWidth="max-w-4xl">
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-sm text-text-light">
              <span className="badge badge-info">{levelLabels[selected.targetLevel]}</span>
              <span>Danh mục nguồn: <strong>{getCatalogLabel()}</strong></span>
              <span>Số chỉ số: <strong>{currentItems.length}</strong></span>
              <span>Tổng trọng số: <strong>{currentItems.reduce((s, i) => s + i.weight, 0)}%</strong></span>
            </div>

            {/* Current items */}
            <div>
              <h4 className="text-sm font-medium text-text-dark mb-2">Danh sách chỉ số hiện tại</h4>
              {currentItems.length === 0 ? (
                <p className="text-xs text-text-light py-4 text-center border rounded-lg bg-bg-cream">Chưa có chỉ số nào. Thêm chỉ số từ danh mục bên dưới.</p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-bg-cream border-b">
                        <th className="text-left px-3 py-2 font-medium text-xs">STT</th>
                        <th className="text-left px-3 py-2 font-medium text-xs">Chỉ số</th>
                        <th className="text-center px-3 py-2 font-medium text-xs" style={{ width: 80 }}>ĐVT</th>
                        <th className="text-center px-3 py-2 font-medium text-xs" style={{ width: 80 }}>Trọng số</th>
                        <th className="text-center px-3 py-2 font-medium text-xs" style={{ width: 80 }}>Mục tiêu</th>
                        <th className="text-center px-3 py-2 font-medium text-xs" style={{ width: 80 }}>CapRate</th>
                        <th className="text-center px-3 py-2 font-medium text-xs" style={{ width: 50 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((ti, idx) => (
                        <tr key={ti.id} className="border-b border-border/50">
                          <td className="px-3 py-2 text-text-light">{idx + 1}</td>
                          <td className="px-3 py-2">{getIndicatorName(ti.indicatorId)}</td>
                          <td className="px-3 py-2 text-center text-text-light text-xs">{getIndicatorUnit(ti.indicatorId)}</td>
                          <td className="px-3 py-2 text-center">{ti.weight}%</td>
                          <td className="px-3 py-2 text-center">{ti.targetValue}</td>
                          <td className="px-3 py-2 text-center">{ti.capRate}%</td>
                          <td className="px-3 py-2 text-center">
                            <button onClick={() => handleRemoveIndicator(ti.id)} className="p-1 text-accent-red hover:bg-red-50 rounded" title="Xóa">
                              <X size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Add item */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-text-dark mb-3">Thêm chỉ số từ danh mục {getCatalogLabel()}</h4>
              {(() => {
                const options = getCatalogOptions();
                if (!levelToCatalog[selected.targetLevel]) {
                  return <p className="text-xs text-accent-red flex items-center gap-1"><AlertCircle size={12} /> Chưa có danh mục cho cấp này.</p>;
                }
                return (
                  <div className="space-y-3">
                    <div><label className="block text-xs font-medium text-text-light mb-1">Chọn chỉ số</label>
                      <select value={addCatalogId} onChange={e => setAddCatalogId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                        <option value="">-- Chọn --</option>
                        {options.map(o => <option key={o.id} value={o.id}>{o.code} — {o.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="block text-xs font-medium text-text-light mb-1">Trọng số (%)</label>
                        <input type="number" value={addWeight} onChange={e => setAddWeight(Number(e.target.value))} min={0} max={100} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                      <div><label className="block text-xs font-medium text-text-light mb-1">Giá trị mục tiêu</label>
                        <input type="number" value={addTargetValue} onChange={e => setAddTargetValue(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                      <div><label className="block text-xs font-medium text-text-light mb-1">Tỉ lệ tối đa (%)</label>
                        <input type="number" value={addCapRate} onChange={e => setAddCapRate(Number(e.target.value))} min={0} max={200} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={handleAddIndicator} disabled={!addCatalogId} className="btn-primary text-xs flex items-center gap-1"><Plus size={14} /> Thêm vào danh sách</button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo bộ KPI mẫu mới"><Form onSubmit={handleCreate} /></Modal>
      <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setSelected(null); }} title="Chỉnh sửa">{selected && <Form onSubmit={(d) => { const updated = items.map(i => i.id === selected.id ? { ...i, ...d, updatedAt: new Date().toISOString() } : i); saveToStorage(updated); setShowEdit(false); }} initial={selected} />}</Modal>
      <Modal isOpen={showClone} onClose={() => setShowClone(false)} title="Sao chép từ chu kỳ trước">
        <div className="space-y-3">
          <p className="text-sm text-text-light">Chọn bộ KPI mẫu cần sao chép:</p>
          {items.filter(i => i.status === 'active' || i.status === 'locked').map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-bg-cream rounded-lg">
              <div><div className="font-medium text-sm">{item.name}</div><div className="text-xs text-text-light">{levelLabels[item.targetLevel]} • {item.indicatorCount} KPI</div></div>
              <button onClick={() => handleClone(item)} className="px-3 py-1 bg-primary text-white rounded-lg text-xs">Sao chép</button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
