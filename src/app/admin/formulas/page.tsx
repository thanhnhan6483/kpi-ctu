'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, FunctionSquare } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface Formula {
  id: string;
  code: string;
  name: string;
  expression: string;
  description: string;
  status: string;
}

export default function FormulasPage() {
  const [items, setItems] = useState<Formula[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Formula | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<Formula[]>('/api/formulas');
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: any) => {
    if (editItem) {
      await apiPut(`/api/formulas/${editItem.id}`, data);
    } else {
      await apiPost('/api/formulas', data);
    }
    setShowModal(false); setEditItem(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa công thức này?')) return;
    await apiDelete(`/api/formulas/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Công thức tính</h1>
          <p className="text-text-light mt-1">Quản lý công thức tính điểm KPI (II.8)</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm mới
        </button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách công thức</h3></div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-text-light">Đang tải...</div>
          ) : (
            <table className="table">
              <thead><tr><th>STT</th><th>Mã</th><th>Tên công thức</th><th>Biểu thức</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>{items.length === 0 ? <tr><td colSpan={7} className="text-center py-8">Không có dữ liệu</td></tr> :
                items.map((item, i) => (<tr key={item.id}>
                  <td>{i + 1}</td>
                  <td className="font-mono text-xs">{item.code}</td>
                  <td className="font-medium">{item.name}</td>
                  <td><code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-primary">{item.expression}</code></td>
                  <td className="text-sm text-text-light">{item.description}</td>
                  <td><span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{item.status === 'active' ? 'Đang dùng' : 'Ngừng'}</span></td>
                  <td><div className="flex gap-1"><button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button><button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button></div></td>
                </tr>))}</tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Chỉnh sửa công thức' : 'Thêm công thức'}>
        <Form initial={editItem} onSubmit={handleSave} />
      </Modal>
    </div>
  );
}

function Form({ initial, onSubmit }: { initial?: Formula | null; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { code: '', name: '', expression: '', description: '', status: 'active' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mã công thức *</label><input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
        <div><label className="block text-sm font-medium mb-1">Tên công thức *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Biểu thức *</label><textarea value={f.expression} onChange={e => setF({ ...f, expression: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" rows={3} placeholder="VD: actual / target * 100" required /></div>
      <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
      <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
    </form>
  );
}
