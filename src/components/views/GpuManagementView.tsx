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
  PauseCircle,
  PlayCircle,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { GpuInventoryItem, GpuStatus } from '../../types';
import { formatINR } from '../../data/mockData';

export const GpuManagementView: React.FC = () => {
  const { gpus, clients, allocateGpu, reclaimGpu, transferGpu, auditLogs, holdGpu, releaseGpuHold } = useApp();

  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [allocatingGpu, setAllocatingGpu] = useState<GpuInventoryItem | null>(null);
  const [selectedClient, setSelectedClient] = useState('');
  const [allocQuantity, setAllocQuantity] = useState(1);

  const [transferringGpu, setTransferringGpu] = useState<GpuInventoryItem | null>(null);
  const [targetTransferClient, setTargetTransferClient] = useState('');

  // Hold GPU Modal State
  const [holdingGpu, setHoldingGpu] = useState<GpuInventoryItem | null>(null);
  const [holdReason, setHoldReason] = useState<string>('');

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Stats
  const totalPurchased = gpus.reduce((sum, g) => sum + g.quantity, 0);
  const totalAllocated = gpus.reduce((sum, g) => sum + g.allocatedQuantity, 0);
  const totalAvailable = totalPurchased - totalAllocated;
  const inUseCount = gpus.filter(g => g.status === 'In Use').reduce((sum, g) => sum + g.allocatedQuantity, 0);
  const reservedCount = gpus.filter(g => g.status === 'Reserved').reduce((sum, g) => sum + g.quantity, 0);
  const holdCount = gpus.filter(g => g.status === 'Hold').reduce((sum, g) => sum + (g.allocatedQuantity || g.quantity), 0);

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
             GPU Inventory &amp; Cluster Fleet
          </h2>
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
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <MetricCard label="Total Purchased" value={totalPurchased} />
        <MetricCard label="Total Allocated" value={totalAllocated} />
        <MetricCard label="Available" value={totalAvailable} />
        <MetricCard label="In Use (Online)" value={inUseCount} />
        <MetricCard label="Reserved" value={reservedCount} />
        <MetricCard label="On Hold" value={holdCount} badge={holdCount > 0 ? "Alert" : undefined} />
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
              <option value="Hold">Hold</option>
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
                        {formatINR(gpu.monthlyCost)}/mo
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatINR(gpu.sellingPrice)}/mo
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-cyan-600 dark:text-cyan-400">
                        {gpu.sellingPrice > 0 ? `${(((gpu.sellingPrice - gpu.monthlyCost) / gpu.sellingPrice) * 100).toFixed(1)}%` : '–'}
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
                        <div className="space-y-1">
                          <StatusBadge status={gpu.status} />
                          {gpu.status === 'Hold' && (
                            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded text-[10px] text-amber-800 dark:text-amber-200 font-sans max-w-[190px]">
                              <div className="font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>Hold Reason:</span>
                              </div>
                              <div className="truncate font-medium mt-0.5" title={gpu.holdReason}>{gpu.holdReason || 'Administrative Review'}</div>
                              {gpu.heldAt && (
                                <div className="text-[9px] text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                                  {gpu.heldAt} {gpu.heldBy ? `· ${gpu.heldBy}` : ''}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {gpu.status === 'Hold' ? (
                            <button
                              onClick={() => releaseGpuHold(gpu.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded transition-colors flex items-center gap-1"
                              title="Release hold and restore GPU allocation"
                            >
                              <PlayCircle className="w-3 h-3 text-emerald-600" />
                              <span>Resume</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setHoldingGpu(gpu);
                                setHoldReason('');
                              }}
                              className="px-2 py-1 text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded transition-colors flex items-center gap-1"
                              title="Place GPU on Hold with mandatory reason"
                            >
                              <PauseCircle className="w-3 h-3 text-amber-600" />
                              <span>Hold</span>
                            </button>
                          )}

                          {free > 0 && gpu.status !== 'Hold' && (
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
                  <span className="tabular-nums">{formatINR(allocatingGpu.monthlyCost * allocQuantity)}/mo</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Client Resale Price:</span>
                  <span className="tabular-nums">{formatINR(allocatingGpu.sellingPrice * allocQuantity)}/mo</span>
                </div>
                <div className="flex justify-between text-cyan-600 dark:text-cyan-400">
                  <span>Wholesale Spread:</span>
                  <span className="tabular-nums">
                    +{formatINR((allocatingGpu.sellingPrice - allocatingGpu.monthlyCost) * allocQuantity)}/mo ({allocatingGpu.sellingPrice > 0 ? (((allocatingGpu.sellingPrice - allocatingGpu.monthlyCost) / allocatingGpu.sellingPrice) * 100).toFixed(1) + '%' : '–'})
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

      {/* Modal: Place GPU on Hold with Required Reason */}
      {holdingGpu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 sm:p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PauseCircle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Place GPU on Hold: {holdingGpu.gpuId}
                </h3>
              </div>
              <button
                onClick={() => setHoldingGpu(null)}
                className="text-slate-400 hover:text-slate-200 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-between font-mono">
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{holdingGpu.gpuModel}</div>
                <div className="text-[11px] text-slate-500">
                  {holdingGpu.provider} · {holdingGpu.region} · {holdingGpu.assignedClient ? `Assigned: ${holdingGpu.assignedClient}` : 'Unassigned'}
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={holdingGpu.status} />
              </div>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!holdingGpu || !holdReason.trim()) return;
                holdGpu(holdingGpu.id, holdReason.trim());
                setHoldingGpu(null);
                setHoldReason('');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                  Reason for Hold (Required)
                </label>
                <p className="text-[11px] text-slate-400 mb-2 font-sans">
                  Document the operational or business justification for placing this GPU node cluster on hold.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {[
                    'Payment Overdue (Net 30 Breached)',
                    'Client Requested Temporary Pause',
                    'Scheduled Node Maintenance / Firmware',
                    'Client Usage Dispute',
                    'Security & Abuse Audit',
                    'Upstream Provider Hardware Diagnostic',
                  ].map(preset => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setHoldReason(preset)}
                      className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${
                        holdReason === preset
                          ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 text-amber-800 dark:text-amber-200 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  required
                  rows={3}
                  value={holdReason}
                  onChange={e => setHoldReason(e.target.value)}
                  placeholder="Enter detailed reason for placing this GPU on hold..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs outline-hidden"
                />
              </div>

              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Administrative Impact</span>
                </div>
                <p>
                  Placing on hold records the reason in audit trails and updates status across internal tools and client portal.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setHoldingGpu(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!holdReason.trim()}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold shadow-xs flex items-center gap-1.5 transition-all"
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
