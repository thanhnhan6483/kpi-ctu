'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, CheckCircle, RefreshCw, AlertTriangle, BarChart2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import scoresData from '@/data/scores.json';
import individualEvalsData from '@/data/individual-evaluations.json';
import unitsData from '@/data/units.json';

interface ScoreRecord {
  id: string;
  planItemId: string;
  selfScore: number | null;
  managerScore: number | null;
  councilScore: number | null;
  finalScore: number | null;
}

interface PreviewRow {
  id: string;
  name: string;
  scoreType: string;
  originalScore: number;
  normalizedScore: number;
}

const unitMap: Record<string, string> = {};
(unitsData as { id: string; name: string }[]).forEach(u => { unitMap[u.id] = u.name; });

type NormalizationMethod = 'none' | 'zscore' | 'minmax';

export default function NormalizationPage() {
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [method, setMethod] = useState<NormalizationMethod>('none');
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const s = scoresData as ScoreRecord[];
      const e = individualEvalsData as any[];
      setScores(s);
      const initialPreview: PreviewRow[] = [
        ...s.filter(sc => sc.finalScore !== null).slice(0, 20).map(sc => ({
          id: sc.id,
          name: sc.planItemId,
          scoreType: 'KPI',
          originalScore: sc.finalScore ?? 0,
          normalizedScore: sc.finalScore ?? 0,
        })),
        ...e.filter((ev: any) => ev.selfScore !== null).slice(0, 10).map((ev: any) => ({
          id: ev.id,
          name: ev.personName || ev.id,
          scoreType: 'Tự ĐG',
          originalScore: ev.selfScore ?? 0,
          normalizedScore: ev.selfScore ?? 0,
        })),
      ];
      setPreview(initialPreview);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const calculateNormalization = (values: number[], method: NormalizationMethod): number[] => {
    if (method === 'none') return values;
    const n = values.length;
    if (n === 0) return values;

    const mean = values.reduce((s, v) => s + v, 0) / n;
    const min = Math.min(...values);
    const max = Math.max(...values);

    if (method === 'minmax') {
      if (max === min) return values.map(() => 50);
      return values.map(v => Math.round(((v - min) / (max - min)) * 100));
    }

    if (method === 'zscore') {
      const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
      const stdDev = Math.sqrt(variance);
      if (stdDev === 0) return values.map(() => 50);
      return values.map(v => {
        const z = (v - mean) / stdDev;
        const rescaled = Math.round((z + 3) / 6 * 100);
        return Math.max(0, Math.min(100, rescaled));
      });
    }

    return values;
  };

  const handleApply = () => {
    const originalValues = preview.map(p => p.originalScore);
    const normalized = calculateNormalization(originalValues, method);
    setPreview(prev => prev.map((p, i) => ({ ...p, normalizedScore: normalized[i] })));
    setShowPreview(true);
  };

  const handleConfirm = async () => {
    setApplied(true);
    setShowPreview(false);
  };

  const getMethodLabel = (m: NormalizationMethod) => {
    switch (m) {
      case 'zscore': return 'Z-score (chuẩn hóa phân phối chuẩn)';
      case 'minmax': return 'Min-Max (về thang 0-100)';
      default: return 'Không chuẩn hóa';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-light">Đang tải...</p></div>;
  }

  const uniqueOriginal = [...new Set(preview.map(p => p.originalScore))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark flex items-center gap-2">
            <BarChart2 size={24} /> Chuẩn hóa điểm KPI
          </h1>
          <p className="text-text-light mt-1">Chuẩn hóa điểm đánh giá theo phương pháp thống kê (XIV.2)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><BarChart2 size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng điểm</p><p className="text-xl font-bold">{preview.length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><BarChart2 size={20} className="text-blue-600" /></div>
            <div><p className="text-text-light text-sm">Giá trị gốc duy nhất</p><p className="text-xl font-bold">{uniqueOriginal.length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div>
            <div><p className="text-text-light text-sm">Phương pháp</p><p className="text-xl font-bold text-sm">{getMethodLabel(method)}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${applied ? 'bg-accent-green/20' : 'bg-accent-yellow/20'}`}>
              <CheckCircle size={20} className={applied ? 'text-accent-green' : 'text-accent-yellow'} />
            </div>
            <div><p className="text-text-light text-sm">Trạng thái</p><p className="text-xl font-bold text-sm">{applied ? 'Đã chuẩn hóa' : 'Chưa áp dụng'}</p></div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-heading font-bold text-base mb-4">Cấu hình chuẩn hóa</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Phương pháp chuẩn hóa</label>
            <select value={method} onChange={e => setMethod(e.target.value as NormalizationMethod)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary">
              <option value="none">Không chuẩn hóa</option>
              <option value="zscore">Z-score</option>
              <option value="minmax">Min-Max</option>
            </select>
            <p className="text-xs text-text-light mt-2">
              {method === 'zscore' ? 'Chuẩn hóa theo điểm Z, rescale về thang 0-100. Phù hợp dữ liệu phân phối chuẩn.' :
               method === 'minmax' ? 'Đưa điểm về thang 0-100 dựa trên giá trị min-max. Phù hợp dữ liệu phân bố đều.' :
               'Giữ nguyên điểm số gốc, không áp dụng chuẩn hóa.'}
            </p>
          </div>
          <div className="flex items-end">
            <div className="text-sm p-4 bg-bg-cream rounded-lg border border-border w-full">
              <div className="flex items-center gap-2 text-accent-yellow mb-2">
                <AlertTriangle size={16} /> Mô phỏng chuẩn hóa
              </div>
              <p className="text-text-light text-xs">
                Đây là bản dựng scaffold (scaffolding). Dữ liệu được lấy từ scores.json và individual-evaluations.json.
                Kết quả chuẩn hóa được tính toán mô phỏng dựa trên 30 bản ghi mẫu.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleApply} className="btn-primary flex items-center gap-2">
            <RefreshCw size={14} /> Áp dụng chuẩn hóa
          </button>
          {showPreview && (
            <button onClick={handleConfirm} className="px-4 py-2 bg-accent-green text-white rounded-lg text-sm flex items-center gap-2 hover:opacity-90">
              <CheckCircle size={14} /> Xác nhận lưu kết quả
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Bảng xem trước: Trước → Sau chuẩn hóa</h3></div>
        <div className="p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Đối tượng</th>
                <th>Loại</th>
                <th>Điểm gốc</th>
                <th>Phương pháp</th>
                <th>Điểm sau chuẩn hóa</th>
                <th>Chênh lệch</th>
              </tr>
            </thead>
            <tbody>
              {preview.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8">Không có dữ liệu</td></tr>
              ) : preview.map((row, idx) => {
                const diff = row.normalizedScore - row.originalScore;
                return (
                  <tr key={row.id}>
                    <td className="text-sm text-text-light">{idx + 1}</td>
                    <td className="text-sm font-medium">{row.name}</td>
                    <td><span className="badge badge-info text-xs">{row.scoreType}</span></td>
                    <td className="text-sm font-bold">{row.originalScore}</td>
                    <td className="text-xs text-text-light">{getMethodLabel(method)}</td>
                    <td className={`text-sm font-bold ${applied ? 'text-accent-green' : 'text-primary'}`}>
                      {row.normalizedScore}
                    </td>
                    <td className={`text-xs ${diff > 0 ? 'text-accent-green' : diff < 0 ? 'text-accent-red' : 'text-text-light'}`}>
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {applied && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle size={20} className="text-accent-green" />
          <span className="text-sm text-green-700">Đã chuẩn hóa điểm thành công. Kết quả đã được lưu (mô phỏng).</span>
        </div>
      )}
    </div>
  );
}
