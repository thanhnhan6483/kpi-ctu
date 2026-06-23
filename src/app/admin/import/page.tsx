'use client';

import { useState, useRef } from 'react';
import { FileText, CheckCircle, AlertTriangle, Upload, Download, Search, Trash2, Eye } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiPost } from '@/lib/api';

interface ImportRow {
  row: number;
  data: Record<string, string>;
  status: 'pending' | 'valid' | 'error';
  errors: string[];
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

const sampleTemplates = [
  { name: 'Mẫu KPI Chỉ tiêu', headers: ['Mã KPI', 'Tên KPI', 'Lĩnh vực', 'Chỉ tiêu', 'Đơn vị', 'Trọng số', 'Đơn vị đo'] },
  { name: 'Mẫu Tiến độ', headers: ['Mã KPI', 'Giá trị thực tế', 'Ngày cập nhật', 'Ghi chú'] },
  { name: 'Mẫu Minh chứng', headers: ['Mã KPI', 'Loại minh chứng', 'Tên tệp/URL', 'Phân loại'] },
];

export default function ImportPage() {
  const [importType, setImportType] = useState('kpi');
  const [rawData, setRawData] = useState('');
  const [parsedRows, setParsedRows] = useState<ImportRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): ImportRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map((line, idx) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const data: Record<string, string> = {};
      headers.forEach((h, i) => { data[h] = values[i] || ''; });
      const errors: string[] = [];
      if (!data['Mã KPI'] && !data['Mã KPI']) errors.push('Thiếu mã KPI');
      return { row: idx + 2, data, status: errors.length > 0 ? 'error' : 'valid', errors };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawData(text);
      setParsedRows(parseCSV(text));
    };
    reader.readAsText(file);
  };

  const handlePaste = () => {
    if (!rawData) return;
    setParsedRows(parseCSV(rawData));
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const validRows = parsedRows.filter(r => r.status === 'valid');
      let successCount = 0;
      const errors: string[] = [];

      for (const row of validRows) {
        try {
          if (importType === 'kpi') {
            await apiPost('/api/indicators', {
              code: row.data['Mã KPI'] || row.data['Ma KPI'],
              name: row.data['Tên KPI'] || row.data['Ten KPI'],
              categoryId: row.data['Lĩnh vực'] || row.data['Linh vuc'] || 'grp_dao_tao',
              targetValue: Number(row.data['Chỉ tiêu'] || row.data['Chi tieu']) || 0,
              unit: row.data['Đơn vị'] || row.data['Don vi'] || '%',
              weight: Number(row.data['Trọng số'] || row.data['Trong so']) || 5,
              formula: '',
              direction: 'higher_better',
              requiredEvidence: true,
              maxScore: 100,
            });
            successCount++;
          } else if (importType === 'progress') {
            await apiPost('/api/progress', {
              planItemId: row.data['Mã KPI'] || row.data['Ma KPI'],
              actualValue: Number(row.data['Giá trị thực tế'] || row.data['Gia tri thuc te']) || 0,
              progressDate: row.data['Ngày cập nhật'] || row.data['Ngay cap nhat'] || new Date().toISOString(),
              note: row.data['Ghi chú'] || row.data['Ghi chu'] || '',
              updatedBy: 'import',
            });
            successCount++;
          } else if (importType === 'evidence') {
            await apiPost('/api/evidences', {
              planItemIds: [row.data['Mã KPI'] || row.data['Ma KPI']],
              evidenceType: row.data['Loại minh chứng'] || row.data['Loai minh chung'] || 'file',
              fileName: row.data['Tên tệp/URL'] || row.data['Ten tep/URL'] || '',
              submittedBy: 'import',
              classification: row.data['Phân loại'] || row.data['Phan loai'] || 'normal',
            });
            successCount++;
          }
        } catch (err) {
          errors.push(`Dòng ${row.row}: Lỗi import`);
        }
      }

      setResult({ total: validRows.length, success: successCount, failed: validRows.length - successCount, errors });
      setShowResult(true);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  const downloadTemplate = (template: typeof sampleTemplates[0]) => {
    const csv = template.headers.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${template.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedRows.filter(r => r.status === 'valid').length;
  const errorCount = parsedRows.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Import dữ liệu từ Excel/CSV</h1>
          <p className="text-text-light mt-1">Nhập hàng loạt KPI, tiến độ, minh chứng từ file CSV (XXI.7-XXI.8)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary-light rounded-lg"><Upload size={20} className="text-primary" /></div><div><p className="text-text-light text-sm">Loại import</p><p className="text-xl font-bold capitalize">{importType === 'kpi' ? 'KPI' : importType === 'progress' ? 'Tiến độ' : 'Minh chứng'}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-50 rounded-lg"><FileText size={20} className="text-blue-600" /></div><div><p className="text-text-light text-sm">Tổng dòng</p><p className="text-xl font-bold">{parsedRows.length}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-green/20 rounded-lg"><CheckCircle size={20} className="text-accent-green" /></div><div><p className="text-text-light text-sm">Hợp lệ</p><p className="text-xl font-bold">{validCount}</p></div></div></div>
        <div className="card p-4"><div className="flex items-center gap-3"><div className="p-2 bg-accent-red/20 rounded-lg"><AlertTriangle size={20} className="text-accent-red" /></div><div><p className="text-text-light text-sm">Lỗi</p><p className="text-xl font-bold">{errorCount}</p></div></div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="card-header"><h3 className="text-white">Tải lên dữ liệu</h3></div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[{ value: 'kpi', label: 'KPI Chỉ tiêu' }, { value: 'progress', label: 'Tiến độ' }, { value: 'evidence', label: 'Minh chứng' }].map(t => (
                <button key={t.value} onClick={() => setImportType(t.value)} className={`px-3 py-2 rounded-lg text-sm font-medium ${importType === t.value ? 'bg-primary text-white' : 'bg-bg-cream text-text-dark hover:bg-primary-light'}`}>{t.label}</button>
              ))}
            </div>
            <div><input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" /><button onClick={() => fileInputRef.current?.click()} className="w-full p-8 border-2 border-dashed border-border rounded-lg text-center hover:border-primary hover:bg-primary-light/10 transition-colors"><Upload size={32} className="mx-auto mb-2 text-text-light" /><p className="text-sm text-text-light">Nhấn để chọn file CSV hoặc kéo thả vào đây</p><p className="text-xs text-text-light mt-1">Hỗ trợ file .csv, .txt</p></button></div>
            <div><label className="block text-sm font-medium mb-1">Hoặc dán dữ liệu CSV:</label><textarea value={rawData} onChange={e => { setRawData(e.target.value); setParsedRows([]); }} className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-primary" rows={6} placeholder="Mã KPI,Tên KPI,Lĩnh vực,Chỉ tiêu,Đơn vị,Trọng số&#10;CTU-KPI-01,Tỷ lệ hài lòng,Đào tạo,85,%,15" /></div>
            <div className="flex gap-2"><button onClick={handlePaste} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Phân tích dữ liệu</button>{parsedRows.length > 0 && <button onClick={handleImport} disabled={loading || validCount === 0} className="px-4 py-2 bg-accent-green text-white rounded-lg text-sm disabled:opacity-50">{loading ? 'Đang import...' : `Import ${validCount} dòng`}</button>}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="text-white">Mẫu tải về</h3></div>
          <div className="p-4 space-y-3">
            {sampleTemplates.map((t, idx) => (
              <div key={idx} className="p-3 bg-bg-cream rounded-lg">
                <div className="font-medium text-sm mb-1">{t.name}</div>
                <div className="text-xs text-text-light mb-2">{t.headers.length} cột: {t.headers.join(', ')}</div>
                <button onClick={() => downloadTemplate(t)} className="text-primary text-xs hover:underline flex items-center gap-1"><Download size={12} /> Tải mẫu</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {parsedRows.length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="text-white">Dữ liệu đã phân tích ({parsedRows.length} dòng)</h3></div>
          <div className="p-0">
            <div className="overflow-x-auto max-h-[400px]">
              <table className="table">
                <thead><tr><th>Dòng</th>{Object.keys(parsedRows[0]?.data || {}).map(h => <th key={h}>{h}</th>)}<th>Trạng thái</th><th>Lỗi</th></tr></thead>
                <tbody>
                  {parsedRows.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className={row.status === 'error' ? 'bg-red-50' : ''}>
                      <td className="text-xs">{row.row}</td>
                      {Object.values(row.data).map((v, i) => <td key={i} className="text-xs">{v}</td>)}
                      <td><span className={`badge ${row.status === 'valid' ? 'badge-success' : 'badge-danger'}`}>{row.status === 'valid' ? 'Hợp lệ' : 'Lỗi'}</span></td>
                      <td className="text-xs text-accent-red">{row.errors.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedRows.length > 50 && <div className="p-3 text-xs text-text-light text-center">Hiển thị 50/{parsedRows.length} dòng đầu tiên</div>}
          </div>
        </div>
      )}

      <Modal isOpen={showResult} onClose={() => { setShowResult(false); setResult(null); }} title="Kết quả import">
        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-bg-cream rounded-lg"><div className="text-2xl font-bold">{result.total}</div><div className="text-xs text-text-light">Tổng dòng</div></div>
              <div className="p-3 bg-green-50 rounded-lg"><div className="text-2xl font-bold text-accent-green">{result.success}</div><div className="text-xs text-text-light">Thành công</div></div>
              <div className="p-3 bg-red-50 rounded-lg"><div className="text-2xl font-bold text-accent-red">{result.failed}</div><div className="text-xs text-text-light">Lỗi</div></div>
            </div>
            {result.errors.length > 0 && (<div><p className="text-sm font-medium mb-2">Chi tiết lỗi:</p><div className="space-y-1">{result.errors.map((e, i) => <div key={i} className="text-xs text-accent-red">• {e}</div>)}</div></div>)}
          </div>
        )}
      </Modal>
    </div>
  );
}
