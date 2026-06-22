'use client';

import { useState, useEffect, useCallback } from 'react';
import { GitCompare } from 'lucide-react';
import { apiGet } from '@/lib/api';

interface PlanVersion {
  id: string;
  planId: string;
  version: number;
  data: Record<string, unknown>;
  changedBy: string;
  changeType: 'create' | 'update' | 'submit' | 'approve' | 'revision' | 'lock' | 'unlock';
  note: string;
  createdAt: string;
}

interface Plan {
  id: string;
  ownerType: 'unit' | 'individual';
  ownerId: string;
  status: string;
}

const changeTypeLabels: Record<string, string> = {
  create: 'Tạo mới', update: 'Cập nhật', submit: 'Nộp', approve: 'Duyệt',
  revision: 'Yêu cầu sửa', lock: 'Khóa', unlock: 'Mở khóa',
};
const changeTypeBadge: Record<string, string> = {
  create: 'badge-success', update: 'badge-info', submit: 'badge-warning',
  approve: 'badge-primary', revision: 'badge-danger', lock: 'badge',
  unlock: 'badge',
};

export default function PlanVersionsPage() {
  const [versions, setVersions] = useState<PlanVersion[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [v, p] = await Promise.all([
        apiGet<PlanVersion[]>('/api/plan-versions'),
        apiGet<Plan[]>('/api/plans'),
      ]);
      setVersions(v);
      setPlans(p);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const planMap = Object.fromEntries(plans.map(p => [p.id, p]));

  const filtered = planFilter
    ? versions.filter(v => v.planId === planFilter)
    : versions;

  const uniquePlanIds = [...new Set(versions.map(v => v.planId))];

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(s => s !== id));
    } else {
      if (selectedIds.length < 2) {
        setSelectedIds([...selectedIds, id]);
      } else {
        setSelectedIds([selectedIds[1], id]);
      }
    }
  };

  const selectedVersions = selectedIds.map(id => versions.find(v => v.id === id)).filter(Boolean) as PlanVersion[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Lịch sử phiên bản</h1>
          <p className="text-text-light mt-1">Theo dõi thay đổi và so sánh phiên bản kế hoạch</p>
        </div>
        {selectedIds.length === 2 && (
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <GitCompare size={16} /> Đã chọn 2 phiên bản để so sánh
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-medium text-text-light">Kế hoạch:</span>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary">
          <option value="">Tất cả</option>
          {uniquePlanIds.map(pid => (
            <option key={pid} value={pid}>{pid}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách phiên bản</h3></div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-text-light">Đang tải...</div>
          ) : (
            <table className="table">
              <thead><tr><th></th><th>Phiên bản</th><th>Kế hoạch</th><th>Người thay đổi</th><th>Loại thay đổi</th><th>Ghi chú</th><th>Thời gian</th></tr></thead>
              <tbody>{filtered.length === 0 ? <tr><td colSpan={7} className="text-center py-8">Không có dữ liệu</td></tr> :
                filtered.map((v) => (<tr key={v.id} className={selectedIds.includes(v.id) ? 'bg-blue-50' : ''}>
                  <td><input type="checkbox" checked={selectedIds.includes(v.id)} onChange={() => toggleSelect(v.id)} className="rounded" /></td>
                  <td className="font-mono text-xs font-medium">v{v.version}</td>
                  <td className="text-sm">{v.planId}</td>
                  <td className="text-sm">{v.changedBy}</td>
                  <td><span className={`badge ${changeTypeBadge[v.changeType] || 'badge-info'}`}>{changeTypeLabels[v.changeType] || v.changeType}</span></td>
                  <td className="text-sm text-text-light max-w-[200px] truncate">{v.note}</td>
                  <td className="text-sm text-text-light">{v.createdAt}</td>
                </tr>))}</tbody>
            </table>
          )}
        </div>
      </div>

      {selectedIds.length === 2 && selectedVersions.length === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {selectedVersions.map((v, idx) => (
            <div key={v.id} className="card">
              <div className="card-header bg-primary"><h3 className="text-white text-sm">v{v.version} — {changeTypeLabels[v.changeType] || v.changeType}</h3></div>
              <div className="p-4">
                <div className="mb-2 text-xs text-text-light">Người thay đổi: {v.changedBy} | {v.createdAt}</div>
                <pre className="text-xs font-mono bg-bg-cream p-4 rounded-lg overflow-auto max-h-[400px] whitespace-pre-wrap">{JSON.stringify(v.data, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
