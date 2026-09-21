import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: string;
  trendPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-emerald-400',
  trend,
  trendPositive = true,
}) => {
  return (
    <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4.5 hover:border-neutral-700/80 transition shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl bg-neutral-950/80 border border-neutral-800 ${iconColor}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-numeric text-3xl font-extrabold text-white tracking-wide">{value}</span>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trendPositive ? 'text-emerald-400' : 'text-neutral-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
    </div>
  );
};
