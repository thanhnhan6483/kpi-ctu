'use client';

import { useState, useMemo } from 'react';
import { Save, User } from 'lucide-react';
import individualKpisData from '@/data/individual-kpis.json';
import progressData from '@/data/progress.json';

interface PositionConfig {
  title: string;
  description: string;
  positionNames: string[];
}

export default function PositionKPIPage({ config }: { config: PositionConfig }) {
  const [actualValues, setActualValues] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const positions = useMemo(() => {
    return (individualKpisData as any[]).filter(p =>
      config.positionNames.some(name => p.name.toLowerCase().includes(name))
    );
  }, [config.positionNames]);

  const progressMap = useMemo(() => {
    const map: Record<string, number> = {};
    (progressData as any[]).forEach(p => {
      if (p.indicatorId && !map[p.indicatorId]) {
        map[p.indicatorId] = p.actualValue;
      }
    });
    return map;
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
  };

  if (positions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">{config.title}</h1>
          <p className="text-text-light mt-1">{config.description}</p>
        </div>
        <div className="card p-8 text-center">
          <User size={48} className="mx-auto text-text-light mb-4" />
          <p className="text-text-light">Không có dữ liệu vị trí phù hợp</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">{config.title}</h1>
          <p className="text-text-light mt-1">{config.description}</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-1">
          <Save size={14} /> {saving ? 'Đang lưu...' : 'Lưu kết quả'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-text-light text-sm">Số vị trí</p>
          <p className="text-2xl font-bold">{positions.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-text-light text-sm">Tổng số KPI</p>
          <p className="text-2xl font-bold">{positions.reduce((s, p: any) => s + p.kpis.length, 0)}</p>
        </div>
      </div>

      {positions.map((pos: any) => {
        const totalTarget = pos.kpis.reduce((s: number, k: any) => s + k.target, 0);
        const actuals = pos.kpis.map((k: any) => actualValues[k.id] ?? progressMap[k.id]).filter((v: any) => v !== undefined);
        const totalActual = actuals.reduce((s: number, v: number) => s + v, 0);
        const overallPct = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
        return (
          <div key={pos.id} className="card">
            <div className="card-header">
              <h3 className="text-white">{pos.name}</h3>
            </div>
            <div className="p-3 bg-bg-cream border-b border-border flex items-center justify-between text-xs">
              <span className="text-text-light">{pos.weightStructure}</span>
              <span className={`font-semibold ${overallPct >= 100 ? 'text-accent-green' : overallPct >= 80 ? 'text-accent-yellow' : 'text-accent-red'}`}>
                {totalActual > 0 ? `${overallPct.toFixed(1)}%` : 'Chưa nhập'}
              </span>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã KPI</th>
                    <th>Tên chỉ tiêu</th>
                    <th>Chỉ tiêu</th>
                    <th>ĐVT</th>
                    <th>Trọng số</th>
                    <th>Kết quả</th>
                    <th>Hoàn thành</th>
                  </tr>
                </thead>
                <tbody>
                  {pos.kpis.map((k: any) => {
                    const actual = actualValues[k.id] ?? progressMap[k.id];
                    const pct = k.target > 0 ? ((actual ?? 0) / k.target) * 100 : 0;
                    return (
                      <tr key={k.id}>
                        <td><span className="badge badge-info">{k.id}</span></td>
                        <td className="font-medium">{k.name}</td>
                        <td>{k.target}</td>
                        <td>{k.unit}</td>
                        <td>{k.weight}%</td>
                        <td>
                          <input type="number" step="any"
                            value={actualValues[k.id] ?? actual ?? ''}
                            onChange={e => setActualValues(prev => ({ ...prev, [k.id]: Number(e.target.value) }))}
                            className="w-24 px-2 py-1 border border-border rounded text-sm text-center"
                            placeholder="Nhập..." />
                        </td>
                        <td>
                          <span className={`font-semibold ${pct >= 100 ? 'text-accent-green' : pct >= 80 ? 'text-accent-yellow' : 'text-accent-red'}`}>
                            {actual !== undefined ? `${pct.toFixed(1)}%` : '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
