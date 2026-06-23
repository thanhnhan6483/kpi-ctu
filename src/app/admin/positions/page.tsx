'use client';

import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface Position {
  id: string;
  name: string;
  code: string;
  level: string;
  category: string;
  status: 'active' | 'inactive';
}

export default function PositionsPage() {
  const [items, setItems] = useState<Position[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Position | null>(null);

  const load = useCallback(async () => {
    const data = await apiGet<Position[]>('/api/positions');
    setItems(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Partial<Position>) => {
    if (editItem) {
      await apiPut(`/api/positions/${editItem.id}`, data);
    } else {
      await apiPost('/api/positions', data);
    }
    setShowModal(false);
    setEditItem(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa chức vụ này?')) return;
    await apiDelete(`/api/positions/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Chức vụ / Chức danh</h1>
          <p className="text-text-light mt-1">Quản lý danh mục chức vụ, chức danh trong hệ thống</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm chức vụ
        </button>
      </div>

      <div className="card">
        <div className="p-0">
          <div className="overflow-x-auto"><table className="table">
            <thead>
              <tr><th>ID</th><th>Mã</th><th>Tên chức vụ</th><th>Cấp bậc</th><th>Nhóm</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><span className="badge badge-info">{item.id}</span></td>
                  <td className="font-mono text-xs">{item.code}</td>
                  <td className="font-medium">{item.name}</td>
                  <td className="text-sm">{item.level}</td>
                  <td className="text-sm">{item.category}</td>
                  <td>
                    {item.status === 'active' ? (
                      <span className="badge badge-success">Đang dùng</span>
                    ) : (
                      <span className="badge badge-warning">Ngừng dùng</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1 text-accent-red hover:bg-accent-red/10 rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} className="text-center text-text-light text-sm py-8">Chưa có chức vụ nào</td></tr>
              )}
            </tbody>
          </table></div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Sửa chức vụ' : 'Thêm chức vụ'}>
        <PositionForm position={editItem} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditItem(null); }} />
      </Modal>
    </div>
  );
}

function PositionForm({ position, onSubmit, onCancel }: { position: Position | null; onSubmit: (data: Partial<Position>) => void; onCancel: () => void }) {
  const [name, setName] = useState(position?.name || '');
  const [code, setCode] = useState(position?.code || '');
  const [level, setLevel] = useState(position?.level || '');
  const [category, setCategory] = useState(position?.category || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(position?.status || 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, code, level, category, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Tên chức vụ *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="VD: Giáo sư"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Mã *</label>
          <input type="text" value={code} onChange={e => setCode(e.target.value)} required placeholder="VD: GS"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Cấp bậc</label>
          <input type="text" value={level} onChange={e => setLevel(e.target.value)} placeholder="VD: Cao nhất"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Nhóm chức danh</label>
          <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="VD: Giảng viên, Quản lý"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Trạng thái</label>
        <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
          <option value="active">Đang dùng</option>
          <option value="inactive">Ngừng dùng</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
        <button type="submit" className="btn-primary">{position ? 'Cập nhật' : 'Thêm mới'}</button>
      </div>
    </form>
  );
}
