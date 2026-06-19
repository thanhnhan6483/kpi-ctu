'use client';

import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-16 bg-primary flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm KPI, đơn vị..."
            className="pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm w-80 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-white hover:bg-white/10 rounded-lg">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
              <User size={16} />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-white">Admin</div>
              <div className="text-xs text-white/70">Quản trị viên</div>
            </div>
            <ChevronDown size={14} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
              <a href="/profile" className="block px-4 py-2 text-sm text-text-dark hover:bg-bg-cream">
                Hồ sơ cá nhân
              </a>
              <a href="/settings" className="block px-4 py-2 text-sm text-text-dark hover:bg-bg-cream">
                Cài đặt
              </a>
              <hr className="my-2 border-border" />
              <a href="/logout" className="block px-4 py-2 text-sm text-accent-red hover:bg-bg-cream">
                Đăng xuất
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
