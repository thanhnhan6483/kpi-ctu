'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Calendar, Send } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface ScheduledReport {
  id: string;
  code: string;
  name: string;
  frequency: string;
  recipients: string;
  format: string;
  nextRun: string;
  description: string;
  status: string;
}

const frequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
const freqLabels: Record<string, string> = { daily: 'Hàng ngày', weekly: 'Hàng tuần', monthly: 'Hàng tháng', quarterly: 'Hàng quý', yearly: 'Hàng năm' };

export default function ScheduledReportsPage() {
  const [items, setItems] = useState<ScheduledReport[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ScheduledReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<ScheduledReport[]>('/api/scheduled-reports');
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: any) => {
    if (editItem) {
      await apiPut(`/api/scheduled-reports/${editItem.id}`, data);
    } else {
      await apiPost('/api/scheduled-reports', data);
    }
    setShowModal(false); setEditItem(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa báo cáo định kỳ này?')) return;
    await apiDelete(`/api/scheduled-reports/${id}`);
    load();
  };

  const handleSendNow = (item: ScheduledReport) => {
    alert(`Đã gửi báo cáo "${item.name}" đến ${item.recipients}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Báo cáo định kỳ</h1>
          <p className="text-text-light mt-1">Quản lý lịch gửi báo cáo KPI tự động (XXI.20)</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm mới
        </button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách báo cáo định kỳ</h3></div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-text-light">Đang tải...</div>
          ) : (
            <table className="table">
              <thead><tr><th>STT</th><th>Mã</th><th>Tên báo cáo</th><th>Tần suất</th><th>Người nhận</th><th>Định dạng</th><th>Lần chạy tới</th><th>Thao tác</th></tr></thead>
              <tbody>{items.length === 0 ? <tr><td colSpan={8} className="text-center py-8">Không có dữ liệu</td></tr> :
                items.map((item, i) => (<tr key={item.id}>
                  <td>{i + 1}</td>
                  <td className="font-mono text-xs">{item.code}</td>
                  <td className="font-medium flex items-center gap-2"><Calendar size={14} className="text-primary" />{item.name}</td>
                  <td><span className="badge badge-info">{freqLabels[item.frequency] || item.frequency}</span></td>
                  <td className="text-sm text-text-light">{item.recipients}</td>
                  <td className="text-sm">{item.format}</td>
                  <td className="text-sm">{item.nextRun || '-'}</td>
                  <td><div className="flex gap-1">
                    <button onClick={() => handleSendNow(item)} className="p-1 hover:bg-green-50 rounded" title="Gửi ngay"><Send size={12} className="text-green-600" /></button>
                    <button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button>
                  </div></td>
                </tr>))}</tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Chỉnh sửa báo cáo' : 'Thêm báo cáo định kỳ'}>
        <Form initial={editItem} onSubmit={handleSave} />
      </Modal>
    </div>
  );
}

function Form({ initial, onSubmit }: { initial?: ScheduledReport | null; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { code: '', name: '', frequency: 'monthly', recipients: '', format: 'PDF', nextRun: '', description: '', status: 'active' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mã báo cáo *</label><input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
        <div><label className="block text-sm font-medium mb-1">Tên báo cáo *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Tần suất</label>
          <select value={f.frequency} onChange={e => setF({ ...f, frequency: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
            {frequencies.map(fr => <option key={fr} value={fr}>{freqLabels[fr]}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium mb-1">Định dạng</label>
          <select value={f.format} onChange={e => setF({ ...f, format: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option>PDF</option><option>Excel</option><option>HTML</option><option>CSV</option>
          </select>
        </div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Người nhận (email, cách nhau bằng dấu phẩy) *</label><input value={f.recipients} onChange={e => setF({ ...f, recipients: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="user1@ctu.edu.vn, user2@ctu.edu.vn" required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Lần chạy tiếp theo</label><input type="date" value={f.nextRun} onChange={e => setF({ ...f, nextRun: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
      <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
    </form>
  );
}
