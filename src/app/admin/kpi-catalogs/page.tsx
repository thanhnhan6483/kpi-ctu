'use client';

import { useState, useEffect, useCallback } from 'react';
import { Layers, Target, Building, Users, Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { SchoolCatalogForm, UnitCatalogForm, IndividualCatalogForm, GroupCatalogForm } from '@/components/forms/kpi-catalog-forms';
import type { SchoolKPICatalog, KPIGroupCatalog, UnitKPICatalog, IndividualKPICatalog } from '@/types';

type TabKey = 'group-catalog' | 'school-catalog' | 'unit-catalog' | 'individual-catalog';

export default function KPICatalogsPage() {
  const [tab, setTab] = useState<TabKey>('group-catalog');

  const [schoolCatalog, setSchoolCatalog] = useState<SchoolKPICatalog[]>([]);
  const [unitCatalog, setUnitCatalog] = useState<UnitKPICatalog[]>([]);
  const [indCatalog, setIndCatalog] = useState<IndividualKPICatalog[]>([]);
  const [groupCatalog, setGroupCatalog] = useState<KPIGroupCatalog[]>([]);
  const [measurementUnits, setMeasurementUnits] = useState<{ id: string; name: string }[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [catalogGroupFilter, setCatalogGroupFilter] = useState<string | null>(null);
  const [catalogPosFilter, setCatalogPosFilter] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [sc, uc, ic, gc, mu] = await Promise.all([
      apiGet<SchoolKPICatalog[]>('/api/school-kpi-catalog'),
      apiGet<UnitKPICatalog[]>('/api/unit-kpi-catalog'),
      apiGet<IndividualKPICatalog[]>('/api/individual-kpi-catalog'),
      apiGet<KPIGroupCatalog[]>('/api/kpi-group-catalog'),
      apiGet<{ id: string; name: string }[]>('/api/measurement-units'),
    ]);
    setSchoolCatalog(sc); setUnitCatalog(uc); setIndCatalog(ic); setGroupCatalog(gc); setMeasurementUnits(mu);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const apiEntity = (t: TabKey) => {
    if (t === 'school-catalog') return 'school-kpi-catalog';
    if (t === 'unit-catalog') return 'unit-kpi-catalog';
    if (t === 'individual-catalog') return 'individual-kpi-catalog';
    return 'kpi-group-catalog';
  };

  const handleSave = async (data: any) => {
    const entity = apiEntity(tab);
    if (editId) {
      await apiPut(`/api/${entity}/${editId}`, data);
    } else {
      await apiPost(`/api/${entity}`, data);
    }
    setShowModal(false); setEditId(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa mục này?')) return;
    await apiDelete(`/api/${apiEntity(tab)}/${id}`);
    loadData();
  };

  const tabs = [
    { id: 'group-catalog' as TabKey, label: 'Nhóm tiêu chí', icon: Layers, count: groupCatalog.length },
    { id: 'school-catalog' as TabKey, label: 'Chỉ tiêu Trường', icon: Target, count: schoolCatalog.length },
    { id: 'unit-catalog' as TabKey, label: 'Chỉ tiêu đơn vị', icon: Building, count: unitCatalog.length },
    { id: 'individual-catalog' as TabKey, label: 'Chỉ tiêu cá nhân', icon: Users, count: indCatalog.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Danh mục chỉ tiêu KPI</h1>
          <p className="text-text-light mt-1">Danh mục chỉ tiêu độc lập năm học</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setEditId(null); setShowModal(false); setCatalogGroupFilter(null); setCatalogPosFilter(null); }}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-dark'}`}>
              <Icon size={16} /> {t.label}
              <span className="badge badge-info ml-1">{t.count}</span>
            </button>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-white">{tabs.find(t => t.id === tab)?.label || 'Danh mục'}</h3>
          <div className="flex items-center gap-2">
            {tab === 'school-catalog' && (
              <select value={catalogGroupFilter || ''} onChange={e => setCatalogGroupFilter(e.target.value || null)}
                className="px-2 py-1 rounded border border-border bg-white text-text-dark text-xs focus:outline-none">
                <option value="">Tất cả nhóm</option>
                {groupCatalog.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            )}
            {tab === 'individual-catalog' && (
              <select value={catalogPosFilter || ''} onChange={e => setCatalogPosFilter(e.target.value || null)}
                className="px-2 py-1 rounded border border-border bg-white text-text-dark text-xs focus:outline-none">
                <option value="">Tất cả vị trí</option>
                {[...new Set(indCatalog.map(i => i.positionCode))].map(pc => <option key={pc} value={pc}>{pc}</option>)}
              </select>
            )}
            <button onClick={() => { setEditId(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
              <Plus size={14} /> Thêm
            </button>
          </div>
        </div>
        <div className="p-0">
          {tab === 'group-catalog' && (
            <table className="table">
              <thead><tr><th>Mã</th><th>Tên nhóm</th><th>Trọng số mặc định</th><th>Cấp</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {groupCatalog.map(g => (
                  <tr key={g.id}>
                    <td><span className="badge badge-info">{g.code}</span></td>
                    <td className="font-medium">{g.name}</td>
                    <td>{g.defaultWeight}%</td>
                    <td>{g.targetLevel === 'school' ? 'Trường' : g.targetLevel === 'unit' ? 'Đơn vị' : 'Cá nhân'}</td>
                    <td><span className={`badge ${g.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{g.status}</span></td>
                    <td><Actions id={g.id} onEdit={() => { setEditId(g.id); setShowModal(true); }} onDelete={() => handleDelete(g.id)} /></td>
                  </tr>
                ))}
                {groupCatalog.length === 0 && <tr><td colSpan={6} className="text-center text-text-light text-sm py-8">Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          )}
          {tab === 'school-catalog' && (
            <table className="table">
              <thead><tr><th>Mã</th><th>Tên chỉ tiêu</th><th>Nhóm</th><th>Đơn vị</th><th>Hướng</th><th>Điểm tối đa</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {(catalogGroupFilter ? schoolCatalog.filter(s => s.categoryId === catalogGroupFilter) : schoolCatalog).map(s => (
                  <tr key={s.id}>
                    <td><span className="badge badge-info">{s.code}</span></td>
                    <td className="font-medium max-w-[250px] truncate" title={s.name}>{s.name}</td>
                    <td>{groupCatalog.find(g => g.id === s.categoryId)?.name || s.categoryId}</td>
                    <td>{measurementUnits.find(m => m.id === s.unitId)?.name || s.unitId}</td>
                    <td>{s.direction === 'higher_better' ? '↑' : '↓'}</td>
                    <td>{s.maxScore}</td>
                    <td><span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
                    <td><Actions id={s.id} onEdit={() => { setEditId(s.id); setShowModal(true); }} onDelete={() => handleDelete(s.id)} /></td>
                  </tr>
                ))}
                {schoolCatalog.length === 0 && <tr><td colSpan={8} className="text-center text-text-light text-sm py-8">Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          )}
          {tab === 'unit-catalog' && (
            <table className="table">
              <thead><tr><th>Mã</th><th>Tên KPI</th><th>ĐVT</th><th>Liên kết chỉ tiêu Trường</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {unitCatalog.map(u => (
                  <tr key={u.id}>
                    <td><span className="badge badge-info">{u.code}</span></td>
                    <td className="font-medium">{u.name}</td>
                    <td>{measurementUnits.find(m => m.id === u.unitId)?.name || u.unitId}</td>
                    <td>{u.linkedCatalogId ? <span className="badge badge-info">{u.linkedCatalogId}</span> : <span className="text-text-light text-xs">—</span>}</td>
                    <td><span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{u.status}</span></td>
                    <td><Actions id={u.id} onEdit={() => { setEditId(u.id); setShowModal(true); }} onDelete={() => handleDelete(u.id)} /></td>
                  </tr>
                ))}
                {unitCatalog.length === 0 && <tr><td colSpan={6} className="text-center text-text-light text-sm py-8">Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          )}
          {tab === 'individual-catalog' && (
            <table className="table">
              <thead><tr><th>Mã</th><th>Tên KPI</th><th>Vị trí</th><th>ĐVT</th><th>Liên kết KPI Đơn vị</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {(catalogPosFilter ? indCatalog.filter(i => i.positionCode === catalogPosFilter) : indCatalog).map(i => (
                  <tr key={i.id}>
                    <td><span className="badge badge-info">{i.code}</span></td>
                    <td className="font-medium">{i.name}</td>
                    <td>{i.positionCode}</td>
                    <td>{measurementUnits.find(m => m.id === i.unitId)?.name || i.unitId}</td>
                    <td>{i.linkedCatalogId ? <span className="badge badge-info">{i.linkedCatalogId}</span> : <span className="text-text-light text-xs">—</span>}</td>
                    <td><span className={`badge ${i.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{i.status}</span></td>
                    <td><Actions id={i.id} onEdit={() => { setEditId(i.id); setShowModal(true); }} onDelete={() => handleDelete(i.id)} /></td>
                  </tr>
                ))}
                {indCatalog.length === 0 && <tr><td colSpan={7} className="text-center text-text-light text-sm py-8">Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditId(null); }}
        title={`${editId ? 'Sửa' : 'Thêm'} ${tab === 'school-catalog' ? 'Chỉ tiêu Trường' : tab === 'unit-catalog' ? 'Chỉ tiêu đơn vị' : tab === 'individual-catalog' ? 'Chỉ tiêu cá nhân' : 'Nhóm tiêu chí'}`} maxWidth="max-w-3xl">
        {tab === 'school-catalog' && <SchoolCatalogForm item={schoolCatalog.find(s => s.id === editId) || null} groups={groupCatalog} units={measurementUnits} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditId(null); }} />}
        {tab === 'unit-catalog' && <UnitCatalogForm item={unitCatalog.find(u => u.id === editId) || null} units={measurementUnits} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditId(null); }} />}
        {tab === 'individual-catalog' && <IndividualCatalogForm item={indCatalog.find(i => i.id === editId) || null} positionCodes={[...new Set(indCatalog.map(i => i.positionCode))]} units={measurementUnits} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditId(null); }} />}
        {tab === 'group-catalog' && <GroupCatalogForm item={groupCatalog.find(g => g.id === editId) || null} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditId(null); }} />}
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
