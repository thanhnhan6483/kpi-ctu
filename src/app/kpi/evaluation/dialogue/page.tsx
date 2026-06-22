'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Eye, Clock, CheckCircle, Search, User, Star } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost } from '@/lib/api';
import individualEvalsData from '@/data/individual-evaluations.json';
import unitsData from '@/data/units.json';
import usersData from '@/data/users.json';

interface EvaluationRecord {
  id: string;
  personId: string;
  personName: string;
  unitId: string;
  unitName: string;
  selfScore: number | null;
  managerScore: number | null;
  councilScore: number | null;
  finalScore: number | null;
  grade: string | null;
  status: string;
  evaluatorId?: string;
  managerComment?: string;
  selfComment?: string;
  councilComment?: string;
}

interface DialogueMessage {
  id: string;
  evaluationId: string;
  senderId: string;
  senderName: string;
  content: string;
  rating?: number;
  createdAt: string;
}

const userMap: Record<string, string> = {};
(usersData as { id: string; fullName: string }[]).forEach(u => { userMap[u.id] = u.fullName; });

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: '#6b7280' },
  self_evaluated: { label: 'Tự đánh giá', color: '#2196f3' },
  manager_review: { label: 'Cấp trên đánh giá', color: '#ff9800' },
  council_review: { label: 'Hội đồng rà soát', color: '#9c27b0' },
  evaluated: { label: 'Đã đánh giá', color: '#4caf50' },
  locked: { label: 'Đã khóa', color: '#607d8b' },
};

export default function EvaluationDialoguePage() {
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [dialogueMap, setDialogueMap] = useState<Record<string, DialogueMessage[]>>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedEval, setSelectedEval] = useState<EvaluationRecord | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<DialogueMessage[]>([]);

  const load = useCallback(async () => {
    try {
      const data = individualEvalsData as EvaluationRecord[];
      setEvaluations(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = evaluations.filter(ev => {
    if (statusFilter === 'active') {
      if (ev.status !== 'pending' && ev.status !== 'manager_review') return false;
    } else if (statusFilter !== 'all') {
      if (ev.status !== statusFilter) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      return ev.personName.toLowerCase().includes(s) ||
        ev.unitName.toLowerCase().includes(s);
    }
    return true;
  });

  const handleSendFeedback = async () => {
    if (!selectedEval || !feedbackText.trim()) return;
    const msg: DialogueMessage = {
      id: `msg_${Date.now()}`,
      evaluationId: selectedEval.id,
      senderId: 'current-user',
      senderName: 'Người đánh giá',
      content: feedbackText,
      rating: feedbackRating || undefined,
      createdAt: new Date().toISOString(),
    };
    setDialogueMap(prev => ({
      ...prev,
      [selectedEval.id]: [...(prev[selectedEval.id] || []), msg],
    }));
    await apiPost('/api/evaluation-dialogue', msg);
    setShowFeedback(false);
    setFeedbackText('');
    setFeedbackRating(0);
    setSelectedEval(null);
  };

  const openHistory = (ev: EvaluationRecord) => {
    setSelectedEval(ev);
    setHistoryMessages(dialogueMap[ev.id] || []);
    setShowHistory(true);
  };

  const openFeedback = (ev: EvaluationRecord) => {
    setSelectedEval(ev);
    setFeedbackText('');
    setFeedbackRating(0);
    setShowFeedback(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-text-light">Đang tải...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark flex items-center gap-2">
            <MessageSquare size={24} /> Đối thoại đánh giá
          </h1>
          <p className="text-text-light mt-1">Gửi phản hồi và phản biện kết quả đánh giá (XXI.12)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light rounded-lg"><MessageSquare size={20} className="text-primary" /></div>
            <div><p className="text-text-light text-sm">Tổng đánh giá</p><p className="text-xl font-bold">{evaluations.length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-yellow/20 rounded-lg"><Clock size={20} className="text-accent-yellow" /></div>
            <div><p className="text-text-light text-sm">Chờ phản hồi</p><p className="text-xl font-bold">{evaluations.filter(ev => ev.status === 'pending' || ev.status === 'manager_review').length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div>
            <div><p className="text-text-light text-sm">Đã đánh giá</p><p className="text-xl font-bold">{evaluations.filter(ev => ev.status === 'evaluated').length}</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><User size={20} className="text-blue-600" /></div>
            <div><p className="text-text-light text-sm">Có hội thoại</p><p className="text-xl font-bold">{Object.keys(dialogueMap).length}</p></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input type="text" placeholder="Tìm kiếm người đánh giá, đơn vị..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'active', label: 'Chờ xử lý' },
            { value: 'all', label: 'Tất cả' },
            { value: 'self_evaluated', label: 'Tự đánh giá' },
            { value: 'manager_review', label: 'Cấp trên ĐG' },
            { value: 'evaluated', label: 'Đã đánh giá' },
          ].map(s => (
            <button key={s.value} onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === s.value ? 'bg-primary text-white' : 'bg-white border border-border text-text-dark hover:bg-bg-cream'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách đánh giá</h3></div>
        <div className="p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Người được ĐG</th>
                <th>Đơn vị</th>
                <th>Tự đánh giá</th>
                <th>Quản lý</th>
                <th>Hội đồng</th>
                <th>Tổng kết</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8">Không có dữ liệu</td></tr>
              ) : filtered.map((ev, idx) => (
                <tr key={ev.id}>
                  <td className="font-medium text-sm">{ev.personName}</td>
                  <td className="text-xs text-text-light">{ev.unitName}</td>
                  <td className="text-sm font-bold">{ev.selfScore ?? '-'}</td>
                  <td className="text-sm">{ev.managerScore ?? '-'}</td>
                  <td className="text-sm">{ev.councilScore ?? '-'}</td>
                  <td className="text-sm font-bold text-primary">{ev.finalScore ?? '-'}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: `${statusConfig[ev.status]?.color || '#6b7280'}20`, color: statusConfig[ev.status]?.color || '#6b7280' }}>
                      {statusConfig[ev.status]?.label || ev.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openFeedback(ev)} className="p-1 text-primary hover:bg-primary-light rounded" title="Phản hồi"><MessageSquare size={14} /></button>
                      <button onClick={() => openHistory(ev)} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="Lịch sử hội thoại"><Eye size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showFeedback} onClose={() => { setShowFeedback(false); setSelectedEval(null); }} title="Gửi phản hồi / Đối thoại">
        <div className="space-y-4">
          <div className="p-4 bg-bg-cream rounded-lg border border-border">
            <div className="font-medium text-sm">{selectedEval?.personName}</div>
            <div className="text-xs text-text-light mt-1">{selectedEval?.unitName} • Tự ĐG: {selectedEval?.selfScore ?? '-'} • QL: {selectedEval?.managerScore ?? '-'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nội dung phản hồi *</label>
            <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={4}
              placeholder="Nhập ý kiến, phản hồi về kết quả đánh giá..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Đánh giá mức độ đồng thuận (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} onClick={() => setFeedbackRating(r)}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${feedbackRating >= r ? 'bg-primary text-white' : 'bg-bg-cream text-text-dark border border-border'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          {dialogueMap[selectedEval?.id || '']?.length > 0 && (
            <div className="border border-border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
              <p className="text-xs font-medium text-text-light">Hội thoại trước:</p>
              {(dialogueMap[selectedEval?.id || ''] || []).map(msg => (
                <div key={msg.id} className="text-xs p-2 bg-bg-cream rounded">
                  <div className="font-medium">{msg.senderName}</div>
                  <div className="text-text-dark">{msg.content}</div>
                  {msg.rating && <div className="text-text-light">Đồng thuận: {msg.rating}/5</div>}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => { setShowFeedback(false); setSelectedEval(null); }} className="btn-secondary">Hủy</button>
            <button onClick={handleSendFeedback} disabled={!feedbackText.trim()} className="btn-primary flex items-center gap-2">
              <Send size={14} /> Gửi đối thoại
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showHistory} onClose={() => { setShowHistory(false); setSelectedEval(null); }} title="Lịch sử đối thoại">
        <div className="space-y-4">
          <div className="p-4 bg-bg-cream rounded-lg border border-border">
            <div className="font-medium text-sm">{selectedEval?.personName}</div>
            <div className="text-xs text-text-light mt-1">{selectedEval?.unitName}</div>
          </div>
          {historyMessages.length === 0 ? (
            <div className="text-center py-8 text-text-light">Chưa có hội thoại nào</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {historyMessages.map(msg => (
                <div key={msg.id} className="p-3 bg-bg-cream rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{msg.senderName}</span>
                    <span className="text-xs text-text-light">{new Date(msg.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                  {msg.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={12} className="text-accent-yellow" />
                      <span className="text-xs text-text-light">Đồng thuận: {msg.rating}/5</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-4 border-t">
            <button onClick={() => { setShowHistory(false); setSelectedEval(null); }} className="btn-primary">Đóng</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
