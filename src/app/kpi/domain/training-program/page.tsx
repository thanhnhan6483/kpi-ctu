'use client';

import { BookOpen } from 'lucide-react';
import DomainKPIPage from '@/components/kpi/DomainKPIPage';

export default function TrainingProgramPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-light rounded-lg"><BookOpen size={24} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý KPI chương trình đào tạo</h1>
          <p className="text-text-light text-sm">XX.2 — Theo dõi chỉ tiêu liên quan đến CTĐT, học phần, giảng dạy trực tuyến</p>
        </div>
      </div>
      <DomainKPIPage config={{
        title: 'KPI chương trình đào tạo',
        description: 'Nhập kết quả thực tế cho các chỉ tiêu CTĐT và học phần',
        keywords: ['học phần', 'ctđt', 'chương trình đào tạo'],
      }} />
    </div>
  );
}
