'use client';

import { Settings, Save, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">
            Cài đặt hệ thống
          </h1>
          <p className="text-text-light mt-1">Quản lý cấu hình chung</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Save size={16} />
          Lưu cài đặt
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-white">Thông tin hệ thống</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Tên hệ thống
              </label>
              <input
                type="text"
                defaultValue="Hệ thống KPI - Đại học Cần Thơ"
                className="w-full px-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Năm học hiện tại
              </label>
              <input
                type="text"
                defaultValue="2025-2026"
                className="w-full px-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Email liên hệ
              </label>
              <input
                type="email"
                defaultValue="kpi@ctu.edu.vn"
                className="w-full px-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-white">Cấu hình KPI</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Điểm tối đa (cap rate)
              </label>
              <input
                type="number"
                defaultValue={120}
                className="w-full px-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text-light mt-1">
                Giới hạn điểm vượt chỉ tiêu (mặc định: 120%)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Ngưỡng xếp loại
              </label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-20">Xuất sắc:</span>
                  <input type="number" defaultValue={90} className="w-20 px-2 py-1 border rounded" />điểm
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20">Tốt:</span>
                  <input type="number" defaultValue={80} className="w-20 px-2 py-1 border rounded" />điểm
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20">Đạt:</span>
                  <input type="number" defaultValue={65} className="w-20 px-2 py-1 border rounded" />điểm
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20">Cải thiện:</span>
                  <input type="number" defaultValue={50} className="w-20 px-2 py-1 border rounded" />điểm
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Hệ số minh chứng
              </label>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>Hợp lệ:</span>
                  <input type="number" defaultValue={1} step={0.1} className="w-16 px-2 py-1 border rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <span>Thiếu:</span>
                  <input type="number" defaultValue={0.5} step={0.1} className="w-16 px-2 py-1 border rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <span>Không có:</span>
                  <input type="number" defaultValue={0} step={0.1} className="w-16 px-2 py-1 border rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-white">Dữ liệu hệ thống</h3>
        </div>
        <div className="p-4">
          <div className="flex gap-4">
            <button className="btn-secondary flex items-center gap-2">
              <RefreshCw size={16} />
              Đồng bộ dữ liệu mẫu
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Settings size={16} />
              Đặt lại cấu hình
            </button>
          </div>
          <p className="text-xs text-text-light mt-4">
            Dữ liệu hiện tại: 3 người dùng, 10 đơn vị, 7 nhóm KPI, 23 chỉ tiêu cấp Trường
          </p>
        </div>
      </div>
    </div>
  );
}
