'use client';

import { useState } from 'react';
import { Building, Users, ChevronDown, ChevronRight, Plus, Search } from 'lucide-react';
import unitsData from '@/data/units.json';
import usersData from '@/data/users.json';

const typeLabels: Record<string, string> = {
  university: 'Trường Đại học',
  faculty: 'Khoa',
  department: 'Phòng/Bộ môn',
  center: 'Trung tâm',
  division: 'Vụ/Đơn vị',
  research: 'Viện',
};

const typeColors: Record<string, string> = {
  university: '#00afef',
  faculty: '#4caf50',
  department: '#ff9800',
  center: '#9c27b0',
  division: '#3f51b5',
  research: '#00bcd4',
};

interface UnitNode {
  id: string;
  parentId: string | null;
  name: string;
  code: string;
  type: string;
  managerId: string;
  status: string;
  children?: UnitNode[];
}

function buildTree(units: Record<string, unknown>[], parentId: string | null = null): UnitNode[] {
  return units
    .filter((u) => u.parentId === parentId)
    .map((u) => ({
      ...u,
      children: buildTree(units, u.id as string),
    })) as UnitNode[];
}

function TreeNode({ node, level = 0 }: { node: UnitNode; level?: number }) {
  const [expanded, setExpanded] = useState(level < 2);
  const manager = usersData.find((u: Record<string, unknown>) => u.id === node.managerId);
  const memberCount = usersData.filter((u: Record<string, unknown>) => u.unitId === node.id).length;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-bg-cream rounded-lg cursor-pointer group"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        {node.children && node.children.length > 0 ? (
          expanded ? (
            <ChevronDown size={14} className="text-text-light" />
          ) : (
            <ChevronRight size={14} className="text-text-light" />
          )
        ) : (
          <span className="w-[14px]" />
        )}
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: typeColors[node.type] || '#9e9e9e' }}
        />
        <Building size={14} className="text-text-light" />
        <span className="font-medium text-sm">{node.name}</span>
        <span className="text-xs text-text-light">({node.code})</span>
        <span
          className="badge text-[10px] py-0"
          style={{
            backgroundColor: `${typeColors[node.type] || '#9e9e9e'}20`,
            color: typeColors[node.type] || '#9e9e9e',
          }}
        >
          {typeLabels[node.type] || node.type}
        </span>
        {memberCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-text-light ml-auto">
            <Users size={12} />
            {memberCount}
          </span>
        )}
        <span className={`text-xs ${node.status === 'active' ? 'text-accent-green' : 'text-accent-red'}`}>
          {node.status === 'active' ? '●' : '○'}
        </span>
      </div>
      {expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'tree' | 'list'>('tree');
  const tree = buildTree(unitsData as unknown as Record<string, unknown>[]);

  const totalUnits = unitsData.length;
  const activeUnits = unitsData.filter((u: Record<string, unknown>) => u.status === 'active').length;
  const totalUsers = usersData.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Cơ cấu tổ chức</h1>
          <p className="text-text-light mt-1">Quản lý cây tổ chức và đơn vị trực thuộc</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Thêm đơn vị
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><Building size={20} className="text-primary" /></div>
            <div>
              <p className="text-text-light text-sm">Tổng đơn vị</p>
              <p className="text-xl font-bold">{totalUnits}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><Building size={20} className="text-accent-green" /></div>
            <div>
              <p className="text-text-light text-sm">Đang hoạt động</p>
              <p className="text-xl font-bold">{activeUnits}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><Users size={20} className="text-accent-yellow" /></div>
            <div>
              <p className="text-text-light text-sm">Nhân sự</p>
              <p className="text-xl font-bold">{totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm đơn vị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('tree')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'tree' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-dark'
          }`}
        >
          <Building size={16} />
          Cây tổ chức
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'list' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-dark'
          }`}
        >
          <Building size={16} />
          Danh sách đơn vị
        </button>
      </div>

      {activeTab === 'tree' && (
        <div className="card">
          <div className="p-2 max-h-[600px] overflow-y-auto">
            {tree.map((node) => (
              <TreeNode key={node.id} node={node} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="card">
          <div className="p-0">
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên đơn vị</th>
                <th>Loại</th>
                <th>Đơn vị cha</th>
                <th>Trưởng đơn vị</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {unitsData
                .filter((u: Record<string, unknown>) => {
                  if (!searchTerm) return true;
                  return (u.name as string).toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (u.code as string).toLowerCase().includes(searchTerm.toLowerCase());
                })
                .map((unit: Record<string, unknown>) => {
                  const parent = unitsData.find((u: Record<string, unknown>) => u.id === unit.parentId);
                  const manager = usersData.find((u: Record<string, unknown>) => u.id === unit.managerId);
                  return (
                    <tr key={unit.id as string}>
                      <td><span className="badge badge-info">{unit.code as string}</span></td>
                      <td className="font-medium">{unit.name as string}</td>
                      <td>
                        <span
                          className="badge text-[10px]"
                          style={{
                            backgroundColor: `${typeColors[unit.type as string] || '#9e9e9e'}20`,
                            color: typeColors[unit.type as string] || '#9e9e9e',
                          }}
                        >
                          {typeLabels[unit.type as string] || String(unit.type)}
                        </span>
                      </td>
                      <td className="text-sm">{parent ? (parent.name as string) : '-'}</td>
                      <td className="text-sm">{manager ? (manager.fullName as string) : '-'}</td>
                      <td>
                        <span className={`badge ${unit.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {unit.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
