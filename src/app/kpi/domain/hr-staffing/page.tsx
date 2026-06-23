'use client';

import { Users } from 'lucide-react';
import DomainKPIPage from '@/components/kpi/DomainKPIPage';

export default function HRStaffingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-light rounded-lg"><Users size={24} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý KPI đội ngũ</h1>
          <p className="text-text-light text-sm">XX.8 — Theo dõi chỉ tiêu giảng viên, trình độ, chức danh GS/PGS</p>
        </div>
      </div>
      <DomainKPIPage config={{
        title: 'KPI đội ngũ',
        description: 'Nhập kết quả thực tế cho các chỉ tiêu đội ngũ nhân lực',
        keywords: ['giảng viên', 'đội ngũ', 'gs/pgs', 'trình độ'],
      }} />
    </div>
  );
}
