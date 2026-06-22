'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Gauge, Lock } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface Threshold {
  id: string;
  code: string;
  name: string;
  minValue: number;
  maxValue: number;
  color: string;
  isSystem: boolean;
  description: string;
  status: string;
}

export default function ThresholdsPage() {
  const [items, setItems] = useState<Threshold[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Threshold | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<Threshold[]>('/api/thresholds');
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: any) => {
    if (editItem) {
      await apiPut(`/api/thresholds/${editItem.id}`, data);
    } else {
      await apiPost('/api/thresholds', data);
    }
    setShowModal(false); setEditItem(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa ngưỡng cảnh báo này?')) return;
    await apiDelete(`/api/thresholds/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Ngưỡng cảnh báo</h1>
          <p className="text-text-light mt-1">Quản lý ngưỡng cảnh báo KPI (II.9)</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm mới
        </button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách ngưỡng</h3></div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-text-light">Đang tải...</div>
          ) : (
            <table className="table">
              <thead><tr><th>STT</th><th>Mã</th><th>Tên ngưỡng</th><th>Giá trị min</th><th>Giá trị max</th><th>Màu</th><th>Mô tả</th><th>Thao tác</th></tr></thead>
              <tbody>{items.length === 0 ? <tr><td colSpan={8} className="text-center py-8">Không có dữ liệu</td></tr> :
                items.map((item, i) => (<tr key={item.id}>
                  <td>{i + 1}</td>
                  <td className="font-mono text-xs">{item.code}</td>
                  <td className="font-medium flex items-center gap-2">
                    <Gauge size={14} className="text-primary" />
                    {item.name}
                    {item.isSystem && <span title="Hệ thống"><Lock size={12} className="text-accent-yellow" /></span>}
                  </td>
                  <td>{item.minValue}</td>
                  <td>{item.maxValue}</td>
                  <td><span className="w-6 h-6 rounded inline-block border" style={{ backgroundColor: item.color }} /></td>
                  <td className="text-sm text-text-light">{item.description}</td>
                  <td><div className="flex gap-1">
                    <button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button>
                    {!item.isSystem && <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button>}
                  </div></td>
                </tr>))}</tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Chỉnh sửa ngưỡng' : 'Thêm ngưỡng'}>
        <Form initial={editItem} onSubmit={handleSave} />
      </Modal>
    </div>
  );
}

function Form({ initial, onSubmit }: { initial?: Threshold | null; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { code: '', name: '', minValue: 0, maxValue: 100, color: '#4caf50', isSystem: false, description: '', status: 'active' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mã ngưỡng *</label><input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
        <div><label className="block text-sm font-medium mb-1">Tên ngưỡng *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium mb-1">Giá trị min</label><input type="number" value={f.minValue} onChange={e => setF({ ...f, minValue: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Giá trị max</label><input type="number" value={f.maxValue} onChange={e => setF({ ...f, maxValue: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Màu sắc</label><input type="color" value={f.color} onChange={e => setF({ ...f, color: e.target.value })} className="w-full h-9 px-1 py-1 border rounded-lg" /></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isSystem} onChange={e => setF({ ...f, isSystem: e.target.checked })} className="rounded" /> Ngưỡng hệ thống (không thể xóa)</label>
      <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
      <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
    </form>
  );
}
