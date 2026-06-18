'use client';

import { Settings, Save, RefreshCw, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
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

export default function SettingsPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [cycles, setCycles] = useState<KPICycle[]>([]);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [editYear, setEditYear] = useState<AcademicYear | null>(null);
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

  const handleSaveYear = async (data: Partial<AcademicYear>) => {
    if (editYear) {
      await apiPut(`/api/academic-years/${editYear.id}`, data);
    } else {
      await apiPost('/api/academic-years', data);
    }
    setShowYearModal(false);
    setEditYear(null);
    load();
  };

  const handleDeleteYear = async (id: string) => {
    if (!confirm('Xóa năm học này?')) return;
    await apiDelete(`/api/academic-years/${id}`);
    load();
  };

  const handleSaveCycle = async (data: Partial<KPICycle>) => {
    if (editCycle) {
      await apiPut(`/api/cycles/${editCycle.id}`, data);
    } else {
      await apiPost('/api/cycles', data);
    }
    setShowCycleModal(false);
    setEditCycle(null);
    load();
  };

  const handleDeleteCycle = async (id: string) => {
    if (!confirm('Xóa chu kỳ này?')) return;
    await apiDelete(`/api/cycles/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Cài đặt hệ thống</h1>
          <p className="text-text-light mt-1">Quản lý cấu hình chung</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header"><h3 className="text-white">Thông tin hệ thống</h3></div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Tên hệ thống</label>
              <input type="text" defaultValue="Hệ thống KPI - Đại học Cần Thơ"
                className="w-full px-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Email liên hệ</label>
              <input type="email" defaultValue="kpi@ctu.edu.vn"
                className="w-full px-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="text-white">Cấu hình KPI</h3></div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Điểm tối đa (cap rate)</label>
              <input type="number" defaultValue={120}
                className="w-full px-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
              <p className="text-xs text-text-light mt-1">Giới hạn điểm vượt chỉ tiêu (mặc định: 120%)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Ngưỡng xếp loại</label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2"><span className="w-20">Xuất sắc:</span><input type="number" defaultValue={90} className="w-20 px-2 py-1 border rounded" />điểm</div>
                <div className="flex items-center gap-2"><span className="w-20">Tốt:</span><input type="number" defaultValue={80} className="w-20 px-2 py-1 border rounded" />điểm</div>
                <div className="flex items-center gap-2"><span className="w-20">Đạt:</span><input type="number" defaultValue={65} className="w-20 px-2 py-1 border rounded" />điểm</div>
                <div className="flex items-center gap-2"><span className="w-20">Cải thiện:</span><input type="number" defaultValue={50} className="w-20 px-2 py-1 border rounded" />điểm</div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Hệ số minh chứng</label>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2"><span>Hợp lệ:</span><input type="number" defaultValue={1} step={0.1} className="w-16 px-2 py-1 border rounded" /></div>
                <div className="flex items-center gap-2"><span>Thiếu:</span><input type="number" defaultValue={0.5} step={0.1} className="w-16 px-2 py-1 border rounded" /></div>
                <div className="flex items-center gap-2"><span>Không có:</span><input type="number" defaultValue={0} step={0.1} className="w-16 px-2 py-1 border rounded" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-white">Quản lý năm học</h3>
          <button onClick={() => { setEditYear(null); setShowYearModal(true); }} className="btn-primary text-xs flex items-center gap-1">
            <Plus size={14} /> Thêm năm học
          </button>
        </div>
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
                      <button onClick={() => { setEditYear(ay); setShowYearModal(true); }} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteYear(ay.id)} className="p-1 text-accent-red hover:bg-accent-red/10 rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-white">Chu kỳ KPI</h3>
          <button onClick={() => { setEditCycle(null); setShowCycleModal(true); }} className="btn-primary text-xs flex items-center gap-1">
            <Plus size={14} /> Thêm chu kỳ
          </button>
        </div>
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            {years.map(ay => (
              <button key={ay.id} onClick={() => setSelectedYearId(ay.id)}
                className={`px-3 py-1 rounded text-sm ${selectedYearId === ay.id ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark'}`}>
                {ay.name}
              </button>
            ))}
          </div>
          <table className="table">
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
                      <button onClick={() => { setEditCycle(c); setShowCycleModal(true); }} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteCycle(c.id)} className="p-1 text-accent-red hover:bg-accent-red/10 rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {cyclesForYear.length === 0 && (
                <tr><td colSpan={6} className="text-center text-text-light text-sm py-8">Chưa có chu kỳ nào cho năm học này</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Dữ liệu hệ thống</h3></div>
        <div className="p-4">
          <div className="flex gap-4">
            <button className="btn-secondary flex items-center gap-2"><RefreshCw size={16} /> Đồng bộ dữ liệu mẫu</button>
            <button className="btn-secondary flex items-center gap-2"><Settings size={16} /> Đặt lại cấu hình</button>
          </div>
          <p className="text-xs text-text-light mt-4">Dữ liệu hiện tại: {years.length} năm học, {cycles.length} chu kỳ</p>
        </div>
      </div>

      <Modal isOpen={showYearModal} onClose={() => { setShowYearModal(false); setEditYear(null); }} title={editYear ? 'Sửa năm học' : 'Thêm năm học'}>
        <AcademicYearForm year={editYear} onSubmit={handleSaveYear} onCancel={() => { setShowYearModal(false); setEditYear(null); }} />
      </Modal>

      <Modal isOpen={showCycleModal} onClose={() => { setShowCycleModal(false); setEditCycle(null); }} title={editCycle ? 'Sửa chu kỳ' : 'Thêm chu kỳ'}>
        <CycleForm cycle={editCycle} years={years} onSubmit={handleSaveCycle} onCancel={() => { setShowCycleModal(false); setEditCycle(null); }} />
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
