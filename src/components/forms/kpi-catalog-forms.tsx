'use client';

import { useState } from 'react';
import type { SchoolKPICatalog, KPIGroupCatalog, UnitKPICatalog, IndividualKPICatalog } from '@/types';

export function SchoolCatalogForm({ item, groups, units, onSubmit, onCancel }: { item: SchoolKPICatalog | null; groups: KPIGroupCatalog[]; units: { id: string; name: string }[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [categoryId, setCategoryId] = useState(item?.categoryId || groups[0]?.id || '');
  const [formula, setFormula] = useState(item?.formula || '');
  const [unitId, setUnitId] = useState(item?.unitId || 'mu001');
  const [direction, setDirection] = useState(item?.direction || 'higher_better');
  const [requiredEvidence, setRequiredEvidence] = useState(item?.requiredEvidence ?? true);
  const [maxScore, setMaxScore] = useState(item?.maxScore ?? 10);
  const handle = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ name, code, categoryId, formula, unitId, direction, requiredEvidence, maxScore: Number(maxScore) }); };
  return (
    <form onSubmit={handle} className="space-y-4">
      <div><label className="block text-sm font-medium mb-1">Tên chỉ tiêu *</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mã</label><input type="text" value={code} onChange={e => setCode(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
        <div><label className="block text-sm font-medium mb-1">Nhóm *</label><select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Công thức</label><input type="text" value={formula} onChange={e => setFormula(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium mb-1">Đơn vị đo *</label><select value={unitId} onChange={e => setUnitId(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">{units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
        <div><label className="block text-sm font-medium mb-1">Hướng</label><select value={direction} onChange={e => setDirection(e.target.value as 'higher_better' | 'lower_better')} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"><option value="higher_better">Cao hơn tốt hơn</option><option value="lower_better">Thấp hơn tốt hơn</option></select></div>
        <div><label className="block text-sm font-medium mb-1">Cần MC?</label><select value={requiredEvidence ? 'yes' : 'no'} onChange={e => setRequiredEvidence(e.target.value === 'yes')} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"><option value="yes">Có</option><option value="no">Không</option></select></div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div><label className="block text-sm font-medium mb-1">Điểm tối đa</label><input type="number" value={maxScore} onChange={e => setMaxScore(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onCancel} className="btn-secondary">Hủy</button><button type="submit" className="btn-primary">{item ? 'Cập nhật' : 'Thêm mới'}</button></div>
    </form>
  );
}

export function UnitCatalogForm({ item, units, onSubmit, onCancel }: { item: UnitKPICatalog | null; units: { id: string; name: string }[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [unitId, setUnitId] = useState(item?.unitId || 'mu001');
  const handle = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ name, code, unitId }); };
  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Tên KPI *</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
        <div><label className="block text-sm font-medium mb-1">Mã *</label><input type="text" value={code} onChange={e => setCode(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Đơn vị đo *</label><select value={unitId} onChange={e => setUnitId(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">{units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
      <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onCancel} className="btn-secondary">Hủy</button><button type="submit" className="btn-primary">{item ? 'Cập nhật' : 'Thêm mới'}</button></div>
    </form>
  );
}

export function IndividualCatalogForm({ item, positionCodes, units, onSubmit, onCancel }: { item: IndividualKPICatalog | null; positionCodes: string[]; units: { id: string; name: string }[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [positionCode, setPositionCode] = useState(item?.positionCode || positionCodes[0] || '');
  const [unitId, setUnitId] = useState(item?.unitId || 'mu001');
  const handle = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ name, code, positionCode, unitId }); };
  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Tên KPI *</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
        <div><label className="block text-sm font-medium mb-1">Mã *</label><input type="text" value={code} onChange={e => setCode(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Vị trí</label><select value={positionCode} onChange={e => setPositionCode(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">{positionCodes.map(pc => <option key={pc} value={pc}>{pc}</option>)}</select></div>
        <div><label className="block text-sm font-medium mb-1">Đơn vị đo *</label><select value={unitId} onChange={e => setUnitId(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">{units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onCancel} className="btn-secondary">Hủy</button><button type="submit" className="btn-primary">{item ? 'Cập nhật' : 'Thêm mới'}</button></div>
    </form>
  );
}

export function GroupCatalogForm({ item, onSubmit, onCancel }: { item: KPIGroupCatalog | null; onSubmit: (data: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [defaultWeight, setDefaultWeight] = useState(item?.defaultWeight ?? 10);
  const [targetLevel, setTargetLevel] = useState(item?.targetLevel || 'school');
  const handle = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ name, code, defaultWeight, targetLevel }); };
  return (
    <form onSubmit={handle} className="space-y-4">
      <div><label className="block text-sm font-medium mb-1">Tên nhóm *</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mã *</label><input type="text" value={code} onChange={e => setCode(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
        <div><label className="block text-sm font-medium mb-1">Trọng số mặc định *</label><input type="number" value={defaultWeight} onChange={e => setDefaultWeight(Number(e.target.value))} required className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" /></div>
        <div><label className="block text-sm font-medium mb-1">Cấp</label><select value={targetLevel} onChange={e => setTargetLevel(e.target.value as 'school' | 'unit' | 'individual')} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"><option value="school">Trường</option><option value="unit">Đơn vị</option><option value="individual">Cá nhân</option></select></div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={onCancel} className="btn-secondary">Hủy</button><button type="submit" className="btn-primary">{item ? 'Cập nhật' : 'Thêm mới'}</button></div>
    </form>
  );
}
