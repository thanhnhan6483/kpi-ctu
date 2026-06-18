'use client';

import {
  Shield, Users, Building2, ClipboardList, User, Settings,
  CheckCircle, FileText, Eye, Lock, Star, Edit,
  BarChart2, TrendingUp, AlertTriangle, Clock,
  ChevronRight, ArrowRight, Target, BookOpen,
} from 'lucide-react';
import Link from 'next/link';

const roles = [
  {
    id: 'board',
    name: 'Ban Giám hiệu',
    icon: Shield,
    color: '#0d47a1',
    description: 'Lãnh đạo cấp cao nhất, chịu trách nhiệm chiến lược KPI toàn trường',
    tasks: [
      'Xem dashboard tổng quan toàn trường',
      'Giao mục tiêu chiến lược cấp Trường',
      'Phê duyệt kế hoạch KPI đơn vị',
      'Đánh giá KPI cấp đơn vị',
      'Phê duyệt kết quả đánh giá',
      'Khóa kết quả cuối kỳ',
      'Xem báo cáo xếp loại, thi đua',
    ],
    pages: [
      { href: '/', label: 'Dashboard tổng quan' },
      { href: '/kpi', label: 'Danh mục KPI cấp Trường' },
      { href: '/kpi/plans', label: 'Kế hoạch KPI đơn vị' },
      { href: '/kpi/evaluation', label: 'Đánh giá KPI đơn vị' },
      { href: '/kpi/approvals', label: 'Phê duyệt' },
      { href: '/reports', label: 'Báo cáo & Thống kê' },
    ],
    process: [
      { step: 'Nhận dashboard tổng quan', icon: BarChart2 },
      { step: 'Phê duyệt KPI đơn vị', icon: CheckCircle },
      { step: 'Đánh giá KPI cấp đơn vị', icon: Star },
      { step: 'Xem kết quả Hội đồng rà soát', icon: Eye },
      { step: 'Khóa kết quả cuối kỳ', icon: Lock },
    ],
  },
  {
    id: 'council',
    name: 'Hội đồng KPI',
    icon: Users,
    color: '#607d8b',
    description: 'Rà soát, chuẩn hóa điểm đánh giá, xử lý khiếu nại',
    tasks: [
      'Rà soát minh chứng hợp lệ',
      'Chuẩn hóa điểm giữa các đơn vị/cá nhân',
      'Nhập điểm Hội đồng rà soát',
      'Xử lý khiếu nại, kiến nghị',
      'Khóa kết quả sau khi chuẩn hóa',
      'Xem báo cáo theo phạm vi được giao',
    ],
    pages: [
      { href: '/kpi/evaluation', label: 'Đánh giá KPI đơn vị' },
      { href: '/kpi/evaluation/individual', label: 'Đánh giá KPI cá nhân' },
      { href: '/kpi/approvals', label: 'Phê duyệt' },
      { href: '/reports', label: 'Báo cáo' },
    ],
    process: [
      { step: 'Nhận đánh giá từ cấp trên', icon: Eye },
      { step: 'Rà soát minh chứng', icon: CheckCircle },
      { step: 'Chuẩn hóa điểm', icon: Target },
      { step: 'Nhập điểm Hội đồng', icon: Star },
      { step: 'Khóa kết quả', icon: Lock },
    ],
  },
  {
    id: 'unit_manager',
    name: 'Trưởng đơn vị',
    icon: Building2,
    color: '#4caf50',
    description: 'Quản lý KPI của đơn vị mình, đánh giá cấp dưới',
    tasks: [
      'Tạo kế hoạch KPI đơn vị',
      'Phân bổ KPI cho cá nhân thuộc đơn vị',
      'Duyệt kế hoạch KPI cá nhân',
      'Theo dõi tiến độ đơn vị',
      'Kiểm tra minh chứng',
      'Tự đánh giá KPI đơn vị',
      'Đánh giá KPI cá nhân cấp dưới',
      'Xem báo cáo đơn vị',
    ],
    pages: [
      { href: '/kpi', label: 'Danh mục KPI' },
      { href: '/kpi/plans', label: 'Kế hoạch KPI' },
      { href: '/kpi/progress', label: 'Tiến độ' },
      { href: '/kpi/evidences', label: 'Minh chứng' },
      { href: '/kpi/evaluation', label: 'Đánh giá đơn vị' },
      { href: '/kpi/evaluation/individual', label: 'Đánh giá cá nhân' },
      { href: '/kpi/approvals', label: 'Phê duyệt' },
      { href: '/reports', label: 'Báo cáo' },
    ],
    process: [
      { step: 'Tạo kế hoạch KPI đơn vị', icon: FileText },
      { step: 'Giao KPI cho cá nhân', icon: Users },
      { step: 'Duyệt KPI cá nhân', icon: CheckCircle },
      { step: 'Theo dõi tiến độ', icon: TrendingUp },
      { step: 'Tự đánh giá KPI đơn vị', icon: Star },
      { step: 'Đánh giá KPI cá nhân', icon: Edit },
      { step: 'Gửi Hội đồng rà soát', icon: Eye },
      { step: 'Khóa kết quả', icon: Lock },
    ],
  },
  {
    id: 'kpi_staff',
    name: 'Cán bộ phụ trách KPI',
    icon: ClipboardList,
    color: '#ff9800',
    description: 'Hỗ trợ vận hành KPI tại đơn vị, tổng hợp và báo cáo',
    tasks: [
      'Hỗ trợ cập nhật tiến độ KPI',
      'Kiểm tra minh chứng trước khi phê duyệt',
      'Tổng hợp dữ liệu KPI đơn vị',
      'Lập báo cáo định kỳ',
      'Nhắc nhở cá nhân cập nhật đúng hạn',
      'Đối soát dữ liệu với hệ thống nguồn',
    ],
    pages: [
      { href: '/kpi', label: 'Danh mục KPI' },
      { href: '/kpi/plans', label: 'Kế hoạch KPI' },
      { href: '/kpi/progress', label: 'Tiến độ' },
      { href: '/kpi/evidences', label: 'Minh chứng' },
      { href: '/kpi/evaluation', label: 'Đánh giá' },
      { href: '/kpi/approvals', label: 'Phê duyệt' },
      { href: '/reports', label: 'Báo cáo' },
    ],
    process: [
      { step: 'Hỗ trợ cập nhật tiến độ', icon: TrendingUp },
      { step: 'Kiểm tra minh chứng', icon: CheckCircle },
      { step: 'Tổng hợp dữ liệu', icon: FileText },
      { step: 'Lập báo cáo', icon: BarChart2 },
      { step: 'Nhắc nhở cập nhật', icon: AlertTriangle },
    ],
  },
  {
    id: 'staff',
    name: 'Giảng viên / Viên chức',
    icon: User,
    color: '#00afef',
    description: 'Thực hiện KPI cá nhân theo vị trí việc làm',
    tasks: [
      'Xem KPI được giao theo vị trí việc làm',
      'Cập nhật tiến độ KPI định kỳ',
      'Nộp minh chứng số (file, URL, log hệ thống)',
      'Tự đánh giá KPI cuối kỳ',
      'Theo dõi điểm tạm tính và xếp loại',
      'Bổ sung minh chứng khi có yêu cầu',
    ],
    pages: [
      { href: '/kpi', label: 'Danh mục KPI cá nhân' },
      { href: '/kpi/progress', label: 'Cập nhật tiến độ' },
      { href: '/kpi/evidences', label: 'Nộp minh chứng' },
      { href: '/kpi/evaluation/individual', label: 'Tự đánh giá KPI' },
    ],
    process: [
      { step: 'Xem KPI được giao', icon: Eye },
      { step: 'Cập nhật tiến độ', icon: TrendingUp },
      { step: 'Nộp minh chứng', icon: FileText },
      { step: 'Tự đánh giá', icon: Star },
      { step: 'Chờ Trưởng đơn vị đánh giá', icon: Clock },
      { step: 'Chờ Hội đồng rà soát', icon: Users },
      { step: 'Xem kết quả cuối kỳ', icon: CheckCircle },
    ],
  },
  {
    id: 'admin',
    name: 'Quản trị hệ thống',
    icon: Settings,
    color: '#9c27b0',
    description: 'Cấu hình, quản lý người dùng, phân quyền, bảo mật',
    tasks: [
      'Quản lý tài khoản người dùng',
      'Cấu hình vai trò và phân quyền',
      'Quản lý cây tổ chức',
      'Xem nhật ký hệ thống (audit log)',
      'Quản lý thông báo',
      'Cấu hình tham số KPI (điểm, trọng số)',
      'Sao lưu và phục hồi dữ liệu',
    ],
    pages: [
      { href: '/admin/users', label: 'Quản lý người dùng' },
      { href: '/admin/roles', label: 'Phân quyền' },
      { href: '/admin/organization', label: 'Cơ cấu tổ chức' },
      { href: '/admin/audit', label: 'Nhật ký hệ thống' },
      { href: '/admin/notifications', label: 'Thông báo' },
      { href: '/admin/settings', label: 'Cài đặt hệ thống' },
    ],
    process: [
      { step: 'Cấu hình hệ thống', icon: Settings },
      { step: 'Quản lý người dùng', icon: Users },
      { step: 'Phân quyền', icon: Shield },
      { step: 'Giám sát nhật ký', icon: Eye },
      { step: 'Bảo mật & sao lưu', icon: Lock },
    ],
  },
];

export default function RolesGuidePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-dark">
          Hướng dẫn theo vai trò
        </h1>
        <p className="text-text-light mt-1">
          Mỗi vai trò có nhiệm vụ và quyền hạn riêng. Chọn vai trò của bạn để xem chi tiết.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <a key={role.id} href={`#${role.id}`}
              className="card p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-opacity-50"
              style={{ borderColor: `${role.color}30` }}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${role.color}15` }}>
                  <Icon size={24} style={{ color: role.color }} />
                </div>
                <div>
                  <div className="font-heading font-bold text-sm" style={{ color: role.color }}>{role.name}</div>
                  <div className="text-xs text-text-light mt-0.5">{role.tasks.length} nhiệm vụ</div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {roles.map((role) => {
        const Icon = role.icon;
        return (
          <div key={role.id} id={role.id} className="card overflow-hidden">
            <div className="card-header flex items-center gap-3">
              <Icon size={20} />
              <div>
                <h2 className="font-heading font-bold">{role.name}</h2>
                <p className="text-white/80 text-xs font-normal">{role.description}</p>
              </div>
            </div>
            <div className="p-5">

              <div className="grid grid-cols-3 gap-6 mt-4">
                <div>
                  <h3 className="font-heading font-bold text-sm mb-3 flex items-center gap-2">
                    <CheckCircle size={14} style={{ color: role.color }} />
                    Nhiệm vụ cụ thể
                  </h3>
                  <div className="space-y-2">
                    {role.tasks.map((task, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: role.color }}>
                          {idx + 1}
                        </span>
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-sm mb-3 flex items-center gap-2">
                    <FileText size={14} style={{ color: role.color }} />
                    Trang truy cập
                  </h3>
                  <div className="space-y-2">
                    {role.pages.map((page, idx) => (
                      <Link key={idx} href={page.href}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg-cream text-sm transition-colors group"
                      >
                        <ChevronRight size={12} className="text-text-light group-hover:text-primary" />
                        <span className="group-hover:text-primary">{page.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-sm mb-3 flex items-center gap-2">
                    <TrendingUp size={14} style={{ color: role.color }} />
                    Quy trình thực hiện
                  </h3>
                  <div className="space-y-2">
                    {role.process.map((step, idx) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: role.color }}>
                            {idx + 1}
                          </span>
                          <StepIcon size={12} style={{ color: role.color }} />
                          <span className="text-sm">{step.step}</span>
                          {idx < role.process.length - 1 && (
                            <ArrowRight size={10} className="text-text-light ml-auto" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="card p-6">
        <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
          <Target size={20} className="text-primary" />
          Ma trận quyền hạn tổng hợp
        </h2>
        <div className="overflow-x-auto">
          <table className="table text-xs">
            <thead>
              <tr>
                <th>Chức năng</th>
                <th className="text-center">BGH</th>
                <th className="text-center">Hội đồng</th>
                <th className="text-center">Trưởng ĐV</th>
                <th className="text-center">CB KPI</th>
                <th className="text-center">Giảng viên/VC</th>
                <th className="text-center">Admin</th>
              </tr>
            </thead>
            <tbody>
              {[
                { func: 'Xem dashboard', board: true, council: true, unit_manager: true, kpi_staff: true, staff: true, admin: true },
                { func: 'Quản lý KPI', board: true, council: false, unit_manager: false, kpi_staff: false, staff: false, admin: true },
                { func: 'Tạo kế hoạch KPI', board: true, council: false, unit_manager: true, kpi_staff: false, staff: false, admin: true },
                { func: 'Cập nhật tiến độ', board: false, council: false, unit_manager: true, kpi_staff: true, staff: true, admin: true },
                { func: 'Nộp minh chứng', board: false, council: false, unit_manager: true, kpi_staff: true, staff: true, admin: true },
                { func: 'Duyệt minh chứng', board: false, council: false, unit_manager: true, kpi_staff: true, staff: false, admin: true },
                { func: 'Tự đánh giá', board: false, council: false, unit_manager: true, kpi_staff: false, staff: true, admin: true },
                { func: 'Đánh giá cấp dưới', board: true, council: false, unit_manager: true, kpi_staff: false, staff: false, admin: true },
                { func: 'Rà soát Hội đồng', board: false, council: true, unit_manager: false, kpi_staff: false, staff: false, admin: true },
                { func: 'Khóa kết quả', board: true, council: true, unit_manager: false, kpi_staff: false, staff: false, admin: true },
                { func: 'Xem báo cáo', board: true, council: true, unit_manager: true, kpi_staff: true, staff: true, admin: true },
                { func: 'Xuất báo cáo', board: true, council: false, unit_manager: false, kpi_staff: false, staff: false, admin: true },
                { func: 'Quản trị hệ thống', board: false, council: false, unit_manager: false, kpi_staff: false, staff: false, admin: true },
              ].map((row, idx) => (
                <tr key={idx}>
                  <td className="font-medium">{row.func}</td>
                  {['board', 'council', 'unit_manager', 'kpi_staff', 'staff', 'admin'].map((role) => (
                    <td key={role} className="text-center">
                      {row[role as keyof typeof row] ? (
                        <CheckCircle size={14} className="text-accent-green mx-auto" />
                      ) : (
                        <span className="text-text-light/30">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
