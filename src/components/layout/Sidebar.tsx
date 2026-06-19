'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BarChart2,
  Target,
  GitBranch,
  FileText,
  ClipboardList,
  CheckCircle,
  Bell,
  Settings,
  Users,
  Building,
  Clock,
  Award,
  ChevronDown,
  ChevronRight,
  Compass,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Calendar,
  Briefcase,
  MapPin,
  List,
  Shield,
  History,
  FileWarning,
} from 'lucide-react';
import { useState } from 'react';

interface MenuItem {
  href: string;
  label: string;
  icon: typeof Home;
  badge?: string;
  children?: { href: string; label: string; badge?: string }[];
}

const menuItems: MenuItem[] = [
  { href: '/', label: 'Tổng quan', icon: Home },
  { href: '/kpi/personal-dashboard', label: 'Dashboard cá nhân', icon: BarChart2 },

  {
    href: '/kpi',
    label: 'Định nghĩa KPI',
    icon: Target,
    children: [
      { href: '/kpi', label: 'Chỉ tiêu KPI' },
      { href: '/kpi/strategic-objectives', label: 'Mục tiêu chiến lược' },
      { href: '/kpi/cascade', label: 'Phân rã MBO Cascade' },
      { href: '/kpi/kpi-templates', label: 'Bộ KPI mẫu' },
    ],
  },

  {
    href: '/kpi/plans',
    label: 'Kế hoạch & Thực thi',
    icon: ClipboardList,
    children: [
      { href: '/kpi/plans', label: 'Kế hoạch KPI đơn vị' },
      { href: '/kpi/department-plans', label: 'Kế hoạch KPI bộ môn' },
      { href: '/kpi/my-kpi-registration', label: 'Đăng ký KPI cá nhân' },
      { href: '/kpi/my-kpi', label: 'KPI của tôi' },
      { href: '/kpi/progress', label: 'Cập nhật tiến độ' },
      { href: '/kpi/evidences', label: 'Minh chứng' },
    ],
  },

  {
    href: '/kpi/evaluation',
    label: 'Đánh giá & Phê duyệt',
    icon: Award,
    children: [
      { href: '/kpi/evaluation', label: 'Đánh giá đơn vị' },
      { href: '/kpi/evaluation/individual', label: 'Đánh giá cá nhân' },
      { href: '/kpi/council-review', label: 'Hội đồng rà soát' },
      { href: '/kpi/scoring', label: 'Tính điểm & Xếp loại' },
      { href: '/kpi/approvals', label: 'Phê duyệt' },
    ],
  },

  {
    href: '/kpi/warnings',
    label: 'Cảnh báo & Báo cáo',
    icon: AlertTriangle,
    children: [
      { href: '/kpi/warnings', label: 'Cảnh báo & Deadline' },
      { href: '/reports', label: 'Báo cáo & Thống kê' },
    ],
  },

  {
    href: '/kpi/academic-years',
    label: 'Thiết lập',
    icon: Settings,
    children: [
      { href: '/kpi/academic-years', label: 'Năm học' },
      { href: '/kpi/cycles', label: 'Chu kỳ KPI' },
      { href: '/admin/organization', label: 'Cơ cấu tổ chức' },
      { href: '/admin/positions', label: 'Chức vụ / Chức danh' },
      { href: '/admin/job-positions', label: 'Vị trí việc làm' },
      { href: '/admin/shared-categories', label: 'Danh mục dùng chung' },
      { href: '/admin/exemptions', label: 'Hệ số miễn giảm' },
      { href: '/admin/import', label: 'Import dữ liệu' },
      { href: '/admin/kpi-data', label: 'Bộ chỉ tiêu KPI' },
    ],
  },

  {
    href: '/admin/users',
    label: 'Quản trị',
    icon: Shield,
    children: [
      { href: '/admin/users', label: 'Người dùng' },
      { href: '/admin/roles', label: 'Phân quyền' },
      { href: '/admin/notifications', label: 'Thông báo' },
      { href: '/admin/notification-templates', label: 'Mẫu thông báo' },
      { href: '/admin/audit', label: 'Nhật ký hệ thống' },
      { href: '/admin/backup', label: 'Sao lưu dữ liệu' },
      { href: '/admin/security', label: 'Bảo mật' },
      { href: '/admin/settings', label: 'Cài đặt' },
    ],
  },

  {
    href: '/kpi/architecture',
    label: 'Hướng dẫn',
    icon: BookOpen,
    children: [
      { href: '/kpi/architecture', label: 'Kiến trúc hệ thống' },
      { href: '/kpi/roles-guide', label: 'Hướng dẫn vai trò' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    if (pathname.startsWith('/kpi/strategic') || pathname.startsWith('/kpi/cascade') || pathname.startsWith('/kpi/kpi-templates') || pathname === '/kpi') return ['/kpi'];
    if (pathname.startsWith('/kpi/plans') || pathname.startsWith('/kpi/department') || pathname.startsWith('/kpi/my-kpi') || pathname.startsWith('/kpi/progress') || pathname.startsWith('/kpi/evidences')) return ['/kpi/plans'];
    if (pathname.startsWith('/kpi/evaluation') || pathname.startsWith('/kpi/council') || pathname.startsWith('/kpi/approvals')) return ['/kpi/evaluation'];
    if (pathname.startsWith('/kpi/warnings') || pathname.startsWith('/reports')) return ['/kpi/warnings'];
    if (pathname.startsWith('/kpi/academic') || pathname.startsWith('/kpi/cycles') || pathname.startsWith('/admin/organization') || pathname.startsWith('/admin/positions') || pathname.startsWith('/admin/job-positions') || pathname.startsWith('/admin/shared-categories') || pathname.startsWith('/admin/kpi-data')) return ['/kpi/academic-years'];
    if (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/roles') || pathname.startsWith('/admin/notifications') || pathname.startsWith('/admin/audit') || pathname.startsWith('/admin/settings')) return ['/admin/users'];
    if (pathname.startsWith('/kpi/architecture') || pathname.startsWith('/kpi/roles-guide')) return ['/kpi/architecture'];
    return ['/kpi'];
  });

  const toggleGroup = (href: string) => {
    setExpandedGroups((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const isChildActive = (children: { href: string }[]) => children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'));

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border min-h-screen transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo-ctu.png" alt="ĐH Cần Thơ" className="w-10 h-10 object-contain" />
          <div>
            <div className="font-heading font-bold text-primary text-sm">HỆ THỐNG KPI</div>
            <div className="text-xs text-text-light">Đại học Cần Thơ</div>
          </div>
        </Link>
        <button onClick={onClose} className="p-1 text-text-light hover:text-text-dark lg:hidden" aria-label="Đóng menu">
          ✕
        </button>
      </div>

      <nav className="p-2 overflow-y-auto max-h-[calc(100vh-80px)]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedGroups.includes(item.href);
          const active = isActive(item.href);
          const childActive = hasChildren ? isChildActive(item.children!) : false;

          if (hasChildren) {
            return (
              <div key={item.href} className="mb-1">
                <button
                  onClick={() => toggleGroup(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active || childActive
                      ? 'bg-primary-light text-primary font-medium'
                      : 'text-text-dark hover:bg-bg-cream'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm flex-1 text-left">{item.label}</span>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-primary-light pl-3">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
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
