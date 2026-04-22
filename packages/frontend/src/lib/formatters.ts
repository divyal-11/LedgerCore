export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num === 0) return '';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  ASSET: '#3b82f6',
  LIABILITY: '#ef4444',
  EQUITY: '#8b5cf6',
  REVENUE: '#10b981',
  EXPENSE: '#f59e0b',
};

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#f59e0b',
  POSTED: '#10b981',
  VOID: '#ef4444',
};
