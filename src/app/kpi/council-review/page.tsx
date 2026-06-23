'use client';

import { useState, useEffect, useCallback } from 'react';
import { Award, CheckCircle, Lock, Eye, Search, AlertTriangle, Star, Clock, MessageSquare, Calendar, UserPlus, MapPin } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPut } from '@/lib/api';
import evaluationsData from '@/data/evaluations.json';
import individualEvalsData from '@/data/individual-evaluations.json';
import unitsData from '@/data/units.json';
import usersData from '@/data/users.json';

interface CouncilReview {
  id: string;
  level: 'unit' | 'individual';
  entityId: string;
  entityName: string;
  selfScore: number | null;
  managerScore: number | null;
  councilScore: number | null;
  finalScore: number | null;
  grade: string | null;
  status: string;
  councilComment: string;
  anomalyFlag: boolean;
  lockedAt?: string;
}

interface CouncilMember {
  id: string;
  userId: string;
  fullName: string;
  unitName: string;
  role: 'chairman' | 'vice_chairman' | 'secretary' | 'member';
  status: 'active' | 'inactive';
  note: string;
}

interface Meeting {
  id: string;
  name: string;
  time: string;
  location: string;
  content: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  inviteeIds: string[];
}

const unitMap: Record<string, string> = {};
(unitsData as { id: string; name: string }[]).forEach(u => { unitMap[u.id] = u.name; });

const userMap: Record<string, string> = {};
const userUnitMap: Record<string, string> = {};
(usersData as { id: string; fullName: string; unitId: string }[]).forEach(u => {
  userMap[u.id] = u.fullName;
  userUnitMap[u.id] = u.unitId;
});

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ rà soát', color: 'bg-gray-100 text-gray-600' },
  self_evaluated: { label: 'Tự đánh giá', color: 'bg-blue-100 text-blue-700' },
  manager_review: { label: 'Cấp trên đánh giá', color: 'bg-yellow-100 text-yellow-700' },
  council_review: { label: 'Hội đồng rà soát', color: 'bg-purple-100 text-purple-700' },
  evaluated: { label: 'Đã đánh giá', color: 'bg-green-100 text-green-700' },
  locked: { label: 'Đã khóa', color: 'bg-red-100 text-red-600' },
};

const roleConfig: Record<string, { label: string; color: string }> = {
  chairman: { label: 'Chủ tịch', color: 'bg-red-100 text-red-700' },
  vice_chairman: { label: 'Phó CT', color: 'bg-blue-100 text-blue-700' },
  secretary: { label: 'Thư ký', color: 'bg-purple-100 text-purple-700' },
  member: { label: 'Ủy viên', color: 'bg-gray-100 text-gray-600' },
};

const meetingStatusConfig: Record<string, { label: string; color: string }> = {
  upcoming: { label: 'Sắp diễn ra', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Đã diễn ra', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-600' },
};

const initialMembers: CouncilMember[] = [
  { id: 'cm1', userId: 'u001', fullName: 'Quản trị viên', unitName: 'Đại học Cần Thơ', role: 'chairman', status: 'active', note: '' },
  { id: 'cm2', userId: 'u002', fullName: 'Nguyễn Văn A', unitName: unitMap['u014'] || '', role: 'vice_chairman', status: 'active', note: '' },
  { id: 'cm3', userId: 'u003', fullName: 'Trần Thị B', unitName: unitMap['u015'] || '', role: 'secretary', status: 'active', note: '' },
  { id: 'cm4', userId: 'u004', fullName: 'Lê Văn C', unitName: unitMap['u018'] || '', role: 'member', status: 'active', note: '' },
];

const initialMeetings: Meeting[] = [
  { id: 'mt1', name: 'Họp đánh giá KPI Quý I/2026', time: '2026-03-30T08:00', location: 'Phòng họp A', content: 'Rà soát kết quả KPI Quý I/2026', status: 'upcoming', inviteeIds: ['cm1', 'cm2', 'cm3'] },
  { id: 'mt2', name: 'Họp đánh giá KPI Tháng 4/2026', time: '2026-04-20T08:00', location: 'Phòng họp B', content: 'Đánh giá KPI tháng 4 năm 2026', status: 'completed', inviteeIds: ['cm1', 'cm2', 'cm3', 'cm4'] },
  { id: 'mt3', name: 'Họp đánh giá KPI Tháng 5/2026', time: '2026-05-25T08:00', location: 'Phòng họp C', content: 'Đánh giá KPI tháng 5 năm 2026', status: 'cancelled', inviteeIds: ['cm1', 'cm3'] },
];

export default function CouncilReviewPage() {
  const [items, setItems] = useState<CouncilReview[]>([]);
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [selected, setSelected] = useState<CouncilReview | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'review' | 'council'>('review');

  const [members, setMembers] = useState<CouncilMember[]>(initialMembers);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({ userId: '', role: 'member' as CouncilMember['role'], note: '' });

  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ name: '', time: '', location: '', content: '', inviteeIds: [] as string[] });

  const load = useCallback(async () => {
    try {
      const unitEvals = (evaluationsData as any[]).filter(e => e.level !== 'individual');
      const indEvals = (individualEvalsData as any[]);

      const allItems: CouncilReview[] = [
        ...unitEvals.map(e => ({
          id: e.id, level: 'unit' as const, entityId: e.planId || e.id,
          entityName: unitMap[e.personId] || e.personName || e.id,
          selfScore: e.selfScore ?? null, managerScore: e.managerScore ?? null,
          councilScore: e.councilScore ?? null, finalScore: e.finalScore ?? null,
          grade: e.grade || null, status: e.status || 'pending',
          councilComment: e.councilComment || '',
          anomalyFlag: Math.abs((e.selfScore || 0) - (e.managerScore || 0)) > 20,
          lockedAt: e.lockedAt,
        })),
        ...indEvals.map(e => ({
          id: e.id, level: 'individual' as const, entityId: e.personId || e.id,
          entityName: e.personName || userMap[e.personId] || e.id,
          selfScore: e.selfScore ?? null, managerScore: e.managerScore ?? null,
          councilScore: e.councilScore ?? null, finalScore: e.finalScore ?? null,
          grade: e.grade || null, status: e.status || 'pending',
          councilComment: e.councilComment || '',
          anomalyFlag: Math.abs((e.selfScore || 0) - (e.managerScore || 0)) > 20,
          lockedAt: e.lockedAt,
        })),
      ];
      setItems(allItems);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => {
    if (filterLevel && i.level !== filterLevel) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return i.entityName.toLowerCase().includes(s);
    }
    return true;
  });

  const handleCouncilScore = async (id: string, score: number, comment: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const finalScore = item.managerScore ? Math.round(((item.selfScore || 0) + item.managerScore + score) / 3) : score;
    const updated = items.map(i => i.id === id ? { ...i, councilScore: score, councilComment: comment, finalScore, status: 'evaluated' } : i);
    setItems(updated);
    setShowScore(false);
  };

  const handleLock = (id: string) => {
    const updated = items.map(i => i.id === id ? { ...i, status: 'locked', lockedAt: new Date().toISOString() } : i);
    setItems(updated);
    setShowLock(false);
  };

  const handleLockAll = () => {
    if (!confirm('Khóa TOÀN BỘ kết quả đã đánh giá? Hành động này không thể hoàn tác.')) return;
    const updated = items.map(i => i.status === 'evaluated' ? { ...i, status: 'locked', lockedAt: new Date().toISOString() } : i);
    setItems(updated);
  };

  const handleAddMember = () => {
    if (!newMember.userId) return;
    const user = (usersData as { id: string; fullName: string; unitId: string }[]).find(u => u.id === newMember.userId);
    if (!user) return;
    const member: CouncilMember = {
      id: `cm${Date.now()}`,
      userId: user.id,
      fullName: user.fullName,
      unitName: unitMap[user.unitId] || '',
      role: newMember.role,
      status: 'active',
      note: newMember.note,
    };
    setMembers(prev => [...prev, member]);
    setNewMember({ userId: '', role: 'member', note: '' });
    setShowMemberModal(false);
  };

  const handleAddMeeting = () => {
    if (!newMeeting.name || !newMeeting.time) return;
    const meeting: Meeting = {
      id: `mt${Date.now()}`,
      name: newMeeting.name,
      time: newMeeting.time,
      location: newMeeting.location,
      content: newMeeting.content,
      status: 'upcoming',
      inviteeIds: newMeeting.inviteeIds,
    };
    setMeetings(prev => [...prev, meeting]);
    setNewMeeting({ name: '', time: '', location: '', content: '', inviteeIds: [] });
    setShowMeetingModal(false);
  };

  const toggleInvitee = (memberId: string) => {
    setNewMeeting(prev => ({
      ...prev,
      inviteeIds: prev.inviteeIds.includes(memberId)
        ? prev.inviteeIds.filter(id => id !== memberId)
        : [...prev.inviteeIds, memberId],
    }));
  };

  const stats = {
    total: items.length,
    councilReview: items.filter(i => i.status === 'council_review' || i.status === 'manager_review').length,
    evaluated: items.filter(i => i.status === 'evaluated').length,
    locked: items.filter(i => i.status === 'locked').length,
    anomalies: items.filter(i => i.anomalyFlag).length,
  };

  const tabs = [
    { key: 'review' as const, label: 'Rà soát', icon: Search },
    { key: 'council' as const, label: 'Hội đồng & Lịch họp', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark flex items-center gap-2">
            <Award size={24} /> Hội đồng rà soát & Khóa kết quả
          </h1>
          <p className="text-text-light mt-1">Rà soát, chuẩn hóa điểm, xử lý khiếu nại và khóa kết quả (XIV.1-XIV.5)</p>
        </div>
        {activeTab === 'review' && (
          <button onClick={handleLockAll} className="btn-danger text-xs flex items-center gap-1">
            <Lock size={14} /> Khóa tất cả đã đánh giá
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-light hover:text-text-dark'
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'review' && (
        <>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Tổng', value: stats.total, color: 'text-text-dark' },
              { label: 'Chờ rà soát', value: stats.councilReview, color: 'text-purple-600' },
              { label: 'Đã đánh giá', value: stats.evaluated, color: 'text-green-600' },
              { label: 'Đã khóa', value: stats.locked, color: 'text-red-600' },
              { label: 'Bất thường', value: stats.anomalies, color: 'text-orange-600' },
            ].map(s => (
              <div key={s.label} className="card p-3 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-text-light">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="p-4 border-b flex gap-3 flex-wrap">
              <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="px-3 py-1.5 border rounded-lg text-xs">
                <option value="">Tất cả cấp</option>
                <option value="unit">Đơn vị</option>
                <option value="individual">Cá nhân</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-1.5 border rounded-lg text-xs">
                <option value="">Tất cả trạng thái</option>
                <option value="council_review">Chờ hội đồng</option>
                <option value="evaluated">Đã đánh giá</option>
                <option value="locked">Đã khóa</option>
              </select>
              <div className="relative ml-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" size={14} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..." className="pl-8 pr-3 py-1.5 border rounded-lg text-xs w-56" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr>
                  <th>STT</th><th>Cấp</th><th>Đối tượng</th><th>Tự ĐG</th><th>Cấp trên</th><th>Hội đồng</th><th>Tổng kết</th><th>Xếp loại</th><th>Trạng thái</th><th>Cờ bất thường</th><th>Thao tác</th>
                </tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={11} className="text-center py-8">Đang tải...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={11} className="text-center py-8">Không có dữ liệu</td></tr>
                  ) : filtered.map((item, idx) => (
                    <tr key={item.id} className={item.anomalyFlag ? 'bg-orange-50' : ''}>
                      <td>{idx + 1}</td>
                      <td><span className={`badge ${item.level === 'unit' ? 'badge-info' : 'badge-success'}`}>{item.level === 'unit' ? 'Đơn vị' : 'Cá nhân'}</span></td>
                      <td className="font-medium">{item.entityName}</td>
                      <td>{item.selfScore ?? '-'}</td>
                      <td>{item.managerScore ?? '-'}</td>
                      <td className="font-medium">{item.councilScore ?? '-'}</td>
                      <td className="font-bold">{item.finalScore ?? '-'}</td>
                      <td>{item.grade ? <span className="badge badge-success">{item.grade}</span> : '-'}</td>
                      <td><span className={`badge ${statusConfig[item.status]?.color || ''}`}>{statusConfig[item.status]?.label || item.status}</span></td>
                      <td>{item.anomalyFlag ? <AlertTriangle size={14} className="text-orange-500" /> : '-'}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => { setSelected(item); setShowDetail(true); }} className="p-1 hover:bg-blue-50 rounded"><Eye size={12} className="text-blue-600" /></button>
                          {item.status !== 'locked' && (
                            <button onClick={() => { setSelected(item); setShowScore(true); }} className="p-1 hover:bg-green-50 rounded"><Star size={12} className="text-green-600" /></button>
                          )}
                          {item.status === 'evaluated' && (
                            <button onClick={() => { setSelected(item); setShowLock(true); }} className="p-1 hover:bg-red-50 rounded"><Lock size={12} className="text-red-600" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'council' && (
        <div className="space-y-6">
          {/* Council Members */}
          <div className="card">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-text-dark flex items-center gap-2">
                <Award size={18} /> Thành viên Hội đồng KPI
              </h2>
              <button onClick={() => setShowMemberModal(true)} className="btn-primary text-xs flex items-center gap-1">
                <UserPlus size={14} /> Thêm thành viên
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ tên</th>
                    <th>Đơn vị</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, idx) => (
                    <tr key={m.id}>
                      <td>{idx + 1}</td>
                      <td className="font-medium">{m.fullName}</td>
                      <td>{m.unitName}</td>
                      <td>
                        <span className={`badge ${roleConfig[m.role]?.color || ''}`}>
                          {roleConfig[m.role]?.label || m.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {m.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Meeting Schedule */}
          <div className="card">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-text-dark flex items-center gap-2">
                <Calendar size={18} /> Lịch họp Hội đồng
              </h2>
              <button onClick={() => setShowMeetingModal(true)} className="btn-primary text-xs flex items-center gap-1">
                <Calendar size={14} /> Lên lịch họp
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên buổi họp</th>
                    <th>Thời gian</th>
                    <th>Địa điểm</th>
                    <th>Nội dung</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8">Chưa có lịch họp nào</td></tr>
                  ) : meetings.map((mt, idx) => (
                    <tr key={mt.id}>
                      <td>{idx + 1}</td>
                      <td className="font-medium">{mt.name}</td>
                      <td className="whitespace-nowrap">{new Date(mt.time).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td>{mt.location || '-'}</td>
                      <td className="max-w-xs truncate">{mt.content || '-'}</td>
                      <td>
                        <span className={`badge ${meetingStatusConfig[mt.status]?.color || ''}`}>
                          {meetingStatusConfig[mt.status]?.label || mt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelected(null); }} title="Chi tiết rà soát">
        {selected && (
          <div className="space-y-3 text-sm">
            <div><strong>Đối tượng:</strong> {selected.entityName} ({selected.level === 'unit' ? 'Đơn vị' : 'Cá nhân'})</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded"><div className="text-xs text-text-light">Tự ĐG</div><div className="text-xl font-bold text-blue-600">{selected.selfScore ?? '-'}</div></div>
              <div className="text-center p-3 bg-yellow-50 rounded"><div className="text-xs text-text-light">Cấp trên</div><div className="text-xl font-bold text-yellow-600">{selected.managerScore ?? '-'}</div></div>
              <div className="text-center p-3 bg-purple-50 rounded"><div className="text-xs text-text-light">Hội đồng</div><div className="text-xl font-bold text-purple-600">{selected.councilScore ?? '-'}</div></div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-xs text-text-light">Điểm tổng kết</div>
              <div className="text-3xl font-bold text-green-600">{selected.finalScore ?? '-'}</div>
              {selected.grade && <div className="text-sm mt-1">{selected.grade}</div>}
            </div>
            {selected.councilComment && <div><strong>Ý kiến hội đồng:</strong> {selected.councilComment}</div>}
            {selected.anomalyFlag && <div className="flex items-center gap-2 text-orange-600"><AlertTriangle size={14} /> <strong>Bất thường:</strong> Chênh lệch lớn giữa tự đánh giá và cấp trên</div>}
          </div>
        )}
      </Modal>

      {/* Score Modal */}
      <Modal isOpen={showScore} onClose={() => { setShowScore(false); setSelected(null); }} title="Chấm điểm hội đồng">
        {selected && <CouncilScoreForm item={selected} onSubmit={(score, comment) => handleCouncilScore(selected.id, score, comment)} />}
      </Modal>

      {/* Lock Modal */}
      <Modal isOpen={showLock} onClose={() => { setShowLock(false); setSelected(null); }} title="Khóa kết quả">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm">Khóa kết quả đánh giá cho <strong>{selected.entityName}</strong>? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLock(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
              <button onClick={() => handleLock(selected.id)} className="btn-danger text-xs">Khóa kết quả</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => { setShowMemberModal(false); setNewMember({ userId: '', role: 'member', note: '' }); }} title="Thêm thành viên hội đồng">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Người dùng *</label>
            <select
              value={newMember.userId}
              onChange={e => setNewMember(prev => ({ ...prev, userId: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Chọn người dùng...</option>
              {(usersData as { id: string; fullName: string }[]).map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vai trò *</label>
            <select
              value={newMember.role}
              onChange={e => setNewMember(prev => ({ ...prev, role: e.target.value as CouncilMember['role'] }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="chairman">Chủ tịch</option>
              <option value="vice_chairman">Phó Chủ tịch</option>
              <option value="secretary">Thư ký</option>
              <option value="member">Ủy viên</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              value={newMember.note}
              onChange={e => setNewMember(prev => ({ ...prev, note: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={3}
              placeholder="Ghi chú thêm về thành viên..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowMemberModal(false); setNewMember({ userId: '', role: 'member', note: '' }); }} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
            <button onClick={handleAddMember} className="btn-primary text-xs" disabled={!newMember.userId}>Thêm thành viên</button>
          </div>
        </div>
      </Modal>

      {/* Add Meeting Modal */}
      <Modal isOpen={showMeetingModal} onClose={() => { setShowMeetingModal(false); setNewMeeting({ name: '', time: '', location: '', content: '', inviteeIds: [] }); }} title="Lên lịch họp hội đồng">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên buổi họp *</label>
            <input
              value={newMeeting.name}
              onChange={e => setNewMeeting(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Nhập tên buổi họp..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Thời gian *</label>
            <input
              type="datetime-local"
              value={newMeeting.time}
              onChange={e => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Địa điểm</label>
            <input
              value={newMeeting.location}
              onChange={e => setNewMeeting(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Nhập địa điểm..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nội dung</label>
            <textarea
              value={newMeeting.content}
              onChange={e => setNewMeeting(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={3}
              placeholder="Nội dung buổi họp..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mời thành viên</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
              {members.map(m => (
                <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMeeting.inviteeIds.includes(m.id)}
                    onChange={() => toggleInvitee(m.id)}
                    className="rounded"
                  />
                  <span>{m.fullName}</span>
                  <span className={`badge ${roleConfig[m.role]?.color || ''} text-[10px]`}>{roleConfig[m.role]?.label || m.role}</span>
                </label>
              ))}
              {members.length === 0 && <p className="text-xs text-text-light">Chưa có thành viên nào</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowMeetingModal(false); setNewMeeting({ name: '', time: '', location: '', content: '', inviteeIds: [] }); }} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
            <button onClick={handleAddMeeting} className="btn-primary text-xs" disabled={!newMeeting.name || !newMeeting.time}>Tạo lịch họp</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CouncilScoreForm({ item, onSubmit }: { item: CouncilReview; onSubmit: (score: number, comment: string) => void }) {
  const [score, setScore] = useState(item.councilScore || item.managerScore || 0);
  const [comment, setComment] = useState(item.councilComment || '');
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(score, comment); }} className="space-y-4">
      <div className="bg-bg-cream rounded-lg p-3 text-sm space-y-1">
        <div>Tự đánh giá: <strong>{item.selfScore ?? '-'}</strong></div>
        <div>Cấp trên: <strong>{item.managerScore ?? '-'}</strong></div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Điểm hội đồng rà soát *</label>
        <input type="number" value={score} onChange={e => setScore(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm" min={0} max={100} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Ý kiến rà soát</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} />
      </div>
      <div className="text-sm text-text-light">
        Điểm tổng kết dự kiến: <strong>{item.managerScore ? Math.round(((item.selfScore || 0) + item.managerScore + score) / 3) : score}</strong>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => onSubmit(score, comment)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
        <button type="submit" className="btn-primary text-xs">Lưu điểm hội đồng</button>
      </div>
    </form>
  );
}
