'use client';

import { ClipboardCheck } from 'lucide-react';
import DomainKPIPage from '@/components/kpi/DomainKPIPage';

export default function SurveyQualityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-light rounded-lg"><ClipboardCheck size={24} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-dark">Quản lý KPI khảo sát & ĐBCL</h1>
          <p className="text-text-light text-sm">XX.4 — Theo dõi chỉ tiêu khảo sát hài lòng, tự đánh giá chương trình</p>
        </div>
      </div>
      <DomainKPIPage config={{
        title: 'KPI khảo sát & ĐBCL',
        description: 'Nhập kết quả thực tế cho các chỉ tiêu khảo sát và đảm bảo chất lượng',
        keywords: ['hài lòng', 'tự đánh giá', 'khảo sát'],
      }} />
    </div>
  );
}
