'use client';

import { Heart } from 'lucide-react';
import DomainKPIPage from '@/components/kpi/DomainKPIPage';

export default function CommunityServicePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-light rounded-lg"><Heart size={24} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý KPI phục vụ cộng đồng</h1>
          <p className="text-text-light text-sm">XX.10 — Theo dõi chỉ tiêu hợp tác địa phương, doanh nghiệp, cộng đồng</p>
        </div>
      </div>
      <DomainKPIPage config={{
        title: 'KPI phục vụ cộng đồng',
        description: 'Nhập kết quả thực tế cho các chỉ tiêu phục vụ cộng đồng',
        keywords: ['cộng đồng', 'địa phương', 'doanh nghiệp'],
      }} />
    </div>
  );
}
