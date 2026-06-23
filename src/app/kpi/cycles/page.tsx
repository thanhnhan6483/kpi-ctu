'use client';

import { RefreshCw, Plus, Edit, Trash2, Play, Pause, StopCircle, Calendar, Clock } from 'lucide-react';
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
  status: 'draft' | 'active' | 'paused' | 'locked';
  registrationDeadline?: string;
  approvalDeadline?: string;
  progressDeadline?: string;
  selfEvalDeadline?: string;
  managerEvalDeadline?: string;
  councilReviewDeadline?: string;
  complaintDeadline?: string;
  lockDeadline?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nháp', color: 'bg-gray-100 text-gray-600' },
  active: { label: 'Đang hoạt động', color: 'bg-green-100 text-green-700' },
  paused: { label: 'Tạm dừng', color: 'bg-yellow-100 text-yellow-700' },
  locked: { label: 'Đã khóa', color: 'bg-red-100 text-red-600' },
};

export default function CyclesPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [cycles, setCycles] = useState<KPICycle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [editCycle, setEditCycle] = useState<KPICycle | null>(null);
  const [selectedYearId, setSelectedYearId] = useState('');

  const load = useCallback(async () => {
    const [y, c] = await Promise.all([
      apiGet<AcademicYear[]>('/api/academic-years'),
      apiGet<KPICycle[]>('/api/cycles'),
    ]);
    setYears(y);
    setCycles(c);
    if (!selectedYearId) {
      const active = y.find(ay => ay.status === 'active');
      if (active) setSelectedYearId(active.id);
    }
  }, [selectedYearId]);

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

  const handleSaveTimeline = async (data: Partial<KPICycle>) => {
    if (!editCycle) return;
    await apiPut(`/api/cycles/${editCycle.id}`, data);
    setShowTimeline(false);
    setEditCycle(null);
    load();
  };

  const handleStatusChange = async (cycle: KPICycle, newStatus: string) => {
    const actions: Record<string, string> = {
      active: 'Kích hoạt',
      paused: 'Tạm dừng',
      draft: 'Mở lại',
      locked: 'Kết thúc & khóa',
    };
    if (!confirm(`${actions[newStatus]} chu kỳ "${cycle.name}"?`)) return;
    await apiPut(`/api/cycles/${cycle.id}`, { status: newStatus });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa chu kỳ này?')) return;
    await apiDelete(`/api/cycles/${id}`);
    load();
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'draft': return { label: 'Kích hoạt', action: 'active', icon: Play, color: 'text-green-600 hover:bg-green-50' };
      case 'active': return { label: 'Tạm dừng', action: 'paused', icon: Pause, color: 'text-yellow-600 hover:bg-yellow-50' };
      case 'paused': return { label: 'Mở lại', action: 'active', icon: Play, color: 'text-green-600 hover:bg-green-50' };
      case 'locked': return null;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark flex items-center gap-2">
            <Clock size={24} /> Chu kỳ KPI
          </h1>
          <p className="text-text-light mt-1">Quản lý chu kỳ đánh giá KPI theo năm học</p>
        </div>
        <button onClick={() => { setEditCycle(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm chu kỳ
        </button>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách chu kỳ</h3></div>
        <div className="p-4">
          <div className="flex gap-2 mb-4 flex-wrap">
            {years.map(ay => (
              <button
                key={ay.id}
                onClick={() => setSelectedYearId(ay.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedYearId === ay.id ? 'bg-primary text-white' : 'bg-bg-cream text-text-dark hover:bg-primary-light'
                }`}
              >
                {ay.name}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-cream">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">STT</th>
                  <th className="text-left px-4 py-3 font-medium">Tên chu kỳ</th>
                  <th className="text-left px-4 py-3 font-medium">Thời gian</th>
                  <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                  <th className="text-left px-4 py-3 font-medium">Lịch xử lý</th>
                  <th className="text-right px-4 py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cyclesForYear.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-text-light">Chưa có chu kỳ nào</td></tr>
                ) : cyclesForYear.map((cycle, idx) => {
                  const next = getNextAction(cycle.status);
                  return (
                    <tr key={cycle.id} className="hover:bg-bg-cream/50">
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium">{cycle.name}</td>
                      <td className="px-4 py-3 text-xs text-text-light">
                        {cycle.startDate} → {cycle.endDate}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[cycle.status]?.color}`}>
                          {statusConfig[cycle.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {cycle.registrationDeadline ? (
                          <div className="text-xs text-text-light space-y-0.5">
                            <div>Đăng ký: {cycle.registrationDeadline}</div>
                            <div>Duyệt: {cycle.approvalDeadline}</div>
                            <div>Đánh giá: {cycle.selfEvalDeadline}</div>
                            <div>Khóa: {cycle.lockDeadline}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-text-light italic">Chưa cấu hình</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditCycle(cycle); setShowTimeline(true); }} className="p-1.5 hover:bg-blue-50 rounded" title="Cấu hình lịch">
                            <Calendar size={14} className="text-blue-600" />
                          </button>
                          <button onClick={() => { setEditCycle(cycle); setShowModal(true); }} className="p-1.5 hover:bg-blue-50 rounded" title="Chỉnh sửa">
                            <Edit size={14} className="text-blue-600" />
                          </button>
                          {next && (
                            <button onClick={() => handleStatusChange(cycle, next.action)} className={`p-1.5 rounded ${next.color}`} title={next.label}>
                              <next.icon size={14} />
                            </button>
                          )}
                          {cycle.status === 'active' && (
                            <button onClick={() => handleStatusChange(cycle, 'locked')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Kết thúc & khóa">
                              <StopCircle size={14} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(cycle.id)} className="p-1.5 hover:bg-red-50 rounded" title="Xóa">
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditCycle(null); }} title={editCycle ? 'Chỉnh sửa chu kỳ' : 'Thêm chu kỳ mới'}>
        <CycleForm
          initial={editCycle || { academicYearId: selectedYearId, name: '', startDate: '', endDate: '', status: 'draft' }}
          onSubmit={handleSave}
          years={years}
        />
      </Modal>

      <Modal isOpen={showTimeline} onClose={() => { setShowTimeline(false); setEditCycle(null); }} title="Cấu hình lịch xử lý chu kỳ">
        {editCycle && <TimelineForm initial={editCycle} onSubmit={handleSaveTimeline} />}
      </Modal>
    </div>
  );
}

function CycleForm({ initial, onSubmit, years }: { initial: Partial<KPICycle>; onSubmit: (d: Partial<KPICycle>) => void; years: AcademicYear[] }) {
  const [form, setForm] = useState(initial);
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Năm học *</label>
        <select value={form.academicYearId || ''} onChange={e => setForm({ ...form, academicYearId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required>
          <option value="">-- Chọn năm học --</option>
          {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tên chu kỳ *</label>
        <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="VD: Kỳ đánh giá học kỳ 1" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ngày bắt đầu *</label>
          <input type="date" value={form.startDate || ''} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ngày kết thúc *</label>
          <input type="date" value={form.endDate || ''} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Lưu</button>
      </div>
    </form>
  );
}

function TimelineForm({ initial, onSubmit }: { initial: KPICycle; onSubmit: (d: Partial<KPICycle>) => void }) {
  const [form, setForm] = useState({
    registrationDeadline: initial.registrationDeadline || '',
    approvalDeadline: initial.approvalDeadline || '',
    progressDeadline: initial.progressDeadline || '',
    selfEvalDeadline: initial.selfEvalDeadline || '',
    managerEvalDeadline: initial.managerEvalDeadline || '',
    councilReviewDeadline: initial.councilReviewDeadline || '',
    complaintDeadline: initial.complaintDeadline || '',
    lockDeadline: initial.lockDeadline || '',
  });

  const deadlines = [
    { key: 'registrationDeadline', label: 'Hạn đăng ký KPI' },
    { key: 'approvalDeadline', label: 'Hạn phê duyệt kế hoạch' },
    { key: 'progressDeadline', label: 'Hạn cập nhật tiến độ' },
    { key: 'selfEvalDeadline', label: 'Hạn tự đánh giá' },
    { key: 'managerEvalDeadline', label: 'Hạn đánh giá cấp trên' },
    { key: 'councilReviewDeadline', label: 'Hạn hội đồng rà soát' },
    { key: 'complaintDeadline', label: 'Hạn khiếu nại' },
    { key: 'lockDeadline', label: 'Hạn khóa kết quả' },
  ];

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <p className="text-sm text-text-light">Cấu hình hạn chót cho từng bước xử lý trong chu kỳ.</p>
      {deadlines.map(d => (
        <div key={d.key}>
          <label className="block text-sm font-medium mb-1">{d.label}</label>
          <input
            type="date"
            value={(form as Record<string, string>)[d.key] || ''}
            onChange={e => setForm({ ...form, [d.key]: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Lưu lịch xử lý</button>
      </div>
    </form>
  );
}
