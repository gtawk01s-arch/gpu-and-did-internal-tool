import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Server,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  Layers,
  KeyRound,
  Copy,
  Check,
  Lock,
  ExternalLink,
  X,
  Share2,
  Link2,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Zap,
  Calculator,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { Client, ResourceRequirement, GpuInventoryItem } from '../../types';
import { ClientProfileModal } from './ClientProfileModal';
import { formatINR } from '../../data/mockData';

export const ClientsView: React.FC = () => {
  const {
    clients,
    createClient,
    selectedClientId,
    setSelectedClientId,
    gpus,
    dids,
    allocateGpu,
    assignDid,
    setActiveTab,
    setAuthenticatedClient,
    getClientPortalUrl,
    getClientShareMessage,
    openClientPortal,
    holdGpu,
    releaseGpuHold,
    updateClientUnbilledUsage,
    billClientUnbilledUsage,
  } = useApp();

  const [search, setSearch] = useState('');
  const [needFilter, setNeedFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [credentialsModalClient, setCredentialsModalClient] = useState<Client | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [copiedUrlOnly, setCopiedUrlOnly] = useState(false);
  const [copiedRowUrlId, setCopiedRowUrlId] = useState<string | null>(null);
  const [quickAllocClient, setQuickAllocClient] = useState<{ client: Client; type: 'gpu' | 'did' } | null>(null);

  // Unbilled Usage Modal State
  const [selectedClientForUnbilled, setSelectedClientForUnbilled] = useState<Client | null>(null);
  const [editUnbilledAmount, setEditUnbilledAmount] = useState<number>(0);
  const [editUnbilledGpuHours, setEditUnbilledGpuHours] = useState<number>(0);
  const [editUnbilledSipMinutes, setEditUnbilledSipMinutes] = useState<number>(0);

  // Hold GPU for Client Modal State
  const [holdingClientGpu, setHoldingClientGpu] = useState<{ client: Client; gpu: GpuInventoryItem } | null>(null);
  const [clientHoldReason, setClientHoldReason] = useState<string>('');
  const [clientActionFeedback, setClientActionFeedback] = useState<string | null>(null);

  // Quick allocation modal fields
  const [selectedGpuNode, setSelectedGpuNode] = useState('');
  const [selectedGpuQty, setSelectedGpuQty] = useState(8);
  const [selectedDidId, setSelectedDidId] = useState('');

  // New Client Form State
  const [newClient, setNewClient] = useState<{
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    portalUsername: string;
    portalPassword: string;
    resourceRequirement: ResourceRequirement;
    gpuNeededModel: string;
    gpuNeededQuantity: number;
    didNeededType: string;
    didNeededQuantity: number;
    autoAllocateNow: boolean;
  }>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    portalUsername: '',
    portalPassword: '',
    resourceRequirement: 'Both GPU & DID',
    gpuNeededModel: 'NVIDIA H100 SXM5 80GB',
    gpuNeededQuantity: 16,
    didNeededType: 'US Local DID Block',
    didNeededQuantity: 50,
    autoAllocateNow: true,
  });

  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  const totalRevenue = clients.reduce((sum, c) => sum + c.monthlySpend, 0);
  const totalCost = clients.reduce((sum, c) => sum + c.monthlyCost, 0);
  const overallProfit = totalRevenue - totalCost;
  const overallMargin = totalRevenue > 0 ? Math.round((overallProfit / totalRevenue) * 100) : 0;
  const totalUnbilledUsage = clients.reduce((sum, c) => sum + (c.unbilledUsage || 0), 0);

  const availableGpus = gpus.filter(g => g.quantity - g.allocatedQuantity > 0);
  const availableDids = dids.filter(d => d.status === 'Available');

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());

    const matchesNeed = needFilter === 'All' || c.resourceRequirement === needFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

    return matchesSearch && matchesNeed && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.companyName || !newClient.email) return;

    let initGpuAlloc = 0;
    let initDidAlloc = 0;
    let initSpend = 0;
    let initCost = 0;

    // If auto allocate is checked and resources are available
    if (newClient.autoAllocateNow) {
      if (newClient.resourceRequirement === 'GPU Only' || newClient.resourceRequirement === 'Both GPU & DID') {
        const matchingGpu = availableGpus.find(g => g.gpuModel === newClient.gpuNeededModel) || availableGpus[0];
        if (matchingGpu) {
          const qty = Math.min(newClient.gpuNeededQuantity, matchingGpu.quantity - matchingGpu.allocatedQuantity);
          if (qty > 0) {
            allocateGpu(matchingGpu.id, newClient.companyName, qty);
            initGpuAlloc = qty;
            initSpend += matchingGpu.sellingPrice * qty;
            initCost += matchingGpu.monthlyCost * qty;
          }
        }
      }

      if (newClient.resourceRequirement === 'DID Only' || newClient.resourceRequirement === 'Both GPU & DID') {
        const freeDids = availableDids.slice(0, Math.min(newClient.didNeededQuantity, availableDids.length));
        freeDids.forEach(d => {
          assignDid(d.id, newClient.companyName);
          initSpend += d.sellingPrice;
          initCost += d.monthlyCost;
        });
        initDidAlloc = freeDids.length;
      }
    }

    createClient({
      companyName: newClient.companyName,
      contactPerson: newClient.contactPerson,
      email: newClient.email,
      phone: newClient.phone,
      address: newClient.address,
      portalUsername: newClient.portalUsername || newClient.email,
      portalPassword: newClient.portalPassword || `${newClient.companyName.replace(/[^a-zA-Z0-9]/g, '') || 'Client'}@2026`,
      resourceRequirement: newClient.resourceRequirement,
      gpuNeededModel: newClient.gpuNeededModel,
      gpuNeededQuantity: newClient.gpuNeededQuantity,
      didNeededType: newClient.didNeededType,
      didNeededQuantity: newClient.didNeededQuantity,
      allocatedGpuCount: initGpuAlloc,
      allocatedDidCount: initDidAlloc,
      monthlySpend: initSpend,
      monthlyCost: initCost,
      marginPercent: initSpend > 0 ? Math.round(((initSpend - initCost) / initSpend) * 100) : 0,
    });

    setShowCreateModal(false);
    setNewClient({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      portalUsername: '',
      portalPassword: '',
      resourceRequirement: 'Both GPU & DID',
      gpuNeededModel: 'NVIDIA H100 SXM5 80GB',
      gpuNeededQuantity: 16,
      didNeededType: 'US Local DID Block',
      didNeededQuantity: 50,
      autoAllocateNow: true,
    });
  };

  const handleQuickGpuAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAllocClient || !selectedGpuNode) return;
    allocateGpu(selectedGpuNode, quickAllocClient.client.companyName, selectedGpuQty);
    setQuickAllocClient(null);
    setSelectedGpuNode('');
  };

  const handleQuickDidAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAllocClient || !selectedDidId) return;
    assignDid(selectedDidId, quickAllocClient.client.companyName);
    setQuickAllocClient(null);
    setSelectedDidId('');
  };

  const openUnbilledDialog = (client: Client) => {
    setSelectedClientForUnbilled(client);
    setEditUnbilledAmount(client.unbilledUsage || 0);
    setEditUnbilledGpuHours(client.unbilledGpuHours || 0);
    setEditUnbilledSipMinutes(client.unbilledSipMinutes || 0);
  };

  const handleSaveUnbilledUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClientForUnbilled) {
      updateClientUnbilledUsage(
        selectedClientForUnbilled.id,
        Number(editUnbilledAmount),
        Number(editUnbilledGpuHours),
        Number(editUnbilledSipMinutes)
      );
      setClientActionFeedback(`Updated unbilled usage for ${selectedClientForUnbilled.companyName}.`);
      setSelectedClientForUnbilled(null);
      setTimeout(() => setClientActionFeedback(null), 3000);
    }
  };

  const handleBillClientUnbilled = (clientId: string, clientName: string) => {
    billClientUnbilledUsage(clientId);
    setClientActionFeedback(`Created new draft invoice from unbilled usage for ${clientName}!`);
    setTimeout(() => setClientActionFeedback(null), 3500);
  };

  const openHoldGpuDialog = (client: Client, gpu: GpuInventoryItem) => {
    setHoldingClientGpu({ client, gpu });
    setClientHoldReason('');
  };

  const handleConfirmClientGpuHold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdingClientGpu || !clientHoldReason.trim()) return;
    holdGpu(holdingClientGpu.gpu.id, clientHoldReason.trim());
    setClientActionFeedback(`Placed ${holdingClientGpu.gpu.gpuId} for ${holdingClientGpu.client.companyName} on Hold.`);
    setHoldingClientGpu(null);
    setClientHoldReason('');
    setTimeout(() => setClientActionFeedback(null), 3500);
  };

  const handleReleaseClientGpuHold = (gpuId: string, clientName: string) => {
    releaseGpuHold(gpuId);
    setClientActionFeedback(`Released GPU hold for ${clientName} — restored to active allocation.`);
    setTimeout(() => setClientActionFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-500" />
            Client Accounts &amp; Resource Allocation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage clients, capture their GPU and DID needs, and allocate wholesale resources directly.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Client</span>
        </button>
      </div>

      {clientActionFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{clientActionFeedback}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MetricCard label="Total Client Accounts" value={clients.length} subValue="Active contracts" badge="Accounts" />
        <MetricCard label="Monthly Client Billing" value={formatINR(totalRevenue)} subValue="Gross Run-Rate" highlight badge="Revenue" />
        <MetricCard label="Wholesale Upstream Cost" value={formatINR(totalCost)} subValue="Provider Commitments" badge="Cost" />
        <MetricCard label="Net Resale Profit" value={`+${formatINR(overallProfit)}`} subValue={`${totalRevenue > 0 ? overallMargin + '%' : '–'} Margin`} badge="Profit" />
        <MetricCard label="Unbilled Usage" value={totalUnbilledUsage > 0 ? formatINR(totalUnbilledUsage) : '₹0'} subValue="Pending Cycle" badge="Unbilled" />
      </div>

      {/* Dedicated Client Portal URLs & Access Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border border-cyan-800/60 rounded-xl text-white space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-mono uppercase font-bold">
              <Share2 className="w-3 h-3 text-cyan-400" />
              <span>Dedicated Client URLs &amp; Access</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Separate Portal URLs for Every Client
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl">
              Each client has their own isolated portal URL and login credentials. Share their dedicated URL so they can log in independently to view their active GPU &amp; DID inventory and submit new capacity requests.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (clients.length > 0) {
                  setCredentialsModalClient(clients[0]);
                }
              }}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Share Client Links &amp; Credentials</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search company name, contact person, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Needs:</span>
            <select
              value={needFilter}
              onChange={e => setNeedFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-hidden"
            >
              <option value="All">All Needs</option>
              <option value="GPU Only">GPU Only</option>
              <option value="DID Only">DID Only</option>
              <option value="Both GPU & DID">Both GPU &amp; DID</option>
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
              <option value="Active">Active</option>
              <option value="Delinquent">Delinquent</option>
              <option value="Trial">Trial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Company Name</th>
                <th className="py-2.5 px-3">Contact Person</th>
                <th className="py-2.5 px-3">Resource Need</th>
                <th className="py-2.5 px-3 text-right">Allocated GPUs</th>
                <th className="py-2.5 px-3 text-right">Allocated DIDs</th>
                <th className="py-2.5 px-3 text-right">Monthly Spend</th>
                <th className="py-2.5 px-3 text-right">Profit / Margin</th>
                <th className="py-2.5 px-3 text-right">Unbilled Usage</th>
                <th className="py-2.5 px-3">Dedicated Portal URL</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredClients.map(client => {
                const clientGpuList = gpus.filter(g => g.assignedClient === client.companyName);
                const heldGpu = clientGpuList.find(g => g.status === 'Hold');
                const activeGpu = clientGpuList.find(g => g.status !== 'Hold');

                return (
                <tr
                  key={client.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                    <div>{client.companyName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{client.email}</div>
                    {heldGpu && (
                      <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[10px] text-amber-800 dark:text-amber-200 font-sans" title={`Reason: ${heldGpu.holdReason}`}>
                        <PauseCircle className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="font-bold">GPU on Hold:</span>
                        <span className="truncate max-w-[130px]">{heldGpu.holdReason || 'Administrative Hold'}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                    <div>{client.contactPerson}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{client.phone}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="space-y-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        client.resourceRequirement === 'Both GPU & DID'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                          : client.resourceRequirement === 'GPU Only'
                          ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                      }`}>
                        {client.resourceRequirement}
                      </span>
                      {client.gpuNeededModel && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Needs: {client.gpuNeededQuantity}x {client.gpuNeededModel.split(' ')[1] || client.gpuNeededModel}
                        </div>
                      )}
                      {client.didNeededType && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Needs: {client.didNeededQuantity}x {client.didNeededType}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{client.allocatedGpuCount} nodes</span>
                      {heldGpu && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold" title="Node currently on Hold">
                          (1 on Hold)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {client.allocatedDidCount} numbers
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                    {formatINR(client.monthlySpend)}/mo
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    {(() => {
                      const clientProfit = client.monthlySpend - client.monthlyCost;
                      const clientMargin = client.monthlySpend > 0 ? ((clientProfit / client.monthlySpend) * 100).toFixed(1) : '0';
                      return (
                        <div>
                          <div className="font-bold text-emerald-600 dark:text-emerald-400">
                            +{formatINR(clientProfit)}/mo
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {client.monthlySpend > 0 ? `${clientMargin}% margin` : '–'}
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="text-right">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {client.unbilledUsage && client.unbilledUsage > 0 ? formatINR(client.unbilledUsage) : '₹0'}
                        </div>
                        {(client.unbilledGpuHours || client.unbilledSipMinutes) ? (
                          <div className="text-[10px] text-slate-400">
                            {client.unbilledGpuHours ? `${client.unbilledGpuHours}h GPU ` : ''}
                            {client.unbilledSipMinutes ? `${client.unbilledSipMinutes}m SIP` : ''}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => openUnbilledDialog(client)}
                          className="p-1 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Manage / Adjust Unbilled Usage"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                        {client.unbilledUsage && client.unbilledUsage > 0 ? (
                          <button
                            onClick={() => handleBillClientUnbilled(client.id, client.companyName)}
                            className="p-1 text-amber-600 hover:text-amber-500 dark:text-amber-400 rounded hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                            title="Bill Unbilled Usage to New Invoice"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(getClientPortalUrl(client.id));
                          setCopiedRowUrlId(client.id);
                          setTimeout(() => setCopiedRowUrlId(null), 2000);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-medium transition-colors"
                        title={`Copy URL for ${client.companyName}`}
                      >
                        {copiedRowUrlId === client.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Link2 className="w-3 h-3 text-cyan-500" />
                        )}
                        <span>{copiedRowUrlId === client.id ? 'Copied URL!' : 'Copy Link'}</span>
                      </button>
                      <button
                        onClick={() => openClientPortal(client.id, false)}
                        className="p-1 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded transition-colors"
                        title="Open portal login link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {heldGpu ? (
                        <button
                          onClick={() => handleReleaseClientGpuHold(heldGpu.id, client.companyName)}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 transition-colors"
                          title="Release Hold on GPU allocation"
                        >
                          <PlayCircle className="w-3 h-3 text-emerald-600" />
                          <span>Resume GPU</span>
                        </button>
                      ) : activeGpu ? (
                        <button
                          onClick={() => openHoldGpuDialog(client, activeGpu)}
                          className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded flex items-center gap-1 transition-colors"
                          title="Place GPU allocation on Hold with a reason"
                        >
                          <PauseCircle className="w-3 h-3 text-amber-600" />
                          <span>Hold GPU</span>
                        </button>
                      ) : null}

                      <button
                        onClick={() => setCredentialsModalClient(client)}
                        className="px-2 py-1 text-[11px] font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300 rounded flex items-center gap-1 transition-colors"
                        title="Share Portal Link & Credentials"
                      >
                        <Share2 className="w-3 h-3 text-cyan-600" />
                        <span>Share &amp; Login</span>
                      </button>
                      {(client.resourceRequirement === 'GPU Only' || client.resourceRequirement === 'Both GPU & DID') && (
                        <button
                          onClick={() => setQuickAllocClient({ client, type: 'gpu' })}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded flex items-center gap-1 transition-colors"
                          title="Allocate GPU Cluster"
                        >
                          <Server className="w-3 h-3 text-cyan-500" />
                          <span>+ GPU</span>
                        </button>
                      )}
                      {(client.resourceRequirement === 'DID Only' || client.resourceRequirement === 'Both GPU & DID') && (
                        <button
                          onClick={() => setQuickAllocClient({ client, type: 'did' })}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded flex items-center gap-1 transition-colors"
                          title="Allocate DID Telephone Numbers"
                        >
                          <PhoneCall className="w-3 h-3 text-indigo-500" />
                          <span>+ DID</span>
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedClientId(client.id)}
                        className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded transition-colors"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => openClientPortal(client.id, true)}
                        className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 rounded flex items-center gap-1 transition-colors"
                        title={`Open isolated portal as ${client.companyName}`}
                      >
                        <span>Portal ↗</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Client with Resource Requirement */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Add New Wholesale Client Account
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify what resources this client needs (GPU compute, DID telephone numbers, or both).
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Company Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Company Name *</label>
                  <input
                    required
                    type="text"
                    value={newClient.companyName}
                    onChange={e => setNewClient({ ...newClient, companyName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                    placeholder="e.g. DeepNeural Labs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Contact Person *</label>
                  <input
                    required
                    type="text"
                    value={newClient.contactPerson}
                    onChange={e => setNewClient({ ...newClient, contactPerson: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                    placeholder="e.g. Dr. Arthur Vance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Work Email *</label>
                  <input
                    required
                    type="email"
                    value={newClient.email}
                    onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                    placeholder="billing@deepneural.ai"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Phone</label>
                  <input
                    type="text"
                    value={newClient.phone}
                    onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                    placeholder="+1 (415) 555-0199"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Office / Billing Address</label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={e => setNewClient({ ...newClient, address: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  placeholder="Street, City, State, Country"
                />
              </div>

              {/* Dedicated Client Portal Credentials */}
              <div className="p-3 bg-cyan-50/60 dark:bg-cyan-950/30 rounded-lg border border-cyan-200 dark:border-cyan-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-cyan-950 dark:text-cyan-200 font-bold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Client Portal Access Credentials</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const clean = (newClient.companyName || 'Client').replace(/[^a-zA-Z0-9]/g, '');
                      setNewClient({
                        ...newClient,
                        portalUsername: newClient.email || `${clean.toLowerCase()}@client.portal`,
                        portalPassword: `${clean || 'Client'}@2026`,
                      });
                    }}
                    className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                  >
                    Auto-Generate Credentials
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1 font-medium">Portal Username / Email</label>
                    <input
                      type="text"
                      value={newClient.portalUsername || newClient.email}
                      onChange={e => setNewClient({ ...newClient, portalUsername: e.target.value })}
                      placeholder="e.g. user@company.ai"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1 font-medium">Portal Access Password</label>
                    <input
                      type="text"
                      value={newClient.portalPassword || (newClient.companyName ? `${newClient.companyName.replace(/[^a-zA-Z0-9]/g, '')}@2026` : '')}
                      onChange={e => setNewClient({ ...newClient, portalPassword: e.target.value })}
                      placeholder="e.g. Company@2026"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">The client will use these credentials to log in to their self-service portal.</p>
              </div>

              {/* What resource do they need? */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-3">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  What Resource Does This Client Need?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'GPU Only', label: 'GPU Only', desc: 'Compute clusters only' },
                    { id: 'DID Only', label: 'DID / SIP Only', desc: 'Voice telephony only' },
                    { id: 'Both GPU & DID', label: 'Both GPU & DID', desc: 'Compute & Voice bundle' },
                  ].map(opt => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setNewClient({ ...newClient, resourceRequirement: opt.id as any })}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        newClient.resourceRequirement === opt.id
                          ? 'bg-cyan-50 border-cyan-500 text-cyan-950 dark:bg-cyan-950/50 dark:border-cyan-400 dark:text-cyan-100 font-semibold shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[10px] text-slate-400">{opt.desc}</div>
                    </button>
                  ))}
                </div>

                {/* If GPU Needed */}
                {(newClient.resourceRequirement === 'GPU Only' || newClient.resourceRequirement === 'Both GPU & DID') && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                      <Server className="w-3.5 h-3.5" />
                      <span>GPU Infrastructure Requirement</span>
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1 text-[11px]">GPU Model Requested</label>
                        <select
                          value={newClient.gpuNeededModel}
                          onChange={e => setNewClient({ ...newClient, gpuNeededModel: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                        >
                          <option value="NVIDIA H100 SXM5 80GB">NVIDIA H100 SXM5 80GB</option>
                          <option value="NVIDIA A100 SXM4 80GB">NVIDIA A100 SXM4 80GB</option>
                          <option value="NVIDIA L40S 48GB Ada">NVIDIA L40S 48GB Ada</option>
                          <option value="NVIDIA RTX 4090 24GB">NVIDIA RTX 4090 24GB</option>
                          <option value="NVIDIA Blackwell B200 NVL">NVIDIA Blackwell B200 NVL</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 text-[11px]">Quantity Needed</label>
                        <input
                          type="number"
                          min="1"
                          max="256"
                          value={newClient.gpuNeededQuantity}
                          onChange={e => setNewClient({ ...newClient, gpuNeededQuantity: parseInt(e.target.value) || 1 })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* If DID Needed */}
                {(newClient.resourceRequirement === 'DID Only' || newClient.resourceRequirement === 'Both GPU & DID') && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>DID Telecom Requirement</span>
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1 text-[11px]">DID Type / Country</label>
                        <select
                          value={newClient.didNeededType}
                          onChange={e => setNewClient({ ...newClient, didNeededType: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                        >
                          <option value="US Local DID Block">US Local DID Block (415/212)</option>
                          <option value="US Toll-Free 800/888">US Toll-Free 800/888</option>
                          <option value="UK & European Local DIDs">UK &amp; European Local DIDs</option>
                          <option value="Singapore & APAC Local DIDs">Singapore &amp; APAC Local DIDs</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 text-[11px]">Quantity of DIDs</label>
                        <input
                          type="number"
                          min="1"
                          max="5000"
                          value={newClient.didNeededQuantity}
                          onChange={e => setNewClient({ ...newClient, didNeededQuantity: parseInt(e.target.value) || 1 })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Instant Allocation Checkbox */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoAlloc"
                    checked={newClient.autoAllocateNow}
                    onChange={e => setNewClient({ ...newClient, autoAllocateNow: e.target.checked })}
                    className="accent-cyan-500 w-4 h-4 rounded"
                  />
                  <label htmlFor="autoAlloc" className="text-slate-700 dark:text-slate-200 cursor-pointer font-medium">
                    Automatically allocate available inventory immediately upon client creation
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg"
                >
                  Save Client &amp; Allocate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick GPU Allocate Modal for specific Client */}
      {quickAllocClient && quickAllocClient.type === 'gpu' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Allocate GPU to {quickAllocClient.client.companyName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select available node cluster from RunPod, Lambda, or CoreWeave inventory.
            </p>

            <form onSubmit={handleQuickGpuAllocate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Select Available GPU Cluster</label>
                <select
                  required
                  value={selectedGpuNode}
                  onChange={e => setSelectedGpuNode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Choose GPU Node --</option>
                  {availableGpus.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.gpuId} — {g.gpuModel} ({g.quantity - g.allocatedQuantity} free at {formatINR(g.sellingPrice)}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Number of Nodes</label>
                <input
                  type="number"
                  min="1"
                  max="64"
                  value={selectedGpuQty}
                  onChange={e => setSelectedGpuQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickAllocClient(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedGpuNode}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg disabled:opacity-50"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick DID Allocate Modal for specific Client */}
      {quickAllocClient && quickAllocClient.type === 'did' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Assign DID Number to {quickAllocClient.client.companyName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select available Indian phone number from Tata, Airtel, Jio, or Vi pool.
            </p>

            <form onSubmit={handleQuickDidAllocate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Select Available DID</label>
                <select
                  required
                  value={selectedDidId}
                  onChange={e => setSelectedDidId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                >
                  <option value="">-- Choose DID --</option>
                  {availableDids.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.didNumber} ({d.country} · {d.provider} · {formatINR(d.sellingPrice)}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickAllocClient(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedDidId}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg disabled:opacity-50"
                >
                  Assign to Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Share Client Portal URL & Credentials */}
      {credentialsModalClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 sm:p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 uppercase font-semibold">
                  Dedicated Client Portal Link
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {credentialsModalClient.companyName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Primary Contact: {credentialsModalClient.contactPerson} ({credentialsModalClient.email})
                </p>
              </div>
              <button
                onClick={() => setCredentialsModalClient(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1: Dedicated Client Portal URL */}
            <div className="p-3.5 bg-cyan-50/70 dark:bg-cyan-950/40 rounded-xl border border-cyan-200 dark:border-cyan-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
                  Separate URL for this Client
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Isolated Client Route</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  type="text"
                  value={getClientPortalUrl(credentialsModalClient.id)}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-[11px] select-all outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getClientPortalUrl(credentialsModalClient.id));
                    setCopiedUrlOnly(true);
                    setTimeout(() => setCopiedUrlOnly(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg flex items-center gap-1 transition-colors shrink-0 text-xs shadow-xs"
                >
                  {copiedUrlOnly ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrlOnly ? 'Copied URL!' : 'Copy URL'}</span>
                </button>
              </div>
            </div>

            {/* Section 2: Credentials */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Client Login Username / Email:</span>
                  <div className="text-slate-900 dark:text-slate-100 font-bold select-all text-xs mt-0.5">
                    {credentialsModalClient.portalUsername || credentialsModalClient.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(credentialsModalClient.portalUsername || credentialsModalClient.email);
                    setCopiedCreds(true);
                    setTimeout(() => setCopiedCreds(false), 1500);
                  }}
                  className="p-1 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                  title="Copy Username"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Portal Access Password:</span>
                  <div className="text-slate-900 dark:text-slate-100 font-bold select-all text-xs mt-0.5">
                    {credentialsModalClient.portalPassword || 'HyperScale@2026'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(credentialsModalClient.portalPassword || 'HyperScale@2026');
                    setCopiedCreds(true);
                    setTimeout(() => setCopiedCreds(false), 1500);
                  }}
                  className="p-1 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                  title="Copy Password"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Section 3: One-Click Invitation Copy */}
            <button
              type="button"
              onClick={() => {
                const invite = getClientShareMessage(credentialsModalClient);
                navigator.clipboard.writeText(invite);
                setCopiedCreds(true);
                setTimeout(() => setCopiedCreds(false), 2000);
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors text-xs"
            >
              {copiedCreds ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-cyan-500" />}
              <span>{copiedCreds ? 'Full Invitation Copied to Clipboard!' : 'Copy Complete Client Message (URL + Credentials)'}</span>
            </button>

            {/* Section 4: Testing & Direct Launch Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCredentialsModalClient(null);
                  openClientPortal(credentialsModalClient.id, false);
                }}
                className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors"
                title="Test Client Login Page"
              >
                <Link2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Test Login Page</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCredentialsModalClient(null);
                  openClientPortal(credentialsModalClient.id, true);
                }}
                className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                title="Log in directly as this client"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Launch Client Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manage & Adjust Unbilled Usage */}
      {selectedClientForUnbilled && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 sm:p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-cyan-500" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Manage Unbilled Usage: {selectedClientForUnbilled.companyName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Track accrued on-demand compute hours and carrier minutes awaiting the next billing run.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClientForUnbilled(null)}
                className="text-slate-400 hover:text-slate-200 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Current Unbilled Accrual</span>
                <span className="text-base font-bold text-cyan-600 dark:text-cyan-400">
                  {formatINR(selectedClientForUnbilled.unbilledUsage || 0)}
                </span>
              </div>
              <div className="text-right text-[11px] text-slate-500 font-sans">
                <div>GPU Hours: <strong>{selectedClientForUnbilled.unbilledGpuHours || 0} hrs</strong></div>
                <div>SIP Carrier Minutes: <strong>{selectedClientForUnbilled.unbilledSipMinutes || 0} mins</strong></div>
              </div>
            </div>

            <form onSubmit={handleSaveUnbilledUsage} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                  Unbilled Usage Accrual Amount (₹ INR)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={editUnbilledAmount}
                    onChange={e => setEditUnbilledAmount(Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-slate-100 text-xs"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditUnbilledAmount(prev => prev + 10000)}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-[10px] font-mono text-slate-700 dark:text-slate-300"
                    >
                      +₹10k
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditUnbilledAmount(prev => prev + 50000)}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-[10px] font-mono text-slate-700 dark:text-slate-300"
                    >
                      +₹50k
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                    Unbilled GPU Cluster Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editUnbilledGpuHours}
                    onChange={e => setEditUnbilledGpuHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                    Unbilled Carrier SIP Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editUnbilledSipMinutes}
                    onChange={e => setEditUnbilledSipMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
              </div>

              {selectedClientForUnbilled.unbilledUsage && selectedClientForUnbilled.unbilledUsage > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-800 dark:text-amber-300 block text-xs">
                      Convert Accrual to Invoice
                    </span>
                    <span className="text-[11px] text-amber-700/80 dark:text-amber-400">
                      Instantly generate a draft billing invoice and reset unbilled counters.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleBillClientUnbilled(selectedClientForUnbilled.id, selectedClientForUnbilled.companyName);
                      setSelectedClientForUnbilled(null);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Bill Now</span>
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedClientForUnbilled(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Unbilled Usage</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Place Client GPU on Hold with Required Reason */}
      {holdingClientGpu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 sm:p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PauseCircle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Place GPU on Hold: {holdingClientGpu.gpu.gpuId}
                </h3>
              </div>
              <button
                onClick={() => setHoldingClientGpu(null)}
                className="text-slate-400 hover:text-slate-200 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-between font-mono">
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{holdingClientGpu.gpu.gpuModel}</div>
                <div className="text-[11px] text-slate-500">{holdingClientGpu.client.companyName} · {holdingClientGpu.gpu.allocatedQuantity} nodes</div>
              </div>
              <div className="text-right">
                <StatusBadge status={holdingClientGpu.gpu.status} />
              </div>
            </div>

            <form onSubmit={handleConfirmClientGpuHold} className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                  Reason for Hold (Required)
                </label>
                <p className="text-[11px] text-slate-400 mb-2 font-sans">
                  Select a standardized reason or provide a specific explanation for pausing this client's GPU compute capacity.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {[
                    'Payment Overdue (Net 30 Breached)',
                    'Client Requested Temporary Pause',
                    'Scheduled Node Maintenance / Firmware',
                    'Client Usage Dispute',
                    'Security & Abuse Audit',
                    'Contract Renewal Pending',
                  ].map(preset => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setClientHoldReason(preset)}
                      className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${
                        clientHoldReason === preset
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
                  value={clientHoldReason}
                  onChange={e => setClientHoldReason(e.target.value)}
                  placeholder="Enter detailed reason for placing this GPU on hold (e.g. Overdue payment on invoice #INV-2026-004, awaiting confirmation)..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs outline-hidden"
                />
              </div>

              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Operational Note</span>
                </div>
                <p>
                  Placing on hold immediately records the hold reason, flags the client's inventory in both admin and client portals, and logs the administrative action.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setHoldingClientGpu(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!clientHoldReason.trim()}
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

      {/* Client Profile Modal */}
      {selectedClient && (
        <ClientProfileModal client={selectedClient} onClose={() => setSelectedClientId(null)} />
      )}
    </div>
  );
};
