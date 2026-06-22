'use client';

import { Monitor } from 'lucide-react';
import DomainKPIPage from '@/components/kpi/DomainKPIPage';

export default function DigitalTransformationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-light rounded-lg"><Monitor size={24} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý KPI chuyển đổi số</h1>
          <p className="text-text-light text-sm">XX.9 — Theo dõi chỉ tiêu quy trình mạng, ký số, giảng dạy trực tuyến</p>
        </div>
      </div>
      <DomainKPIPage config={{
        title: 'KPI chuyển đổi số',
        description: 'Nhập kết quả thực tế cho các chỉ tiêu chuyển đổi số',
        keywords: ['chuyển đổi số', 'ký số', 'mạng', 'trực tuyến'],
      }} />
    </div>
  );
}
