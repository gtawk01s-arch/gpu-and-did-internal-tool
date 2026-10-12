import React, { useState } from 'react';
import {
  Building2,
  Server,
  PhoneCall,
  Activity,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ExternalLink,
  Plus,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { Provider } from '../../types';
import { formatINR } from '../../data/mockData';

export const ProvidersView: React.FC = () => {
  const { providers, createAlert, pingProviderApi } = useApp();
  const [selectedType, setSelectedType] = useState<'All Partners' | 'GPU Cloud Providers' | 'SIP Trunks'>('All Partners');
  const [pingingId, setPingingId] = useState<string | null>(null);

  const totalCommitment = providers.reduce((sum, p) => sum + p.monthlyCommitment, 0);
  const totalGpusPurchased = providers.reduce((sum, p) => sum + (p.purchasedGpuCount || 0), 0);
  const totalDidsPurchased = providers.reduce((sum, p) => sum + (p.purchasedDidCount || 0), 0);
  const avgUptime = (
    providers.reduce((sum, p) => sum + p.uptime90d, 0) / providers.length
  ).toFixed(2);

  const filteredProviders = providers.filter(p => {
    if (selectedType === 'All Partners') return true;
    if (selectedType === 'GPU Cloud Providers') {
      return p.providerType === 'GPU Cloud Provider' || p.providerType === 'Bare-Metal Datacenter';
    }
    if (selectedType === 'SIP Trunks') {
      return p.providerType === 'Tier-1 Telecom';
    }
    return true;
  });

  const handlePing = (providerId: string) => {
    setPingingId(providerId);
    setTimeout(() => {
      pingProviderApi(providerId);
      setPingingId(null);
    }, 400);
  };

  const handleTriggerContractAlert = (provider: Provider) => {
    createAlert({
      title: `Contract Expiration Warning: ${provider.name}`,
      description: `Wholesale agreement commitment of ${formatINR(provider.monthlyCommitment)}/mo expires on ${provider.contractEnd}. Renewal or renegotiation review required.`,
      category: 'Contract Expiring',
      severity: 'High',
      targetResource: provider.name,
    });
  };

  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-500" />
            Wholesale Upstream Providers &amp; Telecom Carrier Interconnects
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor bulk GPU compute clusters purchased, contracted Indian DID trunks, contract end dates, and live carrier API status.
          </p>
        </div>
      </div>

      {/* KPI Cards (Requirement 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Total GPUs Purchased"
          value={`${totalGpusPurchased} Nodes`}
          subValue="H100, L40S, 4090 contracted"
          highlight
          badge="Compute"
        />
        <MetricCard
          label="Indian DIDs Contracted"
          value={`${totalDidsPurchased.toLocaleString('en-IN')} DIDs`}
          subValue="Tata, Airtel, Jio, Vi"
          badge="Telecom"
        />
        <MetricCard
          label="Total Monthly Commitment"
          value={formatINR(totalCommitment)}
          subValue="Upstream supplier OPEX"
          badge="Commitment"
        />
        <MetricCard
          label="Carrier API Health"
          value="99.98%"
          subValue="Automated heartbeat probes"
          badge="Live Probes"
        />
      </div>

      {/* Filter Tabs - Keeping precisely the 3 main categories requested */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
        {(['All Partners', 'GPU Cloud Providers', 'SIP Trunks'] as const).map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
              selectedType === type
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Providers Grid (Requirement 7: GPU purchased info, contract end dates, API status) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredProviders.map(provider => {
          const daysLeft = getDaysRemaining(provider.contractEnd);
          const isExpiringSoon = daysLeft <= 60;
          const isPinging = pingingId === provider.id;

          return (
            <div
              key={provider.id}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs transition-all hover:border-cyan-500/50"
            >
              <div>
                {/* Top Row: Provider Brand & API Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {provider.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        {provider.providerType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {provider.serviceType}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={provider.apiStatus} />
                    <span className="text-[10px] font-mono text-slate-400">
                      {provider.apiLatencyMs}ms (P99)
                    </span>
                  </div>
                </div>

                {/* Capacity Purchased Card (Requirement 7) */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/80 mb-3 space-y-1.5 text-xs font-mono">
                  {provider.purchasedGpuCount !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-sans flex items-center gap-1.5 font-medium">
                        <Server className="w-3.5 h-3.5 text-cyan-500" />
                        <span>GPUs Purchased / Under Contract:</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {provider.purchasedGpuCount}x {provider.purchasedGpuModel || 'GPU Nodes'}
                      </span>
                    </div>
                  )}

                  {provider.purchasedDidCount !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-sans flex items-center gap-1.5 font-medium">
                        <PhoneCall className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Indian DIDs Contracted:</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {provider.purchasedDidCount.toLocaleString('en-IN')} DIDs ({provider.trunkChannels || 500} Channels)
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 font-sans font-medium">Monthly Commitment:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                      {formatINR(provider.monthlyCommitment)}/mo
                    </span>
                  </div>
                </div>

                {/* Contract Dates & API Telemetry (Requirement 7) */}
                <div className="space-y-2 text-xs font-mono text-[11px] mb-4">
                  <div className="flex items-center justify-between p-2 rounded bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/50">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-sans">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>Contract End Date:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {provider.contractEnd}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        daysLeft <= 30
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : daysLeft <= 60
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-slate-500 px-1">
                    <span>Agreement Term:</span>
                    <span className="text-slate-700 dark:text-slate-300">{provider.contractStart} → {provider.contractEnd}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 px-1">
                    <span>90-Day Carrier Uptime SLA:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{provider.uptime90d}%</span>
                  </div>
                  <div className="flex justify-between text-slate-500 px-1">
                    <span>API Heartbeat Probe:</span>
                    <span className="text-slate-600 dark:text-slate-300">{provider.lastHeartbeat || 'Operational (Automated)'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Ping API & Renewal Alert */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
                <span className="text-slate-400 text-[11px] truncate">{provider.contactEmail}</span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handlePing(provider.id)}
                    disabled={isPinging}
                    className="px-2.5 py-1 text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800 rounded-md transition-colors flex items-center gap-1"
                    title="Probe API Endpoint and Test Latency"
                  >
                    <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin text-cyan-600' : ''}`} />
                    <span>{isPinging ? 'Pinging...' : 'Test API Ping'}</span>
                  </button>

                  {isExpiringSoon && (
                    <button
                      onClick={() => handleTriggerContractAlert(provider)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 rounded-md transition-colors"
                      title="Set Expiration Warning Alert"
                    >
                      Renewal Warning
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
