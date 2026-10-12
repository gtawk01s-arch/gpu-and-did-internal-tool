import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Send,
  BellRing,
  FileText,
  Printer,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { Invoice, InvoiceStatus } from '../../types';
import { InvoiceDetailModal } from './InvoiceDetailModal';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    clients,
    createInvoice,
    markInvoicePaid,
    sendInvoice,
    sendReminder,
    selectedInvoiceId,
    setSelectedInvoiceId,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Invoice Form state
  const [newInv, setNewInv] = useState<Partial<Invoice>>({
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.companyName || '',
    clientEmail: clients[0]?.email || '',
    billingPeriod: 'November 01, 2026 – November 30, 2026',
    gpuCount: 16,
    gpuCharges: 48000,
    sipCount: 2,
    sipCharges: 4800,
    didCount: 100,
    didCharges: 350,
    dueDate: '2026-11-20',
  });

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  const overdueCount = invoices.filter(i => i.status === 'Overdue').length;

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientEmail.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeInvoice = invoices.find(i => i.id === selectedInvoiceId) || null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoice(newInv);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-cyan-500" />
            Corporate Invoice &amp; Wholesale Billing Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate, dispatch, and track itemized resource invoices for GPU compute clusters and telecom blocks.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Total Invoiced (YTD)" value={`$${totalInvoiced.toLocaleString()}`} subValue="Itemized billings" badge="Total" />
        <MetricCard label="Settled / Paid" value={`$${totalPaid.toLocaleString()}`} subValue="Direct ACH / Wires" highlight badge="Collected" />
        <MetricCard label="Outstanding Balance" value={`$${totalOutstanding.toLocaleString()}`} subValue="Awaiting remittance" badge="Receivables" />
        <MetricCard label="Overdue Invoices" value={overdueCount} subValue="Escalation active" badge="Alert" />
      </div>

      {/* Filters and Search Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice number (INV-2026-XXXX), client, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-hidden"
          >
            <option value="All">All Invoices</option>
            <option value="Paid">Paid</option>
            <option value="Invoice Sent">Invoice Sent</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3">Client Company</th>
                <th className="py-2.5 px-3">Billing Period</th>
                <th className="py-2.5 px-3 text-right">GPU Charges</th>
                <th className="py-2.5 px-3 text-right">SIP / DID</th>
                <th className="py-2.5 px-3 text-right">Taxes</th>
                <th className="py-2.5 px-3 text-right">Total Amount</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredInvoices.map(inv => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  onClick={() => setSelectedInvoiceId(inv.id)}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                    <div>{inv.clientName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{inv.clientEmail}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {inv.billingPeriod}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    ${inv.gpuCharges.toLocaleString()} ({inv.gpuCount}x)
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    ${(inv.sipCharges + inv.didCharges).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                    ${inv.taxes.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                    ${inv.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {inv.dueDate}
                  </td>
                  <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="py-2.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedInvoiceId(inv.id)}
                        className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded transition-colors"
                        title="View Full Corporate Invoice"
                      >
                        View PDF
                      </button>
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => markInvoicePaid(inv.id)}
                          className="px-2 py-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
                          title="Mark Paid"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Invoice */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Generate New Client Invoice
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Itemize GPU clusters, SIP trunk gateway channels, and DID wholesale numbers.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Client Account</label>
                <select
                  required
                  value={newInv.clientName}
                  onChange={e => {
                    const c = clients.find(client => client.companyName === e.target.value);
                    setNewInv({
                      ...newInv,
                      clientName: e.target.value,
                      clientId: c?.id || '',
                      clientEmail: c?.email || '',
                    });
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.companyName}>
                      {c.companyName} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Billing Period Text</label>
                <input
                  type="text"
                  value={newInv.billingPeriod}
                  onChange={e => setNewInv({ ...newInv, billingPeriod: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">GPU Count</label>
                  <input
                    type="number"
                    value={newInv.gpuCount}
                    onChange={e => setNewInv({ ...newInv, gpuCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">GPU Charges ($)</label>
                  <input
                    type="number"
                    value={newInv.gpuCharges}
                    onChange={e => setNewInv({ ...newInv, gpuCharges: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">SIP Charges ($)</label>
                  <input
                    type="number"
                    value={newInv.sipCharges}
                    onChange={e => setNewInv({ ...newInv, sipCharges: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">DID Charges ($)</label>
                  <input
                    type="number"
                    value={newInv.didCharges}
                    onChange={e => setNewInv({ ...newInv, didCharges: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Due Date</label>
                <input
                  type="date"
                  value={newInv.dueDate}
                  onChange={e => setNewInv({ ...newInv, dueDate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Screen Printable Invoice Modal */}
      {activeInvoice && (
        <InvoiceDetailModal invoice={activeInvoice} onClose={() => setSelectedInvoiceId(null)} />
      )}
    </div>
  );
};
