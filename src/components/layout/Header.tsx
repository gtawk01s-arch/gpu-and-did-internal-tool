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
    setActiveTab,
    authenticatedClient,
    clientLogout,
    setIsClientPortalMode,
  } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);

  const activeAlerts = alerts.filter(a => !a.resolved);

  const roles: UserRole[] = [
    'Super Admin',
    'Operations Manager',
    'Finance Manager',
    'Sales Manager',
    'Support Agent',
    'Client Portal User',
  ];

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-md bg-cyan-600 flex items-center justify-center text-white font-bold text-xs tracking-wider">
          AX
        </div>
        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
          GPU &amp; SIP Wholesale Management
        </span>
      </div>

      {/* Quick Search */}
      <div className="flex-1 max-w-sm hidden sm:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search resources, clients, invoices...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
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

        {/* Client Portal Quick Button or Active Session Indicator */}
        {authenticatedClient ? (
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-lg px-2.5 py-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <button
              onClick={() => setActiveTab('client-portal')}
              className="font-bold text-emerald-800 dark:text-emerald-300 hover:underline max-w-[140px] truncate"
              title={`Logged in as ${authenticatedClient.companyName}`}
            >
              {authenticatedClient.companyName}
            </button>
            <button
              onClick={clientLogout}
              className="text-slate-400 hover:text-rose-500 ml-1 p-0.5"
              title="Sign Out of Client Portal"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setIsClientPortalMode(true);
              setActiveTab('client-portal');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800 rounded-lg transition-colors"
            title="Open Dedicated Client Portal"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden sm:inline">Client Portal</span>
          </button>
        )}

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
    </header>
  );
};
