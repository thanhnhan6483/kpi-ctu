'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { apiGet } from '@/lib/api';

interface SyncLogError {
  record: string;
  message: string;
}

interface SyncLog {
  id: string;
  apiConfigId: string;
  systemType: string;
  syncType: 'manual' | 'scheduled';
  status: 'running' | 'success' | 'partial' | 'error';
  startedAt: string;
  completedAt?: string;
  recordsTotal: number;
  recordsSuccess: number;
  recordsFailed: number;
  errors: SyncLogError[];
  createdBy: string;
}

export default function SyncLogsPage() {
  const [items, setItems] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSystem, setFilterSystem] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<SyncLog[]>('/api/sync-logs');
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const systemLabels: Record<string, string> = { hrm: 'HRM', lms: 'LMS', eoffice: 'Eoffice', khcn: 'KHCN', finance: 'Tài chính', survey: 'Khảo sát' };
  const syncTypeLabels: Record<string, string> = { manual: 'Thủ công', scheduled: 'Định kỳ' };
  const statusLabels: Record<string, string> = { running: 'Đang chạy', success: 'Thành công', partial: 'Một phần', error: 'Lỗi' };
  const statusBadge: Record<string, string> = { running: 'badge-info', success: 'badge-success', partial: 'badge-warning', error: 'badge-danger' };

  const systemOptions = ['all', 'hrm', 'lms', 'eoffice', 'khcn', 'finance', 'survey'];
  const statusOptions = ['all', 'running', 'success', 'partial', 'error'];

  const filtered = items.filter(item => {
    if (filterSystem !== 'all' && item.systemType !== filterSystem) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Nhật ký đồng bộ</h1>
          <p className="text-text-light mt-1">Theo dõi lịch sử đồng bộ dữ liệu từ các hệ thống</p>
        </div>
        <button onClick={load} className="btn-primary text-xs flex items-center gap-1">
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-text-light">Hệ thống:</span>
          {systemOptions.map(s => (
            <button key={s} onClick={() => setFilterSystem(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterSystem === s ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>{s === 'all' ? 'Tất cả' : systemLabels[s] || s}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-text-light">Trạng thái:</span>
          {statusOptions.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>{s === 'all' ? 'Tất cả' : statusLabels[s]}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Lịch sử đồng bộ</h3></div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-text-light">Đang tải...</div>
          ) : (
            <table className="table">
              <thead><tr><th></th><th>Hệ thống</th><th>Loại đồng bộ</th><th>Trạng thái</th><th>Thời gian</th><th>Tổng số</th><th>Thành công</th><th>Lỗi</th><th>Người tạo</th></tr></thead>
              <tbody>{filtered.length === 0 ? <tr><td colSpan={9} className="text-center py-8">Không có dữ liệu</td></tr> :
                filtered.map((item, i) => (<tr key={item.id}>
                  <td>{item.errors?.length > 0 ? (
                    <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="p-1 hover:bg-bg-cream rounded">
                      {expandedId === item.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  ) : <span className="inline-block w-5" />}</td>
                  <td className="font-medium text-sm">{systemLabels[item.systemType] || item.systemType}</td>
                  <td><span className="badge badge-info">{syncTypeLabels[item.syncType] || item.syncType}</span></td>
                  <td><span className={`badge ${statusBadge[item.status] || 'badge-info'}`}>{statusLabels[item.status]}</span></td>
                  <td className="text-sm text-text-light">{item.startedAt}</td>
                  <td className="text-sm">{item.recordsTotal}</td>
                  <td className="text-sm text-green-600">{item.recordsSuccess}</td>
                  <td className="text-sm text-red-600">{item.recordsFailed}</td>
                  <td className="text-sm">{item.createdBy}</td>
                </tr>))}</tbody>
            </table>
          )}
        </div>
      </div>

      {expandedId && (() => {
        const log = items.find(i => i.id === expandedId);
        if (!log || !log.errors?.length) return null;
        return (
          <div className="card">
            <div className="card-header bg-red-600"><h3 className="text-white text-sm flex items-center gap-2"><AlertCircle size={16} /> Chi tiết lỗi</h3></div>
            <div className="p-4 space-y-2">
              {log.errors.map((err, i) => (
                <div key={i} className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-100 text-sm">
                  <span className="font-mono text-xs text-text-light min-w-[80px]">{err.record}</span>
                  <span className="text-red-700">{err.message}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
