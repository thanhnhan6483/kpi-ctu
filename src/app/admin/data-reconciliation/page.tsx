'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Search } from 'lucide-react';
import academicYears from '@/data/academic-years.json';
import cyclesData from '@/data/cycles.json';
import plansData from '@/data/plans.json';
import planItemsData from '@/data/plan-items.json';
import scoresData from '@/data/scores.json';
import indicatorsData from '@/data/indicators.json';
import unitsData from '@/data/units.json';

const unitMap: Record<string, string> = {};
(unitsData as { id: string; name: string }[]).forEach(u => { unitMap[u.id] = u.name; });

const indicatorMap: Record<string, { name: string; unit: string }> = {};
(indicatorsData as { id: string; name: string; unit: string }[]).forEach(i => { indicatorMap[i.id] = { name: i.name, unit: i.unit }; });

export default function DataReconciliationPage() {
  const [selectedYearId, setSelectedYearId] = useState('ay002');
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [selectedSource, setSelectedSource] = useState('kpi_plan');
  const [results, setResults] = useState<any[]>([]);
  const [ran, setRan] = useState(false);
  const [running, setRunning] = useState(false);

  const filteredCycles = (cyclesData as { id: string; academicYearId: string; name: string; status: string }[])
    .filter(c => c.academicYearId === selectedYearId);

  const allPlanItems = planItemsData as { id: string; planId: string; indicatorId: string; targetValue: number }[];
  const allScores = scoresData as any[];
  const allPlans = plansData as { id: string; cycleId: string; ownerId: string; status: string }[];

  const runReconciliation = () => {
    setRunning(true);
    setRan(false);
    setTimeout(() => {
      const cyclePlans = allPlans.filter(p => p.cycleId === selectedCycleId && p.status !== 'draft');
      const planIds = cyclePlans.map(p => p.id);
      const items = allPlanItems.filter(pi => planIds.includes(pi.planId));
      const reconciled = items.map(pi => {
        const score = allScores.find(s => s.planItemId === pi.id);
        const actualValue = score?.finalScore || 0;
        const diff = actualValue - (pi.targetValue || 0);
        const status = Math.abs(diff) <= 5 ? 'matched' : 'mismatched';
        const plan = allPlans.find(p => p.id === pi.planId);
        return {
          indicatorId: pi.indicatorId,
          indicatorName: indicatorMap[pi.indicatorId]?.name || pi.indicatorId,
          unit: indicatorMap[pi.indicatorId]?.unit || '%',
          targetValue: pi.targetValue || 0,
          actualValue,
          diff,
          status,
          unitName: plan ? unitMap[plan.ownerId] || plan.ownerId : '-',
        };
      });
      setResults(reconciled);
      setRan(true);
      setRunning(false);
    }, 800);
  };

  const matchedCount = results.filter(r => r.status === 'matched').length;
  const mismatchedCount = results.filter(r => r.status === 'mismatched').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Đối soát dữ liệu nguồn</h1>
          <p className="text-text-light mt-1">So sánh chỉ tiêu KPI giữa kế hoạch và thực tế (XXI.16)</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Tham số đối soát</h3></div>
        <div className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium mb-1">Năm học</label>
              <div className="flex bg-white border border-border rounded-lg overflow-hidden">
                {academicYears.map(ay => (
                  <button key={ay.id} onClick={() => { setSelectedYearId(ay.id); setSelectedCycleId(''); }}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${selectedYearId === ay.id ? 'bg-primary text-white' : 'text-text-dark hover:bg-bg-cream'}`}>
                    {ay.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Chu kỳ</label>
              <select value={selectedCycleId} onChange={e => setSelectedCycleId(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm">
                <option value="">-- Chọn chu kỳ --</option>
                {filteredCycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Nguồn dữ liệu</label>
              <select value={selectedSource} onChange={e => setSelectedSource(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm">
                <option value="kpi_plan">Kế hoạch KPI</option>
                <option value="evaluation">Đánh giá</option>
                <option value="progress">Tiến độ</option>
              </select>
            </div>
            <button onClick={runReconciliation} disabled={!selectedCycleId || running}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-2 disabled:opacity-50">
              {running ? <><RefreshCw size={14} className="animate-spin" /> Đang chạy...</> : <><RefreshCw size={14} /> Chạy đối soát</>}
            </button>
          </div>
        </div>
      </div>

      {ran && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary-light rounded-lg"><Search size={20} className="text-primary" /></div><div><p className="text-text-light text-sm">Tổng chỉ tiêu</p><p className="text-xl font-bold">{results.length}</p></div></div></div>
            <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div><div><p className="text-text-light text-sm">Khớp</p><p className="text-xl font-bold">{matchedCount}</p></div></div></div>
            <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-red/20 rounded-lg"><XCircle size={20} className="text-accent-red" /></div><div><p className="text-text-light text-sm">Lệch</p><p className="text-xl font-bold">{mismatchedCount}</p></div></div></div>
            <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-yellow/20 rounded-lg"><AlertTriangle size={20} className="text-accent-yellow" /></div><div><p className="text-text-light text-sm">Tỷ lệ khớp</p><p className="text-xl font-bold">{results.length > 0 ? Math.round((matchedCount / results.length) * 100) : 0}%</p></div></div></div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="text-white">Kết quả đối soát</h3></div>
            <div className="p-0">
              <div className="overflow-x-auto"><table className="table">
                <thead><tr><th>Đơn vị</th><th>Chỉ tiêu</th><th>Mục tiêu (KH)</th><th>Thực tế</th><th>Chênh lệch</th><th>Trạng thái</th></tr></thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td className="text-sm">{r.unitName}</td>
                      <td className="text-sm font-medium">{r.indicatorName}</td>
                      <td className="text-sm text-right">{r.targetValue} {r.unit}</td>
                      <td className="text-sm text-right">{r.actualValue} {r.unit}</td>
                      <td className={`text-sm text-right font-bold ${r.diff > 0 ? 'text-accent-green' : r.diff < 0 ? 'text-accent-red' : ''}`}>{r.diff > 0 ? '+' : ''}{r.diff.toFixed(1)}</td>
                      <td><span className={`badge ${r.status === 'matched' ? 'badge-success' : 'badge-danger'}`}>{r.status === 'matched' ? 'Khớp' : 'Lệch'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
