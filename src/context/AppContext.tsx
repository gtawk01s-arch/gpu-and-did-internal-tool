import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  GpuInventoryItem,
  SipProvider,
  DidNumber,
  Client,
  PendingRequest,
  Provider,
  Invoice,
  Payment,
  SystemAlert,
  AuditLog,
  SupportTicket,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_GPU_INVENTORY,
  INITIAL_SIP_PROVIDERS,
  INITIAL_DID_NUMBERS,
  INITIAL_CLIENTS,
  INITIAL_PENDING_REQUESTS,
  INITIAL_PROVIDERS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SUPPORT_TICKETS,
} from '../data/mockData';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;

  // Data collections
  users: User[];
  gpus: GpuInventoryItem[];
  sipProviders: SipProvider[];
  dids: DidNumber[];
  clients: Client[];
  pendingRequests: PendingRequest[];
  providers: Provider[];
  invoices: Invoice[];
  payments: Payment[];
  alerts: SystemAlert[];
  auditLogs: AuditLog[];
  supportTickets: SupportTicket[];

  // Mutators
  allocateGpu: (id: string, clientName: string, quantity: number) => void;
  reclaimGpu: (id: string) => void;
  transferGpu: (id: string, targetClient: string) => void;
  assignDid: (id: string, clientName: string) => void;
  releaseDid: (id: string) => void;
  suspendDid: (id: string) => void;
  portDid: (id: string) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  holdRequest: (id: string) => void;
  createRequest: (req: Partial<PendingRequest>) => void;
  createInvoice: (invoice: Partial<Invoice>) => void;
  markInvoicePaid: (id: string) => void;
  sendInvoice: (id: string) => void;
  sendReminder: (id: string) => void;
  createPayment: (payment: Partial<Payment>) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  createAlert: (alert: Partial<SystemAlert>) => void;
  createUser: (user: Partial<User>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
  createClient: (client: Partial<Client>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  addAuditLog: (action: AuditLog['action'], oldValue: string, newValue: string, resourceId?: string) => void;
  authenticatedClient: Client | null;
  clientLogin: (usernameOrEmail: string, password: string) => { success: boolean; error?: string };
  clientLogout: () => void;
  setAuthenticatedClient: (client: Client | null) => void;
  updateClientCredentials: (clientId: string, username: string, password: string) => void;

  // Dedicated Client URL & Portal Mode
  isClientPortalMode: boolean;
  setIsClientPortalMode: (mode: boolean) => void;
  targetClientIdFromUrl: string | null;
  setTargetClientIdFromUrl: (id: string | null) => void;
  getClientPortalUrl: (clientId?: string) => string;
  getClientShareMessage: (client: Client) => string;
  openClientPortal: (clientId: string, autoLogin?: boolean) => void;
  returnToBrokerAdmin: (targetTab?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const [gpus, setGpus] = useState<GpuInventoryItem[]>(INITIAL_GPU_INVENTORY);
  const [sipProviders, setSipProviders] = useState<SipProvider[]>(INITIAL_SIP_PROVIDERS);
  const [dids, setDids] = useState<DidNumber[]>(INITIAL_DID_NUMBERS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>(INITIAL_PENDING_REQUESTS);
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);

  const [authenticatedClient, setAuthenticatedClient] = useState<Client | null>(null);

  // Parse initial URL parameters or hash for client portal
  const [isClientPortalMode, setIsClientPortalMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash || '';
    return (
      params.get('portal') === 'client' ||
      params.get('view') === 'client-portal' ||
      params.get('tab') === 'client-portal' ||
      params.has('clientId') ||
      params.has('client') ||
      hash.includes('client') ||
      hash.includes('portal')
    );
  });

  const [targetClientIdFromUrl, setTargetClientIdFromUrl] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash || '';
    const idFromQuery = params.get('clientId') || params.get('client') || params.get('id');
    if (idFromQuery) return idFromQuery;
    if (hash.includes('clientId=')) {
      const match = hash.match(/clientId=([^&]+)/);
      if (match) return decodeURIComponent(match[1]);
    }
    return null;
  });

  const getClientPortalUrl = (clientId?: string): string => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const query = clientId ? `?portal=client&clientId=${encodeURIComponent(clientId)}` : '?portal=client';
    return `${origin}${pathname}${query}`;
  };

  const getClientShareMessage = (client: Client): string => {
    const url = getClientPortalUrl(client.id);
    const username = client.portalUsername || client.email;
    const password = client.portalPassword || 'HyperScale@2026';
    return `================================================
INFRASTRUCTURE CLIENT PORTAL ACCESS
Account: ${client.companyName}
================================================

Dedicated Portal URL:
${url}

Your Login Credentials:
• Username / Email: ${username}
• Password: ${password}

Self-Service Features:
• Raise GPU Cluster Capacity Requests (NVIDIA H100, A100, B200, L40S)
• Raise VoIP SIP Trunk & DID Telephone Number Requests
• View Live Active Infrastructure Inventory & Telemetry
• Real-time Request Tracking with Wholesale Operations Team
• View Resale Invoices & Billing Statements

Please save and bookmark your dedicated URL for instant access.
================================================`;
  };

  const openClientPortal = (clientId: string, autoLogin: boolean = false) => {
    const target = clients.find(c => c.id === clientId);
    setTargetClientIdFromUrl(clientId);
    setIsClientPortalMode(true);
    setActiveTab('client-portal');
    if (autoLogin && target) {
      setAuthenticatedClient(target);
    }
    if (typeof window !== 'undefined') {
      const newUrl = getClientPortalUrl(clientId);
      window.history.pushState({ clientId, mode: 'client' }, '', newUrl);
    }
  };

  const returnToBrokerAdmin = (targetTab: string = 'clients') => {
    setIsClientPortalMode(false);
    setActiveTab(targetTab);
    if (typeof window !== 'undefined') {
      window.history.pushState({ mode: 'admin' }, '', window.location.pathname);
    }
  };

  // Sync state on popstate (browser back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const isClient =
        params.get('portal') === 'client' ||
        params.get('view') === 'client-portal' ||
        params.has('clientId') ||
        window.location.hash.includes('client');
      setIsClientPortalMode(isClient);
      const id = params.get('clientId') || params.get('client');
      if (id) {
        setTargetClientIdFromUrl(id);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const clientLogin = (usernameOrEmail: string, password: string): { success: boolean; error?: string } => {
    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const cleanPass = password.trim();

    const matched = clients.find(c => {
      const emailMatches = c.email.toLowerCase() === cleanUser;
      const usernameMatches = c.portalUsername?.toLowerCase() === cleanUser;
      return (emailMatches || usernameMatches) && c.portalPassword === cleanPass;
    });

    if (matched) {
      if (matched.status === 'Suspended') {
        return { success: false, error: 'This client account is suspended. Please contact wholesale operations.' };
      }
      setAuthenticatedClient(matched);
      addAuditLog(
        'User Login',
        'Client Gateway',
        `Client portal session started: ${matched.contactPerson} (${matched.companyName})`
      );
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please verify your client portal email/username and password.',
    };
  };

  const clientLogout = () => {
    if (authenticatedClient) {
      addAuditLog('User Login', 'Client Gateway', `Client session ended: ${authenticatedClient.companyName}`);
    }
    setAuthenticatedClient(null);
  };

  const updateClientCredentials = (clientId: string, username: string, password: string) => {
    setClients(prev =>
      prev.map(c => {
        if (c.id === clientId) {
          addAuditLog(
            'System Configuration',
            `Credentials for ${c.companyName}`,
            `Updated client portal access credentials`
          );
          return { ...c, portalUsername: username, portalPassword: password };
        }
        return c;
      })
    );
    if (authenticatedClient && authenticatedClient.id === clientId) {
      setAuthenticatedClient(prev => (prev ? { ...prev, portalUsername: username, portalPassword: password } : null));
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const switchRole = (role: UserRole) => {
    const matching = users.find(u => u.role === role);
    if (matching) {
      setCurrentUser(matching);
      addAuditLog('User Login', `Session switched to ${currentUser.name}`, `Impersonating ${matching.name} (${role})`);
      if (role === 'Client Portal User') {
        setActiveTab('client-portal');
      }
    }
  };

  const addAuditLog = (action: AuditLog['action'], oldValue: string, newValue: string, resourceId?: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      user: currentUser.name,
      role: currentUser.role,
      action,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      ipAddress: currentUser.lastIp || '198.51.100.42',
      oldValue,
      newValue,
      resourceId,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const allocateGpu = (id: string, clientName: string, quantity: number) => {
    setGpus(prev =>
      prev.map(gpu => {
        if (gpu.id === id) {
          const newAllocated = Math.min(gpu.quantity, gpu.allocatedQuantity + quantity);
          addAuditLog(
            'GPU Allocation',
            `Allocated: ${gpu.allocatedQuantity} to ${gpu.assignedClient || 'Unassigned'}`,
            `Allocated: ${newAllocated} to ${clientName}`,
            gpu.gpuId
          );
          return {
            ...gpu,
            allocatedQuantity: newAllocated,
            assignedClient: clientName,
            status: newAllocated >= gpu.quantity ? 'In Use' : 'Available',
          };
        }
        return gpu;
      })
    );
  };

  const reclaimGpu = (id: string) => {
    setGpus(prev =>
      prev.map(gpu => {
        if (gpu.id === id) {
          addAuditLog(
            'GPU Allocation',
            `Allocated to ${gpu.assignedClient || 'None'}`,
            'Reclaimed to Inventory (Available)',
            gpu.gpuId
          );
          return {
            ...gpu,
            allocatedQuantity: 0,
            assignedClient: undefined,
            status: 'Available',
          };
        }
        return gpu;
      })
    );
  };

  const transferGpu = (id: string, targetClient: string) => {
    setGpus(prev =>
      prev.map(gpu => {
        if (gpu.id === id) {
          addAuditLog(
            'GPU Allocation',
            `Assigned to ${gpu.assignedClient || 'None'}`,
            `Transferred to ${targetClient}`,
            gpu.gpuId
          );
          return {
            ...gpu,
            assignedClient: targetClient,
            status: 'In Use',
          };
        }
        return gpu;
      })
    );
  };

  const assignDid = (id: string, clientName: string) => {
    setDids(prev =>
      prev.map(did => {
        if (did.id === id) {
          addAuditLog(
            'DID Allocation',
            `Status: ${did.status} (${did.assignedClient || 'Available'})`,
            `Assigned to ${clientName}`,
            did.didNumber
          );
          return {
            ...did,
            assignedClient: clientName,
            assignedDate: new Date().toISOString().split('T')[0],
            status: 'Assigned',
          };
        }
        return did;
      })
    );
  };

  const releaseDid = (id: string) => {
    setDids(prev =>
      prev.map(did => {
        if (did.id === id) {
          addAuditLog(
            'DID Allocation',
            `Assigned to ${did.assignedClient}`,
            'Released to Available Pool',
            did.didNumber
          );
          return {
            ...did,
            assignedClient: undefined,
            assignedDate: undefined,
            status: 'Available',
          };
        }
        return did;
      })
    );
  };

  const suspendDid = (id: string) => {
    setDids(prev =>
      prev.map(did => {
        if (did.id === id) {
          const newStatus = did.status === 'Suspended' ? 'Assigned' : 'Suspended';
          addAuditLog('DID Allocation', `Status: ${did.status}`, `Status: ${newStatus}`, did.didNumber);
          return { ...did, status: newStatus };
        }
        return did;
      })
    );
  };

  const portDid = (id: string) => {
    setDids(prev =>
      prev.map(did => {
        if (did.id === id) {
          addAuditLog('DID Allocation', `Status: ${did.status}`, 'Initiated Carrier Porting', did.didNumber);
          return { ...did, status: 'Porting' };
        }
        return did;
      })
    );
  };

  const approveRequest = (id: string) => {
    const targetReq = pendingRequests.find(r => r.id === id);
    if (!targetReq) return;

    setPendingRequests(prev =>
      prev.map(req => {
        if (req.id === id) {
          addAuditLog('Approval Updated', `Status: ${req.status}`, 'Status: Approved', req.requestId);
          return { ...req, status: 'Approved' };
        }
        return req;
      })
    );

    // Auto-allocate resources upon approval
    if (targetReq.resourceType === 'GPU Cluster') {
      setGpus(prev => {
        let remaining = targetReq.quantity;
        return prev.map(gpu => {
          if (remaining > 0 && gpu.quantity - gpu.allocatedQuantity > 0) {
            const alloc = Math.min(remaining, gpu.quantity - gpu.allocatedQuantity);
            remaining -= alloc;
            return {
              ...gpu,
              allocatedQuantity: gpu.allocatedQuantity + alloc,
              assignedClient: targetReq.clientName,
              status: 'In Use',
            };
          }
          return gpu;
        });
      });
      setClients(prev =>
        prev.map(c => {
          if (c.companyName === targetReq.clientName || c.id === targetReq.clientId) {
            const spend = c.monthlySpend + targetReq.sellingPrice;
            const cost = c.monthlyCost + targetReq.monthlyCost;
            return {
              ...c,
              allocatedGpuCount: c.allocatedGpuCount + targetReq.quantity,
              monthlySpend: spend,
              monthlyCost: cost,
              marginPercent: spend > 0 ? Math.round(((spend - cost) / spend) * 100) : c.marginPercent,
            };
          }
          return c;
        })
      );
    } else {
      // SIP Trunk or DID
      setDids(prev => {
        let count = 0;
        return prev.map(did => {
          if (count < 5 && did.status === 'Available') {
            count++;
            return {
              ...did,
              assignedClient: targetReq.clientName,
              assignedDate: new Date().toISOString().split('T')[0],
              status: 'Assigned',
            };
          }
          return did;
        });
      });
      setClients(prev =>
        prev.map(c => {
          if (c.companyName === targetReq.clientName || c.id === targetReq.clientId) {
            const spend = c.monthlySpend + targetReq.sellingPrice;
            const cost = c.monthlyCost + targetReq.monthlyCost;
            return {
              ...c,
              allocatedDidCount: c.allocatedDidCount + 5,
              allocatedSipCount: c.allocatedSipCount + 1,
              monthlySpend: spend,
              monthlyCost: cost,
              marginPercent: spend > 0 ? Math.round(((spend - cost) / spend) * 100) : c.marginPercent,
            };
          }
          return c;
        })
      );
    }
  };

  const rejectRequest = (id: string) => {
    setPendingRequests(prev =>
      prev.map(req => {
        if (req.id === id) {
          addAuditLog('Approval Updated', `Status: ${req.status}`, 'Status: Rejected', req.requestId);
          return { ...req, status: 'Rejected' };
        }
        return req;
      })
    );
  };

  const holdRequest = (id: string) => {
    setPendingRequests(prev =>
      prev.map(req => {
        if (req.id === id) {
          addAuditLog('Approval Updated', `Status: ${req.status}`, 'Status: Hold', req.requestId);
          return { ...req, status: 'Hold' };
        }
        return req;
      })
    );
  };

  const createRequest = (req: Partial<PendingRequest>) => {
    const newReq: PendingRequest = {
      id: `req-${Date.now()}`,
      requestId: `REQ-2026-09${Math.floor(Math.random() * 90 + 10)}`,
      clientId: req.clientId || 'clt-001',
      clientName: req.clientName || 'HyperScale AI Inc.',
      resourceType: req.resourceType || 'GPU Cluster',
      specs: req.specs || 'Custom Cluster Request',
      quantity: req.quantity || 8,
      date: new Date().toISOString().split('T')[0],
      monthlyCost: req.monthlyCost || 12000,
      sellingPrice: req.sellingPrice || 18500,
      status: 'Pending',
      requestedBy: currentUser.name,
      notes: req.notes,
    };
    setPendingRequests(prev => [newReq, ...prev]);
    addAuditLog('Approval Updated', 'None', `Created Allocation Request ${newReq.requestId}`, newReq.requestId);
  };

  const createInvoice = (inv: Partial<Invoice>) => {
    const count = invoices.length + 897;
    const invNum = `INV-2026-0${count}`;
    const newInvoice: Invoice = {
      id: `inv-0${count}`,
      invoiceNumber: invNum,
      clientId: inv.clientId || 'clt-001',
      clientName: inv.clientName || 'HyperScale AI Inc.',
      clientEmail: inv.clientEmail || 'billing@hyperscale.ai',
      billingPeriod: inv.billingPeriod || 'November 01, 2026 – November 30, 2026',
      gpuCount: inv.gpuCount || 0,
      gpuCharges: inv.gpuCharges || 0,
      sipCount: inv.sipCount || 0,
      sipCharges: inv.sipCharges || 0,
      didCount: inv.didCount || 0,
      didCharges: inv.didCharges || 0,
      subtotal: (inv.gpuCharges || 0) + (inv.sipCharges || 0) + (inv.didCharges || 0),
      taxes: Math.round(((inv.gpuCharges || 0) + (inv.sipCharges || 0) + (inv.didCharges || 0)) * 0.04),
      totalAmount:
        Math.round(((inv.gpuCharges || 0) + (inv.sipCharges || 0) + (inv.didCharges || 0)) * 1.04),
      dueDate: inv.dueDate || '2026-11-20',
      issueDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      items: inv.items || [
        {
          description: 'Standard Wholesale Resource Package',
          category: 'GPU',
          quantity: 1,
          unitPrice: inv.gpuCharges || 10000,
          total: inv.gpuCharges || 10000,
        },
      ],
      paymentInstructions: 'ACH Wire Transfer / Silicon Valley Bank / Routing: 121000358 / Ref: ' + invNum,
    };
    setInvoices(prev => [newInvoice, ...prev]);
    addAuditLog('Invoice Creation', 'None', `Created ${invNum} for ${newInvoice.clientName}`, invNum);
  };

  const markInvoicePaid = (id: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === id) {
          addAuditLog('Invoice Payment', `Status: ${inv.status}`, `Marked as Paid ($${inv.totalAmount.toLocaleString()})`, inv.invoiceNumber);
          return { ...inv, status: 'Paid', paidAmount: inv.totalAmount };
        }
        return inv;
      })
    );
  };

  const sendInvoice = (id: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === id) {
          addAuditLog('Invoice Creation', `Status: ${inv.status}`, 'Status: Invoice Sent (Emailed to client AP)', inv.invoiceNumber);
          return { ...inv, status: 'Invoice Sent' };
        }
        return inv;
      })
    );
  };

  const sendReminder = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      addAuditLog('Invoice Creation', 'Reminder Dispatched', `Automated payment reminder sent to ${inv.clientEmail}`, inv.invoiceNumber);
    }
  };

  const createPayment = (payment: Partial<Payment>) => {
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      paymentId: `PMT-2026-${Math.floor(Math.random() * 800 + 100)}`,
      invoiceNumber: payment.invoiceNumber || 'INV-2026-0891',
      clientName: payment.clientName || 'HyperScale AI Inc.',
      amount: payment.amount || 10000,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      method: payment.method || 'ACH Wire Transfer',
      referenceNumber: payment.referenceNumber || `REF-${Date.now()}`,
      status: payment.status || 'Settled',
    };
    setPayments(prev => [newPayment, ...prev]);
    addAuditLog('Invoice Payment', 'Payment Processing', `Settled $${newPayment.amount.toLocaleString()} for ${newPayment.invoiceNumber}`, newPayment.paymentId);
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, resolved: true, acknowledged: true } : a)));
  };

  const createAlert = (alert: Partial<SystemAlert>) => {
    const newAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      title: alert.title || 'System Alert',
      description: alert.description || 'System warning event triggered.',
      category: alert.category || 'GPU Inventory Low',
      severity: alert.severity || 'Medium',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      acknowledged: false,
      resolved: false,
      targetResource: alert.targetResource,
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const createUser = (user: Partial<User>) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: user.name || 'New Team Member',
      email: user.email || 'user@aethervox.cloud',
      role: user.role || 'Operations Manager',
      status: 'Active',
      lastLogin: 'Never',
      lastIp: '0.0.0.0',
      activeSessions: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [...prev, newUser]);
    addAuditLog('System Configuration', 'None', `Created user account ${newUser.email} (${newUser.role})`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          addAuditLog('System Configuration', `User: ${u.email}`, `Updated profile for ${updated.email}`);
          return updated;
        }
        return u;
      })
    );
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const newStatus = u.status === 'Active' ? 'Disabled' : 'Active';
          addAuditLog('System Configuration', `Status: ${u.status}`, `Status: ${newStatus} (${u.email})`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const createClient = (c: Partial<Client>) => {
    const count = clients.length + 1;
    const newClient: Client = {
      id: `clt-00${count}`,
      companyName: c.companyName || 'New Client Corp',
      contactPerson: c.contactPerson || 'Lead Engineer',
      phone: c.phone || '+1 (555) 000-0000',
      email: c.email || 'client@enterprise.com',
      address: c.address || '100 Enterprise Way, Suite 200',
      status: 'Active',
      portalUsername: c.portalUsername || c.email || 'client@enterprise.com',
      portalPassword: c.portalPassword || `${(c.companyName || 'Client').replace(/[^a-zA-Z0-9]/g, '')}@2026`,
      resourceRequirement: c.resourceRequirement || 'Both GPU & DID',
      gpuNeededModel: c.gpuNeededModel,
      gpuNeededQuantity: c.gpuNeededQuantity,
      didNeededType: c.didNeededType,
      didNeededQuantity: c.didNeededQuantity,
      allocatedGpuCount: c.allocatedGpuCount || 0,
      allocatedSipCount: c.allocatedSipCount || 0,
      allocatedDidCount: c.allocatedDidCount || 0,
      monthlySpend: c.monthlySpend || 0,
      monthlyCost: c.monthlyCost || 0,
      marginPercent: c.marginPercent || 35.0,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setClients(prev => [...prev, newClient]);
    addAuditLog(
      'Client Creation',
      'None',
      `Registered client ${newClient.companyName} with need: ${newClient.resourceRequirement}`
    );
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev =>
      prev.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          addAuditLog('Client Creation', `Client: ${c.companyName}`, `Updated properties for ${updated.companyName}`);
          return updated;
        }
        return c;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        selectedClientId,
        setSelectedClientId,
        selectedInvoiceId,
        setSelectedInvoiceId,
        users,
        gpus,
        sipProviders,
        dids,
        clients,
        pendingRequests,
        providers,
        invoices,
        payments,
        alerts,
        auditLogs,
        supportTickets,
        allocateGpu,
        reclaimGpu,
        transferGpu,
        assignDid,
        releaseDid,
        suspendDid,
        portDid,
        approveRequest,
        rejectRequest,
        holdRequest,
        createRequest,
        createInvoice,
        markInvoicePaid,
        sendInvoice,
        sendReminder,
        createPayment,
        acknowledgeAlert,
        resolveAlert,
        createAlert,
        createUser,
        updateUser,
        toggleUserStatus,
        createClient,
        updateClient,
        addAuditLog,
        authenticatedClient,
        clientLogin,
        clientLogout,
        setAuthenticatedClient,
        updateClientCredentials,
        isClientPortalMode,
        setIsClientPortalMode,
        targetClientIdFromUrl,
        setTargetClientIdFromUrl,
        getClientPortalUrl,
        getClientShareMessage,
        openClientPortal,
        returnToBrokerAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
