export type UserRole =
  | 'Super Admin'
  | 'Operations Manager'
  | 'Finance Manager'
  | 'Sales Manager'
  | 'Support Agent'
  | 'Client Portal User';

export interface UserAccessPermissions {
  dashboard: boolean;
  allocations: boolean;
  gpus: boolean;
  sips: boolean;
  clients: boolean;
  providers: boolean;
  finance: boolean;
  invoices: boolean;
  payments: boolean;
  alerts: boolean;
  audit: boolean;
  reports: boolean;
  users: boolean;
  database: boolean;
  bonusTools?: boolean;
  xampp?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Disabled' | 'Pending';
  lastLogin: string;
  lastIp: string;
  activeSessions: number;
  avatarUrl?: string;
  createdAt: string;
  passwordHash: string; // SHA-256 secure hash - no plain text stored
  permissions?: UserAccessPermissions; // Granular access rights configured by Super Admin
}

export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  ipAddress: string;
  location: string;
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  loginAt: string;
  lastActiveAt: string;
  isCurrentSession: boolean;
  tokenMasked: string;
}

export interface LoginHistoryEntry {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userRole: string;
  ipAddress: string;
  location: string;
  browser: string;
  os: string;
  status: 'Success' | 'Failed';
  failureReason?: string;
  timestamp: string;
  authMethod: 'Admin Password' | 'Client Portal Credentials' | 'Role Impersonation';
}

export interface RealTelemetryStats {
  publicIp: string;
  ispOrOrg: string;
  country: string;
  city: string;
  os: string;
  browser: string;
  isOnline: boolean;
  effectiveType: string;
  rttMs: number;
  downlinkMbps: number;
  cpuCores: number;
  memoryUsedMb?: number;
  memoryTotalMb?: number;
  storageUsedMb?: number;
  storageQuotaMb?: number;
  sessionUptimeSeconds: number;
  lastUpdated: string;
}

export type GpuStatus = 'In Use' | 'Available' | 'Reserved' | 'Maintenance' | 'Hold';

export interface GpuInventoryItem {
  id: string;
  gpuId: string;
  provider: 'RunPod' | 'Lambda Labs' | 'Vast.ai' | 'CoreWeave' | 'Equinix DC' | 'Crusoe Energy' | string;
  region: string;
  gpuModel: string;
  quantity: number;
  allocatedQuantity: number;
  monthlyCost: number; // Wholesale provider cost per unit/month
  sellingPrice: number; // Resale price per unit/month
  marginPercent: number;
  contractStart: string;
  contractEnd: string;
  status: GpuStatus;
  holdReason?: string; // Reason field on Hold GPU (Mandatory when placed on Hold)
  heldAt?: string; // Timestamp when placed on Hold
  heldBy?: string; // Admin or user who placed GPU on Hold
  vramGb: number;
  interconnect: string;
  assignedClient?: string;
  powerDrawWatts?: number;
}

export type DidStatus = 'Available' | 'Assigned' | 'Suspended' | 'Porting';

export interface SipProvider {
  id: string;
  providerName: string;
  sipTrunkName: string;
  didRange: string;
  country: string;
  monthlyCost: number;
  maxChannels: number;
  activeChannels: number;
  status: 'Active' | 'Degraded' | 'Offline';
  apiStatus: 'Operational' | 'Degraded' | 'Offline';
  contractEnd: string;
}

export interface DidNumber {
  id: string;
  didNumber: string;
  country: string;
  areaCode: string;
  provider: string;
  sipTrunkId?: string;
  sipTrunkName?: string;
  assignedClient?: string;
  assignedClientId?: string;
  assignedDate?: string;
  monthlyCost: number;
  sellingPrice: number;
  status: DidStatus;
  type: 'Local' | 'Toll-Free' | 'Mobile';
  usageMinutes: number;
}

export type ResourceRequirement = 'GPU Only' | 'DID Only' | 'Both GPU & DID';

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  portalUsername?: string; // Client portal login email/username
  portalPasswordHash: string; // SHA-256 secure hash - strictly no plain-text passwords
  portalPassword?: string; // Optional legacy compatibility field - masked in UI
  address: string;
  status: 'Active' | 'Delinquent' | 'Trial' | 'Suspended';
  resourceRequirement: ResourceRequirement;
  gpuNeededModel?: string;
  gpuNeededQuantity?: number;
  didNeededType?: string;
  didNeededQuantity?: number;
  allocatedGpuCount: number;
  allocatedSipCount: number;
  allocatedDidCount: number;
  monthlySpend: number;
  monthlyCost: number;
  marginPercent: number;
  unbilledUsage?: number; // Unbilled usage accruals in INR ₹
  unbilledGpuHours?: number; // Accumulated unbilled GPU cluster hours
  unbilledSipMinutes?: number; // Accumulated unbilled carrier minutes
  joinedDate: string;
}

export type AllocationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Hold' | 'Active' | 'Terminated';

export interface PendingRequest {
  id: string;
  requestId: string;
  clientId: string;
  clientName: string;
  resourceType: 'GPU Cluster' | 'DID / SIP Trunk' | 'SIP Trunk' | 'DID Number Block';
  specs: string;
  quantity: number;
  date: string;
  monthlyCost: number;
  sellingPrice: number;
  status: AllocationStatus;
  requestedBy: string;
  notes?: string;
  holdReason?: string; // Mandatory explanation when placed on Hold
}

export type ResourceType = 'GPU Cluster' | 'DID / SIP Trunk';

export interface Provider {
  id: string;
  name: string;
  providerType: 'GPU Cloud Provider' | 'Bare-Metal Datacenter' | 'Specialized AI Cloud';
  serviceType: string;
  contractStart: string;
  contractEnd: string;
  monthlyCommitment: number; // in INR ₹
  apiStatus: 'Operational' | 'Degraded' | 'Offline';
  uptime90d: number;
  apiLatencyMs: number;
  contactEmail: string;
  // Celerko Provider API Connector
  apiEndpoint?: string;
  upstreamKeyMasked?: string;
  // Celerko Capacity Manager
  purchasedGpuCount: number;
  allocatedResourcesCount: number;
  runningGpuCount: number;
  availableGpuCount: number;
  purchasedGpuModel: string;
  lastHeartbeat?: string;
}

export interface CelerkoApiKey {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  keyPrefix: string;
  keyMasked: string;
  createdAt: string;
  lastUsed: string;
  status: 'Active' | 'Revoked';
  hasActiveGpuAllocation: boolean;
  rateLimitReqPerMin: number;
  totalRequests: number;
}


export type InvoiceStatus =
  | 'Draft'
  | 'Sent to Client'
  | 'Invoice Sent'
  | 'Verification Pending'
  | 'Paid'
  | 'Unpaid'
  | 'Partially Paid'
  | 'Overdue'
  | 'Cancelled';

export interface PaymentProof {
  screenshotUrl: string;
  fileName?: string;
  utrNumber?: string; // UTR or Bank Reference No
  paymentMode?: string; // UPI, NEFT, RTGS, IMPS, NetBanking
  uploadedAt: string;
  notes?: string;
  clientContact?: string;
}

export interface InvoiceItem {
  description: string;
  category: 'GPU' | 'SIP' | 'DID' | 'Bandwidth' | 'Service';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  billingPeriod: string;
  gpuCount: number;
  gpuUnitPrice?: number;
  gpuCharges: number;
  sipCount: number;
  didCount: number;
  didUnitPrice?: number;
  sipCharges: number;
  didCharges: number;
  subtotal: number;
  taxes: number; // GST 18% in INR
  totalAmount: number; // in INR ₹
  dueDate: string;
  issueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  paymentInstructions: string;
  paidAmount?: number;
  sentToClientPortal?: boolean;
  sentToClientAt?: string;
  paymentProof?: PaymentProof;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface Payment {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  date: string;
  method: 'IMPS / UPI' | 'NEFT / RTGS' | 'Corporate NetBanking' | 'ACH Wire Transfer' | 'Stripe Credit';
  referenceNumber: string;
  status: 'Settled' | 'Processing' | 'Failed';
  verifiedBy?: string;
}

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface SystemAlert {
  id: string;
  title: string;
  description: string;
  category:
    | 'SIP Down'
    | 'SIP Trunk Down'
    | 'Poor Call Quality'
    | 'Failed Provisioning'
    | 'Provider API Down'
    | 'GPU Inventory Low'
    | 'DID Exhaustion'
    | 'Failed Payment'
    | 'Contract Expiring';
  severity: AlertSeverity;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  targetResource?: string;
  trunkTelemetry?: {
    carrier: string;
    mosScore?: number;
    jitterMs?: number;
    packetLossPct?: number;
    sipCode?: number;
    trunkId?: string;
  };
}

export type AuditLogAction =
  | 'Invoice Creation'
  | 'Invoice Payment'
  | 'GPU Allocation'
  | 'DID Allocation'
  | 'User Login'
  | 'Client Creation'
  | 'Provider Changes'
  | 'Provider Updated'
  | 'Approval Updated'
  | 'System Configuration'
  | 'GPU Placed on Hold'
  | 'GPU Hold Released'
  | 'Client Usage Updated'
  | 'Invoice Generated';

export interface AuditLog {
  id: string;
  user: string;
  role: UserRole;
  action: AuditLogAction;
  timestamp: string;
  ipAddress: string;
  oldValue: string;
  newValue: string;
  resourceId?: string;
}

export interface SupportTicket {
  id: string;
  clientId: string;
  subject: string;
  severity: 'Critical' | 'High' | 'Normal';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  assignedTo: string;
}
