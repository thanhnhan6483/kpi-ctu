'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, X } from 'lucide-react';
import usersData from '@/data/users.json';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Đã có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-heading font-bold text-text-dark">
              Hệ thống KPI
            </h1>
            <p className="text-text-light mt-1">Đại học Cần Thơ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-dark mb-1.5">
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Nhập tên đăng nhập"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                  placeholder="Nhập mật khẩu"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text-dark"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => { setShowForgotModal(true); setForgotEmail(''); setForgotMessage(null); }} className="text-sm text-primary hover:text-primary-dark underline">
              Quên mật khẩu?
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-text-light">
            <p>Sử dụng tài khoản được cấp bởi Quản trị viên</p>
          </div>
        </div>

        <p className="text-center text-white/60 text-xs mt-6">
          © 2026 Đại học Cần Thơ. Hệ thống Quản lý KPI.
        </p>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForgotModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-bold text-text-dark">Quên mật khẩu</h2>
              <button onClick={() => setShowForgotModal(false)} className="p-1 text-text-light hover:text-text-dark rounded-lg"><X size={20} /></button>
            </div>
            {forgotMessage ? (
              <div className={`p-4 rounded-lg text-sm ${forgotMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {forgotMessage.text}
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setForgotLoading(true);
                setForgotMessage(null);
                await new Promise(r => setTimeout(r, 500));
                const found = (usersData as { id: string; email: string }[]).find(u => u.email === forgotEmail);
                if (found) {
                  setForgotMessage({ type: 'success', text: 'Vui lòng liên hệ quản trị viên để cấp lại mật khẩu' });
                } else {
                  setForgotMessage({ type: 'error', text: 'Email không tồn tại trong hệ thống' });
                }
                setForgotLoading(false);
              }} className="space-y-4">
                <p className="text-sm text-text-light">Nhập email đã đăng ký để yêu cầu cấp lại mật khẩu.</p>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" size={16} />
                    <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                      placeholder="nhap@email.com" required />
                  </div>
                </div>
                <button type="submit" disabled={forgotLoading}
                  className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark disabled:opacity-50">
                  {forgotLoading ? 'Đang xử lý...' : 'Yêu cầu cấp lại mật khẩu'}
                </button>
              </form>
            )}
            {forgotMessage && (
              <button onClick={() => setShowForgotModal(false)}
                className="mt-4 w-full py-2.5 border border-border text-text-dark rounded-lg font-medium text-sm hover:bg-bg-cream">
                Đóng
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
