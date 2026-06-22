'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Info, Target, TrendingUp, Users, DollarSign, RefreshCw } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
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
  const [perspectives, setPerspectives] = useState<BSCPerspective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<BSCPerspective | null>(null);
  const [guideOpen, setGuideOpen] = useState(true);

  const objList = strategicObjectives as StrategicObjective[];
  const linkList = bscMapLinks as BSCMapLink[];
  const indList = indicatorsData as IndicatorSummary[];

  const load = useCallback(async () => {
    try {
      const data = await apiGet<BSCPerspective[]>('/api/bsc-perspectives');
      setPerspectives(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sortedPers = useMemo(
    () => [...perspectives].sort((a, b) => a.sortOrder - b.sortOrder),
    [perspectives]
  );

  const persToObjLinks = useMemo(
    () => linkList.filter(l => l.linkType === 'perspective_to_objective'),
    [linkList]
  );

  const objToIndLinks = useMemo(
    () => linkList.filter(l => l.linkType === 'objective_to_indicator'),
    [linkList]
  );

  const indicatorCodeToName = useMemo(() => {
    const map: Record<string, string> = {};
    indList.forEach(i => { map[i.code] = map[i.code] || i.name; });
    return map;
  }, [indList]);

  function getIndicatorNames(codes: string[]): string[] {
    return codes.map(c => indicatorCodeToName[c]).filter(Boolean);
  }

  const handleSave = async (data: Partial<BSCPerspective>) => {
    if (editItem) {
      await apiPut(`/api/bsc-perspectives/${editItem.id}`, data);
    } else {
      await apiPost('/api/bsc-perspectives', data);
    }
    setShowModal(false);
    setEditItem(null);
    load();
  };

  const handleDelete = async (item: BSCPerspective) => {
    const hasLinks = linkList.some(l => l.perspectiveId === item.id);
    const msg = hasLinks
      ? `Phối cảnh "${item.name}" đang có liên kết với mục tiêu chiến lược. Xoá sẽ mất các liên kết này. Tiếp tục?`
      : `Xoá phối cảnh "${item.name}"?`;
    if (!confirm(msg)) return;
    await apiDelete(`/api/bsc-perspectives/${item.id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Bối cảnh</h1>
          <p className="text-text-light mt-1">Quản lý phối cảnh (BSC Perspective) và liên kết với mục tiêu chiến lược (XXI.5)</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="btn-primary text-xs flex items-center gap-1"
          >
            <Plus size={14} /> Thêm phối cảnh
          </button>
        </div>
      </div>

      {/* Guide section */}
      <div className="card border border-blue-200 bg-blue-50/50">
        <button
          onClick={() => setGuideOpen(!guideOpen)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-blue-800">
            <Info size={16} /> Hướng dẫn: Phối cảnh (Perspective) là gì?
          </span>
          <span className="text-blue-600 text-xs">{guideOpen ? 'Thu gọn' : 'Mở rộng'}</span>
        </button>
        {guideOpen && (
          <div className="px-4 pb-4 space-y-3 text-sm text-blue-900/80">
            <p>
              <strong>BSC (Balanced Scorecard / Thẻ điểm cân bằng)</strong> là phương pháp quản lý chiến
              lược, giúp dịch tầm nhìn thành các mục tiêu đo lường được. Trong hệ thống này, nhà trường
              tự định nghĩa các <strong>phối cảnh (perspective)</strong> — khung phân loại mục tiêu chiến
              lược — theo nhu cầu quản lý riêng.
            </p>
            <p className="font-medium">Cấu trúc chuỗi liên kết:</p>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-mono">Phối cảnh</span>
              <span className="text-blue-400">&rarr;</span>
              <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-mono">Mục tiêu chiến lược</span>
              <span className="text-blue-400">&rarr;</span>
              <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 font-mono">Chỉ tiêu KPI</span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Phối cảnh</strong>: khung phân loại do nhà trường tự tạo (mặc định 4 góc nhìn BSC chuẩn). Có thể thêm/sửa/xóa ngay tại trang này.</li>
              <li><strong>Mục tiêu chiến lược</strong>: các mục tiêu cụ thể gắn với mỗi phối cảnh, quản lý tại trang <em>Mục tiêu chiến lược</em>.</li>
              <li><strong>Chỉ tiêu KPI</strong>: thước đo định lượng cho mỗi mục tiêu, quản lý tại trang <em>Bộ chỉ tiêu KPI</em>.</li>
            </ul>
          </div>
        )}
      </div>

      {/*
        ───────────────────────────────
        PERSPECTIVE CARDS + MATRIX
        Chỉ hiển thị khi data đã load
        ───────────────────────────────
      */}
      {!loading && (
        <>
          {/* Perspective cards */}
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
                      <div className="p-6 text-center text-text-light text-sm">Chưa có mục tiêu chiến lược</div>
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

          {/* BSC Matrix */}
          <div className="card">
            <div className="card-header"><h3 className="text-white flex items-center gap-2"><Target size={16} /> Ma trận BSC</h3></div>
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Mục tiêu chiến lược</th>
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
        </>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-10 text-text-light text-sm">Đang tải dữ liệu...</div>
      )}

      {/*───────────────────────────────
        PERSPECTIVE MANAGEMENT TABLE
        ───────────────────────────────*/}
      {!loading && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-white flex items-center gap-2"><Target size={16} /> Danh sách phối cảnh</h3>
          </div>
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên phối cảnh</th>
                    <th>Mã</th>
                    <th>Mô tả</th>
                    <th>Màu sắc</th>
                    <th>Thứ tự</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPers.map((item, i) => (
                    <tr key={item.id}>
                      <td className="text-xs text-text-light">{i + 1}</td>
                      <td className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.name}
                        </div>
                      </td>
                      <td className="font-mono text-xs text-text-light">{item.code}</td>
                      <td className="text-sm text-text-light max-w-[200px] truncate">{item.description}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 rounded border" style={{ backgroundColor: item.color }} />
                          <span className="text-xs font-mono text-text-light">{item.color}</span>
                        </div>
                      </td>
                      <td className="text-sm text-center">{item.sortOrder}</td>
                      <td>
                        <span className={`badge text-xs ${item.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                          {item.status === 'active' ? 'Đang dùng' : 'Tạm ẩn'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditItem(item); setShowModal(true); }}
                            className="p-1 hover:bg-blue-50 rounded"
                            title="Sửa"
                          >
                            <Edit size={14} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1 hover:bg-red-50 rounded"
                            title="Xoá"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sortedPers.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-6 text-text-light text-sm">Chưa có phối cảnh nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/*───────────────────────────────
        MODAL: Add / Edit Perspective
        ───────────────────────────────*/}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        title={editItem ? 'Sửa phối cảnh' : 'Thêm phối cảnh'}
      >
        <PerspectiveForm initial={editItem} onSubmit={handleSave} onCancel={() => { setShowModal(false); setEditItem(null); }} />
      </Modal>
    </div>
  );
}

function PerspectiveForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: BSCPerspective | null;
  onSubmit: (d: Partial<BSCPerspective>) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState({
    name: initial?.name || '',
    code: initial?.code || '',
    description: initial?.description || '',
    color: initial?.color || '#2196f3',
    sortOrder: initial?.sortOrder ?? 1,
    status: initial?.status || 'active',
  });

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên phối cảnh *</label>
          <input
            value={f.name}
            onChange={e => setF({ ...f, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            required
            placeholder="VD: Khách hàng & Xã hội"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mã *</label>
          <input
            value={f.code}
            onChange={e => setF({ ...f, code: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            required
            placeholder="VD: CS"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Mô tả</label>
        <textarea
          value={f.description}
          onChange={e => setF({ ...f, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg text-sm"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Màu sắc</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={f.color}
              onChange={e => setF({ ...f, color: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border"
            />
            <span className="text-xs font-mono text-text-light">{f.color}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Thứ tự</label>
          <input
            type="number"
            min={0}
            value={f.sortOrder}
            onChange={e => setF({ ...f, sortOrder: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <select
            value={f.status}
            onChange={e => setF({ ...f, status: e.target.value as 'active' | 'inactive' })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="active">Đang dùng</option>
            <option value="inactive">Tạm ẩn</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
        <button type="submit" className="btn-primary text-xs">
          {initial ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </div>
    </form>
  );
}
