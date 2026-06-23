'use client';

import {
  Building2, Users, User, ArrowDown, ArrowUp, ArrowRight,
  BookOpen, Award, Globe, Landmark, Laptop,
  CheckCircle, Clock, FileText, Eye, Lock, Star,
  BarChart2, TrendingUp, Target, Layers, GitBranch,
  ClipboardList, AlertTriangle, Settings, Shield,
  ChevronDown, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const schoolFields = [
  { name: 'Đào tạo & ĐBCLGD', weight: 35, kpis: 10, icon: BookOpen, color: '#00afef', examples: ['Tuyển sinh ≥90%', 'Tốt nghiệp đúng hạn ≥80%', 'Hài lòng ≥80%'] },
  { name: 'KHCN & ĐMST', weight: 30, kpis: 7, icon: Award, color: '#4caf50', examples: ['Công bố/GV ≥1.6', 'WoS/Scopus/GV ≥0.6', 'SHTT chấp nhận 14'] },
  { name: 'Đội ngũ & phát triển GV', weight: 10, kpis: 2, icon: Users, color: '#ff9800', examples: ['GV có TS ≥59%', 'GS/PGS 15'] },
  { name: 'Quốc tế hóa', weight: 8, kpis: 2, icon: Globe, color: '#9c27b0', examples: ['SV quốc tế 700', 'Trao đổi tín chỉ 100'] },
  { name: 'Quản trị & tài chính', weight: 10, kpis: 2, icon: Landmark, color: '#f44336', examples: ['Tăng trưởng ≥10%', 'Biên độ 3 năm ≥10%'] },
  { name: 'Chuyển đổi số', weight: 7, kpis: 2, icon: Laptop, color: '#00bcd4', examples: ['Quy trình online ≥80%', 'Văn bản ký số 100%'] },
];

const roles = [
  { name: 'Ban Giám hiệu', icon: Shield, color: '#0d47a1', duties: 'Xem dashboard, giao mục tiêu, phê duyệt, khóa kết quả' },
  { name: 'Hội đồng KPI', icon: Users, color: '#607d8b', duties: 'Rà soát minh chứng, chuẩn hóa điểm, xử lý khiếu nại' },
  { name: 'Trưởng đơn vị', icon: Building2, color: '#4caf50', duties: 'Giao KPI, duyệt kế hoạch, đánh giá cấp dưới' },
  { name: 'Cán bộ phụ trách KPI', icon: ClipboardList, color: '#ff9800', duties: 'Tổng hợp, kiểm tra minh chứng, báo cáo' },
  { name: 'Giảng viên/VC', icon: User, color: '#00afef', duties: 'Đăng ký KPI, cập nhật tiến độ, nộp minh chứng' },
  { name: 'Quản trị hệ thống', icon: Settings, color: '#9c27b0', duties: 'Cấu hình, phân quyền, nhật ký, sao lưu' },
];

const orgTree = {
  name: 'Đại học Cần Thơ',
  code: 'CTU',
  level: 'Trường',
  kpiCount: 23,
  evaluator: 'Ban Giám hiệu',
  evalProcess: 'Tự ĐG → Hội đồng → Khóa',
  color: '#0d47a1',
  children: [
    {
      name: 'Khoa CNTT',
      code: 'KCN',
      level: 'Khoa',
      kpiCount: 11,
      evaluator: 'Trưởng khoa',
      evalProcess: 'Tự ĐG → Trưởng khoa → Hội đồng → Khóa',
      color: '#4caf50',
      children: [
        {
          name: 'Bộ môn KHMT',
          code: 'BMKHMT',
          level: 'Bộ môn',
          kpiCount: 9,
          evaluator: 'Trưởng bộ môn',
          evalProcess: 'Tự ĐG → Trưởng BM → Hội đồng → Khóa',
          color: '#ff9800',
          children: [
            { name: 'Giảng viên A', code: 'GV', level: 'Cá nhân', kpiCount: 7, evaluator: 'Trưởng BM', evalProcess: 'Tự ĐG → Trưởng BM → Hội đồng → Khóa', color: '#00afef', children: [] },
            { name: 'Giảng viên B', code: 'GV', level: 'Cá nhân', kpiCount: 7, evaluator: 'Trưởng BM', evalProcess: 'Tự ĐG → Trưởng BM → Hội đồng → Khóa', color: '#00afef', children: [] },
          ],
        },
        {
          name: 'Bộ môn KMTT',
          code: 'BMKMTT',
          level: 'Bộ môn',
          kpiCount: 9,
          evaluator: 'Trưởng bộ môn',
          evalProcess: 'Tự ĐG → Trưởng BM → Hội đồng → Khóa',
          color: '#ff9800',
          children: [
            { name: 'Giảng viên C', code: 'GV', level: 'Cá nhân', kpiCount: 7, evaluator: 'Trưởng BM', evalProcess: 'Tự ĐG → Trưởng BM → Hội đồng → Khóa', color: '#00afef', children: [] },
          ],
        },
      ],
    },
    {
      name: 'Phòng Đào tạo',
      code: 'PDT',
      level: 'Phòng ban',
      kpiCount: 10,
      evaluator: 'Trưởng phòng',
      evalProcess: 'Tự ĐG → Trưởng phòng → Hội đồng → Khóa',
      color: '#4caf50',
      children: [
        { name: 'Chuyên viên Đào tạo', code: 'CVDT', level: 'Cá nhân', kpiCount: 6, evaluator: 'Trưởng phòng', evalProcess: 'Tự ĐG → Trưởng phòng → Hội đồng → Khóa', color: '#00afef', children: [] },
        { name: 'Chuyên viên Học vụ', code: 'CVDT', level: 'Cá nhân', kpiCount: 6, evaluator: 'Trưởng phòng', evalProcess: 'Tự ĐG → Trưởng phòng → Hội đồng → Khóa', color: '#00afef', children: [] },
      ],
    },
    {
      name: 'Phòng KHCN',
      code: 'PKHCN',
      level: 'Phòng ban',
      kpiCount: 10,
      evaluator: 'Trưởng phòng',
      evalProcess: 'Tự ĐG → Trưởng phòng → Hội đồng → Khóa',
      color: '#4caf50',
      children: [
        { name: 'Nghiên cứu viên', code: 'NCV', level: 'Cá nhân', kpiCount: 7, evaluator: 'Trưởng phòng', evalProcess: 'Tự ĐG → Trưởng phòng → Hội đồng → Khóa', color: '#00afef', children: [] },
      ],
    },
    {
      name: 'Phòng Tổ chức và Phát triển nhân sự',
      code: 'PTCNS',
      level: 'Phòng ban',
      kpiCount: 9,
      evaluator: 'Trưởng phòng',
      evalProcess: 'Tự ĐG → Trưởng phòng → Hội đồng → Khóa',
      color: '#4caf50',
      children: [],
    },
    {
      name: 'Trung tâm Chuyển đổi số và Truyền thông',
      code: 'TTCDS',
      level: 'Trung tâm',
      kpiCount: 10,
      evaluator: 'Giám đốc TT',
      evalProcess: 'Tự ĐG → Giám đốc TT → Hội đồng → Khóa',
      color: '#4caf50',
      children: [
        { name: 'Chuyên viên CNTT', code: 'CVCNTT', level: 'Cá nhân', kpiCount: 6, evaluator: 'Giám đốc TT', evalProcess: 'Tự ĐG → Giám đốc TT → Hội đồng → Khóa', color: '#00afef', children: [] },
      ],
    },
  ],
};

const evaluationFlows = [
  {
    title: 'Cấp Trường',
    subtitle: '23 KPI chiến lược',
    color: '#0d47a1',
    steps: [
      { actor: 'Ban Giám hiệu', action: 'Tự đánh giá KPI cấp Trường', icon: Star },
      { actor: 'Hội đồng KPI', action: 'Rà soát, chuẩn hóa điểm', icon: Users },
      { actor: 'Hội đồng KPI', action: 'Khóa kết quả cuối kỳ', icon: Lock },
    ],
    input: 'Dashboard tổng hợp, dữ liệu 6 lĩnh vực',
    output: 'Điểm KPI Trường, bảng xếp loại đơn vị',
  },
  {
    title: 'Cấp Khoa/Phòng ban',
    subtitle: '9-11 KPI đơn vị',
    color: '#4caf50',
    steps: [
      { actor: 'Cá nhân/Đơn vị', action: 'Tự đánh giá KPI đơn vị', icon: Star },
      { actor: 'Ban Giám hiệu', action: 'Đánh giá cấp trên', icon: Eye },
      { actor: 'Hội đồng KPI', action: 'Rà soát, chuẩn hóa điểm', icon: Users },
      { actor: 'Hội đồng KPI', action: 'Khóa kết quả', icon: Lock },
    ],
    input: 'KPI được giao từ cấp Trường, dữ liệu đơn vị',
    output: 'Điểm KPI đơn vị, xếp loại, báo cáo',
  },
  {
    title: 'Cấp Cá nhân',
    subtitle: '6-8 KPI theo vị trí việc làm',
    color: '#00afef',
    steps: [
      { actor: 'Cá nhân', action: 'Tự đánh giá + nộp minh chứng', icon: Star },
      { actor: 'Trưởng đơn vị', action: 'Đánh giá cấp trên', icon: Eye },
      { actor: 'Hội đồng KPI', action: 'Rà soát, chuẩn hóa điểm', icon: Users },
      { actor: 'Hội đồng KPI', action: 'Khóa kết quả', icon: Lock },
    ],
    input: 'KPI theo vị trí, minh chứng số, dữ liệu hệ thống',
    output: 'Điểm KPI cá nhân, xếp loại, thi đua, khen thưởng',
  },
];

function OrgNode({ node, level = 0, isLast = false }: { node: typeof orgTree; level?: number; isLast?: boolean }) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative">
      {level > 0 && (
        <div className="absolute left-0 top-0 w-px h-full" style={{ backgroundColor: `${node.color}30` }} />
      )}
      <div
        className={`flex items-start gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-bg-cream transition-colors ${level === 0 ? '' : 'ml-4'}`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? <ChevronDown size={14} className="mt-1 text-text-light flex-shrink-0" /> : <ChevronRight size={14} className="mt-1 text-text-light flex-shrink-0" />
        ) : (
          <div className="w-[14px] flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: node.color }} />
            <span className="font-medium text-sm">{node.name}</span>
            <span className="badge text-[10px]" style={{ backgroundColor: `${node.color}20`, color: node.color }}>{node.code}</span>
            <span className="badge text-[10px] bg-bg-cream text-text-light">{node.level}</span>
            <span className="text-xs text-text-light">{node.kpiCount} KPI</span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-[11px] text-text-light">
            <span>Đánh giá: <span className="font-medium text-text-dark">{node.evaluator}</span></span>
            <span>Quy trình: <span className="font-medium text-text-dark">{node.evalProcess}</span></span>
          </div>
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="ml-4 relative">
          {node.children!.map((child, idx) => (
            <OrgNode key={child.code + idx} node={child} level={level + 1} isLast={idx === node.children!.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ArchitecturePage() {
  const [expandedFlow, setExpandedFlow] = useState<number | null>(0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-dark">
          Kiến trúc tổng quát Hệ thống KPI
        </h1>
        <p className="text-text-light mt-1">
          Đại học Cần Thơ — 4 cấp quản trị: Trường → Khoa/Phòng ban → Bộ môn → Cá nhân
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header flex items-center gap-2">
          <Building2 size={18} />
          <span>Cây tổ chức & Quy trình đánh giá 4 cấp</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-text-light mb-4">
            Click vào đơn vị để mở rộng/xem chi tiết. Mỗi cấp có quy trình đánh giá riêng, dữ liệu roll-up từ dưới lên.
          </p>
          <div className="border border-border rounded-lg p-3 max-h-[500px] overflow-y-auto">
            <OrgNode node={orgTree} />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0d47a1' }} />
              <span>Cấp Trường (23 KPI)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4caf50' }} />
              <span>Cấp Khoa/Phòng ban (9-11 KPI)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff9800' }} />
              <span>Cấp Bộ môn (9 KPI)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00afef' }} />
              <span>Cấp Cá nhân (6-8 KPI)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header flex items-center gap-2">
          <GitBranch size={18} />
          <span>Luồng Roll-up — Tổng hợp kết quả từ Cá nhân lên Trường</span>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between gap-3">
            {[
              { label: 'Cá nhân', sub: '20 nhóm vị trí\n6-8 KPI/người\nTự ĐG + minh chứng', color: '#00afef', icon: User },
              { label: 'Bộ môn', sub: 'Tổng hợp cá nhân\n9 KPI bộ môn\nTrưởng BM đánh giá', color: '#ff9800', icon: Users },
              { label: 'Khoa/Phòng ban', sub: 'Tổng hợp bộ môn\n9-11 KPI đơn vị\nTrưởng đơn vị ĐG', color: '#4caf50', icon: Building2 },
              { label: 'Trường', sub: '23 KPI chiến lược\n6 lĩnh vực\nBGH + Hội đồng ĐG', color: '#0d47a1', icon: Shield },
            ].map((node, idx) => {
              const Icon = node.icon;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className="p-4 rounded-xl border-2 text-center w-40" style={{ borderColor: node.color, backgroundColor: `${node.color}08` }}>
                    <Icon size={24} style={{ color: node.color }} className="mx-auto mb-2" />
                    <div className="font-heading font-bold text-sm" style={{ color: node.color }}>{node.label}</div>
                    <div className="text-[10px] text-text-light mt-1 whitespace-pre-line">{node.sub}</div>
                  </div>
                  {idx < 3 && (
                    <div className="flex flex-col items-center gap-1">
                      <ArrowRight size={20} className="text-primary" />
                      <span className="text-[10px] text-text-light">Roll-up</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-bg-cream rounded-lg border border-border text-xs text-text-light text-center">
            Mỗi cấp tổng hợp kết quả từ cấp dưới → Chuẩn hóa theo trọng số → Tính điểm → Xếp loại → Lên cấp trên
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header flex items-center gap-2">
          <ClipboardList size={18} />
          <span>Quy trình đánh giá chi tiết theo cấp</span>
        </div>
        <div className="p-4 space-y-4">
          {evaluationFlows.map((flow, flowIdx) => (
            <div key={flowIdx} className="border border-border rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-bg-cream transition-colors"
                onClick={() => setExpandedFlow(expandedFlow === flowIdx ? null : flowIdx)}
                style={{ borderLeft: `4px solid ${flow.color}` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${flow.color}15` }}>
                    <span className="font-heading font-bold text-lg" style={{ color: flow.color }}>{flowIdx + 1}</span>
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm" style={{ color: flow.color }}>{flow.title}</div>
                    <div className="text-xs text-text-light">{flow.subtitle}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-light">
                  <span>{flow.steps.length} bước</span>
                  {expandedFlow === flowIdx ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </div>
              {expandedFlow === flowIdx && (
                <div className="p-4 border-t border-border bg-bg-cream/50">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-white rounded-lg border border-border">
                      <div className="text-[10px] text-text-light mb-1">Đầu vào</div>
                      <div className="text-xs font-medium">{flow.input}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-border">
                      <div className="text-[10px] text-text-light mb-1">Đầu ra</div>
                      <div className="text-xs font-medium">{flow.output}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {flow.steps.map((step, stepIdx) => {
                      const Icon = step.icon;
                      return (
                        <div key={stepIdx} className="flex items-center gap-2">
                          <div className="p-3 bg-white rounded-lg border border-border flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: flow.color }}>
                                {stepIdx + 1}
                              </span>
                              <Icon size={12} style={{ color: flow.color }} />
                            </div>
                            <div className="text-[10px] text-text-light">{step.actor}</div>
                            <div className="text-xs font-medium mt-0.5">{step.action}</div>
                          </div>
                          {stepIdx < flow.steps.length - 1 && (
                            <ArrowRight size={14} className="text-text-light flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="card-header flex items-center gap-2">
            <Target size={18} />
            <span>6 Lĩnh vực KPI cấp Trường</span>
          </div>
          <div className="p-4 space-y-3">
            {schoolFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.name} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-bg-cream">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${field.color}20` }}>
                    <Icon size={18} style={{ color: field.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{field.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-light">{field.kpis} KPI</span>
                        <span className="badge text-xs" style={{ backgroundColor: `${field.color}20`, color: field.color }}>{field.weight}%</span>
                      </div>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {field.examples.map((ex, i) => (
                        <div key={i} className="text-xs text-text-light flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: field.color }} />
                          {ex}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="card-header flex items-center gap-2">
            <Shield size={18} />
            <span>Ma trận vai trò & Phân quyền</span>
          </div>
          <div className="p-4 space-y-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div key={role.name} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-bg-cream">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${role.color}20` }}>
                    <Icon size={18} style={{ color: role.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{role.name}</div>
                    <div className="text-xs text-text-light mt-1">{role.duties}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card overflow-hidden">
          <div className="card-header flex items-center gap-2">
            <BarChart2 size={18} />
            <span>Công thức tính điểm</span>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="p-3 bg-bg-cream rounded-lg border border-border">
              <div className="font-medium text-xs text-text-light mb-1">Tỉ lệ hoàn thành</div>
              <code className="text-xs">= Thực tế / Chỉ tiêu × 100%</code>
            </div>
            <div className="p-3 bg-bg-cream rounded-lg border border-border">
              <div className="font-medium text-xs text-text-light mb-1">Điểm KPI</div>
              <code className="text-xs">= min(Tỉ lệ, 120%) × MaxPoint / 100</code>
            </div>
            <div className="p-3 bg-bg-cream rounded-lg border border-border">
              <div className="font-medium text-xs text-text-light mb-1">Điểm nhóm</div>
              <code className="text-xs">= Σ(Điểm KPI × Trọng số) / ΣTrọng số</code>
            </div>
            <div className="p-3 bg-bg-cream rounded-lg border border-border">
              <div className="font-medium text-xs text-text-light mb-1">Hệ số minh chứng</div>
              <code className="text-xs">Hợp lệ: 1 | Thiếu: 0.5 | Không có: 0</code>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="card-header flex items-center gap-2">
            <Star size={18} />
            <span>Xếp loại KPI</span>
          </div>
          <div className="p-4 space-y-3">
            {[
              { grade: 'Xuất sắc', range: '≥90 điểm', color: '#4caf50', bg: '#e8f5e9' },
              { grade: 'Tốt', range: '80 - 89 điểm', color: '#2196f3', bg: '#e3f2fd' },
              { grade: 'Đạt', range: '65 - 79 điểm', color: '#ff9800', bg: '#fff3e0' },
              { grade: 'Cần cải thiện', range: '50 - 64 điểm', color: '#ffc107', bg: '#fffde7' },
              { grade: 'Không đạt', range: '< 50 điểm', color: '#f44336', bg: '#ffebee' },
            ].map((g) => (
              <div key={g.grade} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: g.bg }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                <div className="flex-1"><span className="font-medium text-sm" style={{ color: g.color }}>{g.grade}</span></div>
                <span className="text-xs text-text-light">{g.range}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="card-header flex items-center gap-2">
            <Layers size={18} />
            <span>Luồng dữ liệu</span>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Hệ thống nguồn', sub: 'Đào tạo, Nhân sự, KHCN, Tài chính, LMS, Eoffice', color: '#9c27b0' },
              { label: 'API/ETL', sub: 'Đồng bộ dữ liệu tự động hoặc import Excel', color: '#ff9800' },
              { label: 'Kho KPI', sub: 'Lưu trữ KPI, kết quả, minh chứng, đánh giá', color: '#00afef' },
              { label: 'Dashboard/BI', sub: 'Biểu đồ, cảnh báo, so sánh, drill-down', color: '#4caf50' },
              { label: 'Báo cáo', sub: 'Xuất báo cáo, xếp loại, thi đua', color: '#f44336' },
            ].map((node, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />
                <div className="flex-1 p-2 rounded-lg border" style={{ borderColor: `${node.color}30`, backgroundColor: `${node.color}08` }}>
                  <div className="text-xs font-medium" style={{ color: node.color }}>{node.label}</div>
                  <div className="text-[10px] text-text-light">{node.sub}</div>
                </div>
                {idx < 4 && <ArrowDown size={12} className="text-text-light rotate-[-90deg] mx-auto" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
