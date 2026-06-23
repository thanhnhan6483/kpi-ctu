'use client';

import { Briefcase } from 'lucide-react';
import DomainKPIPage from '@/components/kpi/DomainKPIPage';

export default function GraduationEmploymentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-light rounded-lg"><Briefcase size={24} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý KPI tốt nghiệp & việc làm</h1>
          <p className="text-text-light text-sm">XX.3 — Theo dõi tỉ lệ tốt nghiệp đúng hạn, tỉ lệ có việc làm sau tốt nghiệp</p>
        </div>
      </div>
      <DomainKPIPage config={{
        title: 'KPI tốt nghiệp & việc làm',
        description: 'Nhập kết quả thực tế cho các chỉ tiêu tốt nghiệp và việc làm',
        keywords: ['tốt nghiệp', 'việc làm'],
      }} />
    </div>
  );
}
