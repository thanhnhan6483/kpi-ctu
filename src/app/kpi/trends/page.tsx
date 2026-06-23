'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity, Target, AlertTriangle } from 'lucide-react';
import { apiGet } from '@/lib/api';

interface TrendItem {
  indicator: string;
  unitName: string;
  values: number[];
  months: string[];
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  forecast: number;
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<TrendItem[]>('/api/trends');
      setTrends(data.length ? data : mockTrends);
    } catch { setTrends(mockTrends); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = {
    totalIndicators: trends.length,
    upTrend: trends.filter(t => t.trend === 'up').length,
    downTrend: trends.filter(t => t.trend === 'down').length,
    stable: trends.filter(t => t.trend === 'stable').length,
  };

  const maxVal = Math.max(...trends.flatMap(t => [...t.values, t.forecast]), 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Xu hướng & Dự báo</h1>
          <p className="text-text-light mt-1">Phân tích xu hướng thực hiện KPI và dự báo kết quả (XXI.17)</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-text-light">Đang tải...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary-light rounded-lg"><BarChart3 size={20} className="text-primary" /></div><div><p className="text-text-light text-sm">Tổng chỉ tiêu</p><p className="text-xl font-bold">{stats.totalIndicators}</p></div></div></div>
            <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-green/20 rounded-lg"><TrendingUp size={20} className="text-accent-green" /></div><div><p className="text-text-light text-sm">Xu hướng tăng</p><p className="text-xl font-bold">{stats.upTrend}</p></div></div></div>
            <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-red/20 rounded-lg"><TrendingDown size={20} className="text-accent-red" /></div><div><p className="text-text-light text-sm">Xu hướng giảm</p><p className="text-xl font-bold">{stats.downTrend}</p></div></div></div>
            <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary-light rounded-lg"><Activity size={20} className="text-primary" /></div><div><p className="text-text-light text-sm">Ổn định</p><p className="text-xl font-bold">{stats.stable}</p></div></div></div>
          </div>

          <div className="space-y-4">
            {trends.map((item, idx) => {
              const barColor = item.trend === 'up' ? '#4caf50' : item.trend === 'down' ? '#f44336' : '#2196f3';
              return (
                <div key={idx} className="card">
                  <div className="card-header">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white flex items-center gap-2">
                        <Target size={16} />
                        {item.indicator}
                      </h3>
                      <span className="text-xs text-white/80">{item.unitName}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {item.trend === 'up' ? <TrendingUp size={16} className="text-accent-green" /> : item.trend === 'down' ? <TrendingDown size={16} className="text-accent-red" /> : <Activity size={16} className="text-primary" />}
                        <span className="text-sm font-medium">{item.changePercent > 0 ? '+' : ''}{item.changePercent}% so với kỳ trước</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-text-light">Dự báo kỳ tới: <strong className="text-primary">{item.forecast}</strong></span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {item.months.map((month, mi) => {
                        const height = Math.max((item.values[mi] / maxVal) * 120, 4);
                        return (
                          <div key={mi} className="flex items-center gap-3">
                            <span className="text-xs text-text-light w-16 text-right">{month}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(item.values[mi] / maxVal) * 100}%`, backgroundColor: barColor, opacity: 0.7 }} />
                            </div>
                            <span className="text-xs font-mono w-10 text-right">{item.values[mi]}</span>
                          </div>
                        );
                      })}
                      <div className="flex items-center gap-3 pt-2 border-t border-dashed border-border">
                        <span className="text-xs font-medium text-primary w-16 text-right">Dự báo</span>
                        <div className="flex-1 bg-primary-light rounded-full h-5 relative overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(item.forecast / maxVal) * 100}%`, backgroundColor: '#0d47a1', opacity: 0.5, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)' }} />
                        </div>
                        <span className="text-xs font-mono font-bold text-primary w-10 text-right">{item.forecast}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const mockTrends: TrendItem[] = [
  {
    indicator: 'Tỷ lệ sinh viên tốt nghiệp đúng hạn',
    unitName: 'Phòng Đào tạo',
    values: [72, 75, 73, 78, 82, 85],
    months: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
    trend: 'up',
    changePercent: 8.5,
    forecast: 88,
  },
  {
    indicator: 'Số đề tài NCKH giảng viên',
    unitName: 'Phòng QLKH',
    values: [12, 15, 14, 18, 16, 20],
    months: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
    trend: 'up',
    changePercent: 11.2,
    forecast: 22,
  },
  {
    indicator: 'Tỷ lệ hài lòng của sinh viên',
    unitName: 'Khảo sát',
    values: [85, 83, 82, 80, 78, 75],
    months: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
    trend: 'down',
    changePercent: -5.3,
    forecast: 73,
  },
  {
    indicator: 'Công bố quốc tế (ISI/Scopus)',
    unitName: 'Phòng QLKH',
    values: [8, 7, 9, 8, 9, 10],
    months: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
    trend: 'stable',
    changePercent: 2.1,
    forecast: 10,
  },
];
