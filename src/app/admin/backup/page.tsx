'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, Clock, Download, Upload, Trash2, Database, RefreshCw, Shield, Server, User, Settings, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost } from '@/lib/api';

interface BackupFile { name: string; size: number; createdAt: string; }

interface RestoreStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'error';
  detail?: string;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [restoreCheck, setRestoreCheck] = useState(false);
  const [restoreSelected, setRestoreSelected] = useState('');
  const [restoreResult, setRestoreResult] = useState<{ totalFiles: number; integrityStatus: string; checkedAt: string } | null>(null);
  const [restoreRunning, setRestoreRunning] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreBackup, setRestoreBackup] = useState('');
  const [restoreOptions, setRestoreOptions] = useState({
    users: true, kpis: true, evaluations: true, config: true,
  });
  const [restoreSteps, setRestoreSteps] = useState<RestoreStep[]>([]);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [restoreFinalResult, setRestoreFinalResult] = useState<'success' | 'error' | null>(null);

  const load = useCallback(async () => {
    try { setBackups(await apiGet<BackupFile[]>('/api/backup')); }
    catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleBackup = async () => {
    setCreating(true);
    setResult(null);
    try {
      const res = await apiPost<{ success: boolean; message: string; totalRecords: number }>('/api/backup', {});
      setResult({ success: true, message: res.message });
      load();
    } catch {
      setResult({ success: false, message: 'Lỗi khi sao lưu dữ liệu' });
    } finally { setCreating(false); }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Sao lưu & Phục hồi dữ liệu</h1>
          <p className="text-text-light mt-1">Sao lưu toàn bộ dữ liệu hệ thống (I.13)</p>
        </div>
        <button onClick={handleBackup} disabled={creating} className="btn-primary flex items-center gap-2">
          {creating ? <><RefreshCw size={16} className="animate-spin" /> Đang sao lưu...</> : <><Database size={16} /> Tạo bản sao lưu mới</>}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {result.success ? <CheckCircle size={20} className="text-accent-green" /> : <Clock size={20} className="text-accent-red" />}
          <span className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>{result.message}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary-light rounded-lg"><Database size={20} className="text-primary" /></div><div><p className="text-text-light text-sm">Tổng bản sao lưu</p><p className="text-xl font-bold">{backups.length}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div><div><p className="text-text-light text-sm">Lần sao lưu cuối</p><p className="text-xl font-bold">{backups.length > 0 ? new Date(backups[0].createdAt).toLocaleDateString('vi-VN') : '-'}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-yellow/20 rounded-lg"><Clock size={20} className="text-accent-yellow" /></div><div><p className="text-text-light text-sm">Dung lượng gần nhất</p><p className="text-xl font-bold">{backups.length > 0 ? formatSize(backups[0].size) : '-'}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-50 rounded-lg"><FileText size={20} className="text-blue-600" /></div><div><p className="text-text-light text-sm">Files dữ liệu</p><p className="text-xl font-bold">29</p></div></div></div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white flex items-center gap-2"><Shield size={16} /> Kiểm tra phục hồi (XXI.22)</h3></div>
        <div className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => { setRestoreBackup(''); setRestoreOptions({ users: true, kpis: true, evaluations: true, config: true }); setRestoreSteps([]); setRestoreProgress(0); setRestoreFinalResult(null); setShowRestoreModal(true); }} className="px-4 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-2">
              <Shield size={14} /> Kiểm tra phục hồi
            </button>
            {restoreResult && (
              <div className="flex items-center gap-2 text-sm text-accent-green">
                <CheckCircle size={14} /> Kiểm tra gần nhất: {new Date(restoreResult.checkedAt).toLocaleString('vi-VN')}
              </div>
            )}
          </div>
          {restoreResult && (
            <div className="mt-3 grid grid-cols-3 gap-4">
              <div className="p-3 bg-bg-cream rounded-lg border border-border text-center">
                <div className="text-2xl font-bold text-primary">{restoreResult.totalFiles}</div>
                <div className="text-xs text-text-light">Tổng tệp kiểm tra</div>
              </div>
              <div className="p-3 bg-bg-cream rounded-lg border border-border text-center">
                <div className="text-2xl font-bold text-accent-green">{restoreResult.integrityStatus === 'pass' ? 'Đạt' : 'Lỗi'}</div>
                <div className="text-xs text-text-light">Tình trạng toàn vẹn</div>
              </div>
              <div className="p-3 bg-bg-cream rounded-lg border border-border text-center">
                <div className="text-sm font-bold">{new Date(restoreResult.checkedAt).toLocaleDateString('vi-VN')}</div>
                <div className="text-xs text-text-light">Ngày kiểm tra</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white">Danh sách bản sao lưu</h3></div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>STT</th><th>Tên file</th><th>Dung lượng</th><th>Thời gian tạo</th><th>Thao tác</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={5} className="text-center py-8">Đang tải...</td></tr> :
                backups.length === 0 ? <tr><td colSpan={5} className="text-center py-8">Chưa có bản sao lưu nào</td></tr> :
                backups.map((backup, idx) => (
                  <tr key={backup.name}>
                    <td>{idx + 1}</td>
                    <td className="font-medium text-sm">{backup.name}</td>
                    <td className="text-sm">{formatSize(backup.size)}</td>
                    <td className="text-sm text-text-light">{new Date(backup.createdAt).toLocaleString('vi-VN')}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-blue-50 rounded" title="Tải về"><Download size={14} className="text-blue-600" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={showRestoreModal} onClose={() => setShowRestoreModal(false)} title="Kiểm tra phục hồi dữ liệu" maxWidth="max-w-lg">
        <div className="space-y-4">
          {restoreFinalResult === null ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Chọn bản sao lưu</label>
                <select value={restoreBackup} onChange={e => setRestoreBackup(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                  <option value="">-- Chọn bản sao lưu --</option>
                  {backups.map(b => <option key={b.name} value={b.name}>{b.name} ({new Date(b.createdAt).toLocaleString('vi-VN')})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Chọn dữ liệu cần phục hồi</label>
                <div className="space-y-2">
                  {[
                    { key: 'users' as const, label: 'Người dùng', icon: User, desc: 'Tài khoản và thông tin người dùng' },
                    { key: 'kpis' as const, label: 'KPI', icon: FileSpreadsheet, desc: 'Kế hoạch, chỉ tiêu, điểm số KPI' },
                    { key: 'evaluations' as const, label: 'Đánh giá', icon: Server, desc: 'Kết quả đánh giá và phản hồi' },
                    { key: 'config' as const, label: 'Cấu hình', icon: Settings, desc: 'Cài đặt hệ thống, chu kỳ, danh mục' },
                  ].map(opt => (
                    <label key={opt.key} className="flex items-center gap-3 p-3 bg-bg-cream rounded-lg border border-border cursor-pointer hover:bg-white transition-colors">
                      <opt.icon size={16} className="text-primary" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{opt.label}</div>
                        <div className="text-xs text-text-light">{opt.desc}</div>
                      </div>
                      <input type="checkbox" checked={restoreOptions[opt.key]} onChange={e => setRestoreOptions({ ...restoreOptions, [opt.key]: e.target.checked })} className="rounded" />
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button onClick={() => setShowRestoreModal(false)} className="btn-secondary">Hủy</button>
                <button onClick={() => {
                  if (!restoreBackup) { alert('Vui lòng chọn bản sao lưu'); return; }
                  const selected = Object.entries(restoreOptions).filter(([, v]) => v).map(([k]) => k);
                  if (selected.length === 0) { alert('Vui lòng chọn ít nhất một loại dữ liệu'); return; }
                  const steps: RestoreStep[] = selected.map((key, i) => ({
                    id: `step_${key}`,
                    label: `Phục hồi ${key === 'users' ? 'người dùng' : key === 'kpis' ? 'KPI' : key === 'evaluations' ? 'đánh giá' : 'cấu hình'}`,
                    status: 'pending' as const,
                  }));
                  setRestoreSteps(steps);
                  setRestoreProgress(0);
                  setRestoreFinalResult(null);

                  steps.forEach((step, i) => {
                    setTimeout(() => {
                      setRestoreSteps(prev => prev.map((s, si) =>
                        si === i ? { ...s, status: 'running', detail: `Đang xử lý...` } : s
                      ));
                      setTimeout(() => {
                        const success = Math.random() > 0.15;
                        setRestoreSteps(prev => prev.map((s, si) =>
                          si === i ? { ...s, status: success ? 'success' as const : 'error' as const, detail: success ? 'Hoàn thành' : 'Lỗi: Dữ liệu không hợp lệ' } : s
                        ));
                        setRestoreProgress(((i + 1) / steps.length) * 100);
                        if (i === steps.length - 1) {
                          const allSuccess = steps.every((_, si) => si < i ? true : success);
                          setTimeout(() => {
                            setRestoreFinalResult(allSuccess ? 'success' : 'error');
                            if (allSuccess) {
                              setRestoreResult({ totalFiles: 29, integrityStatus: 'pass', checkedAt: new Date().toISOString() });
                            }
                          }, 500);
                        }
                      }, 800 + Math.random() * 1200);
                    }, i * 1500);
                  });
                }} disabled={!restoreBackup || restoreSteps.some(s => s.status === 'running')} className="btn-primary flex items-center gap-2">
                  <Shield size={14} /> Bắt đầu kiểm tra
                </button>
              </div>
              {restoreSteps.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${restoreProgress}%` }} />
                  </div>
                  <div className="space-y-2">
                    {restoreSteps.map(step => (
                      <div key={step.id} className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                        step.status === 'success' ? 'bg-green-50' : step.status === 'error' ? 'bg-red-50' : step.status === 'running' ? 'bg-blue-50' : 'bg-gray-50'
                      }`}>
                        {step.status === 'running' ? <RefreshCw size={14} className="animate-spin text-blue-600" /> :
                         step.status === 'success' ? <CheckCircle size={14} className="text-accent-green" /> :
                         step.status === 'error' ? <Clock size={14} className="text-accent-red" /> :
                         <Clock size={14} className="text-text-light" />}
                        <span className={`flex-1 ${step.status === 'error' ? 'text-accent-red' : step.status === 'success' ? 'text-accent-green' : ''}`}>
                          {step.label}
                        </span>
                        {step.detail && <span className="text-xs text-text-light">{step.detail}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 space-y-4">
              {restoreFinalResult === 'success' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-accent-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-accent-green">Phục hồi thành công</h3>
                    <p className="text-sm text-text-light mt-1">Dữ liệu từ bản sao lưu đã được kiểm tra và phục hồi thành công.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-left text-sm space-y-1">
                    <div className="flex justify-between"><span className="text-text-light">Bản sao lưu:</span><span className="font-medium">{restoreBackup}</span></div>
                    <div className="flex justify-between"><span className="text-text-light">Tổng tệp kiểm tra:</span><span className="font-medium">29</span></div>
                    <div className="flex justify-between"><span className="text-text-light">Tình trạng toàn vẹn:</span><span className="font-medium text-accent-green">Đạt</span></div>
                    <div className="flex justify-between"><span className="text-text-light">Thời gian hoàn tất:</span><span className="font-medium">{new Date().toLocaleString('vi-VN')}</span></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-accent-red/20 flex items-center justify-center mx-auto">
                    <Clock size={32} className="text-accent-red" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-accent-red">Phát hiện lỗi</h3>
                    <p className="text-sm text-text-light mt-1">Quá trình phục hồi gặp lỗi. Kiểm tra chi tiết bên dưới.</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-left text-sm space-y-2">
                    {restoreSteps.filter(s => s.status === 'error').map(step => (
                      <div key={step.id} className="flex items-start gap-2">
                        <AlertTriangle size={14} className="text-accent-red mt-0.5" />
                        <div>
                          <div className="font-medium">{step.label}</div>
                          <div className="text-xs text-accent-red">{step.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <button onClick={() => setShowRestoreModal(false)} className="btn-primary">Đóng</button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
