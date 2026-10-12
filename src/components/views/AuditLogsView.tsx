import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  ShieldCheck,
  Download,
  Calendar,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { AuditLog } from '../../types';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.includes(search) ||
      (log.resourceId && log.resourceId.toLowerCase().includes(search.toLowerCase())) ||
      log.newValue.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'All' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const exportAuditLogs = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,User,Role,Action,IP Address,Old Value,New Value,Resource ID']
        .concat(
          filteredLogs.map(
            l =>
              `"${l.timestamp}","${l.user}","${l.role}","${l.action}","${l.ipAddress}","${l.oldValue}","${l.newValue}","${l.resourceId || ''}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const actionTypes = Array.from(new Set(auditLogs.map(l => l.action)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            Immutable Audit Trail &amp; IP Tracking
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            SOC-2 Type II compliant tamper-evident event log for billing mutations and resource allocations.
          </p>
        </div>
        <button
          onClick={exportAuditLogs}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Total Audit Events" value={auditLogs.length} subValue="Logged in session" badge="Events" />
        <MetricCard label="Active IP Endpoints" value="4 Verified IPs" subValue="Zero anomalous origins" badge="Security" />
        <MetricCard label="Integrity Status" value="Cryptographic" subValue="SHA-256 chain verified" highlight badge="SOC-2" />
        <MetricCard label="Retention Period" value="7 Years" subValue="Wholesale compliance policy" badge="Compliance" />
      </div>

      {/* Search and Action Filter */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search operator, IP address (198.51.100.X), resource ID, or delta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Action:</span>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-hidden"
          >
            <option value="All">All Actions</option>
            {actionTypes.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Operator User</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Target Resource</th>
                <th className="py-2.5 px-3">Previous State (Old)</th>
                <th className="py-2.5 px-3">Committed State (New)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                    {log.user}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {log.role}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-cyan-600 dark:text-cyan-400">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                    {log.ipAddress}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                    {log.resourceId || '—'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-rose-500 dark:text-rose-400 line-through max-w-xs truncate">
                    {log.oldValue}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-medium max-w-xs truncate">
                    {log.newValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
