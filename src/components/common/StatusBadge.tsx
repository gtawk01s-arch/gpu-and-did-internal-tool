import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'gpu' | 'did' | 'approval' | 'invoice' | 'payment' | 'client' | 'provider' | 'alert';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorStyles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  const s = status.toLowerCase();

  if (s === 'active' || s === 'operational' || s === 'paid' || s === 'settled' || s === 'approved' || s === 'in use') {
    colorStyles = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
  } else if (s === 'available') {
    colorStyles = 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/60';
  } else if (s === 'pending' || s === 'invoice sent' || s === 'partially paid' || s === 'hold' || s === 'reserved' || s === 'processing' || s === 'medium') {
    colorStyles = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/60';
  } else if (s === 'critical' || s === 'failed' || s === 'overdue' || s === 'rejected' || s === 'delinquent' || s === 'offline') {
    colorStyles = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/60';
  } else if (s === 'draft' || s === 'maintenance' || s === 'suspended' || s === 'porting' || s === 'low') {
    colorStyles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${colorStyles} whitespace-nowrap`}
    >
      {status}
    </span>
  );
};
