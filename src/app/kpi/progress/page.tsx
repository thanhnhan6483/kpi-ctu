'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Edit, CheckCircle, AlertTriangle, Search, Plus, Trash2, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import indicatorsData from '@/data/indicators.json';
import unitsData from '@/data/units.json';

interface ProgressRecord {
  id: string;
  indicatorId: string;
  indicatorName: string;
  unitId: string;
  unitName: string;
  targetValue: number;
  actualValue: number;
  unit: string;
  progressPercent: number;
  lastUpdated: string;
  updatedBy: string;
  note: string;
  cycleName: string;
}

const groups = ['Tất cả', 'Đào tạo', 'KHCN', 'Đội ngũ', 'Quốc tế', 'CĐS', 'Phục vụ'];

export default function ProgressPage() {
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('Tất cả');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ProgressRecord | null>(null);
  const [indicatorFilter, setIndicatorFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [validCycleNames, setValidCycleNames] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const iid = params.get('indicatorId');
    if (iid) setIndicatorFilter(iid);
  }, []);

  useEffect(() => {
    const yearId = localStorage.getItem('selectedAcademicYear');
    if (yearId) {
      fetch(`/api/cycles?academicYearId=${yearId}`)
        .then(r => r.json())
        .then(data => setValidCycleNames(data.map((c: any) => c.name)))
        .catch(() => {});
    }
  }, []);

  const loadRecords = useCallback(async () => {
    try {
      const data = await apiGet<ProgressRecord[]>('/api/progress');
      setRecords(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const cycleFilteredRecords = validCycleNames.length > 0
    ? records.filter(p => validCycleNames.includes(p.cycleName))
    : records;

  const filtered = cycleFilteredRecords.filter((p) => {
    const matchesSearch = p.indicatorName.toLowerCase().includes(searchTerm.toLowerCase()) || p.indicatorId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndicator = !indicatorFilter || p.indicatorId === indicatorFilter;
    return matchesSearch && matchesIndicator;
  });

  const achievedCount = cycleFilteredRecords.filter((p) => p.progressPercent >= 100).length;
  const warningCount = cycleFilteredRecords.filter((p) => p.progressPercent >= 80 && p.progressPercent < 100).length;
  const notAchievedCount = cycleFilteredRecords.filter((p) => p.progressPercent < 80).length;

  const handleCreate = async (data: Partial<ProgressRecord>) => {
    await apiPost('/api/progress', data);
    setShowCreate(false);
    loadRecords();
  };

  const handleUpdate = async (data: Partial<ProgressRecord>) => {
    if (!selectedRecord) return;
    await apiPut(`/api/progress/${selectedRecord.id}`, data);
    setShowEdit(false);
    setSelectedRecord(null);
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa bản ghi này?')) return;
    await apiDelete(`/api/progress/${id}`);
    loadRecords();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Cập nhật tiến độ KPI</h1>
          <p className="text-text-light mt-1">Theo dõi và cập nhật kết quả thực hiện</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Cập nhật mới
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><Clock size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng KPI</p><p className="text-xl font-bold">{cycleFilteredRecords.length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><TrendingUp size={20} className="text-accent-green" /></div>
            <div><p className="text-text-light text-sm">Đạt chỉ tiêu</p><p className="text-xl font-bold">{achievedCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><AlertTriangle size={20} className="text-accent-yellow" /></div>
            <div><p className="text-text-light text-sm">Cần cải thiện</p><p className="text-xl font-bold">{warningCount}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-red/20 rounded-lg"><TrendingDown size={20} className="text-accent-red" /></div>
            <div><p className="text-text-light text-sm">Chưa đạt</p><p className="text-xl font-bold">{notAchievedCount}</p></div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm KPI..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Tiến độ thực hiện KPI</h3></div>
        <div className="p-0">
          <table className="table">
            <thead>
              <tr><th>Mã KPI</th><th>Tên KPI</th><th>Đơn vị</th><th>Chỉ tiêu</th><th>Thực tế</th><th>Tiến độ</th><th>MC</th><th>Cập nhật</th><th>Ghi chú</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isAchieved = item.progressPercent >= 100;
                const isWarning = item.progressPercent >= 80 && item.progressPercent < 100;
                return (
                  <tr key={item.id}>
                    <td><span className="badge badge-info">{item.indicatorId}</span></td>
                    <td className="font-medium text-sm">{item.indicatorName}</td>
                    <td className="text-sm">{item.unitName}</td>
                    <td>{item.targetValue}{item.unit}</td>
                    <td className="font-bold">{item.actualValue}{item.unit}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-20">
                          <div className="progress-fill" style={{ width: `${Math.min(item.progressPercent, 100)}%`, backgroundColor: isAchieved ? '#4caf50' : isWarning ? '#ffc107' : '#f44336' }} />
                        </div>
                        <span className={`text-sm font-medium ${isAchieved ? 'text-accent-green' : isWarning ? 'text-accent-yellow' : 'text-accent-red'}`}>
                          {item.progressPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <a href={`/kpi/evidences?indicatorId=${item.indicatorId}`} className="text-primary hover:underline text-sm">
                        <FileText size={14} className="inline" />
                      </a>
                    </td>
                    <td className="text-xs text-text-light">{new Date(item.lastUpdated).toLocaleDateString('vi-VN')}</td>
                    <td className="text-xs max-w-[150px] truncate">{item.note}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedRecord(item); setShowEdit(true); }} className="p-1 text-primary hover:bg-primary-light rounded"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-accent-red hover:bg-accent-red/10 rounded"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Cập nhật tiến độ mới">
        <ProgressForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setSelectedRecord(null); }} title="Sửa tiến độ">
        {selectedRecord && <ProgressForm record={selectedRecord} onSubmit={handleUpdate} onCancel={() => { setShowEdit(false); setSelectedRecord(null); }} />}
      </Modal>
    </div>
  );
}

function ProgressForm({ record, onSubmit, onCancel }: { record?: ProgressRecord; onSubmit: (data: Partial<ProgressRecord>) => void; onCancel: () => void }) {
  const [indicatorId, setIndicatorId] = useState(record?.indicatorId || '');
  const [unitId, setUnitId] = useState(record?.unitId || '');
  const [actualValue, setActualValue] = useState(record?.actualValue || 0);
  const [targetValue, setTargetValue] = useState(record?.targetValue || 0);
  const [note, setNote] = useState(record?.note || '');

  const selectedIndicator = (indicatorsData as Record<string, unknown>[]).find((i: Record<string, unknown>) => i.id === indicatorId);
  const selectedUnit = (unitsData as Record<string, unknown>[]).find((u: Record<string, unknown>) => u.id === unitId);

  useEffect(() => {
    if (indicatorId && !record) {
      const ind = (indicatorsData as Record<string, unknown>[]).find((i: Record<string, unknown>) => i.id === indicatorId);
      if (ind) setTargetValue(ind.targetValue as number);
    }
  }, [indicatorId, record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      indicatorId,
      indicatorName: (selectedIndicator?.name as string) || '',
      unitId,
      unitName: (selectedUnit?.name as string) || '',
      targetValue,
      actualValue,
      unit: (selectedIndicator?.unit as string) || '%',
      note,
      cycleName: 'Năm học 2025-2026',
      updatedBy: 'Admin',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">KPI *</label>
          <select value={indicatorId} onChange={(e) => setIndicatorId(e.target.value)} required disabled={!!record}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary disabled:opacity-50">
            <option value="">-- Chọn KPI --</option>
            {(indicatorsData as Record<string, unknown>[]).map((i: Record<string, unknown>) => (
              <option key={i.id as string} value={i.id as string}>{i.code as string} - {i.name as string}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Đơn vị *</label>
          <select value={unitId} onChange={(e) => setUnitId(e.target.value)} required disabled={!!record}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary disabled:opacity-50">
            <option value="">-- Chọn đơn vị --</option>
            {(unitsData as Record<string, unknown>[]).filter((u: Record<string, unknown>) => u.type !== 'university').map((u: Record<string, unknown>) => (
              <option key={u.id as string} value={u.id as string}>{u.name as string}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Chỉ tiêu *</label>
          <input type="number" value={targetValue} onChange={(e) => setTargetValue(Number(e.target.value))} required step="any"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Thực tế *</label>
          <input type="number" value={actualValue} onChange={(e) => setActualValue(Number(e.target.value))} required step="any"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">Ghi chú</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
      </div>
      {targetValue > 0 && (
        <div className="p-3 bg-bg-cream rounded-lg border border-border">
          <span className="text-sm text-text-light">Tỉ lệ hoàn thành: </span>
          <span className={`font-bold ${actualValue / targetValue * 100 >= 100 ? 'text-accent-green' : 'text-accent-red'}`}>
            {(actualValue / targetValue * 100).toFixed(1)}%
          </span>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
        <button type="submit" className="btn-primary">{record ? 'Cập nhật' : 'Thêm mới'}</button>
      </div>
    </form>
  );
}
