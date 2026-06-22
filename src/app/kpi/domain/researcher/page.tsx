'use client';

import { Microscope } from 'lucide-react';
import PositionKPIPage from '@/components/kpi/PositionKPIPage';

export default function ResearcherPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-light rounded-lg"><Microscope size={24} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý KPI nghiên cứu viên</h1>
          <p className="text-text-light text-sm">XX.13 — Quản lý bộ chỉ tiêu KPI cho nghiên cứu viên</p>
        </div>
      </div>
      <PositionKPIPage config={{
        title: 'KPI nghiên cứu viên',
        description: 'Theo dõi kết quả thực hiện KPI của nghiên cứu viên',
        positionNames: ['nghiên cứu viên'],
      }} />
    </div>
  );
}
