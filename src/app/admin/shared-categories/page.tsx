'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Ruler, FileText, Award, Save,
  Layers, Database, ListChecks, Calculator, AlertTriangle,
  FileBarChart, ClipboardCheck, Percent, Clock } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

// ── Interfaces ─────────────────────────────────────────
interface MeasurementUnit { id: string; name: string; description: string; status: string; }
interface EvidenceType { id: string; name: string; code: string; description: string; maxSize: string; required: boolean; status: string; }
interface GradingLevel { id: string; name: string; code: string; minScore: number; maxScore: number; color: string; description: string; status: string; }
interface KPIField { id: string; name: string; code: string; description: string; status: string; sortOrder: number; }
interface DataSource { id: string; name: string; code: string; description: string; responsibleUnitId: string; sourceType: string; status: string; }
interface KPIStatus { id: string; name: string; code: string; description: string; color: string; sortOrder: number; category: string; }
interface KPIFormula { id: string; name: string; code: string; description: string; expression: string; type: string; status: string; }
interface WarningThreshold { id: string; name: string; code: string; description: string; thresholdType: string; operator: string; value: number; color: string; isSystem: boolean; status: string; }
interface ReportTemplate { id: string; name: string; code: string; description: string; category: string; config: { format: string }; isSystem: boolean; status: string; }
interface Rubric { id: string; name: string; code: string; description: string; status: string; }
interface ExemptionCoefficient { id: string; name: string; code: string; coefficient: number; description: string; applicablePositions: string[]; status: string; }
interface SlaConfig { id: string; code: string; name: string; processName: string; responseHours: number; resolveHours: number; description: string; status: string; }
interface KPIGroupInterface { id: string; name: string; code: string; defaultWeight: number; targetLevel: string; academicYearId?: string; }

type Tab = 'units' | 'evidence-types' | 'grading-levels' | 'kpi-fields' | 'kpi-groups' | 'data-sources' | 'kpi-statuses' | 'formulas' | 'warning-thresholds' | 'report-templates' | 'rubrics' | 'exemptions' | 'sla-configs';

// ── Helpers ────────────────────────────────────────────
const sourceTypeLabels: Record<string, string> = { api: 'API', manual: 'Nhập tay', integrated: 'Tích hợp' };
const stLabels: Record<string, string> = { api: 'API', manual: 'Nhập tay', integrated: 'Tích hợp' };
const catLabels: Record<string, string> = { plan: 'Kế hoạch', evaluation: 'Đánh giá', evidence: 'Minh chứng', template: 'Mẫu biểu' };
const ttLabels: Record<string, string> = { deadline_days: 'Ngày hết hạn', completion_percent: '% hoàn thành', evidence_count: 'SL minh chứng', score_gap: 'Chênh lệch điểm' };
const opLabels: Record<string, string> = { lt: '<', lte: '≤', gt: '>', gte: '≥', eq: '=' };
const fmtLabels: Record<string, string> = { excel: 'Excel', pdf: 'PDF', csv: 'CSV', word: 'Word' };
const formulaTypeLabels: Record<string, string> = { quantitative: 'Định lượng', qualitative: 'Định tính', rubric: 'Rubric' };
const positionLabels: Record<string, string> = { GV: 'Giảng viên', GVQL: 'Giảng viên QL', BM: 'Trưởng bộ môn', LD: 'Lãnh đạo', NCV: 'Nghiên cứu viên', CV: 'Viên chức', CVDT: 'CV Chuyển đổi số' };

export default function SharedCategoriesPage() {
  const [tab, setTab] = useState<Tab>('units');
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [eTypes, setETypes] = useState<EvidenceType[]>([]);
  const [grades, setGrades] = useState<GradingLevel[]>([]);
  const [kpiFields, setKpiFields] = useState<KPIField[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [kpiStatuses, setKpiStatuses] = useState<KPIStatus[]>([]);
  const [formulas, setFormulas] = useState<KPIFormula[]>([]);
  const [wThresholds, setWThresholds] = useState<WarningThreshold[]>([]);
  const [reportTmpls, setReportTmpls] = useState<ReportTemplate[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [exemptions, setExemptions] = useState<ExemptionCoefficient[]>([]);
  const [slaConfigs, setSlaConfigs] = useState<SlaConfig[]>([]);
  const [kpiGroups, setKpiGroups] = useState<KPIGroupInterface[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      switch (tab) {
        case 'units': setUnits(await apiGet<MeasurementUnit[]>('/api/measurement-units')); break;
        case 'evidence-types': setETypes(await apiGet<EvidenceType[]>('/api/evidence-types')); break;
        case 'grading-levels': setGrades(await apiGet<GradingLevel[]>('/api/grading-levels')); break;
        case 'kpi-fields': setKpiFields(await apiGet<KPIField[]>('/api/kpi-fields')); break;
        case 'data-sources': setDataSources(await apiGet<DataSource[]>('/api/data-sources')); break;
        case 'kpi-statuses': setKpiStatuses(await apiGet<KPIStatus[]>('/api/kpi-statuses')); break;
        case 'formulas': setFormulas(await apiGet<KPIFormula[]>('/api/formulas')); break;
        case 'warning-thresholds': setWThresholds(await apiGet<WarningThreshold[]>('/api/warning-thresholds')); break;
        case 'report-templates': setReportTmpls(await apiGet<ReportTemplate[]>('/api/report-templates')); break;
        case 'rubrics': setRubrics(await apiGet<Rubric[]>('/api/rubrics')); break;
        case 'exemptions': setExemptions(await apiGet<ExemptionCoefficient[]>('/api/exemption-coefficients')); break;
        case 'kpi-groups': setKpiGroups(await apiGet<KPIGroupInterface[]>('/api/kpi-groups')); break;
        case 'sla-configs': setSlaConfigs(await apiGet<SlaConfig[]>('/api/sla-configs')); break;
      }
    } catch { /* empty */ } finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const endpointMap: Record<Tab, string> = {
    units: 'measurement-units', 'evidence-types': 'evidence-types', 'grading-levels': 'grading-levels',
    'kpi-fields': 'kpi-fields', 'data-sources': 'data-sources', 'kpi-statuses': 'kpi-statuses',
    formulas: 'formulas', 'warning-thresholds': 'warning-thresholds', 'report-templates': 'report-templates',
    rubrics: 'rubrics',
    exemptions: 'exemption-coefficients', 'kpi-groups': 'kpi-groups', 'sla-configs': 'sla-configs',
  };

  const handleSave = async (data: any) => {
    const ep = endpointMap[tab];
    if (editItem) {
      await apiPut(`/api/${ep}/${editItem.id}`, data);
    } else {
      await apiPost(`/api/${ep}`, data);
    }
    setShowModal(false); setEditItem(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa mục này?')) return;
    await apiDelete(`/api/${endpointMap[tab]}/${id}`);
    load();
  };

  const tabs = [
    { key: 'units' as Tab, label: 'Đơn vị đo', icon: Ruler },
    { key: 'evidence-types' as Tab, label: 'Loại minh chứng', icon: FileText },
    { key: 'grading-levels' as Tab, label: 'Mức xếp loại', icon: Award },
    { key: 'kpi-fields' as Tab, label: 'Lĩnh vực KPI', icon: Layers },
    { key: 'kpi-groups' as Tab, label: 'Nhóm KPI', icon: Layers },
    { key: 'data-sources' as Tab, label: 'Nguồn dữ liệu', icon: Database },
    { key: 'kpi-statuses' as Tab, label: 'Trạng thái KPI', icon: ListChecks },
    { key: 'formulas' as Tab, label: 'Công thức tính', icon: Calculator },
    { key: 'warning-thresholds' as Tab, label: 'Ngưỡng cảnh báo', icon: AlertTriangle },
    { key: 'report-templates' as Tab, label: 'Biểu mẫu báo cáo', icon: FileBarChart },
    { key: 'rubrics' as Tab, label: 'Rubric định tính', icon: ClipboardCheck },
    { key: 'exemptions' as Tab, label: 'Hệ số miễn giảm', icon: Percent },
    { key: 'sla-configs' as Tab, label: 'SLA xử lý', icon: Clock },
  ];

  function renderTable() {
    if (loading) return <div className="p-8 text-center text-text-light">Đang tải...</div>;
    const data = getData();
    if (data.length === 0) return <div className="p-8 text-center text-text-light">Chưa có dữ liệu</div>;

    switch (tab) {
      case 'units': return (
        <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Tên đơn vị</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>{(data as MeasurementUnit[]).map((u, i) => (<tr key={u.id}><td>{i + 1}</td><td className="font-mono text-xs">{u.id}</td><td className="font-medium">{u.name}</td><td className="text-sm text-text-light">{u.description}</td><td><StatusBadge status={u.status} /></td><td><Actions item={u} /></td></tr>))}</tbody></table>
      );
      case 'evidence-types': return (
        <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Tên loại</th><th>Mô tả</th><th>Dung lượng</th><th>Bắt buộc</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>{(data as EvidenceType[]).map((e, i) => (<tr key={e.id}><td>{i + 1}</td><td className="font-mono text-xs">{e.code}</td><td className="font-medium">{e.name}</td><td className="text-sm text-text-light">{e.description}</td><td>{e.maxSize}</td><td>{e.required ? <span className="badge badge-warning">Có</span> : <span className="badge">Không</span>}</td><td><StatusBadge status={e.status} /></td><td><Actions item={e} /></td></tr>))}</tbody></table>
      );
      case 'grading-levels': return (
        <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Mức xếp loại</th><th>Điểm từ</th><th>Điểm đến</th><th>Màu</th><th>Mô tả</th><th>Thao tác</th></tr></thead>
          <tbody>{(data as GradingLevel[]).map((g, i) => (<tr key={g.id}><td>{i + 1}</td><td className="font-mono text-xs">{g.code}</td><td className="font-medium"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />{g.name}</span></td><td>{g.minScore}</td><td>{g.maxScore}</td><td><span className="w-6 h-6 rounded inline-block border" style={{ backgroundColor: g.color }} /></td><td className="text-sm text-text-light">{g.description}</td><td><Actions item={g} /></td></tr>))}</tbody></table>
      );
      case 'kpi-fields': return (
        <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Tên lĩnh vực</th><th>Mô tả</th><th>Thứ tự</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>{(data as KPIField[]).map((f, i) => (<tr key={f.id}><td>{i + 1}</td><td className="font-mono text-xs">{f.code}</td><td className="font-medium">{f.name}</td><td className="text-sm text-text-light">{f.description}</td><td>{f.sortOrder}</td><td><StatusBadge status={f.status} /></td><td><Actions item={f} /></td></tr>))}</tbody></table>
      );
      case 'data-sources': return (
        <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Tên nguồn</th><th>Loại</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>{(data as DataSource[]).map((d, i) => (<tr key={d.id}><td>{i + 1}</td><td className="font-mono text-xs">{d.code}</td><td className="font-medium">{d.name}</td><td><span className="badge badge-info">{stLabels[d.sourceType] || d.sourceType}</span></td><td className="text-sm text-text-light">{d.description}</td><td><StatusBadge status={d.status} /></td><td><Actions item={d} /></td></tr>))}</tbody></table>
      );
      case 'kpi-statuses': return (
        <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Tên trạng thái</th><th>Danh mục</th><th>Màu</th><th>Thứ tự</th><th>Thao tác</th></tr></thead>
          <tbody>{(data as KPIStatus[]).map((s, i) => (<tr key={s.id}><td>{i + 1}</td><td className="font-mono text-xs">{s.code}</td><td className="font-medium"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />{s.name}</span></td><td><span className="badge badge-info">{catLabels[s.category] || s.category}</span></td><td><span className="w-6 h-6 rounded inline-block border" style={{ backgroundColor: s.color }} /></td><td>{s.sortOrder}</td><td><Actions item={s} /></td></tr>))}</tbody></table>
      );
      case 'formulas': return (
        <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Tên công thức</th><th>Biểu thức</th><th>Loại</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>{(data as KPIFormula[]).map((f, i) => (<tr key={f.id}><td>{i + 1}</td><td className="font-mono text-xs">{f.code}</td><td className="font-medium">{f.name}</td><td className="text-sm font-mono">{f.expression}</td><td><span className="badge badge-info">{formulaTypeLabels[f.type] || f.type}</span></td><td><StatusBadge status={f.status} /></td><td><Actions item={f} /></td></tr>))}</tbody></table>
      );
      case 'warning-thresholds': return (
        <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Tên ngưỡng</th><th>Loại</th><th>Điều kiện</th><th>Giá trị</th><th>Màu</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>{(data as WarningThreshold[]).map((w, i) => (<tr key={w.id}><td>{i + 1}</td><td className="font-mono text-xs">{w.code}</td><td className="font-medium">{w.name}</td><td className="text-sm">{ttLabels[w.thresholdType] || w.thresholdType}</td><td>{opLabels[w.operator] || w.operator}</td><td>{w.value}</td><td><span className="w-6 h-6 rounded inline-block border" style={{ backgroundColor: w.color }} /></td><td><StatusBadge status={w.status} /></td><td><Actions item={w} /></td></tr>))}</tbody></table>
      );
      case 'report-templates': return (
        <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Tên biểu mẫu</th><th>Danh mục</th><th>Định dạng</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>{(data as ReportTemplate[]).map((r, i) => (<tr key={r.id}><td>{i + 1}</td><td className="font-mono text-xs">{r.code}</td><td className="font-medium">{r.name}</td><td className="text-sm">{r.category}</td><td><span className="badge badge-info">{fmtLabels[r.config?.format] || r.config?.format || '—'}</span></td><td className="text-sm text-text-light">{r.description}</td><td><StatusBadge status={r.status} /></td><td><Actions item={r} /></td></tr>))}</tbody></table>
      );
      case 'rubrics': return (
        <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Tên rubric</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>{(data as Rubric[]).map((r, i) => (<tr key={r.id}><td>{i + 1}</td><td className="font-mono text-xs">{r.code}</td><td className="font-medium">{r.name}</td><td className="text-sm text-text-light">{r.description}</td><td><StatusBadge status={r.status} /></td><td><Actions item={r} /></td></tr>))}</tbody></table>
      );
      case 'exemptions': return (
        <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Tên hệ số</th><th>Hệ số</th><th>Vị trí áp dụng</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>{(data as ExemptionCoefficient[]).map((e, i) => (<tr key={e.id}><td>{i + 1}</td><td className="font-mono text-xs">{e.code}</td><td className="font-medium">{e.name}</td><td><span className={`badge ${e.coefficient < 1 ? 'badge-warning' : 'badge-success'}`}>{(e.coefficient * 100).toFixed(0)}%</span></td><td className="text-xs">{e.applicablePositions.map(p => positionLabels[p] || p).join(', ')}</td><td className="text-sm text-text-light max-w-[200px] truncate">{e.description}</td><td><StatusBadge status={e.status} /></td><td><Actions item={e} /></td></tr>))}</tbody></table>
      );
      case 'sla-configs': return (
        <table className="table"><thead><tr><th>STT</th><th>Mã</th><th>Tên SLA</th><th>Quy trình</th><th>Phản hồi (giờ)</th><th>Xử lý (giờ)</th><th>Mô tả</th><th>Thao tác</th></tr></thead>
          <tbody>{(data as SlaConfig[]).map((s, i) => (<tr key={s.id}><td>{i + 1}</td><td className="font-mono text-xs">{s.code}</td><td className="font-medium">{s.name}</td><td className="text-sm">{s.processName}</td><td><span className="badge badge-info">{s.responseHours}h</span></td><td><span className="badge badge-warning">{s.resolveHours}h</span></td><td className="text-sm text-text-light">{s.description}</td>            <td><Actions item={s} /></td></tr>))}</tbody></table>
      );
      case 'kpi-groups': return (
        <table className="table"><thead><tr><th>STT</th><th>Mã nhóm</th><th>Tên nhóm</th><th>Trọng số (%)</th><th>Cấp áp dụng</th><th>Năm học</th><th>Thao tác</th></tr></thead>
          <tbody>{(data as KPIGroupInterface[]).map((g, i) => (<tr key={g.id}><td>{i + 1}</td><td className="font-mono text-xs">{g.code}</td><td className="font-medium">{g.name}</td><td>{g.defaultWeight}</td><td><span className="badge badge-info">{g.targetLevel === 'school' ? 'Trường' : g.targetLevel === 'unit' ? 'Đơn vị' : 'Cá nhân'}</span></td><td className="text-sm text-text-light">{g.academicYearId || '—'}</td><td><Actions item={g} /></td></tr>))}</tbody></table>
      );
    }
  }

  function StatusBadge({ status }: { status: string }) {
    return <span className={`badge ${status === 'active' ? 'badge-success' : 'badge-danger'}`}>{status === 'active' ? 'Đang dùng' : 'Ngừng'}</span>;
  }

  function Actions({ item }: { item: any }) {
    return (
      <div className="flex gap-1">
        <button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button>
        <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button>
      </div>
    );
  }

  function getData(): any[] {
    switch (tab) {
      case 'units': return units;
      case 'evidence-types': return eTypes;
      case 'grading-levels': return grades;
      case 'kpi-fields': return kpiFields;
      case 'data-sources': return dataSources;
      case 'kpi-statuses': return kpiStatuses;
      case 'formulas': return formulas;
      case 'warning-thresholds': return wThresholds;
      case 'report-templates': return reportTmpls;
      case 'rubrics': return rubrics;
      case 'exemptions': return exemptions;
      case 'kpi-groups': return kpiGroups;
      case 'sla-configs': return slaConfigs;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Danh mục dùng chung</h1>
          <p className="text-text-light mt-1">Quản lý danh mục hệ thống (II.1, II.3, II.4, II.5, II.6, II.7, II.8, II.9, II.10, II.11, II.12)</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} /> Thêm mới
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === t.key ? 'bg-primary text-white' : 'bg-bg-cream text-text-dark hover:bg-primary-light'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">{tabs.find(t => t.key === tab)?.label}</h3></div>
        <div className="overflow-x-auto">{renderTable()}</div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Chỉnh sửa' : 'Thêm mới'}>
        {tab === 'units' && <UnitForm initial={editItem} onSubmit={handleSave} />}
        {tab === 'evidence-types' && <ETypeForm initial={editItem} onSubmit={handleSave} />}
        {tab === 'grading-levels' && <GradeForm initial={editItem} onSubmit={handleSave} />}
        {tab === 'kpi-fields' && <KPIFieldForm initial={editItem} onSubmit={handleSave} />}
        {tab === 'data-sources' && <DataSourceForm initial={editItem} onSubmit={handleSave} />}
        {tab === 'kpi-statuses' && <KPIStatusForm initial={editItem} onSubmit={handleSave} />}
        {tab === 'formulas' && <FormulaForm initial={editItem} onSubmit={handleSave} />}
        {tab === 'warning-thresholds' && <WarningThresholdForm initial={editItem} onSubmit={handleSave} />}
        {tab === 'report-templates' && <ReportTemplateForm initial={editItem} onSubmit={handleSave} />}
        {tab === 'rubrics' && <RubricForm initial={editItem} onSubmit={handleSave} />}
        {tab === 'exemptions' && <ExemptionForm initial={editItem} onSubmit={handleSave} />}
        {tab === 'kpi-groups' && <KPIGroupForm initial={editItem} onSubmit={handleSave} />}
        {tab === 'sla-configs' && <SlaConfigForm initial={editItem} onSubmit={handleSave} />}
      </Modal>
    </div>
  );
}

// ── Form Components ────────────────────────────────────

function FormLayout({ children, onSubmit }: { children: React.ReactNode; onSubmit: () => void }) {
  return <form onSubmit={e => { e.preventDefault(); onSubmit(); }} className="space-y-4">{children}<div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => onSubmit()} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg-cream">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div></form>;
}

function Input({ label, value, onChange, required, type = 'text', placeholder }: { label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; type?: string; placeholder?: string }) {
  return <div><label className="block text-sm font-medium mb-1">{label}{required && ' *'}</label><input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" required={required} /></div>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return <div><label className="block text-sm font-medium mb-1">{label}</label><select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary">{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
}

function UnitForm({ initial, onSubmit }: { initial?: MeasurementUnit; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', description: '', status: 'active' });
  return <FormLayout onSubmit={() => onSubmit(f)}>
    <Input label="Tên đơn vị đo" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
    <Input label="Mô tả" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
  </FormLayout>;
}

function ETypeForm({ initial, onSubmit }: { initial?: EvidenceType; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', code: '', description: '', maxSize: '10MB', required: true, status: 'active' });
  return <FormLayout onSubmit={() => onSubmit(f)}>
    <Input label="Tên loại minh chứng" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
    <div className="grid grid-cols-2 gap-4">
      <Input label="Mã" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} required />
      <Input label="Dung lượng tối đa" value={f.maxSize} onChange={e => setF({ ...f, maxSize: e.target.value })} />
    </div>
    <Input label="Mô tả" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.required} onChange={e => setF({ ...f, required: e.target.checked })} className="rounded" /> Bắt buộc khi nộp minh chứng</label>
  </FormLayout>;
}

function GradeForm({ initial, onSubmit }: { initial?: GradingLevel; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', code: '', minScore: 0, maxScore: 100, color: '#4caf50', description: '', status: 'active' });
  return <FormLayout onSubmit={() => onSubmit(f)}>
    <Input label="Tên mức xếp loại" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
    <div className="grid grid-cols-2 gap-4">
      <Input label="Mã" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} required />
      <div><label className="block text-sm font-medium mb-1">Màu sắc</label><input type="color" value={f.color} onChange={e => setF({ ...f, color: e.target.value })} className="w-full h-9 px-1 py-1 border rounded-lg" /></div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Input label="Điểm từ" type="number" value={f.minScore} onChange={e => setF({ ...f, minScore: Number(e.target.value) })} required />
      <Input label="Điểm đến" type="number" value={f.maxScore} onChange={e => setF({ ...f, maxScore: Number(e.target.value) })} required />
    </div>
    <Input label="Mô tả" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
  </FormLayout>;
}

function KPIFieldForm({ initial, onSubmit }: { initial?: KPIField; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', code: '', description: '', sortOrder: 0, status: 'active' });
  return <FormLayout onSubmit={() => onSubmit(f)}>
    <Input label="Tên lĩnh vực" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
    <div className="grid grid-cols-2 gap-4">
      <Input label="Mã" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} required />
      <Input label="Thứ tự" type="number" value={f.sortOrder} onChange={e => setF({ ...f, sortOrder: Number(e.target.value) })} />
    </div>
    <Input label="Mô tả" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
  </FormLayout>;
}

function DataSourceForm({ initial, onSubmit }: { initial?: DataSource; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', code: '', description: '', responsibleUnitId: '', sourceType: 'manual', status: 'active' });
  return <FormLayout onSubmit={() => onSubmit(f)}>
    <Input label="Tên nguồn dữ liệu" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
    <div className="grid grid-cols-2 gap-4">
      <Input label="Mã" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} required />
      <Select label="Loại nguồn" value={f.sourceType} onChange={v => setF({ ...f, sourceType: v })} options={[{ value: 'api', label: 'API' }, { value: 'manual', label: 'Nhập tay' }, { value: 'integrated', label: 'Tích hợp' }]} />
    </div>
    <Input label="Mô tả" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
  </FormLayout>;
}

function KPIStatusForm({ initial, onSubmit }: { initial?: KPIStatus; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', code: '', description: '', color: '#2196f3', sortOrder: 0, category: 'plan' });
  return <FormLayout onSubmit={() => onSubmit(f)}>
    <Input label="Tên trạng thái" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
    <div className="grid grid-cols-2 gap-4">
      <Input label="Mã" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} required />
      <Select label="Danh mục" value={f.category} onChange={v => setF({ ...f, category: v })} options={[{ value: 'plan', label: 'Kế hoạch' }, { value: 'evaluation', label: 'Đánh giá' }, { value: 'evidence', label: 'Minh chứng' }, { value: 'template', label: 'Mẫu biểu' }]} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div><label className="block text-sm font-medium mb-1">Màu sắc</label><input type="color" value={f.color} onChange={e => setF({ ...f, color: e.target.value })} className="w-full h-9 px-1 py-1 border rounded-lg" /></div>
      <Input label="Thứ tự" type="number" value={f.sortOrder} onChange={e => setF({ ...f, sortOrder: Number(e.target.value) })} />
    </div>
    <Input label="Mô tả" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
  </FormLayout>;
}

function FormulaForm({ initial, onSubmit }: { initial?: KPIFormula; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', code: '', description: '', expression: '', type: 'quantitative', status: 'active' });
  return <FormLayout onSubmit={() => onSubmit(f)}>
    <Input label="Tên công thức" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
    <div className="grid grid-cols-2 gap-4">
      <Input label="Mã" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} required />
      <Select label="Loại" value={f.type} onChange={v => setF({ ...f, type: v })} options={[{ value: 'quantitative', label: 'Định lượng' }, { value: 'qualitative', label: 'Định tính' }, { value: 'rubric', label: 'Rubric' }]} />
    </div>
    <Input label="Biểu thức" value={f.expression} onChange={e => setF({ ...f, expression: e.target.value })} required />
    <Input label="Mô tả" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
  </FormLayout>;
}

function WarningThresholdForm({ initial, onSubmit }: { initial?: WarningThreshold; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', code: '', description: '', thresholdType: 'completion_percent', operator: 'lt', value: 50, color: '#ff9800', icon: 'alert', isSystem: false, status: 'active' });
  return <FormLayout onSubmit={() => onSubmit(f)}>
    <Input label="Tên ngưỡng" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
    <div className="grid grid-cols-2 gap-4">
      <Input label="Mã" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} required />
      <Select label="Loại ngưỡng" value={f.thresholdType} onChange={v => setF({ ...f, thresholdType: v })} options={[{ value: 'deadline_days', label: 'Ngày hết hạn' }, { value: 'completion_percent', label: '% hoàn thành' }, { value: 'evidence_count', label: 'SL minh chứng' }, { value: 'score_gap', label: 'Chênh lệch điểm' }]} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Select label="Điều kiện" value={f.operator} onChange={v => setF({ ...f, operator: v })} options={[{ value: 'lt', label: '<' }, { value: 'lte', label: '≤' }, { value: 'gt', label: '>' }, { value: 'gte', label: '≥' }, { value: 'eq', label: '=' }]} />
      <Input label="Giá trị" type="number" value={f.value} onChange={e => setF({ ...f, value: Number(e.target.value) })} required />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div><label className="block text-sm font-medium mb-1">Màu sắc</label><input type="color" value={f.color} onChange={e => setF({ ...f, color: e.target.value })} className="w-full h-9 px-1 py-1 border rounded-lg" /></div>
    </div>
    <Input label="Mô tả" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
  </FormLayout>;
}

function ReportTemplateForm({ initial, onSubmit }: { initial?: ReportTemplate; onSubmit: (d: any) => void }) {
  const defaults = { id: '', name: '', code: '', description: '', category: '', config: { format: 'excel', sections: [] as { title: string; fields: string[] }[], filters: [] as { key: string; label: string; type: string; options?: string[] }[] }, isSystem: false, status: 'active' as const };
  const [f, setF] = useState<ReportTemplate>(initial || defaults);
  return <FormLayout onSubmit={() => onSubmit(f)}>
    <Input label="Tên biểu mẫu" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
    <div className="grid grid-cols-2 gap-4">
      <Input label="Mã" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} required />
      <Select label="Định dạng" value={f.config.format} onChange={v => setF({ ...f, config: { ...f.config, format: v } })} options={[{ value: 'excel', label: 'Excel' }, { value: 'pdf', label: 'PDF' }, { value: 'csv', label: 'CSV' }, { value: 'word', label: 'Word' }]} />
    </div>
    <Input label="Danh mục" value={f.category} onChange={e => setF({ ...f, category: e.target.value })} />
    <Input label="Mô tả" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
  </FormLayout>;
}

function RubricForm({ initial, onSubmit }: { initial?: Rubric; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', code: '', description: '', status: 'active' });
  return <FormLayout onSubmit={() => onSubmit(f)}>
    <Input label="Tên rubric" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
    <Input label="Mã" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} required />
    <Input label="Mô tả" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
  </FormLayout>;
}

function ExemptionForm({ initial, onSubmit }: { initial?: ExemptionCoefficient; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', code: '', coefficient: 1.0, description: '', applicablePositions: [] as string[], status: 'active' });
  return <FormLayout onSubmit={() => onSubmit(f)}>
    <Input label="Tên hệ số" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
    <div className="grid grid-cols-2 gap-4">
      <Input label="Mã" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} required />
      <Input label="Hệ số (0-1)" type="number" value={f.coefficient} onChange={e => setF({ ...f, coefficient: Number(e.target.value) })} required />
    </div>
    <Input label="Mô tả" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
    <div><label className="block text-sm font-medium mb-1">Vị trí áp dụng</label><div className="flex flex-wrap gap-2">{Object.entries(positionLabels).map(([code, label]) => (<label key={code} className="flex items-center gap-1 text-sm"><input type="checkbox" checked={f.applicablePositions.includes(code)} onChange={e => { const positions = e.target.checked ? [...f.applicablePositions, code] : f.applicablePositions.filter(p => p !== code); setF({ ...f, applicablePositions: positions }); }} className="rounded" />{label}</label>))}</div></div>
  </FormLayout>;
}

function SlaConfigForm({ initial, onSubmit }: { initial?: SlaConfig; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { code: '', name: '', processName: '', responseHours: 4, resolveHours: 24, description: '', status: 'active' });
  return <FormLayout onSubmit={() => onSubmit(f)}>
    <div className="grid grid-cols-2 gap-4">
      <Input label="Mã SLA" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} required />
      <Input label="Tên SLA" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
    </div>
    <Input label="Quy trình" value={f.processName} onChange={e => setF({ ...f, processName: e.target.value })} required />
    <div className="grid grid-cols-2 gap-4">
      <Input label="Phản hồi (giờ)" type="number" value={f.responseHours} onChange={e => setF({ ...f, responseHours: Number(e.target.value) })} />
      <Input label="Xử lý (giờ)" type="number" value={f.resolveHours} onChange={e => setF({ ...f, resolveHours: Number(e.target.value) })} />
    </div>
    <Input label="Mô tả" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
  </FormLayout>;
}

function KPIGroupForm({ initial, onSubmit }: { initial?: KPIGroupInterface; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { name: '', code: '', defaultWeight: 10, targetLevel: 'school', academicYearId: '' });
  return <FormLayout onSubmit={() => onSubmit(f)}>
    <Input label="Tên nhóm KPI" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
    <div className="grid grid-cols-2 gap-4">
      <Input label="Mã nhóm" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} required />
      <Input label="Trọng số (%)" type="number" value={f.defaultWeight} onChange={e => setF({ ...f, defaultWeight: Number(e.target.value) })} required />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Select label="Cấp áp dụng" value={f.targetLevel} onChange={v => setF({ ...f, targetLevel: v })} options={[{ value: 'school', label: 'Trường' }, { value: 'unit', label: 'Đơn vị' }, { value: 'individual', label: 'Cá nhân' }]} />
      <Input label="Năm học" value={f.academicYearId || ''} onChange={e => setF({ ...f, academicYearId: e.target.value })} placeholder="ay002" />
    </div>
  </FormLayout>;
}
