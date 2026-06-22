'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Link, Wifi, WifiOff, Key, Fingerprint, Shield, Globe, Eye, EyeOff } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface ApiConfig {
  id: string;
  code: string;
  name: string;
  endpoint: string;
  apiKey: string;
  status: string;
  lastTested: string;
  description: string;
}

export default function ApiConfigsPage() {
  const [activeTab, setActiveTab] = useState<'api' | 'sso'>('api');
  const [items, setItems] = useState<ApiConfig[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ApiConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<ApiConfig[]>('/api/api-configs');
      setItems(data);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: any) => {
    if (editItem) {
      await apiPut(`/api/api-configs/${editItem.id}`, data);
    } else {
      await apiPost('/api/api-configs', data);
    }
    setShowModal(false); setEditItem(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa kết nối này?')) return;
    await apiDelete(`/api/api-configs/${id}`);
    load();
  };

  const handleTest = async (item: ApiConfig) => {
    alert(`Đã gửi kiểm tra kết nối đến ${item.endpoint}\nKết quả mô phỏng: Kết nối thành công!`);
  };

  const tabs = [
    { key: 'api' as const, label: 'Kết nối API', icon: Link },
    { key: 'sso' as const, label: 'Xác thực (SSO)', icon: Fingerprint },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Kết nối tích hợp</h1>
          <p className="text-text-light mt-1">Quản lý kết nối API với hệ thống bên ngoài (XXI.23)</p>
        </div>
        {activeTab === 'api' && (
          <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-primary text-xs flex items-center gap-1">
            <Plus size={14} /> Thêm mới
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-light hover:text-text-dark'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'api' && (
        <>
          <div className="card">
            <div className="card-header"><h3 className="text-white">Danh sách kết nối</h3></div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-text-light">Đang tải...</div>
              ) : (
                <table className="table">
                  <thead><tr><th>STT</th><th>Mã</th><th>Tên kết nối</th><th>Endpoint</th><th>Trạng thái</th><th>Kiểm tra gần nhất</th><th>Thao tác</th></tr></thead>
                  <tbody>{items.length === 0 ? <tr><td colSpan={7} className="text-center py-8">Không có dữ liệu</td></tr> :
                    items.map((item, i) => (<tr key={item.id}>
                      <td>{i + 1}</td>
                      <td className="font-mono text-xs">{item.code}</td>
                      <td className="font-medium flex items-center gap-2"><Link size={14} className="text-primary" />{item.name}</td>
                      <td className="text-sm font-mono text-xs text-text-light">{item.endpoint}</td>
                      <td>{item.status === 'active' ? <span className="badge badge-success flex items-center gap-1 w-fit"><Wifi size={10} /> Hoạt động</span> : <span className="badge badge-danger flex items-center gap-1 w-fit"><WifiOff size={10} /> Ngừng</span>}</td>
                      <td className="text-sm text-text-light">{item.lastTested || 'Chưa kiểm tra'}</td>
                      <td><div className="flex gap-1">
                        <button onClick={() => handleTest(item)} className="p-1 hover:bg-green-50 rounded" title="Kiểm tra kết nối"><Wifi size={12} className="text-green-600" /></button>
                        <button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1 hover:bg-blue-50 rounded"><Edit size={12} className="text-blue-600" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-600" /></button>
                      </div></td>
                    </tr>))}</tbody>
                </table>
              )}
            </div>
          </div>

          <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Chỉnh sửa kết nối' : 'Thêm kết nối'}>
            <Form initial={editItem} onSubmit={handleSave} />
          </Modal>
        </>
      )}

      {activeTab === 'sso' && <SsoConfigPage />}
    </div>
  );
}

function Form({ initial, onSubmit }: { initial?: ApiConfig | null; onSubmit: (d: any) => void }) {
  const [f, setF] = useState(initial || { code: '', name: '', endpoint: '', apiKey: '', description: '', status: 'active', lastTested: '' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(f); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Mã kết nối *</label><input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
        <div><label className="block text-sm font-medium mb-1">Tên kết nối *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Endpoint *</label><input value={f.endpoint} onChange={e => setF({ ...f, endpoint: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="https://api.example.com/v1" required /></div>
      <div><label className="block text-sm font-medium mb-1">API Key</label><input type="password" value={f.apiKey} onChange={e => setF({ ...f, apiKey: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
      <div><label className="block text-sm font-medium mb-1">Mô tả</label><textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
      <div className="flex justify-end gap-2"><button type="button" onClick={() => onSubmit({})} className="px-4 py-2 border rounded-lg text-sm">Hủy</button><button type="submit" className="btn-primary text-xs">Lưu</button></div>
    </form>
  );
}

function SsoConfigPage() {
  const [method, setMethod] = useState('oauth2');
  const [serviceUrl, setServiceUrl] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [realm, setRealm] = useState('');
  const [autoCreate, setAutoCreate] = useState(true);

  const methods = [
    { value: 'oauth2', label: 'OAuth 2.0' },
    { value: 'ldap', label: 'LDAP' },
    { value: 'ad', label: 'Active Directory' },
    { value: 'saml', label: 'SAML 2.0' },
    { value: 'google', label: 'Google Workspace' },
  ];

  const handleTestConnection = () => {
    alert(`Đang kiểm tra kết nối SSO: ${method}\nKết quả mô phỏng: Kết nối thành công!`);
  };

  const handleSave = () => {
    alert('Cấu hình SSO đã được lưu thành công (mô phỏng).');
  };

  const services = [
    { name: 'Google Workspace', domain: '@ctu.edu.vn', status: 'connected' as const, icon: Globe },
    { name: 'LDAP Active Directory', domain: null, status: 'disconnected' as const, icon: Shield },
    { name: 'Hệ thống Eoffice SSO', domain: null, status: 'connected' as const, icon: Key },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header"><h3 className="text-white flex items-center gap-2"><Fingerprint size={16} /> Cấu hình xác thực (SSO)</h3></div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-text-dark">Phương thức xác thực</label>
            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
            >
              {methods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-dark">URL dịch vụ</label>
            <input
              value={serviceUrl}
              onChange={e => setServiceUrl(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono"
              placeholder="ldap://ad.ctu.edu.vn"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-dark">Client ID / App ID</label>
              <input
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="client-id-abc-123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-dark">Client Secret</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={clientSecret}
                  onChange={e => setClientSecret(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg text-sm font-mono"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-light hover:text-text-dark"
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-text-dark">Realm / Domain</label>
            <input
              value={realm}
              onChange={e => setRealm(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              placeholder="ctu.edu.vn"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoCreate}
              onChange={e => setAutoCreate(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm text-text-dark">Tự động tạo tài khoản khi đăng nhập lần đầu</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button onClick={handleTestConnection} className="px-4 py-2 border border-border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50">
              <Wifi size={14} /> Kiểm tra kết nối
            </button>
            <button onClick={handleSave} className="btn-primary text-xs flex items-center gap-2">
              <Shield size={14} /> Lưu cấu hình
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="text-white flex items-center gap-2"><Globe size={16} /> Dịch vụ đã kết nối</h3></div>
        <div className="divide-y divide-border">
          {services.map(s => (
            <div key={s.name} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <s.icon size={18} className="text-text-dark" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-dark">{s.name}</p>
                  {s.domain && <p className="text-xs text-text-light">{s.domain}</p>}
                </div>
              </div>
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                s.status === 'connected'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-100 text-text-light'
              }`}>
                {s.status === 'connected' ? <><Wifi size={12} /> Đã kết nối</> : <><WifiOff size={12} /> Chưa kết nối</>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
