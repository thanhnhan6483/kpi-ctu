'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, LayoutDashboard, TrendingUp, Users, DollarSign, RefreshCw } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface BscObjective {
  id: string;
  perspective: string;
  code: string;
  name: string;
  description: string;
  kpiLink: string;
  status: string;
}

const perspectives = [
  { key: 'finance', label: 'Tài chính', icon: DollarSign },
  { key: 'customer', label: 'Khách hàng', icon: Users },
  { key: 'internal', label: 'Quy trình nội bộ', icon: RefreshCw },
  { key: 'learning', label: 'Học hỏi & Phát triển', icon: TrendingUp },
];

export default function BscPage() {
  const [items, setItems] = useState<BscObjective[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<BscObjective | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<BscObjective[]>('/api/bsc-objectives');
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: any) => {
    if (editItem) {
      await apiPut(`/api/bsc-objectives/${editItem.id}`, data);
    } else {
      await apiPost('/api/bsc-objectives', data);
    }
    setShowModal(false); setEditItem(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa mục tiêu này?')) return;
    await apiDelete(`/api/bsc-objectives/${id}`);
    load();
  };

  const getItemsByPerspective = (key: string) => items.filter(i => i.perspective === key);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Bản đồ BSC</h1>
          <p className="text-text-light mt-1">Quản lý bản đồ chiến lược BSC (Balanced Scorecard) (XXI.5)</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm mục tiêu
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-text-light">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {perspectives.map(pers => {
            const persItems = getItemsByPerspective(pers.key);
            const Icon = pers.icon;
            return (
              <div key={pers.key} className="card">
                <div className="card-header"><h3 className="text-white flex items-center gap-2"><Icon size={16} />{pers.label}</h3></div>
                <div className="overflow-x-auto">
                  {persItems.length === 0 ? (
                    <div className="p-6 text-center text-text-light text-sm">Chưa có mục tiêu</div>
                  ) : (
                    <table className="table">
                      <thead><tr><th>STT</th><th>Mã</th><th>Mục tiêu</th><th>Liên kết KPI</th><th>Thao tác</th></tr></thead>
                      <tbody>{persItems.map((item, i) => (<tr key={item.id}>
                        <td>{i + 1}</td>
                        <td className="font-mono text-xs">{item.code}</td>
                        <td className="font-medium text-sm">{item.name}</td>
                        <td className="text-sm text-text-light">{item.kpiLink || '-'}</td>
                        <td><div className="flex gap-1">
                          <button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button>
                        </div></td>
                      </tr>))}</tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Chỉnh sửa mục tiêu' : 'Thêm mục tiêu BSC'}>
        <Form initial={editItem} onSubmit={handleSave} />
      </Modal>
    </div>
  );
}

function Form({ initial, onSubmit }: { initial?: BscObjective | null; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { perspective: 'finance', code: '', name: '', description: '', kpiLink: '', status: 'active' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mã mục tiêu *</label><input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
        <div><label className="block text-sm font-medium mb-1">Tên mục tiêu *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Phối cảnh (Perspective)</label>
        <select value={f.perspective} onChange={e => setF({ ...f, perspective: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
          {perspectives.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>
      <div><label className="block text-sm font-medium mb-1">Liên kết KPI</label><input value={f.kpiLink} onChange={e => setF({ ...f, kpiLink: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Mã chỉ tiêu KPI liên quan" /></div>
      <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} /></div>
      <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
    </form>
  );
}
