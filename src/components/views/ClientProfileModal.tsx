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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
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
  } = useApp();
  const [activeTabName, setActiveTabName] = useState<'overview' | 'gpus' | 'sips' | 'invoices' | 'payments' | 'tickets' | 'profitability'>('overview');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Related data for this client
  const clientGpus = gpus.filter(g => g.assignedClient === client.companyName);
  const clientDids = dids.filter(d => d.assignedClient === client.companyName);
  const clientInvoices = invoices.filter(i => i.clientId === client.id || i.clientName === client.companyName);
  const clientPayments = payments.filter(p => p.clientName === client.companyName);
  const clientTickets = supportTickets.filter(t => t.clientId === client.id);

  const profit = client.monthlySpend - client.monthlyCost;
  const margin = client.monthlySpend > 0 ? ((profit / client.monthlySpend) * 100).toFixed(1) : '0';

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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-400 text-[11px]">Monthly Resale Spend</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ${client.monthlySpend.toLocaleString()}/mo
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-400 text-[11px]">Wholesale Cost</div>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                    ${client.monthlyCost.toLocaleString()}/mo
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-400 text-[11px]">Wholesale Spread</div>
                  <div className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
                    ${profit.toLocaleString()}/mo ({margin}%)
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-400 text-[11px]">Requested Needs</div>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
                    {client.gpuNeededModel ? `${client.gpuNeededQuantity}x GPU` : ''} {client.didNeededType ? `${client.didNeededQuantity}x DID` : ''}
                  </div>
                </div>
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
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Allocated GPU Clusters</h4>
              {clientGpus.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded">
                  No dedicated GPU nodes assigned to this client yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {clientGpus.map(g => (
                    <div
                      key={g.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{g.gpuId} — {g.gpuModel}</div>
                        <div className="text-[11px] text-slate-400">
                          {g.provider} · {g.region} · {g.allocatedQuantity} nodes allocated
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {formatINR(g.sellingPrice * g.allocatedQuantity)}/mo
                        </div>
                        <div className="text-[10px] text-slate-400">Wholesale: {formatINR(g.monthlyCost * g.allocatedQuantity)}/mo</div>
                      </div>
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
    </div>
  );
};
