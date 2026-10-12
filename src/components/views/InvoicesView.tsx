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
  AlertTriangle,
  IndianRupee,
  Eye,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { Invoice, InvoiceStatus, PaymentProof } from '../../types';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { formatINR } from '../../data/mockData';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    clients,
    createInvoice,
    markInvoicePaid,
    markInvoiceUnpaid,
    sendInvoiceToClient,
    sendReminder,
    verifyPaymentProof,
    rejectPaymentProof,
    selectedInvoiceId,
    setSelectedInvoiceId,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingProofInvoice, setViewingProofInvoice] = useState<Invoice | null>(null);

  // New Invoice Form state with explicit GPU and DID count and unit prices
  const [selectedClientId, setSelectedClientIdState] = useState(clients[0]?.id || '');
  const [billingPeriod, setBillingPeriod] = useState('November 01, 2026 – November 30, 2026');
  const [gpuCount, setGpuCount] = useState<number>(8);
  const [gpuUnitPrice, setGpuUnitPrice] = useState<number>(265000);
  const [didCount, setDidCount] = useState<number>(100);
  const [didUnitPrice, setDidUnitPrice] = useState<number>(650);
  const [dueDate, setDueDate] = useState('2026-11-20');
  const [directSendToClient, setDirectSendToClient] = useState(true);

  // Auto-calculated totals
  const autoGpuCharges = gpuCount * gpuUnitPrice;
  const autoDidCharges = didCount * didUnitPrice;
  const autoSubtotal = autoGpuCharges + autoDidCharges;
  const autoGst = Math.round(autoSubtotal * 0.18); // 18% GST standard in India
  const autoGrandTotal = autoSubtotal + autoGst;

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  const pendingVerificationCount = invoices.filter(i => i.status === 'Verification Pending').length;

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientEmail.toLowerCase().includes(search.toLowerCase()) ||
      (inv.paymentProof?.utrNumber && inv.paymentProof.utrNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeInvoice = invoices.find(i => i.id === selectedInvoiceId) || null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClientId) || clients[0];
    createInvoice({
      clientId: client.id,
      clientName: client.companyName,
      clientEmail: client.email,
      billingPeriod,
      gpuCount,
      gpuUnitPrice,
      gpuCharges: autoGpuCharges,
      didCount,
      didUnitPrice,
      didCharges: autoDidCharges,
      sipCount: 1,
      sipCharges: 0,
      subtotal: autoSubtotal,
      taxes: autoGst,
      totalAmount: autoGrandTotal,
      dueDate,
      sentToClientPortal: directSendToClient,
    });
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-cyan-500" />
            Corporate Invoices &amp; Wholesale Billing Hub (INR ₹)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate itemized invoices with live GPU &amp; DID calculation, push directly to Client Panel, and verify UTR payment screenshots.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create &amp; Calculate Invoice</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Total Invoiced (YTD)" value={formatINR(totalInvoiced)} subValue="All corporate billings" badge="Total" />
        <MetricCard label="Settled / Paid" value={formatINR(totalPaid)} subValue="Verified RTGS / Bank receipts" highlight badge="Collected" />
        <MetricCard label="Outstanding Balance" value={formatINR(totalOutstanding)} subValue="Awaiting client remittance" badge="Receivables" />
        <MetricCard
          label="Pending Verification"
          value={pendingVerificationCount}
          subValue="Payment screenshot attached"
          badge={pendingVerificationCount > 0 ? "Action Required" : "Up to date"}
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice number (INV-2026-XXXX), client, email, or UTR..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 outline-hidden font-medium"
          >
            <option value="All">All Invoices ({invoices.length})</option>
            <option value="Verification Pending">⚡ Verification Pending ({invoices.filter(i => i.status === 'Verification Pending').length})</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Sent to Client">Sent to Client</option>
            <option value="Overdue">Overdue</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3">Client Company</th>
                <th className="py-2.5 px-3">Billing Period</th>
                <th className="py-2.5 px-3 text-right">GPU Charges</th>
                <th className="py-2.5 px-3 text-right">DID Charges</th>
                <th className="py-2.5 px-3 text-right">GST (18%)</th>
                <th className="py-2.5 px-3 text-right">Total (INR ₹)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Client Panel</th>
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
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                    <div>{inv.clientName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{inv.clientEmail}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {inv.billingPeriod}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {formatINR(inv.gpuCharges)} <span className="text-[10px] text-slate-400">({inv.gpuCount}x)</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {formatINR(inv.didCharges || (inv.sipCharges + (inv.didCharges || 0)))} <span className="text-[10px] text-slate-400">({inv.didCount}x)</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
                    {formatINR(inv.taxes)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatINR(inv.totalAmount)}
                  </td>
                  <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={inv.status} />
                      {inv.paymentProof && (
                        <button
                          onClick={() => setViewingProofInvoice(inv)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          <span>⚡ Proof Attached</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                    {inv.sentToClientPortal ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3 h-3" />
                        <span>Visible in Panel</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => sendInvoiceToClient(inv.id)}
                        className="px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded border border-blue-200 dark:border-blue-800 transition-colors"
                        title="Send invoice directly to Client Panel"
                      >
                        Push to Panel
                      </button>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <button
                        onClick={() => setSelectedInvoiceId(inv.id)}
                        className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded transition-colors"
                        title="View Full Corporate Invoice Sheet"
                      >
                        View PDF
                      </button>

                      {/* If proof attached, prominent Verify Proof button */}
                      {inv.paymentProof && inv.status !== 'Paid' && (
                        <button
                          onClick={() => setViewingProofInvoice(inv)}
                          className="px-2 py-1 text-[11px] font-bold text-white bg-purple-600 hover:bg-purple-500 rounded transition-colors flex items-center gap-1 shadow-xs"
                          title="View Screenshot & Verify Payment"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Verify Proof</span>
                        </button>
                      )}

                      {/* Mark Paid action */}
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => markInvoicePaid(inv.id)}
                          className="px-2 py-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
                          title="Mark Paid"
                        >
                          Mark Paid
                        </button>
                      )}

                      {/* Mark Unpaid action (Requirement 4) */}
                      {inv.status !== 'Unpaid' && (
                        <button
                          onClick={() => markInvoiceUnpaid(inv.id)}
                          className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 rounded transition-colors flex items-center gap-0.5"
                          title="Set status to Unpaid"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Unpaid</span>
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

      {/* Modal: Create Invoice with Live Auto-Calculation (Requirement 8) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-cyan-500" />
                  <span>Generate Wholesale Invoice (Auto-Calculate)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Enter GPU and DID count with unit prices. Subtotal, 18% GST, and total calculate automatically.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Select Client Account</label>
                <select
                  required
                  value={selectedClientId}
                  onChange={e => setSelectedClientIdState(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.email}) - Current: {c.allocatedGpuCount} GPUs, {c.allocatedDidCount} DIDs
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Billing Period Description</label>
                <input
                  type="text"
                  required
                  value={billingPeriod}
                  onChange={e => setBillingPeriod(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              {/* Resource 1: GPU Cluster Calculation */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>1. GPU Cluster Resource</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400">{formatINR(autoGpuCharges)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">GPU Count (Nodes / Units)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={gpuCount}
                      onChange={e => setGpuCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Unit Price per GPU (₹ / month)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={gpuUnitPrice}
                      onChange={e => setGpuUnitPrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Formula: {gpuCount} GPUs × {formatINR(gpuUnitPrice)} = <strong>{formatINR(autoGpuCharges)}</strong>
                </div>
              </div>

              {/* Resource 2: Indian DID Calculation */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>2. DID Telecom Numbers &amp; Channels</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400">{formatINR(autoDidCharges)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">DID Count (Numbers)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={didCount}
                      onChange={e => setDidCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Unit Price per DID (₹ / month)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={didUnitPrice}
                      onChange={e => setDidUnitPrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Formula: {didCount} DIDs × {formatINR(didUnitPrice)} = <strong>{formatINR(autoDidCharges)}</strong>
                </div>
              </div>

              {/* Live Automatic Calculation Summary Box */}
              <div className="p-3.5 bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-xl space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Subtotal (GPU + DID):</span>
                  <span className="font-bold">{formatINR(autoSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>GST (18% Indian Standard):</span>
                  <span className="font-bold">{formatINR(autoGst)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-cyan-900 dark:text-cyan-200 pt-1.5 border-t border-cyan-200 dark:border-cyan-800">
                  <span>Auto Calculated Grand Total:</span>
                  <span className="text-base text-emerald-600 dark:text-emerald-400">{formatINR(autoGrandTotal)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="directSendCheck"
                    checked={directSendToClient}
                    onChange={e => setDirectSendToClient(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
                  />
                  <label htmlFor="directSendCheck" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                    Publish directly to Client Panel
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{directSendToClient ? 'Generate & Send to Client Panel' : 'Save as Draft'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Payment Proof Screenshot & Admin Verification (Requirement 3) */}
      {viewingProofInvoice && viewingProofInvoice.paymentProof && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden my-6">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">Verify Client Payment Proof Screenshot</h3>
                  <p className="text-[11px] text-slate-300">
                    Invoice: <strong className="text-white font-mono">{viewingProofInvoice.invoiceNumber}</strong> · Amount Due: <strong className="text-emerald-400 font-mono">{formatINR(viewingProofInvoice.totalAmount)}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingProofInvoice(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Payment Proof Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Bank UTR / Ref No:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 select-all">{viewingProofInvoice.paymentProof.utrNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Payment Mode:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{viewingProofInvoice.paymentProof.paymentMode || 'RTGS'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Uploaded At:</span>
                  <span className="text-slate-600 dark:text-slate-300">{viewingProofInvoice.paymentProof.uploadedAt}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Client:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate block">{viewingProofInvoice.clientName}</span>
                </div>
              </div>

              {viewingProofInvoice.paymentProof.notes && (
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-900 dark:text-blue-200 text-xs">
                  <strong>Client Note:</strong> {viewingProofInvoice.paymentProof.notes}
                </div>
              )}

              {/* Screenshot Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Uploaded Bank Remittance Screenshot:</span>
                  <span className="text-[11px] font-mono text-slate-400">{viewingProofInvoice.paymentProof.fileName || 'Payment_Proof.png'}</span>
                </div>
                <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 max-h-96">
                  <img
                    src={viewingProofInvoice.paymentProof.screenshotUrl}
                    alt="Payment receipt proof"
                    className="max-h-92 object-contain rounded shadow-md"
                  />
                </div>
              </div>

              {/* Actions: Verify & Mark as Paid or Reject */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl flex items-center justify-between gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    rejectPaymentProof(viewingProofInvoice.id, 'Bank UTR not credited or verification rejected by Admin');
                    setViewingProofInvoice(null);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg transition-colors border border-rose-200 dark:border-rose-800"
                >
                  Reject Proof &amp; Mark Unpaid
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingProofInvoice(null)}
                    className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      verifyPaymentProof(viewingProofInvoice.id);
                      setViewingProofInvoice(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Proof &amp; Mark as Paid</span>
                  </button>
                </div>
              </div>
            </div>
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
