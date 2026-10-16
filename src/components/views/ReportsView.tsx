import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  Server,
  PhoneCall,
  IndianRupee,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { formatINR } from '../../data/mockData';

export const ReportsView: React.FC = () => {
  const { gpus, sipProviders, dids, clients, invoices, providers, auditLogs } = useApp();

  const [selectedReport, setSelectedReport] = useState<string>('gpu-alloc');

  const reportOptions = [
    { id: 'gpu-alloc', label: 'GPU Allocation Report', icon: Server },
    { id: 'sip-alloc', label: 'SIP Allocation Report', icon: PhoneCall },
    { id: 'did-alloc', label: 'DID Allocation Report', icon: PhoneCall },
    { id: 'revenue', label: 'Consolidated Revenue Report', icon: IndianRupee },
    { id: 'cost', label: 'Provider Wholesale Cost Report', icon: Layers },
    { id: 'profit', label: 'Wholesale Profit Arbitrage Report', icon: TrendingUp },
    { id: 'invoice', label: 'Accounts Receivable & Invoice Report', icon: FileText },
    { id: 'client-usage', label: 'Client Usage & Utilization Report', icon: BarChart3 },
    { id: 'provider-cost', label: 'Provider Spend & Commitment Report', icon: Layers },
    { id: 'audit-log', label: 'Compliance & Audit Trail Report', icon: FileText },
  ];

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (selectedReport === 'gpu-alloc') {
      headers = ['GPU ID', 'Model', 'Provider', 'Region', 'Quantity', 'Allocated', 'Cost/mo', 'Price/mo', 'Client'];
      rows = gpus.map(g => [
        g.gpuId,
        g.gpuModel,
        g.provider,
        g.region,
        String(g.quantity),
        String(g.allocatedQuantity),
        String(g.monthlyCost),
        String(g.sellingPrice),
        g.assignedClient || 'Unassigned',
      ]);
    } else if (selectedReport === 'revenue' || selectedReport === 'profit') {
      headers = ['Client', 'Resource Need', 'Monthly Spend', 'Monthly Cost', 'Gross Profit', 'Margin %'];
      rows = clients.map(c => {
        const profit = c.monthlySpend - c.monthlyCost;
        const margin = c.monthlySpend > 0 ? ((profit / c.monthlySpend) * 100).toFixed(1) + '%' : '0%';
        return [
          c.companyName,
          c.resourceRequirement,
          String(c.monthlySpend),
          String(c.monthlyCost),
          String(profit),
          margin,
        ];
      });
    } else {
      headers = ['Item', 'Details', 'Status'];
      rows = [['Data', 'Consolidated Wholesale Report', 'Ready']];
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(',')].concat(rows.map(r => r.map(cell => `"${cell}"`).join(','))).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-500" />
            Executive Reports &amp; Wholesale Analytics Export
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate and export board-level CSV and Excel operational data across all broker assets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {reportOptions.map(rep => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-cyan-50 border-cyan-500/80 dark:bg-cyan-950/40 dark:border-cyan-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Icon
                className={`w-4 h-4 mb-2 ${
                  isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'
                }`}
              />
              <span
                className={`text-xs font-semibold line-clamp-2 ${
                  isSelected
                    ? 'text-cyan-900 dark:text-cyan-100'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {rep.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Report Live Tabular Preview */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Preview: {reportOptions.find(r => r.id === selectedReport)?.label}
            </h3>
            <p className="text-[11px] text-slate-400">
              Generated at {new Date().toISOString().substring(0, 10)} · Verified by AetherVox Financial Ledger
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">Ready for Audit</span>
        </div>

        {/* Dynamic preview content */}
        <div className="overflow-x-auto text-xs font-sans">
          {selectedReport === 'gpu-alloc' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2 px-3">GPU ID</th>
                  <th className="py-2 px-3">Model</th>
                  <th className="py-2 px-3">Provider</th>
                  <th className="py-2 px-3 text-right">Units</th>
                  <th className="py-2 px-3 text-right">Allocated</th>
                  <th className="py-2 px-3 text-right">Monthly Rev</th>
                  <th className="py-2 px-3 text-right">Wholesale Cost</th>
                  <th className="py-2 px-3">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {gpus.map(g => (
                  <tr key={g.id}>
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">{g.gpuId}</td>
                    <td className="py-2 px-3 font-sans text-slate-800 dark:text-slate-200">{g.gpuModel}</td>
                    <td className="py-2 px-3 text-slate-500">{g.provider}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{g.quantity}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold text-cyan-600 dark:text-cyan-400">{g.allocatedQuantity}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">${(g.sellingPrice * g.allocatedQuantity).toLocaleString()}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-rose-500">-${(g.monthlyCost * g.allocatedQuantity).toLocaleString()}</td>
                    <td className="py-2 px-3 font-sans text-slate-700 dark:text-slate-300">{g.assignedClient || 'Available'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(selectedReport === 'revenue' || selectedReport === 'profit' || selectedReport === 'client-usage') && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2 px-3">Client Company</th>
                  <th className="py-2 px-3">Tier</th>
                  <th className="py-2 px-3 text-right">Allocated GPUs</th>
                  <th className="py-2 px-3 text-right">Monthly Revenue</th>
                  <th className="py-2 px-3 text-right">Provider Cost</th>
                  <th className="py-2 px-3 text-right">Gross Profit</th>
                  <th className="py-2 px-3 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {clients.map(c => {
                  const profit = c.monthlySpend - c.monthlyCost;
                  const margin = c.monthlySpend > 0 ? ((profit / c.monthlySpend) * 100).toFixed(1) + '%' : '–';
                  return (
                    <tr key={c.id}>
                      <td className="py-2 px-3 font-sans font-bold text-slate-900 dark:text-slate-100">{c.companyName}</td>
                      <td className="py-2 px-3 font-sans text-slate-500">{c.resourceRequirement}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{c.allocatedGpuCount} nodes</td>
                      <td className="py-2 px-3 text-right tabular-nums font-bold text-slate-900 dark:text-slate-100">{formatINR(c.monthlySpend)}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-rose-500">-{formatINR(c.monthlyCost)}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">+{formatINR(profit)}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-cyan-600 dark:text-cyan-400 font-semibold">{margin}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {(selectedReport === 'sip-alloc' || selectedReport === 'did-alloc') && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2 px-3">DID Phone Number</th>
                  <th className="py-2 px-3">Carrier Provider</th>
                  <th className="py-2 px-3">Country</th>
                  <th className="py-2 px-3">Assigned Client</th>
                  <th className="py-2 px-3 text-right">Wholesale Cost</th>
                  <th className="py-2 px-3 text-right">Resale Price</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {dids.map(d => (
                  <tr key={d.id}>
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">{d.didNumber}</td>
                    <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-300">{d.provider}</td>
                    <td className="py-2 px-3 font-sans">{d.country}</td>
                    <td className="py-2 px-3 font-sans text-slate-800 dark:text-slate-200">{d.assignedClient || 'Unassigned'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{formatINR(d.monthlyCost)}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">{formatINR(d.sellingPrice)}</td>
                    <td className="py-2 px-3 font-sans">{d.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'invoice' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2 px-3">Invoice Number</th>
                  <th className="py-2 px-3">Client</th>
                  <th className="py-2 px-3">Period</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                  <th className="py-2 px-3">Due Date</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {invoices.map(i => (
                  <tr key={i.id}>
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">{i.invoiceNumber}</td>
                    <td className="py-2 px-3 font-sans text-slate-800 dark:text-slate-200">{i.clientName}</td>
                    <td className="py-2 px-3 text-slate-500">{i.billingPeriod}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-slate-900 dark:text-slate-100">{formatINR(i.totalAmount)}</td>
                    <td className="py-2 px-3 text-slate-500">{i.dueDate}</td>
                    <td className="py-2 px-3 font-sans">{i.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
