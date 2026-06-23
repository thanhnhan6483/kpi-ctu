'use client';

import { useState, useMemo } from 'react';
import { FileEdit, Plus, Send, Search, Eye } from 'lucide-react';
import complaintsData from '@/data/complaints.json';
import Modal from '@/components/ui/Modal';
import type { KPIComplaint } from '@/types';

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Chờ xử lý', cls: 'badge-warning' },
  under_review: { label: 'Đang xem xét', cls: 'badge-info' },
  accepted: { label: 'Chấp nhận', cls: 'badge-success' },
  rejected: { label: 'Từ chối', cls: 'badge-danger' },
  supplement_needed: { label: 'Cần bổ sung', cls: 'badge-warning' },
};

export default function AdjustmentPage() {
  const [requests, setRequests] = useState<KPIComplaint[]>(complaintsData as KPIComplaint[]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    objectType: 'individual_evaluation' as KPIComplaint['objectType'],
    objectId: '',
    content: '',
  });

  const filtered = useMemo(() => {
    if (!search) return requests;
    const s = search.toLowerCase();
    return requests.filter(r =>
      r.content.toLowerCase().includes(s) ||
      r.complainantName.toLowerCase().includes(s) ||
      r.objectId.toLowerCase().includes(s)
    );
  }, [requests, search]);

  const handleSubmit = () => {
    const newReq: KPIComplaint = {
      id: `ADJ-${Date.now()}`,
      cycleId: '',
      objectType: formData.objectType,
      objectId: formData.objectId,
      complainantId: 'current-user',
      complainantName: 'Người dùng hiện tại',
      content: formData.content,
      attachments: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRequests(prev => [newReq, ...prev]);
    setShowForm(false);
    setFormData({ objectType: 'individual_evaluation', objectId: '', content: '' });
  };

  const viewRequest = requests.find(r => r.id === viewId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-light rounded-lg"><FileEdit size={24} className="text-primary" /></div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý đề nghị điều chỉnh kết quả</h1>
            <p className="text-text-light text-sm">XX.15 — Gửi và theo dõi yêu cầu điều chỉnh điểm KPI</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1">
          <Plus size={14} /> Tạo đề nghị
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-text-light text-sm">Tổng số</p>
          <p className="text-2xl font-bold">{requests.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-text-light text-sm">Chờ xử lý</p>
          <p className="text-2xl font-bold text-accent-yellow">{requests.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="card p-4">
          <p className="text-text-light text-sm">Đã chấp nhận</p>
          <p className="text-2xl font-bold text-accent-green">{requests.filter(r => r.status === 'accepted').length}</p>
        </div>
        <div className="card p-4">
          <p className="text-text-light text-sm">Từ chối</p>
          <p className="text-2xl font-bold text-accent-red">{requests.filter(r => r.status === 'rejected').length}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-white">Danh sách đề nghị</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm..." className="pl-8 pr-3 py-1.5 rounded border border-border/30 bg-white/20 text-white placeholder:text-white/50 text-sm focus:outline-none w-64" />
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Người gửi</th>
                <th>Đối tượng</th>
                <th>Nội dung</th>
                <th>Ngày gửi</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => (
                <tr key={req.id}>
                  <td><span className="badge badge-info">{req.id}</span></td>
                  <td className="font-medium">{req.complainantName}</td>
                  <td className="text-xs text-text-light">{req.objectId}</td>
                  <td className="max-w-[200px] truncate text-sm">{req.content}</td>
                  <td className="text-sm text-text-light">{new Date(req.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td><span className={`badge ${statusConfig[req.status]?.cls || 'badge-info'}`}>{statusConfig[req.status]?.label || req.status}</span></td>
                  <td>
                    <button onClick={() => setViewId(req.id)} className="p-1 text-primary hover:bg-primary-light rounded" title="Xem chi tiết">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-text-light text-sm py-8">Không có đề nghị nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Tạo đề nghị điều chỉnh kết quả">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loại đối tượng *</label>
            <select value={formData.objectType} onChange={e => setFormData(prev => ({ ...prev, objectType: e.target.value as KPIComplaint['objectType'] }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
              <option value="individual_evaluation">Đánh giá cá nhân</option>
              <option value="unit_evaluation">Đánh giá đơn vị</option>
              <option value="score">Điểm KPI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mã đối tượng *</label>
            <input type="text" value={formData.objectId} onChange={e => setFormData(prev => ({ ...prev, objectId: e.target.value }))}
              placeholder="VD: EVAL-001, SCORE-002" required
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nội dung đề nghị *</label>
            <textarea value={formData.content} onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4} required placeholder="Mô tả lý do điều chỉnh..."
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
            <button onClick={handleSubmit} disabled={!formData.objectId || !formData.content}
              className="btn-primary flex items-center gap-1">
              <Send size={14} /> Gửi đề nghị
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!viewId} onClose={() => setViewId(null)} title="Chi tiết đề nghị">
        {viewRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-light">Mã đề nghị</p>
                <p className="text-sm font-medium">{viewRequest.id}</p>
              </div>
              <div>
                <p className="text-xs text-text-light">Trạng thái</p>
                <span className={`badge ${statusConfig[viewRequest.status]?.cls || 'badge-info'}`}>
                  {statusConfig[viewRequest.status]?.label || viewRequest.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-text-light">Người gửi</p>
                <p className="text-sm font-medium">{viewRequest.complainantName}</p>
              </div>
              <div>
                <p className="text-xs text-text-light">Ngày gửi</p>
                <p className="text-sm font-medium">{new Date(viewRequest.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-light">Loại đối tượng</p>
              <p className="text-sm">{viewRequest.objectType === 'individual_evaluation' ? 'Đánh giá cá nhân' : viewRequest.objectType === 'unit_evaluation' ? 'Đánh giá đơn vị' : 'Điểm KPI'}</p>
            </div>
            <div>
              <p className="text-xs text-text-light">Mã đối tượng</p>
              <p className="text-sm font-mono">{viewRequest.objectId}</p>
            </div>
            <div>
              <p className="text-xs text-text-light">Nội dung</p>
              <p className="text-sm bg-bg-cream p-3 rounded-lg border border-border">{viewRequest.content}</p>
            </div>
            {viewRequest.reviewNote && (
              <div>
                <p className="text-xs text-text-light">Phản hồi</p>
                <p className="text-sm bg-bg-cream p-3 rounded-lg border border-border">{viewRequest.reviewNote}</p>
              </div>
            )}
            {viewRequest.resolution && (
              <div>
                <p className="text-xs text-text-light">Kết quả xử lý</p>
                <p className="text-sm bg-accent-green/10 p-3 rounded-lg border border-accent-green/30">{viewRequest.resolution}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
