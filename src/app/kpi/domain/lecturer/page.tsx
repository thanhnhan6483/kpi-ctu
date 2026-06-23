'use client';

import { UserCheck } from 'lucide-react';
import PositionKPIPage from '@/components/kpi/PositionKPIPage';

export default function LecturerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-light rounded-lg"><UserCheck size={24} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý KPI giảng viên</h1>
          <p className="text-text-light text-sm">XX.11 — Quản lý bộ chỉ tiêu KPI cho giảng viên và giảng viên kiêm nhiệm quản lý</p>
        </div>
      </div>
      <PositionKPIPage config={{
        title: 'KPI giảng viên',
        description: 'Theo dõi kết quả thực hiện KPI của giảng viên',
        positionNames: ['giảng viên'],
      }} />
    </div>
  );
}
