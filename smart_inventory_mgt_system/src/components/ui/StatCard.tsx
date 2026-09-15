import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: { value: number; label: string };
  iconBg?: string;
  iconColor?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  change,
  iconBg = 'bg-primary-50',
  iconColor = 'text-primary-600',
}: StatCardProps) {
  const isPositive = change && change.value >= 0;

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14px] text-surface-600 font-medium">{title}</h3>
        <div className={`w-8 h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[28px] font-bold text-surface-900 leading-none">{value}</p>
        {change && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-[13px] font-medium ${isPositive ? 'text-success-600' : 'text-danger-500'}`}>
              {isPositive ? '+' : ''}{change.value}%
            </span>
            <span className="text-[13px] text-surface-500">{change.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
