import React, { useState } from 'react';
import {
  GitPullRequest,
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Plus,
  Server,
  PhoneCall,
  Search,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { PendingRequest } from '../../types';
import { formatINR } from '../../data/mockData';

export const AllocationsView: React.FC = () => {
  const {
    pendingRequests,
    clients,
    gpus,
    sipProviders,
    approveRequest,
    rejectRequest,
    holdRequest,
    createRequest,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTabState] = useState<'approvals' | 'all'>('approvals');
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [newRequest, setNewRequest] = useState<Partial<PendingRequest>>({
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.companyName || '',
    resourceType: 'GPU Cluster',
    specs: '',
    quantity: 8,
    monthlyCost: 16000,
    sellingPrice: 24500,
    notes: '',
  });

  const pendingCount = pendingRequests.filter(r => r.status === 'Pending').length;
  const holdCount = pendingRequests.filter(r => r.status === 'Hold').length;
  const approvedCount = pendingRequests.filter(r => r.status === 'Approved').length;

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest(newRequest);
    setShowRequestModal(false);
  };

  const displayedRequests =
    activeTab === 'approvals'
      ? pendingRequests.filter(r => r.status === 'Pending' || r.status === 'Hold')
      : pendingRequests;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-cyan-500" />
            Wholesale Resource Allocation &amp; Approval Desk
          </h2>
         
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Allocation Request</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Pending Approval" value={pendingCount}  />
        <MetricCard label="On Hold" value={holdCount} />
        <MetricCard label="Approved (This Month)" value={approvedCount}  />
        
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTabState('approvals')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'approvals'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Pending Review Queue ({pendingCount + holdCount})
        </button>
        <button
          onClick={() => setActiveTabState('all')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Requests History ({pendingRequests.length})
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Request ID</th>
                <th className="py-2.5 px-3">Client Name</th>
                <th className="py-2.5 px-3">Resource Type</th>
                <th className="py-2.5 px-3">Hardware / Network Specs</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Wholesale Cost</th>
                <th className="py-2.5 px-3 text-right">Selling Price</th>
                <th className="py-2.5 px-3 text-right">Spread Margin</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {displayedRequests.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No requests waiting in this queue.
                  </td>
                </tr>
              ) : (
                displayedRequests.map(req => {
                  const spread = req.sellingPrice - req.monthlyCost;
                  const margin = Math.round((spread / req.sellingPrice) * 100);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {req.requestId}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        {req.clientName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-cyan-600 dark:text-cyan-400">
                          {req.resourceType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        <div>{req.specs}</div>
                        {req.notes && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5 truncate">
                            Note: {req.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                        {req.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {formatINR(req.monthlyCost)}/mo
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatINR(req.sellingPrice)}/mo
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-cyan-600 dark:text-cyan-400 font-semibold">
                        {margin}% (+{formatINR(spread)})
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                        {req.date}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {req.status === 'Pending' || req.status === 'Hold' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => approveRequest(req.id)}
                              className="px-2 py-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1 transition-colors"
                              title="Authorize Provisioning"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => holdRequest(req.id)}
                              className="px-2 py-1 text-[11px] font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900 rounded flex items-center gap-1 transition-colors"
                              title="Hold for Finance Check"
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
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Allocation Request */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Submit Resource Allocation Request
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All wholesale leases require Operations or Finance authorization prior to provisioning.
            </p>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Client Company</label>
                <select
                  required
                  value={newRequest.clientName}
                  onChange={e => {
                    const c = clients.find(client => client.companyName === e.target.value);
                    setNewRequest({
                      ...newRequest,
                      clientName: e.target.value,
                      clientId: c?.id || '',
                    });
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.companyName}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Resource Type</label>
                  <select
                    value={newRequest.resourceType}
                    onChange={e => setNewRequest({ ...newRequest, resourceType: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  >
                    <option value="GPU Cluster">GPU Cluster</option>
                    <option value="SIP Trunk">SIP Trunk</option>
                    <option value="DID Number Block">DID Number Block</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newRequest.quantity}
                    onChange={e => setNewRequest({ ...newRequest, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Specifications / Cluster Details</label>
                <input
                  required
                  type="text"
                  value={newRequest.specs}
                  onChange={e => setNewRequest({ ...newRequest, specs: e.target.value })}
                  placeholder="e.g. 16x NVIDIA H100 SXM5 80GB Infiniband NDR"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Wholesale Cost (₹ INR/mo)</label>
                  <input
                    type="number"
                    value={newRequest.monthlyCost}
                    onChange={e => setNewRequest({ ...newRequest, monthlyCost: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Selling Price (₹ INR/mo)</label>
                  <input
                    type="number"
                    value={newRequest.sellingPrice}
                    onChange={e => setNewRequest({ ...newRequest, sellingPrice: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Operational Notes</label>
                <textarea
                  rows={2}
                  value={newRequest.notes || ''}
                  onChange={e => setNewRequest({ ...newRequest, notes: e.target.value })}
                  placeholder="Business justification, contract duration, custom routing requirements..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
