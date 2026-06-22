'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, ClipboardCheck, ListChecks } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface Criterion {
  id: string;
  rubricId: string;
  name: string;
  maxScore: number;
  weight: number;
  description: string;
}

interface Rubric {
  id: string;
  code: string;
  name: string;
  description: string;
  status: string;
  criteria?: Criterion[];
}

export default function RubricsPage() {
  const [items, setItems] = useState<Rubric[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Rubric | null>(null);
  const [detailItem, setDetailItem] = useState<Rubric | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCriterionModal, setShowCriterionModal] = useState(false);
  const [editCriterion, setEditCriterion] = useState<Criterion | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<Rubric[]>('/api/rubrics');
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: any) => {
    if (editItem) {
      await apiPut(`/api/rubrics/${editItem.id}`, data);
    } else {
      await apiPost('/api/rubrics', data);
    }
    setShowModal(false); setEditItem(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa rubric này?')) return;
    await apiDelete(`/api/rubrics/${id}`);
    if (detailItem?.id === id) setDetailItem(null);
    load();
  };

  const handleSaveCriterion = async (data: any) => {
    if (!detailItem) return;
    if (editCriterion) {
      await apiPut(`/api/rubrics/${detailItem.id}/criteria/${editCriterion.id}`, data);
    } else {
      await apiPost(`/api/rubrics/${detailItem.id}/criteria`, data);
    }
    setShowCriterionModal(false); setEditCriterion(null);
    const updated = await apiGet<Rubric>(`/api/rubrics/${detailItem.id}`);
    setDetailItem(updated);
    load();
  };

  const handleDeleteCriterion = async (criterionId: string) => {
    if (!detailItem || !confirm('Xóa tiêu chí này?')) return;
    await apiDelete(`/api/rubrics/${detailItem.id}/criteria/${criterionId}`);
    const updated = await apiGet<Rubric>(`/api/rubrics/${detailItem.id}`);
    setDetailItem(updated);
    load();
  };

  const openDetail = async (item: Rubric) => {
    try {
      const full = await apiGet<Rubric>(`/api/rubrics/${item.id}`);
      setDetailItem(full);
    } catch {
      setDetailItem({ ...item, criteria: [] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Rubric định tính</h1>
          <p className="text-text-light mt-1">Quản lý rubric đánh giá định tính KPI (II.12)</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm mới
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header"><h3 className="text-white">Danh sách rubric</h3></div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-text-light">Đang tải...</div>
            ) : (
              <table className="table">
                <thead><tr><th>STT</th><th>Mã</th><th>Tên rubric</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>{items.length === 0 ? <tr><td colSpan={6} className="text-center py-8">Không có dữ liệu</td></tr> :
                  items.map((item, i) => (<tr key={item.id} className={detailItem?.id === item.id ? 'bg-primary-light' : ''}>
                    <td>{i + 1}</td>
                    <td className="font-mono text-xs">{item.code}</td>
                    <td className="font-medium flex items-center gap-2"><ClipboardCheck size={14} className="text-primary" />{item.name}</td>
                    <td className="text-sm text-text-light">{item.description}</td>
                    <td><span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{item.status === 'active' ? 'Đang dùng' : 'Ngừng'}</span></td>
                    <td><div className="flex gap-1">
                      <button onClick={() => openDetail(item)} className="p-1 hover:bg-green-50 rounded" title="Xem chi tiết"><ListChecks size={12} className="text-green-600" /></button>
                      <button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button>
                    </div></td>
                  </tr>))}</tbody>
              </table>
            )}
          </div>
        </div>

        {detailItem && (
          <div className="card">
            <div className="card-header"><h3 className="text-white">Tiêu chí: {detailItem.name}</h3></div>
            <div className="p-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-text-light">{detailItem.criteria?.length || 0} tiêu chí</span>
                <button onClick={() => { setEditCriterion(null); setShowCriterionModal(true); }} className="btn-primary text-xs flex items-center gap-1">
                  <Plus size={12} /> Thêm tiêu chí
                </button>
              </div>
              <table className="table">
                <thead><tr><th>STT</th><th>Tiêu chí</th><th>Điểm tối đa</th><th>Hệ số</th><th>Thao tác</th></tr></thead>
                <tbody>{(detailItem.criteria || []).length === 0 ? <tr><td colSpan={5} className="text-center py-4 text-text-light">Chưa có tiêu chí</td></tr> :
                  (detailItem.criteria || []).map((c, i) => (<tr key={c.id}>
                    <td>{i + 1}</td>
                    <td className="font-medium text-sm">{c.name}</td>
                    <td>{c.maxScore}</td>
                    <td>{c.weight}</td>
                    <td><div className="flex gap-1">
                      <button onClick={() => { setEditCriterion(c); setShowCriterionModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button>
                      <button onClick={() => handleDeleteCriterion(c.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button>
                    </div></td>
                  </tr>))}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Chỉnh sửa rubric' : 'Thêm rubric'}>
        <RubricForm initial={editItem} onSubmit={handleSave} />
      </Modal>

      <Modal isOpen={showCriterionModal} onClose={() => { setShowCriterionModal(false); setEditCriterion(null); }} title={editCriterion ? 'Chỉnh sửa tiêu chí' : 'Thêm tiêu chí'}>
        <CriterionForm initial={editCriterion} onSubmit={handleSaveCriterion} />
      </Modal>
    </div>
  );
}

function RubricForm({ initial, onSubmit }: { initial?: Rubric | null; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { code: '', name: '', description: '', status: 'active' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mã rubric *</label><input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
        <div><label className="block text-sm font-medium mb-1">Tên rubric *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} /></div>
      <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
    </form>
  );
}

function CriterionForm({ initial, onSubmit }: { initial?: Criterion | null; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', maxScore: 10, weight: 1, description: '' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
      <div><label className="block text-sm font-medium mb-1">Tên tiêu chí *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Điểm tối đa</label><input type="number" value={f.maxScore} onChange={e => setF({ ...f, maxScore: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Hệ số</label><input type="number" step={0.1} value={f.weight} onChange={e => setF({ ...f, weight: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
      <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
    </form>
  );
}
