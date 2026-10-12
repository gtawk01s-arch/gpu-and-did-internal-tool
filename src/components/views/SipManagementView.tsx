import React, { useState } from 'react';
import {
  PhoneCall,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  PauseCircle,
  ArrowRightLeft,
  Activity,
  Layers,
  PhoneForwarded,
  Globe,
  Radio,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { DidNumber } from '../../types';

export const SipManagementView: React.FC = () => {
  const { sipProviders, dids, clients, assignDid, releaseDid, suspendDid, portDid } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [providerFilter, setProviderFilter] = useState('All');

  const [assigningDid, setAssigningDid] = useState<DidNumber | null>(null);
  const [targetClient, setTargetClient] = useState('');

  // Dashboard Stats
  const totalSipTrunks = sipProviders.length;
  const totalDids = dids.length;
  const assignedDids = dids.filter(d => d.status === 'Assigned').length;
  const availableDids = dids.filter(d => d.status === 'Available').length;
  const suspendedDids = dids.filter(d => d.status === 'Suspended').length;

  const totalChannels = sipProviders.reduce((sum, p) => sum + p.maxChannels, 0);
  const activeChannels = sipProviders.reduce((sum, p) => sum + p.activeChannels, 0);

  // Filtered DIDs
  const filteredDids = dids.filter(d => {
    const matchesSearch =
      d.didNumber.includes(search) ||
      d.country.toLowerCase().includes(search.toLowerCase()) ||
      d.areaCode.includes(search) ||
      (d.assignedClient && d.assignedClient.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesProvider = providerFilter === 'All' || d.provider === providerFilter;

    return matchesSearch && matchesStatus && matchesProvider;
  });

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningDid || !targetClient) return;
    assignDid(assigningDid.id, targetClient);
    setAssigningDid(null);
    setTargetClient('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-indigo-500" />
          Wholesale SIP Trunks &amp; DID Telecom Management
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Bulk voice infrastructure broker management across Telnyx, Bandwidth, and Twilio Wholesale.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MetricCard label="Total SIP Trunks" value={totalSipTrunks} subValue={`${totalChannels.toLocaleString()} Total CPS`} badge="Carriers" />
        <MetricCard label="Total DID Pool" value={totalDids} subValue="E.164 Global Inventory" badge="DIDs" />
        <MetricCard label="Assigned DIDs" value={assignedDids} subValue="Active in production" highlight badge="Assigned" />
        <MetricCard label="Available DIDs" value={availableDids} subValue="Ready to provision" badge="Available" />
        <MetricCard label="Suspended DIDs" value={suspendedDids} subValue="Account flag / freeze" badge="Hold" />
      </div>

      {/* Section 1: SIP Carrier Trunks Overview */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-500" />
              Wholesale SIP Carrier Trunks &amp; Gateway Capacity
            </h3>
            <p className="text-[11px] text-slate-400">
              Bulk carrier interconnect contracts and real-time channel occupancy.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            {activeChannels.toLocaleString()} / {totalChannels.toLocaleString()} Active Channels ({Math.round((activeChannels / totalChannels) * 100)}%)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {sipProviders.map(prov => {
            const util = Math.round((prov.activeChannels / prov.maxChannels) * 100);
            return (
              <div
                key={prov.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{prov.providerName}</span>
                    <StatusBadge status={prov.apiStatus} />
                  </div>
                  <div className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400 mb-2 truncate">
                    {prov.sipTrunkName}
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-1 mb-3">
                    <div>Range: <span className="font-mono text-slate-700 dark:text-slate-300">{prov.didRange}</span></div>
                    <div>Region: {prov.country}</div>
                    <div>Contract End: <span className="font-mono">{prov.contractEnd}</span></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 font-mono text-[11px]">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Channels:</span>
                    <span>{prov.activeChannels} / {prov.maxChannels} ({util}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${util > 85 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                      style={{ width: `${util}%` }}
                    />
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-200">
                    <span className="text-slate-400">Wholesale:</span>
                    <span>${prov.monthlyCost.toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: DID Numbers Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
          <div className="flex-1 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search DID number (+1, +44, +49), country, or assigned client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-hidden"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Suspended">Suspended</option>
                <option value="Porting">Porting</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Carrier:</span>
              <select
                value={providerFilter}
                onChange={e => setProviderFilter(e.target.value)}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-hidden"
              >
                <option value="All">All Carriers</option>
                <option value="Telnyx Wholesale">Telnyx</option>
                <option value="Bandwidth Inc.">Bandwidth</option>
                <option value="Twilio Wholesale">Twilio</option>
                <option value="Tata Communications">Tata</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">DID Number (E.164)</th>
                <th className="py-2.5 px-3">Carrier Provider</th>
                <th className="py-2.5 px-3">Country / Type</th>
                <th className="py-2.5 px-3">Assigned Client</th>
                <th className="py-2.5 px-3">Assigned Date</th>
                <th className="py-2.5 px-3 text-right">Wholesale Cost</th>
                <th className="py-2.5 px-3 text-right">Resale Price</th>
                <th className="py-2.5 px-3 text-right">Spread Margin</th>
                <th className="py-2.5 px-3 text-right">Monthly Usage</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredDids.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No DID numbers found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredDids.map(did => {
                  const spread = did.sellingPrice - did.monthlyCost;
                  const marginPct = Math.round((spread / did.sellingPrice) * 100);
                  return (
                    <tr key={did.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {did.didNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {did.provider}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{did.country}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({did.type})</span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                        {did.assignedClient || <span className="text-slate-400 italic">Unassigned Pool</span>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                        {did.assignedDate || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        ${did.monthlyCost.toFixed(2)}/mo
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                        ${did.sellingPrice.toFixed(2)}/mo
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-cyan-600 dark:text-cyan-400 font-semibold">
                        {marginPct}% (+${spread.toFixed(2)})
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {did.usageMinutes.toLocaleString()} min
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={did.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {did.status === 'Available' && (
                            <button
                              onClick={() => setAssigningDid(did)}
                              className="px-2 py-1 text-[11px] font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
                              title="Assign DID to Client"
                            >
                              Assign
                            </button>
                          )}
                          {did.status === 'Assigned' && (
                            <>
                              <button
                                onClick={() => releaseDid(did.id)}
                                className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors"
                                title="Release DID to Pool"
                              >
                                Release
                              </button>
                              <button
                                onClick={() => suspendDid(did.id)}
                                className="px-2 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900 rounded transition-colors"
                                title="Suspend DID"
                              >
                                Suspend
                              </button>
                            </>
                          )}
                          {did.status === 'Suspended' && (
                            <button
                              onClick={() => suspendDid(did.id)}
                              className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900 rounded transition-colors"
                              title="Reactivate DID"
                            >
                              Resume
                            </button>
                          )}
                          <button
                            onClick={() => portDid(did.id)}
                            className="px-1.5 py-1 text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                            title="Carrier Porting Request"
                          >
                            <PhoneForwarded className="w-3 h-3" />
                          </button>
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

      {/* Modal: Assign DID */}
      {assigningDid && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Assign DID Number: {assigningDid.didNumber}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {assigningDid.provider} · {assigningDid.country} ({assigningDid.type})
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Assign To Client</label>
                <select
                  required
                  value={targetClient}
                  onChange={e => setTargetClient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.companyName}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/50 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Wholesale Cost:</span>
                  <span>${assigningDid.monthlyCost.toFixed(2)}/mo</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Client Resale Price:</span>
                  <span>${assigningDid.sellingPrice.toFixed(2)}/mo</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningDid(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!targetClient}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded disabled:opacity-50"
                >
                  Confirm Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
