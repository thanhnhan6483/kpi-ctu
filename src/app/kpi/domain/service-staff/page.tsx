'use client';

import { Hand } from 'lucide-react';
import PositionKPIPage from '@/components/kpi/PositionKPIPage';

export default function ServiceStaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-light rounded-lg"><Hand size={24} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý KPI nhân viên phục vụ</h1>
          <p className="text-text-light text-sm">XX.14 — Quản lý bộ chỉ tiêu KPI cho nhân viên phục vụ, thư viện, hành chính, kỹ thuật</p>
        </div>
      </div>
      <PositionKPIPage config={{
        title: 'KPI nhân viên phục vụ',
        description: 'Theo dõi kết quả thực hiện KPI của nhân viên phục vụ',
        positionNames: ['nhân viên'],
      }} />
    </div>
  );
}
