interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'dot';
}

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-success-50/80', text: 'text-success-700', dot: 'bg-success-500' },
  inactive: { bg: 'bg-surface-100/80', text: 'text-surface-600', dot: 'bg-surface-400' },
  discontinued: { bg: 'bg-danger-50/80', text: 'text-danger-600', dot: 'bg-danger-500' },
  'in-stock': { bg: 'bg-success-50/80', text: 'text-success-700', dot: 'bg-success-500' },
  'in_stock': { bg: 'bg-success-50/80', text: 'text-success-700', dot: 'bg-success-500' },
  'low-stock': { bg: 'bg-warning-50/80', text: 'text-warning-700', dot: 'bg-warning-500' },
  'low_stock': { bg: 'bg-warning-50/80', text: 'text-warning-700', dot: 'bg-warning-500' },
  'out-of-stock': { bg: 'bg-danger-50/80', text: 'text-danger-600', dot: 'bg-danger-500' },
  'out_of_stock': { bg: 'bg-danger-50/80', text: 'text-danger-600', dot: 'bg-danger-500' },
  pending: { bg: 'bg-warning-50/80', text: 'text-warning-700', dot: 'bg-warning-500' },
  pending_approval: { bg: 'bg-warning-50/80', text: 'text-warning-700', dot: 'bg-warning-500' },
  draft: { bg: 'bg-surface-100/80', text: 'text-surface-600', dot: 'bg-surface-400' },
  approved: { bg: 'bg-primary-50/80', text: 'text-primary-700', dot: 'bg-primary-500' },
  rejected: { bg: 'bg-danger-50/80', text: 'text-danger-600', dot: 'bg-danger-500' },
  shipped: { bg: 'bg-primary-50/80', text: 'text-primary-600', dot: 'bg-primary-500' },
  ordered: { bg: 'bg-primary-50/80', text: 'text-primary-600', dot: 'bg-primary-500' },
  partially_delivered: { bg: 'bg-primary-50/80', text: 'text-primary-700', dot: 'bg-primary-500' },
  delivered: { bg: 'bg-success-50/80', text: 'text-success-700', dot: 'bg-success-500' },
  cancelled: { bg: 'bg-danger-50/80', text: 'text-danger-600', dot: 'bg-danger-500' },
};

export default function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const style = statusStyles[status] || { bg: 'bg-surface-100/80', text: 'text-surface-600', dot: 'bg-surface-400' };
  const label = status.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  if (variant === 'dot') {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full shadow-sm ${style.dot}`} />
        <span className={`text-[13px] font-medium ${style.text}`}>{label}</span>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-white/50 shadow-sm ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}
