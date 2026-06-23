import { KPIIndicator, KPIScore, KPIProgress, KPIEvidence, KPIPlanItem } from '@/types';

export function calcCompletionRate(actual: number, target: number, direction: 'higher_better' | 'lower_better'): number {
  if (direction === 'higher_better') {
    return (actual / target) * 100;
  }
  return (target / actual) * 100;
}

export function calcIndicatorScore(completionRate: number, maxScore: number, capRate: number = 120): number {
  return Math.min(completionRate, capRate) * maxScore / 100;
}

export function calcGroupScore(indicatorScores: { score: number; weight: number }[]): number {
  const totalWeight = indicatorScores.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;
  return indicatorScores.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight;
}

export function calcTotalScore(groupScores: { score: number; weight: number }[]): number {
  const totalWeight = groupScores.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;
  return groupScores.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight;
}

export function getGrade(totalScore: number): { level: string; label: string; color: string } {
  if (totalScore >= 90) {
    return { level: 'xuat_sac', label: 'Xuất sắc', color: '#4caf50' };
  }
  if (totalScore >= 80) {
    return { level: 'tot', label: 'Tốt', color: '#2196f3' };
  }
  if (totalScore >= 65) {
    return { level: 'dat', label: 'Đạt', color: '#ff9800' };
  }
  if (totalScore >= 50) {
    return { level: 'can_cai_thien', label: 'Cần cải thiện', color: '#ffc107' };
  }
  return { level: 'khong_dat', label: 'Không đạt', color: '#f44336' };
}

export function getCompletionStatus(completionRate: number): { label: string; color: string } {
  if (completionRate >= 120) {
    return { label: 'Xuất sắc', color: '#4caf50' };
  }
  if (completionRate >= 100) {
    return { label: 'Đạt', color: '#2196f3' };
  }
  if (completionRate >= 80) {
    return { label: 'Cần cải thiện', color: '#ffc107' };
  }
  return { label: 'Không đạt', color: '#f44336' };
}

export function calcEvidenceScore(evidences: KPIEvidence[]): number {
  if (!evidences || evidences.length === 0) return 0;
  const validCount = evidences.filter(e => e.status === 'valid').length;
  const totalRequired = evidences.filter(e => e.status !== 'invalid').length;
  if (totalRequired === 0) return 1;
  return validCount / totalRequired;
}

export function calcPlanItemScore(
  targetValue: number,
  direction: 'higher_better' | 'lower_better',
  maxScore: number,
  requiredEvidence: boolean,
  actualValue: number,
  evidences: KPIEvidence[] = []
): { score: number; completionRate: number; evidenceFactor: number } {
  const completionRate = calcCompletionRate(actualValue, targetValue, direction);
  const evidenceFactor = requiredEvidence ? calcEvidenceScore(evidences) : 1;
  const score = calcIndicatorScore(completionRate, maxScore) * evidenceFactor;
  return { score, completionRate, evidenceFactor };
}

export function calcPlanTotalScore(
  planItems: KPIPlanItem[],
  scores: KPIScore[]
): { totalScore: number; grade: string; itemScores: Array<{ planItemId: string; score: number; weight: number }> } {
  const totalWeight = planItems.reduce((sum, pi) => sum + pi.weight, 0);
  if (totalWeight === 0 || scores.length === 0) {
    return { totalScore: 0, grade: getGrade(0).level, itemScores: [] };
  }

  const itemScores = planItems
    .map(pi => {
      const score = scores.find(s => s.planItemId === pi.id);
      return {
        planItemId: pi.id,
        score: score?.finalScore ?? 0,
        weight: pi.weight,
      };
    });

  const weightedSum = itemScores.reduce((sum, item) => sum + item.score * item.weight, 0);
  const totalScore = weightedSum / totalWeight;
  const { level } = getGrade(totalScore);

  return { totalScore, grade: level, itemScores };
}

interface IndividualKPI {
  id: string;
  name: string;
  target: number;
  unit: string;
  weight: number;
}

interface IndividualProgress {
  indicatorId: string;
  actualValue: number;
  hasEvidence: boolean;
}

export function calcIndividualIndicatorScore(
  actual: number,
  target: number,
  hasEvidence: boolean
): { score: number; rate: number; evidenceFactor: number } {
  const rate = target > 0 ? (actual / target) * 100 : 0;
  const evidenceFactor = hasEvidence ? 1 : 0.5;
  const cappedRate = Math.min(rate, 120);
  const score = cappedRate * evidenceFactor;
  return { score, rate, evidenceFactor };
}

export function calcIndividualTotalScore(
  kpis: IndividualKPI[],
  progress: IndividualProgress[]
): { totalScore: number; kpiScores: Array<{ id: string; name: string; score: number; rate: number; weight: number; status: string }> } {
  const totalWeight = kpis.reduce((sum, k) => sum + k.weight, 0);
  if (totalWeight === 0) return { totalScore: 0, kpiScores: [] };

  let totalScore = 0;
  const kpiScores = kpis.map((kpi) => {
    const p = progress.find((pr) => pr.indicatorId === kpi.id);
    const actual = p ? p.actualValue : 0;
    const hasEvidence = p ? p.hasEvidence : false;
    const { score, rate, evidenceFactor } = calcIndividualIndicatorScore(actual, kpi.target, hasEvidence);
    const weightedScore = (score * kpi.weight) / totalWeight;
    totalScore += weightedScore;

    let status = 'Chưa đánh giá';
    if (rate >= 120) status = 'Xuất sắc';
    else if (rate >= 100) status = 'Đạt';
    else if (rate >= 80) status = 'Cần cải thiện';
    else if (rate > 0) status = 'Không đạt';

    return { id: kpi.id, name: kpi.name, score: Math.round(score * 10) / 10, rate: Math.round(rate * 10) / 10, weight: kpi.weight, status };
  });

  return { totalScore: Math.round(totalScore * 10) / 10, kpiScores };
}

export function applyExemptionCoefficient(score: number, coefficient: number): number {
  return Math.round(score * coefficient * 10) / 10;
}

export function calcRollUpScores(
  individualScores: { id: string; name: string; score: number; weight: number }[],
  departmentWeight: number = 100
): { totalScore: number; breakdown: Array<{ id: string; name: string; score: number; weight: number; contribution: number }> } {
  const totalWeight = individualScores.reduce((sum, i) => sum + i.weight, 0);
  if (totalWeight === 0) return { totalScore: 0, breakdown: [] };

  const breakdown = individualScores.map(item => ({
    ...item,
    contribution: Math.round((item.score * item.weight / totalWeight) * 10) / 10,
  }));

  const totalScore = Math.round(breakdown.reduce((sum, b) => sum + b.contribution, 0) * 10) / 10;
  return { totalScore, breakdown };
}

export function calcUnitRollUp(departmentScores: { unitId: string; unitName: string; score: number; weight: number }[]): { totalScore: number; breakdown: Array<{ unitId: string; unitName: string; score: number; weight: number; contribution: number }> } {
  const totalWeight = departmentScores.reduce((sum, d) => sum + d.weight, 0);
  if (totalWeight === 0) return { totalScore: 0, breakdown: [] };

  const breakdown = departmentScores.map(item => ({
    ...item,
    contribution: Math.round((item.score * item.weight / totalWeight) * 10) / 10,
  }));

  const totalScore = Math.round(breakdown.reduce((sum, b) => sum + b.contribution, 0) * 10) / 10;
  return { totalScore, breakdown };
}
