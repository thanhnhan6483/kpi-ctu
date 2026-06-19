'use client';

import { useState } from 'react';
import { FileText, CheckCircle, Clock, Shield, Key, Users, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react';
import { apiPut } from '@/lib/api';
import usersData from '@/data/users.json';
import rolesData from '@/data/roles.json';
import userRolesData from '@/data/user-roles.json';

interface UserWithRole { id: string; username: string; fullName: string; email: string; status: string; roles: string[]; lastLogin?: string; }

const roleMap: Record<string, string> = {};
(rolesData as { id: string; name: string; description: string }[]).forEach(r => { roleMap[r.id] = r.description; });

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<'password' | 'sessions' | 'roles'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const usersWithRoles: UserWithRole[] = (usersData as any[]).map(u => ({
    ...u,
    roles: (userRolesData as any[]).filter(ur => ur.userId === u.id).map(ur => roleMap[ur.roleId] || ur.roleId),
  }));

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ thông tin' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới không khớp' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu phải có ít nhất 6 ký tự' });
      return;
    }
    setLoading(true);
    try {
      await apiPut('/api/users/u002', { password: newPassword });
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch {
      setMessage({ type: 'error', text: 'Lỗi khi đổi mật khẩu' });
    } finally { setLoading(false); }
  };

  const sessions = [
    { id: 1, device: 'Chrome trên Windows', ip: '192.168.1.100', lastActive: '2026-06-19 14:30', status: 'active' },
    { id: 2, device: 'Safari trên iPhone', ip: '192.168.1.101', lastActive: '2026-06-18 09:15', status: 'inactive' },
    { id: 3, device: 'Firefox trên Linux', ip: '10.0.0.50', lastActive: '2026-06-17 16:45', status: 'inactive' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Bảo mật tài khoản</h1>
          <p className="text-text-light mt-1">Đổi mật khẩu, quản lý phiên đăng nhập, phân quyền (XXI.1-XXI.3)</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'password' as const, label: 'Đổi mật khẩu', icon: Key },
          { key: 'sessions' as const, label: 'Phiên đăng nhập', icon: Monitor },
          { key: 'roles' as const, label: 'Chuyển vai trò', icon: Users },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${activeTab === t.key ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'password' && (
        <div className="card">
          <div className="card-header"><h3 className="text-white">Đổi mật khẩu</h3></div>
          <div className="p-4 max-w-md space-y-4">
            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.text}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text-dark">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu mới *</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" placeholder="Ít nhất 6 ký tự" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu mới *</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
            </div>
            <button onClick={handlePasswordChange} disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <><RefreshCw size={14} className="animate-spin" /> Đang xử lý...</> : <><Lock size={14} /> Đổi mật khẩu</>}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="card">
          <div className="card-header"><h3 className="text-white">Phiên đăng nhập</h3></div>
          <div className="p-0">
            <div className="overflow-x-auto"><table className="table">
              <thead><tr><th>STT</th><th>Thiết bị</th><th>Địa chỉ IP</th><th>Lần hoạt động cuối</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {sessions.map((s, idx) => (
                  <tr key={s.id}>
                    <td>{idx + 1}</td>
                    <td className="font-medium">{s.device}</td>
                    <td className="font-mono text-xs">{s.ip}</td>
                    <td className="text-sm">{s.lastActive}</td>
                    <td><span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{s.status === 'active' ? 'Đang hoạt động' : 'Đã kết thúc'}</span></td>
                    <td>
                      {s.status === 'active' && (
                        <button className="px-3 py-1 border border-red-300 text-red-600 rounded-lg text-xs hover:bg-red-50">Kết thúc</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="card">
          <div className="card-header"><h3 className="text-white">Chuyển vai trò làm việc</h3></div>
          <div className="p-4">
            <p className="text-sm text-text-light mb-4">Chọn vai trò để xem dữ liệu theo phạm vi tương ứng:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { role: 'admin', label: 'Quản trị viên', desc: 'Toàn quyền hệ thống', icon: Shield, color: '#f44336' },
                { role: 'board', label: 'Ban Giám hiệu', desc: 'Xem toàn trường, phê duyệt', icon: Users, color: '#9c27b0' },
                { role: 'council', label: 'Hội đồng KPI', desc: 'Rà soát, khóa kết quả', icon: CheckCircle, color: '#2196f3' },
                { role: 'unit_manager', label: 'Trưởng đơn vị', desc: 'Quản lý KPI đơn vị', icon: Building, color: '#ff9800' },
                { role: 'kpi_staff', label: 'Cán bộ KPI', desc: 'Cập nhật tiến độ, minh chứng', icon: FileText, color: '#4caf50' },
                { role: 'staff', label: 'Nhân viên', desc: 'KPI cá nhân, tự đánh giá', icon: Users, color: '#607d8b' },
              ].map(r => (
                <button key={r.role} className="p-4 border border-border rounded-lg text-left hover:border-primary hover:bg-primary-light/10 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${r.color}20` }}><r.icon size={20} style={{ color: r.color }} /></div>
                    <div>
                      <div className="font-medium text-sm">{r.label}</div>
                      <div className="text-xs text-text-light">{r.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Building(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>; }
function Monitor(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>; }
