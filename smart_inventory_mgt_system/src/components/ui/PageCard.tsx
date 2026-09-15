import type { ReactNode } from 'react';

interface PageCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function PageCard({
  title,
  subtitle,
  children,
  action,
  className = '',
  noPadding = false,
}: PageCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-surface-200 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <div>
            {title && <h2 className="text-[15px] font-bold text-surface-900 tracking-tight">{title}</h2>}
            {subtitle && <p className="text-[13px] text-surface-500 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
}
