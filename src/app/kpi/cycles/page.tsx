'use client';

import { RefreshCw, Plus, Edit, Trash2 } from 'lucide-react';
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

interface KPICycle {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'locked';
}

export default function CyclesPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [cycles, setCycles] = useState<KPICycle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editCycle, setEditCycle] = useState<KPICycle | null>(null);
  const [selectedYearId, setSelectedYearId] = useState('');

  const load = useCallback(async () => {
    const [y, c] = await Promise.all([
      apiGet<AcademicYear[]>('/api/academic-years'),
      apiGet<KPICycle[]>('/api/cycles'),
    ]);
    setYears(y);
    setCycles(c);
    const active = y.find(ay => ay.status === 'active');
    if (active) setSelectedYearId(active.id);
  }, []);

  useEffect(() => { load(); }, [load]);

  const cyclesForYear = cycles.filter(c => c.academicYearId === selectedYearId);

  const handleSave = async (data: Partial<KPICycle>) => {
    if (editCycle) {
      await apiPut(`/api/cycles/${editCycle.id}`, data);
    } else {
      await apiPost('/api/cycles', data);
    }
    setShowModal(false);
    setEditCycle(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa chu kỳ này?')) return;
    await apiDelete(`/api/cycles/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Chu kỳ KPI</h1>
          <p className="text-text-light mt-1">Quản lý các chu kỳ đánh giá KPI theo năm học</p>
        </div>
        <button onClick={() => { setEditCycle(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm chu kỳ
        </button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách chu kỳ</h3></div>
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            {years.map(ay => (
              <button key={ay.id} onClick={() => setSelectedYearId(ay.id)}
                className={`px-3 py-1 rounded text-sm ${selectedYearId === ay.id ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark'}`}>
                {ay.name}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto"><table className="table">
            <thead>
              <tr><th>ID</th><th>Tên chu kỳ</th><th>Bắt đầu</th><th>Kết thúc</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {cyclesForYear.map(c => (
                <tr key={c.id}>
                  <td><span className="badge badge-info">{c.id}</span></td>
                  <td className="font-medium">{c.name}</td>
                  <td className="text-sm">{new Date(c.startDate).toLocaleDateString('vi-VN')}</td>
                  <td className="text-sm">{new Date(c.endDate).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className={`badge ${c.status === 'active' ? 'badge-success' : c.status === 'locked' ? 'badge-danger' : 'badge-warning'}`}>
                      {c.status === 'active' ? 'Hoạt động' : c.status === 'locked' ? 'Đã khóa' : 'Nháp'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditCycle(c); setShowModal(true); }} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1 text-accent-red hover:bg-accent-red/10 rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {cyclesForYear.length === 0 && (
                <tr><td colSpan={6} className="text-center text-text-light text-sm py-8">Chưa có chu kỳ nào cho năm học này</td></tr>
              )}
            </tbody>
          </table></div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditCycle(null); }} title={editCycle ? 'Sửa chu kỳ' : 'Thêm chu kỳ'}>
        <CycleForm cycle={editCycle} years={years} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditCycle(null); }} />
      </Modal>
    </div>
  );
}

function CycleForm({ cycle, years, onSubmit, onCancel }: { cycle: KPICycle | null; years: AcademicYear[]; onSubmit: (data: Partial<KPICycle>) => void; onCancel: () => void }) {
  const [academicYearId, setAcademicYearId] = useState(cycle?.academicYearId || years.find(y => y.status === 'active')?.id || '');
  const [name, setName] = useState(cycle?.name || '');
  const [startDate, setStartDate] = useState(cycle?.startDate || '');
  const [endDate, setEndDate] = useState(cycle?.endDate || '');
  const [status, setStatus] = useState(cycle?.status || 'draft');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ academicYearId, name, startDate, endDate, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Thuộc năm học *</label>
        <select value={academicYearId} onChange={e => setAcademicYearId(e.target.value)} required
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
          <option value="">-- Chọn năm học --</option>
          {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Tên chu kỳ *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="VD: Học kỳ 1 - 2025-2026"
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
        <select value={status} onChange={e => setStatus(e.target.value as 'draft' | 'active' | 'locked')}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
          <option value="draft">Nháp</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Đã khóa</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
        <button type="submit" className="btn-primary">{cycle ? 'Cập nhật' : 'Thêm mới'}</button>
      </div>
    </form>
  );
}
