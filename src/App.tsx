/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/layout/CommandPalette';

// Views
import { DashboardView } from './components/views/DashboardView';
import { AllocationsView } from './components/views/AllocationsView';
import { GpuManagementView } from './components/views/GpuManagementView';
import { SipManagementView } from './components/views/SipManagementView';
import { ClientsView } from './components/views/ClientsView';
import { ProvidersView } from './components/views/ProvidersView';
import { FinanceView } from './components/views/FinanceView';
import { InvoicesView } from './components/views/InvoicesView';
import { PaymentsView } from './components/views/PaymentsView';
import { AlertsView } from './components/views/AlertsView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { ReportsView } from './components/views/ReportsView';
import { UsersView } from './components/views/UsersView';
import { ClientPortalView } from './components/views/ClientPortalView';
import { DatabaseDesignView } from './components/views/DatabaseDesignView';
import { BonusToolsView } from './components/views/BonusToolsView';
import { XamppGuideView } from './components/views/XamppGuideView';

import { AdminLoginView } from './components/auth/AdminLoginView';

const AppContent: React.FC = () => {
  const { activeTab, isClientPortalMode, authenticatedClient, isAdminLoggedIn, currentUser } = useApp();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // 1. HARD SECURITY ISOLATION: A client login must NEVER reach admin pages, even by changing the URL
  if (authenticatedClient || isClientPortalMode) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors p-3 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto w-full">
          <ClientPortalView />
        </div>
      </div>
    );
  }

  // 2. ADMIN GATEWAY: Enforce login before viewing admin dashboards
  if (!isAdminLoggedIn) {
    return <AdminLoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'approvals':
      case 'allocations':
        return <AllocationsView />;
      case 'gpus':
        return <GpuManagementView />;
      case 'sips':
        return <SipManagementView />;
      case 'clients':
        return <ClientsView />;
      case 'providers':
        return <ProvidersView />;
      case 'finance':
        return <FinanceView />;
      case 'invoices':
        return <InvoicesView />;
      case 'payments':
        return <PaymentsView />;
      case 'alerts':
        return <AlertsView />;
      case 'audit':
        return <AuditLogsView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersView />;
      case 'client-portal':
        return <ClientPortalView />;
      case 'database':
        // Only accessible to Super Admin in read-only mode
        return currentUser.role === 'Super Admin' ? <DatabaseDesignView /> : <DashboardView />;
      case 'bonus-tools':
        return <BonusToolsView />;
      case 'xampp':
        return <XamppGuideView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <Header onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-16">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
