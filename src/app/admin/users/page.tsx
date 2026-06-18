'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, User, Eye } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import unitsData from '@/data/units.json';

interface UserData {
  id: string;
  username: string;
  fullName: string;
  email: string;
  employeeCode: string;
  unitId: string;
  positionId: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      const data = await apiGet<UserData[]>('/api/users');
      setUsers(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const getUnitName = (unitId: string) => {
    const unit = (unitsData as Record<string, unknown>[]).find((u: Record<string, unknown>) => u.id === unitId);
    return unit ? (unit.name as string) : unitId;
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data: Partial<UserData>) => {
    await apiPost('/api/users', data);
    setShowCreate(false);
    loadUsers();
  };

  const handleUpdate = async (data: Partial<UserData>) => {
    if (!selectedUser) return;
    await apiPut(`/api/users/${selectedUser.id}`, data);
    setShowEdit(false);
    setSelectedUser(null);
    loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa người dùng này?')) return;
    await apiDelete(`/api/users/${id}`);
    loadUsers();
  };

  const handleToggleStatus = async (user: UserData) => {
    await apiPut(`/api/users/${user.id}`, { status: user.status === 'active' ? 'inactive' : 'active' });
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý người dùng</h1>
          <p className="text-text-light mt-1">Quản lý tài khoản và phân quyền</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Thêm người dùng
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><User size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng người dùng</p><p className="text-xl font-bold">{users.length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><User size={20} className="text-accent-green" /></div>
            <div><p className="text-text-light text-sm">Đang hoạt động</p><p className="text-xl font-bold">{users.filter(u => u.status === 'active').length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><User size={20} className="text-accent-yellow" /></div>
            <div><p className="text-text-light text-sm">Đơn vị</p><p className="text-xl font-bold">{new Set(users.map(u => u.unitId)).size}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-red/20 rounded-lg"><User size={20} className="text-accent-red" /></div>
            <div><p className="text-text-light text-sm">Ngừng hoạt động</p><p className="text-xl font-bold">{users.filter(u => u.status === 'inactive').length}</p></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách người dùng</h3></div>
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
            <input type="text" placeholder="Tìm kiếm người dùng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
          </div>
          <table className="table">
            <thead>
              <tr><th>Tên đăng nhập</th><th>Họ tên</th><th>Email</th><th>Mã NV</th><th>Đơn vị</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">{user.username}</td>
                  <td>{user.fullName}</td>
                  <td className="text-sm">{user.email}</td>
                  <td className="text-sm">{user.employeeCode}</td>
                  <td className="text-sm">{getUnitName(user.unitId)}</td>
                  <td>
                    <button onClick={() => handleToggleStatus(user)}
                      className={`badge cursor-pointer ${user.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {user.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => { setSelectedUser(user); setShowDetail(true); }} className="p-1 text-primary hover:bg-primary-light rounded"><Eye size={14} /></button>
                      <button onClick={() => { setSelectedUser(user); setShowEdit(true); }} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(user.id)} className="p-1 text-accent-red hover:bg-accent-red/10 rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Thêm người dùng mới">
        <UserForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setSelectedUser(null); }} title="Sửa người dùng">
        {selectedUser && <UserForm user={selectedUser} onSubmit={handleUpdate} onCancel={() => { setShowEdit(false); setSelectedUser(null); }} />}
      </Modal>

      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelectedUser(null); }} title="Chi tiết người dùng">
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-xs text-text-light">ID</span><div className="font-medium">{selectedUser.id}</div></div>
              <div><span className="text-xs text-text-light">Tên đăng nhập</span><div className="font-medium">{selectedUser.username}</div></div>
              <div><span className="text-xs text-text-light">Họ tên</span><div className="font-medium">{selectedUser.fullName}</div></div>
              <div><span className="text-xs text-text-light">Email</span><div className="font-medium">{selectedUser.email}</div></div>
              <div><span className="text-xs text-text-light">Mã nhân viên</span><div className="font-medium">{selectedUser.employeeCode}</div></div>
              <div><span className="text-xs text-text-light">Đơn vị</span><div className="font-medium">{getUnitName(selectedUser.unitId)}</div></div>
              <div><span className="text-xs text-text-light">Trạng thái</span><div>
                <span className={`badge ${selectedUser.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                  {selectedUser.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                </span>
              </div></div>
              <div><span className="text-xs text-text-light">Ngày tạo</span><div className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</div></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function UserForm({ user, onSubmit, onCancel }: { user?: UserData; onSubmit: (data: Partial<UserData>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    username: user?.username || '',
    fullName: user?.fullName || '',
    email: user?.email || '',
    employeeCode: user?.employeeCode || '',
    unitId: user?.unitId || '',
    positionId: user?.positionId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Tên đăng nhập *</label>
          <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Họ tên *</label>
          <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Email *</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Mã nhân viên</label>
          <input type="text" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Đơn vị *</label>
          <select value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })} required
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="">-- Chọn đơn vị --</option>
            {(unitsData as Record<string, unknown>[]).filter((u: Record<string, unknown>) => u.type !== 'university').map((u: Record<string, unknown>) => (
              <option key={u.id as string} value={u.id as string}>{u.name as string}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Vị trí việc làm</label>
          <select value={form.positionId} onChange={(e) => setForm({ ...form, positionId: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="">-- Chọn vị trí --</option>
            <option value="p001">Quản trị viên</option>
            <option value="p002">Trưởng đơn vị</option>
            <option value="p003">Giảng viên</option>
            <option value="p004">Trưởng bộ môn</option>
            <option value="p005">Nghiên cứu viên</option>
            <option value="p006">Chuyên viên</option>
            <option value="p007">Nhân viên</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">Hủy</button>
        <button type="submit" className="btn-primary">{user ? 'Cập nhật' : 'Thêm mới'}</button>
      </div>
    </form>
  );
}
