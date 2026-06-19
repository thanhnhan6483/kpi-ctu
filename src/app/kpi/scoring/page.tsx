'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, Clock, Search, Award, TrendingUp, Download, Users, Building, BarChart2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet } from '@/lib/api';
import scoresData from '@/data/scores.json';
import planItemsData from '@/data/plan-items.json';
import plansData from '@/data/plans.json';
import individualEvalsData from '@/data/individual-evaluations.json';
import unitsData from '@/data/units.json';
import usersData from '@/data/users.json';
import gradingLevelsData from '@/data/grading-levels.json';
import exemptionCoefficients from '@/data/exemption-coefficients.json';

interface UnitScore {
  unitId: string;
  unitName: string;
  type: string;
  kpiCount: number;
  avgScore: number;
  grade: string;
  gradeColor: string;
  individualCount: number;
  achievedCount: number;
  completionRate: number;
}

interface IndividualScore {
  personId: string;
  personName: string;
  unitId: string;
  unitName: string;
  positionCode: string;
  selfScore: number | null;
  managerScore: number | null;
  councilScore: number | null;
  finalScore: number | null;
  grade: string;
  exemption: string;
  adjustedScore: number | null;
  status: string;
}

const unitMap: Record<string, string> = {};
(unitsData as { id: string; name: string; type: string }[]).forEach(u => { unitMap[u.id] = u.name; });

const gradeConfig: Record<string, { label: string; color: string; bg: string }> = {};
(gradingLevelsData as { name: string; color: string }[]).forEach(g => { gradeConfig[g.name] = { label: g.name, color: g.color, bg: `${g.color}20` }; });
if (!gradeConfig['Xuất sắc']) { gradeConfig['Xuất sắc'] = { label: 'Xuất sắc', color: '#4caf50', bg: '#e8f5e9' }; }
if (!gradeConfig['Tốt']) { gradeConfig['Tốt'] = { label: 'Tốt', color: '#2196f3', bg: '#e3f2fd' }; }
if (!gradeConfig['Đạt']) { gradeConfig['Đạt'] = { label: 'Đạt', color: '#ff9800', bg: '#fff3e0' }; }
if (!gradeConfig['Cần cải thiện']) { gradeConfig['Cần cải thiện'] = { label: 'Cần cải thiện', color: '#ffc107', bg: '#fffde7' }; }
if (!gradeConfig['Không đạt']) { gradeConfig['Không đạt'] = { label: 'Không đạt', color: '#f44336', bg: '#ffebee' }; }

function getGrade(score: number): string {
  if (score >= 90) return 'Xuất sắc';
  if (score >= 80) return 'Tốt';
  if (score >= 65) return 'Đạt';
  if (score >= 50) return 'Cần cải thiện';
  return 'Không đạt';
}

export default function ScoringPage() {
  const [unitScores, setUnitScores] = useState<UnitScore[]>([]);
  const [individualScores, setIndividualScores] = useState<IndividualScore[]>([]);
  const [activeTab, setActiveTab] = useState<'unit' | 'individual'>('unit');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const scores = scoresData as any[];
      const planItems = planItemsData as any[];
      const plans = plansData as any[];
      const evals = individualEvalsData as any[];

      const planScoreMap: Record<string, number[]> = {};
      scores.forEach((s: any) => {
        if (s.finalScore) {
          const pi = planItems.find((p: any) => p.id === s.planItemId);
          if (pi) {
            if (!planScoreMap[pi.planId]) planScoreMap[pi.planId] = [];
            planScoreMap[pi.planId].push(s.finalScore);
          }
        }
      });

      const unitScoresMap: Record<string, { scores: number[]; kpiCount: number }> = {};
      plans.forEach((p: any) => {
        if (p.ownerType === 'unit') {
          const planScores = planScoreMap[p.id] || [];
          const items = planItems.filter((pi: any) => pi.planId === p.id);
          if (!unitScoresMap[p.ownerId]) unitScoresMap[p.ownerId] = { scores: [], kpiCount: 0 };
          unitScoresMap[p.ownerId].scores.push(...planScores);
          unitScoresMap[p.ownerId].kpiCount += items.length;
        }
      });

      const unitResults: UnitScore[] = Object.entries(unitScoresMap).map(([unitId, data]) => {
        const avg = data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0;
        const grade = getGrade(avg);
        return {
          unitId, unitName: unitMap[unitId] || unitId, type: 'unit',
          kpiCount: data.kpiCount, avgScore: avg, grade,
          gradeColor: gradeConfig[grade]?.color || '#666',
          individualCount: 0, achievedCount: data.scores.filter(s => s >= 80).length,
          completionRate: data.kpiCount > 0 ? Math.round((data.scores.filter(s => s >= 80).length / data.kpiCount) * 100) : 0,
        };
      }).sort((a, b) => b.avgScore - a.avgScore);

      const indResults: IndividualScore[] = evals.map((e: any) => {
        const finalScore = e.finalScore || (e.selfScore && e.managerScore ? Math.round((e.selfScore + e.managerScore + (e.councilScore || 0)) / (e.councilScore ? 3 : 2)) : null);
        const grade = finalScore ? getGrade(finalScore) : 'Chưa đánh giá';
        const exemption = (exemptionCoefficients as any[]).find((c: any) => c.applicablePositions?.includes(e.positionCode));
        const adjustedScore = finalScore && exemption ? Math.round(finalScore * exemption.coefficient) : finalScore;
        return {
          personId: e.personId || e.id, personName: e.personName || '',
          unitId: e.unitId || '', unitName: e.unitName || '',
          positionCode: e.positionCode || '',
          selfScore: e.selfScore, managerScore: e.managerScore,
          councilScore: e.councilScore, finalScore,
          grade, exemption: exemption?.name || 'Không áp dụng',
          adjustedScore, status: e.status || 'pending',
        };
      });

      setUnitScores(unitResults);
      setIndividualScores(indResults);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredUnits = unitScores.filter(u => { if (search) { const s = search.toLowerCase(); return u.unitName.toLowerCase().includes(s); } return true; });
  const filteredIndividuals = individualScores.filter(i => { if (search) { const s = search.toLowerCase(); return i.personName.toLowerCase().includes(s) || i.unitName.toLowerCase().includes(s); } return true; });

  const stats = {
    totalUnits: unitScores.length,
    avgSchoolScore: unitScores.length > 0 ? Math.round(unitScores.reduce((s, u) => s + u.avgScore, 0) / unitScores.length) : 0,
    totalIndividuals: individualScores.length,
    excellentCount: individualScores.filter(i => i.grade === 'Xuất sắc').length,
    notAchievedCount: individualScores.filter(i => i.grade === 'Không đạt').length,
  };

  const gradeDistribution = Object.keys(gradeConfig).map(grade => ({
    grade, count: individualScores.filter(i => i.grade === grade).length,
    color: gradeConfig[grade].color, bg: gradeConfig[grade].bg,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Tính điểm & Xếp loại tổng hợp</h1>
          <p className="text-text-light mt-1">Tổng hợp điểm, áp dụng hệ số miễn giảm, xếp loại theo ngưỡng (XV.3-XV.5)</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/reports/export?type=unit&format=csv" className="px-4 py-2 bg-accent-green text-white rounded-lg text-sm flex items-center gap-2 hover:opacity-90" download><Download size={14} /> Xuất CSV Đơn vị</a>
          <a href="/api/reports/export?type=individual&format=csv" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 hover:opacity-90" download><Download size={14} /> Xuất CSV Cá nhân</a>
          <a href="/api/reports/export?type=reward&format=csv" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center gap-2 hover:opacity-90" download><Download size={14} /> Xuất CSV Thi đua</a>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary-light rounded-lg"><Building size={20} className="text-primary" /></div><div><p className="text-text-light text-sm">Tổng đơn vị</p><p className="text-xl font-bold">{stats.totalUnits}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-green/20 rounded-lg"><BarChart2 size={20} className="text-accent-green" /></div><div><p className="text-text-light text-sm">Điểm TB Trường</p><p className="text-xl font-bold">{stats.avgSchoolScore}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-50 rounded-lg"><Users size={20} className="text-blue-600" /></div><div><p className="text-text-light text-sm">Tổng cá nhân</p><p className="text-xl font-bold">{stats.totalIndividuals}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-green/20 rounded-lg"><Award size={20} className="text-accent-green" /></div><div><p className="text-text-light text-sm">Xuất sắc</p><p className="text-xl font-bold">{stats.excellentCount}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-red/20 rounded-lg"><TrendingUp size={20} className="text-accent-red" /></div><div><p className="text-text-light text-sm">Không đạt</p><p className="text-xl font-bold">{stats.notAchievedCount}</p></div></div></div>
      </div>

      <div className="card p-4">
        <h3 className="font-heading font-bold text-sm mb-3">Phân bố xếp loại cá nhân</h3>
        <div className="flex gap-3 flex-wrap">
          {gradeDistribution.map(g => (
            <div key={g.grade} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: g.bg }}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
              <span className="text-sm font-medium">{g.grade}</span>
              <span className="text-sm font-bold" style={{ color: g.color }}>{g.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('unit')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'unit' ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>Theo đơn vị</button>
          <button onClick={() => setActiveTab('individual')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'individual' ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>Theo cá nhân</button>
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">{activeTab === 'unit' ? 'Điểm & Xếp loại theo đơn vị' : 'Điểm & Xếp loại theo cá nhân'}</h3></div>
        <div className="p-0">
          {activeTab === 'unit' ? (
            <div className="overflow-x-auto"><table className="table">
              <thead><tr><th>STT</th><th>Đơn vị</th><th>Số KPI</th><th>Điểm TB</th><th>Xếp loại</th><th>Tỷ lệ Đạt</th><th>Thao tác</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={7} className="text-center py-8">Đang tải...</td></tr> :
                filteredUnits.length === 0 ? <tr><td colSpan={7} className="text-center py-8">Không có dữ liệu</td></tr> :
                filteredUnits.map((u, idx) => (
                  <tr key={u.unitId}>
                    <td>{idx + 1}</td>
                    <td className="font-medium">{u.unitName}</td>
                    <td className="text-center">{u.kpiCount}</td>
                    <td className="font-bold" style={{ color: u.gradeColor }}>{u.avgScore}</td>
                    <td><span className="badge" style={{ backgroundColor: `${u.gradeColor}20`, color: u.gradeColor }}>{u.grade}</span></td>
                    <td>{u.completionRate}%</td>
                    <td><a href="/kpi/evaluation" className="text-primary text-xs hover:underline">Chi tiết</a></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          ) : (
            <div className="overflow-x-auto"><table className="table">
              <thead><tr><th>STT</th><th>Họ tên</th><th>Đơn vị</th><th>Vị trí</th><th>Tự ĐG</th><th>Cấp trên</th><th>Hội đồng</th><th>Điểm CK</th><th>Hệ số</th><th>Điểm-adjusted</th><th>Xếp loại</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={11} className="text-center py-8">Đang tải...</td></tr> :
                filteredIndividuals.length === 0 ? <tr><td colSpan={11} className="text-center py-8">Không có dữ liệu</td></tr> :
                filteredIndividuals.map((i, idx) => {
                  const gc = gradeConfig[i.grade] || gradeConfig['Không đạt'];
                  return (
                    <tr key={i.personId + idx}>
                      <td>{idx + 1}</td>
                      <td className="font-medium">{i.personName}</td>
                      <td className="text-sm">{i.unitName}</td>
                      <td className="text-xs">{i.positionCode}</td>
                      <td>{i.selfScore ?? '-'}</td>
                      <td>{i.managerScore ?? '-'}</td>
                      <td>{i.councilScore ?? '-'}</td>
                      <td className="font-bold">{i.finalScore ?? '-'}</td>
                      <td className="text-xs">{i.exemption}</td>
                      <td className="font-bold" style={{ color: gc.color }}>{i.adjustedScore ?? '-'}</td>
                      <td><span className="badge" style={{ backgroundColor: gc.bg, color: gc.color }}>{i.grade}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          )}
        </div>
      </div>
    </div>
  );
}
