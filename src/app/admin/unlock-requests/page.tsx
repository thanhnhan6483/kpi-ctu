'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPut } from '@/lib/api';

interface UnlockRequest {
  id: string;
  objectType: 'cycle' | 'evaluation' | 'score' | 'evidence';
  objectId: string;
  requestedBy: string;
  reason: string;
  scope: string;
  durationHours: number;
  approvedBy?: string;
  approvedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  createdAt: string;
}

export default function UnlockRequestsPage() {
  const [items, setItems] = useState<UnlockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [reviewItem, setReviewItem] = useState<UnlockRequest | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<UnlockRequest[]>('/api/unlock-requests');
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReview = async () => {
    if (!reviewItem) return;
    await apiPut(`/api/unlock-requests/${reviewItem.id}`, {
      status: reviewItem.status,
      note: reviewItem.note,
      approvedBy: 'admin',
      approvedAt: new Date().toISOString(),
    });
    setReviewItem(null); load();
  };

  const filtered = items.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const statusOptions = ['all', 'pending', 'approved', 'rejected'];
  const statusLabels: Record<string, string> = { all: 'Tất cả', pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };
  const statusBadge: Record<string, string> = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
  const objTypeLabels: Record<string, string> = { cycle: 'Chu kỳ', evaluation: 'Đánh giá', score: 'Điểm', evidence: 'Minh chứng' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Yêu cầu mở khóa</h1>
          <p className="text-text-light mt-1">Quản lý yêu cầu mở khóa dữ liệu (XXI.10)</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusOptions.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>{statusLabels[s]}</button>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách yêu cầu</h3></div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-text-light">Đang tải...</div>
          ) : (
            <table className="table">
              <thead><tr><th>STT</th><th>Đối tượng</th><th>Mã đối tượng</th><th>Người yêu cầu</th><th>Lý do</th><th>Phạm vi</th><th>Giờ</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
              <tbody>{filtered.length === 0 ? <tr><td colSpan={10} className="text-center py-8">Không có dữ liệu</td></tr> :
                filtered.map((item, i) => (<tr key={item.id}>
                  <td>{i + 1}</td>
                  <td><span className="badge badge-info">{objTypeLabels[item.objectType] || item.objectType}</span></td>
                  <td className="font-mono text-xs">{item.objectId}</td>
                  <td className="text-sm">{item.requestedBy}</td>
                  <td className="text-sm text-text-light max-w-[200px] truncate">{item.reason}</td>
                  <td className="text-sm">{item.scope}</td>
                  <td className="text-sm">{item.durationHours}h</td>
                  <td><span className={`badge ${statusBadge[item.status] || 'badge-info'}`}>{statusLabels[item.status]}</span></td>
                  <td className="text-sm text-text-light">{item.createdAt}</td>
                  <td><div className="flex gap-1">
                    {item.status === 'pending' ? (
                      <>
                        <button onClick={() => setReviewItem({ ...item, status: 'approved' })} className="p-1 hover:bg-green-50 rounded" title="Duyệt"><CheckCircle size={12} className="text-green-600" /></button>
                        <button onClick={() => setReviewItem({ ...item, status: 'rejected' })} className="p-1 hover:bg-red-50 rounded" title="Từ chối"><XCircle size={12} className="text-red-600" /></button>
                      </>
                    ) : <span className="text-xs text-text-light">—</span>}
                  </div></td>
                </tr>))}</tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={!!reviewItem} onClose={() => setReviewItem(null)} title={reviewItem?.status === 'approved' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'}>
        {reviewItem && (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Lý do</label><div className="text-sm p-3 bg-bg-cream rounded-lg">{reviewItem.reason}</div></div>
            <div><label className="block text-sm font-medium mb-1">Ghi chú</label><textarea value={reviewItem.note || ''} onChange={e => setReviewItem({ ...reviewItem, note: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={4} placeholder="Nhập ghi chú..." /></div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setReviewItem(null)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg-cream">Hủy</button>
              <button onClick={handleReview} className={`px-4 py-2 text-white rounded-lg text-sm ${reviewItem.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>{reviewItem.status === 'approved' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
