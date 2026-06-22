'use client';

import { FlaskConical } from 'lucide-react';
import DomainKPIPage from '@/components/kpi/DomainKPIPage';

export default function ResearchPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-light rounded-lg"><FlaskConical size={24} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý KPI KHCN</h1>
          <p className="text-text-light text-sm">XX.5 — Theo dõi chỉ tiêu công bố khoa học, đề tài NCKH, sở hữu trí tuệ</p>
        </div>
      </div>
      <DomainKPIPage config={{
        title: 'KPI KHCN',
        description: 'Nhập kết quả thực tế cho các chỉ tiêu khoa học công nghệ',
        keywords: ['công bố', 'khcn', 'shtt', 'nghiên cứu'],
      }} />
    </div>
  );
}
