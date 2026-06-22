'use client';

import { Globe } from 'lucide-react';
import DomainKPIPage from '@/components/kpi/DomainKPIPage';

export default function InternationalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-light rounded-lg"><Globe size={24} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý KPI hợp tác quốc tế</h1>
          <p className="text-text-light text-sm">XX.6 — Theo dõi chỉ tiêu sinh viên quốc tế, trao đổi tín chỉ</p>
        </div>
      </div>
      <DomainKPIPage config={{
        title: 'KPI hợp tác quốc tế',
        description: 'Nhập kết quả thực tế cho các chỉ tiêu hợp tác quốc tế',
        keywords: ['quốc tế', 'trao đổi'],
      }} />
    </div>
  );
}
