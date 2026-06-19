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
import progressData from '@/data/progress.json';

const unitNameByCode: Record<string, string> = {};
units.forEach(u => { unitNameByCode[u.code] = u.name; });

const unitKpiById: Record<string, { id: string; name: string; unitCode: string; unitName: string }> = {};
unitKPIsData.forEach(u => {
  const uname = unitNameByCode[u.code] || u.name;
  u.  kpis.forEach(k => { unitKpiById[k.id] = { id: k.id, name: k.name, unitCode: u.code, unitName: uname }; });
});

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
  const [selectedYearId, setSelectedYearId] = useState('ay002');
  const [activeTab, setActiveTab] = useState<TabLevel>('school');
  const [selectedUnit, setSelectedUnit] = useState(unitKPIsData[0]?.code ?? 'PDT');
  const [selectedPosition, setSelectedPosition] = useState('GV');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);

  const activeYear = academicYears.find(y => y.id === selectedYearId)!;

  const schoolLookup: Record<string, number> = {};
  (progressData as Array<{ level: string; indicatorId: string; actualValue: number }>)
    .filter(p => p.level === 'school')
    .forEach(p => { schoolLookup[p.indicatorId] = p.actualValue; });

  const unitLookup: Record<string, number> = {};
  (progressData as Array<{ level: string; indicatorName: string; actualValue: number }>)
    .filter(p => p.level === 'unit')
    .forEach(p => { unitLookup[p.indicatorName] = p.actualValue; });

  const yearSchoolIndicators = schoolIndicators.filter(si => si.academicYearId === selectedYearId);
  const yearUnitKPIs = unitKPIsData.filter(u => u.academicYearId === selectedYearId);
  const yearIndKPIs = individualKPIsData.filter(p => p.academicYearId === selectedYearId);

  const schoolItems = yearSchoolIndicators.map(si => ({
    ...si,
    target: si.targetValue ?? 0,
    weight: si.weight ?? si.maxScore,
    actual: schoolLookup[si.id] ?? 0,
    category: catShortLabel[si.categoryId] || categoryMap[si.categoryId] || si.categoryId,
  }));

  const schoolByIndicatorId: Record<string, typeof schoolItems[0]> = {};
  schoolItems.forEach(si => { schoolByIndicatorId[si.id] = si; });

  const unitKpisForSchool: Record<string, { unitCode: string; unitName: string; kpi: any }[]> = {};
  yearUnitKPIs.forEach(u => {
    const name = unitNameByCode[u.code] || u.name;
    u.kpis.forEach(k => {
      const indId = (k as any).indicatorId;
      if (indId) {
        unitKpisForSchool[indId] = unitKpisForSchool[indId] || [];
        unitKpisForSchool[indId].push({ unitCode: u.code, unitName: name, kpi: { ...k, actual: unitLookup[k.name] ?? 0 } });
      }
    });
  });

  const unitKpisByCode: Record<string, { id: string; name: string; kpis: any[] }> = {};
  yearUnitKPIs.forEach(u => {
    unitKpisByCode[u.code] = {
      id: u.id, name: unitNameByCode[u.code] || u.name,
      kpis: u.kpis.map(k => ({ ...k, actual: unitLookup[k.name] ?? 0, indicatorId: (k as any).indicatorId })),
    };
  });

  const posByCode: Record<string, { id: string; name: string; kpis: any[] }> = {};
  yearIndKPIs.forEach(p => {
    const code = posCodeMap[p.id] || p.code;
    posByCode[code] = {
      id: p.id, name: p.name,
      kpis: p.kpis.map(k => ({ ...k, actual: 0 })),
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Chỉ tiêu KPI</h1>
          <p className="text-text-light mt-1">Hệ thống KPI Đại học Cần Thơ - 3 cấp quản trị</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-light">Năm học:</span>
          <div className="flex bg-white border border-border rounded-lg overflow-hidden">
            {academicYears.map(ay => (
              <button key={ay.id} onClick={() => { setSelectedYearId(ay.id); setSearchTerm(''); setSelectedCategory('Tất cả'); }}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${selectedYearId === ay.id ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>
                {ay.name}
              </button>
            ))}
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
