'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Search, Eye, MessageSquare } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPut } from '@/lib/api';

interface Approval {
  id: string;
  objectType: string;
  objectId: string;
  objectTitle: string;
  unitName: string;
  submitter: string;
  status: string;
  approverId?: string;
  approverName?: string;
  note?: string;
  submittedAt: string;
  decidedAt?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Chờ phê duyệt', color: '#ffc107', icon: Clock },
  approved: { label: 'Đã phê duyệt', color: '#4caf50', icon: CheckCircle },
  rejected: { label: 'Từ chối', color: '#f44336', icon: XCircle },
  needs_revision: { label: 'Cần chỉnh sửa', color: '#ff9800', icon: AlertTriangle },
};

const typeLabels: Record<string, string> = { plan: 'Kế hoạch', evidence: 'Minh chứng', evaluation: 'Đánh giá' };

function getObjectLink(type: string, id: string): string {
  switch (type) {
    case 'plan': return `/kpi/plans?detail=${id}`;
    case 'evidence': return `/kpi/evidences`;
    case 'evaluation': return `/kpi/evaluation`;
    default: return '#';
  }
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAction, setShowAction] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'revision'>('approve');
  const [actionNote, setActionNote] = useState('');
  const [loading, setLoading] = useState(true);

  const loadApprovals = useCallback(async () => {
    try {
      const data = await apiGet<Approval[]>('/api/approvals');
      setApprovals(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadApprovals(); }, [loadApprovals]);

  const filtered = approvals.filter(a => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch = a.objectTitle.toLowerCase().includes(searchTerm.toLowerCase()) || a.unitName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAction = async () => {
    if (!selectedApproval) return;
    const statusMap = { approve: 'approved', reject: 'rejected', revision: 'needs_revision' };
    await apiPut(`/api/approvals/${selectedApproval.id}`, {
      status: statusMap[actionType],
      note: actionNote,
      approverName: 'Admin',
    });
    setShowAction(false);
    setSelectedApproval(null);
    setActionNote('');
    loadApprovals();
  };

  const openAction = (approval: Approval, type: 'approve' | 'reject' | 'revision') => {
    setSelectedApproval(approval);
    setActionType(type);
    setActionNote('');
    setShowAction(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Phê duyệt KPI</h1>
          <p className="text-text-light mt-1">Duyệt kế hoạch, minh chứng và đánh giá</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><Clock size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Chờ duyệt</p><p className="text-xl font-bold">{approvals.filter(a => a.status === 'pending').length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div>
            <div><p className="text-text-light text-sm">Đã duyệt</p><p className="text-xl font-bold">{approvals.filter(a => a.status === 'approved').length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-red/20 rounded-lg"><XCircle size={20} className="text-accent-red" /></div>
            <div><p className="text-text-light text-sm">Từ chối</p><p className="text-xl font-bold">{approvals.filter(a => a.status === 'rejected' || a.status === 'needs_revision').length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><AlertTriangle size={20} className="text-accent-yellow" /></div>
            <div><p className="text-text-light text-sm">Tổng</p><p className="text-xl font-bold">{approvals.length}</p></div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected', 'needs_revision'].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === status ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>
              {status === 'all' ? 'Tất cả' : statusConfig[status]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách phê duyệt</h3></div>
        <div className="p-0">
          <table className="table">
            <thead>
              <tr><th>Mã</th><th>Loại</th><th>Nội dung</th><th>Đơn vị</th><th>Người gửi</th><th>Ngày gửi</th><th>Trạng thái</th><th>Ghi chú</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const status = statusConfig[a.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <tr key={a.id}>
                    <td><span className="badge badge-info">{a.id}</span></td>
                    <td><span className="badge badge-info text-xs">{typeLabels[a.objectType] || a.objectType}</span></td>
                    <td className="font-medium text-sm max-w-[200px] truncate">
                      <a href={getObjectLink(a.objectType, a.objectId)} className="text-primary hover:underline">{a.objectTitle}</a>
                    </td>
                    <td className="text-sm">{a.unitName}</td>
                    <td className="text-sm">{a.submitter}</td>
                    <td className="text-sm text-text-light">{new Date(a.submittedAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <span className="badge flex items-center gap-1 w-fit" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                        <StatusIcon size={12} />{status.label}
                      </span>
                    </td>
                    <td className="text-xs text-text-light max-w-[150px] truncate">{a.note || '-'}</td>
                    <td>
                      <div className="flex gap-1">
                        {a.status === 'pending' && (
                          <>
                            <button onClick={() => openAction(a, 'approve')} className="p-1 text-accent-green hover:bg-accent-green/10 rounded" title="Phê duyệt"><CheckCircle size={14} /></button>
                            <button onClick={() => openAction(a, 'revision')} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded" title="Yêu cầu chỉnh sửa"><MessageSquare size={14} /></button>
                            <button onClick={() => openAction(a, 'reject')} className="p-1 text-accent-red hover:bg-accent-red/10 rounded" title="Từ chối"><XCircle size={14} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showAction} onClose={() => { setShowAction(false); setSelectedApproval(null); }}
        title={actionType === 'approve' ? 'Phê duyệt' : actionType === 'reject' ? 'Từ chối' : 'Yêu cầu chỉnh sửa'}>
        <div className="space-y-4">
          <div className="p-4 bg-bg-cream rounded-lg border border-border">
            <div className="font-medium text-sm">{selectedApproval?.objectTitle}</div>
            <div className="text-xs text-text-light mt-1">Đơn vị: {selectedApproval?.unitName}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">
              {actionType === 'approve' ? 'Nhận xét (tùy chọn)' : actionType === 'reject' ? 'Lý do từ chối *' : 'Nội dung cần chỉnh sửa *'}
            </label>
            <textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)} rows={3}
              placeholder={actionType === 'approve' ? 'Nhận xét...' : 'Nhập lý do...'}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => { setShowAction(false); setSelectedApproval(null); }} className="btn-secondary">Hủy</button>
            <button onClick={handleAction}
              className={actionType === 'approve' ? 'btn-primary' : actionType === 'reject' ? 'btn-danger' : 'btn-secondary'}>
              {actionType === 'approve' ? 'Phê duyệt' : actionType === 'reject' ? 'Từ chối' : 'Gửi yêu cầu'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
