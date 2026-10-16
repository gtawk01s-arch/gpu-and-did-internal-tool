import React, { useState } from 'react';
import {
  X,
  Server,
  PhoneCall,
  Receipt,
  CreditCard,
  LifeBuoy,
  TrendingUp,
  Building2,
  Mail,
  Phone,
  MapPin,
  Plus,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Link2,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Client, GpuInventoryItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatINR } from '../../data/mockData';

interface ClientProfileModalProps {
  client: Client;
  onClose: () => void;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({ client, onClose }) => {
  const {
    gpus,
    dids,
    invoices,
    payments,
    supportTickets,
    setSelectedInvoiceId,
    setActiveTab,
    setAuthenticatedClient,
    getClientPortalUrl,
    getClientShareMessage,
    openClientPortal,
    holdGpu,
    releaseGpuHold,
    billClientUnbilledUsage,
  } = useApp();
  const [activeTabName, setActiveTabName] = useState<'overview' | 'gpus' | 'sips' | 'invoices' | 'payments' | 'tickets' | 'profitability'>('overview');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Hold GPU state
  const [holdingGpu, setHoldingGpu] = useState<GpuInventoryItem | null>(null);
  const [holdReason, setHoldReason] = useState('');
  const [holdActionFeedback, setHoldActionFeedback] = useState<string | null>(null);
  const [unbilledFeedback, setUnbilledFeedback] = useState<string | null>(null);

  // Related data for this client
  const clientGpus = gpus.filter(g => g.assignedClient === client.companyName);
  const clientDids = dids.filter(d => d.assignedClient === client.companyName);
  const clientInvoices = invoices.filter(i => i.clientId === client.id || i.clientName === client.companyName);
  const clientPayments = payments.filter(p => p.clientName === client.companyName);
  const clientTickets = supportTickets.filter(t => t.clientId === client.id);

  const profit = client.monthlySpend - client.monthlyCost;
  const margin = client.monthlySpend > 0 ? ((profit / client.monthlySpend) * 100).toFixed(1) : '0';

  const handleConfirmHoldGpu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdingGpu || !holdReason.trim()) return;
    holdGpu(holdingGpu.id, holdReason.trim());
    setHoldActionFeedback(`Cluster ${holdingGpu.gpuId} placed on Hold. Reason: "${holdReason.trim()}"`);
    setHoldingGpu(null);
    setHoldReason('');
    setTimeout(() => setHoldActionFeedback(null), 3500);
  };

  const handleReleaseHoldGpu = (gpuId: string, gpuCode: string) => {
    releaseGpuHold(gpuId);
    setHoldActionFeedback(`Cluster ${gpuCode} hold released and restored to active allocation.`);
    setTimeout(() => setHoldActionFeedback(null), 3500);
  };

  const handleBillUnbilledNow = () => {
    if (!client.unbilledUsage || client.unbilledUsage <= 0) return;
    billClientUnbilledUsage(client.id);
    setUnbilledFeedback(`Generated new invoice for ${formatINR(client.unbilledUsage)} unbilled cycle usage!`);
    setTimeout(() => setUnbilledFeedback(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Strip */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{client.companyName}</h2>
              <StatusBadge status={client.status} />
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                {client.resourceRequirement}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-mono">
                <Mail className="w-3.5 h-3.5" />
                {client.email}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5" />
                {client.phone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {client.address}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'gpus', label: `Allocated GPUs (${clientGpus.length})` },
            { id: 'sips', label: `SIPs & DIDs (${clientDids.length})` },
            { id: 'invoices', label: `Invoices (${clientInvoices.length})` },
            { id: 'payments', label: `Payments (${clientPayments.length})` },
            { id: 'tickets', label: `Support (${clientTickets.length})` },
            { id: 'profitability', label: 'Profitability' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTabName(tab.id as any)}
              className={`py-3 px-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTabName === tab.id
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Tab 1: Overview */}
          {activeTabName === 'overview' && (
            <div className="space-y-4">
              {holdActionFeedback && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-300 dark:border-amber-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{holdActionFeedback}</span>
                </div>
              )}

              {unbilledFeedback && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg border border-emerald-300 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{unbilledFeedback}</span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-400 text-[11px]">Monthly Resale Spend</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatINR(client.monthlySpend)}/mo
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-400 text-[11px]">Wholesale Cost</div>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatINR(client.monthlyCost)}/mo
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-400 text-[11px]">Wholesale Spread</div>
                  <div className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
                    +{formatINR(profit)}/mo ({margin}%)
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-400 text-[11px]">Requested Needs</div>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
                    {client.gpuNeededModel ? `${client.gpuNeededQuantity}x GPU` : ''} {client.didNeededType ? `${client.didNeededQuantity}x DID` : ''}
                  </div>
                </div>
              </div>

              {/* Unbilled Usage Panel */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-xl border border-amber-500/30 dark:border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider border border-amber-300 dark:border-amber-800">
                      Unbilled Usage Accrual
                    </span>
                    <span className="text-xs text-slate-500">Current billing cycle</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                      {client.unbilledUsage && client.unbilledUsage > 0 ? formatINR(client.unbilledUsage) : '₹0'}
                    </span>
                    {(client.unbilledGpuHours || client.unbilledSipMinutes) && (
                      <span className="text-xs text-slate-500 font-mono">
                        ({client.unbilledGpuHours || 0}h GPU compute · {(client.unbilledSipMinutes || 0).toLocaleString()}m SIP minutes)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Accumulated on-demand resources consumed since last settlement.
                  </p>
                </div>

                {client.unbilledUsage && client.unbilledUsage > 0 ? (
                  <button
                    onClick={handleBillUnbilledNow}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Bill Unbilled Usage Now</span>
                  </button>
                ) : null}
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-800">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Primary Contact &amp; Terms</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div>Contact: <strong>{client.contactPerson}</strong></div>
                  <div>Account Since: <strong>{client.joinedDate}</strong></div>
                  <div>Billing Terms: <strong>Net 30 via ACH/Wire</strong></div>
                  <div>Assigned Broker Lead: <strong>Elena Rostova</strong></div>
                </div>
              </div>

              {/* Client Portal Direct URL & Credentials Card */}
              <div className="p-4 bg-cyan-50/70 dark:bg-cyan-950/40 rounded-xl border border-cyan-200 dark:border-cyan-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-cyan-950 dark:text-cyan-200 flex items-center gap-1.5 text-xs">
                      <KeyRound className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>Dedicated Client Portal Link &amp; Credentials</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Shareable URL for {client.companyName} self-service requests.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const invite = getClientShareMessage(client);
                        navigator.clipboard.writeText(invite);
                        setCopiedInvite(true);
                        setTimeout(() => setCopiedInvite(false), 2000);
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      {copiedInvite ? <Check className="w-3 h-3 text-emerald-500" /> : <Share2 className="w-3 h-3 text-cyan-500" />}
                      <span>{copiedInvite ? 'Copied Invitation!' : 'Copy Full Invite'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        openClientPortal(client.id, true);
                      }}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Launch Portal</span>
                    </button>
                  </div>
                </div>

                {/* Direct URL input */}
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    type="text"
                    value={getClientPortalUrl(client.id)}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-[11px] select-all outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(getClientPortalUrl(client.id));
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg flex items-center gap-1 transition-colors shrink-0 text-[11px] shadow-xs"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied URL!' : 'Copy URL'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1 text-slate-700 dark:text-slate-300">
                  <span>Username: <strong>{client.portalUsername || client.email}</strong></span>
                  <span>Password: <strong>{client.portalPassword || 'HyperScale@2026'}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: GPUs */}
          {activeTabName === 'gpus' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Allocated GPU Clusters</h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {clientGpus.length} Cluster{clientGpus.length === 1 ? '' : 's'} Dedicated
                </span>
              </div>

              {clientGpus.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded">
                  No dedicated GPU nodes assigned to this client yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientGpus.map(g => (
                    <div
                      key={g.id}
                      className={`p-3.5 rounded-lg border font-mono transition-all ${
                        g.status === 'Hold'
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/70'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{g.gpuId} — {g.gpuModel}</span>
                            <StatusBadge status={g.status} />
                          </div>
                          <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                            {g.provider} · {g.region} · {g.allocatedQuantity} nodes allocated
                          </div>
                        </div>

                        <div className="flex items-center gap-3 justify-between sm:justify-end">
                          <div className="text-right">
                            <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              {formatINR(g.sellingPrice * g.allocatedQuantity)}/mo
                            </div>
                            <div className="text-[10px] text-slate-400">Wholesale: {formatINR(g.monthlyCost * g.allocatedQuantity)}/mo</div>
                          </div>

                          {g.status === 'Hold' ? (
                            <button
                              onClick={() => handleReleaseHoldGpu(g.id, g.gpuId)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-800 transition-colors flex items-center gap-1 shrink-0 font-sans"
                              title="Release hold and resume cluster"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Release Hold</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setHoldingGpu(g);
                                setHoldReason('');
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded flex items-center gap-1 transition-colors shrink-0 font-sans"
                              title="Place this GPU cluster on Hold with a reason"
                            >
                              <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Hold GPU</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Prominent Hold Reason Callout Banner */}
                      {g.status === 'Hold' && (
                        <div className="mt-3 p-2.5 bg-amber-100/70 dark:bg-amber-900/30 rounded-md border border-amber-300 dark:border-amber-800 text-xs font-sans space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Hold Reason:</span>
                            <span className="font-semibold text-amber-800 dark:text-amber-300">
                              {g.holdReason || 'No specific reason documented'}
                            </span>
                          </div>
                          {g.heldAt && (
                            <div className="text-[10px] text-amber-700/80 dark:text-amber-400 font-mono">
                              Held at: {g.heldAt} {g.heldBy ? `· By: ${g.heldBy}` : ''}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: DIDs */}
          {activeTabName === 'sips' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Assigned Voice DIDs &amp; Trunks</h4>
              {clientDids.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded">
                  No active DID telephone numbers assigned.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {clientDids.map(d => (
                    <div
                      key={d.id}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{d.didNumber}</div>
                        <div className="text-[10px] text-slate-400">{d.provider} ({d.country})</div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-600 dark:text-emerald-400">{formatINR(d.sellingPrice)}/mo</div>
                        <div className="text-[10px] text-slate-400">{d.usageMinutes.toLocaleString()} min</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Invoices */}
          {activeTabName === 'invoices' && (
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Billing &amp; Invoices</h4>
              {clientInvoices.map(inv => (
                <div
                  key={inv.id}
                  onClick={() => {
                    setSelectedInvoiceId(inv.id);
                    setActiveTab('invoices');
                    onClose();
                  }}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {inv.invoiceNumber}
                    </div>
                    <div className="text-[11px] text-slate-400">{inv.billingPeriod}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatINR(inv.totalAmount)}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 5: Payments */}
          {activeTabName === 'payments' && (
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Settled Payments</h4>
              {clientPayments.map(p => (
                <div
                  key={p.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{p.paymentId}</div>
                    <div className="text-[11px] text-slate-400">{p.method} · Ref: {p.referenceNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatINR(p.amount)}</div>
                    <div className="text-[10px] text-slate-400">{p.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 6: Support Tickets */}
          {activeTabName === 'tickets' && (
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Technical Support Tickets</h4>
              {clientTickets.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No active support tickets.</div>
              ) : (
                clientTickets.map(t => (
                  <div
                    key={t.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{t.subject}</div>
                      <div className="text-[11px] text-slate-400">
                        {t.id} · Assigned to: {t.assignedTo} · {t.createdAt}
                      </div>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 7: Profitability */}
          {activeTabName === 'profitability' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Wholesale Resale Spread Analysis</h4>
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 font-mono space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Gross Monthly Invoiced Revenue:</span>
                  <span className="font-bold tabular-nums">{formatINR(client.monthlySpend)}</span>
                </div>
                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>Minus Wholesale Upstream Cost:</span>
                  <span className="tabular-nums">-{formatINR(client.monthlyCost)}</span>
                </div>
                <div className="border-t border-emerald-300 dark:border-emerald-800 pt-2 flex justify-between font-bold text-sm text-emerald-700 dark:text-emerald-400">
                  <span>Net Wholesale Gross Profit:</span>
                  <span className="tabular-nums">{formatINR(profit)}/mo</span>
                </div>
                <div className="flex justify-between text-cyan-600 dark:text-cyan-400 font-semibold">
                  <span>Gross Resale Margin:</span>
                  <span>{margin}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Reason Field on Hold GPU */}
      {holdingGpu && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PauseCircle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Place GPU Allocation on Hold: {holdingGpu.gpuId}
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
                <div className="text-[11px] text-slate-500">{client.companyName} · {holdingGpu.allocatedQuantity} nodes</div>
              </div>
              <div className="text-right">
                <StatusBadge status={holdingGpu.status} />
              </div>
            </div>

            <form onSubmit={handleConfirmHoldGpu} className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                  Reason for Hold (Required)
                </label>
                <p className="text-[11px] text-slate-400 mb-2 font-sans">
                  Select a standardized reason or enter a specific explanation for pausing this client's GPU compute capacity.
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
                  placeholder="Enter detailed reason for placing this GPU on hold (e.g. Overdue invoice INV-2026-0891, awaiting RTGS settlement)..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs outline-hidden"
                />
              </div>

              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Administrative Impact</span>
                </div>
                <p>
                  Placing on hold immediately pauses the cluster allocation in inventory, notes the reason in audit logs, and notifies the client portal.
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
