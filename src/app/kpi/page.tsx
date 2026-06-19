'use client';

import { useState } from 'react';
import { Search, BarChart2, Building, Users, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { getCompletionStatus, calcCompletionRate } from '@/lib/kpi';
import schoolIndicators from '@/data/indicators.json';
import unitKPIsData from '@/data/unit-kpis.json';
import individualKPIsData from '@/data/individual-kpis.json';
import units from '@/data/units.json';
import kpiGroups from '@/data/kpi-groups.json';
import academicYears from '@/data/academic-years.json';

const demoActual: Record<string, number> = {
  'CTU-KPI-01': 52, 'CTU-KPI-02': 12, 'CTU-KPI-03': 8, 'CTU-KPI-04': 11,
  'CTU-KPI-05': 92, 'CTU-KPI-06': 75, 'CTU-KPI-07': 12, 'CTU-KPI-08': 88,
  'CTU-KPI-09': 72, 'CTU-KPI-10': 85, 'CTU-KPI-11': 68, 'CTU-KPI-12': 11,
  'CTU-KPI-13': 1.4, 'CTU-KPI-14': 0.5, 'CTU-KPI-15': 10, 'CTU-KPI-16': 18,
  'CTU-KPI-17': 380, 'CTU-KPI-18': 12, 'CTU-KPI-19': 650, 'CTU-KPI-20': 95,
  'CTU-KPI-21': 12, 'CTU-KPI-22': 85, 'CTU-KPI-23': 95,
  'DT-01': 92, 'DT-02': 98, 'DT-03': 92, 'DT-04': 12, 'DT-05': 78,
  'DT-06': 96, 'DT-07': 88, 'DT-08': 4.2, 'DT-09': 100, 'DT-10': 92,
  'KHCN-01': 1.4, 'KHCN-02': 0.5, 'KHCN-03': 10, 'KHCN-04': 18,
  'KHCN-05': 380, 'KHCN-06': 88, 'KHCN-07': 11, 'KHCN-08': 85,
  'KHCN-09': 8, 'KHCN-10': 92,
  'TCCB-01': 52, 'TCCB-02': 12, 'TCCB-03': 92, 'TCCB-04': 98,
  'TCCB-05': 100, 'TCCB-06': 75, 'TCCB-07': 88, 'TCCB-08': 95, 'TCCB-09': 3.8,
  'CNTT-01': 85, 'CNTT-02': 99.5, 'CNTT-03': 92, 'CNTT-04': 88,
  'CNTT-05': 65, 'CNTT-06': 100, 'CNTT-07': 100, 'CNTT-08': 4.1,
  'CNTT-09': 85, 'CNTT-10': 3,
  'GV-01': 105, 'GV-02': 85, 'GV-03': 92, 'GV-04': 1, 'GV-05': 2,
  'GV-06': 2, 'GV-07': 1,
  'NCV-01': 2, 'NCV-02': 1, 'NCV-03': 2, 'NCV-04': 90,
  'NCV-05': 1, 'NCV-06': 88, 'NCV-07': 1,
  'CV-01': 92, 'CV-02': 98, 'CV-03': 95, 'CV-04': 4.2, 'CV-05': 1, 'CV-06': 100,
};

const demoTarget: Record<string, number> = {
  'CTU-KPI-01': 59, 'CTU-KPI-02': 10, 'CTU-KPI-03': 10, 'CTU-KPI-04': 10,
  'CTU-KPI-05': 90, 'CTU-KPI-06': 80, 'CTU-KPI-07': 14, 'CTU-KPI-08': 90,
  'CTU-KPI-09': 70, 'CTU-KPI-10': 80, 'CTU-KPI-11': 70, 'CTU-KPI-12': 10,
  'CTU-KPI-13': 1.6, 'CTU-KPI-14': 0.6, 'CTU-KPI-15': 14, 'CTU-KPI-16': 20,
  'CTU-KPI-17': 400, 'CTU-KPI-18': 10, 'CTU-KPI-19': 700, 'CTU-KPI-20': 100,
  'CTU-KPI-21': 15, 'CTU-KPI-22': 80, 'CTU-KPI-23': 100,
};

const unitNameByCode: Record<string, string> = {};
units.forEach(u => { unitNameByCode[u.code] = u.name; });

const unitKpiById: Record<string, { id: string; name: string; unitCode: string; unitName: string }> = {};
unitKPIsData.forEach(u => {
  const uname = unitNameByCode[u.code] || u.name;
  u.  kpis.forEach(k => { unitKpiById[k.id] = { id: k.id, name: k.name, unitCode: u.code, unitName: uname }; });
});

const activeYear = academicYears.find(y => y.status === 'active');

const unitGroups = ['Tất cả', ...unitKPIsData.map(u => u.code)];
const individualGroups = ['Tất cả', 'GV', 'GVQL', 'LD', 'BM', 'NCV', 'CV', 'CVDT',
  'CVDBCL', 'CVKHCN', 'CVHTQT', 'CVTCCB', 'CVKHTC', 'CVCNTT', 'CVTT',
  'TV', 'KTX', 'HC', 'KTPTN', 'PV', 'KPISTAFF', 'CN'];

const categoryMap: Record<string, string> = {};
kpiGroups.forEach(g => { categoryMap[g.id] = g.name; });

const catShortLabel: Record<string, string> = {
  grp_dao_tao: 'Đào tạo & ĐBCL',
  grp_khcn: 'KHCN & Đổi mới Sáng tạo',
  grp_doi_ngu: 'Đội ngũ & Phát triển',
  grp_quoc_te: 'Hợp tác Quốc tế',
  grp_quan_tri: 'Quản trị & Tài chính',
  grp_chuyen_so: 'Chuyển đổi Số',
  grp_phuc_vu: 'Phục vụ Cộng đồng',
};
const categories = ['Tất cả', ...kpiGroups.map(g => g.id)];

const posCodeMap: Record<string, string> = {
  position_gv: 'GV', position_gvql: 'GVQL', position_ld: 'LD',
  position_bm: 'BM', position_ncv: 'NCV', position_cv: 'CV',
  position_cvdt: 'CVDT', position_cvdbcl: 'CVDBCL', position_cvkhcn: 'CVKHCN',
  position_cvhtqt: 'CVHTQT', position_cvtccb: 'CVTCCB', position_cvkhtc: 'CVKHTC',
  position_cvcntt: 'CVCNTT', position_cvtt: 'CVTT', position_tv: 'TV',
  position_ktx: 'KTX', position_hc: 'HC', position_ktptn: 'KTPTN',
  position_pv: 'PV', position_kpistaff: 'KPISTAFF', position_cn: 'CN',
};

type TabLevel = 'school' | 'unit' | 'individual';

export default function KPIPage() {
  const [activeTab, setActiveTab] = useState<TabLevel>('school');
  const [selectedUnit, setSelectedUnit] = useState(unitKPIsData[0]?.code ?? 'PDT');
  const [selectedPosition, setSelectedPosition] = useState('GV');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);

  const schoolItems = schoolIndicators.map(si => ({
    ...si,
    target: demoTarget[si.id] ?? 0,
    weight: si.maxScore,
    actual: demoActual[si.id] ?? 0,
    category: catShortLabel[si.categoryId] || categoryMap[si.categoryId] || si.categoryId,
  }));

  const schoolByIndicatorId: Record<string, typeof schoolItems[0]> = {};
  schoolItems.forEach(si => { schoolByIndicatorId[si.id] = si; });

  const unitKpisForSchool: Record<string, { unitCode: string; unitName: string; kpi: any }[]> = {};
  unitKPIsData.forEach(u => {
    const name = unitNameByCode[u.code] || u.name;
    u.kpis.forEach(k => {
      const indId = (k as any).indicatorId;
      if (indId) {
        if (!unitKpisForSchool[indId]) unitKpisForSchool[indId] = [];
        unitKpisForSchool[indId].push({ unitCode: u.code, unitName: name, kpi: { ...k, actual: demoActual[k.id] ?? 0 } });
      }
    });
  });

  const unitKpisByCode: Record<string, { id: string; name: string; kpis: any[] }> = {};
  unitKPIsData.forEach(u => {
    unitKpisByCode[u.code] = {
      id: u.id, name: unitNameByCode[u.code] || u.name,
      kpis: u.kpis.map(k => ({ ...k, actual: demoActual[k.id] ?? 0, indicatorId: (k as any).indicatorId })),
    };
  });

  const posByCode: Record<string, { id: string; name: string; kpis: any[] }> = {};
  individualKPIsData.forEach(p => {
    const code = posCodeMap[p.id] || p.code;
    posByCode[code] = {
      id: p.id, name: p.name,
      kpis: p.kpis.map(k => ({ ...k, actual: demoActual[k.id] ?? 0 })),
    };
  });

  const renderSchoolKPI = () => {
    const filtered = schoolItems.filter(kpi => {
      const matchesCategory = selectedCategory === 'Tất cả' || kpi.categoryId === selectedCategory;
      const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) || kpi.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    return (
      <>
      <div className="mb-4 p-3 bg-white rounded-lg border border-border flex items-center gap-2 flex-wrap">
        <span className="text-sm text-text-light">Lĩnh vực:</span>
        {categories.map((cat) => {
          const label = cat === 'Tất cả' ? 'Tất cả' : (catShortLabel[cat] || categoryMap[cat] || cat);
          return (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded text-sm ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-white border border-border'}`}>
              {label}
            </button>
          );
        })}
      </div>
      <table className="table">
        <thead>
          <tr><th>Mã KPI</th><th>Tên KPI</th><th>Lĩnh vực</th><th>Chỉ tiêu</th><th>Thực tế</th><th>Tỷ lệ</th><th>Trọng số</th><th>Trạng thái</th><th>Phân rã đơn vị</th><th>Thao tác</th></tr>
        </thead>
        <tbody>
          {filtered.map((kpi) => {
            const completionRate = calcCompletionRate(kpi.actual, kpi.target, 'higher_better');
            const status = getCompletionStatus(completionRate);
            const derived = unitKpisForSchool[kpi.id] || [];
            const isExpanded = expandedIndicator === kpi.id;
            return (
              <>
                <tr key={kpi.id} className={isExpanded ? 'bg-bg-cream' : ''}>
                  <td><span className="badge badge-info">{kpi.id}</span></td>
                  <td className="font-medium">{kpi.name}</td>
                  <td><span className="badge" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>{kpi.category}</span></td>
                  <td>{kpi.target}{kpi.unit}</td>
                  <td>{kpi.actual}{kpi.unit}</td>
                  <td><span style={{ color: status.color }} className="font-medium">{completionRate.toFixed(1)}%</span></td>
                  <td>{kpi.weight}%</td>
                  <td><span className="badge" style={{ backgroundColor: `${status.color}20`, color: status.color }}>{status.label}</span></td>
                  <td>
                    {derived.length > 0 && (
                      <button onClick={() => setExpandedIndicator(isExpanded ? null : kpi.id)}
                        className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        {derived.length} đơn vị
                      </button>
                    )}
                  </td>
                  <td>
                    <a href={`/kpi/progress?indicatorId=${kpi.id}`} className="text-primary text-xs hover:underline">Tiến độ</a>
                    <a href={`/kpi/evidences?indicatorId=${kpi.id}`} className="text-primary text-xs hover:underline ml-2">MC</a>
                  </td>
                </tr>
                {isExpanded && derived.length > 0 && (
                  <tr key={`${kpi.id}-derived`}>
                    <td colSpan={10} className="p-0">
                      <div className="bg-bg-cream px-6 py-3 border-t border-border">
                        <p className="text-xs font-medium text-text-dark mb-2">KPI đơn vị dẫn xuất từ chỉ tiêu này:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {derived.map((d, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs bg-white p-2 rounded border border-border">
                              <span className="badge badge-info shrink-0">{d.kpi.id}</span>
                              <span className="font-medium text-text-dark">{d.kpi.name}</span>
                              <ArrowRight size={10} className="text-text-light shrink-0" />
                              <span className="text-primary font-medium">{d.unitCode}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </>
    );
  };

  const renderUnitKPI = () => {
    const unit = unitKpisByCode[selectedUnit];
    if (!unit) return null;
    const filtered = unit.kpis.filter(kpi => {
      const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) || kpi.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    return (
      <>
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-text-light">Đơn vị:</span>
          {Object.entries(unitKpisByCode).map(([code, u]) => (
            <button key={code} onClick={() => setSelectedUnit(code)}
              className={`px-3 py-1 rounded text-sm ${selectedUnit === code ? 'bg-primary text-white' : 'bg-white border border-border'}`}>
              {unitNameByCode[code] || u.name}
            </button>
          ))}
        </div>
        <table className="table">
          <thead>
            <tr><th>Mã KPI</th><th>Tên KPI</th><th>Chỉ tiêu</th><th>Thực tế</th><th>Tỷ lệ</th><th>Trọng số</th><th>Trạng thái</th><th>Dẫn xuất từ</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {filtered.map((kpi) => {
              const completionRate = calcCompletionRate(kpi.actual, kpi.target, 'higher_better');
              const status = getCompletionStatus(completionRate);
              const parent = kpi.indicatorId ? schoolByIndicatorId[kpi.indicatorId] : null;
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
                    {parent ? (
                      <a href="#school" onClick={() => { setActiveTab('school'); setSearchTerm(parent.id); }}
                        className="text-xs text-primary underline">{parent.id}</a>
                    ) : <span className="text-xs text-text-light">-</span>}
                  </td>
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
    const pos = posByCode[selectedPosition];
    if (!pos) return null;
    const filtered = pos.kpis.filter(kpi => {
      const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) || kpi.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    return (
      <>
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-text-light">Vị trí:</span>
          {Object.entries(posByCode).map(([code, p]) => (
            <button key={code} onClick={() => setSelectedPosition(code)}
              className={`px-3 py-1 rounded text-sm ${selectedPosition === code ? 'bg-primary text-white' : 'bg-white border border-border'}`}>{p.name}</button>
          ))}
        </div>
        <table className="table">
          <thead>
            <tr><th>Mã KPI</th><th>Tên KPI</th><th>Chỉ tiêu</th><th>Thực tế</th><th>Tỷ lệ</th><th>Trọng số</th><th>Trạng thái</th><th>Liên kết ĐV</th><th>Thao tác</th></tr>
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
                    {kpi.unitKpiId && unitKpiById[kpi.unitKpiId] ? (
                      <a href="#unit" onClick={() => { setActiveTab('unit'); setSelectedUnit(unitKpiById[kpi.unitKpiId].unitCode); setSearchTerm(kpi.unitKpiId); }}
                        className="text-xs text-primary underline flex items-center gap-1">
                        <ArrowRight size={10} />{kpi.unitKpiId}
                      </a>
                    ) : <span className="text-xs text-text-light">-</span>}
                  </td>
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

  const totalUnitKpis = Object.values(unitKpisByCode).reduce((s, u) => s + u.kpis.length, 0);
  const totalIndKpis = Object.values(posByCode).reduce((s, p) => s + p.kpis.length, 0);
  const tabs = [
    { id: 'school' as const, label: 'Cấp Trường', icon: BarChart2, count: schoolItems.length },
    { id: 'unit' as const, label: 'Cấp đơn vị', icon: Building, count: totalUnitKpis },
    { id: 'individual' as const, label: 'Cấp cá nhân', icon: Users, count: totalIndKpis },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Chỉ tiêu KPI</h1>
          <p className="text-text-light mt-1">Hệ thống KPI Đại học Cần Thơ - 3 cấp quản trị</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium text-text-light">Năm học:</span>
            <span className="px-3 py-1 rounded text-sm bg-primary text-white font-medium">{activeYear?.name || '2025-2026'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchTerm(''); setSelectedCategory('Tất cả'); }}
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
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-white">
            {activeTab === 'school' && (selectedCategory === 'Tất cả' ? 'KPI cấp Trường' : `Lĩnh vực: ${catShortLabel[selectedCategory] || categoryMap[selectedCategory]}`)}
            {activeTab === 'unit' && `KPI cấp đơn vị - ${unitKpisByCode[selectedUnit]?.name || selectedUnit}`}
            {activeTab === 'individual' && `KPI cá nhân - ${posByCode[selectedPosition]?.name || selectedPosition}`}
          </h3>
          <span className="text-white/80 text-sm">
            {activeTab === 'school' && (selectedCategory === 'Tất cả' ? `${schoolItems.length} KPI` : `${schoolItems.filter(si => si.categoryId === selectedCategory).length} KPI`)}
            {activeTab === 'unit' && `${unitKpisByCode[selectedUnit]?.kpis.length} KPI`}
            {activeTab === 'individual' && `${posByCode[selectedPosition]?.kpis.length} KPI`}
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
          <h4 className="font-heading font-bold text-sm mb-2">Liên kết 3 cấp (MBO)</h4>
          <div className="text-xs space-y-1">
            <p className="text-accent-green font-medium">✓ Cấp Trường → Đơn vị</p>
            <p className="text-text-light ml-3">Mỗi chỉ tiêu Trường có thể dẫn xuất ra KPI của nhiều đơn vị (nhấn "N đơn vị" để xem)</p>
            <p className="text-accent-green font-medium mt-1">✓ Cấp đơn vị → Cá nhân</p>
            <p className="text-text-light ml-3">Mỗi KPI vị trí có thể được liên kết với KPI đơn vị tương ứng (nhấn mã KPI ĐV để xem)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
