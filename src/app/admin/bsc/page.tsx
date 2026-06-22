'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Target, TrendingUp, Users, DollarSign, RefreshCw, ExternalLink } from 'lucide-react';
import bscPerspectives from '@/data/bsc-perspectives.json';
import strategicObjectives from '@/data/strategic-objectives.json';
import bscMapLinks from '@/data/bsc-map-links.json';
import indicatorsData from '@/data/indicators.json';
import type { BSCPerspective, StrategicObjective, BSCMapLink } from '@/types';

const persIcons: Record<string, typeof Target> = {
  bsc001: Users,
  bsc002: DollarSign,
  bsc003: RefreshCw,
  bsc004: TrendingUp,
};

type IndicatorSummary = { id: string; name: string; code: string };

export default function BscPage() {
  const router = useRouter();

  const persList = bscPerspectives as BSCPerspective[];
  const objList = strategicObjectives as StrategicObjective[];
  const linkList = bscMapLinks as BSCMapLink[];
  const indList = indicatorsData as IndicatorSummary[];

  const indicatorCodeToName = useMemo(() => {
    const map: Record<string, string> = {};
    indList.forEach(i => { map[i.code] = map[i.code] || i.name; });
    return map;
  }, [indList]);

  const sortedPers = useMemo(() => [...persList].sort((a, b) => a.sortOrder - b.sortOrder), [persList]);

  const persToObjLinks = useMemo(
    () => linkList.filter(l => l.linkType === 'perspective_to_objective'),
    [linkList]
  );

  const objToIndLinks = useMemo(
    () => linkList.filter(l => l.linkType === 'objective_to_indicator'),
    [linkList]
  );

  function getIndicatorNames(codes: string[]): string[] {
    return codes.map(c => indicatorCodeToName[c]).filter(Boolean);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Bản đồ BSC</h1>
          <p className="text-text-light mt-1">Liên kết giữa phối cảnh BSC, mục tiêu chiến lược và chỉ tiêu KPI (XXI.5)</p>
        </div>
        <button
          onClick={() => router.push('/admin/strategic-objectives')}
          className="btn-primary text-xs flex items-center gap-1"
        >
          <Target size={14} /> Quản lý mục tiêu
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {sortedPers.map(pers => {
          const Icon = persIcons[pers.id] || Target;
          const linked = persToObjLinks.filter(l => l.perspectiveId === pers.id);
          const objectives = linked
            .map(l => objList.find(o => o.id === l.objectiveId))
            .filter((o): o is StrategicObjective => !!o);
          return (
            <div key={pers.id} className="card">
              <div
                className="card-header flex items-center justify-between"
                style={{ backgroundColor: pers.color }}
              >
                <h3 className="text-white flex items-center gap-2 text-sm font-semibold">
                  <Icon size={16} />{pers.name}
                </h3>
                <span className="text-xs text-white/80">{objectives.length} mục tiêu</span>
              </div>
              <div className="overflow-x-auto">
                {objectives.length === 0 ? (
                  <div className="p-6 text-center text-text-light text-sm">Chưa có mục tiêu chiến lược nào được liên kết</div>
                ) : (
                  <table className="table">
                    <thead><tr><th>STT</th><th>Mục tiêu chiến lược</th><th>Chỉ tiêu KPI</th></tr></thead>
                    <tbody>
                      {objectives.map((obj, i) => {
                        const indLinks = objToIndLinks.filter(l => l.objectiveId === obj.id);
                        const indNames = getIndicatorNames(indLinks.map(l => l.indicatorId!).filter(Boolean));
                        return (
                          <tr key={obj.id}>
                            <td className="text-xs text-text-light">{i + 1}</td>
                            <td className="text-sm font-medium">{obj.name}</td>
                            <td>
                              {indNames.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {indNames.map(n => (
                                    <span key={n} className="badge badge-primary text-xs">{n}</span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-text-light">Chưa liên kết</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white flex items-center gap-2"><Target size={16} /> Ma trận BSC</h3></div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Phối cảnh</th>
                  {sortedPers.map(p => (
                    <th key={p.id} className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {objList.map(obj => (
                  <tr key={obj.id}>
                    <td className="text-sm font-medium">{obj.name}</td>
                    {sortedPers.map(p => {
                      const hasLink = persToObjLinks.some(l => l.perspectiveId === p.id && l.objectiveId === obj.id);
                      return (
                        <td key={p.id} className="text-center">
                          {hasLink ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">&#10003;</span>
                          ) : (
                            <span className="text-text-light text-xs">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
