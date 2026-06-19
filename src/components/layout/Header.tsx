'use client';

import { Bell, Search, User, ChevronDown, Menu, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const user = session?.user;
  const displayName = user?.name || 'Admin';
  const displayRole = user?.username === 'admin' ? 'Quản trị viên' : 'Người dùng';

  return (
    <header className="h-16 bg-primary flex items-center justify-between px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-3 sm:gap-4">
        <button onClick={onToggleSidebar} className="p-2 text-white hover:bg-white/10 rounded-lg lg:hidden" aria-label="Mở menu">
          <Menu size={20} />
        </button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm KPI, đơn vị..."
            className="pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm w-full sm:w-80 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-white hover:bg-white/10 rounded-lg">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full"></span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
              <User size={16} />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-white">{displayName}</div>
              <div className="text-xs text-white/70">{displayRole}</div>
            </div>
            <ChevronDown size={14} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
              <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-text-dark hover:bg-bg-cream">
                <SettingsIcon size={16} />
                Cài đặt
              </Link>
              <hr className="my-2 border-border" />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 px-4 py-2 text-sm text-accent-red hover:bg-bg-cream w-full text-left"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
