import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  icon?: LucideIcon;
  badge?: string;
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  badge,
  highlight,
}) => {
  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        highlight
          ? 'bg-gradient-to-br from-cyan-950/30 to-blue-950/20 border-cyan-500/40 dark:border-cyan-500/30'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
        <span className="font-medium leading-tight line-clamp-1 min-w-0 flex-1" title={label}>
          {label}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {badge && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 whitespace-nowrap">
              {badge}
            </span>
          )}
          {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
        </div>
      </div>

      <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
        {value}
      </div>

      {(subValue || trend) && (
        <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          {subValue && <span className="truncate">{subValue}</span>}
          {trend && (
            <span
              className={`font-mono tabular-nums text-[11px] font-medium ml-auto ${
                trend.direction === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : trend.direction === 'down'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-500'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
