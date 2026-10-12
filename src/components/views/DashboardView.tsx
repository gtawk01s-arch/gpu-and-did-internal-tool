import React, { useState } from 'react';
import {
  Server,
  PhoneCall,
  DollarSign,
  TrendingUp,
  Users,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  ArrowUpRight,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { FINANCIAL_TRENDS_12MO } from '../../data/mockData';

export const DashboardView: React.FC = () => {
  const {
    gpus,
    sipProviders,
    dids,
    clients,
    invoices,
    pendingRequests,
    alerts,
    approveRequest,
    rejectRequest,
    holdRequest,
    setActiveTab,
    setSelectedInvoiceId,
  } = useApp();

  const [timeRange, setTimeRange] = useState<'30D' | '90D' | '1Y'>('1Y');

  // Computed metrics
  const totalGpuPurchased = gpus.reduce((sum, g) => sum + g.quantity, 0);
  const totalGpuAllocated = gpus.reduce((sum, g) => sum + g.allocatedQuantity, 0);
  const totalGpuActive = gpus.filter(g => g.status === 'In Use').reduce((sum, g) => sum + g.allocatedQuantity, 0);
  const totalGpuFree = totalGpuPurchased - totalGpuAllocated;
  const gpuUtilPercent = Math.round((totalGpuAllocated / totalGpuPurchased) * 100);

  const totalDids = dids.length;
  const allocatedDids = dids.filter(d => d.status === 'Assigned').length;
  const availableDids = dids.filter(d => d.status === 'Available').length;

  const monthlyRevenue = clients.reduce((sum, c) => sum + c.monthlySpend, 0);
  const monthlyCost = clients.reduce((sum, c) => sum + c.monthlyCost, 0);
  const grossProfit = monthlyRevenue - monthlyCost;
  const netProfit = Math.round(grossProfit * 0.88); // Net after datacenter cross-connects & ops overhead

  const activeClientsCount = clients.filter(c => c.status === 'Active').length;
  const outstandingInvoicesTotal = invoices
    .filter(i => i.status === 'Invoice Sent' || i.status === 'Partially Paid' || i.status === 'Overdue')
    .reduce((sum, i) => sum + (i.totalAmount - (i.paidAmount || 0)), 0);

  const pendingList = pendingRequests.filter(r => r.status === 'Pending' || r.status === 'Hold');

  // Chart coordinate mapping
  const chartData = FINANCIAL_TRENDS_12MO;
  const maxVal = Math.max(...chartData.map(d => d.revenue));
  const minVal = Math.min(...chartData.map(d => d.profit));

  const chartWidth = 720;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 20;

  const getX = (index: number) =>
    paddingX + (index / (chartData.length - 1)) * (chartWidth - paddingX * 2);
  const getY = (val: number) =>
    chartHeight - paddingY - ((val - minVal * 0.8) / (maxVal * 1.05 - minVal * 0.8)) * (chartHeight - paddingY * 2);

  const revenuePath = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.revenue)}`).join(' ');
  const costPath = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.cost)}`).join(' ');
  const profitPath = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.profit)}`).join(' ');

  return (
    <div className="space-y-6">
      {/* Top Banner: Critical Alerts Ticker if any */}
      {alerts.some(a => !a.resolved && a.severity === 'Critical') && (
        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-semibold text-rose-100">Wholesale Capacity Warning: </span>
              <span>{alerts.find(a => !a.resolved && a.severity === 'Critical')?.title}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('alerts')}
            className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 px-3 py-1 rounded transition-colors"
          >
            Review in Alert Center
          </button>
        </div>
      )}

      {/* Row 1: Primary Financial & Executive KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Wholesale Revenue &amp; Financial Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monthly consolidated figures across RunPod, Lambda, Vast.ai, Telnyx, Bandwidth &amp; Twilio.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-mono">Real-time Margin:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {((grossProfit / monthlyRevenue) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <MetricCard
            label="Monthly Resale Revenue"
            value={`$${monthlyRevenue.toLocaleString()}`}
            subValue="Run-rate billing"
            trend={{ direction: 'up', value: '+14.2% YoY' }}
            icon={DollarSign}
            highlight
          />
          <MetricCard
            label="Wholesale Provider Cost"
            value={`$${monthlyCost.toLocaleString()}`}
            subValue="Commitments & usage"
            trend={{ direction: 'neutral', value: '64.9% of Rev' }}
            icon={Layers}
          />
          <MetricCard
            label="Gross Wholesale Profit"
            value={`$${grossProfit.toLocaleString()}`}
            subValue="Spread arbitrage"
            trend={{ direction: 'up', value: '+$28.4k vs Q2' }}
            icon={TrendingUp}
          />
          <MetricCard
            label="Net Operating Profit"
            value={`$${netProfit.toLocaleString()}`}
            subValue="After carrier cross-connects"
            trend={{ direction: 'up', value: '28.9% Net Margin' }}
            icon={ArrowUpRight}
          />
        </div>
      </div>

      {/* Row 2: Capacity & Operational KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="Total Purchased GPUs"
          value={totalGpuPurchased}
          subValue={`${gpus.length} node pools`}
          icon={Server}
          badge="Nodes"
        />
        <MetricCard
          label="Allocated GPUs"
          value={totalGpuAllocated}
          subValue={`${totalGpuActive} active in use`}
          trend={{ direction: 'up', value: `${gpuUtilPercent}% Utilized` }}
          badge="Allocated"
        />
        <MetricCard
          label="Free GPU Inventory"
          value={totalGpuFree}
          subValue="Available to assign"
          badge="Surplus"
        />
        <MetricCard
          label="Total DID Inventory"
          value={totalDids}
          subValue="E.164 phone blocks"
          icon={PhoneCall}
          badge="DIDs"
        />
        <MetricCard
          label="Available DIDs"
          value={availableDids}
          subValue={`${allocatedDids} assigned`}
          badge="Telecom"
        />
        <MetricCard
          label="Active Clients"
          value={activeClientsCount}
          subValue={`$${outstandingInvoicesTotal.toLocaleString()} unpaid`}
          icon={Users}
          badge="Clients"
        />
      </div>

      {/* Row 3: Interactive Financial & Utilization Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Financial Trend Chart (2 Cols) */}
        <div className="lg:col-span-2 p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Revenue vs Provider Cost vs Profit Trend (12 Months)
              </h3>
              <p className="text-[11px] text-slate-400">
                Historical trajectory of gross wholesale spread and commitments.
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
              {(['30D', '90D', '1Y'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setTimeRange(tab)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    timeRange === tab
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line / Area Graph */}
          <div className="relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-52 overflow-visible select-none"
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = paddingY + pct * (chartHeight - paddingY * 2);
                return (
                  <line
                    key={i}
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* Paths */}
              <path
                d={`${revenuePath} L ${getX(chartData.length - 1)} ${chartHeight - paddingY} L ${getX(0)} ${chartHeight - paddingY} Z`}
                fill="url(#revenueGrad)"
              />
              <path
                d={revenuePath}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              <path
                d={costPath}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="4 2"
                strokeLinecap="round"
              />

              <path
                d={`${profitPath} L ${getX(chartData.length - 1)} ${chartHeight - paddingY} L ${getX(0)} ${chartHeight - paddingY} Z`}
                fill="url(#profitGrad)"
              />
              <path
                d={profitPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {chartData.map((d, i) => (
                <g key={i}>
                  <circle cx={getX(i)} cy={getY(d.revenue)} r="3" fill="#06b6d4" />
                  <circle cx={getX(i)} cy={getY(d.profit)} r="3" fill="#10b981" />
                </g>
              ))}
            </svg>

            {/* X-axis Month labels */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-6 mt-1">
              {chartData.map((d, idx) => (
                <span key={idx} className={idx % 2 === 0 ? 'inline' : 'hidden md:inline'}>
                  {d.month}
                </span>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-cyan-500 rounded" />
                <span className="text-slate-600 dark:text-slate-300">Revenue ($512.3k)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-rose-500 rounded border-dashed" />
                <span className="text-slate-600 dark:text-slate-300">Provider Cost ($335.4k)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-emerald-500 rounded" />
                <span className="text-slate-600 dark:text-slate-300 font-semibold">Gross Profit ($176.9k)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Capacity & Utilization Breakdown */}
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Resource Utilization
              </h3>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">Live Telemetry</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* GPU Utilization Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">GPU Fleet Allocation</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {totalGpuAllocated} / {totalGpuPurchased} ({gpuUtilPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all"
                    style={{ width: `${gpuUtilPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>In Use: {totalGpuActive} units</span>
                  <span>Available: {totalGpuFree} units</span>
                </div>
              </div>

              {/* SIP Trunk Channel Saturation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">SIP Trunk Concurrency</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    4,660 / 6,500 (71.7%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                    style={{ width: `71.7%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Active Channels: 4.6k</span>
                  <span>Peak Cap: 6.5k</span>
                </div>
              </div>

              {/* DID Allocation Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">DID Numbers Assigned</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {allocatedDids} / {totalDids} ({Math.round((allocatedDids / totalDids) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                    style={{ width: `${Math.round((allocatedDids / totalDids) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Assigned: {allocatedDids}</span>
                  <span>Free Pool: {availableDids}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Provider Wholesale SLA:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">99.98% Compliant</span>
          </div>
        </div>
      </div>

      {/* Row 4: Pending Approvals Queue */}
      <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Pending Allocation Requests Waiting for Approval ({pendingList.length})
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('approvals')}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
          >
            Open Approvals Desk
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-2 px-3">Request ID</th>
                <th className="py-2 px-3">Client Name</th>
                <th className="py-2 px-3">Resource Type &amp; Specs</th>
                <th className="py-2 px-3 text-right">Quantity</th>
                <th className="py-2 px-3 text-right">Monthly Value</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {pendingList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No requests currently pending approval. All wholesale resources allocated.
                  </td>
                </tr>
              ) : (
                pendingList.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {req.requestId}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                      {req.clientName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400 mr-1.5">
                        {req.resourceType}:
                      </span>
                      <span>{req.specs}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {req.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                      ${req.sellingPrice.toLocaleString()}/mo
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {req.date}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => approveRequest(req.id)}
                          className="px-2 py-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1 transition-colors"
                          title="Approve Request"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => holdRequest(req.id)}
                          className="px-2 py-1 text-[11px] font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900 rounded flex items-center gap-1 transition-colors"
                          title="Put on Hold"
                        >
                          <PauseCircle className="w-3 h-3" />
                          <span>Hold</span>
                        </button>
                        <button
                          onClick={() => rejectRequest(req.id)}
                          className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900 rounded flex items-center gap-1 transition-colors"
                          title="Reject Request"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
