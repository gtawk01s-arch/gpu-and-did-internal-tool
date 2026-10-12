import React from 'react';
import {
  LayoutDashboard,
  Server,
  PhoneCall,
  Users,
  Building2,
  TrendingUp,
  Receipt,
  Database,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  UserCircle2,
  GitPullRequest,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, pendingRequests, alerts, setIsClientPortalMode } = useApp();

  const pendingCount = pendingRequests.filter(r => r.status === 'Pending').length;
  const criticalCount = alerts.filter(a => !a.resolved && a.severity === 'Critical').length;
  const pendingInvoices = 0;

  const primaryItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'approvals', label: 'Resource Approvals', icon: GitPullRequest, badge: pendingCount > 0 ? `${pendingCount}` : undefined },
    { id: 'gpus', label: 'GPU Clusters', icon: Server },
    { id: 'sips', label: 'DID & SIP Trunks', icon: PhoneCall },
    { id: 'clients', label: 'Clients & Accounts', icon: Users },
    { id: 'providers', label: 'Wholesale Providers', icon: Building2 },
    { id: 'invoices', label: 'Invoices & Billing', icon: Receipt },
    { id: 'finance', label: 'Profitability & Finance', icon: TrendingUp },
  ];

  const secondaryItems = [
    { id: 'alerts', label: 'Incidents & Trunk Alerts', icon: ShieldAlert, badge: criticalCount > 0 ? String(criticalCount) : undefined },
    { id: 'audit', label: 'Audit Logs & IP Trail', icon: ShieldCheck },
    { id: 'users', label: 'Users & Passwords', icon: Lock },
    { id: 'bonus-tools', label: 'Calculators & Forecast', icon: Sparkles },
    { id: 'database', label: 'SQL Schema & Queries', icon: Database },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
  };

  return (
    <aside className="w-56 shrink-0 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between select-none transition-colors">
      <div className="p-3 space-y-5">
        <div>
          <div className="px-2 mb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Main Platform
          </div>
          <nav className="space-y-1">
            {primaryItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-2 mb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Utilities
          </div>
          <nav className="space-y-1">
            {secondaryItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Portal Switcher & Clean footer status */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] bg-white/40 dark:bg-slate-900/40 space-y-2.5">
        <button
          onClick={() => setIsClientPortalMode(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs shadow-xs transition-all"
        >
          <UserCircle2 className="w-3.5 h-3.5" />
          <span>Switch to Client Portal</span>
        </button>

        <div className="flex justify-between items-center text-slate-500 pt-1">
          <span>Resale Margin:</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">34.5%</span>
        </div>
        <div className="flex justify-between items-center text-slate-400 text-[10px]">
          <span>Tata · Airtel · Jio · E2E</span>
          <span className="text-emerald-500 font-semibold">Live (INR ₹)</span>
        </div>
      </div>
    </aside>
  );
};
