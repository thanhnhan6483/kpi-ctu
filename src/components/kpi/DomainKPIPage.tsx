'use client';

import { useState, useMemo } from 'react';
import { Save } from 'lucide-react';
import indicatorsData from '@/data/indicators.json';
import groupsData from '@/data/kpi-groups.json';

interface DomainConfig {
  title: string;
  description: string;
  keywords: string[];
}

export default function DomainKPIPage({ config }: { config: DomainConfig }) {
  const [actualValues, setActualValues] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const indicators = useMemo(() => {
    return indicatorsData.filter(ind => {
      if (!ind.academicYearId) return false;
      return config.keywords.some(k => ind.name.toLowerCase().includes(k));
    });
  }, [config.keywords]);

  const getGroupName = (categoryId: string) => {
    const g = groupsData.find(g => g.id === categoryId);
    return g?.name || categoryId;
  };

  const getStatus = (target: number, actual: number | undefined) => {
    if (actual === undefined) return { label: 'Chưa nhập', cls: 'badge-info' };
    const rate = target > 0 ? actual / target : 0;
    if (rate >= 1) return { label: 'Đạt', cls: 'badge-success' };
    if (rate >= 0.8) return { label: 'Đạt >80%', cls: 'badge-warning' };
    return { label: 'Chưa đạt', cls: 'badge-danger' };
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
  };

  const totalTarget = indicators.reduce((s, i) => s + i.targetValue, 0);
  const totalActual = Object.values(actualValues).reduce((s, v) => s + v, 0);
  const overallRate = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-text-light text-sm">Số chỉ tiêu</p>
          <p className="text-2xl font-bold">{indicators.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-text-light text-sm">Tổng chỉ tiêu</p>
          <p className="text-2xl font-bold">{totalTarget}</p>
        </div>
        <div className="card p-4">
          <p className="text-text-light text-sm">Tỉ lệ hoàn thành</p>
          <p className={`text-2xl font-bold ${overallRate >= 100 ? 'text-accent-green' : 'text-accent-yellow'}`}>
            {totalActual > 0 ? `${overallRate.toFixed(1)}%` : '-'}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-white">Danh sách chỉ tiêu</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên chỉ tiêu</th>
                <th>Lĩnh vực</th>
                <th>ĐVT</th>
                <th>Chỉ tiêu</th>
                <th>Kết quả</th>
                <th>Hoàn thành</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map(ind => {
                const actual = actualValues[ind.id];
                const pct = ind.targetValue > 0 ? ((actual ?? 0) / ind.targetValue) * 100 : 0;
                const status = getStatus(ind.targetValue, actual);
                return (
                  <tr key={ind.id}>
                    <td><span className="badge badge-info">{ind.code}</span></td>
                    <td className="font-medium">{ind.name}</td>
                    <td className="text-xs text-text-light max-w-[200px] truncate">{getGroupName(ind.categoryId)}</td>
                    <td>{ind.unit}</td>
                    <td>{ind.targetValue}</td>
                    <td>
                      <input type="number" step="any"
                        value={actualValues[ind.id] ?? ''}
                        onChange={e => setActualValues(prev => ({ ...prev, [ind.id]: Number(e.target.value) }))}
                        className="w-24 px-2 py-1 border border-border rounded text-sm text-center"
                        placeholder="Nhập..." />
                    </td>
                    <td>
                      <span className={`font-semibold ${pct >= 100 ? 'text-accent-green' : pct >= 80 ? 'text-accent-yellow' : 'text-accent-red'}`}>
                        {actual !== undefined ? `${pct.toFixed(1)}%` : '-'}
                      </span>
                    </td>
                    <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                  </tr>
                );
              })}
              {indicators.length === 0 && (
                <tr><td colSpan={8} className="text-center text-text-light text-sm py-8">Không có chỉ tiêu nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
