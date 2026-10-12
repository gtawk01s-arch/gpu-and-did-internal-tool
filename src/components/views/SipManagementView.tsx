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
  Plus,
  Upload,
  Building2,
  Check,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { DidNumber, SipProvider } from '../../types';
import { formatINR } from '../../data/mockData';

export const SipManagementView: React.FC = () => {
  const {
    sipProviders,
    dids,
    clients,
    assignDid,
    releaseDid,
    suspendDid,
    portDid,
    addSipProvider,
    addDidNumber,
    importDidNumbers,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [providerFilter, setProviderFilter] = useState('All');
  const [trunkFilter, setTrunkFilter] = useState('All');

  const [assigningDid, setAssigningDid] = useState<DidNumber | null>(null);
  const [targetClient, setTargetClient] = useState('');

  // Modals state
  const [showAddTrunkModal, setShowAddTrunkModal] = useState(false);
  const [showImportDidModal, setShowImportDidModal] = useState(false);
  const [showAddSingleDidModal, setShowAddSingleDidModal] = useState(false);
  const [selectedTrunkForDids, setSelectedTrunkForDids] = useState<string | null>(null);

  // New Trunk Form state
  const [newTrunkProviderName, setNewTrunkProviderName] = useState('Tata Teleservices (TTL Enterprise)');
  const [newTrunkName, setNewTrunkName] = useState('');
  const [newTrunkDidRange, setNewTrunkDidRange] = useState('+91 22 6900 XXXX');
  const [newTrunkCountry, setNewTrunkCountry] = useState('India (Western Circle)');
  const [newTrunkCost, setNewTrunkCost] = useState(280000);
  const [newTrunkMaxChannels, setNewTrunkMaxChannels] = useState(1500);

  // Import DIDs Form state
  const [importTrunkId, setImportTrunkId] = useState(sipProviders[0]?.id || '');
  const [importDidsText, setImportDidsText] = useState('');
  const [importCostPerDid, setImportCostPerDid] = useState(250);
  const [importSellingPrice, setImportSellingPrice] = useState(650);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // Add Single DID Form state
  const [singleDidNumber, setSingleDidNumber] = useState('');
  const [singleDidTrunkId, setSingleDidTrunkId] = useState(sipProviders[0]?.id || '');
  const [singleDidCountry, setSingleDidCountry] = useState('India');
  const [singleDidAreaCode, setSingleDidAreaCode] = useState('022 (Mumbai)');
  const [singleDidType, setSingleDidType] = useState<'Local' | 'Toll-Free' | 'Mobile'>('Local');
  const [singleDidCost, setSingleDidCost] = useState(250);
  const [singleDidPrice, setSingleDidPrice] = useState(650);
  const [singleDidError, setSingleDidError] = useState<string | null>(null);

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
    const matchesTrunk = trunkFilter === 'All' || d.sipTrunkId === trunkFilter || d.sipTrunkName === trunkFilter;

    return matchesSearch && matchesStatus && matchesProvider && matchesTrunk;
  });

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningDid || !targetClient) return;
    assignDid(assigningDid.id, targetClient);
    setAssigningDid(null);
    setTargetClient('');
  };

  const handleCreateTrunkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrunkName) return;
    addSipProvider({
      providerName: newTrunkProviderName,
      sipTrunkName: newTrunkName,
      didRange: newTrunkDidRange,
      country: newTrunkCountry,
      monthlyCost: Number(newTrunkCost),
      maxChannels: Number(newTrunkMaxChannels),
    });
    setShowAddTrunkModal(false);
    setNewTrunkName('');
  };

  const handleImportDidsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importDidsText.trim()) return;
    const lines = importDidsText
      .split(/[\n,;]+/)
      .map(s => s.trim())
      .filter(Boolean);
    const res = importDidNumbers(importTrunkId, lines, Number(importCostPerDid), Number(importSellingPrice));
    setImportFeedback(`Successfully imported ${res.added} DIDs to trunk. (${res.skipped} duplicates skipped).`);
    setImportDidsText('');
    setTimeout(() => {
      setImportFeedback(null);
      setShowImportDidModal(false);
    }, 2000);
  };

  const handleAddSingleDidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSingleDidError(null);
    if (!singleDidNumber.trim()) return;
    const res = addDidNumber({
      didNumber: singleDidNumber.trim(),
      sipTrunkId: singleDidTrunkId,
      country: singleDidCountry,
      areaCode: singleDidAreaCode,
      type: singleDidType,
      monthlyCost: Number(singleDidCost),
      sellingPrice: Number(singleDidPrice),
      status: 'Available',
    });
    if (!res.success) {
      setSingleDidError(res.error || 'Failed to add DID');
      return;
    }
    setShowAddSingleDidModal(false);
    setSingleDidNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-indigo-500" />
            Wholesale SIP Trunks &amp; DID Telecom Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Carrier trunks, wholesale DID inventory, import lists, and automated client allocations.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddTrunkModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Add SIP Trunk</span>
          </button>
          <button
            onClick={() => setShowImportDidModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import DIDs List</span>
          </button>
          <button
            onClick={() => setShowAddSingleDidModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Single DID</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MetricCard label="Total SIP Trunks" value={totalSipTrunks} subValue={`${totalChannels.toLocaleString()} Total CPS`} badge="Carriers" />
        <MetricCard label="Total DID Pool" value={totalDids} subValue="E.164 Inventory" badge="DIDs" />
        <MetricCard label="Assigned DIDs" value={assignedDids} subValue="Active in production" highlight badge="Assigned" />
        <MetricCard label="Available DIDs" value={availableDids} subValue="Ready to allocate" badge="Available" />
        <MetricCard label="Suspended DIDs" value={suspendedDids} subValue="Account flag / freeze" badge="Hold" />
      </div>

      {/* Section 1: SIP Carrier Trunks Overview */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-500" />
              Wholesale SIP Carrier Trunks &amp; Associated DIDs
            </h3>
            <p className="text-[11px] text-slate-400">
              Manage trunks, view linked numbers, and import DID ranges directly to any carrier interconnect.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              {activeChannels.toLocaleString()} / {totalChannels.toLocaleString()} Active Channels ({Math.round((activeChannels / totalChannels) * 100)}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {sipProviders.map(prov => {
            const util = Math.round((prov.activeChannels / prov.maxChannels) * 100);
            const trunkDids = dids.filter(d => d.sipTrunkId === prov.id || d.provider === prov.providerName);
            const trunkAvailable = trunkDids.filter(d => d.status === 'Available').length;
            const trunkAssigned = trunkDids.filter(d => d.status === 'Assigned').length;

            return (
              <div
                key={prov.id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between hover:border-cyan-500/50 transition-all shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{prov.providerName}</span>
                    <StatusBadge status={prov.apiStatus} />
                  </div>
                  <div className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400 mb-2 truncate font-semibold">
                    {prov.sipTrunkName}
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-1 mb-2.5">
                    <div>Range: <span className="font-mono text-slate-700 dark:text-slate-300">{prov.didRange}</span></div>
                    <div>Region: {prov.country}</div>
                    <div>Contract End: <span className="font-mono">{prov.contractEnd}</span></div>
                  </div>

                  {/* Trunk DID breakdown badge */}
                  <div className="p-2 bg-white dark:bg-slate-900/80 rounded border border-slate-200/80 dark:border-slate-700/60 mb-2.5 flex items-center justify-between text-[11px] font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">LINKED DIDs</span>
                      <strong className="text-slate-900 dark:text-slate-100">{trunkDids.length}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-500 font-bold">{trunkAvailable} Avail</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span className="text-cyan-500 font-bold">{trunkAssigned} Used</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 font-mono text-[11px] space-y-2">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400 font-sans">Channels:</span>
                      <span>{prov.activeChannels} / {prov.maxChannels} ({util}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${util > 85 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                        style={{ width: `${util}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-200">
                    <span className="text-slate-400 font-sans">Wholesale:</span>
                    <span>{formatINR(prov.monthlyCost)}/mo</span>
                  </div>
                  <div className="pt-1 flex gap-1.5">
                    <button
                      onClick={() => {
                        setTrunkFilter(prov.id);
                        setSearch('');
                      }}
                      className="flex-1 py-1 text-[10px] font-sans font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-600 rounded transition-colors text-center"
                    >
                      View DIDs ({trunkDids.length})
                    </button>
                    <button
                      onClick={() => {
                        setImportTrunkId(prov.id);
                        setShowImportDidModal(true);
                      }}
                      className="px-2 py-1 text-[10px] font-sans font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded transition-colors"
                      title="Import DIDs into this Trunk"
                    >
                      + Import
                    </button>
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
              placeholder="Search DID number (+91), city/circle, or assigned client..."
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
                <option value="Tata Teleservices (TTL Enterprise)">Tata Teleservices</option>
                <option value="Bharti Airtel Business">Bharti Airtel</option>
                <option value="Reliance Jio Enterprise">Reliance Jio</option>
                <option value="Vodafone Idea (Vi Business)">Vodafone Idea (Vi)</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Trunk:</span>
              <select
                value={trunkFilter}
                onChange={e => setTrunkFilter(e.target.value)}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-hidden max-w-[140px] truncate"
              >
                <option value="All">All Trunks</option>
                {sipProviders.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.sipTrunkName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">DID Number (E.164)</th>
                <th className="py-2.5 px-3">SIP Trunk Interconnect</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Country / Type</th>
                <th className="py-2.5 px-3">Assigned Client</th>
                <th className="py-2.5 px-3">Allocation Date</th>
                <th className="py-2.5 px-3 text-right">Wholesale Cost</th>
                <th className="py-2.5 px-3 text-right">Resale Price</th>
                <th className="py-2.5 px-3 text-right">Spread Margin</th>
                <th className="py-2.5 px-3 text-right">Monthly Usage</th>
                <th className="py-2.5 px-3">DID Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredDids.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    No DID numbers found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredDids.map(did => {
                  const spread = did.sellingPrice - did.monthlyCost;
                  const marginPct = Math.round((spread / did.sellingPrice) * 100);
                  const linkedTrunk = sipProviders.find(p => p.id === did.sipTrunkId || p.sipTrunkName === did.sipTrunkName);
                  const trunkDisplayName = did.sipTrunkName || linkedTrunk?.sipTrunkName || 'Default Interconnect';

                  return (
                    <tr key={did.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {did.didNumber}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
                        {trunkDisplayName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {did.provider}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{did.country}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({did.type})</span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                        {did.assignedClient ? (
                          <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{did.assignedClient}</span>
                        ) : (
                          <span className="text-slate-400 italic">Available Pool</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                        {did.assignedDate || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {formatINR(did.monthlyCost)}/mo
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatINR(did.sellingPrice)}/mo
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-cyan-600 dark:text-cyan-400 font-semibold">
                        {marginPct}% (+{formatINR(spread)})
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
                  <span>{formatINR(assigningDid.monthlyCost)}/mo</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Client Resale Price:</span>
                  <span>{formatINR(assigningDid.sellingPrice)}/mo</span>
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

      {/* Modal: Add SIP Trunk Provider */}
      {showAddTrunkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Create Wholesale SIP Trunk Provider
                </h3>
              </div>
              <button
                onClick={() => setShowAddTrunkModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrunkSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Telecom Provider</label>
                <input
                  type="text"
                  required
                  value={newTrunkProviderName}
                  onChange={e => setNewTrunkProviderName(e.target.value)}
                  placeholder="e.g. Tata Teleservices, Bharti Airtel Business, Reliance Jio"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">SIP Trunk Name / Gateway ID</label>
                <input
                  type="text"
                  required
                  value={newTrunkName}
                  onChange={e => setNewTrunkName(e.target.value)}
                  placeholder="e.g. TRUNK-TATA-PUNE-05, TRUNK-AIRTEL-BLR-03"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">DID Prefix / Range</label>
                  <input
                    type="text"
                    value={newTrunkDidRange}
                    onChange={e => setNewTrunkDidRange(e.target.value)}
                    placeholder="+91 22 6900 XXXX"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Region / Telecom Circle</label>
                  <input
                    type="text"
                    value={newTrunkCountry}
                    onChange={e => setNewTrunkCountry(e.target.value)}
                    placeholder="India (Western / NCR Circle)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Max Channels (CPS capacity)</label>
                  <input
                    type="number"
                    min={50}
                    value={newTrunkMaxChannels}
                    onChange={e => setNewTrunkMaxChannels(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Wholesale Monthly Cost (₹)</label>
                  <input
                    type="number"
                    min={1000}
                    value={newTrunkCost}
                    onChange={e => setNewTrunkCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTrunkModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded shadow-xs"
                >
                  Create SIP Trunk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import DID Numbers to Trunk */}
      {showImportDidModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Import DID Numbers List into Trunk
                </h3>
              </div>
              <button
                onClick={() => setShowImportDidModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            {importFeedback && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{importFeedback}</span>
              </div>
            )}

            <form onSubmit={handleImportDidsSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Target SIP Trunk</label>
                <select
                  required
                  value={importTrunkId}
                  onChange={e => setImportTrunkId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  {sipProviders.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.sipTrunkName} — {p.providerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-600 dark:text-slate-300 font-medium">
                    List of DID Numbers (One per line or comma separated)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const prefix = '+91 22 6854 ';
                      const sample = Array.from({ length: 5 }, (_, i) => `${prefix}90${20 + i}`).join('\n');
                      setImportDidsText(sample);
                    }}
                    className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    Paste sample block
                  </button>
                </div>
                <textarea
                  required
                  rows={6}
                  value={importDidsText}
                  onChange={e => setImportDidsText(e.target.value)}
                  placeholder={"+91 22 6854 9020\n+91 22 6854 9021\n1800 266 8901\n+91 11 4987 3500"}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs text-slate-900 dark:text-slate-100 outline-hidden"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Duplicates and already registered DIDs will be automatically prevented from double allocation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Wholesale Cost (₹/DID/mo)</label>
                  <input
                    type="number"
                    min={0}
                    value={importCostPerDid}
                    onChange={e => setImportCostPerDid(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Resale Price (₹/DID/mo)</label>
                  <input
                    type="number"
                    min={0}
                    value={importSellingPrice}
                    onChange={e => setImportSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowImportDidModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded shadow-xs"
                >
                  Import DIDs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Single DID Number */}
      {showAddSingleDidModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Add Single DID Telephone Line
                </h3>
              </div>
              <button
                onClick={() => setShowAddSingleDidModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            {singleDidError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{singleDidError}</span>
              </div>
            )}

            <form onSubmit={handleAddSingleDidSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">DID Number (E.164)</label>
                <input
                  type="text"
                  required
                  value={singleDidNumber}
                  onChange={e => setSingleDidNumber(e.target.value)}
                  placeholder="+91 22 6854 9050 or 1800 266 8920"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">SIP Trunk Interconnect</label>
                <select
                  required
                  value={singleDidTrunkId}
                  onChange={e => setSingleDidTrunkId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  {sipProviders.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.sipTrunkName} — {p.providerName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Number Type</label>
                  <select
                    value={singleDidType}
                    onChange={e => setSingleDidType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  >
                    <option value="Local">Local Inbound</option>
                    <option value="Toll-Free">Toll-Free 1800</option>
                    <option value="Mobile">Mobile Virtual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Area Code / Circle</label>
                  <input
                    type="text"
                    value={singleDidAreaCode}
                    onChange={e => setSingleDidAreaCode(e.target.value)}
                    placeholder="022 (Mumbai)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Cost (₹/mo)</label>
                  <input
                    type="number"
                    min={0}
                    value={singleDidCost}
                    onChange={e => setSingleDidCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Price (₹/mo)</label>
                  <input
                    type="number"
                    min={0}
                    value={singleDidPrice}
                    onChange={e => setSingleDidPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSingleDidModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded shadow-xs"
                >
                  Save DID Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
