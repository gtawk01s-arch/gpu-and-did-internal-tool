import React, { useState } from 'react';
import {
  Building2,
  Server,
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
  Lock,
  Cpu,
  KeyRound,
  Layers,
  Database,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { Provider } from '../../types';
import { formatINR } from '../../data/mockData';

export const ProvidersView: React.FC = () => {
  const { providers, createAlert, pingProviderApi, connectProviderApi, updateProviderCapacity } = useApp();
  const [selectedType, setSelectedType] = useState<'All GPU Clouds' | 'Hyperscale GPU Clouds' | 'Bare-Metal AI Datacenters' | 'Specialized AI Clouds'>('All GPU Clouds');
  const [pingingId, setPingingId] = useState<string | null>(null);

  // Modal states
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedProviderForConnect, setSelectedProviderForConnect] = useState<Provider | null>(null);
  const [connectEndpoint, setConnectEndpoint] = useState('');
  const [connectSecretKey, setConnectSecretKey] = useState('');

  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [selectedProviderForCapacity, setSelectedProviderForCapacity] = useState<Provider | null>(null);
  const [editPurchased, setEditPurchased] = useState<number>(0);
  const [editAllocated, setEditAllocated] = useState<number>(0);
  const [editRunning, setEditRunning] = useState<number>(0);

  // Wholesale GPU Aggregates (Strictly GPU Providers Only)
  const totalCommitment = providers.reduce((sum, p) => sum + p.monthlyCommitment, 0);
  const totalGpusPurchased = providers.reduce((sum, p) => sum + (p.purchasedGpuCount || 0), 0);
  const totalGpusAllocated = providers.reduce((sum, p) => sum + (p.allocatedResourcesCount || 0), 0);
  const totalGpusRunning = providers.reduce((sum, p) => sum + (p.runningGpuCount || 0), 0);
  const totalGpusAvailable = Math.max(0, totalGpusPurchased - totalGpusAllocated);
  const avgUptime = providers.length > 0
    ? (providers.reduce((sum, p) => sum + p.uptime90d, 0) / providers.length).toFixed(2)
    : '99.99';

  const filteredProviders = providers.filter(p => {
    if (selectedType === 'All GPU Clouds') return true;
    if (selectedType === 'Hyperscale GPU Clouds') {
      return p.providerType === 'GPU Cloud Provider';
    }
    if (selectedType === 'Bare-Metal AI Datacenters') {
      return p.providerType === 'Bare-Metal Datacenter';
    }
    if (selectedType === 'Specialized AI Clouds') {
      return p.providerType === 'Specialized AI Cloud';
    }
    return true;
  });

  const handlePing = (providerId: string) => {
    setPingingId(providerId);
    setTimeout(() => {
      pingProviderApi(providerId);
      setPingingId(null);
    }, 450);
  };

  const handleTriggerContractAlert = (provider: Provider) => {
    createAlert({
      title: `GPU Capacity Renewal Warning: ${provider.name}`,
      description: `Wholesale GPU cluster agreement of ${formatINR(provider.monthlyCommitment)}/mo expires on ${provider.contractEnd}. Renewal review required for ${provider.purchasedGpuCount}x ${provider.purchasedGpuModel}.`,
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

  const openConnectDialog = (provider: Provider) => {
    setSelectedProviderForConnect(provider);
    setConnectEndpoint(provider.apiEndpoint || `https://api.${provider.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/v1`);
    setConnectSecretKey('');
    setShowConnectModal(true);
  };

  const handleSaveApiConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProviderForConnect && connectEndpoint.trim()) {
      connectProviderApi(
        selectedProviderForConnect.id,
        connectEndpoint.trim(),
        connectSecretKey.trim() || 'sk_live_generated_key_8892'
      );
      setShowConnectModal(false);
    }
  };

  const openCapacityDialog = (provider: Provider) => {
    setSelectedProviderForCapacity(provider);
    setEditPurchased(provider.purchasedGpuCount || 0);
    setEditAllocated(provider.allocatedResourcesCount || 0);
    setEditRunning(provider.runningGpuCount || 0);
    setShowCapacityModal(true);
  };

  const handleSaveCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProviderForCapacity) {
      updateProviderCapacity(selectedProviderForCapacity.id, {
        purchasedGpuCount: Number(editPurchased),
        allocatedResourcesCount: Number(editAllocated),
        runningGpuCount: Number(editRunning),
      });
      setShowCapacityModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-500" />
            Wholesale Upstream GPU Cloud Providers &amp; Datacenters
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Strictly wholesale GPU infrastructure: manage upstream API connectors, capacity pools (purchased, allocated, running, available), and server commitments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-semibold border border-cyan-300 dark:border-cyan-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
            <span>Admin-Only Control Desk</span>
          </span>
        </div>
      </div>

      {/* Celerko Architecture Security Callout Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/30 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase tracking-wider border border-cyan-400/30">
                Celerko Component Architecture
              </span>
              <span className="text-xs font-semibold text-slate-300">Provider API Connector &amp; Capacity Manager</span>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              <strong>Admin Control:</strong> You connect upstream GPU provider APIs (CoreWeave, Lambda Labs, RunPod, Nebius) and manage GPU inventory. Upstream secret keys are encrypted on the backend and <strong>never exposed to clients</strong>. Clients generate their own Celerko API keys from the Client Panel, but requests are only processed if an active GPU allocation exists.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 text-right font-mono">
              <div className="text-[10px] text-slate-400 font-sans">API Health SLA</div>
              <div className="text-sm font-bold text-emerald-400">{avgUptime}% Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Celerko Capacity Manager KPI Cards (Strictly GPU Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MetricCard
          label="Total Purchased GPUs"
          value={`${totalGpusPurchased} Nodes`}
          subValue="H100, H200, L40S, 4090"
          highlight
          badge="Purchased"
        />
        <MetricCard
          label="Allocated to Clients"
          value={`${totalGpusAllocated} Nodes`}
          subValue="Approved via Admin"
          badge="Allocated"
        />
        <MetricCard
          label="Running Workloads"
          value={`${totalGpusRunning} Active`}
          subValue="Live GPU compute tasks"
          badge="Running"
        />
        <MetricCard
          label="Available / Free GPUs"
          value={`${totalGpusAvailable} Nodes`}
          subValue="Ready for new allocation"
          badge="Available"
        />
        <MetricCard
          label="Monthly Commitment"
          value={formatINR(totalCommitment)}
          subValue="Wholesale OPEX"
          badge="Commitment"
        />
      </div>

      {/* Filter Tabs - Exclusively GPU Cloud Categories */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          {(['All GPU Clouds', 'Hyperscale GPU Clouds', 'Bare-Metal AI Datacenters', 'Specialized AI Clouds'] as const).map(type => (
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
        <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
          Showing {filteredProviders.length} Wholesale GPU Partners
        </span>
      </div>

      {/* Providers Grid (Strictly GPU Clouds with API Connector & Capacity Details) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredProviders.map(provider => {
          const daysLeft = getDaysRemaining(provider.contractEnd);
          const isExpiringSoon = daysLeft <= 60;
          const isPinging = pingingId === provider.id;
          const availableUnits = Math.max(0, (provider.purchasedGpuCount || 0) - (provider.allocatedResourcesCount || 0));

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
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-semibold border border-cyan-200 dark:border-cyan-800">
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

                {/* Celerko Capacity Manager Section */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/80 mb-3 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700/60 font-sans">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Capacity Manager ({provider.purchasedGpuModel})</span>
                    </span>
                    <button
                      onClick={() => openCapacityDialog(provider)}
                      className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Adjust Pool</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center pt-0.5">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-sans">Purchased</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {provider.purchasedGpuCount}
                      </div>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-sans">Allocated</div>
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                        {provider.allocatedResourcesCount}
                      </div>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-sans">Running</div>
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                        {provider.runningGpuCount}
                      </div>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-sans">Available</div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {availableUnits}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 dark:border-slate-700/60 font-sans">
                    <span className="text-slate-500 font-medium text-[11px]">Wholesale Commitment:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                      {formatINR(provider.monthlyCommitment)}/mo
                    </span>
                  </div>
                </div>

                {/* Celerko Provider API Connector Details */}
                <div className="p-3 bg-slate-900/90 text-slate-200 rounded-lg border border-slate-700 mb-3 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-700">
                    <span className="text-cyan-400 font-sans font-semibold flex items-center gap-1.5">
                      <KeyRound className="w-3 h-3 text-cyan-400" />
                      <span>Provider API Connector</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                      Backend Sync Active
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] items-center">
                    <span className="text-slate-400 font-sans">Endpoint:</span>
                    <span className="text-cyan-300 truncate max-w-[210px]">{provider.apiEndpoint || 'https://api.upstream.gpu/v1'}</span>
                  </div>

                  <div className="flex justify-between text-[11px] items-center">
                    <span className="text-slate-400 font-sans flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Upstream Secret Key:</span>
                    </span>
                    <span className="text-amber-300 font-bold">{provider.upstreamKeyMasked || 'sk_live_••••••••9a21'}</span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                    <span>Client Exposure:</span>
                    <span className="text-rose-400 font-semibold font-sans">Zero (Strictly Masked &amp; Hidden)</span>
                  </div>
                </div>

                {/* Contract Dates & Agreement Term */}
                <div className="space-y-1.5 text-xs font-mono text-[11px] mb-4">
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
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-slate-500 px-1">
                    <span>90-Day SLA Uptime:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{provider.uptime90d}%</span>
                  </div>
                  <div className="flex justify-between text-slate-500 px-1">
                    <span>Last Automated Heartbeat:</span>
                    <span className="text-slate-600 dark:text-slate-300">{provider.lastHeartbeat || 'Operational'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
                <span className="text-slate-400 text-[11px] truncate">{provider.contactEmail}</span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openConnectDialog(provider)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-md transition-colors flex items-center gap-1"
                    title="Configure Provider API Connector"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>API Config</span>
                  </button>

                  <button
                    onClick={() => handlePing(provider.id)}
                    disabled={isPinging}
                    className="px-2.5 py-1 text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800 rounded-md transition-colors flex items-center gap-1"
                    title="Probe API Endpoint and Test Latency"
                  >
                    <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin text-cyan-600' : ''}`} />
                    <span>{isPinging ? 'Probing...' : 'Ping API'}</span>
                  </button>

                  {isExpiringSoon && (
                    <button
                      onClick={() => handleTriggerContractAlert(provider)}
                      className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 rounded-md transition-colors"
                      title="Set Expiration Warning Alert"
                    >
                      Warning
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Provider API Connector Configuration */}
      {showConnectModal && selectedProviderForConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyan-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Configure Upstream GPU API: {selectedProviderForConnect.name}
                </h3>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-500 text-xs">
              Connect this wholesale GPU provider to Celerko's backend engine. This API credential will be strictly stored on the server and used by the automatic provisioning worker.
            </p>

            <form onSubmit={handleSaveApiConnection} className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Provider API Base URL
                </label>
                <input
                  type="text"
                  value={connectEndpoint}
                  onChange={e => setConnectEndpoint(e.target.value)}
                  placeholder="https://api.coreweave.com/v1"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:ring-2 focus:ring-cyan-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Upstream Provider Secret API Key (Server Encrypted)
                </label>
                <input
                  type="password"
                  value={connectSecretKey}
                  onChange={e => setConnectSecretKey(e.target.value)}
                  placeholder="Enter secret key (e.g. sk_live_...)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:ring-2 focus:ring-cyan-500 outline-hidden"
                />
                <span className="text-[10px] text-amber-500 mt-1 block">
                  🔒 Security Rule: Clients will never receive or see this key.
                </span>
              </div>

              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg text-cyan-900 dark:text-cyan-200 text-[11px]">
                <strong>Automatic Provisioning:</strong> Once connected, approved client GPU allocation requests will automatically trigger node instances on this provider via server-to-server proxy.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-xs"
                >
                  Save &amp; Test Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Capacity Manager Pool Adjustment */}
      {showCapacityModal && selectedProviderForCapacity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Adjust Capacity Pool: {selectedProviderForCapacity.name}
                </h3>
              </div>
              <button
                onClick={() => setShowCapacityModal(false)}
                className="text-slate-400 hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-500 text-xs">
              Manage contracted GPU nodes, tracked running jobs, and calculate available capacity for {selectedProviderForCapacity.purchasedGpuModel}.
            </p>

            <form onSubmit={handleSaveCapacity} className="space-y-4">
              <div className="grid grid-cols-3 gap-3 font-mono">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                    Purchased Total
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editPurchased}
                    onChange={e => setEditPurchased(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                    Allocated Nodes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={editPurchased}
                    value={editAllocated}
                    onChange={e => setEditAllocated(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                    Running Tasks
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={editAllocated}
                    value={editRunning}
                    onChange={e => setEditRunning(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex justify-between items-center font-mono">
                <span className="font-sans text-slate-500">Calculated Available / Unallocated:</span>
                <span className="font-bold text-emerald-500 text-sm">
                  {Math.max(0, editPurchased - editAllocated)} Nodes Free
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCapacityModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-xs"
                >
                  Update Capacity Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
