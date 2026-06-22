'use client';

import { useState, useEffect, useCallback } from 'react';
import { Layers, Target, Building, Users, Plus, Edit, Trash2, Copy, ChevronDown, ChevronRight, Compass, ArrowRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import strategicObjectives from '@/data/strategic-objectives.json';
import bscMapLinks from '@/data/bsc-map-links.json';
import type { KPIGroup, KPIIndicator, UnitKPIEntry, IndividualKPIEntry, UnitKPIDetail, IndividualKPIDetail, AcademicYear, StrategicObjective, BSCMapLink } from '@/types';

type TabKey = 'indicators' | 'unit' | 'individual';

export default function KPIDataPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState('');

  const [tab, setTab] = useState<TabKey>('indicators');
  const [groups, setGroups] = useState<KPIGroup[]>([]);
  const [indicators, setIndicators] = useState<KPIIndicator[]>([]);
  const [unitKpis, setUnitKpis] = useState<UnitKPIEntry[]>([]);
  const [indKpis, setIndKpis] = useState<IndividualKPIEntry[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupEditId, setGroupEditId] = useState<string | null>(null);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneFromYear, setCloneFromYear] = useState('');
  const [cloning, setCloning] = useState(false);
  const [filterGroupId, setFilterGroupId] = useState<string | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandedInds, setExpandedInds] = useState<Set<string>>(new Set());

  const objList = strategicObjectives as StrategicObjective[];
  const linkList = bscMapLinks as BSCMapLink[];

  // Build mapping: indicatorCode (CTU-KPI-xx) → objective names
  const indicatorToObjectives: Record<string, string[]> = {};
  linkList
    .filter(l => l.linkType === 'objective_to_indicator' && l.indicatorId)
    .forEach(l => {
      const obj = objList.find(o => o.id === l.objectiveId);
      if (obj) {
        if (!indicatorToObjectives[l.indicatorId!]) indicatorToObjectives[l.indicatorId!] = [];
        if (!indicatorToObjectives[l.indicatorId!].includes(obj.name)) {
          indicatorToObjectives[l.indicatorId!].push(obj.name);
        }
      }
    });

  const loadYears = useCallback(async () => {
    const y = await apiGet<AcademicYear[]>('/api/academic-years');
    setYears(y);
    if (!selectedYearId) {
      const active = y.find(ay => ay.status === 'active');
      if (active) setSelectedYearId(active.id);
    }
  }, [selectedYearId]);

  const loadData = useCallback(async (yearId: string) => {
    if (!yearId) return;
    const q = `?academicYearId=${yearId}`;
    const [g, i, u, p] = await Promise.all([
      apiGet<KPIGroup[]>(`/api/kpi-groups${q}`),
      apiGet<KPIIndicator[]>(`/api/indicators${q}`),
      apiGet<UnitKPIEntry[]>(`/api/unit-kpis${q}`),
      apiGet<IndividualKPIEntry[]>(`/api/individual-kpis${q}`),
    ]);
    setGroups(g); setIndicators(i); setUnitKpis(u); setIndKpis(p);
  }, []);

  useEffect(() => { loadYears(); }, [loadYears]);

  useEffect(() => {
    if (selectedYearId) loadData(selectedYearId);
  }, [selectedYearId, loadData]);

  const hasData = groups.length > 0 || indicators.length > 0 || unitKpis.length > 0 || indKpis.length > 0;

  const apiEntity = (t: TabKey) =>
    t === 'indicators' ? 'indicators' : t === 'unit' ? 'unit-kpis' : 'individual-kpis';

  const handleSave = async (data: any) => {
    const payload = { ...data, academicYearId: selectedYearId };
    const entity = apiEntity(tab);
    if (editId) {
      await apiPut(`/api/${entity}/${editId}`, payload);
    } else {
      await apiPost(`/api/${entity}`, payload);
    }
    setShowModal(false); setEditId(null); loadData(selectedYearId);
  };

  const handleGroupSave = async (data: any) => {
    const payload = { ...data, academicYearId: selectedYearId };
    if (groupEditId) {
      await apiPut(`/api/kpi-groups/${groupEditId}`, payload);
    } else {
      await apiPost('/api/kpi-groups', payload);
    }
    setShowGroupModal(false); setGroupEditId(null); loadData(selectedYearId);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa mục này?')) return;
    await apiDelete(`/api/${apiEntity(tab)}/${id}`);
    loadData(selectedYearId);
  };

  const handleGroupDelete = async (id: string) => {
    const count = indicators.filter(i => i.categoryId === id).length;
    if (count > 0 && !confirm(`Lĩnh vực này đang có ${count} chỉ tiêu. Xoá sẽ mất liên kết. Tiếp tục?`)) return;
    await apiDelete(`/api/kpi-groups/${id}`);
    loadData(selectedYearId);
  };

  const handleCloneClick = () => {
    const prev = years.filter(y => y.id !== selectedYearId).pop();
    setCloneFromYear(prev?.id || '');
    setShowCloneModal(true);
  };

  const handleClone = async () => {
    if (!cloneFromYear || !selectedYearId) return;
    setCloning(true);
    await apiPost(`/api/kpi-data/clone?fromYear=${cloneFromYear}&toYear=${selectedYearId}`, {});
    setShowCloneModal(false);
    setCloning(false);
    loadData(selectedYearId);
  };

  const tabs = [
    { id: 'indicators' as TabKey, label: 'Chỉ tiêu Trường', icon: Target, count: indicators.length },
    { id: 'unit' as TabKey, label: 'KPI Đơn vị', icon: Building, count: unitKpis.length },
    { id: 'individual' as TabKey, label: 'KPI Cá nhân', icon: Users, count: indKpis.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Khung KPI chiến lược
            {selectedYearId && <span className="text-lg font-normal text-text-light ml-2">— {years.find(y => y.id === selectedYearId)?.name || ''}</span>}
          </h1>
          <p className="text-text-light mt-1">Định nghĩa chỉ tiêu KPI và giao cho đơn vị, cá nhân theo chiến lược</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setGroupEditId(null); setShowGroupModal(true); }} className="btn-secondary flex items-center gap-1 text-xs">
            <Layers size={14} /> Lĩnh vực
          </button>
          <button onClick={handleCloneClick} className="btn-primary flex items-center gap-1 text-xs">
            <Copy size={14} /> Sao chép
          </button>
        </div>
      </div>

      {/* Flow diagram */}
      <div className="card bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-blue-100">
        <div className="p-4">
          <div className="flex items-center justify-center gap-1 sm:gap-3 flex-wrap text-xs sm:text-sm">
            <a href="/kpi/strategic-objectives" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-blue-200 text-blue-700 hover:bg-blue-50 font-medium">
              <Compass size={14} /> Mục tiêu CL
            </a>
            <ArrowRight size={16} className="text-text-light shrink-0" />
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-medium">
              <Target size={14} /> Chỉ tiêu Trường
            </span>
            <ArrowRight size={16} className="text-text-light shrink-0" />
            <a href="#unit" onClick={() => setTab('unit')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-green-200 text-green-700 hover:bg-green-50 font-medium">
              <Building size={14} /> KPI Đơn vị
            </a>
            <ArrowRight size={16} className="text-text-light shrink-0" />
            <a href="#individual" onClick={() => setTab('individual')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-purple-200 text-purple-700 hover:bg-purple-50 font-medium">
              <Users size={14} /> KPI Cá nhân
            </a>
          </div>
        </div>
      </div>

      {/* Year selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-text-dark">Năm học:</span>
        {years.map(ay => (
          <button key={ay.id} onClick={() => setSelectedYearId(ay.id)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${selectedYearId === ay.id ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>
            {ay.name}
          </button>
        ))}
      </div>

      {/* Clone prompt when no data */}
      {!hasData && selectedYearId && (
        <div className="card bg-accent-yellow/5 border border-accent-yellow/30">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-dark">Chưa có bộ chỉ tiêu cho năm học này</p>
              <p className="text-xs text-text-light mt-0.5">Sao chép từ năm học trước để bắt đầu</p>
            </div>
            <button onClick={() => {
              const prev = years.filter(y => y.id !== selectedYearId).pop();
              setCloneFromYear(prev?.id || '');
              setShowCloneModal(true);
            }} className="btn-primary text-xs flex items-center gap-1">
              <Copy size={14} /> Sao chép từ năm khác
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-border">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setEditId(null); setShowModal(false); setFilterGroupId(null); }}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-dark'}`}>
              <Icon size={16} /> {t.label}
              <span className="badge badge-info ml-1">{t.count}</span>
            </button>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-white">{tabs.find(t => t.id === tab)?.label}</h3>
          <div className="flex items-center gap-2">
            {tab === 'indicators' && (
              <select value={filterGroupId || ''} onChange={e => setFilterGroupId(e.target.value || null)}
                className="px-2 py-1 rounded border border-border bg-white text-text-dark text-xs focus:outline-none">
                <option value="">Tất cả lĩnh vực</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            )}
            {selectedYearId && (
              <button onClick={() => { setEditId(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
                <Plus size={14} /> Thêm
              </button>
            )}
          </div>
        </div>
        <div className="p-0">
          {tab === 'indicators' && (
            <table className="table">
              <thead><tr><th>ID</th><th>Tên chỉ tiêu</th><th>Lĩnh vực</th><th>Đơn vị</th><th>Chỉ tiêu</th><th>Trọng số</th><th>Mục tiêu CL</th><th>Thao tác</th></tr></thead>
              <tbody>
                {(filterGroupId ? indicators.filter(ind => ind.categoryId === filterGroupId) : indicators).map(ind => {
                  const objNames = indicatorToObjectives[ind.code] || [];
                  return (
                    <tr key={ind.id}>
                      <td><span className="badge badge-info">{ind.code}</span></td>
                      <td className="font-medium max-w-[250px] truncate" title={ind.name}>{ind.name}</td>
                      <td>{groups.find(g => g.id === ind.categoryId)?.name || ind.categoryId}</td>
                      <td>{ind.unit}</td>
                      <td>{ind.targetValue}</td>
                      <td>{ind.weight}%</td>
                      <td className="max-w-[200px]">
                        {objNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {objNames.map(n => (
                              <span key={n} className="badge badge-secondary text-[10px] truncate max-w-[150px]" title={n}>{n}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-text-light text-xs">—</span>
                        )}
                      </td>
                      <td><Actions id={ind.id} onEdit={() => { setEditId(ind.id); setShowModal(true); }} onDelete={() => handleDelete(ind.id)} /></td>
                    </tr>
                  );
                })}
                {(filterGroupId ? indicators.filter(ind => ind.categoryId === filterGroupId) : indicators).length === 0 && <tr><td colSpan={8} className="text-center text-text-light text-sm py-8">Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          )}
          {tab === 'unit' && (
            <table className="table">
              <thead><tr><th></th><th>ID</th><th>Đơn vị</th><th>Mã</th><th>Số KPI</th><th>Loại</th><th>Thao tác</th></tr></thead>
              <tbody>
                {unitKpis.flatMap(u => {
                  const expanded = expandedUnits.has(u.id);
                  const rows: React.ReactNode[] = [
                    <tr key={u.id}>
                      <td>
                        {u.kpis.length > 0 && (
                          <button onClick={() => {
                            const next = new Set(expandedUnits);
                            expanded ? next.delete(u.id) : next.add(u.id);
                            setExpandedUnits(next);
                          }} className="p-1 text-text-light hover:text-text-dark">
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        )}
                      </td>
                      <td><span className="badge badge-info">{u.id}</span></td>
                      <td className="font-medium">{u.name}</td>
                      <td>{u.code}</td>
                      <td>{u.kpis.length}</td>
                      <td>{u.type}</td>
                      <td><Actions id={u.id} onEdit={() => { setEditId(u.id); setShowModal(true); }} onDelete={() => handleDelete(u.id)} /></td>
                    </tr>
                  ];
                  if (expanded) {
                    rows.push(
                      <tr key={`${u.id}-sub`} className="bg-bg-cream/50">
                        <td colSpan={7} className="p-0">
                          <div className="px-6 py-3">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-1 pr-2 font-medium">Mã</th>
                                  <th className="text-left py-1 pr-2 font-medium">Tên KPI</th>
                                  <th className="text-left py-1 pr-2 font-medium">CT Trường</th>
                                  <th className="text-left py-1 pr-2 font-medium">Chỉ tiêu</th>
                                  <th className="text-left py-1 pr-2 font-medium">ĐVT</th>
                                  <th className="text-left py-1 pr-2 font-medium">Trọng số</th>
                                </tr>
                              </thead>
                              <tbody>
                                {u.kpis.map(k => {
                                  const linkedInd = indicators.find(ind => ind.id === k.indicatorId);
                                  return (
                                    <tr key={k.id} className="border-b border-border/50">
                                      <td className="py-1 pr-2 text-text-light">{k.id}</td>
                                      <td className="py-1 pr-2 font-medium">{k.name}</td>
                                      <td className="py-1 pr-2">
                                        {linkedInd ? (
                                          <span className="text-primary text-[10px]">{linkedInd.code}</span>
                                        ) : (
                                          <span className="text-text-light text-[10px]">—</span>
                                        )}
                                      </td>
                                      <td className="py-1 pr-2">{k.target}</td>
                                      <td className="py-1 pr-2">{k.unit}</td>
                                      <td className="py-1 pr-2">{k.weight}%</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  return rows;
                })}
                {unitKpis.length === 0 && <tr><td colSpan={7} className="text-center text-text-light text-sm py-8">Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          )}
          {tab === 'individual' && (
            <table className="table">
              <thead><tr><th></th><th>ID</th><th>Vị trí</th><th>Mã</th><th>Số KPI</th><th>Thao tác</th></tr></thead>
              <tbody>
                {indKpis.flatMap(p => {
                  const expanded = expandedInds.has(p.id);
                  const rows: React.ReactNode[] = [
                    <tr key={p.id}>
                      <td>
                        {p.kpis.length > 0 && (
                          <button onClick={() => {
                            const next = new Set(expandedInds);
                            expanded ? next.delete(p.id) : next.add(p.id);
                            setExpandedInds(next);
                          }} className="p-1 text-text-light hover:text-text-dark">
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        )}
                      </td>
                      <td><span className="badge badge-info">{p.id}</span></td>
                      <td className="font-medium">{p.name}</td>
                      <td>{p.code}</td>
                      <td>{p.kpis.length}</td>
                      <td><Actions id={p.id} onEdit={() => { setEditId(p.id); setShowModal(true); }} onDelete={() => handleDelete(p.id)} /></td>
                    </tr>
                  ];
                  if (expanded) {
                    rows.push(
                      <tr key={`${p.id}-sub`} className="bg-bg-cream/50">
                        <td colSpan={6} className="p-0">
                          <div className="px-6 py-3">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-1 pr-2 font-medium">Mã</th>
                                  <th className="text-left py-1 pr-2 font-medium">Tên KPI</th>
                                  <th className="text-left py-1 pr-2 font-medium">Chỉ tiêu</th>
                                  <th className="text-left py-1 pr-2 font-medium">ĐVT</th>
                                  <th className="text-left py-1 pr-2 font-medium">Trọng số</th>
                                </tr>
                              </thead>
                              <tbody>
                                {p.kpis.map(k => (
                                  <tr key={k.id} className="border-b border-border/50">
                                    <td className="py-1 pr-2 text-text-light">{k.id}</td>
                                    <td className="py-1 pr-2 font-medium">{k.name}</td>
                                    <td className="py-1 pr-2">{k.target}</td>
                                    <td className="py-1 pr-2">{k.unit}</td>
                                    <td className="py-1 pr-2">{k.weight}%</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  return rows;
                })}
                {indKpis.length === 0 && <tr><td colSpan={6} className="text-center text-text-light text-sm py-8">Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Add/Edit current tab items */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditId(null); }}
        title={`${editId ? 'Sửa' : 'Thêm'} ${tab === 'indicators' ? 'Chỉ tiêu Trường' : tab === 'unit' ? 'KPI Đơn vị' : 'KPI Cá nhân'}`} maxWidth="max-w-3xl">
        {tab === 'indicators' && <IndicatorForm item={indicators.find(i => i.id === editId) || null} groups={groups} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditId(null); }} />}
        {tab === 'unit' && <UnitForm item={unitKpis.find(u => u.id === editId) || null} groups={groups} indicators={indicators} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditId(null); }} />}
        {tab === 'individual' && <IndividualForm item={indKpis.find(p => p.id === editId) || null} unitKpis={unitKpis} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditId(null); }} />}
      </Modal>

      {/* Modal: Group management */}
      <Modal isOpen={showGroupModal} onClose={() => { setShowGroupModal(false); setGroupEditId(null); }}
        title={groupEditId ? 'Sửa Lĩnh vực KPI' : 'Quản lý Lĩnh vực KPI'} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setGroupEditId(null); setShowGroupModal(true); setGroupEditId('new'); }} className="btn-primary text-xs flex items-center gap-1">
              <Plus size={14} /> Thêm lĩnh vực
            </button>
          </div>
          <table className="table">
            <thead><tr><th>ID</th><th>Tên Lĩnh vực</th><th>Mã</th><th>Số chỉ tiêu</th><th>Trọng số</th><th>Cấp</th><th>Thao tác</th></tr></thead>
            <tbody>
              {groups.map(g => {
                const count = indicators.filter(i => i.categoryId === g.id).length;
                return (
                  <tr key={g.id}>
                    <td><span className="badge badge-info">{g.id}</span></td>
                    <td className="font-medium">{g.name}</td>
                    <td>{g.code}</td>
                    <td><span className="text-primary font-medium">{count}</span></td>
                    <td>{g.defaultWeight}%</td>
                    <td>{g.targetLevel === 'school' ? 'Trường' : g.targetLevel === 'unit' ? 'Đơn vị' : 'Cá nhân'}</td>
                    <td><Actions id={g.id} onEdit={() => { setGroupEditId(g.id); }} onDelete={() => handleGroupDelete(g.id)} /></td>
                  </tr>
                );
              })}
              {groups.length === 0 && <tr><td colSpan={7} className="text-center text-text-light text-sm py-4">Chưa có lĩnh vực nào</td></tr>}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Group inline edit form */}
      <Modal
        isOpen={!!groupEditId && groupEditId !== 'new' && groupEditId !== null}
        onClose={() => setGroupEditId(null)}
        title="Sửa Lĩnh vực KPI"
      >
        {groupEditId && groupEditId !== 'new' && (
          <GroupForm item={groups.find(g => g.id === groupEditId) || null} onSubmit={handleGroupSave} onCancel={() => setGroupEditId(null)} />
        )}
      </Modal>

      {/* Group create form */}
      <Modal
        isOpen={groupEditId === 'new'}
        onClose={() => setGroupEditId(null)}
        title="Thêm Lĩnh vực KPI"
      >
        <GroupForm item={null} onSubmit={handleGroupSave} onCancel={() => setGroupEditId(null)} />
      </Modal>

      {/* Clone modal */}
      <Modal isOpen={showCloneModal} onClose={() => setShowCloneModal(false)} title="Sao chép bộ chỉ tiêu">
        <div className="space-y-4">
          <p className="text-sm text-text-light">Chọn năm học nguồn để sao chép bộ chỉ tiêu sang năm <strong>{years.find(y => y.id === selectedYearId)?.name}</strong>:</p>
          <select value={cloneFromYear} onChange={e => setCloneFromYear(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
            <option value="">-- Chọn năm học --</option>
            {years.filter(y => y.id !== selectedYearId).map(y => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={() => setShowCloneModal(false)} className="btn-secondary">Hủy</button>
            <button type="button" onClick={handleClone} disabled={!cloneFromYear || cloning} className="btn-primary flex items-center gap-1">
              <Copy size={14} /> {cloning ? 'Đang sao chép...' : 'Sao chép'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Actions({ id, onEdit, onDelete }: { id: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-1">
      <button onClick={onEdit} className="p-1 text-accent-yellow hover:bg-accent-yellow/10 rounded"><Edit size={14} /></button>
      <button onClick={onDelete} className="p-1 text-accent-red hover:bg-accent-red/10 rounded"><Trash2 size={14} /></button>
    </div>
  );
}

function GroupForm({ item, onSubmit, onCancel }: { item: KPIGroup | null; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [defaultWeight, setDefaultWeight] = useState(item?.defaultWeight ?? 10);
  const [targetLevel, setTargetLevel] = useState(item?.targetLevel || 'school');
  const handle = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ name, code, defaultWeight, targetLevel }); };
  return (
    <form onSubmit={handle} className="space-y-4">
      <div><label className="block text-sm font-medium mb-1">Tên Lĩnh vực *</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mã *</label><input type="text" value={code} onChange={e => setCode(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
        <div><label className="block text-sm font-medium mb-1">Trọng số mặc định *</label><input type="number" value={defaultWeight} onChange={e => setDefaultWeight(Number(e.target.value))} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Cấp</label><select value={targetLevel} onChange={e => setTargetLevel(e.target.value as 'school' | 'unit' | 'individual')} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"><option value="school">Trường</option><option value="unit">Đơn vị</option><option value="individual">Cá nhân</option></select></div>
      <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onCancel} className="btn-secondary">Hủy</button><button type="submit" className="btn-primary">{item ? 'Cập nhật' : 'Thêm mới'}</button></div>
    </form>
  );
}

function IndicatorForm({ item, groups, onSubmit, onCancel }: { item: KPIIndicator | null; groups: KPIGroup[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [categoryId, setCategoryId] = useState(item?.categoryId || groups[0]?.id || '');
  const [formula, setFormula] = useState(item?.formula || '');
  const [unit, setUnit] = useState(item?.unit || '%');
  const [direction, setDirection] = useState(item?.direction || 'higher_better');
  const [requiredEvidence, setRequiredEvidence] = useState(item?.requiredEvidence ?? true);
  const [maxScore, setMaxScore] = useState(item?.maxScore ?? 10);
  const [targetValue, setTargetValue] = useState(item?.targetValue ?? 0);
  const [weight, setWeight] = useState(item?.weight ?? 5);
  const handle = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ name, code, categoryId, formula, unit, direction, requiredEvidence, maxScore, targetValue: Number(targetValue), weight }); };
  return (
    <form onSubmit={handle} className="space-y-4">
      <div><label className="block text-sm font-medium mb-1">Tên chỉ tiêu *</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mã</label><input type="text" value={code} onChange={e => setCode(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
        <div><label className="block text-sm font-medium mb-1">Lĩnh vực *</label><select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Công thức</label><input type="text" value={formula} onChange={e => setFormula(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium mb-1">Đơn vị</label><input type="text" value={unit} onChange={e => setUnit(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
        <div><label className="block text-sm font-medium mb-1">Hướng</label><select value={direction} onChange={e => setDirection(e.target.value as 'higher_better' | 'lower_better')} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"><option value="higher_better">Cao hơn tốt hơn</option><option value="lower_better">Thấp hơn tốt hơn</option></select></div>
        <div><label className="block text-sm font-medium mb-1">Cần MC?</label><select value={requiredEvidence ? 'yes' : 'no'} onChange={e => setRequiredEvidence(e.target.value === 'yes')} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"><option value="yes">Có</option><option value="no">Không</option></select></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium mb-1">Chỉ tiêu *</label><input type="number" value={targetValue} onChange={e => setTargetValue(Number(e.target.value))} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
        <div><label className="block text-sm font-medium mb-1">Điểm tối đa</label><input type="number" value={maxScore} onChange={e => setMaxScore(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
        <div><label className="block text-sm font-medium mb-1">Trọng số %</label><input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onCancel} className="btn-secondary">Hủy</button><button type="submit" className="btn-primary">{item ? 'Cập nhật' : 'Thêm mới'}</button></div>
    </form>
  );
}

function UnitForm({ item, groups, indicators, onSubmit, onCancel }: { item: UnitKPIEntry | null; groups: KPIGroup[]; indicators: KPIIndicator[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [type, setType] = useState(item?.type || 'department');
  const [description, setDescription] = useState(item?.description || '');
  const [kpis, setKpis] = useState<UnitKPIDetail[]>(item?.kpis || []);
  const addKpi = () => setKpis([...kpis, { id: `KPI-${Date.now()}`, name: '', target: 0, unit: '%', weight: 5, indicatorId: null }]);
  const removeKpi = (i: number) => setKpis(kpis.filter((_, idx) => idx !== i));
  const updateKpi = (i: number, field: string, value: any) => setKpis(kpis.map((k, idx) => idx === i ? { ...k, [field]: value } : k));
  const handle = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ name, code, type, description, kpis }); };
  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Tên đơn vị *</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
        <div><label className="block text-sm font-medium mb-1">Mã *</label><input type="text" value={code} onChange={e => setCode(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Loại</label><select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"><option value="department">Phòng ban</option><option value="center">Trung tâm</option><option value="faculty">Khoa</option><option value="research">Nghiên cứu</option></select></div>
        <div><label className="block text-sm font-medium mb-1">Mô tả</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
      </div>
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">Danh sách KPI ({kpis.length})</span><button type="button" onClick={addKpi} className="btn-primary text-xs flex items-center gap-1"><Plus size={12} /> Thêm KPI</button></div>
        {kpis.map((k, i) => (
          <div key={i} className="flex items-center gap-2 mb-2 p-2 bg-bg-cream rounded border border-border text-sm">
            <input type="text" placeholder="Mã" value={k.id} onChange={e => updateKpi(i, 'id', e.target.value)} className="w-24 px-2 py-1 border rounded text-xs" />
            <input type="text" placeholder="Tên KPI" value={k.name} onChange={e => updateKpi(i, 'name', e.target.value)} className="flex-1 px-2 py-1 border rounded text-xs" />
            <input type="number" placeholder="Target" value={k.target} onChange={e => updateKpi(i, 'target', Number(e.target.value))} className="w-16 px-2 py-1 border rounded text-xs" />
            <input type="text" placeholder="Đvt" value={k.unit} onChange={e => updateKpi(i, 'unit', e.target.value)} className="w-14 px-2 py-1 border rounded text-xs" />
            <input type="number" placeholder="W" value={k.weight} onChange={e => updateKpi(i, 'weight', Number(e.target.value))} className="w-14 px-2 py-1 border rounded text-xs" />
            <select value={k.indicatorId || ''} onChange={e => updateKpi(i, 'indicatorId', e.target.value || null)} className="w-28 px-2 py-1 border rounded text-xs">
              <option value="">-- Không --</option>
              {indicators.map(ind => <option key={ind.id} value={ind.id}>{ind.code}</option>)}
            </select>
            <button type="button" onClick={() => removeKpi(i)} className="p-1 text-accent-red"><Trash2 size={12} /></button>
          </div>
        ))}
        {kpis.length === 0 && <p className="text-xs text-text-light text-center py-2">Chưa có KPI nào</p>}
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onCancel} className="btn-secondary">Hủy</button><button type="submit" className="btn-primary">{item ? 'Cập nhật' : 'Thêm mới'}</button></div>
    </form>
  );
}

function IndividualForm({ item, unitKpis, onSubmit, onCancel }: { item: IndividualKPIEntry | null; unitKpis: UnitKPIEntry[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [kpis, setKpis] = useState<IndividualKPIDetail[]>(item?.kpis || []);
  const allUnitKpis = unitKpis.flatMap(u => u.kpis.map(k => ({ ...k, unitCode: u.code, unitName: u.name })));
  const addKpi = () => setKpis([...kpis, { id: `KPI-${Date.now()}`, name: '', target: 0, unit: '%', weight: 5 }]);
  const removeKpi = (i: number) => setKpis(kpis.filter((_, idx) => idx !== i));
  const updateKpi = (i: number, field: string, value: any) => setKpis(kpis.map((k, idx) => idx === i ? { ...k, [field]: value } : k));
  const handle = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ name, code, kpis }); };
  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Tên vị trí *</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
        <div><label className="block text-sm font-medium mb-1">Mã *</label><input type="text" value={code} onChange={e => setCode(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
      </div>
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">Danh sách KPI ({kpis.length})</span><button type="button" onClick={addKpi} className="btn-primary text-xs flex items-center gap-1"><Plus size={12} /> Thêm KPI</button></div>
        {kpis.map((k, i) => (
          <div key={i} className="flex items-center gap-2 mb-2 p-2 bg-bg-cream rounded border border-border text-sm">
            <input type="text" placeholder="Mã" value={k.id} onChange={e => updateKpi(i, 'id', e.target.value)} className="w-24 px-2 py-1 border rounded text-xs" />
            <input type="text" placeholder="Tên KPI" value={k.name} onChange={e => updateKpi(i, 'name', e.target.value)} className="flex-1 px-2 py-1 border rounded text-xs" />
            <input type="number" placeholder="Target" value={k.target} onChange={e => updateKpi(i, 'target', Number(e.target.value))} className="w-16 px-2 py-1 border rounded text-xs" />
            <input type="text" placeholder="Đvt" value={k.unit} onChange={e => updateKpi(i, 'unit', e.target.value)} className="w-14 px-2 py-1 border rounded text-xs" />
            <input type="number" placeholder="W" value={k.weight} onChange={e => updateKpi(i, 'weight', Number(e.target.value))} className="w-14 px-2 py-1 border rounded text-xs" />
            <select value={k.unitKpiId || ''} onChange={e => updateKpi(i, 'unitKpiId', e.target.value || null)} className="w-28 px-2 py-1 border rounded text-xs">
              <option value="">-- KPI ĐV --</option>
              {allUnitKpis.map(uk => <option key={uk.id} value={uk.id}>{uk.id} ({uk.unitCode})</option>)}
            </select>
            <button type="button" onClick={() => removeKpi(i)} className="p-1 text-accent-red"><Trash2 size={12} /></button>
          </div>
        ))}
        {kpis.length === 0 && <p className="text-xs text-text-light text-center py-2">Chưa có KPI nào</p>}
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onCancel} className="btn-secondary">Hủy</button><button type="submit" className="btn-primary">{item ? 'Cập nhật' : 'Thêm mới'}</button></div>
    </form>
  );
}
