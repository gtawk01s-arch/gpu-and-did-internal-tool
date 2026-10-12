import React, { useState } from 'react';
import {
  Server,
  Plus,
  RefreshCw,
  ArrowRightLeft,
  Search,
  Filter,
  CheckCircle,
  ExternalLink,
  Cpu,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { GpuInventoryItem, GpuStatus } from '../../types';

export const GpuManagementView: React.FC = () => {
  const { gpus, clients, allocateGpu, reclaimGpu, transferGpu, auditLogs } = useApp();

  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [allocatingGpu, setAllocatingGpu] = useState<GpuInventoryItem | null>(null);
  const [selectedClient, setSelectedClient] = useState('');
  const [allocQuantity, setAllocQuantity] = useState(1);

  const [transferringGpu, setTransferringGpu] = useState<GpuInventoryItem | null>(null);
  const [targetTransferClient, setTargetTransferClient] = useState('');

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Stats
  const totalPurchased = gpus.reduce((sum, g) => sum + g.quantity, 0);
  const totalAllocated = gpus.reduce((sum, g) => sum + g.allocatedQuantity, 0);
  const totalAvailable = totalPurchased - totalAllocated;
  const inUseCount = gpus.filter(g => g.status === 'In Use').reduce((sum, g) => sum + g.allocatedQuantity, 0);
  const reservedCount = gpus.filter(g => g.status === 'Reserved').reduce((sum, g) => sum + g.quantity, 0);

  // Filters
  const filteredGpus = gpus.filter(g => {
    const matchesSearch =
      g.gpuId.toLowerCase().includes(search.toLowerCase()) ||
      g.gpuModel.toLowerCase().includes(search.toLowerCase()) ||
      g.region.toLowerCase().includes(search.toLowerCase()) ||
      (g.assignedClient && g.assignedClient.toLowerCase().includes(search.toLowerCase()));

    const matchesProvider = providerFilter === 'All' || g.provider === providerFilter;
    const matchesStatus = statusFilter === 'All' || g.status === statusFilter;

    return matchesSearch && matchesProvider && matchesStatus;
  });

  const providers = Array.from(new Set(gpus.map(g => g.provider)));

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingGpu || !selectedClient) return;
    allocateGpu(allocatingGpu.id, selectedClient, allocQuantity);
    setAllocatingGpu(null);
    setSelectedClient('');
    setAllocQuantity(1);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringGpu || !targetTransferClient) return;
    transferGpu(transferringGpu.id, targetTransferClient);
    setTransferringGpu(null);
    setTargetTransferClient('');
  };

  const gpuAuditLogs = auditLogs.filter(log => log.action === 'GPU Allocation');

  return (
    <div className="space-y-6">
      {/* Header and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-500" />
            Wholesale GPU Inventory &amp; Cluster Fleet
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track bulk compute nodes purchased from RunPod, Lambda Labs, CoreWeave, and Vast.ai.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>Allocation History</span>
          </button>
        </div>
      </div>

      {/* GPU Capacity KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MetricCard label="Total Purchased" value={totalPurchased} subValue="Physical GPUs" badge="Capacity" />
        <MetricCard label="Total Allocated" value={totalAllocated} subValue="Assigned to clients" badge="Committed" />
        <MetricCard label="Available" value={totalAvailable} subValue="Ready to spin up" highlight badge="Free" />
        <MetricCard label="In Use (Online)" value={inUseCount} subValue="Workloads running" badge="Active" />
        <MetricCard label="Reserved" value={reservedCount} subValue="Contract pending" badge="Holding" />
      </div>

      {/* Filters & Search Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by GPU ID, model (H100, A100, L40S), region, or client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Provider:</span>
            <select
              value={providerFilter}
              onChange={e => setProviderFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-hidden"
            >
              <option value="All">All Providers</option>
              {providers.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="In Use">In Use</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main GPU Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">GPU ID</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3">GPU Model &amp; Specs</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Monthly Cost</th>
                <th className="py-2.5 px-3 text-right">Selling Price</th>
                <th className="py-2.5 px-3 text-right">Margin %</th>
                <th className="py-2.5 px-3">Contract Period</th>
                <th className="py-2.5 px-3">Assigned Client</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredGpus.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    No GPU nodes match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredGpus.map(gpu => {
                  const free = gpu.quantity - gpu.allocatedQuantity;
                  return (
                    <tr key={gpu.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {gpu.gpuId}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-200">
                        {gpu.provider}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {gpu.region}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">
                        <div className="font-medium">{gpu.gpuModel}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {gpu.vramGb}GB · {gpu.interconnect}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {gpu.allocatedQuantity}
                        </span>
                        <span className="text-slate-400">/{gpu.quantity}</span>
                        {free > 0 && (
                          <div className="text-[10px] text-cyan-600 dark:text-cyan-400">
                            {free} free
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        ${gpu.monthlyCost.toLocaleString()}/mo
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                        ${gpu.sellingPrice.toLocaleString()}/mo
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-cyan-600 dark:text-cyan-400">
                        {gpu.marginPercent.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-[11px] font-mono text-slate-500">
                        <div>{gpu.contractStart}</div>
                        <div className="text-slate-400">to {gpu.contractEnd}</div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                        {gpu.assignedClient || (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={gpu.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {free > 0 && (
                            <button
                              onClick={() => {
                                setAllocatingGpu(gpu);
                                setAllocQuantity(Math.min(free, 8));
                              }}
                              className="px-2 py-1 text-[11px] font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded transition-colors"
                              title="Allocate Available Units"
                            >
                              Allocate
                            </button>
                          )}
                          {gpu.allocatedQuantity > 0 && (
                            <>
                              <button
                                onClick={() => setTransferringGpu(gpu)}
                                className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded transition-colors"
                                title="Transfer to Another Client"
                              >
                                Transfer
                              </button>
                              <button
                                onClick={() => reclaimGpu(gpu.id)}
                                className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900 rounded transition-colors"
                                title="Reclaim Back to Pool"
                              >
                                Reclaim
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Allocate GPU */}
      {allocatingGpu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Allocate GPU Cluster: {allocatingGpu.gpuId}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Assign nodes from {allocatingGpu.provider} ({allocatingGpu.gpuModel}) to a client company.
            </p>

            <form onSubmit={handleAllocateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Select Client Company</label>
                <select
                  required
                  value={selectedClient}
                  onChange={e => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.companyName}>
                      {c.companyName} ({c.resourceRequirement})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">
                  Quantity to Allocate (Max {allocatingGpu.quantity - allocatingGpu.allocatedQuantity} free)
                </label>
                <input
                  type="number"
                  min="1"
                  max={allocatingGpu.quantity - allocatingGpu.allocatedQuantity}
                  value={allocQuantity}
                  onChange={e => setAllocQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/50 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Wholesale Cost:</span>
                  <span className="tabular-nums">${(allocatingGpu.monthlyCost * allocQuantity).toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Client Resale Price:</span>
                  <span className="tabular-nums">${(allocatingGpu.sellingPrice * allocQuantity).toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between text-cyan-600 dark:text-cyan-400">
                  <span>Wholesale Spread:</span>
                  <span className="tabular-nums">
                    ${((allocatingGpu.sellingPrice - allocatingGpu.monthlyCost) * allocQuantity).toLocaleString()}/mo ({allocatingGpu.marginPercent.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAllocatingGpu(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedClient}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded disabled:opacity-50"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Transfer GPU */}
      {transferringGpu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
              Transfer GPU Cluster: {transferringGpu.gpuId}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Current Assignee: <strong className="text-slate-700 dark:text-slate-200">{transferringGpu.assignedClient}</strong>
            </p>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">New Target Client</label>
                <select
                  required
                  value={targetTransferClient}
                  onChange={e => setTargetTransferClient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Choose New Client --</option>
                  {clients
                    .filter(c => c.companyName !== transferringGpu.assignedClient)
                    .map(c => (
                      <option key={c.id} value={c.companyName}>
                        {c.companyName}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferringGpu(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!targetTransferClient}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded disabled:opacity-50"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Allocation History */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-500" />
                GPU Allocation &amp; Cluster Movement History
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 text-xs">
              {gpuAuditLogs.length === 0 ? (
                <div className="p-4 text-center text-slate-400">No allocation movements recorded yet.</div>
              ) : (
                gpuAuditLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 font-mono text-[11px]"
                  >
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span>Operator: {log.user} ({log.role})</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-medium">
                      Resource: {log.resourceId}
                    </div>
                    <div className="text-rose-500 dark:text-rose-400 line-through mt-0.5">
                      Old: {log.oldValue}
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      New: {log.newValue}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
