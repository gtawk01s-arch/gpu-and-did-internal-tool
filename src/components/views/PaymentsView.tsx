import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { Payment } from '../../types';

export const PaymentsView: React.FC = () => {
  const { payments, invoices, createPayment } = useApp();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showRecordModal, setShowRecordModal] = useState(false);

  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    invoiceNumber: invoices[0]?.invoiceNumber || 'INV-2026-0891',
    clientName: invoices[0]?.clientName || 'HyperScale AI Inc.',
    amount: 10000,
    method: 'ACH Wire Transfer',
    referenceNumber: '',
    status: 'Settled',
  });

  // Aggregates
  const collectedAmount = payments
    .filter(p => p.status === 'Settled')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'Processing')
    .reduce((sum, p) => sum + p.amount, 0);

  const failedAmount = payments
    .filter(p => p.status === 'Failed')
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter(p => {
    const matchesSearch =
      p.paymentId.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.referenceNumber.toLowerCase().includes(search.toLowerCase());

    const matchesMethod = methodFilter === 'All' || p.method === methodFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPayment(newPayment);
    setShowRecordModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-500" />
            Payment Settlements &amp; Remittance Ledger
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time reconciliation of Fedwire, ACH, SWIFT, and Stripe transactions.
          </p>
        </div>
        <button
          onClick={() => setShowRecordModal(true)}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Remittance</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Collected / Settled" value={`$${collectedAmount.toLocaleString()}`} subValue="Cleared to bank" highlight badge="Settled" />
        <MetricCard label="Pending Settlement" value={`$${pendingAmount.toLocaleString()}`} subValue="ACH in transit" badge="Processing" />
        <MetricCard label="Failed / Rejected" value={`$${failedAmount.toLocaleString()}`} subValue="Requires manual inquiry" badge="Failed" />
        <MetricCard label="Reconciliation Rate" value="98.2%" subValue="Auto-matched by Ref ID" badge="Ledger" />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Payment ID (PMT-XXXX), Invoice, Client, or Fedwire Ref..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Method:</span>
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-hidden"
          >
            <option value="All">All Methods</option>
            <option value="ACH Wire Transfer">ACH Wire</option>
            <option value="SWIFT Fedwire">SWIFT</option>
            <option value="Corporate Card">Corporate Card</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Payment ID</th>
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3">Client Company</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3">Settlement Date</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Reference / Wire Number</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredPayments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {p.paymentId}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-cyan-600 dark:text-cyan-400">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                    {p.clientName}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                    ${p.amount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {p.date}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                    {p.method}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                    {p.referenceNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Remittance */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Record Client Remittance
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter settlement confirmation received from Silicon Valley Bank or Stripe.
            </p>

            <form onSubmit={handleRecordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Applied Invoice</label>
                <select
                  required
                  value={newPayment.invoiceNumber}
                  onChange={e => {
                    const inv = invoices.find(i => i.invoiceNumber === e.target.value);
                    setNewPayment({
                      ...newPayment,
                      invoiceNumber: e.target.value,
                      clientName: inv?.clientName || '',
                      amount: inv?.totalAmount || 10000,
                    });
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                >
                  {invoices.map(i => (
                    <option key={i.id} value={i.invoiceNumber}>
                      {i.invoiceNumber} — {i.clientName} (${i.totalAmount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Settled Amount ($)</label>
                <input
                  type="number"
                  value={newPayment.amount}
                  onChange={e => setNewPayment({ ...newPayment, amount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Method</label>
                  <select
                    value={newPayment.method}
                    onChange={e => setNewPayment({ ...newPayment, method: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  >
                    <option value="ACH Wire Transfer">ACH Wire Transfer</option>
                    <option value="SWIFT Fedwire">SWIFT Fedwire</option>
                    <option value="Corporate Card">Corporate Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Status</label>
                  <select
                    value={newPayment.status}
                    onChange={e => setNewPayment({ ...newPayment, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  >
                    <option value="Settled">Settled</option>
                    <option value="Processing">Processing</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Reference Number (Fedwire / ACH)</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. FEDWIRE-993810294"
                  value={newPayment.referenceNumber}
                  onChange={e => setNewPayment({ ...newPayment, referenceNumber: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
