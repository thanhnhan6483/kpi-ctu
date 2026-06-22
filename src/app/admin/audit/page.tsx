'use client';

import { useState } from 'react';
import { Search, Filter, Clock, User, FileText, Shield, Download, Calendar, AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import auditLogs from '@/data/audit-logs.json';
import usersData from '@/data/users.json';

const actionLabels: Record<string, string> = {
  login: 'Đăng nhập',
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xóa',
  submit: 'Gửi duyệt',
  approve: 'Phê duyệt',
  reject: 'Từ chối',
  upload: 'Tải lên',
  verify: 'Xác minh',
  self_evaluate: 'Tự đánh giá',
  evaluate: 'Đánh giá',
  council_review: 'Hội đồng rà soát',
  lock: 'Khóa',
  export: 'Xuất báo cáo',
};

const objectTypeLabels: Record<string, string> = {
  auth: 'Xác thực',
  kpi_cycle: 'Chu kỳ KPI',
  kpi_plan: 'Kế hoạch KPI',
  kpi_progress: 'Tiến độ',
  kpi_evidence: 'Minh chứng',
  kpi_evaluation: 'Đánh giá',
  report: 'Báo cáo',
  user: 'Người dùng',
  settings: 'Cài đặt',
};

const actionColors: Record<string, string> = {
  login: '#2196f3',
  create: '#4caf50',
  update: '#ff9800',
  delete: '#f44336',
  submit: '#9c27b0',
  approve: '#4caf50',
  reject: '#f44336',
  upload: '#00afef',
  verify: '#4caf50',
  self_evaluate: '#3f51b5',
  evaluate: '#3f51b5',
  council_review: '#607d8b',
  lock: '#607d8b',
  export: '#00afef',
};

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [postLockFilter, setPostLockFilter] = useState(false);
  const [unlockFilter, setUnlockFilter] = useState(false);
  const [showUnlockDetail, setShowUnlockDetail] = useState(false);
  const [selectedUnlock, setSelectedUnlock] = useState<Record<string, unknown> | null>(null);

  const getUserName = (userId: string) => {
    const user = usersData.find((u: Record<string, unknown>) => u.id === userId);
    return user ? (user.fullName as string) : userId;
  };

  const filteredLogs = auditLogs.filter((log: Record<string, unknown>) => {
    const matchesSearch =
      getUserName(log.userId as string).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.detail as string).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (objectTypeLabels[log.objectType as string] || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesPostLock = !postLockFilter || ['lock', 'update', 'unlock'].includes(log.action as string);
    const matchesUnlock = !unlockFilter || String(log.action).toLowerCase().includes('unlock') || String(log.detail).toLowerCase().includes('mở khóa') || String(log.detail).toLowerCase().includes('unlock');
    return matchesSearch && matchesAction && matchesPostLock && matchesUnlock;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Nhật ký hệ thống</h1>
          <p className="text-text-light mt-1">Theo dõi và truy vết mọi thao tác trên hệ thống</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download size={16} />
          Xuất nhật ký
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><FileText size={20} className="text-primary" /></div>
            <div>
              <p className="text-text-light text-sm">Tổng log</p>
              <p className="text-xl font-bold">{auditLogs.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><Clock size={20} className="text-accent-green" /></div>
            <div>
              <p className="text-text-light text-sm">Hôm nay</p>
              <p className="text-xl font-bold">{auditLogs.filter((l: Record<string, unknown>) => (l.createdAt as string).startsWith('2026-06-15')).length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><User size={20} className="text-accent-yellow" /></div>
            <div>
              <p className="text-text-light text-sm">Người dùng актив</p>
              <p className="text-xl font-bold">{new Set(auditLogs.map((l: Record<string, unknown>) => l.userId)).size}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-red/20 rounded-lg"><Shield size={20} className="text-accent-red" /></div>
            <div>
              <p className="text-text-light text-sm">Loại thao tác</p>
              <p className="text-xl font-bold">{new Set(auditLogs.map((l: Record<string, unknown>) => l.action)).size}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm nhật ký..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">Tất cả thao tác</option>
          {Object.entries(actionLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-lg text-sm cursor-pointer hover:bg-bg-cream">
          <input type="checkbox" checked={postLockFilter} onChange={e => setPostLockFilter(e.target.checked)} className="rounded" />
          Chỉnh sửa sau khóa
        </label>
        <button onClick={() => setUnlockFilter(!unlockFilter)}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${unlockFilter ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>
          Audit mở khóa
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-white">Chi tiết nhật ký</h3>
        </div>
        <div className="p-0">
          <table className="table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người dùng</th>
                <th>Thao tác</th>
                <th>Đối tượng</th>
                <th>Chi tiết</th>
                <th>IP</th>
                <th>Mở khóa</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log: Record<string, unknown>) => {
                const isUnlock = String(log.action).toLowerCase().includes('unlock') || String(log.detail).toLowerCase().includes('mở khóa');
                return (
                  <tr key={log.id as string} className={isUnlock ? 'bg-purple-50' : ''}>
                    <td className="text-sm text-text-light whitespace-nowrap">
                      {new Date(log.createdAt as string).toLocaleString('vi-VN')}
                    </td>
                    <td className="font-medium text-sm">{getUserName(log.userId as string)}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: `${actionColors[log.action as string] || '#9e9e9e'}20`,
                          color: actionColors[log.action as string] || '#9e9e9e',
                        }}
                      >
                        {actionLabels[log.action as string] || String(log.action)}
                      </span>
                    </td>
                    <td className="text-sm">{objectTypeLabels[log.objectType as string] || String(log.objectType)}</td>
                    <td className="text-sm max-w-[300px] truncate">{log.detail as string}</td>
                    <td className="text-xs text-text-light font-mono">{log.ipAddress as string}</td>
                    <td>
                      {isUnlock && (
                        <button onClick={() => { setSelectedUnlock(log); setShowUnlockDetail(true); }} className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Xem chi tiết">
                          <Shield size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showUnlockDetail} onClose={() => { setShowUnlockDetail(false); setSelectedUnlock(null); }} title="Chi tiết Audit mở khóa">
        {selectedUnlock && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-bg-cream rounded-lg border border-border">
                <div className="text-xs text-text-light">Người mở khóa</div>
                <div className="font-medium">{getUserName(selectedUnlock.userId as string)}</div>
              </div>
              <div className="p-3 bg-bg-cream rounded-lg border border-border">
                <div className="text-xs text-text-light">Đối tượng</div>
                <div className="font-medium">{objectTypeLabels[selectedUnlock.objectType as string] || String(selectedUnlock.objectType)}</div>
              </div>
              <div className="p-3 bg-bg-cream rounded-lg border border-border">
                <div className="text-xs text-text-light">ID đối tượng</div>
                <div className="font-medium text-xs font-mono">{selectedUnlock.objectId as string}</div>
              </div>
              <div className="p-3 bg-bg-cream rounded-lg border border-border">
                <div className="text-xs text-text-light">Lý do</div>
                <div className="font-medium">{selectedUnlock.detail as string}</div>
              </div>
              <div className="p-3 bg-bg-cream rounded-lg border border-border">
                <div className="text-xs text-text-light">Thời gian</div>
                <div className="font-medium">{new Date(selectedUnlock.createdAt as string).toLocaleString('vi-VN')}</div>
              </div>
              <div className="p-3 bg-bg-cream rounded-lg border border-border">
                <div className="text-xs text-text-light">IP</div>
                <div className="font-medium font-mono text-xs">{selectedUnlock.ipAddress as string}</div>
              </div>
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-bg-cream px-4 py-2 text-xs font-medium text-text-light border-b">Dữ liệu trước/sau khi mở khóa</div>
              <div className="p-4 text-sm space-y-3">
                <div>
                  <div className="text-xs font-medium text-accent-green mb-1">Trước khi mở khóa:</div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-xs font-mono whitespace-pre-wrap">
                    {'status: "locked"\nlockedAt: "2026-06-10T16:00:00Z"\nfinalScore: 91\ncouncilScore: 91'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-accent-red mb-1">Sau khi mở khóa:</div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs font-mono whitespace-pre-wrap">
                    {'status: "council_review"\nlockedAt: null\nfinalScore: 91\ncouncilScore: 91'}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-light">
                  <AlertTriangle size={12} />
                  Dữ liệu minh họa. Chi tiết thay đổi dựa trên bản ghi audit.
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => { setShowUnlockDetail(false); setSelectedUnlock(null); }} className="btn-primary">Đóng</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
