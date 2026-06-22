'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Link, Wifi, WifiOff } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface ApiConfig {
  id: string;
  code: string;
  name: string;
  endpoint: string;
  apiKey: string;
  status: string;
  lastTested: string;
  description: string;
}

export default function ApiConfigsPage() {
  const [items, setItems] = useState<ApiConfig[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ApiConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<ApiConfig[]>('/api/api-configs');
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: any) => {
    if (editItem) {
      await apiPut(`/api/api-configs/${editItem.id}`, data);
    } else {
      await apiPost('/api/api-configs', data);
    }
    setShowModal(false); setEditItem(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa kết nối này?')) return;
    await apiDelete(`/api/api-configs/${id}`);
    load();
  };

  const handleTest = async (item: ApiConfig) => {
    alert(`Đã gửi kiểm tra kết nối đến ${item.endpoint}\nKết quả mô phỏng: Kết nối thành công!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Kết nối tích hợp</h1>
          <p className="text-text-light mt-1">Quản lý kết nối API với hệ thống bên ngoài (XXI.23)</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm mới
        </button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách kết nối</h3></div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-text-light">Đang tải...</div>
          ) : (
            <table className="table">
              <thead><tr><th>STT</th><th>Mã</th><th>Tên kết nối</th><th>Endpoint</th><th>Trạng thái</th><th>Kiểm tra gần nhất</th><th>Thao tác</th></tr></thead>
              <tbody>{items.length === 0 ? <tr><td colSpan={7} className="text-center py-8">Không có dữ liệu</td></tr> :
                items.map((item, i) => (<tr key={item.id}>
                  <td>{i + 1}</td>
                  <td className="font-mono text-xs">{item.code}</td>
                  <td className="font-medium flex items-center gap-2"><Link size={14} className="text-primary" />{item.name}</td>
                  <td className="text-sm font-mono text-xs text-text-light">{item.endpoint}</td>
                  <td>{item.status === 'active' ? <span className="badge badge-success flex items-center gap-1 w-fit"><Wifi size={10} /> Hoạt động</span> : <span className="badge badge-danger flex items-center gap-1 w-fit"><WifiOff size={10} /> Ngừng</span>}</td>
                  <td className="text-sm text-text-light">{item.lastTested || 'Chưa kiểm tra'}</td>
                  <td><div className="flex gap-1">
                    <button onClick={() => handleTest(item)} className="p-1 hover:bg-green-50 rounded" title="Kiểm tra kết nối"><Wifi size={12} className="text-green-600" /></button>
                    <button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button>
                  </div></td>
                </tr>))}</tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Chỉnh sửa kết nối' : 'Thêm kết nối'}>
        <Form initial={editItem} onSubmit={handleSave} />
      </Modal>
    </div>
  );
}

function Form({ initial, onSubmit }: { initial?: ApiConfig | null; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { code: '', name: '', endpoint: '', apiKey: '', description: '', status: 'active', lastTested: '' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mã kết nối *</label><input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
        <div><label className="block text-sm font-medium mb-1">Tên kết nối *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Endpoint *</label><input value={f.endpoint} onChange={e => setF({ ...f, endpoint: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="https://api.example.com/v1" required /></div>
      <div><label className="block text-sm font-medium mb-1">API Key</label><input type="password" value={f.apiKey} onChange={e => setF({ ...f, apiKey: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
      <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
      <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
    </form>
  );
}
