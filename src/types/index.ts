export type UserRole =
  | 'Super Admin'
  | 'Operations Manager'
  | 'Finance Manager'
  | 'Sales Manager'
  | 'Support Agent'
  | 'Client Portal User';

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
}

export type GpuStatus = 'In Use' | 'Available' | 'Reserved' | 'Maintenance';

export interface GpuInventoryItem {
  id: string;
  gpuId: string;
  provider: 'RunPod' | 'Lambda Labs' | 'Vast.ai' | 'CoreWeave' | 'Equinix DC' | 'Crusoe Energy';
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
  assignedClient?: string;
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
  portalPassword?: string; // Client portal access password
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
  joinedDate: string;
}

export type AllocationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Hold' | 'Active' | 'Terminated';

export interface PendingRequest {
  id: string;
  requestId: string;
  clientId: string;
  clientName: string;
  resourceType: 'GPU Cluster' | 'SIP Trunk' | 'DID Number Block';
  specs: string;
  quantity: number;
  date: string;
  monthlyCost: number;
  sellingPrice: number;
  status: AllocationStatus;
  requestedBy: string;
  notes?: string;
}

export interface Provider {
  id: string;
  name: string;
  providerType: 'GPU Cloud Provider' | 'Tier-1 Telecom' | 'Bare-Metal Datacenter';
  serviceType: string;
  contractStart: string;
  contractEnd: string;
  monthlyCommitment: number;
  apiStatus: 'Operational' | 'Degraded' | 'Offline';
  uptime90d: number;
  apiLatencyMs: number;
  allocatedResourcesCount: number;
  contactEmail: string;
}

export type InvoiceStatus = 'Draft' | 'Invoice Sent' | 'Paid' | 'Partially Paid' | 'Overdue' | 'Cancelled';

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
  gpuCharges: number;
  sipCount: number;
  sipCharges: number;
  didCount: number;
  didCharges: number;
  subtotal: number;
  taxes: number;
  totalAmount: number;
  dueDate: string;
  issueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  paymentInstructions: string;
  paidAmount?: number;
}

export interface Payment {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  date: string;
  method: 'ACH Wire Transfer' | 'Stripe Credit' | 'SWIFT Fedwire' | 'Corporate Card';
  referenceNumber: string;
  status: 'Settled' | 'Processing' | 'Failed';
}

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface SystemAlert {
  id: string;
  title: string;
  description: string;
  category:
    | 'Provider API Down'
    | 'Failed Provisioning'
    | 'GPU Inventory Low'
    | 'SIP Trunk Down'
    | 'DID Exhaustion'
    | 'Poor Call Quality'
    | 'Failed Payment'
    | 'Contract Expiring';
  severity: AlertSeverity;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  targetResource?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  role: UserRole;
  action:
    | 'Invoice Creation'
    | 'Invoice Payment'
    | 'GPU Allocation'
    | 'DID Allocation'
    | 'User Login'
    | 'Client Creation'
    | 'Provider Changes'
    | 'Approval Updated'
    | 'System Configuration';
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
