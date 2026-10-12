import React, { useState, useEffect } from 'react';
import { Search, X, Server, PhoneCall, Users, Receipt, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { gpus, dids, clients, invoices, setActiveTab, setSelectedClientId, setSelectedInvoiceId } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingGpus = gpus.filter(
    g => g.gpuId.toLowerCase().includes(q) || g.gpuModel.toLowerCase().includes(q) || g.provider.toLowerCase().includes(q)
  ).slice(0, 3);

  const matchingClients = clients.filter(
    c => c.companyName.toLowerCase().includes(q) || c.contactPerson.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  ).slice(0, 3);

  const matchingInvoices = invoices.filter(
    i => i.invoiceNumber.toLowerCase().includes(q) || i.clientName.toLowerCase().includes(q)
  ).slice(0, 3);

  const matchingDids = dids.filter(
    d => d.didNumber.includes(q) || (d.assignedClient && d.assignedClient.toLowerCase().includes(q))
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Input */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type to search GPUs, DIDs, Clients, Invoices, or Commands..."
            className="flex-1 bg-transparent border-none outline-hidden text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="p-2 overflow-y-auto space-y-3 text-xs">
          {matchingClients.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">Clients</div>
              {matchingClients.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedClientId(c.id);
                    setActiveTab('clients');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-cyan-500" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{c.companyName}</span>
                      <span className="text-slate-400 ml-2">{c.contactPerson}</span>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ${c.monthlySpend.toLocaleString()}/mo
                  </span>
                </button>
              ))}
            </div>
          )}

          {matchingGpus.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">GPU Nodes</div>
              {matchingGpus.map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    setActiveTab('gpus');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-blue-500" />
                    <div>
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100">{g.gpuId}</span>
                      <span className="text-slate-400 ml-2">{g.gpuModel}</span>
                    </div>
                  </div>
                  <span className="text-slate-500">{g.provider} · {g.region}</span>
                </button>
              ))}
            </div>
          )}

          {matchingInvoices.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">Invoices</div>
              {matchingInvoices.map(i => (
                <button
                  key={i.id}
                  onClick={() => {
                    setSelectedInvoiceId(i.id);
                    setActiveTab('invoices');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5 text-purple-500" />
                    <div>
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100">{i.invoiceNumber}</span>
                      <span className="text-slate-400 ml-2">{i.clientName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      ${i.totalAmount.toLocaleString()}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      i.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {i.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {matchingDids.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">DID Numbers</div>
              {matchingDids.map(d => (
                <button
                  key={d.id}
                  onClick={() => {
                    setActiveTab('sips');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-mono text-slate-900 dark:text-slate-100">{d.didNumber}</span>
                  </div>
                  <span className="text-slate-400">{d.assignedClient || 'Available'}</span>
                </button>
              ))}
            </div>
          )}

          {matchingClients.length === 0 && matchingGpus.length === 0 && matchingInvoices.length === 0 && matchingDids.length === 0 && (
            <div className="p-6 text-center text-slate-400">
              No matching records found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press ESC to exit</span>
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <span className="font-mono">↑ ↓ Enter</span>
          </div>
        </div>
      </div>
    </div>
  );
};
