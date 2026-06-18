'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BarChart2,
  Users,
  FileText,
  CheckCircle,
  Settings,
  Shield,
  Bell,
  Building,
  ClipboardList,
  Clock,
  Award,
  Search,
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface MenuItem {
  href: string;
  label: string;
  icon: typeof Home;
  children?: { href: string; label: string }[];
}

const menuItems: MenuItem[] = [
  { href: '/', label: 'Tổng quan', icon: Home },
  {
    href: '/kpi',
    label: 'Quản lý KPI',
    icon: BarChart2,
    children: [
      { href: '/kpi', label: 'Chỉ tiêu KPI' },
      { href: '/kpi/plans', label: 'Kế hoạch KPI' },
      { href: '/kpi/architecture', label: 'Kiến trúc hệ thống' },
      { href: '/kpi/roles-guide', label: 'Hướng dẫn vai trò' },

      { href: '/kpi/progress', label: 'Tiến độ' },
      { href: '/kpi/evidences', label: 'Minh chứng' },
      { href: '/kpi/evaluation', label: 'Đánh giá đơn vị' },
      { href: '/kpi/evaluation/individual', label: 'Đánh giá cá nhân' },
      { href: '/kpi/approvals', label: 'Phê duyệt' },
    ],
  },
  { href: '/reports', label: 'Báo cáo', icon: FileText },
  {
    href: '/admin',
    label: 'Quản trị',
    icon: Settings,
    children: [
      { href: '/admin/users', label: 'Người dùng' },
      { href: '/admin/roles', label: 'Phân quyền' },
      { href: '/admin/organization', label: 'Tổ chức' },
      { href: '/admin/kpi-data', label: 'Bộ chỉ tiêu KPI' },
      { href: '/kpi/academic-years', label: 'Năm học' },
      { href: '/kpi/cycles', label: 'Chu kỳ KPI' },
      { href: '/admin/audit', label: 'Nhật ký' },
      { href: '/admin/notifications', label: 'Thông báo' },
      { href: '/admin/settings', label: 'Cài đặt' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['/kpi', '/admin']);

  const toggleGroup = (href: string) => {
    setExpandedGroups((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="w-64 bg-white border-r border-border min-h-screen">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo-ctu.png" alt="ĐH Cần Thơ" className="w-10 h-10 object-contain" />
          <div>
            <div className="font-heading font-bold text-primary text-sm">HỆ THỐNG KPI</div>
            <div className="text-xs text-text-light">Đại học Cần Thơ</div>
          </div>
        </Link>
      </div>

      <nav className="p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedGroups.includes(item.href);
          const active = isActive(item.href);

          if (hasChildren) {
            return (
              <div key={item.href} className="mb-1">
                <button
                  onClick={() => toggleGroup(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary-light text-primary font-medium'
                      : 'text-text-dark hover:bg-bg-cream'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm flex-1 text-left">{item.label}</span>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          pathname === child.href
                            ? 'bg-primary text-white font-medium'
                            : 'text-text-light hover:bg-bg-cream hover:text-text-dark'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                active
                  ? 'bg-primary-light text-primary font-medium'
                  : 'text-text-dark hover:bg-bg-cream'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
