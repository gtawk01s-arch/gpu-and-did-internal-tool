import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserCircle2,
  LogOut,
  KeyRound,
  ShieldCheck,
  Database,
  Trash2,
  RefreshCcw,
  Sparkles,
  Code2,
  X,
  FileCode,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette }) => {
  const {
    currentUser,
    switchRole,
    theme,
    toggleTheme,
    alerts,
    activeTab,
    setActiveTab,
    authenticatedClient,
    clientLogout,
    isClientPortalMode,
    setIsClientPortalMode,
    clients,
    gpus,
    invoices,
    apiKeys,
    clearAllMockData,
    restoreDemoData,
  } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const activeAlerts = alerts.filter(a => !a.resolved);
  const isMockActive = clients.length > 0 || gpus.length > 0;

  const roles: UserRole[] = [
    'Super Admin',
    'Operations Manager',
    'Finance Manager',
    'Sales Manager',
    'Support Agent',
    'Client Portal User',
  ];

  const handleClearMockData = () => {
    clearAllMockData();
    setActionNotice('All sample mock data has been cleared! You now have a clean production slate with zero demo records.');
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleRestoreDemoData = () => {
    restoreDemoData();
    setActionNotice('Sample demo mock data has been re-populated across all GPU, Client, and Invoice modules.');
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-xs">
          CK
        </div>
        <div>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block leading-tight">
            Celerko GPU &amp; DID Management
          </span>
          
        </div>
      </div>

      {/* 2 Portal Switcher: Admin vs Client */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shrink-0">
        <button
          onClick={() => {
            setIsClientPortalMode(false);
            if (activeTab === 'client-portal') setActiveTab('dashboard');
          }}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md font-bold transition-all ${
            !isClientPortalMode
              ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="Admin Operations & Resource Management"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
          <span>Admin Portal</span>
        </button>
        <button
          onClick={() => {
            setIsClientPortalMode(true);
            setActiveTab('client-portal');
          }}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md font-bold transition-all ${
            isClientPortalMode
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="Client Self-Service & Invoice Payment Portal"
        >
          <UserCircle2 className="w-3.5 h-3.5" />
          <span>Client Portal</span>
        </button>
      </div>

      {/* Quick Search */}
      <div className="flex-1 max-w-xs hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search resources, invoices...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        

        {/* Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertMenu(!showAlertMenu)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
            title="Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {showAlertMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-2 z-50 text-xs">
              <div className="px-3 py-1.5 font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span>System Alerts ({activeAlerts.length})</span>
                <button
                  onClick={() => {
                    setShowAlertMenu(false);
                    setActiveTab('alerts');
                  }}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline text-[11px]"
                >
                  View all
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {activeAlerts.length === 0 ? (
                  <div className="p-3 text-center text-slate-400">No active alerts</div>
                ) : (
                  activeAlerts.slice(0, 3).map(a => (
                    <div key={a.id} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{a.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{a.description}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline font-semibold">{currentUser.role}</span>
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-1 font-semibold text-slate-400 text-[10px] uppercase border-b border-slate-100 dark:border-slate-800">
                Switch Role
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    currentUser.role === r
                      ? 'text-cyan-600 dark:text-cyan-400 font-semibold bg-cyan-50 dark:bg-cyan-950/20'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mock Data Source Management Modal */}
      {showDataModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Data Source &amp; Mock Data Management
                </h3>
              </div>
              <button
                onClick={() => setShowDataModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionNotice && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionNotice}</span>
              </div>
            )}

            {/* Current State Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                Current In-Memory Database State:
              </div>
              <div className="grid grid-cols-4 gap-2 font-mono text-center">
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-sans">Clients</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{clients.length}</div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-sans">GPU Pools</div>
                  <div className="font-bold text-cyan-500">{gpus.length}</div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-sans">Invoices</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{invoices.length}</div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-sans">API Keys</div>
                  <div className="font-bold text-indigo-500">{apiKeys.length}</div>
                </div>
              </div>
            </div>

            {/* Instant UI Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
                <div className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Clear All Mock Data</span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed">
                  Wipes all demo clients, GPU nodes, invoices, and sample records. Gives you an empty canvas ready for real production entry.
                </p>
                <button
                  onClick={handleClearMockData}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors shadow-xs"
                >
                  Clear All Demo Records
                </button>
              </div>

              <div className="p-4 rounded-xl border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/50 dark:bg-cyan-950/20 space-y-2">
                <div className="font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                  <RefreshCcw className="w-4 h-4 text-cyan-500" />
                  <span>Restore Sample Data</span>
                </div>
                <p className="text-[11px] text-cyan-700 dark:text-cyan-400 leading-relaxed">
                  Re-populates the complete demo dataset with Indian wholesale clients, GPU clusters, and sample invoices.
                </p>
                <button
                  onClick={handleRestoreDemoData}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors shadow-xs"
                >
                  Restore Sample Dataset
                </button>
              </div>
            </div>

            {/* Permanent Code Explanation */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-500" />
                <span>How to remove mock data permanently in source code:</span>
              </div>
              <p>
                In <strong className="font-mono text-cyan-600 dark:text-cyan-400">src/context/AppContext.tsx</strong>, the state arrays are initialized from <strong className="font-mono">INITIAL_GPU_INVENTORY</strong>, <strong className="font-mono">INITIAL_CLIENTS</strong>, etc.
              </p>
              <div className="p-2 bg-slate-950 text-slate-300 rounded font-mono text-[10px] space-y-0.5">
                <span className="text-slate-500">// Change in src/context/AppContext.tsx:</span>
                <div className="text-rose-400">- const [gpus, setGpus] = useState(INITIAL_GPU_INVENTORY);</div>
                <div className="text-emerald-400">+ const [gpus, setGpus] = useState([]);</div>
                <div className="text-rose-400">- const [clients, setClients] = useState(INITIAL_CLIENTS);</div>
                <div className="text-emerald-400">+ const [clients, setClients] = useState([]);</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDataModal(false)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
