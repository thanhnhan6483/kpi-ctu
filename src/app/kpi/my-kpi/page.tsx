'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Save, Send, FileText, CheckCircle, AlertTriangle,
  Plus, User
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import individualKpisData from '@/data/individual-kpis.json';
import academicYears from '@/data/academic-years.json';
import type { IndividualPlan, IndividualPlanItem } from '@/types';

interface PositionKPI {
  id: string;
  name: string;
  target: number;
  unit: string;
  weight: number;
  unitKpiId?: string;
}

interface PositionTemplate {
  id: string;
  name: string;
  code: string;
  kpis: PositionKPI[];
  academicYearId: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Bản nháp', color: '#6b7280' },
  submitted: { label: 'Chờ duyệt', color: '#eab308' },
  approved: { label: 'Đã duyệt', color: '#22c55e' },
  in_progress: { label: 'Đang thực hiện', color: '#3b82f6' },
};

export default function MyKPIPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [selectedYearId, setSelectedYearId] = useState('ay002');
  const [cycles, setCycles] = useState<{ id: string; name: string; academicYearId: string; status: string }[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [myPlan, setMyPlan] = useState<IndividualPlan | null>(null);
  const [items, setItems] = useState<IndividualPlanItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState('');
  const [selectedCycleForCreate, setSelectedCycleForCreate] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);

  const availablePositions = (individualKpisData as PositionTemplate[]).filter(
    p => p.academicYearId === selectedYearId
  );

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  useEffect(() => {
    fetch(`/api/cycles?academicYearId=${selectedYearId}`)
      .then(r => r.json())
      .then(data => setCycles(data))
      .catch(() => {});
  }, [selectedYearId]);

  useEffect(() => {
    if (!session?.user?.id) return;
    apiGet<IndividualPlan[]>(
      `/api/individual-plans?userId=${session.user.id}&cycleId=${selectedCycleId || ''}`
    ).then(plans => {
      const sorted = plans.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const active = sorted[0];
      setMyPlan(active || null);
      setItems(active ? active.items : []);
    }).catch(() => {});
  }, [session, selectedCycleId]);

  const handleCreatePlan = async () => {
    if (!session?.user?.id || !selectedCycleForCreate || !selectedPositionId) return;
    setSaving(true);
    const template = (individualKpisData as PositionTemplate[]).find(
      p => p.id === selectedPositionId
    );
    if (!template) return;
    const templateItems: IndividualPlanItem[] = template.kpis.map(k => ({
      kpiId: k.id,
      kpiName: k.name,
      target: k.target,
      unit: k.unit,
      weight: k.weight,
      note: '',
    }));
    try {
      const plan = await apiPost<IndividualPlan>('/api/individual-plans', {
        userId: session.user.id,
        cycleId: selectedCycleForCreate,
        positionId: selectedPositionId,
        positionName: template.name,
        items: templateItems,
      });
      setMyPlan(plan);
      setItems(templateItems);
      setShowCreate(false);
      setSelectedCycleId(selectedCycleForCreate);
    } catch { /* empty */ } finally { setSaving(false); }
  };

  const handleSave = async () => {
    if (!myPlan) return;
    setSaving(true);
    try {
      const updated = await apiPut<IndividualPlan>(`/api/individual-plans/${myPlan.id}`, { items });
      setMyPlan(updated);
    } catch { /* empty */ } finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    if (!myPlan) return;
    setSaving(true);
    try {
      const updated = await apiPut<IndividualPlan>(`/api/individual-plans/${myPlan.id}`, {
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      });
      setMyPlan(updated);
      setShowSubmit(false);
    } catch { /* empty */ } finally { setSaving(false); }
  };

  const updateItem = (index: number, field: keyof IndividualPlanItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  if (authStatus === 'loading') {
    return <div className="flex items-center justify-center h-64"><p className="text-text-light">Đang tải...</p></div>;
  }

  const activeCycles = cycles.filter(c => c.status === 'active' || c.status === 'open');
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">KPI của tôi</h1>
          <p className="text-text-light mt-1">Đăng ký chỉ tiêu KPI cá nhân theo vị trí công việc</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap bg-white border border-border rounded-lg overflow-hidden">
            {academicYears.map(ay => (
              <button key={ay.id} onClick={() => setSelectedYearId(ay.id)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${selectedYearId === ay.id ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>
                {ay.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!myPlan ? (
        <div className="card p-8 text-center">
          <FileText size={48} className="mx-auto text-text-light mb-4" />
          <h3 className="text-lg font-heading font-semibold text-text-dark mb-2">Chưa có kế hoạch KPI</h3>
          <p className="text-text-light mb-6">Bạn chưa đăng ký chỉ tiêu KPI cho năm học này. Hãy tạo kế hoạch mới.</p>
          {activeCycles.length > 0 && (
            <button onClick={() => { setSelectedCycleForCreate(''); setSelectedPositionId(''); setShowCreate(true); }}
              className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> Tạo kế hoạch KPI
            </button>
          )}
          {activeCycles.length === 0 && (
            <p className="text-sm text-accent-red">Chưa có chu kỳ KPI nào đang mở cho năm học này.</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-light rounded-lg"><FileText size={20} className="text-primary" /></div>
                <div><p className="text-text-light text-sm">Trạng thái</p>
                  <span className="badge mt-1" style={{ backgroundColor: `${statusConfig[myPlan.status]?.color || '#6b7280'}20`, color: statusConfig[myPlan.status]?.color || '#6b7280' }}>
                    {statusConfig[myPlan.status]?.label || myPlan.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-light rounded-lg"><User size={20} className="text-primary" /></div>
                <div><p className="text-text-light text-sm">Vị trí</p><p className="text-sm font-semibold">{myPlan.positionName}</p></div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-bg-cream rounded-lg"><CheckCircle size={20} className="text-accent-yellow" /></div>
                <div><p className="text-text-light text-sm">Chỉ tiêu</p><p className="text-xl font-bold">{items.length}</p></div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${totalWeight === 100 ? 'bg-accent-green/20' : 'bg-accent-red/20'}`}>
                  <CheckCircle size={20} className={totalWeight === 100 ? 'text-accent-green' : 'text-accent-red'} />
                </div>
                <div><p className="text-text-light text-sm">Tổng trọng số</p>
                  <p className={`text-xl font-bold ${totalWeight === 100 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {totalWeight}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-white">Chi tiết chỉ tiêu KPI</h3>
              {myPlan.status === 'draft' && (
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1">
                    <Save size={14} /> {saving ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button onClick={() => setShowSubmit(true)}
                    className="bg-accent-yellow hover:bg-accent-yellow/80 text-text-dark px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1">
                    <Send size={14} /> Gửi duyệt
                  </button>
                </div>
              )}
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="w-12">STT</th>
                    <th>Chỉ tiêu</th>
                    <th className="w-24">Chỉ số</th>
                    <th className="w-20">ĐVT</th>
                    <th className="w-20">Trọng số</th>
                    <th className="w-48">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.kpiId}>
                      <td className="text-center text-sm text-text-light">{index + 1}</td>
                      <td className="text-sm font-medium">{item.kpiName}</td>
                      <td>
                        {myPlan.status === 'draft' ? (
                          <input type="number" value={item.target}
                            onChange={e => updateItem(index, 'target', Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-border rounded text-sm text-center" min={0} />
                        ) : (
                          <span className="text-sm font-semibold">{item.target}</span>
                        )}
                      </td>
                      <td className="text-sm text-text-light">{item.unit}</td>
                      <td>
                        {myPlan.status === 'draft' ? (
                          <input type="number" value={item.weight}
                            onChange={e => updateItem(index, 'weight', Number(e.target.value))}
                            className="w-16 px-2 py-1 border border-border rounded text-sm text-center" min={0} max={100} />
                        ) : (
                          <span className="text-sm">{item.weight}%</span>
                        )}
                      </td>
                      <td>
                        {myPlan.status === 'draft' ? (
                          <input type="text" value={item.note}
                            onChange={e => updateItem(index, 'note', e.target.value)}
                            className="w-full px-2 py-1 border border-border rounded text-sm" placeholder="Ghi chú..." />
                        ) : (
                          <span className="text-sm text-text-light">{item.note || '-'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo kế hoạch KPI cá nhân">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Vị trí công việc *</label>
            <select value={selectedPositionId} onChange={e => setSelectedPositionId(e.target.value)} required
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
              <option value="">-- Chọn vị trí --</option>
              {availablePositions.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Chu kỳ KPI *</label>
            <select value={selectedCycleForCreate} onChange={e => setSelectedCycleForCreate(e.target.value)} required
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
              <option value="">-- Chọn chu kỳ --</option>
              {activeCycles.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {selectedPositionId && (
            <div className="p-3 bg-bg-cream rounded-lg border border-border">
              <span className="text-sm text-text-light">Số chỉ tiêu KPI: </span>
              <span className="font-bold">
                {(individualKpisData as PositionTemplate[]).find(p => p.id === selectedPositionId)?.kpis.length || 0}
              </span>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Hủy</button>
            <button onClick={handleCreatePlan} disabled={saving || !selectedPositionId || !selectedCycleForCreate}
              className="btn-primary">{saving ? 'Đang tạo...' : 'Tạo kế hoạch'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showSubmit} onClose={() => setShowSubmit(false)} title="Gửi duyệt kế hoạch">
        <div className="space-y-4">
          <div className="p-4 bg-bg-cream rounded-lg border border-border">
            <div className="font-medium text-sm">Vị trí: {myPlan?.positionName}</div>
            <div className="text-xs text-text-light mt-1">Chu kỳ: {cycles.find(c => c.id === myPlan?.cycleId)?.name || '-'}</div>
            {totalWeight !== 100 && (
              <div className="flex items-center gap-2 mt-2 text-accent-red text-sm">
                <AlertTriangle size={14} /> Tổng trọng số {totalWeight}% (cần đúng 100%)
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => setShowSubmit(false)} className="btn-secondary">Hủy</button>
            <button onClick={handleSubmit} disabled={saving || totalWeight !== 100} className="btn-primary">
              {saving ? 'Đang gửi...' : 'Gửi duyệt'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
