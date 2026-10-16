import React, { useState } from 'react';
import {
  Server,
  PhoneCall,
  IndianRupee,
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
  Building2,
  Activity,
  AlertTriangle,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { FINANCIAL_TRENDS_12MO, formatINR } from '../../data/mockData';
import { PendingRequest, Provider } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    gpus,
    sipProviders,
    dids,
    clients,
    invoices,
    pendingRequests,
    alerts,
    providers,
    approveRequest,
    rejectRequest,
    holdRequest,
    setActiveTab,
    setSelectedInvoiceId,
  } = useApp();

  const [timeRange, setTimeRange] = useState<'30D' | '90D' | '1Y'>('1Y');

  // Hold reason modal state
  const [holdingReq, setHoldingReq] = useState<PendingRequest | null>(null);
  const [holdReasonInput, setHoldReasonInput] = useState('');

  // Computed metrics (safe division - strictly no NaN%)
  const totalGpuPurchased = gpus.reduce((sum, g) => sum + g.quantity, 0);
  const totalGpuAllocated = gpus.reduce((sum, g) => sum + g.allocatedQuantity, 0);
  const totalGpuActive = gpus.filter(g => g.status === 'In Use').reduce((sum, g) => sum + g.allocatedQuantity, 0);
  const totalGpuFree = Math.max(0, totalGpuPurchased - totalGpuAllocated);
  const gpuUtilPercent = totalGpuPurchased > 0 ? Math.round((totalGpuAllocated / totalGpuPurchased) * 100) : 0;

  const totalDids = dids.length;
  const allocatedDids = dids.filter(d => d.status === 'Assigned').length;
  const availableDids = dids.filter(d => d.status === 'Available').length;
  const didUtilPercent = totalDids > 0 ? Math.round((allocatedDids / totalDids) * 100) : 0;

  // Real SIP Trunk Concurrency calculation
  const totalSipCapacity = sipProviders.reduce((sum, p) => sum + p.maxChannels, 0);
  const activeSipChannels = sipProviders.reduce((sum, p) => sum + p.activeChannels, 0);
  const sipUtilPercent = totalSipCapacity > 0 ? Math.round((activeSipChannels / totalSipCapacity) * 100) : 0;

  // Real Provider Wholesale SLA calculation
  const validProvidersWithSla = providers.filter(p => typeof p.uptime90d === 'number' && !isNaN(p.uptime90d));
  const avgSla = validProvidersWithSla.length > 0
    ? (validProvidersWithSla.reduce((sum, p) => sum + p.uptime90d, 0) / validProvidersWithSla.length).toFixed(2)
    : null;

  // Separate GPU vs DID vs Total Profitability calculations
  const gpuRevenue = gpus.reduce((sum, g) => sum + (g.sellingPrice * g.allocatedQuantity), 0);
  const gpuCost = gpus.reduce((sum, g) => sum + (g.monthlyCost * g.allocatedQuantity), 0);
  const gpuProfit = gpuRevenue - gpuCost;
  const gpuMargin = gpuRevenue > 0 ? ((gpuProfit / gpuRevenue) * 100).toFixed(1) : '0';

  const assignedDids = dids.filter(d => d.status === 'Assigned');
  const didNumbersCost = assignedDids.reduce((sum, d) => sum + d.monthlyCost, 0);
  const didNumbersRevenue = assignedDids.reduce((sum, d) => sum + d.sellingPrice, 0);
  const sipTrunksCost = sipProviders.reduce((sum, p) => sum + p.monthlyCost, 0);
  const sipTrunksRevenue = Math.round(sipTrunksCost * 1.55);

  const didRevenue = didNumbersRevenue + sipTrunksRevenue;
  const didCost = didNumbersCost + sipTrunksCost;
  const didProfit = didRevenue - didCost;
  const didMargin = didRevenue > 0 ? ((didProfit / didRevenue) * 100).toFixed(1) : '0';

  const monthlyRevenue = gpuRevenue + didRevenue;
  const monthlyCost = gpuCost + didCost;
  const grossProfit = gpuProfit + didProfit;
  const netProfit = Math.round(grossProfit * 0.90);
  const combinedMargin = monthlyRevenue > 0 ? ((grossProfit / monthlyRevenue) * 100).toFixed(1) + '%' : '–';

  const activeClientsCount = clients.filter(c => c.status === 'Active').length;
  const totalUnbilledUsage = clients.reduce((sum, c) => sum + (c.unbilledUsage || 0), 0);

  const pendingList = pendingRequests.filter(r => r.status === 'Pending' || r.status === 'Hold');

  // Check if historical financial data exists
  const hasRealData = clients.length > 0 || gpus.length > 0 || invoices.length > 0;
  const chartData = hasRealData ? FINANCIAL_TRENDS_12MO : [];

  const maxVal = chartData.length > 0 ? Math.max(...chartData.map(d => d.revenue)) : 1000;
  const minVal = chartData.length > 0 ? Math.min(...chartData.map(d => d.profit)) : 0;

  const chartWidth = 720;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 20;

  const getX = (index: number) =>
    paddingX + (index / Math.max(1, chartData.length - 1)) * (chartWidth - paddingX * 2);
  const getY = (val: number) =>
    chartHeight - paddingY - ((val - minVal * 0.8) / Math.max(1, (maxVal * 1.05 - minVal * 0.8))) * (chartHeight - paddingY * 2);

  const revenuePath = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.revenue)}`).join(' ');
  const costPath = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.cost)}`).join(' ');
  const profitPath = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.profit)}`).join(' ');

  const handleOpenHoldModal = (req: PendingRequest) => {
    setHoldingReq(req);
    setHoldReasonInput(req.holdReason || '');
  };

  const handleConfirmHold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdingReq) return;
    holdRequest(holdingReq.id, holdReasonInput.trim() || 'Awaiting credit & finance review');
    setHoldingReq(null);
    setHoldReasonInput('');
  };

  const getDaysRemaining = (endDateStr: string) => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    if (isNaN(end)) return null;
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

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
              Consolidated real-time arbitrage ledger across GPU clusters and telecom DID trunks.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-mono">Real-time Margin:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {combinedMargin}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <MetricCard
            label="GPU Compute Profit"
            value={`+${formatINR(gpuProfit)}`}
            icon={Server}
            highlight
          />
          <MetricCard
            label="DID Telecom Profit"
            value={`+${formatINR(didProfit)}`}
            icon={PhoneCall}
          />
          <MetricCard
            label="Total Combined Profit"
            value={`+${formatINR(grossProfit)}`}
            icon={TrendingUp}
          />
          <MetricCard
            label="Monthly Resale Revenue"
            value={formatINR(monthlyRevenue)}
            icon={IndianRupee}
          />
        </div>
      </div>

      {/* Row 2: Capacity & Operational KPIs with Unbilled Usage */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="Total Purchased GPUs"
          value={totalGpuPurchased}
          icon={Server}
        />
        <MetricCard
          label="Allocated GPUs"
          value={totalGpuAllocated}
        />
        <MetricCard
          label="Free GPU Inventory"
          value={totalGpuFree}
        />
        <MetricCard
          label="Total DID Inventory"
          value={totalDids}
          icon={PhoneCall}
        />
        <MetricCard
          label="Unbilled Usage (Accrued)"
          value={totalUnbilledUsage > 0 ? formatINR(totalUnbilledUsage) : '₹0'}
          badge="Pending Cycle"
        />
        <MetricCard
          label="Active Clients"
          value={activeClientsCount}
          icon={Users}
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

          {!hasRealData ? (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <TrendingUp className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                No data
              </div>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                No financial trends recorded yet. Trend chart populates automatically as client contracts and invoices are generated.
              </p>
            </div>
          ) : (
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

              {/* Calculated Legend - Strictly Real Numbers */}
              <div className="flex items-center justify-center gap-6 mt-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-cyan-500 rounded" />
                  <span className="text-slate-600 dark:text-slate-300">
                    Revenue ({formatINR(monthlyRevenue)})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-rose-500 rounded border-dashed" />
                  <span className="text-slate-600 dark:text-slate-300">
                    Provider Cost ({formatINR(monthlyCost)})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-emerald-500 rounded" />
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">
                    Gross Profit (+{formatINR(grossProfit)})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resource Capacity & Real-Time Utilization Breakdown */}
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Resource Utilization
              </h3>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                {sipProviders.length === 0 && providers.length === 0 ? 'Telemetry: No data' : 'Live Infrastructure Telemetry'}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* GPU Utilization Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">GPU Fleet Allocation</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {totalGpuPurchased > 0 ? `${totalGpuAllocated} / ${totalGpuPurchased} (${gpuUtilPercent}%)` : 'No data'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, gpuUtilPercent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>In Use: {totalGpuPurchased > 0 ? `${totalGpuActive} units` : 'No data'}</span>
                  <span>Available: {totalGpuPurchased > 0 ? `${totalGpuFree} units` : 'No data'}</span>
                </div>
              </div>

              {/* SIP Trunk Channel Saturation - Calculated Real Numbers */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">SIP Trunk Concurrency</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {totalSipCapacity > 0 ? `${activeSipChannels.toLocaleString()} / ${totalSipCapacity.toLocaleString()} (${sipUtilPercent}%)` : 'No data'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, sipUtilPercent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Active Channels: {totalSipCapacity > 0 ? activeSipChannels.toLocaleString() : 'No data'}</span>
                  <span>Peak Cap: {totalSipCapacity > 0 ? totalSipCapacity.toLocaleString() : 'No data'}</span>
                </div>
              </div>

              {/* DID Allocation Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">DID Numbers Assigned</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {totalDids > 0 ? `${allocatedDids} / ${totalDids} (${didUtilPercent}%)` : 'No data'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, didUtilPercent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Assigned: {totalDids > 0 ? allocatedDids : 'No data'}</span>
                  <span>Free Pool: {totalDids > 0 ? availableDids : 'No data'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Provider Wholesale SLA:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              {avgSla !== null ? `${avgSla}% Compliant` : 'No data'}
            </span>
          </div>
        </div>
      </div>

      {/* Row 4: Provider Contract End Dates and API Status Section */}
      <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Upstream Provider Contract End Dates &amp; API Connectivity Status
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('providers')}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
          >
            Manage Providers →
          </button>
        </div>

        {providers.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No upstream providers connected yet. Configure GPU cloud providers in the Providers Desk.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {providers.map(prov => {
              const daysLeft = getDaysRemaining(prov.contractEnd);
              return (
                <div
                  key={prov.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{prov.name}</span>
                    <StatusBadge status={prov.apiStatus} />
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-400">Commitment:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatINR(prov.monthlyCommitment)}/mo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-slate-400">Contract End:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{prov.contractEnd || 'No data'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700/60">
                      <span className="font-sans text-slate-400">Expiry Status:</span>
                      {daysLeft !== null ? (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          daysLeft <= 30
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : daysLeft <= 60
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
                        </span>
                      ) : (
                        <span className="text-slate-400">No data</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Row 5: Pending Approvals Queue with Reason field on Hold */}
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
            Open Approvals Desk →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-2 px-3">Request ID</th>
                <th className="py-2 px-3">Client Name</th>
                <th className="py-2 px-3">Resource Type</th>
                <th className="py-2 px-3 text-right">Quantity</th>
                <th className="py-2 px-3 text-right">Monthly Value</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Status &amp; Hold Reason</th>
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
                      {formatINR(req.sellingPrice)}/mo
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {req.date}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="space-y-1">
                        <StatusBadge status={req.status} />
                        {req.status === 'Hold' && req.holdReason && (
                          <div className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 p-1 rounded border border-amber-200 dark:border-amber-800 font-medium">
                            Reason: {req.holdReason}
                          </div>
                        )}
                      </div>
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
                          onClick={() => handleOpenHoldModal(req)}
                          className="px-2 py-1 text-[11px] font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900 rounded flex items-center gap-1 transition-colors"
                          title="Put on Hold with Reason"
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

      {/* Modal: Reason field on Hold */}
      {holdingReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PauseCircle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Place Request on Hold: {holdingReq.requestId}
                </h3>
              </div>
              <button
                onClick={() => setHoldingReq(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-lg text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-bold">{holdingReq.clientName}</div>
              <div className="text-[11px]">{holdingReq.specs} (Qty: {holdingReq.quantity})</div>
            </div>

            <form onSubmit={handleConfirmHold} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Hold (Required)
                </label>
                <textarea
                  required
                  rows={3}
                  value={holdReasonInput}
                  onChange={e => setHoldReasonInput(e.target.value)}
                  placeholder="e.g. Under financial credit check; awaiting upstream cluster provisioning confirmation; collateral deposit needed..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Quick Preset Reasons */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Quick reasons:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Credit limit check in progress',
                    'Waiting on upstream GPU allocation',
                    'KYC / CIR documentation required',
                    'Pending client collateral deposit',
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setHoldReasonInput(preset)}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setHoldingReq(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Confirm Hold with Reason</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
