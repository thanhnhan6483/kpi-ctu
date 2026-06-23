'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Edit, Plus, Trash2, Shield, Users, FileText, ClipboardList } from 'lucide-react';
import Modal from '@/components/ui/Modal';

const STORAGE_KEY = 'approval_workflows';

const defaultWorkflows = [
  { id: 'wf1', name: 'Duyệt kế hoạch KPI', objectType: 'plan', steps: [{ name: 'Trưởng đơn vị duyệt', role: 'unit_manager', order: 1 }, { name: 'Ban Giám hiệu duyệt', role: 'board', order: 2 }] },
  { id: 'wf2', name: 'Duyệt đánh giá cá nhân', objectType: 'evaluation', steps: [{ name: 'Cá nhân tự đánh giá', role: 'staff', order: 1 }, { name: 'Trưởng bộ môn duyệt', role: 'unit_manager', order: 2 }] },
  { id: 'wf3', name: 'Duyệt minh chứng', objectType: 'evidence', steps: [{ name: 'Cán bộ KPI kiểm tra', role: 'kpi_staff', order: 1 }, { name: 'Trưởng đơn vị xác nhận', role: 'unit_manager', order: 2 }] },
  { id: 'wf4', name: 'Xử lý khiếu nại', objectType: 'complaint', steps: [{ name: 'Tiếp nhận', role: 'kpi_staff', order: 1 }, { name: 'Xác minh', role: 'council', order: 2 }, { name: 'Ban Giám hiệu phê duyệt', role: 'board', order: 3 }] },
];

const objectTypeLabels: Record<string, string> = { plan: 'Kế hoạch KPI', evaluation: 'Đánh giá', evidence: 'Minh chứng', complaint: 'Khiếu nại' };
const objectTypeIcons: Record<string, any> = { plan: FileText, evaluation: ClipboardList, evidence: CheckCircle, complaint: Shield };

export default function ApprovalWorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editWf, setEditWf] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setWorkflows(stored ? JSON.parse(stored) : defaultWorkflows);
  }, []);

  const save = (data: any[]) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); setWorkflows(data); };

  const handleSave = (data: any) => {
    if (editWf) {
      save(workflows.map(w => w.id === editWf.id ? { ...w, ...data } : w));
    } else {
      save([...workflows, { ...data, id: `wf${Date.now()}` }]);
    }
    setShowModal(false); setEditWf(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Xóa quy trình này?')) return;
    save(workflows.filter(w => w.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Cấu hình quy trình phê duyệt động</h1>
          <p className="text-text-light mt-1">Định nghĩa luồng phê duyệt cho các đối tượng (XXI.4)</p>
        </div>
        <button onClick={() => { setEditWf(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Thêm quy trình
        </button>
      </div>

      <div className="grid gap-6">
        {workflows.map(wf => {
          const Icon = objectTypeIcons[wf.objectType] || FileText;
          return (
            <div key={wf.id} className="card">
              <div className="card-header flex items-center justify-between">
                <h3 className="text-white flex items-center gap-2"><Icon size={16} />{wf.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => { setEditWf(wf); setShowModal(true); }} className="p-1 hover:bg-white/10 rounded"><Edit size={14} className="text-white" /></button>
                  <button onClick={() => handleDelete(wf.id)} className="p-1 hover:bg-white/10 rounded"><Trash2 size={14} className="text-white" /></button>
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs text-text-light mb-3">Đối tượng: {objectTypeLabels[wf.objectType] || wf.objectType}</div>
                <div className="flex flex-wrap items-center gap-3">
                  {wf.steps.sort((a: any, b: any) => a.order - b.order).map((step: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-bg-cream rounded-lg border border-border">
                        <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">{step.order}</div>
                        <div>
                          <div className="text-sm font-medium">{step.name}</div>
                          <div className="text-xs text-text-light">{step.role}</div>
                        </div>
                      </div>
                      {i < wf.steps.length - 1 && <div className="text-text-light text-lg">→</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        {workflows.length === 0 && <div className="p-8 text-center text-text-light">Chưa có quy trình phê duyệt nào</div>}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditWf(null); }} title={editWf ? 'Chỉnh sửa quy trình' : 'Thêm quy trình phê duyệt'}>
        <WorkflowForm initial={editWf} onSubmit={handleSave} />
      </Modal>
    </div>
  );
}

function WorkflowForm({ initial, onSubmit }: { initial?: any; onSubmit: (d: any) => void }) {
  const [name, setName] = useState(initial?.name || '');
  const [objectType, setObjectType] = useState(initial?.objectType || 'plan');
  const [steps, setSteps] = useState(initial?.steps || [{ name: '', role: 'staff', order: 1 }]);

  const addStep = () => setSteps([...steps, { name: '', role: 'staff', order: steps.length + 1 }]);
  const removeStep = (idx: number) => setSteps(steps.filter((_: any, i: number) => i !== idx).map((s: any, i: number) => ({ ...s, order: i + 1 })));
  const updateStep = (idx: number, field: string, value: string) => {
    const newSteps = [...steps];
    newSteps[idx] = { ...newSteps[idx], [field]: value };
    setSteps(newSteps);
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ name, objectType, steps }); }} className="space-y-4">
      <div><label className="block text-sm font-medium mb-1">Tên quy trình *</label><input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      <div><label className="block text-sm font-medium mb-1">Đối tượng áp dụng *</label>
        <select value={objectType} onChange={e => setObjectType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
          {Object.entries(objectTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div><label className="block text-sm font-medium mb-1">Các bước phê duyệt</label>
        {steps.map((step: any, i: number) => (
          <div key={i} className="flex gap-2 mb-2">
            <span className="flex items-center text-xs text-text-light w-6">{step.order}.</span>
            <input value={step.name} onChange={e => updateStep(i, 'name', e.target.value)} placeholder="Tên bước" className="flex-1 px-3 py-2 border rounded-lg text-sm" required />
            <select value={step.role} onChange={e => updateStep(i, 'role', e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option value="staff">Nhân viên</option>
              <option value="kpi_staff">Cán bộ KPI</option>
              <option value="unit_manager">Trưởng đơn vị</option>
              <option value="council">Hội đồng KPI</option>
              <option value="board">Ban Giám hiệu</option>
              <option value="admin">Quản trị viên</option>
            </select>
            <button type="button" onClick={() => removeStep(i)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
          </div>
        ))}
        <button type="button" onClick={addStep} className="px-3 py-1 border border-border rounded-lg text-xs text-primary hover:bg-primary-light/10 flex items-center gap-1"><Plus size={12} /> Thêm bước</button>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
        <button type="submit" className="btn-primary text-xs">Lưu quy trình</button>
      </div>
    </form>
  );
}
