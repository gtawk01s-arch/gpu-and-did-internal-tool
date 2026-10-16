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
  CelerkoApiKey,
  Invoice,
  Payment,
  PaymentProof,
  SystemAlert,
  AuditLog,
  SupportTicket,
  UserAccessPermissions,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_GPU_INVENTORY,
  INITIAL_SIP_PROVIDERS,
  INITIAL_DID_NUMBERS,
  INITIAL_CLIENTS,
  INITIAL_PENDING_REQUESTS,
  INITIAL_PROVIDERS,
  INITIAL_API_KEYS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SUPPORT_TICKETS,
} from '../data/mockData';
import { hashPassword, verifyPassword } from '../utils/crypto';

export const DEFAULT_PERMISSIONS_BY_ROLE: Record<UserRole, UserAccessPermissions> = {
  'Super Admin': {
    dashboard: true,
    allocations: true,
    gpus: true,
    sips: true,
    clients: true,
    providers: true,
    finance: true,
    invoices: true,
    payments: true,
    alerts: true,
    audit: true,
    reports: true,
    users: true,
    database: true,
    bonusTools: true,
    xampp: true,
  },
  'Operations Manager': {
    dashboard: true,
    allocations: true,
    gpus: true,
    sips: true,
    clients: true,
    providers: true,
    finance: false,
    invoices: false,
    payments: false,
    alerts: true,
    audit: true,
    reports: true,
    users: false,
    database: false,
    bonusTools: true,
    xampp: false,
  },
  'Finance Manager': {
    dashboard: true,
    allocations: true,
    gpus: false,
    sips: false,
    clients: true,
    providers: true,
    finance: true,
    invoices: true,
    payments: true,
    alerts: true,
    audit: true,
    reports: true,
    users: false,
    database: false,
    bonusTools: false,
    xampp: false,
  },
  'Sales Manager': {
    dashboard: true,
    allocations: true,
    gpus: false,
    sips: false,
    clients: true,
    providers: false,
    finance: true,
    invoices: true,
    payments: false,
    alerts: false,
    audit: false,
    reports: true,
    users: false,
    database: false,
    bonusTools: true,
    xampp: false,
  },
  'Support Agent': {
    dashboard: true,
    allocations: false,
    gpus: false,
    sips: false,
    clients: true,
    providers: false,
    finance: false,
    invoices: false,
    payments: false,
    alerts: true,
    audit: false,
    reports: false,
    users: false,
    database: false,
    bonusTools: false,
    xampp: false,
  },
  'Client Portal User': {
    dashboard: false,
    allocations: false,
    gpus: false,
    sips: false,
    clients: false,
    providers: false,
    finance: false,
    invoices: false,
    payments: false,
    alerts: false,
    audit: false,
    reports: false,
    users: false,
    database: false,
    bonusTools: false,
    xampp: false,
  },
};

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  isAdminLoggedIn: boolean;
  adminLogin: (email: string, password: string) => { success: boolean; error?: string };
  adminLogout: () => void;
  calculatedResaleMargin: string;
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
  apiKeys: CelerkoApiKey[];

  // Mutators
  createApiKey: (clientId: string, name: string) => { key: string; apiKeyObj: CelerkoApiKey };
  revokeApiKey: (keyId: string) => void;
  connectProviderApi: (providerId: string, endpoint: string, secretKey: string) => void;
  updateProviderCapacity: (providerId: string, updates: Partial<Provider>) => void;

  allocateGpu: (id: string, clientName: string, quantity: number) => void;
  reclaimGpu: (id: string) => void;
  transferGpu: (id: string, targetClient: string) => void;
  assignDid: (id: string, clientName: string) => void;
  releaseDid: (id: string) => void;
  suspendDid: (id: string) => void;
  portDid: (id: string) => void;
  addSipProvider: (provider: Partial<SipProvider>) => void;
  addDidNumber: (did: Partial<DidNumber>) => { success: boolean; error?: string };
  importDidNumbers: (trunkId: string, numbersList: string[], monthlyCost?: number, sellingPrice?: number) => { added: number; skipped: number };
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  holdRequest: (id: string, reason?: string) => void;
  createRequest: (req: Partial<PendingRequest>) => void;
  createInvoice: (invoice: Partial<Invoice>) => void;
  markInvoicePaid: (id: string) => void;
  markInvoiceUnpaid: (id: string) => void;
  sendInvoice: (id: string) => void;
  sendInvoiceToClient: (id: string) => void;
  sendReminder: (id: string) => void;
  uploadPaymentProof: (invoiceId: string, proof: PaymentProof) => void;
  verifyPaymentProof: (invoiceId: string) => void;
  rejectPaymentProof: (invoiceId: string, reason?: string) => void;
  changeUserPassword: (userId: string, newPass: string) => { success: boolean; message: string };
  pingProviderApi: (providerId: string) => void;
  simulateTrunkAlert: (type: 'sip_down' | 'poor_quality' | 'failed_provision') => void;
  createPayment: (payment: Partial<Payment>) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  createAlert: (alert: Partial<SystemAlert>) => void;
  createUser: (user: Partial<User>, initialPassword?: string, permissions?: UserAccessPermissions) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => { success: boolean; message: string };
  toggleUserStatus: (id: string) => void;
  createClient: (client: Partial<Client>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  addAuditLog: (action: AuditLog['action'], oldValue: string, newValue: string, resourceId?: string) => void;
  authenticatedClient: Client | null;
  clientLogin: (usernameOrEmail: string, password: string) => { success: boolean; error?: string };
  clientLogout: () => void;
  setAuthenticatedClient: (client: Client | null) => void;
  updateClientCredentials: (clientId: string, username: string, password: string) => void;
  clearAllMockData: () => void;
  restoreDemoData: () => void;

  // Dedicated Panel URLs & Portal Mode
  isClientPortalMode: boolean;
  setIsClientPortalMode: (mode: boolean) => void;
  targetClientIdFromUrl: string | null;
  setTargetClientIdFromUrl: (id: string | null) => void;
  getAdminPanelUrl: () => string;
  getClientPortalUrl: (clientId?: string) => string;
  getClientShareMessage: (client: Client) => string;
  openClientPortal: (clientId: string, autoLogin?: boolean) => void;
  returnToBrokerAdmin: (targetTab?: string) => void;
  navigateToAdminLogin: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const [gpus, setGpus] = useState<GpuInventoryItem[]>([]);
const [sipProviders, setSipProviders] = useState<SipProvider[]>([]);
const [dids, setDids] = useState<DidNumber[]>([]);
const [clients, setClients] = useState<Client[]>([]);
const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [apiKeys, setApiKeys] = useState<CelerkoApiKey[]>([]);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('celerko_admin_session');
    if (stored === 'false') return false;
    return true;
  });

  const [authenticatedClient, setAuthenticatedClient] = useState<Client | null>(null);

  // Parse initial URL parameters or hash for client portal vs admin panel
  const [isClientPortalMode, setIsClientPortalMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash || '';
    if (params.get('panel') === 'admin' || hash === '#admin') {
      return false;
    }
    return (
      params.get('panel') === 'client' ||
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

  // Calculate real-time wholesale margin dynamically - no fixed text
  const calculatedResaleMargin = (() => {
    const gpuRev = gpus.reduce((sum, g) => sum + (g.sellingPrice * g.allocatedQuantity), 0);
    const assigned = dids.filter(d => d.status === 'Assigned');
    const didRev = assigned.reduce((sum, d) => sum + d.sellingPrice, 0);
    const trunksCost = sipProviders.reduce((sum, p) => sum + p.monthlyCost, 0);
    const trunksRev = Math.round(trunksCost * 1.55);
    const totRev = gpuRev + didRev + trunksRev;
    const gpuC = gpus.reduce((sum, g) => sum + (g.monthlyCost * g.allocatedQuantity), 0);
    const didC = assigned.reduce((sum, d) => sum + d.monthlyCost, 0);
    const totCost = gpuC + didC + trunksCost;
    const profit = totRev - totCost;
    return totRev > 0 ? ((profit / totRev) * 100).toFixed(1) + '%' : '–';
  })();

  const adminLogin = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const matched = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!matched) {
      return { success: false, error: 'User account not found with this email address.' };
    }
    if (matched.status !== 'Active') {
      return { success: false, error: 'This administrative account is disabled.' };
    }
    if (!verifyPassword(cleanPass, matched.passwordHash)) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }
    setCurrentUser(matched);
    setIsAdminLoggedIn(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('celerko_admin_session', 'true');
    }
    addAuditLog('User Login', 'Admin Gateway', `Admin authenticated: ${matched.name} (${matched.role})`);
    return { success: true };
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('celerko_admin_session', 'false');
    }
    addAuditLog('User Login', 'Admin Gateway', `Admin logged out: ${currentUser.name}`);
  };

  const getAdminPanelUrl = (): string => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?panel=admin`;
  };

  const getClientPortalUrl = (clientId?: string): string => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const query = clientId ? `?panel=client&clientId=${encodeURIComponent(clientId)}` : '?panel=client';
    return `${origin}${pathname}${query}`;
  };

  const getClientShareMessage = (client: Client): string => {
    const url = getClientPortalUrl(client.id);
    const username = client.portalUsername || client.email;
    return `================================================
INFRASTRUCTURE CLIENT PORTAL ACCESS
Account: ${client.companyName}
================================================

Dedicated Portal URL:
${url}

Your Login Credentials:
• Username / Email: ${username}
• Security: Passwords are protected via SHA-256 cryptographic hashing.

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

  // Cleanly navigate to Admin Panel Login / Dashboard from Client Portal
  const returnToBrokerAdmin = (targetTab: string = 'clients') => {
    setAuthenticatedClient(null);
    setIsClientPortalMode(false);
    setActiveTab(targetTab);
    if (typeof window !== 'undefined') {
      window.history.pushState({ mode: 'admin' }, '', getAdminPanelUrl());
    }
  };

  const navigateToAdminLogin = () => {
    setAuthenticatedClient(null);
    setIsClientPortalMode(false);
    setActiveTab('dashboard');
    if (typeof window !== 'undefined') {
      window.history.pushState({ mode: 'admin' }, '', getAdminPanelUrl());
    }
  };

  // Enforce client quarantine: whenever a client is logged in, they CANNOT leave client portal
  useEffect(() => {
    if (authenticatedClient) {
      setIsClientPortalMode(true);
      setActiveTab('client-portal');
    }
  }, [authenticatedClient, activeTab, isClientPortalMode]);

  // Sync state on popstate (browser back/forward navigation) with client protection
  useEffect(() => {
    const handlePopState = () => {
      if (authenticatedClient) {
        // Locked into client portal
        setIsClientPortalMode(true);
        setActiveTab('client-portal');
        return;
      }
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
  }, [authenticatedClient]);

  const clientLogin = (usernameOrEmail: string, password: string): { success: boolean; error?: string } => {
    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const cleanPass = password.trim();

    const matched = clients.find(c => {
      const emailMatches = c.email.toLowerCase() === cleanUser;
      const usernameMatches = c.portalUsername?.toLowerCase() === cleanUser;
      const passMatches = verifyPassword(cleanPass, c.portalPasswordHash) || (c.portalPassword && c.portalPassword === cleanPass);
      return (emailMatches || usernameMatches) && passMatches;
    });

    if (matched) {
      if (matched.status === 'Suspended') {
        return { success: false, error: 'This client account is suspended. Please contact wholesale operations.' };
      }
      setAuthenticatedClient(matched);
      setIsClientPortalMode(true);
      setActiveTab('client-portal');
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
    const hashed = hashPassword(password);
    setClients(prev =>
      prev.map(c => {
        if (c.id === clientId) {
          addAuditLog(
            'System Configuration',
            `Credentials for ${c.companyName}`,
            `Updated client portal access credentials (Stored as SHA-256 hash)`
          );
          return { ...c, portalUsername: username, portalPasswordHash: hashed, portalPassword: undefined };
        }
        return c;
      })
    );
    if (authenticatedClient && authenticatedClient.id === clientId) {
      setAuthenticatedClient(prev => (prev ? { ...prev, portalUsername: username, portalPasswordHash: hashed, portalPassword: undefined } : null));
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

  const addSipProvider = (provider: Partial<SipProvider>) => {
    const newProv: SipProvider = {
      id: `sip-prov-${Date.now()}`,
      providerName: provider.providerName || 'New SIP Provider',
      sipTrunkName: provider.sipTrunkName || `TRUNK-${Date.now().toString().slice(-4)}`,
      didRange: provider.didRange || '+91 XX XXXX XXXX',
      country: provider.country || 'India',
      monthlyCost: provider.monthlyCost || 250000,
      maxChannels: provider.maxChannels || 1000,
      activeChannels: 0,
      status: 'Active',
      apiStatus: 'Operational',
      contractEnd: provider.contractEnd || '2027-12-31',
    };
    setSipProviders(prev => [...prev, newProv]);
    addAuditLog('Provider Changes', 'None', `Created SIP Trunk ${newProv.sipTrunkName} (${newProv.providerName})`, newProv.id);
  };

  const addDidNumber = (did: Partial<DidNumber>): { success: boolean; error?: string } => {
    if (!did.didNumber) {
      return { success: false, error: 'DID number is required' };
    }
    const cleanNum = did.didNumber.trim();
    const existing = dids.find(d => d.didNumber.trim() === cleanNum);
    if (existing) {
      return { success: false, error: `DID number ${cleanNum} already exists in inventory (duplicate prevented)` };
    }

    const trunk = sipProviders.find(p => p.id === did.sipTrunkId);

    const newDid: DidNumber = {
      id: `did-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      didNumber: cleanNum,
      country: did.country || 'India',
      areaCode: did.areaCode || 'Local/National',
      provider: trunk ? trunk.providerName : did.provider || 'Tata Teleservices (TTL Enterprise)',
      sipTrunkId: trunk?.id || did.sipTrunkId,
      sipTrunkName: trunk?.sipTrunkName || did.sipTrunkName,
      monthlyCost: did.monthlyCost || 250,
      sellingPrice: did.sellingPrice || 650,
      status: did.status || 'Available',
      type: did.type || 'Local',
      usageMinutes: 0,
      assignedClient: did.assignedClient,
      assignedDate: did.assignedClient ? new Date().toISOString().split('T')[0] : undefined,
    };

    setDids(prev => [...prev, newDid]);
    addAuditLog('DID Allocation', 'None', `Added DID Number ${newDid.didNumber} to ${newDid.sipTrunkName || 'Inventory'}`, newDid.id);
    return { success: true };
  };

  const importDidNumbers = (
    trunkId: string,
    numbersList: string[],
    monthlyCost: number = 250,
    sellingPrice: number = 650
  ): { added: number; skipped: number } => {
    const trunk = sipProviders.find(p => p.id === trunkId);
    let addedCount = 0;
    let skippedCount = 0;
    const newItems: DidNumber[] = [];

    // Existing numbers set for fast lookup and duplicate prevention
    const existingNumbers = new Set(dids.map(d => d.didNumber.trim()));

    numbersList.forEach(rawNum => {
      const clean = rawNum.trim();
      if (!clean) return;
      if (existingNumbers.has(clean)) {
        skippedCount++;
        return;
      }
      existingNumbers.add(clean);
      addedCount++;

      const is1800 = clean.startsWith('1800') || clean.includes('1800');
      newItems.push({
        id: `did-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        didNumber: clean,
        country: 'India',
        areaCode: is1800 ? '1800 (National Toll-Free)' : 'Pan-India E.164',
        provider: trunk ? trunk.providerName : 'Telecom Interconnect',
        sipTrunkId: trunk?.id,
        sipTrunkName: trunk?.sipTrunkName,
        monthlyCost: monthlyCost,
        sellingPrice: sellingPrice,
        status: 'Available',
        type: is1800 ? 'Toll-Free' : 'Local',
        usageMinutes: 0,
      });
    });

    if (newItems.length > 0) {
      setDids(prev => [...prev, ...newItems]);
      addAuditLog(
        'DID Allocation',
        'None',
        `Batch Imported ${addedCount} DIDs into trunk ${trunk?.sipTrunkName || trunkId}`,
        trunkId
      );
    }

    return { added: addedCount, skipped: skippedCount };
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
      // SIP Trunk or DID Number Block
      const requestedQty = Math.max(1, targetReq.quantity || 1);
      const allocatedDidIds: string[] = [];

      setDids(prev => {
        let count = 0;
        return prev.map(did => {
          // Strictly prevent allocating the same DID number to multiple clients (only allocate Available status)
          if (count < requestedQty && did.status === 'Available') {
            count++;
            allocatedDidIds.push(did.id);
            return {
              ...did,
              assignedClient: targetReq.clientName,
              assignedClientId: targetReq.clientId,
              assignedDate: new Date().toISOString().split('T')[0],
              status: 'Assigned' as const,
            };
          }
          return did;
        });
      });

      const actualAllocatedCount = Math.min(requestedQty, dids.filter(d => d.status === 'Available').length);

      setClients(prev =>
        prev.map(c => {
          if (c.companyName === targetReq.clientName || c.id === targetReq.clientId) {
            const spend = c.monthlySpend + targetReq.sellingPrice;
            const cost = c.monthlyCost + targetReq.monthlyCost;
            return {
              ...c,
              allocatedDidCount: c.allocatedDidCount + (actualAllocatedCount || requestedQty),
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

  const holdRequest = (id: string, reason?: string) => {
    const finalReason = reason && reason.trim() ? reason.trim() : 'Under executive credit & technical review';
    setPendingRequests(prev =>
      prev.map(req => {
        if (req.id === id) {
          addAuditLog('Approval Updated', `Status: ${req.status}`, `Status: Hold (Reason: ${finalReason})`, req.requestId);
          return { ...req, status: 'Hold', holdReason: finalReason };
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
    const gpuCount = inv.gpuCount || 0;
    const gpuUnitPrice = inv.gpuUnitPrice || (gpuCount > 0 && inv.gpuCharges ? Math.round(inv.gpuCharges / gpuCount) : 180000);
    const gpuCharges = inv.gpuCharges !== undefined ? inv.gpuCharges : gpuCount * gpuUnitPrice;

    const didCount = inv.didCount || 0;
    const didUnitPrice = inv.didUnitPrice || (didCount > 0 && inv.didCharges ? Math.round(inv.didCharges / didCount) : 650);
    const didCharges = inv.didCharges !== undefined ? inv.didCharges : didCount * didUnitPrice;

    const sipCharges = inv.sipCharges || 0;
    const subtotal = gpuCharges + didCharges + sipCharges;
    const taxes = Math.round(subtotal * 0.18); // 18% GST in INR
    const totalAmount = subtotal + taxes;

    const isDirectSend = inv.sentToClientPortal ?? false;
    const newInvoice: Invoice = {
      id: `inv-0${count}`,
      invoiceNumber: invNum,
      clientId: inv.clientId || 'clt-001',
      clientName: inv.clientName || 'HyperScale AI India Pvt Ltd',
      clientEmail: inv.clientEmail || 'billing@hyperscale.ai',
      billingPeriod: inv.billingPeriod || 'November 01, 2026 – November 30, 2026',
      gpuCount,
      gpuUnitPrice,
      gpuCharges,
      sipCount: inv.sipCount || 0,
      didCount,
      didUnitPrice,
      sipCharges,
      didCharges,
      subtotal,
      taxes,
      totalAmount,
      dueDate: inv.dueDate || '2026-11-20',
      issueDate: new Date().toISOString().split('T')[0],
      status: isDirectSend ? 'Sent to Client' : (inv.status || 'Draft'),
      sentToClientPortal: isDirectSend,
      sentToClientAt: isDirectSend ? new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC' : undefined,
      items: inv.items && inv.items.length > 0 ? inv.items : [
        ...(gpuCount > 0 ? [{
          description: `${gpuCount}x GPU Compute Cluster Nodes (@ ₹${gpuUnitPrice.toLocaleString('en-IN')}/unit)`,
          category: 'GPU' as const,
          quantity: gpuCount,
          unitPrice: gpuUnitPrice,
          total: gpuCharges,
        }] : []),
        ...(didCount > 0 ? [{
          description: `${didCount}x Indian DID Telecom Numbers (@ ₹${didUnitPrice.toLocaleString('en-IN')}/unit)`,
          category: 'DID' as const,
          quantity: didCount,
          unitPrice: didUnitPrice,
          total: didCharges,
        }] : []),
      ],
      paymentInstructions: 'RTGS/NEFT to ICICI Bank Current A/C: 001105029381 (IFSC: ICIC0000011) / Ref: ' + invNum,
    };
    setInvoices(prev => [newInvoice, ...prev]);
    addAuditLog('Invoice Creation', 'None', `Created ${invNum} for ${newInvoice.clientName} (Total: ₹${totalAmount.toLocaleString('en-IN')})`, invNum);
  };

  const markInvoicePaid = (id: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === id) {
          addAuditLog('Invoice Payment', `Status: ${inv.status}`, `Marked as Paid (₹${inv.totalAmount.toLocaleString('en-IN')})`, inv.invoiceNumber);
          return { ...inv, status: 'Paid', paidAmount: inv.totalAmount };
        }
        return inv;
      })
    );
  };

  const markInvoiceUnpaid = (id: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === id) {
          addAuditLog('Invoice Payment', `Status: ${inv.status}`, 'Marked as Unpaid', inv.invoiceNumber);
          return { ...inv, status: 'Unpaid', paidAmount: 0 };
        }
        return inv;
      })
    );
  };

  const sendInvoiceToClient = (id: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === id) {
          addAuditLog('Invoice Creation', `Status: ${inv.status}`, `Dispatched to Client Portal (${inv.clientName})`, inv.invoiceNumber);
          return {
            ...inv,
            status: 'Sent to Client',
            sentToClientPortal: true,
            sentToClientAt: timestamp,
          };
        }
        return inv;
      })
    );
  };

  const sendInvoice = (id: string) => {
    sendInvoiceToClient(id);
  };

  const sendReminder = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      addAuditLog('Invoice Creation', 'Reminder Dispatched', `Automated payment reminder sent to ${inv.clientEmail}`, inv.invoiceNumber);
    }
  };

  const uploadPaymentProof = (invoiceId: string, proof: PaymentProof) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          addAuditLog(
            'Invoice Payment',
            `Status: ${inv.status}`,
            `Payment proof attached: UTR ${proof.utrNumber || 'N/A'} by ${inv.clientName}`,
            inv.invoiceNumber
          );
          return {
            ...inv,
            status: 'Verification Pending',
            paymentProof: proof,
          };
        }
        return inv;
      })
    );
    createAlert({
      title: `Payment Proof Uploaded: ${invoiceId}`,
      description: `Client submitted payment screenshot & UTR reference ${proof.utrNumber || 'N/A'}. Awaiting Admin Verification in Invoices panel.`,
      category: 'Failed Payment',
      severity: 'Medium',
      targetResource: invoiceId,
    });
  };

  const verifyPaymentProof = (invoiceId: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
    setInvoices(prev =>
      prev.map(i => {
        if (i.id === invoiceId) {
          addAuditLog(
            'Invoice Payment',
            'Verification Pending',
            `Admin ${currentUser.name} verified payment proof & marked Paid (₹${i.totalAmount.toLocaleString('en-IN')})`,
            i.invoiceNumber
          );
          return {
            ...i,
            status: 'Paid',
            paidAmount: i.totalAmount,
            verifiedBy: currentUser.name,
            verifiedAt: nowStr,
          };
        }
        return i;
      })
    );
    createPayment({
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      amount: inv.totalAmount,
      method: 'NEFT / RTGS',
      referenceNumber: inv.paymentProof?.utrNumber || `VERIFIED-${Date.now()}`,
      status: 'Settled',
      verifiedBy: currentUser.name,
    });
  };

  const rejectPaymentProof = (invoiceId: string, reason: string = 'Payment screenshot / UTR could not be verified with bank') => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          addAuditLog(
            'Invoice Payment',
            'Verification Pending',
            `Admin rejected proof: ${reason}`,
            inv.invoiceNumber
          );
          return {
            ...inv,
            status: 'Unpaid',
            paymentProof: undefined,
          };
        }
        return inv;
      })
    );
  };

  const changeUserPassword = (userId: string, newPass: string): { success: boolean; message: string } => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'User account not found.' };
    }
    // Strict restriction: Admin account credentials can only change in backend!
    if (targetUser.role === 'Super Admin' || targetUser.id === 'usr-1') {
      addAuditLog(
        'System Configuration',
        `User ${targetUser.email}`,
        `Blocked UI password modification attempt on Root Admin (Backend Protected)`
      );
      return {
        success: false,
        message: 'Security Policy: Root Administrator credentials can only be changed via backend server configuration (ADMIN_ROOT_SECRET). Web UI modification is disabled.',
      };
    }

    const hashed = hashPassword(newPass);
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, passwordHash: hashed } : u))
    );

    addAuditLog(
      'System Configuration',
      `User ${targetUser.email}`,
      `Admin ${currentUser.name} updated account password (stored securely as SHA-256 hash)`
    );
    return { success: true, message: `Password for ${targetUser.email} has been updated and securely hashed.` };
  };

  const pingProviderApi = (providerId: string) => {
    setProviders(prev =>
      prev.map(p => {
        if (p.id === providerId) {
          const newLatency = Math.floor(Math.random() * 15 + 12);
          const now = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
          addAuditLog(
            'Provider Changes',
            `API Latency: ${p.apiLatencyMs}ms`,
            `Ping Success: ${newLatency}ms (Status: Operational)`,
            p.name
          );
          return {
            ...p,
            apiStatus: 'Operational',
            apiLatencyMs: newLatency,
            lastHeartbeat: now,
          };
        }
        return p;
      })
    );
  };

  const createApiKey = (clientId: string, name: string): { key: string; apiKeyObj: CelerkoApiKey } => {
    const client = clients.find(c => c.id === clientId);
    const hex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
    const fullKey = `ck_live_${hex}`;
    const keyPrefix = fullKey.substring(0, 16);
    const keyMasked = `${keyPrefix}••••••••••••••••${fullKey.slice(-4)}`;
    const hasAllocation = (client?.allocatedGpuCount || 0) > 0;

    const newApiKey: CelerkoApiKey = {
      id: `key-${Date.now()}`,
      clientId,
      clientName: client?.companyName || 'Unknown Client',
      name: name.trim() || 'Production API Key',
      keyPrefix,
      keyMasked,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'Active',
      hasActiveGpuAllocation: hasAllocation,
      rateLimitReqPerMin: 1500,
      totalRequests: 0,
    };

    setApiKeys(prev => [newApiKey, ...prev]);
    addAuditLog('System Configuration', 'None', `Client ${client?.companyName || clientId} generated API key: ${newApiKey.name}`, newApiKey.id);
    return { key: fullKey, apiKeyObj: newApiKey };
  };

  const revokeApiKey = (keyId: string) => {
    setApiKeys(prev =>
      prev.map(k => {
        if (k.id === keyId) {
          addAuditLog('System Configuration', `API Key Status: ${k.status}`, 'API Key Status: Revoked', k.id);
          return { ...k, status: 'Revoked' };
        }
        return k;
      })
    );
  };

  const connectProviderApi = (providerId: string, endpoint: string, secretKey: string) => {
    const masked = secretKey.length > 8 ? `${secretKey.substring(0, 6)}••••••••${secretKey.slice(-4)}` : '••••••••';
    setProviders(prev =>
      prev.map(p => {
        if (p.id === providerId) {
          return {
            ...p,
            apiEndpoint: endpoint,
            upstreamKeyMasked: masked,
            apiStatus: 'Operational',
            lastHeartbeat: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
          };
        }
        return p;
      })
    );
    addAuditLog('Provider Changes', 'Upstream Key Updated', `Connected Upstream Provider API Endpoint: ${endpoint}`, providerId);
  };

  const updateProviderCapacity = (providerId: string, updates: Partial<Provider>) => {
    setProviders(prev =>
      prev.map(p => {
        if (p.id === providerId) {
          const purchased = updates.purchasedGpuCount !== undefined ? updates.purchasedGpuCount : p.purchasedGpuCount;
          const allocated = updates.allocatedResourcesCount !== undefined ? updates.allocatedResourcesCount : p.allocatedResourcesCount;
          const running = updates.runningGpuCount !== undefined ? updates.runningGpuCount : p.runningGpuCount;
          const available = Math.max(0, purchased - allocated);
          return {
            ...p,
            ...updates,
            purchasedGpuCount: purchased,
            allocatedResourcesCount: allocated,
            runningGpuCount: running,
            availableGpuCount: available,
          };
        }
        return p;
      })
    );
  };

  const clearAllMockData = () => {
    setGpus([]);
    setDids([]);
    setClients([]);
    setPendingRequests([]);
    setInvoices([]);
    setPayments([]);
    setAlerts([]);
    setApiKeys([]);
    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        user: currentUser.name,
        role: currentUser.role,
        action: 'System Configuration',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
        ipAddress: '127.0.0.1 (Local)',
        oldValue: 'Mock Demo Data Active',
        newValue: 'Clean Production Slate (All demo records cleared)',
      },
      ...prev,
    ]);
  };

  const restoreDemoData = () => {
    setGpus(INITIAL_GPU_INVENTORY);
    setSipProviders(INITIAL_SIP_PROVIDERS);
    setDids(INITIAL_DID_NUMBERS);
    setClients(INITIAL_CLIENTS);
    setPendingRequests(INITIAL_PENDING_REQUESTS);
    setProviders(INITIAL_PROVIDERS);
    setInvoices(INITIAL_INVOICES);
    setPayments(INITIAL_PAYMENTS);
    setAlerts(INITIAL_ALERTS);
    setApiKeys(INITIAL_API_KEYS);
    setAuditLogs(prev => [
      {
        id: `audit-${Date.now()}`,
        user: currentUser.name,
        role: currentUser.role,
        action: 'System Configuration',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
        ipAddress: '127.0.0.1 (Local)',
        oldValue: 'Clean Production Slate',
        newValue: 'Restored Sample Demo Records',
      },
      ...prev,
    ]);
  };



  const simulateTrunkAlert = (type: 'sip_down' | 'poor_quality' | 'failed_provision') => {
    if (type === 'sip_down') {
      createAlert({
        title: 'SIP Down: Tata Teleservices Mumbai Gateway Offline',
        description: 'TRUNK-TATA-MUMBAI-01 primary SIP signaling endpoint unreachable (SIP 503 Service Unavailable / PRI Link Down). Failover active.',
        category: 'SIP Down',
        severity: 'Critical',
        targetResource: 'TRUNK-TATA-MUMBAI-01',
        trunkTelemetry: {
          carrier: 'Tata Teleservices',
          sipCode: 503,
          trunkId: 'TRUNK-TATA-MUMBAI-01',
          jitterMs: 92,
          packetLossPct: 22.4,
        },
      });
      addAuditLog('System Configuration', 'Trunk Online', 'Incoming Carrier Webhook: SIP Down on Tata Gateway', 'TRUNK-TATA-MUMBAI-01');
    } else if (type === 'poor_quality') {
      createAlert({
        title: 'Poor Call Quality: Airtel Business Trunk High Jitter',
        description: 'TRUNK-AIRTEL-DELHI-02 telemetry warning: MOS score degraded to 2.65, Jitter 68ms, Packet Loss 8.1% on active calls.',
        category: 'Poor Call Quality',
        severity: 'High',
        targetResource: 'TRUNK-AIRTEL-DELHI-02',
        trunkTelemetry: {
          carrier: 'Bharti Airtel Business',
          mosScore: 2.65,
          jitterMs: 68,
          packetLossPct: 8.1,
          trunkId: 'TRUNK-AIRTEL-DELHI-02',
        },
      });
      addAuditLog('System Configuration', 'Normal Audio Quality', 'Incoming Carrier Webhook: Poor Call Quality MOS 2.65', 'TRUNK-AIRTEL-DELHI-02');
    } else {
      createAlert({
        title: 'Failed Provisioning: 100 Indian DIDs Blocked on Jio Trunk',
        description: 'Upstream carrier rejected batch allocation of 100 Indian DIDs. Reason: Entity KYC / CIR circle limit reached.',
        category: 'Failed Provisioning',
        severity: 'High',
        targetResource: 'Jio Indian DIDs (+91 80)',
        trunkTelemetry: {
          carrier: 'Reliance Jio Enterprise',
          sipCode: 488,
          trunkId: 'TRUNK-JIO-BLR-03',
        },
      });
      addAuditLog('System Configuration', 'Provisioning Active', 'Incoming Carrier Webhook: Failed Provisioning on Jio Trunk', 'TRUNK-JIO-BLR-03');
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

  const createUser = (user: Partial<User>, initialPassword?: string, permissions?: UserAccessPermissions) => {
    const defaultPassword = initialPassword || 'User@2026';
    const role = user.role || 'Operations Manager';
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: user.name || 'New Team Member',
      email: user.email || 'user@aethervox.cloud',
      role: role,
      status: user.status || 'Active',
      lastLogin: 'Never',
      lastIp: '—',
      activeSessions: 0,
      createdAt: new Date().toISOString().split('T')[0],
      passwordHash: user.passwordHash || hashPassword(defaultPassword),
      permissions: permissions || DEFAULT_PERMISSIONS_BY_ROLE[role] || DEFAULT_PERMISSIONS_BY_ROLE['Operations Manager'],
    };
    setUsers(prev => [...prev, newUser]);
    addAuditLog('System Configuration', 'None', `Created user account ${newUser.email} (${newUser.role})`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          addAuditLog('System Configuration', `User: ${u.email}`, `Updated profile & access permissions for ${updated.email}`);
          return updated;
        }
        return u;
      })
    );
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteUser = (userId: string): { success: boolean; message: string } => {
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, message: 'User account not found.' };
    if (target.role === 'Super Admin' || target.id === 'usr-1') {
      return { success: false, message: 'Security Policy: Primary Super Administrator account cannot be deleted.' };
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    addAuditLog('System Configuration', `User: ${target.email}`, `Super Admin deleted user: ${target.name} (${target.email})`);
    return { success: true, message: `User ${target.name} has been deleted successfully.` };
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
    const initialPass = c.portalPassword || `${(c.companyName || 'Client').replace(/[^a-zA-Z0-9]/g, '') || 'Client'}@2026`;
    const newClient: Client = {
      id: `clt-00${count}`,
      companyName: c.companyName || 'New Client Corp',
      contactPerson: c.contactPerson || 'Lead Engineer',
      phone: c.phone || '+1 (555) 000-0000',
      email: c.email || 'client@enterprise.com',
      address: c.address || '100 Enterprise Way, Suite 200',
      status: 'Active',
      portalUsername: c.portalUsername || c.email || 'client@enterprise.com',
      portalPasswordHash: hashPassword(initialPass),
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
      unbilledUsage: c.unbilledUsage || 0,
      unbilledGpuHours: c.unbilledGpuHours || 0,
      unbilledSipMinutes: c.unbilledSipMinutes || 0,
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
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
        calculatedResaleMargin,
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
        apiKeys,
        createApiKey,
        revokeApiKey,
        connectProviderApi,
        updateProviderCapacity,
        allocateGpu,
        reclaimGpu,
        transferGpu,
        assignDid,
        releaseDid,
        suspendDid,
        portDid,
        addSipProvider,
        addDidNumber,
        importDidNumbers,
        approveRequest,
        rejectRequest,
        holdRequest,
        createRequest,
        createInvoice,
        markInvoicePaid,
        markInvoiceUnpaid,
        sendInvoice,
        sendInvoiceToClient,
        sendReminder,
        uploadPaymentProof,
        verifyPaymentProof,
        rejectPaymentProof,
        changeUserPassword,
        pingProviderApi,
        simulateTrunkAlert,
        createPayment,
        acknowledgeAlert,
        resolveAlert,
        createAlert,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        createClient,
        updateClient,
        addAuditLog,
        authenticatedClient,
        clientLogin,
        clientLogout,
        setAuthenticatedClient,
        updateClientCredentials,
        clearAllMockData,
        restoreDemoData,
        isClientPortalMode,
        setIsClientPortalMode,
        targetClientIdFromUrl,
        setTargetClientIdFromUrl,
        getAdminPanelUrl,
        getClientPortalUrl,
        getClientShareMessage,
        openClientPortal,
        returnToBrokerAdmin,
        navigateToAdminLogin,
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
