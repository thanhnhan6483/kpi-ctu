'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Ruler, FileText, Award, Save } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface MeasurementUnit { id: string; name: string; description: string; status: string; }
interface EvidenceType { id: string; name: string; code: string; description: string; maxSize: string; required: boolean; status: string; }
interface GradingLevel { id: string; name: string; code: string; minScore: number; maxScore: number; color: string; description: string; status: string; }

type Tab = 'units' | 'evidence-types' | 'grading-levels';

export default function SharedCategoriesPage() {
  const [tab, setTab] = useState<Tab>('units');
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [eTypes, setETypes] = useState<EvidenceType[]>([]);
  const [grades, setGrades] = useState<GradingLevel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [u, e, g] = await Promise.all([
        apiGet<MeasurementUnit[]>('/api/measurement-units'),
        apiGet<EvidenceType[]>('/api/evidence-types'),
        apiGet<GradingLevel[]>('/api/grading-levels'),
      ]);
      setUnits(u); setETypes(e); setGrades(g);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: any) => {
    const endpoints: Record<Tab, string> = { units: 'measurement-units', 'evidence-types': 'evidence-types', 'grading-levels': 'grading-levels' };
    const ep = endpoints[tab];
    if (editItem) {
      await apiPut(`/api/${ep}/${editItem.id}`, data);
    } else {
      await apiPost(`/api/${ep}`, data);
    }
    setShowModal(false); setEditItem(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa mục này?')) return;
    const endpoints: Record<Tab, string> = { units: 'measurement-units', 'evidence-types': 'evidence-types', 'grading-levels': 'grading-levels' };
    await apiDelete(`/api/${endpoints[tab]}/${id}`);
    load();
  };

  const tabs = [
    { key: 'units' as Tab, label: 'Đơn vị đo', icon: Ruler },
    { key: 'evidence-types' as Tab, label: 'Loại minh chứng', icon: FileText },
    { key: 'grading-levels' as Tab, label: 'Mức xếp loại', icon: Award },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Danh mục dùng chung</h1>
          <p className="text-text-light mt-1">Quản lý đơn vị đo, loại minh chứng, mức xếp loại (II.3, II.5, II.7)</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm mới
        </button>
      </div>

      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === t.key ? 'bg-primary text-white' : 'bg-bg-cream text-text-dark hover:bg-primary-light'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">{tabs.find(t => t.key === tab)?.label}</h3></div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-text-light">Đang tải...</div>
          ) : tab === 'units' ? (
            <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Tên đơn vị</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>{units.map((u, i) => (<tr key={u.id}><td>{i + 1}</td><td className="font-mono text-xs">{u.id}</td><td className="font-medium">{u.name}</td><td className="text-sm text-text-light">{u.description}</td><td><span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{u.status === 'active' ? 'Đang dùng' : 'Ngừng'}</span></td><td><div className="flex gap-1"><button onClick={() => { setEditItem(u); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button><button onClick={() => handleDelete(u.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button></div></td></tr>))}</tbody></table>
          ) : tab === 'evidence-types' ? (
            <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Tên loại</th><th>Mô tả</th><th>Dung lượng TB</th><th>Bắt buộc</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>{eTypes.map((e, i) => (<tr key={e.id}><td>{i + 1}</td><td className="font-mono text-xs">{e.code}</td><td className="font-medium">{e.name}</td><td className="text-sm text-text-light">{e.description}</td><td>{e.maxSize}</td><td>{e.required ? <span className="badge badge-warning">Có</span> : <span className="badge">Không</span>}</td><td><span className={`badge ${e.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{e.status === 'active' ? 'Đang dùng' : 'Ngừng'}</span></td><td><div className="flex gap-1"><button onClick={() => { setEditItem(e); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button><button onClick={() => handleDelete(e.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button></div></td></tr>))}</tbody></table>
          ) : (
            <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Mức xếp loại</th><th>Điểm từ</th><th>Điểm đến</th><th>Màu</th><th>Mô tả</th><th>Thao tác</th></tr></thead>
              <tbody>{grades.map((g, i) => (<tr key={g.id}><td>{i + 1}</td><td className="font-mono text-xs">{g.code}</td><td className="font-medium"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />{g.name}</span></td><td>{g.minScore}</td><td>{g.maxScore}</td><td><span className="w-6 h-6 rounded inline-block border" style={{ backgroundColor: g.color }} /></td><td className="text-sm text-text-light">{g.description}</td><td><div className="flex gap-1"><button onClick={() => { setEditItem(g); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button><button onClick={() => handleDelete(g.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button></div></td></tr>))}</tbody></table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Chỉnh sửa' : 'Thêm mới'}>
        {tab === 'units' ? <UnitForm initial={editItem} onSubmit={handleSave} /> :
         tab === 'evidence-types' ? <ETypeForm initial={editItem} onSubmit={handleSave} /> :
         <GradeForm initial={editItem} onSubmit={handleSave} />}
      </Modal>
    </div>
  );
}

function UnitForm({ initial, onSubmit }: { initial?: MeasurementUnit; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', description: '', status: 'active' });
  return (<form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
    <div><label className="block text-sm font-medium mb-1">Tên đơn vị đo *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
    <div><label className="block text-sm font-medium mb-1">Mô tả</label><input value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
    <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
  </form>);
}

function ETypeForm({ initial, onSubmit }: { initial?: EvidenceType; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', code: '', description: '', maxSize: '10MB', required: true, status: 'active' });
  return (<form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
    <div><label className="block text-sm font-medium mb-1">Tên loại minh chứng *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
    <div className="grid grid-cols-2 gap-4">
      <div><label className="block text-sm font-medium mb-1">Mã *</label><input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      <div><label className="block text-sm font-medium mb-1">Dung lượng tối đa</label><input value={f.maxSize} onChange={e => setF({ ...f, maxSize: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
    </div>
    <div><label className="block text-sm font-medium mb-1">Mô tả</label><input value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.required} onChange={e => setF({ ...f, required: e.target.checked })} className="rounded" /> Bắt buộc khi nộp minh chứng</label>
    <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
  </form>);
}

function GradeForm({ initial, onSubmit }: { initial?: GradingLevel; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', code: '', minScore: 0, maxScore: 100, color: '#4caf50', description: '', status: 'active' });
  return (<form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
    <div><label className="block text-sm font-medium mb-1">Tên mức xếp loại *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
    <div className="grid grid-cols-2 gap-4">
      <div><label className="block text-sm font-medium mb-1">Mã *</label><input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      <div><label className="block text-sm font-medium mb-1">Màu sắc</label><input type="color" value={f.color} onChange={e => setF({ ...f, color: e.target.value })} className="w-full h-9 px-1 py-1 border rounded-lg" /></div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div><label className="block text-sm font-medium mb-1">Điểm từ *</label><input type="number" value={f.minScore} onChange={e => setF({ ...f, minScore: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      <div><label className="block text-sm font-medium mb-1">Điểm đến *</label><input type="number" value={f.maxScore} onChange={e => setF({ ...f, maxScore: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
    </div>
    <div><label className="block text-sm font-medium mb-1">Mô tả</label><input value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
    <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
  </form>);
}
