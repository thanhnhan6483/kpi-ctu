'use client';

import { useState } from 'react';
import { Search, Filter, BarChart2, Building, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { getCompletionStatus, calcCompletionRate } from '@/lib/kpi';

const schoolKPI = [
  { id: 'CTU-KPI-01', name: 'Tỉ lệ GV có trình độ tiến sĩ', group: 'Đội ngũ', target: 59, actual: 52, unit: '%', weight: 5 },
  { id: 'CTU-KPI-02', name: 'Tỉ lệ học phần trực tuyến', group: 'Đào tạo', target: 10, actual: 12, unit: '%', weight: 4 },
  { id: 'CTU-KPI-03', name: 'Chỉ số tăng trưởng bền vững', group: 'Quản trị', target: 10, actual: 8, unit: '%', weight: 5 },
  { id: 'CTU-KPI-04', name: 'Biên độ hoạt động 3 năm', group: 'Quản trị', target: 10, actual: 11, unit: '%', weight: 5 },
  { id: 'CTU-KPI-05', name: 'Tỉ lệ tuyển sinh ĐH chính quy', group: 'Đào tạo', target: 90, actual: 92, unit: '%', weight: 5 },
  { id: 'CTU-KPI-06', name: 'Tỉ lệ SV tốt nghiệp đúng hạn', group: 'Đào tạo', target: 80, actual: 75, unit: '%', weight: 5 },
  { id: 'CTU-KPI-07', name: 'Số CTĐT tự đánh giá', group: 'Đào tạo', target: 14, actual: 12, unit: 'số', weight: 4 },
  { id: 'CTU-KPI-08', name: 'Tỉ lệ có việc làm sau 12 tháng', group: 'Đào tạo', target: 90, actual: 88, unit: '%', weight: 5 },
  { id: 'CTU-KPI-09', name: 'Tỉ lệ việc làm phù hợp/học tiếp', group: 'Đào tạo', target: 70, actual: 72, unit: '%', weight: 4 },
  { id: 'CTU-KPI-10', name: 'Hài lòng người học với GV', group: 'Đào tạo', target: 80, actual: 85, unit: '%', weight: 4 },
  { id: 'CTU-KPI-11', name: 'Hài lòng người tốt nghiệp', group: 'Đào tạo', target: 70, actual: 68, unit: '%', weight: 4 },
  { id: 'CTU-KPI-12', name: 'Tỉ trọng thu KHCN/tổng thu', group: 'KHCN', target: 10, actual: 11, unit: '%', weight: 5 },
  { id: 'CTU-KPI-13', name: 'Số công bố/GV', group: 'KHCN', target: 1.6, actual: 1.4, unit: 'số', weight: 5 },
  { id: 'CTU-KPI-14', name: 'Số công bố WoS/Scopus/GV', group: 'KHCN', target: 0.6, actual: 0.5, unit: 'số', weight: 5 },
  { id: 'CTU-KPI-15', name: 'Số đơn SHTT được chấp nhận', group: 'KHCN', target: 14, actual: 10, unit: 'số', weight: 4 },
  { id: 'CTU-KPI-16', name: 'Đề tài NCKH hợp tác ĐP/DN', group: 'Phục vụ', target: 20, actual: 18, unit: 'số', weight: 4 },
  { id: 'CTU-KPI-17', name: 'Đề tài NCKH SV cấp cơ sở', group: 'KHCN', target: 400, actual: 380, unit: 'số', weight: 3 },
  { id: 'CTU-KPI-18', name: 'Tỉ lệ VC-NLĐ chủ nhiệm đề tài', group: 'KHCN', target: 10, actual: 12, unit: '%', weight: 4 },
  { id: 'CTU-KPI-19', name: 'Số SV quốc tế', group: 'Quốc tế', target: 700, actual: 650, unit: 'số', weight: 4 },
  { id: 'CTU-KPI-20', name: 'Số SV trao đổi tín chỉ', group: 'Quốc tế', target: 100, actual: 95, unit: 'số', weight: 4 },
  { id: 'CTU-KPI-21', name: 'Số GV đạt chuẩn GS/PGS', group: 'Đội ngũ', target: 15, actual: 12, unit: 'số', weight: 5 },
  { id: 'CTU-KPI-22', name: 'Tỉ lệ quy trình xử lý online', group: 'CĐS', target: 80, actual: 85, unit: '%', weight: 4 },
  { id: 'CTU-KPI-23', name: 'Văn bản ký số trên Eoffice', group: 'CĐS', target: 100, actual: 95, unit: '%', weight: 3 },
];

const unitKPIs: Record<string, { name: string; kpis: Array<{id: string; name: string; target: number; actual: number; unit: string; weight: number}> }> = {
  'PDT': {
    name: 'Phòng Đào tạo',
    kpis: [
      { id: 'DT-01', name: 'Tỉ lệ tuyển sinh chính quy', target: 90, actual: 92, unit: '%', weight: 15 },
      { id: 'DT-02', name: 'Tỉ lệ CTĐT cập nhật đúng hạn', target: 95, actual: 98, unit: '%', weight: 10 },
      { id: 'DT-03', name: 'Tỉ lệ học phần có đề cương chuẩn', target: 95, actual: 92, unit: '%', weight: 10 },
      { id: 'DT-04', name: 'Tỉ lệ học phần trực tuyến', target: 10, actual: 12, unit: '%', weight: 10 },
      { id: 'DT-05', name: 'Tỉ lệ SV tốt nghiệp đúng hạn', target: 80, actual: 78, unit: '%', weight: 15 },
      { id: 'DT-06', name: 'Tỉ lệ xử lý học vụ đúng hạn', target: 95, actual: 96, unit: '%', weight: 10 },
      { id: 'DT-07', name: 'Tỉ lệ dữ liệu đào tạo số hóa', target: 90, actual: 88, unit: '%', weight: 10 },
      { id: 'DT-08', name: 'Hài lòng người học', target: 4, actual: 4.2, unit: 'điểm', weight: 10 },
      { id: 'DT-09', name: 'Báo cáo đào tạo đúng hạn', target: 100, actual: 100, unit: '%', weight: 5 },
      { id: 'DT-10', name: 'Cảnh báo học vụ xử lý', target: 95, actual: 92, unit: '%', weight: 5 },
    ]
  },
  'KHCN': {
    name: 'Phòng KHCN',
    kpis: [
      { id: 'KHCN-01', name: 'Số công bố/GV', target: 1.6, actual: 1.4, unit: 'số', weight: 15 },
      { id: 'KHCN-02', name: 'Số WoS/Scopus/GV', target: 0.6, actual: 0.5, unit: 'số', weight: 15 },
      { id: 'KHCN-03', name: 'Số đơn SHTT chấp nhận', target: 14, actual: 10, unit: 'số', weight: 10 },
      { id: 'KHCN-04', name: 'Đề tài hợp tác ĐP/DN', target: 20, actual: 18, unit: 'số', weight: 10 },
      { id: 'KHCN-05', name: 'Đề tài NCKH SV', target: 400, actual: 380, unit: 'số', weight: 10 },
      { id: 'KHCN-06', name: 'Tỉ lệ đề tài nghiệm thu đúng hạn', target: 90, actual: 88, unit: '%', weight: 10 },
      { id: 'KHCN-07', name: 'Tỉ trọng thu KHCN', target: 10, actual: 11, unit: '%', weight: 10 },
      { id: 'KHCN-08', name: 'Hồ sơ KHCN xử lý online', target: 90, actual: 85, unit: '%', weight: 5 },
      { id: 'KHCN-09', name: 'Sản phẩm chuyển giao', target: 10, actual: 8, unit: 'số', weight: 10 },
      { id: 'KHCN-10', name: 'Dữ liệu công bố chuẩn hóa', target: 95, actual: 92, unit: '%', weight: 5 },
    ]
  },
  'TCCB': {
    name: 'Phòng TCCB',
    kpis: [
      { id: 'TCCB-01', name: 'Tỉ lệ GV có trình độ tiến sĩ', target: 59, actual: 52, unit: '%', weight: 20 },
      { id: 'TCCB-02', name: 'Số GV đạt GS/PGS', target: 15, actual: 12, unit: 'số', weight: 15 },
      { id: 'TCCB-03', name: 'Hồ sơ nhân sự số hóa', target: 95, actual: 92, unit: '%', weight: 10 },
      { id: 'TCCB-04', name: 'Quy hoạch bổ nhiệm đúng hạn', target: 95, actual: 98, unit: '%', weight: 10 },
      { id: 'TCCB-05', name: 'Đánh giá năm đúng hạn', target: 100, actual: 100, unit: '%', weight: 10 },
      { id: 'TCCB-06', name: 'GV tham gia bồi dưỡng', target: 80, actual: 75, unit: '%', weight: 10 },
      { id: 'TCCB-07', name: 'VTVL có mô tả công việc', target: 90, actual: 88, unit: '%', weight: 10 },
      { id: 'TCCB-08', name: 'Dữ liệu nhân sự đồng bộ KPI', target: 98, actual: 95, unit: '%', weight: 10 },
      { id: 'TCCB-09', name: 'Hài lòng đơn vị về dịch vụ nhân sự', target: 4, actual: 3.8, unit: 'điểm', weight: 5 },
    ]
  },
  'CNTT': {
    name: 'Trung tâm CNTT',
    kpis: [
      { id: 'CNTT-01', name: 'Quy trình xử lý online', target: 80, actual: 85, unit: '%', weight: 15 },
      { id: 'CNTT-02', name: 'Hệ thống trọng yếu uptime', target: 99, actual: 99.5, unit: '%', weight: 15 },
      { id: 'CNTT-03', name: 'Sự cố xử lý đúng SLA', target: 95, actual: 92, unit: '%', weight: 10 },
      { id: 'CNTT-04', name: 'Tài khoản đồng bộ SSO', target: 90, actual: 88, unit: '%', weight: 10 },
      { id: 'CNTT-05', name: 'Dữ liệu tích hợp kho DWH', target: 70, actual: 65, unit: '%', weight: 10 },
      { id: 'CNTT-06', name: 'Sao lưu dữ liệu thành công', target: 100, actual: 100, unit: '%', weight: 10 },
      { id: 'CNTT-07', name: 'Lỗ hổng bảo mật xử lý', target: 100, actual: 100, unit: '%', weight: 10 },
      { id: 'CNTT-08', name: 'Hài lòng người dùng CNTT', target: 4, actual: 4.1, unit: 'điểm', weight: 10 },
      { id: 'CNTT-09', name: 'Hệ thống có tài liệu kỹ thuật', target: 90, actual: 85, unit: '%', weight: 5 },
      { id: 'CNTT-10', name: 'Sáng kiến CĐS triển khai', target: 5, actual: 3, unit: 'số', weight: 5 },
    ]
  }
};

const individualKPIs: Record<string, { name: string; kpis: Array<{id: string; name: string; target: number; actual: number; unit: string; weight: number}> }> = {
  'GV': {
    name: 'Giảng viên',
    kpis: [
      { id: 'GV-01', name: 'Hoàn thành khối lượng giảng dạy', target: 100, actual: 105, unit: '%', weight: 20 },
      { id: 'GV-02', name: 'Chất lượng giảng dạy', target: 80, actual: 85, unit: '%', weight: 15 },
      { id: 'GV-03', name: 'Cập nhật đề cương, học liệu LMS', target: 95, actual: 92, unit: '%', weight: 10 },
      { id: 'GV-04', name: 'Công bố khoa học cá nhân', target: 2, actual: 1, unit: 'bài', weight: 20 },
      { id: 'GV-05', name: 'Tham gia đề tài/NCKH SV', target: 3, actual: 2, unit: 'đề tài', weight: 15 },
      { id: 'GV-06', name: 'Phát triển CTĐT/ĐBCL', target: 2, actual: 2, unit: 'nhiệm vụ', weight: 10 },
      { id: 'GV-07', name: 'Bồi dưỡng chuyên môn/CĐS', target: 1, actual: 1, unit: 'khóa', weight: 10 },
    ]
  },
  'NCV': {
    name: 'Nghiên cứu viên',
    kpis: [
      { id: 'NCV-01', name: 'Công bố khoa học', target: 3, actual: 2, unit: 'bài', weight: 25 },
      { id: 'NCV-02', name: 'Công bố WoS/Scopus', target: 2, actual: 1, unit: 'bài', weight: 15 },
      { id: 'NCV-03', name: 'Tham gia/chủ nhiệm đề tài', target: 2, actual: 2, unit: 'đề tài', weight: 20 },
      { id: 'NCV-04', name: 'Tiến độ thực hiện đề tài', target: 95, actual: 90, unit: '%', weight: 10 },
      { id: 'NCV-05', name: 'Sản phẩm/SHTT/chuyển giao', target: 2, actual: 1, unit: 'sản phẩm', weight: 15 },
      { id: 'NCV-06', name: 'Quản lý dữ liệu nghiên cứu', target: 90, actual: 88, unit: '%', weight: 10 },
      { id: 'NCV-07', name: 'Hợp tác/bồi dưỡng NCLL', target: 1, actual: 1, unit: 'hoạt động', weight: 5 },
    ]
  },
  'CV': {
    name: 'Chuyên viên phòng ban',
    kpis: [
      { id: 'CV-01', name: 'Hồ sơ nghiệp vụ đúng hạn', target: 95, actual: 92, unit: '%', weight: 30 },
      { id: 'CV-02', name: 'Chất lượng hồ sơ tham mưu', target: 95, actual: 98, unit: '%', weight: 20 },
      { id: 'CV-03', name: 'Dữ liệu nghiệp vụ cập nhật', target: 98, actual: 95, unit: '%', weight: 15 },
      { id: 'CV-04', name: 'Mức hài lòng người dùng', target: 4, actual: 4.2, unit: 'điểm', weight: 15 },
      { id: 'CV-05', name: 'Sáng kiến cải tiến', target: 1, actual: 1, unit: 'sáng kiến', weight: 10 },
      { id: 'CV-06', name: 'Tuân thủ báo cáo định kỳ', target: 100, actual: 100, unit: '%', weight: 10 },
    ]
  }
};

const unitGroups = ['Tất cả', 'PDT', 'KHCN', 'TCCB', 'CNTT'];
const individualGroups = ['Tất cả', 'GV', 'NCV', 'CV'];
const schoolGroups = ['Tất cả', 'Đào tạo', 'KHCN', 'Đội ngũ', 'Quốc tế', 'Quản trị', 'CĐS', 'Phục vụ'];

type TabLevel = 'school' | 'unit' | 'individual';

export default function KPIPage() {
  const [activeTab, setActiveTab] = useState<TabLevel>('school');
  const [selectedUnit, setSelectedUnit] = useState('PDT');
  const [selectedPosition, setSelectedPosition] = useState('GV');
  const [selectedGroup, setSelectedGroup] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');

  const renderSchoolKPI = () => {
    const filtered = schoolKPI.filter(kpi => {
      const matchesGroup = selectedGroup === 'Tất cả' || kpi.group === selectedGroup;
      const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) || kpi.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesGroup && matchesSearch;
    });
    return (
      <table className="table">
        <thead>
          <tr>
            <th>Mã KPI</th>
            <th>Tên KPI</th>
            <th>Nhóm</th>
            <th>Chỉ tiêu</th>
            <th>Thực tế</th>
            <th>Tỷ lệ</th>
            <th>Trọng số</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((kpi) => {
            const completionRate = calcCompletionRate(kpi.actual, kpi.target, 'higher_better');
            const status = getCompletionStatus(completionRate);
            return (
              <tr key={kpi.id}>
                <td><span className="badge badge-info">{kpi.id}</span></td>
                <td className="font-medium">{kpi.name}</td>
                <td>{kpi.group}</td>
                <td>{kpi.target}{kpi.unit}</td>
                <td>{kpi.actual}{kpi.unit}</td>
                <td><span style={{ color: status.color }} className="font-medium">{completionRate.toFixed(1)}%</span></td>
                <td>{kpi.weight}%</td>
                <td><span className="badge" style={{ backgroundColor: `${status.color}20`, color: status.color }}>{status.label}</span></td>
                <td>
                  <a href={`/kpi/progress?indicatorId=${kpi.id}`} className="text-primary text-xs hover:underline">Tiến độ</a>
                  <a href={`/kpi/evidences?indicatorId=${kpi.id}`} className="text-primary text-xs hover:underline ml-2">MC</a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const renderUnitKPI = () => {
    const unit = unitKPIs[selectedUnit];
    if (!unit) return null;
    const filtered = unit.kpis.filter(kpi => {
      const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) || kpi.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    return (
      <>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-text-light">Đơn vị:</span>
          {Object.entries(unitKPIs).map(([code, u]) => (
            <button key={code} onClick={() => setSelectedUnit(code)} className={`px-3 py-1 rounded text-sm ${selectedUnit === code ? 'bg-primary text-white' : 'bg-white border border-border'}`}>{code}</button>
          ))}
        </div>
        <table className="table">
          <thead>
            <tr><th>Mã KPI</th><th>Tên KPI</th><th>Chỉ tiêu</th><th>Thực tế</th><th>Tỷ lệ</th><th>Trọng số</th><th>Trạng thái</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {filtered.map((kpi) => {
              const completionRate = calcCompletionRate(kpi.actual, kpi.target, 'higher_better');
              const status = getCompletionStatus(completionRate);
              return (
                <tr key={kpi.id}>
                  <td><span className="badge badge-info">{kpi.id}</span></td>
                  <td className="font-medium">{kpi.name}</td>
                  <td>{kpi.target}{kpi.unit}</td>
                  <td>{kpi.actual}{kpi.unit}</td>
                  <td><span style={{ color: status.color }} className="font-medium">{completionRate.toFixed(1)}%</span></td>
                  <td>{kpi.weight}%</td>
                  <td><span className="badge" style={{ backgroundColor: `${status.color}20`, color: status.color }}>{status.label}</span></td>
                  <td>
                    <a href={`/kpi/progress?indicatorId=${kpi.id}`} className="text-primary text-xs hover:underline">Tiến độ</a>
                    <a href={`/kpi/evidences?indicatorId=${kpi.id}`} className="text-primary text-xs hover:underline ml-2">MC</a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  };

  const renderIndividualKPI = () => {
    const position = individualKPIs[selectedPosition];
    if (!position) return null;
    const filtered = position.kpis.filter(kpi => {
      const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) || kpi.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    return (
      <>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-text-light">Vị trí:</span>
          {Object.entries(individualKPIs).map(([code, p]) => (
            <button key={code} onClick={() => setSelectedPosition(code)} className={`px-3 py-1 rounded text-sm ${selectedPosition === code ? 'bg-primary text-white' : 'bg-white border border-border'}`}>{code}</button>
          ))}
        </div>
        <table className="table">
          <thead>
            <tr><th>Mã KPI</th><th>Tên KPI</th><th>Chỉ tiêu</th><th>Thực tế</th><th>Tỷ lệ</th><th>Trọng số</th><th>Trạng thái</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {filtered.map((kpi) => {
              const completionRate = calcCompletionRate(kpi.actual, kpi.target, 'higher_better');
              const status = getCompletionStatus(completionRate);
              return (
                <tr key={kpi.id}>
                  <td><span className="badge badge-info">{kpi.id}</span></td>
                  <td className="font-medium">{kpi.name}</td>
                  <td>{kpi.target}{kpi.unit}</td>
                  <td>{kpi.actual}{kpi.unit}</td>
                  <td><span style={{ color: status.color }} className="font-medium">{completionRate.toFixed(1)}%</span></td>
                  <td>{kpi.weight}%</td>
                  <td><span className="badge" style={{ backgroundColor: `${status.color}20`, color: status.color }}>{status.label}</span></td>
                  <td>
                    <a href={`/kpi/progress?indicatorId=${kpi.id}`} className="text-primary text-xs hover:underline">Tiến độ</a>
                    <a href={`/kpi/evidences?indicatorId=${kpi.id}`} className="text-primary text-xs hover:underline ml-2">MC</a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  };

  const tabs: { id: TabLevel; label: string; icon: typeof BarChart2; count: number }[] = [
    { id: 'school', label: 'Cấp Trường', icon: BarChart2, count: 23 },
    { id: 'unit', label: 'Cấp đơn vị', icon: Building, count: Object.values(unitKPIs).reduce((sum, u) => sum + u.kpis.length, 0) },
    { id: 'individual', label: 'Cấp cá nhân', icon: Users, count: Object.values(individualKPIs).reduce((sum, p) => sum + p.kpis.length, 0) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Chỉ tiêu KPI</h1>
          <p className="text-text-light mt-1">Hệ thống KPI Đại học Cần Thơ - 3 cấp quản trị</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchTerm(''); setSelectedGroup('Tất cả'); }}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-dark'}`}>
              <Icon size={16} />
              {tab.label}
              <span className="badge badge-info ml-1">{tab.count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm KPI..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
        {activeTab === 'school' && (
          <div className="flex gap-2">
            {schoolGroups.map((group) => (
              <button key={group} onClick={() => setSelectedGroup(group)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedGroup === group ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>
                {group}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-white">
            {activeTab === 'school' && '23 KPI cấp Trường'}
            {activeTab === 'unit' && `KPI cấp đơn vị - ${unitKPIs[selectedUnit]?.name}`}
            {activeTab === 'individual' && `KPI cá nhân - ${individualKPIs[selectedPosition]?.name}`}
          </h3>
          <span className="text-white/80 text-sm">
            {activeTab === 'school' && 'Trọng số tổng: 100%'}
            {activeTab === 'unit' && `${unitKPIs[selectedUnit]?.kpis.length} KPI`}
            {activeTab === 'individual' && `${individualKPIs[selectedPosition]?.kpis.length} KPI`}
          </span>
        </div>
        <div className="p-0">
          {activeTab === 'school' && renderSchoolKPI()}
          {activeTab === 'unit' && renderUnitKPI()}
          {activeTab === 'individual' && renderIndividualKPI()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <h4 className="font-heading font-bold text-sm mb-2">Công thức tính điểm</h4>
          <div className="text-xs text-text-light space-y-1">
            <p>• Tỉ lệ = Thực tế / Chỉ tiêu × 100%</p>
            <p>• Điểm = min(Tỉ lệ, 120%) × MaxPoint / 100</p>
            <p>• Giới hạn vượt: tối đa 120%</p>
          </div>
        </div>
        <div className="card p-4">
          <h4 className="font-heading font-bold text-sm mb-2">Xếp loại</h4>
          <div className="text-xs space-y-1">
            <p><span className="text-accent-green">●</span> Xuất sắc: ≥90 điểm</p>
            <p><span className="text-blue-500">●</span> Tốt: 80-89 điểm</p>
            <p><span className="text-accent-yellow">●</span> Đạt: 65-79 điểm</p>
            <p><span className="text-orange-500">●</span> Cần cải thiện: 50-64 điểm</p>
            <p><span className="text-accent-red">●</span> Không đạt: {'<'}50 điểm</p>
          </div>
        </div>
        <div className="card p-4">
          <h4 className="font-heading font-bold text-sm mb-2">Liên kết 3 cấp</h4>
          <div className="text-xs text-text-light space-y-1">
            <p>• Cấp Trường → Phân rã → Cấp đơn vị</p>
            <p>• Cấp đơn vị → Phân rã → Cấp cá nhân</p>
            <p>• Cá nhân → Tổng hợp → Đơn vị → Trường</p>
          </div>
        </div>
      </div>
    </div>
  );
}
