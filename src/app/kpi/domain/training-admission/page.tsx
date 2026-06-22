'use client';

import { GraduationCap } from 'lucide-react';
import DomainKPIPage from '@/components/kpi/DomainKPIPage';

export default function TrainingAdmissionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-light rounded-lg"><GraduationCap size={24} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý KPI tuyển sinh</h1>
          <p className="text-text-light text-sm">XX.1 — Theo dõi chỉ tiêu tuyển sinh đại học chính quy</p>
        </div>
      </div>
      <DomainKPIPage config={{
        title: 'KPI tuyển sinh',
        description: 'Nhập kết quả thực tế cho các chỉ tiêu tuyển sinh',
        keywords: ['tuyển sinh'],
      }} />
    </div>
  );
}
