import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Send,
  CheckCircle2,
  BellRing,
  Building2,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';

interface InvoiceDetailModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, onClose }) => {
  const { markInvoicePaid, sendInvoice, sendReminder } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

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
        <div className="no-print p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Invoice: {invoice.invoiceNumber}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              invoice.status === 'Paid'
                ? 'bg-emerald-100 text-emerald-800'
                : invoice.status === 'Overdue'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {invoice.status !== 'Paid' && (
              <button
                onClick={() => markInvoicePaid(invoice.id)}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Paid</span>
              </button>
            )}
            {invoice.status === 'Draft' && (
              <button
                onClick={() => sendInvoice(invoice.id)}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded flex items-center gap-1 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Invoice</span>
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
                  AETHERVOX INFRASTRUCTURE
                </span>
              </div>
              <div className="text-slate-500 space-y-0.5 text-[11px]">
                <p>Wholesale GPU &amp; Telecom Resource Brokerage</p>
                <p>100 Montgomery St, Suite 2200, San Francisco, CA 94104</p>
                <p>Tax EIN: 94-3891048 · support@aethervox.cloud</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                INVOICE
              </div>
              <div className="text-slate-500 font-mono text-[11px] mt-1 space-y-0.5">
                <p>Number: <strong className="text-slate-900">{invoice.invoiceNumber}</strong></p>
                <p>Issue Date: {invoice.issueDate}</p>
                <p>Payment Due: <strong className="text-rose-600">{invoice.dueDate}</strong></p>
              </div>
            </div>
          </div>

          {/* Billed To / Billing Period */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="p-4 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                BILLED TO
              </span>
              <div className="font-bold text-sm text-slate-900">{invoice.clientName}</div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                <p>Accounts Payable Department</p>
                <p className="font-mono">{invoice.clientEmail}</p>
                <p>Terms: Net 30 Commercial Agreement</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                SERVICE PERIOD
              </span>
              <div className="font-mono font-bold text-sm text-slate-900">{invoice.billingPeriod}</div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                <p>Wholesale GPU Cluster Reservation &amp; Voice Channels</p>
                <p>SLA Guarantee: 99.98% High Availability</p>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="mb-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-2">Line Item Description</th>
                  <th className="py-2.5 px-2">Class</th>
                  <th className="py-2.5 px-2 text-right">Units</th>
                  <th className="py-2.5 px-2 text-right">Rate ($)</th>
                  <th className="py-2.5 px-2 text-right">Amount ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 font-sans font-medium text-slate-900">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-2 text-slate-500">
                      {item.category}
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums text-slate-700">
                      ${item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums font-bold text-slate-900">
                      ${item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Summary */}
          <div className="flex justify-end mb-8 font-mono">
            <div className="w-72 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 text-slate-600">
                <span>GPU Cluster Total:</span>
                <span>${invoice.gpuCharges.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>SIP Voice Trunks:</span>
                <span>${invoice.sipCharges.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>DID Number Allocation:</span>
                <span>${invoice.didCharges.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-slate-200 font-semibold text-slate-900">
                <span>Subtotal:</span>
                <span>${invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Datacenter Surcharge &amp; Tax:</span>
                <span>${invoice.taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-base font-black text-slate-900">
                <span>Total Amount Due:</span>
                <span>${invoice.totalAmount.toLocaleString()}</span>
              </div>
              {invoice.paidAmount !== undefined && (
                <div className="flex justify-between py-1 text-emerald-600 font-bold">
                  <span>Paid to Date:</span>
                  <span>-${invoice.paidAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Instructions & Banking Coordinates */}
          <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs">
            <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">
              PAYMENT &amp; WIRE INSTRUCTIONS
            </span>
            <p className="font-mono text-slate-700 text-[11px] leading-relaxed">
              {invoice.paymentInstructions}
            </p>
            <p className="text-[10px] text-slate-400 mt-2">
              Please include invoice reference number in the wire memo line to expedite automatic reconciliation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
