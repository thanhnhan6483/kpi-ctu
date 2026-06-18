export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

export function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN');
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('vi-VN');
}

export function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Nháp',
    submitted: 'Chờ duyệt',
    needs_revision: 'Yêu cầu chỉnh sửa',
    approved: 'Đã duyệt',
    in_progress: 'Đang theo dõi',
    submitted_result: 'Đã nộp kết quả',
    confirmed: 'Đã xác nhận',
    evaluated: 'Đã đánh giá',
    locked: 'Đã khóa',
    active: 'Đang hoạt động',
    inactive: 'Ngừng hoạt động',
    pending: 'Chờ xử lý',
    valid: 'Hợp lệ',
    invalid: 'Không hợp lệ',
    needs_supplement: 'Cần bổ sung',
  };
  return statusMap[status] || status;
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    draft: '#9e9e9e',
    submitted: '#2196f3',
    needs_revision: '#ff9800',
    approved: '#4caf50',
    in_progress: '#00afef',
    submitted_result: '#9c27b0',
    confirmed: '#4caf50',
    evaluated: '#3f51b5',
    locked: '#607d8b',
    active: '#4caf50',
    inactive: '#f44336',
    pending: '#ff9800',
    valid: '#4caf50',
    invalid: '#f44336',
    needs_supplement: '#ffc107',
  };
  return colorMap[status] || '#9e9e9e';
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
