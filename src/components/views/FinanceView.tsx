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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { formatINR } from '../../data/mockData';

export const FinanceView: React.FC = () => {
  const { clients, providers, gpus, sipProviders, dids } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'costs' | 'revenue' | 'per-unit' | 'simulator'>('overview');

  // Interactive Profit Simulator state (INR)
  const [simVolumeGpu, setSimVolumeGpu] = useState(64);
  const [simBuyPrice, setSimBuyPrice] = useState(175000);
  const [simSellPrice, setSimSellPrice] = useState(260000);
  const [simVoiceVolume, setSimVoiceVolume] = useState(1500);

  // Financial aggregates
  const totalRevenue = clients.reduce((sum, c) => sum + c.monthlySpend, 0);
  const totalCost = clients.reduce((sum, c) => sum + c.monthlyCost, 0);
  const grossProfit = totalRevenue - totalCost;
  const grossMarginPercent = ((grossProfit / totalRevenue) * 100).toFixed(1);

  // GPU vs SIP vs DID revenue breakdown
  const gpuRevenue = gpus.reduce((sum, g) => sum + (g.sellingPrice * g.allocatedQuantity), 0);
  const gpuCost = gpus.reduce((sum, g) => sum + (g.monthlyCost * g.allocatedQuantity), 0);
  const gpuProfit = gpuRevenue - gpuCost;

  const sipCost = sipProviders.reduce((sum, p) => sum + p.monthlyCost, 0);
  const sipRevenue = Math.round(sipCost * 1.55); // Resale markup on channels
  const sipProfit = sipRevenue - sipCost;

  const didCost = dids.filter(d => d.status === 'Assigned').reduce((sum, d) => sum + d.monthlyCost, 0);
  const didRevenue = dids.filter(d => d.status === 'Assigned').reduce((sum, d) => sum + d.sellingPrice, 0);
  const didProfit = didRevenue - didCost;

  // Breakdown by Provider
  const providerCostBreakdown = providers.map(p => ({
    name: p.name,
    type: p.providerType,
    cost: p.monthlyCommitment,
    share: ((p.monthlyCommitment / totalCost) * 100).toFixed(1),
  }));

  // Breakdown by GPU Model
  const gpuModelCostMap = gpus.reduce((acc, g) => {
    const key = g.gpuModel;
    if (!acc[key]) acc[key] = { cost: 0, revenue: 0, units: 0 };
    acc[key].cost += g.monthlyCost * g.quantity;
    acc[key].revenue += g.sellingPrice * g.allocatedQuantity;
    acc[key].units += g.quantity;
    return acc;
  }, {} as Record<string, { cost: number; revenue: number; units: number }>);

  // Breakdown by Region
  const regionCostMap = gpus.reduce((acc, g) => {
    const key = g.region.split(' ')[0];
    if (!acc[key]) acc[key] = 0;
    acc[key] += g.monthlyCost * g.quantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Finance, Arbitrage &amp; Profitability Engine
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Executive ledger analyzing wholesale spread between supplier commitments and client billings.
        </p>
      </div>

      {/* Primary Mathematical Profitability Formula Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 shadow-lg text-white">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Consolidated Monthly Financial Equation
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm sm:text-base">
            <div>
              <div className="text-[10px] text-slate-400 font-sans">TOTAL CLIENT REVENUE</div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400 tabular-nums">
                {formatINR(totalRevenue)}
              </div>
            </div>

            <span className="text-2xl text-slate-500 font-light">—</span>

            <div>
              <div className="text-[10px] text-slate-400 font-sans">WHOLESALE PROVIDER COST</div>
              <div className="text-xl sm:text-2xl font-bold text-rose-400 tabular-nums">
                {formatINR(totalCost)}
              </div>
            </div>

            <span className="text-2xl text-slate-500 font-light">=</span>

            <div>
              <div className="text-[10px] text-slate-400 font-sans">GROSS RESALE PROFIT</div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">
                {formatINR(grossProfit)}
              </div>
            </div>
          </div>

          <div className="px-4 py-2 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-right">
            <div className="text-[10px] text-emerald-300 font-sans">CONSOLIDATED MARGIN</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">
              {grossMarginPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Categorical Profit' },
          { id: 'costs', label: 'Wholesale Cost Breakdown' },
          { id: 'revenue', label: 'Client Revenue Breakdown' },
          { id: 'per-unit', label: 'Per-Client & Per-Unit Economics' },
          { id: 'simulator', label: 'Interactive Margin Simulator' },
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

      {/* Tab 1: Overview & Categorical Profit */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* GPU Category */}
            <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs">
                  <Server className="w-4 h-4 text-cyan-500" />
                  <span>GPU Compute Wholesale</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {((gpuProfit / gpuRevenue) * 100).toFixed(1)}% Margin
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                   <span className="text-slate-400 font-sans">Monthly Revenue:</span>
                   <span className="font-semibold text-slate-900 dark:text-slate-100">{formatINR(gpuRevenue)}</span>
                 </div>
                 <div className="flex justify-between text-rose-500">
                   <span className="text-slate-400 font-sans">Provider Wholesale:</span>
                   <span>-{formatINR(gpuCost)}</span>
                 </div>
                 <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
                   <span className="font-sans">Monthly Gross Profit:</span>
                   <span>+{formatINR(gpuProfit)}</span>
                 </div>
               </div>
             </div>

             {/* SIP Trunks Category */}
             <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
               <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                 <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs">
                   <PhoneCall className="w-4 h-4 text-indigo-500" />
                   <span>SIP Voice Trunks</span>
                 </div>
                 <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                   {((sipProfit / sipRevenue) * 100).toFixed(1)}% Margin
                 </span>
               </div>
               <div className="space-y-1.5 text-xs font-mono">
                 <div className="flex justify-between">
                   <span className="text-slate-400 font-sans">Monthly Revenue:</span>
                   <span className="font-semibold text-slate-900 dark:text-slate-100">{formatINR(sipRevenue)}</span>
                 </div>
                 <div className="flex justify-between text-rose-500">
                   <span className="text-slate-400 font-sans">Carrier Wholesale:</span>
                   <span>-{formatINR(sipCost)}</span>
                 </div>
                 <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
                   <span className="font-sans">Monthly Gross Profit:</span>
                   <span>+{formatINR(sipProfit)}</span>
                 </div>
               </div>
             </div>

             {/* DID Numbers Category */}
             <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
               <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                 <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs">
                   <PhoneCall className="w-4 h-4 text-emerald-500" />
                   <span>DID Phone Numbers</span>
                 </div>
                 <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                   {didRevenue > 0 ? ((didProfit / didRevenue) * 100).toFixed(1) : 0}% Margin
                 </span>
               </div>
               <div className="space-y-1.5 text-xs font-mono">
                 <div className="flex justify-between">
                   <span className="text-slate-400 font-sans">Monthly Revenue:</span>
                   <span className="font-semibold text-slate-900 dark:text-slate-100">{formatINR(didRevenue)}</span>
                 </div>
                 <div className="flex justify-between text-rose-500">
                   <span className="text-slate-400 font-sans">Carrier Wholesale:</span>
                   <span>-{formatINR(didCost)}</span>
                 </div>
                 <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
                   <span className="font-sans">Monthly Gross Profit:</span>
                   <span>+{formatINR(didProfit)}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Wholesale Cost Breakdown */}
      {activeTab === 'costs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Provider */}
            <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-3">
                Provider Cost Breakdown
              </h3>
              <div className="space-y-3 text-xs">
                {providerCostBreakdown.map(p => (
                  <div key={p.name} className="space-y-1">
                    <div className="flex justify-between text-slate-700 dark:text-slate-200">
                      <span className="font-medium">{p.name}</span>
                      <span className="font-mono tabular-nums font-semibold">{formatINR(p.cost)} ({p.share}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${p.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By GPU Type & Region */}
            <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2">
                  Cost Breakdown By GPU Architecture
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  {Object.entries(gpuModelCostMap).map(([model, data]) => (
                    <div key={model} className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded flex justify-between">
                      <span className="text-slate-800 dark:text-slate-200">{model}</span>
                      <span className="tabular-nums font-semibold">{formatINR(data.cost)}/mo ({data.units} units)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2">
                  Cost Breakdown By Datacenter Region
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(regionCostMap).map(([region, cost]) => (
                    <div key={region} className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">{region}</span>
                      <span className="font-semibold tabular-nums">{formatINR(cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Client Revenue Breakdown */}
      {activeTab === 'revenue' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Total Client Revenue Breakdown (GPU vs SIP vs DID)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2 px-3">Client Company</th>
                  <th className="py-2 px-3 text-right">GPU Revenue</th>
                  <th className="py-2 px-3 text-right">SIP Revenue</th>
                  <th className="py-2 px-3 text-right">DID Revenue</th>
                  <th className="py-2 px-3 text-right">Total Billing</th>
                  <th className="py-2 px-3 text-right">Upstream Cost</th>
                  <th className="py-2 px-3 text-right">Gross Profit</th>
                  <th className="py-2 px-3 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {clients.map(c => {
                  const profit = c.monthlySpend - c.monthlyCost;
                  const margin = ((profit / c.monthlySpend) * 100).toFixed(1);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        {c.companyName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {formatINR(c.monthlySpend * 0.88)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {formatINR(c.monthlySpend * 0.10)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {formatINR(c.monthlySpend * 0.02)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                        {formatINR(c.monthlySpend)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-500">
                        -{formatINR(c.monthlyCost)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
                        +{formatINR(profit)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-cyan-600 dark:text-cyan-400 font-semibold">
                        {margin}%
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Per GPU Model Spread */}
          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-3">
              Per GPU Model Unit Arbitrage
            </h3>
            <div className="space-y-3 text-xs">
              {gpus.map(g => {
                const spreadPerUnit = g.sellingPrice - g.monthlyCost;
                return (
                  <div
                    key={g.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px]"
                  >
                    <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                      <span>{g.gpuModel}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">+{g.marginPercent.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Buy: {formatINR(g.monthlyCost)}/mo · Sell: {formatINR(g.sellingPrice)}/mo</span>
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400">Spread: +{formatINR(spreadPerUnit)}/unit</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Per Provider Profit Contribution */}
          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-3">
              Per Provider Wholesale Margin Spread
            </h3>
            <div className="space-y-3 text-xs">
              {providers.map(p => {
                const estimatedResale = Math.round(p.monthlyCommitment * 1.52);
                const spread = estimatedResale - p.monthlyCommitment;
                return (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px]"
                  >
                    <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                      <span>{p.name}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{formatINR(spread)}/mo</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Wholesale Commitment: {formatINR(p.monthlyCommitment)}</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">34.2% Avg Margin</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Interactive Margin Simulator */}
      {activeTab === 'simulator' && (
        <div className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-500" />
              Wholesale Arbitrage &amp; Margin Simulator
            </h3>
            <p className="text-xs text-slate-500">
              Model volume-purchase discounts and resale markups for prospective client clusters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  GPU Cluster Size: <strong className="font-mono text-cyan-600">{simVolumeGpu} Nodes</strong>
                </label>
                <input
                  type="range"
                  min="8"
                  max="256"
                  step="8"
                  value={simVolumeGpu}
                  onChange={e => setSimVolumeGpu(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Wholesale Provider Cost: <strong className="font-mono text-rose-500">{formatINR(simBuyPrice)}/node/mo</strong>
                </label>
                <input
                  type="range"
                  min="80000"
                  max="400000"
                  step="5000"
                  value={simBuyPrice}
                  onChange={e => setSimBuyPrice(parseInt(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Client Resale Price: <strong className="font-mono text-emerald-500">{formatINR(simSellPrice)}/node/mo</strong>
                </label>
                <input
                  type="range"
                  min="120000"
                  max="550000"
                  step="5000"
                  value={simSellPrice}
                  onChange={e => setSimSellPrice(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            <div className="md:col-span-2 p-5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between font-mono text-xs">
              <div className="space-y-3">
                <div className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                  Simulation Projected P&amp;L Output
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-sans text-slate-600 dark:text-slate-300">Total Monthly Client Billing:</span>
                  <span className="text-base font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                    {formatINR(simVolumeGpu * simSellPrice)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700 text-rose-500">
                  <span className="font-sans text-slate-600 dark:text-slate-300">Total Upstream Provider Cost:</span>
                  <span className="text-base font-bold tabular-nums">
                    -{formatINR(simVolumeGpu * simBuyPrice)}
                  </span>
                </div>

                <div className="flex justify-between py-1 font-bold text-base text-emerald-600 dark:text-emerald-400">
                  <span className="font-sans">Gross Reseller Spread:</span>
                  <span className="tabular-nums">
                    +{formatINR(simVolumeGpu * (simSellPrice - simBuyPrice))}/month
                  </span>
                </div>

                <div className="flex justify-between py-1 text-slate-900 dark:text-slate-100 font-semibold">
                  <span className="font-sans">Annualized Contract Gross Profit:</span>
                  <span className="tabular-nums">
                    {formatINR(simVolumeGpu * (simSellPrice - simBuyPrice) * 12)} / year
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-sans text-slate-500 text-[11px]">Gross Profit Margin:</span>
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {simSellPrice > 0 ? (((simSellPrice - simBuyPrice) / simSellPrice) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
