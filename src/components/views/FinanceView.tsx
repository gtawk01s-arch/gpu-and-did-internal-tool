import React, { useState } from 'react';
import {
  TrendingUp,
  IndianRupee,
  PieChart,
  Layers,
  ArrowRight,
  Server,
  PhoneCall,
  Percent,
  Sliders,
  Building2,
  Users,
  CheckCircle2,
  Calculator,
  ArrowUpRight,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { formatINR } from '../../data/mockData';

export const FinanceView: React.FC = () => {
  const { clients, providers, gpus, sipProviders, dids } = useApp();

  const [activeTab, setActiveTab] = useState<'separate-profit' | 'costs' | 'revenue' | 'per-unit' | 'simulator'>('separate-profit');

  // Interactive Profit Simulator state (INR)
  const [simVolumeGpu, setSimVolumeGpu] = useState(64);
  const [simBuyPrice, setSimBuyPrice] = useState(175000);
  const [simSellPrice, setSimSellPrice] = useState(260000);
  const [simVoiceVolume, setSimVoiceVolume] = useState(1500);

  // -------------------------------------------------------------
  // 1. SEPARATE GPU PROFITABILITY CALCULATION
  // -------------------------------------------------------------
  const gpuRevenue = gpus.reduce((sum, g) => sum + (g.sellingPrice * g.allocatedQuantity), 0);
  const gpuCost = gpus.reduce((sum, g) => sum + (g.monthlyCost * g.allocatedQuantity), 0);
  const gpuProfit = gpuRevenue - gpuCost;
  const gpuMarginPercent = gpuRevenue > 0 ? ((gpuProfit / gpuRevenue) * 100).toFixed(1) : '0.0';
  const totalGpusAllocated = gpus.reduce((sum, g) => sum + g.allocatedQuantity, 0);

  // -------------------------------------------------------------
  // 2. SEPARATE DID & TELECOM VOICE PROFITABILITY CALCULATION
  // -------------------------------------------------------------
  const assignedDids = dids.filter(d => d.status === 'Assigned');
  const didNumbersCost = assignedDids.reduce((sum, d) => sum + d.monthlyCost, 0);
  const didNumbersRevenue = assignedDids.reduce((sum, d) => sum + d.sellingPrice, 0);

  const sipTrunksCost = sipProviders.reduce((sum, p) => sum + p.monthlyCost, 0);
  const sipTrunksRevenue = Math.round(sipTrunksCost * 1.55); // Resale markup on contracted trunks

  const totalDidCost = didNumbersCost + sipTrunksCost;
  const totalDidRevenue = didNumbersRevenue + sipTrunksRevenue;
  const didProfit = totalDidRevenue - totalDidCost;
  const didMarginPercent = totalDidRevenue > 0 ? ((didProfit / totalDidRevenue) * 100).toFixed(1) : '0.0';

  // -------------------------------------------------------------
  // 3. COMBINED TOTAL PROFITABILITY CALCULATION (GPU + DID)
  // -------------------------------------------------------------
  const totalRevenue = gpuRevenue + totalDidRevenue;
  const totalCost = gpuCost + totalDidCost;
  const totalProfit = gpuProfit + didProfit;
  const totalMarginPercent = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  // Profit Contribution Shares
  const gpuProfitContribution = totalProfit > 0 ? ((gpuProfit / totalProfit) * 100).toFixed(1) : '0.0';
  const didProfitContribution = totalProfit > 0 ? ((didProfit / totalProfit) * 100).toFixed(1) : '0.0';

  // Breakdown by Wholesale GPU Provider
  const gpuProviderCostBreakdown = providers.map(p => ({
    name: p.name,
    type: p.providerType,
    cost: p.monthlyCommitment,
    share: totalCost > 0 ? ((p.monthlyCommitment / totalCost) * 100).toFixed(1) : '0.0',
  }));

  // Breakdown by GPU Model
  const gpuModelCostMap = gpus.reduce((acc, g) => {
    const key = g.gpuModel;
    if (!acc[key]) acc[key] = { cost: 0, revenue: 0, units: 0, profit: 0 };
    const cost = g.monthlyCost * g.allocatedQuantity;
    const rev = g.sellingPrice * g.allocatedQuantity;
    acc[key].cost += cost;
    acc[key].revenue += rev;
    acc[key].units += g.allocatedQuantity;
    acc[key].profit += (rev - cost);
    return acc;
  }, {} as Record<string, { cost: number; revenue: number; units: number; profit: number }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Wholesale Profitability &amp; Arbitrage Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Independent profit calculations for GPU compute and DID telecom voice, consolidated into total net arbitrage spread.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-emerald-500" />
            <span>Dual-Stream Financial Ledger</span>
          </span>
        </div>
      </div>

      {/* 3-WAY SEPARATE PROFITABILITY CALCULATION HERO BANNER */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 shadow-xl text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold tracking-wider uppercase text-cyan-300">
              Discrete Categorical Profitability &amp; Consolidated Spread
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Formula: Net Profit = (Resale Revenue - Wholesale Cost)
          </span>
        </div>

        {/* The Three Independent Calculation Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. GPU PROFIT CALCULATION */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-cyan-300">GPU Compute Profit</h3>
                  <div className="text-[10px] text-slate-400">{totalGpusAllocated} GPU Nodes Allocated</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                {gpuMarginPercent}% Margin
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-xs pt-1 border-t border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 font-sans">GPU Revenue:</span>
                <span className="font-semibold text-cyan-400">{formatINR(gpuRevenue)}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span className="text-slate-400 font-sans">Wholesale Cost:</span>
                <span>-{formatINR(gpuCost)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold text-sm pt-1.5 border-t border-slate-800/80">
                <span className="font-sans text-xs">Net GPU Profit:</span>
                <span>+{formatINR(gpuProfit)}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono bg-slate-950/60 p-2 rounded border border-slate-800">
              Profit Share: <strong>{gpuProfitContribution}%</strong> of total earnings
            </div>
          </div>

          {/* 2. DID / TELECOM PROFIT CALCULATION */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/40 relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/50 text-indigo-400">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-indigo-300">DID Telecom Profit</h3>
                  <div className="text-[10px] text-slate-400">{assignedDids.length} DIDs + SIP Trunks</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                {didMarginPercent}% Margin
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-xs pt-1 border-t border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 font-sans">DID Revenue:</span>
                <span className="font-semibold text-indigo-400">{formatINR(totalDidRevenue)}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span className="text-slate-400 font-sans">Carrier Wholesale:</span>
                <span>-{formatINR(totalDidCost)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold text-sm pt-1.5 border-t border-slate-800/80">
                <span className="font-sans text-xs">Net DID Profit:</span>
                <span>+{formatINR(didProfit)}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono bg-slate-950/60 p-2 rounded border border-slate-800">
              Profit Share: <strong>{didProfitContribution}%</strong> of total earnings
            </div>
          </div>

          {/* 3. COMBINED TOTAL PROFIT CALCULATION */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/60 relative overflow-hidden space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-emerald-300">Total Combined Profit</h3>
                  <div className="text-[10px] text-slate-400">Consolidated Sum (GPU + DID)</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-600">
                {totalMarginPercent}% Margin
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-xs pt-1 border-t border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 font-sans">Total Revenue:</span>
                <span className="font-semibold text-cyan-300">{formatINR(totalRevenue)}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span className="text-slate-400 font-sans">Total Cost:</span>
                <span>-{formatINR(totalCost)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-extrabold text-base pt-1.5 border-t border-emerald-500/40">
                <span className="font-sans text-xs text-white">Total Net Profit:</span>
                <span className="tabular-nums">+{formatINR(totalProfit)}</span>
              </div>
            </div>

            <div className="text-[10px] text-emerald-300 font-mono bg-emerald-950/70 p-2 rounded border border-emerald-800 flex justify-between">
              <span>Arbitrage Spread:</span>
              <span className="font-bold">+{formatINR(totalProfit)} / month</span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Mathematical Formula Ledger */}
        <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
          <div className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider">
            Detailed Consolidation Proof:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-cyan-400">Step 1 (GPU Profit):</span> {formatINR(gpuRevenue)} (Rev) - {formatINR(gpuCost)} (Cost) = <strong className="text-emerald-400">{formatINR(gpuProfit)}</strong>
            </div>
            <div>
              <span className="text-indigo-400">Step 2 (DID Profit):</span> {formatINR(totalDidRevenue)} (Rev) - {formatINR(totalDidCost)} (Cost) = <strong className="text-emerald-400">{formatINR(didProfit)}</strong>
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-800/80 text-[11px] text-emerald-300">
            <span>Step 3 (Total Combined Profit): </span>
            <strong className="text-cyan-400">{formatINR(gpuProfit)}</strong> (GPU) + <strong className="text-indigo-400">{formatINR(didProfit)}</strong> (DID) = <strong className="text-emerald-400 text-xs">{formatINR(totalProfit)} Total Resale Profit</strong>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'separate-profit', label: 'Separated Profit Ledger & Comparison' },
          { id: 'costs', label: 'Wholesale Cost Breakdown' },
          { id: 'revenue', label: 'Client Revenue Breakdown' },
          { id: 'per-unit', label: 'Per-GPU & Per-DID Unit Economics' },
          { id: 'simulator', label: 'Interactive Spread Simulator' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Separated Profit Ledger & Comparison */}
      {activeTab === 'separate-profit' && (
        <div className="space-y-6">
          {/* Comparative Economics Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Comprehensive Profitability Comparison: GPU vs DID vs Combined
              </span>
              <span className="text-slate-400 text-[11px]">Updated in Real-Time (INR ₹)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                    <th className="py-3 px-4">Stream Category</th>
                    <th className="py-3 px-4 text-right">Wholesale Cost (INR ₹)</th>
                    <th className="py-3 px-4 text-right">Client Resale (INR ₹)</th>
                    <th className="py-3 px-4 text-right">Net Profit (INR ₹)</th>
                    <th className="py-3 px-4 text-right">Margin (%)</th>
                    <th className="py-3 px-4 text-right">Contribution (%)</th>
                    <th className="py-3 px-4">Primary Drivers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-2 font-sans">
                      <Server className="w-4 h-4 text-cyan-500" />
                      <span>Wholesale GPU Compute</span>
                    </td>
                    <td className="py-3 px-4 text-right text-rose-500 font-semibold">
                      {formatINR(gpuCost)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-900 dark:text-slate-100 font-semibold">
                      {formatINR(gpuRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      +{formatINR(gpuProfit)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-cyan-500">
                      {gpuMarginPercent}%
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                      {gpuProfitContribution}%
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500 text-[11px]">
                      H100 SXM5, L40S, 4090 Bare-metal clusters
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 font-sans">
                      <PhoneCall className="w-4 h-4 text-indigo-500" />
                      <span>DID &amp; Voice Telecom</span>
                    </td>
                    <td className="py-3 px-4 text-right text-rose-500 font-semibold">
                      {formatINR(totalDidCost)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-900 dark:text-slate-100 font-semibold">
                      {formatINR(totalDidRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      +{formatINR(didProfit)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-indigo-500">
                      {didMarginPercent}%
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                      {didProfitContribution}%
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500 text-[11px]">
                      Pan-India Local 022/080/011 &amp; Toll-Free 1800
                    </td>
                  </tr>

                  {/* Summary Row */}
                  <tr className="bg-slate-100/70 dark:bg-slate-800/80 font-bold">
                    <td className="py-3.5 px-4 font-sans text-slate-900 dark:text-slate-100 flex items-center gap-2 text-xs">
                      <Scale className="w-4 h-4 text-emerald-500" />
                      <span>Total Consolidated Arbitrage</span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-600 dark:text-rose-400 text-xs">
                      {formatINR(totalCost)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-cyan-600 dark:text-cyan-400 text-xs">
                      {formatINR(totalRevenue)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 text-base font-extrabold">
                      +{formatINR(totalProfit)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 text-xs">
                      {totalMarginPercent}%
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-900 dark:text-slate-100 text-xs">
                      100.0%
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-600 dark:text-slate-400 text-[11px]">
                      Consolidated Net Spread Across All Assets
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Model-by-Model GPU Arbitrage Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-500" />
              <span>GPU Compute Breakdown by Hardware Architecture</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(gpuModelCostMap).map(([model, data]) => {
                const margin = data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : '0';
                return (
                  <div key={model} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate" title={model}>
                      {model}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {data.units} Allocated Nodes
                    </div>
                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-500">
                        <span>Wholesale:</span>
                        <span>{formatINR(data.cost)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Resale:</span>
                        <span>{formatINR(data.revenue)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-500 font-bold pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span>Gross Profit:</span>
                        <span>+{formatINR(data.profit)}</span>
                      </div>
                      <div className="flex justify-between text-cyan-500 font-semibold text-[10px]">
                        <span>Spread Margin:</span>
                        <span>{margin}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Wholesale Cost Breakdown */}
      {activeTab === 'costs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By GPU Wholesale Provider */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-500" />
                <span>Wholesale GPU Cloud Supplier Commitments</span>
              </h3>
              <div className="space-y-3 text-xs">
                {gpuProviderCostBreakdown.map(p => (
                  <div key={p.name} className="space-y-1">
                    <div className="flex justify-between text-slate-700 dark:text-slate-200">
                      <span className="font-medium">{p.name}</span>
                      <span className="font-mono tabular-nums font-semibold">{formatINR(p.cost)} ({p.share}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, Number(p.share))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carrier SIP Wholesale Breakdown */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-indigo-500" />
                <span>Telecom Carrier Wholesale Commitments</span>
              </h3>
              <div className="space-y-3 text-xs">
                {sipProviders.map(p => {
                  const share = totalCost > 0 ? ((p.monthlyCost / totalCost) * 100).toFixed(1) : '0';
                  return (
                    <div key={p.id} className="space-y-1">
                      <div className="flex justify-between text-slate-700 dark:text-slate-200">
                        <span className="font-medium">{p.providerName}</span>
                        <span className="font-mono tabular-nums font-semibold">{formatINR(p.monthlyCost)} ({share}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, Number(share))}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Client Revenue Breakdown */}
      {activeTab === 'revenue' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Client Revenue &amp; Resale Arbitrage Ledger
            </span>
            <span className="text-slate-400 text-[11px]">Ordered by Monthly Billing</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Client Company</th>
                  <th className="py-2.5 px-3">Requirement</th>
                  <th className="py-2.5 px-3 text-right">Allocated GPUs</th>
                  <th className="py-2.5 px-3 text-right">Assigned DIDs</th>
                  <th className="py-2.5 px-3 text-right">Monthly Spend</th>
                  <th className="py-2.5 px-3 text-right">Wholesale Cost</th>
                  <th className="py-2.5 px-3 text-right">Monthly Profit</th>
                  <th className="py-2.5 px-3 text-right">Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {clients.map(c => {
                  const profit = c.monthlySpend - c.monthlyCost;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold font-sans text-slate-900 dark:text-slate-100">
                        {c.companyName}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-500 text-[11px]">
                        {c.resourceRequirement}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-cyan-600 dark:text-cyan-400">
                        {c.allocatedGpuCount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-indigo-600 dark:text-indigo-400">
                        {c.allocatedDidCount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                        {formatINR(c.monthlySpend)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-500">
                        {formatINR(c.monthlyCost)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatINR(profit)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {c.marginPercent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Per-Unit Economics */}
      {activeTab === 'per-unit' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-500" />
              <span>GPU Compute Per-Unit Unit Economics</span>
            </h3>
            <p className="text-slate-500 text-xs">
              Average wholesale buy price versus client resale rate per node-month.
            </p>
            <div className="space-y-2 font-mono">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex justify-between items-center">
                <span className="font-sans text-slate-500">Avg Wholesale Buy Cost / GPU:</span>
                <span className="font-bold text-rose-500">
                  {formatINR(totalGpusAllocated > 0 ? Math.round(gpuCost / totalGpusAllocated) : 0)} / mo
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex justify-between items-center">
                <span className="font-sans text-slate-500">Avg Client Resale Price / GPU:</span>
                <span className="font-bold text-cyan-400">
                  {formatINR(totalGpusAllocated > 0 ? Math.round(gpuRevenue / totalGpusAllocated) : 0)} / mo
                </span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg flex justify-between items-center text-emerald-700 dark:text-emerald-300">
                <span className="font-sans font-semibold">Net Arbitrage Spread / GPU:</span>
                <span className="font-extrabold text-sm">
                  +{formatINR(totalGpusAllocated > 0 ? Math.round(gpuProfit / totalGpusAllocated) : 0)} / mo
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-indigo-500" />
              <span>DID &amp; Voice Telecom Per-Unit Economics</span>
            </h3>
            <p className="text-slate-500 text-xs">
              Average wholesale carrier buy price versus client resale price per DID line.
            </p>
            <div className="space-y-2 font-mono">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex justify-between items-center">
                <span className="font-sans text-slate-500">Avg Carrier Buy Cost / DID:</span>
                <span className="font-bold text-rose-500">
                  {formatINR(assignedDids.length > 0 ? Math.round(didNumbersCost / assignedDids.length) : 250)} / mo
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex justify-between items-center">
                <span className="font-sans text-slate-500">Avg Client Resale Price / DID:</span>
                <span className="font-bold text-indigo-400">
                  {formatINR(assignedDids.length > 0 ? Math.round(didNumbersRevenue / assignedDids.length) : 650)} / mo
                </span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg flex justify-between items-center text-emerald-700 dark:text-emerald-300">
                <span className="font-sans font-semibold">Net Arbitrage Spread / DID:</span>
                <span className="font-extrabold text-sm">
                  +{formatINR(assignedDids.length > 0 ? Math.round((didNumbersRevenue - didNumbersCost) / assignedDids.length) : 400)} / mo
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Interactive Simulator */}
      {activeTab === 'simulator' && (
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-500" />
              <span>Interactive Arbitrage Spread Simulator</span>
            </h3>
            <p className="text-slate-500 text-xs">
              Forecast your monthly gross profit by adjusting wholesale buy rates, resale prices, and GPU volume.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                GPU Nodes Volume: <span className="text-cyan-500 font-bold">{simVolumeGpu} Nodes</span>
              </label>
              <input
                type="range"
                min="8"
                max="256"
                step="8"
                value={simVolumeGpu}
                onChange={e => setSimVolumeGpu(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                Wholesale Buy Rate / Node: <span className="text-rose-500 font-bold">{formatINR(simBuyPrice)}</span>
              </label>
              <input
                type="range"
                min="50000"
                max="350000"
                step="5000"
                value={simBuyPrice}
                onChange={e => setSimBuyPrice(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                Client Resale Rate / Node: <span className="text-emerald-500 font-bold">{formatINR(simSellPrice)}</span>
              </label>
              <input
                type="range"
                min="80000"
                max="500000"
                step="5000"
                value={simSellPrice}
                onChange={e => setSimSellPrice(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Simulated Outcomes */}
          {(() => {
            const simRev = simVolumeGpu * simSellPrice;
            const simCost = simVolumeGpu * simBuyPrice;
            const simProfit = simRev - simCost;
            const simMargin = simRev > 0 ? ((simProfit / simRev) * 100).toFixed(1) : '0';

            return (
              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono grid grid-cols-1 sm:grid-cols-4 gap-4 border border-cyan-500/30">
                <div>
                  <div className="text-[10px] text-slate-400 font-sans">Simulated Revenue</div>
                  <div className="text-base font-bold text-cyan-400">{formatINR(simRev)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans">Simulated Provider Cost</div>
                  <div className="text-base font-bold text-rose-400">{formatINR(simCost)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans">Simulated Net Profit</div>
                  <div className="text-base font-bold text-emerald-400">+{formatINR(simProfit)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans">Projected Margin</div>
                  <div className="text-base font-bold text-amber-400">{simMargin}%</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
