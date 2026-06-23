'use client';

import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import kpiGroupsData from '@/data/kpi-groups.json';

interface JobPosition {
  id: string;
  name: string;
  code: string;
  description: string;
  kpiGroupId: string;
  approvalLevel: string;
  status: 'active' | 'inactive';
}

const groupNames: Record<string, string> = {};
(kpiGroupsData as { id: string; name: string }[]).forEach(g => { groupNames[g.id] = g.name; });

export default function JobPositionsPage() {
  const [items, setItems] = useState<JobPosition[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<JobPosition | null>(null);

  const load = useCallback(async () => {
    const data = await apiGet<JobPosition[]>('/api/job-positions');
    setItems(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Partial<JobPosition>) => {
    if (editItem) {
      await apiPut(`/api/job-positions/${editItem.id}`, data);
    } else {
      await apiPost('/api/job-positions', data);
    }
    setShowModal(false);
    setEditItem(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa vị trí việc làm này?')) return;
    await apiDelete(`/api/job-positions/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Vị trí việc làm</h1>
          <p className="text-text-light mt-1">Quản lý vị trí việc làm và nhóm KPI phù hợp</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm vị trí
        </button>
      </div>

      <div className="card">
        <div className="p-0">
          <div className="overflow-x-auto"><table className="table">
            <thead>
              <tr><th>ID</th><th>Mã</th><th>Tên vị trí</th><th>Nhóm KPI</th><th>Cấp duyệt</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><span className="badge badge-info">{item.id}</span></td>
                  <td className="font-mono text-xs">{item.code}</td>
                  <td className="font-medium">{item.name}</td>
                  <td className="text-sm">{groupNames[item.kpiGroupId] || '-'}</td>
                  <td className="text-sm">{item.approvalLevel || '-'}</td>
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
                <tr><td colSpan={7} className="text-center text-text-light text-sm py-8">Chưa có vị trí việc làm nào</td></tr>
              )}
            </tbody>
          </table></div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Sửa vị trí việc làm' : 'Thêm vị trí việc làm'}>
        <JobPositionForm position={editItem} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditItem(null); }} />
      </Modal>
    </div>
  );
}

function JobPositionForm({ position, onSubmit, onCancel }: { position: JobPosition | null; onSubmit: (data: Partial<JobPosition>) => void; onCancel: () => void }) {
  const [name, setName] = useState(position?.name || '');
  const [code, setCode] = useState(position?.code || '');
  const [description, setDescription] = useState(position?.description || '');
  const [kpiGroupId, setKpiGroupId] = useState(position?.kpiGroupId || '');
  const [approvalLevel, setApprovalLevel] = useState(position?.approvalLevel || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(position?.status || 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, code, description, kpiGroupId, approvalLevel, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Tên vị trí *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="VD: Giảng viên"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Mã *</label>
          <input type="text" value={code} onChange={e => setCode(e.target.value)} required placeholder="VD: GV"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Nhóm KPI chính</label>
          <select value={kpiGroupId} onChange={e => setKpiGroupId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="">-- Chọn nhóm KPI --</option>
            {Object.entries(groupNames).map(([id, gname]) => (
              <option key={id} value={id}>{gname}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Cấp phê duyệt</label>
          <select value={approvalLevel} onChange={e => setApprovalLevel(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="">-- Chọn --</option>
            <option value="Trưởng bộ môn">Trưởng bộ môn</option>
            <option value="Trưởng khoa">Trưởng khoa</option>
            <option value="Trưởng đơn vị">Trưởng đơn vị</option>
            <option value="Ban Giám hiệu">Ban Giám hiệu</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Mô tả nhiệm vụ</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
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
