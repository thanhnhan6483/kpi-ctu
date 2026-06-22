'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface SlaConfig {
  id: string;
  code: string;
  name: string;
  processName: string;
  responseHours: number;
  resolveHours: number;
  description: string;
  status: string;
}

export default function SlaConfigsPage() {
  const [items, setItems] = useState<SlaConfig[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<SlaConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<SlaConfig[]>('/api/sla-configs');
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: any) => {
    if (editItem) {
      await apiPut(`/api/sla-configs/${editItem.id}`, data);
    } else {
      await apiPost('/api/sla-configs', data);
    }
    setShowModal(false); setEditItem(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa SLA này?')) return;
    await apiDelete(`/api/sla-configs/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">SLA xử lý</h1>
          <p className="text-text-light mt-1">Quản lý cam kết thời gian xử lý công việc (XXI.18)</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm mới
        </button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách SLA</h3></div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-text-light">Đang tải...</div>
          ) : (
            <table className="table">
              <thead><tr><th>STT</th><th>Mã</th><th>Tên SLA</th><th>Quy trình</th><th>Phản hồi (giờ)</th><th>Xử lý (giờ)</th><th>Mô tả</th><th>Thao tác</th></tr></thead>
              <tbody>{items.length === 0 ? <tr><td colSpan={8} className="text-center py-8">Không có dữ liệu</td></tr> :
                items.map((item, i) => (<tr key={item.id}>
                  <td>{i + 1}</td>
                  <td className="font-mono text-xs">{item.code}</td>
                  <td className="font-medium flex items-center gap-2"><Clock size={14} className="text-primary" />{item.name}</td>
                  <td className="text-sm">{item.processName}</td>
                  <td><span className="badge badge-info">{item.responseHours}h</span></td>
                  <td><span className="badge badge-warning">{item.resolveHours}h</span></td>
                  <td className="text-sm text-text-light">{item.description}</td>
                  <td><div className="flex gap-1"><button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button><button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button></div></td>
                </tr>))}</tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Chỉnh sửa SLA' : 'Thêm SLA'}>
        <Form initial={editItem} onSubmit={handleSave} />
      </Modal>
    </div>
  );
}

function Form({ initial, onSubmit }: { initial?: SlaConfig | null; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { code: '', name: '', processName: '', responseHours: 4, resolveHours: 24, description: '', status: 'active' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mã SLA *</label><input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
        <div><label className="block text-sm font-medium mb-1">Tên SLA *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Quy trình *</label><input value={f.processName} onChange={e => setF({ ...f, processName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Thời gian phản hồi (giờ)</label><input type="number" value={f.responseHours} onChange={e => setF({ ...f, responseHours: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Thời gian xử lý (giờ)</label><input type="number" value={f.resolveHours} onChange={e => setF({ ...f, resolveHours: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
      <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
    </form>
  );
}
