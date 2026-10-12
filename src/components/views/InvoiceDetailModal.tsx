import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Download,
  Send,
  CheckCircle2,
  BellRing,
  Building2,
  FileText,
  RotateCcw,
  Eye,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { formatINR } from '../../data/mockData';

interface InvoiceDetailModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, onClose }) => {
  const {
    markInvoicePaid,
    markInvoiceUnpaid,
    sendInvoiceToClient,
    sendReminder,
    verifyPaymentProof,
    rejectPaymentProof,
  } = useApp();
  const printRef = useRef<HTMLDivElement>(null);
  const [showFullProofModal, setShowFullProofModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const getWatermark = () => {
    if (invoice.status === 'Paid') {
      return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-15 select-none z-10">
          <div className="text-8xl font-black text-emerald-600 border-8 border-emerald-600 px-12 py-4 tracking-widest uppercase transform -rotate-12 rounded-xl">
            PAID
          </div>
        </div>
      );
    }
    if (invoice.status === 'Verification Pending') {
      return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-15 select-none z-10">
          <div className="text-7xl font-black text-purple-600 border-8 border-purple-600 px-10 py-4 tracking-widest uppercase transform -rotate-12 rounded-xl text-center">
            VERIFYING
          </div>
        </div>
      );
    }
    if (invoice.status === 'Overdue') {
      return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-15 select-none z-10">
          <div className="text-8xl font-black text-rose-600 border-8 border-rose-600 px-12 py-4 tracking-widest uppercase transform -rotate-12 rounded-xl">
            OVERDUE
          </div>
        </div>
      );
    }
    if (invoice.status === 'Draft') {
      return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-15 select-none z-10">
          <div className="text-8xl font-black text-slate-500 border-8 border-slate-500 px-12 py-4 tracking-widest uppercase transform -rotate-12 rounded-xl">
            DRAFT
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Non-printed) */}
        <div className="no-print p-4 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Invoice: {invoice.invoiceNumber}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              invoice.status === 'Paid'
                ? 'bg-emerald-100 text-emerald-800'
                : invoice.status === 'Verification Pending'
                ? 'bg-purple-100 text-purple-800'
                : invoice.status === 'Overdue'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {invoice.status}
            </span>
            {invoice.sentToClientPortal && (
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                In Client Panel
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* If proof attached, button to verify */}
            {invoice.paymentProof && invoice.status !== 'Paid' && (
              <button
                onClick={() => verifyPaymentProof(invoice.id)}
                className="px-2.5 py-1 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded flex items-center gap-1 transition-colors shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Proof &amp; Mark Paid</span>
              </button>
            )}

            {invoice.status !== 'Paid' && (
              <button
                onClick={() => markInvoicePaid(invoice.id)}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Paid</span>
              </button>
            )}

            {/* Action - Unpaid (Requirement 4) */}
            {invoice.status !== 'Unpaid' && (
              <button
                onClick={() => markInvoiceUnpaid(invoice.id)}
                className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded flex items-center gap-1 transition-colors"
                title="Mark status as Unpaid"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mark Unpaid</span>
              </button>
            )}

            {/* Action - Send to Client Panel (Requirement 3) */}
            {!invoice.sentToClientPortal && (
              <button
                onClick={() => sendInvoiceToClient(invoice.id)}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded flex items-center gap-1 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Push to Client Panel</span>
              </button>
            )}

            {invoice.status === 'Overdue' && (
              <button
                onClick={() => sendReminder(invoice.id)}
                className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-200 hover:bg-amber-300 rounded flex items-center gap-1 transition-colors"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Send Reminder</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Corporate Invoice Sheet */}
        <div ref={printRef} className="p-8 sm:p-12 overflow-y-auto relative bg-white font-sans text-xs flex-1">
          {getWatermark()}

          {/* Header & Logo */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                  AX
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900">
                  AETHERVOX WHOLESALE INFRASTRUCTURE
                </span>
              </div>
              <div className="text-slate-500 space-y-0.5 text-[11px]">
                <p>Wholesale GPU Compute Clusters &amp; Telecom DID Brokerage</p>
                <p>Maker Maxity, 4 North Ave, Bandra Kurla Complex, Mumbai 400051</p>
                <p>GSTIN: 27AABCA9481Q1ZX · billing@aethervox.cloud</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                TAX INVOICE
              </div>
              <div className="text-slate-500 font-mono text-[11px] mt-1 space-y-0.5">
                <p>Invoice No: <strong className="text-slate-900">{invoice.invoiceNumber}</strong></p>
                <p>Date of Issue: {invoice.issueDate}</p>
                <p>Payment Due: <strong className="text-rose-600">{invoice.dueDate}</strong></p>
              </div>
            </div>
          </div>

          {/* Billed To / Billing Period */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="p-4 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                BILLED TO (CLIENT)
              </span>
              <div className="font-bold text-sm text-slate-900">{invoice.clientName}</div>
              <div className="text-slate-600 text-[11px] mt-0.5 space-y-0.5">
                <p>Accounts Payable Department</p>
                <p className="font-mono">{invoice.clientEmail}</p>
                <p>Billing Currency: <strong>Indian Rupee (INR ₹)</strong></p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                SERVICE PERIOD &amp; SLA
              </span>
              <div className="font-mono font-bold text-sm text-slate-900">{invoice.billingPeriod}</div>
              <div className="text-slate-600 text-[11px] mt-0.5 space-y-0.5">
                <p>High-Throughput GPU Cluster &amp; Indian Telecom Voice Channels</p>
                <p>SLA Commitment: 99.98% High Availability Uptime</p>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="mb-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-2">Line Item Description</th>
                  <th className="py-2.5 px-2">Resource Type</th>
                  <th className="py-2.5 px-2 text-right">Units</th>
                  <th className="py-2.5 px-2 text-right">Rate (INR ₹)</th>
                  <th className="py-2.5 px-2 text-right">Amount (INR ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 font-sans font-medium text-slate-900">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-2 text-slate-500 font-sans">
                      {item.category === 'GPU' ? 'GPU Cluster' : 'DID / Trunk'}
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums text-slate-700">
                      {formatINR(item.unitPrice)}
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums font-bold text-slate-900">
                      {formatINR(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Summary */}
          <div className="flex justify-end mb-8 font-mono">
            <div className="w-80 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 text-slate-600">
                <span>GPU Cluster Total:</span>
                <span>{formatINR(invoice.gpuCharges)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>DID Telecom Allocation:</span>
                <span>{formatINR(invoice.didCharges || (invoice.sipCharges + (invoice.didCharges || 0)))}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-slate-200 font-semibold text-slate-900">
                <span>Subtotal:</span>
                <span>{formatINR(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>GST (18% Indian Standard):</span>
                <span>{formatINR(invoice.taxes)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-base font-black text-slate-900">
                <span>Total Amount Due:</span>
                <span className="text-emerald-700">{formatINR(invoice.totalAmount)}</span>
              </div>
              {invoice.paidAmount !== undefined && invoice.paidAmount > 0 && (
                <div className="flex justify-between py-1 text-emerald-600 font-bold border-t border-slate-100">
                  <span>Paid to Date:</span>
                  <span>-{formatINR(invoice.paidAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Proof Section (if client uploaded screenshot) */}
          {invoice.paymentProof && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>CLIENT REMITTANCE PROOF ATTACHED</span>
                </span>
                <span className="font-mono text-[11px] text-purple-700 font-bold">
                  UTR: {invoice.paymentProof.utrNumber || 'N/A'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-[11px] text-purple-800 font-mono mb-3">
                <div>Payment Mode: <strong>{invoice.paymentProof.paymentMode || 'RTGS'}</strong></div>
                <div>Uploaded: <strong>{invoice.paymentProof.uploadedAt}</strong></div>
                <div>Status: <strong>{invoice.status}</strong></div>
              </div>
              {invoice.paymentProof.notes && (
                <p className="text-[11px] text-purple-900 italic mb-2">"{invoice.paymentProof.notes}"</p>
              )}
              <div className="border border-purple-200 rounded overflow-hidden max-h-48 bg-slate-900 flex items-center justify-center p-2">
                <img
                  src={invoice.paymentProof.screenshotUrl}
                  alt="Payment receipt proof"
                  className="max-h-44 object-contain rounded"
                />
              </div>
            </div>
          )}

          {/* Payment Instructions & Banking Coordinates in INR */}
          <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs">
            <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">
              INDIAN BANKING &amp; RTGS / NEFT SETTLEMENT INSTRUCTIONS
            </span>
            <p className="font-mono text-slate-700 text-[11px] leading-relaxed">
              Beneficiary: AetherVox Wholesale Infrastructure Ltd<br />
              Bank Name: ICICI Bank Ltd · Branch: Nariman Point, Mumbai 400021<br />
              Current Account: 001105029381 · IFSC: ICIC0000011<br />
              Payment Ref / Remittance Memo: <strong>{invoice.invoiceNumber}</strong>
            </p>
            <p className="text-[10px] text-slate-400 mt-2">
              Clients can attach payment screenshot with UTR reference directly via Client Portal for instant verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
