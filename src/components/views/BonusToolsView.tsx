import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Calculator,
  Sliders,
  Scale,
  Award,
  Zap,
  Calendar,
  Layers,
  ArrowRight,
  Server,
  PhoneCall,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { formatINR } from '../../data/mockData';

export const BonusToolsView: React.FC = () => {
  const { gpus, sipProviders, clients, createInvoice } = useApp();

  const [activeTab, setActiveTab] = useState<'forecast' | 'margin-calc' | 'comparison' | 'commission'>('forecast');
  const [autoInvoiceGenerated, setAutoInvoiceGenerated] = useState(false);

  // Margin Calculator State (INR)
  const [calcCost, setCalcCost] = useState(175000);
  const [calcMarkup, setCalcMarkup] = useState(48); // %
  const [calcUnits, setCalcUnits] = useState(32);
  const [calcOverhead, setCalcOverhead] = useState(12000); // ₹/node for cross-connect & cooling

  // Demand Forecast Horizon
  const [forecastMonths, setForecastMonths] = useState<3 | 6>(6);

  // Commission Tracking State (INR)
  const salesReps = [
    { name: 'Chloe Zhang', role: 'Enterprise Sales Lead', quotaMonthly: 1500000, closedWon: 1720000, commissionRate: 6.5 },
    { name: 'Marcus Brody (Partner)', role: 'Telecom Channel Rep', quotaMonthly: 500000, closedWon: 540000, commissionRate: 5.0 },
    { name: 'David Sterling', role: 'Growth Account Exec', quotaMonthly: 1000000, closedWon: 1090000, commissionRate: 6.0 },
  ];

  // Calculated values for Margin Calculator
  const calculatedSellPrice = Math.round(calcCost * (1 + calcMarkup / 100));
  const totalCostPerUnit = calcCost + calcOverhead;
  const netProfitPerUnit = calculatedSellPrice - totalCostPerUnit;
  const netMarginPercent = Math.round((netProfitPerUnit / calculatedSellPrice) * 100);
  const monthlyTotalNetProfit = netProfitPerUnit * calcUnits;
  const annualizedProfit = monthlyTotalNetProfit * 12;

  // Provider Comparison Matrix
  const providerComparisons = [
    {
      provider: 'E2E Networks',
      gpuModel: 'H100 SXM5 80GB',
      wholesaleHourly: '₹245 / hr',
      wholesaleMonthly: '₹1,75,000 / mo',
      interconnect: 'NVLink 900 GB/s',
      networkBandwidth: '3.2 Tbps',
      apiProvisionLatency: '45 seconds',
      brokerMargin: '32.8%',
      reliabilityScore: '99.98%',
    },
    {
      provider: 'Yotta D1 NM1',
      gpuModel: 'H100 SXM5 80GB',
      wholesaleHourly: '₹252 / hr',
      wholesaleMonthly: '₹1,80,000 / mo',
      interconnect: 'Infiniband NDR 400G',
      networkBandwidth: '3.2 Tbps',
      apiProvisionLatency: '30 seconds',
      brokerMargin: '34.3%',
      reliabilityScore: '99.99%',
    },
    {
      provider: 'CtrlS Datacenters',
      gpuModel: 'A100 SXM4 80GB',
      wholesaleHourly: '₹125 / hr',
      wholesaleMonthly: '₹90,000 / mo',
      interconnect: 'NVLink 600 GB/s',
      networkBandwidth: '1.6 Tbps',
      apiProvisionLatency: '60 seconds',
      brokerMargin: '37.1%',
      reliabilityScore: '99.94%',
    },
    {
      provider: 'Tata Communications',
      gpuModel: 'L40S 48GB Ada',
      wholesaleHourly: '₹72 / hr',
      wholesaleMonthly: '₹52,000 / mo',
      interconnect: 'PCIe 4.0 x16',
      networkBandwidth: '100 Gbps',
      apiProvisionLatency: '90 seconds',
      brokerMargin: '36.7%',
      reliabilityScore: '99.89%',
    },
  ];

  const handleTriggerAutoBilling = () => {
    // Generate draft invoices for all active clients
    clients.forEach(c => {
      if (c.monthlySpend > 0) {
        createInvoice({
          clientId: c.id,
          clientName: c.companyName,
          clientEmail: c.email,
          billingPeriod: 'December 01, 2026 – December 31, 2026',
          gpuCount: c.allocatedGpuCount,
          gpuCharges: Math.round(c.monthlySpend * 0.88),
          sipCount: c.allocatedSipCount,
          sipCharges: Math.round(c.monthlySpend * 0.10),
          didCount: c.allocatedDidCount,
          didCharges: Math.round(c.monthlySpend * 0.02),
        });
      }
    });
    setAutoInvoiceGenerated(true);
    setTimeout(() => setAutoInvoiceGenerated(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            Wholesale Intelligence, Demand Forecasting &amp; Calculators
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Advanced capacity simulators, provider arbitrage comparisons, auto-billing, and sales commissions.
          </p>
        </div>
        <button
          onClick={handleTriggerAutoBilling}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Run Auto-Monthly Invoicing</span>
        </button>
      </div>

      {autoInvoiceGenerated && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Automated monthly recurring invoices generated for all active enterprise client accounts!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'forecast', label: 'Capacity & Demand Forecasting' },
          { id: 'margin-calc', label: 'Wholesale Margin Calculator' },
          { id: 'comparison', label: 'Provider Benchmark Comparison' },
          { id: 'commission', label: 'Sales Commission Tracking' },
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

      {/* Tab 1: Demand & Capacity Forecasting */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GPU Demand Projection */}
            <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-500" />
                  GPU Compute Demand Projection
                </h3>
                <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">+22.4% MoM Demand</span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { month: 'Nov 2026 (M+1)', projected: 248, current: 214, status: 'Safe Surplus (+32)' },
                  { month: 'Dec 2026 (M+2)', projected: 284, current: 280, status: 'Tight (+4 buffer)' },
                  { month: 'Jan 2027 (M+3)', projected: 330, current: 280, status: 'Deficit Alert (-50 Units)' },
                  { month: 'Feb 2027 (M+4)', projected: 380, current: 280, status: 'Procurement Required' },
                ].map((row, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800 flex justify-between items-center font-mono">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{row.month}</div>
                      <div className="text-[10px] text-slate-400">Demand: {row.projected} H100/A100 Nodes</div>
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        row.status.includes('Deficit') || row.status.includes('Procurement')
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SIP & DID Demand Projection */}
            <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-indigo-500" />
                  Telecom SIP Channel &amp; DID Pool Forecast
                </h3>
                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">+18% Surge</span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { month: 'Nov 2026 (M+1)', projectedDids: 1040, capacity: 1240, status: 'Healthy Buffer (+200)' },
                  { month: 'Dec 2026 (M+2)', projectedDids: 1180, capacity: 1240, status: 'Buffer Low (+60)' },
                  { month: 'Jan 2027 (M+3)', projectedDids: 1390, capacity: 1240, status: 'Pool Exhaustion (-150 DIDs)' },
                  { month: 'Feb 2027 (M+4)', projectedDids: 1600, capacity: 1240, status: 'Telnyx Order Required' },
                ].map((row, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800 flex justify-between items-center font-mono">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{row.month}</div>
                      <div className="text-[10px] text-slate-400">Demand: {row.projectedDids} DIDs</div>
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        row.status.includes('Exhaustion') || row.status.includes('Order')
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Wholesale Margin Calculator */}
      {activeTab === 'margin-calc' && (
        <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-500" />
              Interactive Wholesale Arbitrage &amp; Margin Calculator
            </h3>
            <p className="text-xs text-slate-500">
              Calculate unit economics, cooling/cross-connect overhead, and net spread before issuing quotes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Provider Wholesale Cost: <strong className="font-mono">${calcCost}/node/mo</strong>
                </label>
                <input
                  type="range"
                  min="500"
                  max="4000"
                  step="50"
                  value={calcCost}
                  onChange={e => setCalcCost(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Resale Markup Target: <strong className="font-mono text-emerald-600">+{calcMarkup}%</strong>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={calcMarkup}
                  onChange={e => setCalcMarkup(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Cluster Quantity: <strong className="font-mono">{calcUnits} Nodes</strong>
                </label>
                <input
                  type="range"
                  min="4"
                  max="128"
                  step="4"
                  value={calcUnits}
                  onChange={e => setCalcUnits(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Datacenter Cross-Connect Overhead: <strong className="font-mono">${calcOverhead}/node/mo</strong>
                </label>
                <input
                  type="range"
                  min="50"
                  max="400"
                  step="25"
                  value={calcOverhead}
                  onChange={e => setCalcOverhead(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="p-5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 font-mono text-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                  Unit &amp; Portfolio Financial Summary
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-sans text-slate-600 dark:text-slate-300">Quote Selling Price to Client:</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatINR(calculatedSellPrice)}/node/mo
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-sans text-slate-600 dark:text-slate-300">All-in Reseller Cost:</span>
                  <span className="tabular-nums text-rose-500 font-semibold">
                    {formatINR(totalCostPerUnit)}/node/mo
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-sans text-slate-600 dark:text-slate-300">Net Profit Spread per Node:</span>
                  <span className="text-base font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                    +{formatINR(netProfitPerUnit)}/month
                  </span>
                </div>

                <div className="flex justify-between py-1 font-bold text-base text-slate-900 dark:text-slate-100">
                  <span className="font-sans">Monthly Deal Gross Profit:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{formatINR(monthlyTotalNetProfit)} / mo
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-sans text-slate-500 text-[11px]">Net Margin %:</span>
                <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
                  {netMarginPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Provider Benchmark Comparison */}
      {activeTab === 'comparison' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Wholesale Provider Benchmark &amp; Arbitrage Matrix
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">GPU Architecture</th>
                  <th className="py-2.5 px-3 text-right">Wholesale Rate</th>
                  <th className="py-2.5 px-3">Interconnect</th>
                  <th className="py-2.5 px-3">Fabric Bandwidth</th>
                  <th className="py-2.5 px-3">API Provisioning</th>
                  <th className="py-2.5 px-3 text-right">Reseller Margin</th>
                  <th className="py-2.5 px-3 text-right">Uptime SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {providerComparisons.map(p => (
                  <tr key={p.provider} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {p.provider}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">
                      {p.gpuModel}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      <div>{p.wholesaleMonthly}</div>
                      <div className="text-[10px] text-slate-400">({p.wholesaleHourly})</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {p.interconnect}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {p.networkBandwidth}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {p.apiProvisionLatency}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                      {p.brokerMargin}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-cyan-600 dark:text-cyan-400 font-semibold">
                      {p.reliabilityScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Sales Commission Tracking */}
      {activeTab === 'commission' && (
        <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Account Executive Quota &amp; Commission Payouts
            </h3>
            <p className="text-xs text-slate-500">
              Incentive compensation calculated on closed gross wholesale spread.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {salesReps.map(rep => {
              const attainment = Math.round((rep.closedWon / rep.quotaMonthly) * 100);
              const payout = Math.round(rep.closedWon * (rep.commissionRate / 100));
              return (
                <div
                  key={rep.name}
                  className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 font-mono text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 font-sans text-sm mb-0.5">
                      {rep.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans mb-3">{rep.role}</div>

                    <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between">
                        <span>Monthly Quota:</span>
                        <span>{formatINR(rep.quotaMonthly)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
                        <span>Closed Deal Volume:</span>
                        <span>{formatINR(rep.closedWon)}</span>
                      </div>
                      <div className="flex justify-between text-cyan-600 dark:text-cyan-400 font-semibold">
                        <span>Quota Attainment:</span>
                        <span>{attainment}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex justify-between items-center">
                    <span className="font-sans text-slate-500">Commission Payout:</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {formatINR(payout)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
