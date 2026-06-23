'use client';

import { UserCog } from 'lucide-react';
import PositionKPIPage from '@/components/kpi/PositionKPIPage';

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-light rounded-lg"><UserCog size={24} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý KPI viên chức</h1>
          <p className="text-text-light text-sm">XX.12 — Quản lý bộ chỉ tiêu KPI cho viên chức, chuyên viên các phòng ban</p>
        </div>
      </div>
      <PositionKPIPage config={{
        title: 'KPI viên chức',
        description: 'Theo dõi kết quả thực hiện KPI của viên chức, chuyên viên',
        positionNames: ['chuyên viên'],
      }} />
    </div>
  );
}
