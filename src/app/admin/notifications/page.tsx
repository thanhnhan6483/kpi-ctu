'use client';

import { useState } from 'react';
import { Bell, Check, CheckCheck, AlertTriangle, Clock, Info, FileText, Trash2, Filter } from 'lucide-react';
import notificationsData from '@/data/notifications.json';
import usersData from '@/data/users.json';

const typeConfig: Record<string, { label: string; color: string; icon: typeof Bell }> = {
  info: { label: 'Thông tin', color: '#2196f3', icon: Info },
  warning: { label: 'Cảnh báo', color: '#ff9800', icon: AlertTriangle },
  reminder: { label: 'Nhắc nhở', color: '#ffc107', icon: Clock },
  approval: { label: 'Phê duyệt', color: '#9c27b0', icon: FileText },
};

export default function NotificationsPage() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const getUserName = (userId: string) => {
    const user = usersData.find((u: Record<string, unknown>) => u.id === userId);
    return user ? (user.fullName as string) : userId;
  };

  const filteredNotifications = notificationsData.filter((n: Record<string, unknown>) => {
    const matchesType = typeFilter === 'all' || n.type === typeFilter;
    const matchesRead = !showUnreadOnly || !n.readStatus;
    return matchesType && matchesRead;
  });

  const unreadCount = notificationsData.filter((n: Record<string, unknown>) => !n.readStatus).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Thông báo</h1>
          <p className="text-text-light mt-1">Quản lý thông báo và nhắc việc hệ thống</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <CheckCheck size={16} />
            Đọc tất cả
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><Bell size={20} className="text-primary" /></div>
            <div>
              <p className="text-text-light text-sm">Tổng thông báo</p>
              <p className="text-xl font-bold">{notificationsData.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-red/20 rounded-lg"><Bell size={20} className="text-accent-red" /></div>
            <div>
              <p className="text-text-light text-sm">Chưa đọc</p>
              <p className="text-xl font-bold">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><AlertTriangle size={20} className="text-accent-yellow" /></div>
            <div>
              <p className="text-text-light text-sm">Cảnh báo</p>
              <p className="text-xl font-bold">{notificationsData.filter((n: Record<string, unknown>) => n.type === 'warning').length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><Check size={20} className="text-accent-green" /></div>
            <div>
              <p className="text-text-light text-sm">Đã đọc</p>
              <p className="text-xl font-bold">{notificationsData.length - unreadCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex gap-2">
          {Object.entries(typeConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(typeFilter === key ? 'all' : key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === key
                  ? 'bg-primary text-white'
                  : 'bg-white border border-border text-text-dark hover:bg-bg-cream'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            showUnreadOnly
              ? 'bg-accent-red text-white'
              : 'bg-white border border-border text-text-dark hover:bg-bg-cream'
          }`}
        >
          {showUnreadOnly ? 'Hiện tất cả' : 'Chưa đọc'}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-white">Danh sách thông báo</h3>
        </div>
        <div className="p-0">
          <div className="divide-y divide-border">
            {filteredNotifications.map((n: Record<string, unknown>) => {
              const config = typeConfig[n.type as string] || typeConfig.info;
              const Icon = config.icon;
              return (
                <div
                  key={n.id as string}
                  className={`flex items-start gap-4 p-4 hover:bg-bg-cream transition-colors ${
                    !n.readStatus ? 'bg-primary-light/30' : ''
                  }`}
                >
                  <div className="mt-1">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <Icon size={16} style={{ color: config.color }} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{n.title as string}</span>
                      {!n.readStatus && (
                        <span className="w-2 h-2 rounded-full bg-accent-red" />
                      )}
                    </div>
                    <p className="text-sm text-text-light mt-1">{n.content as string}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-light">
                      <span>{getUserName(n.userId as string)}</span>
                      <span>•</span>
                      <span>{new Date(n.createdAt as string).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!n.readStatus && (
                      <button className="p-1 text-primary hover:bg-primary-light rounded" title="Đánh dấu đã đọc">
                        <Check size={14} />
                      </button>
                    )}
                    <button className="p-1 text-text-light hover:bg-bg-cream rounded" title="Xóa">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
