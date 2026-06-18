'use client';

import { useState } from 'react';
import { Shield, Search, Edit, Check, X, Users, Lock } from 'lucide-react';
import permissionsData from '@/data/permissions.json';
import rolesData from '@/data/roles.json';

const roleLabels: Record<string, string> = {
  admin: 'Quản trị hệ thống',
  board: 'Ban Giám hiệu',
  council: 'Hội đồng KPI',
  unit_manager: 'Trưởng đơn vị',
  kpi_staff: 'Cán bộ phụ trách KPI',
  staff: 'Nhân viên/Giảng viên',
};

const moduleLabels: Record<string, string> = {
  kpi_definition: 'Danh mục KPI',
  kpi_plan: 'Kế hoạch KPI',
  kpi_progress: 'Tiến độ KPI',
  kpi_evidence: 'Minh chứng',
  kpi_evaluation: 'Đánh giá KPI',
  kpi_approval: 'Phê duyệt',
  reports: 'Báo cáo',
  admin: 'Quản trị',
  notifications: 'Thông báo',
  audit_log: 'Nhật ký',
};

const actionLabels: Record<string, string> = {
  create: 'Tạo mới',
  read: 'Xem',
  update: 'Cập nhật',
  delete: 'Xóa',
  approve: 'Phê duyệt',
  verify: 'Xác minh',
  lock: 'Khóa',
  export: 'Xuất',
  manage: 'Quản lý',
};

const scopeLabels: Record<string, string> = {
  all: 'Toàn bộ',
  unit: 'Đơn vị',
  own: 'Cá nhân',
};

const modules = [...new Set(permissionsData.map((p: Record<string, unknown>) => p.module as string))];
const roles = ['admin', 'board', 'council', 'unit_manager', 'kpi_staff', 'staff'];

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getPermMatrix = (module: string, action: string) => {
    return roles.filter(role => {
      return permissionsData.some((p: Record<string, unknown>) =>
        p.module === module && p.action === action && (p.roles as string[]).includes(role)
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Phân quyền hệ thống</h1>
          <p className="text-text-light mt-1">Quản lý vai trò và ma trận quyền hạn</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {roles.map((role) => {
          const count = permissionsData.filter((p: Record<string, unknown>) => (p.roles as string[]).includes(role)).length;
          return (
            <div
              key={role}
              onClick={() => setSelectedRole(selectedRole === role ? null : role)}
              className={`card p-4 cursor-pointer transition-all ${
                selectedRole === role ? 'ring-2 ring-primary' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedRole === role ? 'bg-primary text-white' : 'bg-primary-light'}`}>
                  <Shield size={20} className={selectedRole === role ? 'text-white' : 'text-primary'} />
                </div>
                <div>
                  <div className="font-medium text-sm">{roleLabels[role]}</div>
                  <div className="text-xs text-text-light">{count} quyền</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-white">Ma trận quyền hạn</h3>
          {selectedRole && (
            <span className="text-white/80 text-sm">Xem vai trò: {roleLabels[selectedRole]}</span>
          )}
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Hành động</th>
                <th>Phạm vi</th>
                {roles.map((role) => (
                  <th key={role} className="text-center text-xs">
                    {roleLabels[role]?.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionsData
                .filter((p: Record<string, unknown>) => {
                  if (!searchTerm) return true;
                  const search = searchTerm.toLowerCase();
                  return (
                    (p.module as string).toLowerCase().includes(search) ||
                    (p.action as string).toLowerCase().includes(search) ||
                    moduleLabels[p.module as string]?.toLowerCase().includes(search)
                  );
                })
                .map((perm: Record<string, unknown>, idx: number) => (
                <tr key={idx} className={selectedRole && !(perm.roles as string[]).includes(selectedRole) ? 'opacity-40' : ''}>
                  <td className="font-medium text-sm">{moduleLabels[perm.module as string] || String(perm.module)}</td>
                  <td className="text-sm">{actionLabels[perm.action as string] || String(perm.action)}</td>
                  <td className="text-sm">{scopeLabels[perm.scope as string] || String(perm.scope)}</td>
                  {roles.map((role) => (
                    <td key={role} className="text-center">
                      {(perm.roles as string[]).includes(role) ? (
                        <Check size={14} className="text-accent-green mx-auto" />
                      ) : (
                        <X size={14} className="text-text-light/30 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-white">Chi tiết vai trò</h3>
        </div>
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {modules.map((module) => {
              const perms = permissionsData.filter((p: Record<string, unknown>) => p.module === module);
              return (
                <div key={module} className="p-3 bg-bg-cream rounded-lg border border-border">
                  <div className="font-medium text-sm mb-2">{moduleLabels[module] || module}</div>
                  <div className="space-y-1">
                    {perms.map((perm: Record<string, unknown>, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className="text-text-light">{actionLabels[perm.action as string]}:</span>
                        <div className="flex gap-1">
                          {(perm.roles as string[]).map((role: string) => (
                            <span key={role} className="badge badge-info text-[10px] py-0 px-1">
                              {roleLabels[role]?.split(' ')[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
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
