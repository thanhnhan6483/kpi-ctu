'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BarChart2,
  Target,
  GitBranch,
  Settings,
  Award,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Shield,
  LifeBuoy,
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

  {
    href: '/setup',
    label: '① Thiết lập',
    icon: Settings,
    children: [
      { href: '/kpi/academic-years', label: 'Năm học' },
      { href: '/kpi/cycles', label: 'Chu kỳ KPI' },
      { href: '/admin/organization', label: 'Cơ cấu tổ chức' },
      { href: '/admin/positions', label: 'Chức vụ / Chức danh' },
      { href: '/admin/job-positions', label: 'Vị trí việc làm' },
      { href: '/admin/shared-categories', label: 'Danh mục dùng chung' },
      { href: '/admin/exemptions', label: 'Hệ số miễn giảm' },
      { href: '/admin/thresholds', label: 'Ngưỡng cảnh báo' },
      { href: '/admin/sla-configs', label: 'SLA xử lý' },
      { href: '/admin/formulas', label: 'Công thức tính' },
      { href: '/admin/rubrics', label: 'Rubric định tính' },
      { href: '/admin/data-sources', label: 'Nguồn dữ liệu' },
    ],
  },

  {
    href: '/define',
    label: '② Mục tiêu & KPI',
    icon: Target,
    children: [
      { href: '/admin/kpi-data', label: 'Bộ chỉ tiêu KPI' },
      { href: '/kpi/strategic-objectives', label: 'Mục tiêu chiến lược' },
      { href: '/kpi/kpi-templates', label: 'Bộ KPI mẫu' },
      { href: '/admin/bsc', label: 'Bản đồ BSC' },
      { href: '/admin/target-groups', label: 'Nhóm đối tượng' },
      { href: '/admin/import', label: 'Import dữ liệu' },
    ],
  },

  {
    href: '/deploy',
    label: '③ Phân giao & Kế hoạch',
    icon: GitBranch,
    children: [
      { href: '/kpi/cascade', label: 'Phân rã MBO Cascade' },
      { href: '/kpi/plans', label: 'Kế hoạch KPI đơn vị' },
      { href: '/kpi/department-plans', label: 'Kế hoạch KPI bộ môn' },
      { href: '/kpi/my-kpi-registration', label: 'Đăng ký KPI cá nhân' },
      { href: '/kpi/my-kpi', label: 'KPI của tôi' },
    ],
  },

  {
    href: '/execute',
    label: '④ Thực thi & Theo dõi',
    icon: TrendingUp,
    children: [
      { href: '/kpi/progress', label: 'Cập nhật tiến độ' },
      { href: '/kpi/evidences', label: 'Minh chứng' },
      { href: '/kpi/personal-dashboard', label: 'Dashboard cá nhân' },
      { href: '/kpi/warnings', label: 'Cảnh báo & Deadline' },
    ],
  },

  {
    href: '/kpi/domain',
    label: 'Nghiệp vụ KPI',
    icon: Briefcase,
    children: [
      { href: '/kpi/domain/training-admission', label: 'Tuyển sinh' },
      { href: '/kpi/domain/training-program', label: 'CTĐT & Học phần' },
      { href: '/kpi/domain/graduation-employment', label: 'Tốt nghiệp & Việc làm' },
      { href: '/kpi/domain/survey-quality', label: 'Khảo sát & ĐBCL' },
      { href: '/kpi/domain/research', label: 'KHCN' },
      { href: '/kpi/domain/international', label: 'Hợp tác quốc tế' },
      { href: '/kpi/domain/finance', label: 'Tài chính' },
      { href: '/kpi/domain/hr-staffing', label: 'Đội ngũ' },
      { href: '/kpi/domain/digital-transformation', label: 'Chuyển đổi số' },
      { href: '/kpi/domain/community-service', label: 'Phục vụ cộng đồng' },
      { href: '/kpi/domain/lecturer', label: 'Giảng viên' },
      { href: '/kpi/domain/staff', label: 'Viên chức' },
      { href: '/kpi/domain/researcher', label: 'Nghiên cứu viên' },
      { href: '/kpi/domain/service-staff', label: 'Nhân viên phục vụ' },
      { href: '/kpi/domain/adjustment', label: 'Điều chỉnh kết quả' },
    ],
  },

  {
    href: '/kpi/evaluation',
    label: '⑤ Đánh giá & Phê duyệt',
    icon: Award,
    children: [
      { href: '/kpi/evaluation', label: 'Đánh giá đơn vị' },
      { href: '/kpi/evaluation/individual', label: 'Đánh giá cá nhân' },
      { href: '/kpi/council-review', label: 'Hội đồng rà soát' },
      { href: '/kpi/scoring', label: 'Tính điểm & Xếp loại' },
      { href: '/kpi/approvals', label: 'Phê duyệt' },
      { href: '/admin/complaints', label: 'Khiếu nại / Giải trình' },
    ],
  },

  {
    href: '/reporting',
    label: '⑥ Báo cáo & Kết thúc',
    icon: BarChart2,
    children: [
      { href: '/reports', label: 'Báo cáo & Thống kê' },
      { href: '/kpi/trends', label: 'Xu hướng & Dự báo' },
      { href: '/admin/scheduled-reports', label: 'Báo cáo định kỳ' },
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
      { href: '/admin/api-configs', label: 'Kết nối tích hợp' },
      { href: '/admin/data-reconciliation', label: 'Đối soát dữ liệu' },
      { href: '/admin/approval-workflows', label: 'Quy trình phê duyệt' },
      { href: '/admin/settings', label: 'Cài đặt' },
    ],
  },

  {
    href: '/kpi/architecture',
    label: 'Hỗ trợ',
    icon: LifeBuoy,
    children: [
      { href: '/admin/support-tickets', label: 'Yêu cầu hỗ trợ' },
      { href: '/kpi/architecture', label: 'Kiến trúc hệ thống' },
      { href: '/kpi/roles-guide', label: 'Hướng dẫn vai trò' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    if (pathname.startsWith('/kpi/academic') || pathname.startsWith('/kpi/cycles') || pathname.startsWith('/admin/organization') || pathname.startsWith('/admin/positions') || pathname.startsWith('/admin/job-positions') || pathname.startsWith('/admin/shared-categories') || pathname.startsWith('/admin/exemptions') || pathname.startsWith('/admin/thresholds') || pathname.startsWith('/admin/sla-configs') || pathname.startsWith('/admin/formulas') || pathname.startsWith('/admin/rubrics') || pathname.startsWith('/admin/data-sources')) return ['/setup'];
    if (pathname.startsWith('/admin/kpi-data') || pathname.startsWith('/kpi/strategic') || pathname.startsWith('/kpi/kpi-templates') || pathname.startsWith('/admin/bsc') || pathname.startsWith('/admin/target-groups') || pathname.startsWith('/admin/import')) return ['/define'];
    if (pathname.startsWith('/kpi/cascade') || pathname.startsWith('/kpi/plans') || pathname.startsWith('/kpi/department') || pathname.startsWith('/kpi/my-kpi')) return ['/deploy'];
    if (pathname.startsWith('/kpi/progress') || pathname.startsWith('/kpi/evidences') || pathname.startsWith('/kpi/personal-dashboard') || pathname.startsWith('/kpi/warnings')) return ['/execute'];
    if (pathname.startsWith('/kpi/domain')) return ['/kpi/domain'];
    if (pathname.startsWith('/kpi/evaluation') || pathname.startsWith('/kpi/council') || pathname.startsWith('/kpi/scoring') || pathname.startsWith('/kpi/approvals') || pathname.startsWith('/admin/complaints')) return ['/kpi/evaluation'];
    if (pathname.startsWith('/reports') || pathname.startsWith('/kpi/trends') || pathname.startsWith('/admin/scheduled-reports')) return ['/reporting'];
    if (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/roles') || pathname.startsWith('/admin/notifications') || pathname.startsWith('/admin/audit') || pathname.startsWith('/admin/backup') || pathname.startsWith('/admin/security') || pathname.startsWith('/admin/api-configs') || pathname.startsWith('/admin/data-reconciliation') || pathname.startsWith('/admin/approval-workflows') || pathname.startsWith('/admin/settings')) return ['/admin/users'];
    if (pathname.startsWith('/admin/support-tickets') || pathname.startsWith('/kpi/architecture') || pathname.startsWith('/kpi/roles-guide')) return ['/kpi/architecture'];
    return ['/'];
  });

  const toggleGroup = (href: string) => {
    setExpandedGroups((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const isChildActive = (children: { href: string }[]) => children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'));

  const renderChildren = (children: { href: string; label: string; badge?: string }[]) => (
    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-primary-light pl-3">
      {children.map((child) => (
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
  );

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
                {isExpanded && renderChildren(item.children!)}
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
