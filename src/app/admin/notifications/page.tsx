'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, AlertTriangle, Clock, Info, FileText, Trash2, Plus, Send } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import usersData from '@/data/users.json';

interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  readStatus: boolean;
  createdAt: string;
  type: 'reminder' | 'warning' | 'info' | 'approval';
}

const typeConfig: Record<string, { label: string; color: string; icon: typeof Bell }> = {
  info: { label: 'Thông tin', color: 'text-blue-600', icon: Info },
  warning: { label: 'Cảnh báo', color: 'text-orange-500', icon: AlertTriangle },
  reminder: { label: 'Nhắc nhở', color: 'text-yellow-500', icon: Clock },
  approval: { label: 'Phê duyệt', color: 'text-purple-600', icon: FileText },
};

const userMap: Record<string, string> = {};
(usersData as { id: string; fullName: string }[]).forEach(u => { userMap[u.id] = u.fullName; });

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (showUnreadOnly) params.set('unread', 'true');
      const data = await apiGet<Notification[]>(`/api/notifications?${params.toString()}`);
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, [typeFilter, showUnreadOnly]);

  useEffect(() => { load(); }, [load]);

  const unreadCount = items.filter(n => !n.readStatus).length;

  const handleMarkRead = async (id: string) => {
    await apiPut(`/api/notifications/${id}`, { readStatus: true });
    load();
  };

  const handleMarkAllRead = async () => {
    for (const item of items.filter(n => !n.readStatus)) {
      await apiPut(`/api/notifications/${item.id}`, { readStatus: true });
    }
    load();
  };

  const handleDelete = async (id: string) => {
    await apiDelete(`/api/notifications/${id}`);
    load();
  };

  const handleCreate = async (data: Partial<Notification>) => {
    await apiPost<Notification>('/api/notifications', data);
    setShowCreate(false);
    load();
  };

  const typeCounts = {
    all: items.length,
    info: items.filter(n => n.type === 'info').length,
    warning: items.filter(n => n.type === 'warning').length,
    reminder: items.filter(n => n.type === 'reminder').length,
    approval: items.filter(n => n.type === 'approval').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark flex items-center gap-2">
            <Bell size={24} /> Thông báo hệ thống
          </h1>
          <p className="text-text-light mt-1">Quản lý thông báo, nhắc việc và cảnh báo (XIX.1-XIX.5)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleMarkAllRead} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-1 hover:bg-bg-cream">
            <CheckCheck size={14} /> Đọc tất cả
          </button>
          <button onClick={() => setShowCreate(true)} className="px-3 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-1">
            <Plus size={14} /> Gửi thông báo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {[
          { key: 'all', label: 'Tất cả', icon: Bell, color: 'text-text-dark' },
          { key: 'info', label: 'Thông tin', icon: Info, color: 'text-blue-600' },
          { key: 'warning', label: 'Cảnh báo', icon: AlertTriangle, color: 'text-orange-500' },
          { key: 'reminder', label: 'Nhắc nhở', icon: Clock, color: 'text-yellow-500' },
          { key: 'approval', label: 'Phê duyệt', icon: FileText, color: 'text-purple-600' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTypeFilter(t.key)}
            className={`p-3 rounded-lg text-center border transition-colors ${typeFilter === t.key ? 'border-primary bg-primary-light' : 'border-border hover:bg-bg-cream'}`}
          >
            <t.icon size={18} className={`mx-auto mb-1 ${t.color}`} />
            <div className="text-sm font-medium">{typeCounts[t.key as keyof typeof typeCounts]}</div>
            <div className="text-xs text-text-light">{t.label}</div>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="p-3 border-b flex items-center justify-between">
          <span className="text-sm text-text-light">{items.length} thông báo</span>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showUnreadOnly} onChange={e => setShowUnreadOnly(e.target.checked)} className="rounded" />
            Chỉ hiện chưa đọc ({unreadCount})
          </label>
        </div>
        <div className="divide-y max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-text-light">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-text-light">Không có thông báo</div>
          ) : items.map(item => {
            const cfg = typeConfig[item.type] || typeConfig.info;
            const Icon = cfg.icon;
            return (
              <div key={item.id} className={`p-4 hover:bg-bg-cream/50 transition-colors ${!item.readStatus ? 'bg-blue-50/30' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${cfg.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm ${!item.readStatus ? 'font-semibold' : 'font-medium'}`}>{item.title}</h3>
                      {!item.readStatus && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                      <span className={`text-xs px-1.5 py-0.5 rounded ${cfg.color} bg-opacity-10`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-text-light mt-1">{item.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-light">
                      <span>{userMap[item.userId] || item.userId}</span>
                      <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!item.readStatus && (
                      <button onClick={() => handleMarkRead(item.id)} className="p-1.5 hover:bg-green-50 rounded text-green-600" title="Đánh dấu đã đọc">
                        <Check size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600" title="Xóa">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Gửi thông báo mới">
        <NotificationForm onSubmit={handleCreate} />
      </Modal>
    </div>
  );
}

function NotificationForm({ onSubmit }: { onSubmit: (d: Partial<Notification>) => void }) {
  const [form, setForm] = useState({ userId: '', title: '', content: '', type: 'info' as const });
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Người nhận *</label>
        <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required>
          <option value="">-- Chọn người nhận --</option>
          {(usersData as { id: string; fullName: string }[]).map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Loại thông báo</label>
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg text-sm">
          <option value="info">Thông tin</option>
          <option value="warning">Cảnh báo</option>
          <option value="reminder">Nhắc nhở</option>
          <option value="approval">Phê duyệt</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Nội dung *</label>
        <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} required />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-1"><Send size={14} /> Gửi</button>
      </div>
    </form>
  );
}
