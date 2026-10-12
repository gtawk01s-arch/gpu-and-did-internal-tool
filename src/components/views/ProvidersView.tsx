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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { Provider } from '../../types';

export const ProvidersView: React.FC = () => {
  const { providers, createAlert } = useApp();
  const [selectedType, setSelectedType] = useState('All');

  const totalCommitment = providers.reduce((sum, p) => sum + p.monthlyCommitment, 0);
  const avgUptime = (
    providers.reduce((sum, p) => sum + p.uptime90d, 0) / providers.length
  ).toFixed(2);

  const filteredProviders = providers.filter(p =>
    selectedType === 'All' ? true : p.providerType === selectedType
  );

  const handleTriggerContractAlert = (provider: Provider) => {
    createAlert({
      title: `Contract Expiration Warning: ${provider.name}`,
      description: `Commitment agreement of $${provider.monthlyCommitment.toLocaleString()}/mo expires on ${provider.contractEnd}. Renewal or renegotiation review required.`,
      category: 'Contract Expiring',
      severity: 'High',
      targetResource: provider.name,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-500" />
            Wholesale Upstream Providers &amp; Carrier Interconnects
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Suppliers delivering bulk GPU compute infrastructure and Tier-1 voice carrier networks.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Active Wholesale Suppliers" value={providers.length} subValue="GPU + Telecom partners" badge="Suppliers" />
        <MetricCard label="Total Monthly Commitment" value={`$${totalCommitment.toLocaleString()}`} subValue="Wholesale contracts" highlight badge="Commitment" />
        <MetricCard label="Average 90-Day Uptime" value={`${avgUptime}%`} subValue="Cross-carrier SLA" badge="Uptime" />
        <MetricCard label="API Gateway Health" value="99.98%" subValue="Automated heartbeat probe" badge="Probes" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        {['All', 'GPU Cloud Provider', 'Tier-1 Telecom'].map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              selectedType === type
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {type === 'All' ? 'All Suppliers' : type}
          </button>
        ))}
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.map(provider => {
          const isExpiringSoon = new Date(provider.contractEnd).getTime() - new Date().getTime() < 60 * 24 * 60 * 60 * 1000;
          return (
            <div
              key={provider.id}
              className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {provider.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {provider.providerType}
                    </div>
                  </div>
                  <StatusBadge status={provider.apiStatus} />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 bg-slate-50 dark:bg-slate-800/40 p-2 rounded">
                  {provider.serviceType}
                </p>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono text-[11px] mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Monthly Commitment:</span>
                    <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      ${provider.monthlyCommitment.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Allocated Units:</span>
                    <span className="tabular-nums">{provider.allocatedResourcesCount} resources</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">90d Uptime:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{provider.uptime90d}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">API Latency:</span>
                    <span className="tabular-nums">{provider.apiLatencyMs}ms (P99)</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-sans">Contract Period:</span>
                    <span className={isExpiringSoon ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
                      {provider.contractStart} to {provider.contractEnd}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] truncate">{provider.contactEmail}</span>
                {isExpiringSoon && (
                  <button
                    onClick={() => handleTriggerContractAlert(provider)}
                    className="px-2 py-1 text-[10px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 rounded transition-colors"
                  >
                    Set Renewal Alert
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
