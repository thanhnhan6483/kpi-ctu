'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Search, Download, Package, Calendar, Clock, CheckCircle, AlertTriangle, Archive, Plus } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost } from '@/lib/api';
import cyclesData from '@/data/cycles.json';
import unitsData from '@/data/units.json';

interface ArchivePackage {
  id: string;
  name: string;
  cycleId: string;
  unitId: string;
  createdAt: string;
  fileSize: string;
  status: 'ready' | 'preparing' | 'error';
  recordCount: number;
}

const unitMap: Record<string, string> = {};
(unitsData as { id: string; name: string }[]).forEach(u => { unitMap[u.id] = u.name; });

const statusConfig: Record<string, { label: string; color: string }> = {
  ready: { label: 'Sẵn sàng', color: '#22c55e' },
  preparing: { label: 'Đang chuẩn bị', color: '#eab308' },
  error: { label: 'Lỗi', color: '#ef4444' },
};

export default function ArchivePage() {
  const [archives, setArchives] = useState<ArchivePackage[]>([]);
  const [cycles, setCycles] = useState<{ id: string; name: string; academicYearId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchYear, setSearchYear] = useState('');
  const [searchUnit, setSearchUnit] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newCycleId, setNewCycleId] = useState('');
  const [newUnitId, setNewUnitId] = useState('');
  const [newPackageName, setNewPackageName] = useState('');
  const [creating, setCreating] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const c = cyclesData as { id: string; name: string; academicYearId: string }[];
      setCycles(c);
      setArchives([
        { id: 'arc_001', name: 'Hồ sơ KPI 2024-2025 - HK1', cycleId: 'c001', unitId: 'u101', createdAt: '2025-02-15T10:00:00Z', fileSize: '2.4 MB', status: 'ready', recordCount: 156 },
        { id: 'arc_002', name: 'Hồ sơ KPI 2024-2025 - HK2', cycleId: 'c002', unitId: 'u102', createdAt: '2025-08-20T14:30:00Z', fileSize: '3.1 MB', status: 'ready', recordCount: 203 },
        { id: 'arc_003', name: 'Hồ sơ KPI 2025-2026 - HK1', cycleId: 'c003', unitId: 'u103', createdAt: '2026-03-10T09:00:00Z', fileSize: '1.8 MB', status: 'preparing', recordCount: 98 },
      ]);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = archives.filter(a => {
    const cycle = cycles.find(c => c.id === a.cycleId);
    const yearMatch = !searchYear || cycle?.academicYearId === searchYear;
    const unitMatch = !searchUnit || a.unitId === searchUnit;
    const keywordMatch = !searchKeyword || a.name.toLowerCase().includes(searchKeyword.toLowerCase()) || (unitMap[a.unitId] || '').toLowerCase().includes(searchKeyword.toLowerCase());
    return yearMatch && unitMatch && keywordMatch;
  });

  const handleCreate = async () => {
    if (!newCycleId || !newUnitId || !newPackageName.trim()) return;
    setCreating(true);
    setTimeout(() => {
      const pkg: ArchivePackage = {
        id: `arc_${Date.now()}`,
        name: newPackageName,
        cycleId: newCycleId,
        unitId: newUnitId,
        createdAt: new Date().toISOString(),
        fileSize: '0 B',
        status: 'preparing',
        recordCount: 0,
      };
      setArchives(prev => [pkg, ...prev]);
      setShowCreate(false);
      setCreating(false);
      setNewCycleId('');
      setNewUnitId('');
      setNewPackageName('');
    }, 500);
  };

  const handleDownload = (pkg: ArchivePackage) => {
    setDownloadMsg(`Đang chuẩn bị gói "${pkg.name}" để tải xuống...`);
    setTimeout(() => setDownloadMsg(null), 3000);
  };

  const uniqueYears = [...new Set(cycles.map(c => c.academicYearId))];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-light">Đang tải...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark flex items-center gap-2">
            <Archive size={24} /> Lưu trữ hồ sơ KPI
          </h1>
          <p className="text-text-light mt-1">Đóng gói và tra cứu hồ sơ đánh giá KPI (XXI.21)</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Package size={16} /> Đóng gói hồ sơ
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><Archive size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng gói hồ sơ</p><p className="text-xl font-bold">{archives.length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div>
            <div><p className="text-text-light text-sm">Sẵn sàng</p><p className="text-xl font-bold">{archives.filter(a => a.status === 'ready').length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><Clock size={20} className="text-accent-yellow" /></div>
            <div><p className="text-text-light text-sm">Đang chuẩn bị</p><p className="text-xl font-bold">{archives.filter(a => a.status === 'preparing').length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-red/20 rounded-lg"><AlertTriangle size={20} className="text-accent-red" /></div>
            <div><p className="text-text-light text-sm">Lỗi</p><p className="text-xl font-bold">{archives.filter(a => a.status === 'error').length}</p></div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-heading font-bold text-sm mb-4 flex items-center gap-2"><Package size={16} /> Đóng gói hồ sơ mới</h3>
        {!showCreate ? (
          <div className="flex items-center gap-3 p-4 bg-bg-cream rounded-lg border border-border">
            <p className="text-sm text-text-light">Chọn chu kỳ và đơn vị để tạo gói hồ sơ lưu trữ.</p>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-2"><Plus size={14} /> Tạo gói mới</button>
          </div>
        ) : (
          <div className="space-y-4 p-4 bg-bg-cream rounded-lg border border-border">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Chu kỳ *</label>
                <select value={newCycleId} onChange={e => setNewCycleId(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                  <option value="">-- Chọn chu kỳ --</option>
                  {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Đơn vị *</label>
                <select value={newUnitId} onChange={e => setNewUnitId(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                  <option value="">-- Chọn đơn vị --</option>
                  {(unitsData as { id: string; name: string }[]).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tên gói hồ sơ *</label>
                <input type="text" value={newPackageName} onChange={e => setNewPackageName(e.target.value)} placeholder="VD: Hồ sơ KPI 2025-2026 HK1"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={creating || !newCycleId || !newUnitId || !newPackageName.trim()} className="btn-primary flex items-center gap-2">
                {creating ? <><Clock size={14} className="animate-spin" /> Đang đóng gói...</> : <><Package size={14} /> Đóng gói</>}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Hủy</button>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white flex items-center gap-2"><Search size={16} /> Tra cứu hồ sơ</h3></div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1">Năm học</label>
              <select value={searchYear} onChange={e => setSearchYear(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                <option value="">-- Tất cả --</option>
                {uniqueYears.map(y => <option key={y} value={y}>{y === 'ay001' ? '2024-2025' : y === 'ay002' ? '2025-2026' : y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Đơn vị</label>
              <select value={searchUnit} onChange={e => setSearchUnit(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                <option value="">-- Tất cả --</option>
                {(unitsData as { id: string; name: string }[]).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Từ khóa</label>
              <input type="text" value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} placeholder="Nhập từ khóa..."
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Tên gói</th>
                <th>Chu kỳ</th>
                <th>Đơn vị</th>
                <th>Ngày đóng gói</th>
                <th>Dung lượng</th>
                <th>Số bản ghi</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8">Không có hồ sơ nào</td></tr>
              ) : filtered.map((pkg, idx) => {
                const cycle = cycles.find(c => c.id === pkg.cycleId);
                return (
                  <tr key={pkg.id}>
                    <td className="font-medium text-sm">{pkg.name}</td>
                    <td className="text-xs text-text-light">{cycle?.name || pkg.cycleId}</td>
                    <td className="text-sm">{unitMap[pkg.unitId] || pkg.unitId}</td>
                    <td className="text-xs text-text-light">{new Date(pkg.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="text-sm">{pkg.fileSize}</td>
                    <td className="text-sm">{pkg.recordCount}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: `${statusConfig[pkg.status]?.color || '#6b7280'}20`, color: statusConfig[pkg.status]?.color || '#6b7280' }}>
                        {statusConfig[pkg.status]?.label || pkg.status}
                      </span>
                    </td>
                    <td>
                      {pkg.status === 'ready' ? (
                        <button onClick={() => handleDownload(pkg)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Tải xuống">
                          <Download size={14} />
                        </button>
                      ) : pkg.status === 'preparing' ? (
                        <span className="text-xs text-text-light">Đang chuẩn bị...</span>
                      ) : (
                        <span className="text-xs text-accent-red">Lỗi</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {downloadMsg && (
        <div className="fixed bottom-6 right-6 p-4 bg-white border border-border rounded-xl shadow-lg flex items-center gap-3 z-50">
          <Clock size={16} className="text-accent-yellow" />
          <span className="text-sm">{downloadMsg}</span>
        </div>
      )}
    </div>
  );
}
