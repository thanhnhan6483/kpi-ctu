'use client';

import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export default function AcademicYearsPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editYear, setEditYear] = useState<AcademicYear | null>(null);

  const load = useCallback(async () => {
    const y = await apiGet<AcademicYear[]>('/api/academic-years');
    setYears(y);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Partial<AcademicYear>) => {
    if (editYear) {
      await apiPut(`/api/academic-years/${editYear.id}`, data);
    } else {
      await apiPost('/api/academic-years', data);
    }
    setShowModal(false);
    setEditYear(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa năm học này?')) return;
    await apiDelete(`/api/academic-years/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý năm học</h1>
          <p className="text-text-light mt-1">Quản lý các năm học trong hệ thống</p>
        </div>
        <button onClick={() => { setEditYear(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm năm học
        </button>
      </div>

      <div className="card">
        <div className="p-0">
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Tên năm học</th><th>Bắt đầu</th><th>Kết thúc</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {years.map(ay => (
                <tr key={ay.id}>
                  <td><span className="badge badge-info">{ay.id}</span></td>
                  <td className="font-medium">{ay.name}</td>
                  <td className="text-sm">{new Date(ay.startDate).toLocaleDateString('vi-VN')}</td>
                  <td className="text-sm">{new Date(ay.endDate).toLocaleDateString('vi-VN')}</td>
                  <td>
                    {ay.status === 'active' ? (
                      <span className="badge badge-success">Hiện tại</span>
                    ) : (
                      <span className="badge badge-warning">Ẩn</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditYear(ay); setShowModal(true); }} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(ay.id)} className="p-1 text-accent-red hover:bg-accent-red/10 rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {years.length === 0 && (
                <tr><td colSpan={6} className="text-center text-text-light text-sm py-8">Chưa có năm học nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditYear(null); }} title={editYear ? 'Sửa năm học' : 'Thêm năm học'}>
        <AcademicYearForm year={editYear} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditYear(null); }} />
      </Modal>
    </div>
  );
}

function AcademicYearForm({ year, onSubmit, onCancel }: { year: AcademicYear | null; onSubmit: (data: Partial<AcademicYear>) => void; onCancel: () => void }) {
  const [name, setName] = useState(year?.name || '');
  const [startDate, setStartDate] = useState(year?.startDate || '');
  const [endDate, setEndDate] = useState(year?.endDate || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(year?.status || 'inactive');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, startDate, endDate, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Tên năm học *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="VD: 2025-2026"
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Bắt đầu *</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Kết thúc *</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Trạng thái</label>
        <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
          <option value="inactive">Ẩn</option>
          <option value="active">Hiện tại</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
        <button type="submit" className="btn-primary">{year ? 'Cập nhật' : 'Thêm mới'}</button>
      </div>
    </form>
  );
}
