import React, { useState } from 'react';
import {
  Database,
  Code2,
  Copy,
  Check,
  Server,
  Terminal,
  FileCode,
  Layers,
  Network,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  RefreshCw,
  EyeOff,
  Sliders,
  CheckCircle2,
  ChevronRight,
  AlertOctagon,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DatabaseDesignView: React.FC = () => {
  const {
    currentUser,
    showDatabaseTab,
    setShowDatabaseTab,
    wipeEntireDatabase,
    zeroOutGpuCounts,
    restoreDemoData,
    clients,
    gpus,
    dids,
    invoices,
    providers,
    apiKeys,
  } = useApp();
  const [activeTab, setActiveTab] = useState<'database-ops' | 'sql-schema' | 'sql-runner' | 'prisma' | 'api' | 'architecture'>('database-ops');
  const [copied, setCopied] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [showZeroGpuModal, setShowZeroGpuModal] = useState(false);

  // Read-only SQL templates state
  const [selectedPresetQuery, setSelectedPresetQuery] = useState('spread_by_client');
  const [customSql, setCustomSql] = useState('');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryExecutionMs, setQueryExecutionMs] = useState<number>(14);

  const POSTGRESQL_SCHEMA_SQL = `-- =====================================================================
-- AETHERVOX WHOLESALE GPU & SIP RESOURCE MANAGEMENT SYSTEM
-- PostgreSQL Production DDL Schema (v2.4)
-- Database Engine: PostgreSQL 16+
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- 1. ENUMS DEFINITIONS
CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN',
    'OPERATIONS_MANAGER',
    'FINANCE_MANAGER',
    'SALES_MANAGER',
    'SUPPORT_AGENT',
    'CLIENT_PORTAL_USER'
);

CREATE TYPE gpu_status AS ENUM ('AVAILABLE', 'IN_USE', 'RESERVED', 'MAINTENANCE');
CREATE TYPE did_status AS ENUM ('AVAILABLE', 'ASSIGNED', 'SUSPENDED', 'PORTING');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'INVOICE_SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('SETTLED', 'PROCESSING', 'FAILED');
CREATE TYPE allocation_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HOLD', 'ACTIVE', 'TERMINATED');

-- 2. USERS & RBAC TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email CITEXT UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'OPERATIONS_MANAGER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    active_sessions_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. WHOLESALE SUPPLIERS / PROVIDERS
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name VARCHAR(120) NOT NULL,
    provider_type VARCHAR(60) NOT NULL, -- 'GPU Cloud Provider', 'Tier-1 Telecom'
    service_type VARCHAR(200) NOT NULL,
    contract_start_date DATE NOT NULL,
    contract_end_date DATE NOT NULL,
    monthly_commitment_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    api_endpoint VARCHAR(255),
    api_status VARCHAR(30) NOT NULL DEFAULT 'OPERATIONAL',
    sla_guarantee_percent NUMERIC(5, 2) NOT NULL DEFAULT 99.95,
    contact_email CITEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CLIENT ENTERPRISES
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(180) NOT NULL,
    contact_person VARCHAR(120) NOT NULL,
    email CITEXT NOT NULL,
    phone VARCHAR(40),
    billing_address TEXT,
    client_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    service_tier VARCHAR(50) NOT NULL DEFAULT 'ENTERPRISE_PLATINUM',
    credit_limit_usd NUMERIC(12, 2) NOT NULL DEFAULT 50000.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. GPU HARDWARE INVENTORY
CREATE TABLE gpu_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gpu_cluster_code VARCHAR(60) UNIQUE NOT NULL,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
    assigned_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    region VARCHAR(60) NOT NULL,
    gpu_model VARCHAR(80) NOT NULL, -- 'NVIDIA H100 SXM5 80GB', 'A100 80GB', 'L40S'
    vram_gb INT NOT NULL,
    interconnect VARCHAR(80) NOT NULL, -- 'NVLink 900 GB/s', 'Infiniband NDR 400G'
    total_quantity INT NOT NULL CHECK (total_quantity > 0),
    allocated_quantity INT NOT NULL DEFAULT 0 CHECK (allocated_quantity <= total_quantity),
    monthly_cost_usd NUMERIC(10, 2) NOT NULL,
    selling_price_usd NUMERIC(10, 2) NOT NULL,
    margin_percent NUMERIC(5, 2) GENERATED ALWAYS AS (
        ROUND(((selling_price_usd - monthly_cost_usd) / NULLIF(selling_price_usd, 0)) * 100, 2)
    ) STORED,
    contract_start DATE NOT NULL,
    contract_end DATE NOT NULL,
    status gpu_status NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SIP TRUNKS (TELECOM CHANNELS)
CREATE TABLE sip_trunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
    trunk_code VARCHAR(80) UNIQUE NOT NULL,
    did_range_description VARCHAR(150),
    country VARCHAR(80) NOT NULL,
    monthly_cost_usd NUMERIC(10, 2) NOT NULL,
    max_concurrent_channels INT NOT NULL,
    active_concurrent_channels INT NOT NULL DEFAULT 0,
    api_status VARCHAR(30) NOT NULL DEFAULT 'OPERATIONAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. DID TELEPHONE NUMBERS (E.164)
CREATE TABLE did_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    did_e164 VARCHAR(30) UNIQUE NOT NULL,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
    assigned_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    country VARCHAR(60) NOT NULL,
    area_code VARCHAR(10),
    number_type VARCHAR(30) NOT NULL, -- 'LOCAL', 'TOLL_FREE'
    wholesale_monthly_cost NUMERIC(8, 2) NOT NULL,
    resale_monthly_price NUMERIC(8, 2) NOT NULL,
    status did_status NOT NULL DEFAULT 'AVAILABLE',
    assigned_at TIMESTAMPTZ,
    total_minutes_monthly BIGINT NOT NULL DEFAULT 0
);

-- 8. INVOICES & BILLING
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(60) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    gpu_charges_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sip_charges_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    did_charges_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    subtotal_usd NUMERIC(12, 2) NOT NULL,
    taxes_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount_usd NUMERIC(12, 2) NOT NULL,
    paid_amount_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    status invoice_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PAYMENT TRANSACTIONS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    amount_usd NUMERIC(12, 2) NOT NULL,
    settlement_method VARCHAR(50) NOT NULL, -- 'ACH_WIRE', 'SWIFT', 'STRIPE'
    status payment_status NOT NULL DEFAULT 'SETTLED',
    settled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. IMMUTABLE AUDIT TRAIL LOGS
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(80) NOT NULL,
    ip_address INET NOT NULL,
    target_resource VARCHAR(120),
    previous_state JSONB,
    committed_state JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR HIGH-THROUGHPUT ARBITRAGE QUERIES
CREATE INDEX idx_gpu_nodes_status ON gpu_nodes(status);
CREATE INDEX idx_gpu_nodes_provider ON gpu_nodes(provider_id);
CREATE INDEX idx_did_numbers_client ON did_numbers(assigned_client_id);
CREATE INDEX idx_invoices_client_status ON invoices(client_id, status);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(created_at DESC);`;

  const PRISMA_SCHEMA = `// =====================================================================
// PRISMA SCHEMA DEFINITION - AetherVox Wholesale Platform
// =====================================================================

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  SUPER_ADMIN
  OPERATIONS_MANAGER
  FINANCE_MANAGER
  SALES_MANAGER
  SUPPORT_AGENT
  CLIENT_PORTAL_USER
}

enum GpuStatus {
  AVAILABLE
  IN_USE
  RESERVED
  MAINTENANCE
}

enum DidStatus {
  AVAILABLE
  ASSIGNED
  SUSPENDED
  PORTING
}

enum InvoiceStatus {
  DRAFT
  INVOICE_SENT
  PAID
  PARTIALLY_PAID
  OVERDUE
  CANCELLED
}

model User {
  id              String      @id @default(uuid())
  email           String      @unique
  fullName        String
  passwordHash    String
  role            UserRole    @default(OPERATIONS_MANAGER)
  isActive        Boolean     @default(true)
  lastLoginAt     DateTime?
  lastLoginIp     String?
  activeSessions  Int         @default(0)
  auditLogs       AuditLog[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Provider {
  id                String      @id @default(uuid())
  name              String
  providerType      String
  serviceType       String
  contractStart     DateTime
  contractEnd       DateTime
  monthlyCommitment Decimal     @db.Decimal(12, 2)
  apiStatus         String      @default("OPERATIONAL")
  slaGuarantee      Decimal     @db.Decimal(5, 2)
  gpus              GpuNode[]
  sipTrunks         SipTrunk[]
  dids              DidNumber[]
  createdAt         DateTime    @default(now())
}

model Client {
  id              String      @id @default(uuid())
  companyName     String
  contactPerson   String
  email           String
  phone           String?
  address         String?
  status          String      @default("ACTIVE")
  tier            String      @default("ENTERPRISE_PLATINUM")
  creditLimit     Decimal     @db.Decimal(12, 2)
  gpus            GpuNode[]
  dids            DidNumber[]
  invoices        Invoice[]
  createdAt       DateTime    @default(now())
}

model GpuNode {
  id                String      @id @default(uuid())
  gpuClusterCode    String      @unique
  providerId        String
  provider          Provider    @relation(fields: [providerId], references: [id])
  assignedClientId  String?
  client            Client?     @relation(fields: [assignedClientId], references: [id])
  region            String
  gpuModel          String
  vramGb            Int
  interconnect      String
  totalQuantity     Int
  allocatedQuantity Int         @default(0)
  monthlyCost       Decimal     @db.Decimal(10, 2)
  sellingPrice      Decimal     @db.Decimal(10, 2)
  status            GpuStatus   @default(AVAILABLE)
  contractStart     DateTime
  contractEnd       DateTime
  createdAt         DateTime    @default(now())
}

model SipTrunk {
  id                String      @id @default(uuid())
  providerId        String
  provider          Provider    @relation(fields: [providerId], references: [id])
  trunkCode         String      @unique
  country           String
  monthlyCost       Decimal     @db.Decimal(10, 2)
  maxChannels       Int
  activeChannels    Int         @default(0)
  createdAt         DateTime    @default(now())
}

model DidNumber {
  id                String      @id @default(uuid())
  didNumber         String      @unique
  providerId        String
  provider          Provider    @relation(fields: [providerId], references: [id])
  assignedClientId  String?
  client            Client?     @relation(fields: [assignedClientId], references: [id])
  country           String
  monthlyCost       Decimal     @db.Decimal(8, 2)
  sellingPrice      Decimal     @db.Decimal(8, 2)
  status            DidStatus   @default(AVAILABLE)
  usageMinutes      BigInt      @default(0)
}

model Invoice {
  id              String         @id @default(uuid())
  invoiceNumber   String         @unique
  clientId        String
  client          Client         @relation(fields: [clientId], references: [id])
  billingStart    DateTime
  billingEnd      DateTime
  gpuCharges      Decimal        @db.Decimal(12, 2)
  sipCharges      Decimal        @db.Decimal(12, 2)
  didCharges      Decimal        @db.Decimal(12, 2)
  subtotal        Decimal        @db.Decimal(12, 2)
  taxes           Decimal        @db.Decimal(12, 2)
  totalAmount     Decimal        @db.Decimal(12, 2)
  paidAmount      Decimal        @default(0) @db.Decimal(12, 2)
  dueDate         DateTime
  status          InvoiceStatus  @default(DRAFT)
  payments        Payment[]
  createdAt       DateTime       @default(now())
}

model Payment {
  id              String      @id @default(uuid())
  paymentRef      String      @unique
  invoiceId       String
  invoice         Invoice     @relation(fields: [invoiceId], references: [id])
  amount          Decimal     @db.Decimal(12, 2)
  method          String
  settledAt       DateTime    @default(now())
}

model AuditLog {
  id              BigInt      @id @default(autoincrement())
  userId          String?
  user            User?       @relation(fields: [userId], references: [id])
  userRole        String
  actionType      String
  ipAddress       String
  targetResource  String?
  createdAt       DateTime    @default(now())
}`;

  // Preset queries for interactive SQL Runner
  const PRESET_QUERIES: Record<string, { label: string; sql: string; mockResults: any[] }> = {
    spread_by_client: {
      label: 'Wholesale Gross Profit Spread by Client',
      sql: `SELECT 
    c.company_name AS client_name,
    c.service_tier,
    COUNT(DISTINCT g.id) AS gpu_clusters_count,
    SUM(g.selling_price_usd * g.allocated_quantity) AS gross_revenue_usd,
    SUM(g.monthly_cost_usd * g.allocated_quantity) AS upstream_cost_usd,
    SUM((g.selling_price_usd - g.monthly_cost_usd) * g.allocated_quantity) AS net_gross_spread_usd,
    ROUND(
        (SUM((g.selling_price_usd - g.monthly_cost_usd) * g.allocated_quantity) / 
         NULLIF(SUM(g.selling_price_usd * g.allocated_quantity), 0)) * 100, 2
    ) AS margin_percentage
FROM clients c
LEFT JOIN gpu_nodes g ON g.assigned_client_id = c.id
WHERE c.client_status = 'ACTIVE'
GROUP BY c.id, c.company_name, c.service_tier
ORDER BY net_gross_spread_usd DESC;`,
      mockResults: [
        { client_name: 'HyperScale AI Inc.', service_tier: 'Enterprise Platinum', gpu_clusters_count: 2, gross_revenue_usd: 192000, upstream_cost_usd: 129000, net_gross_spread_usd: 63000, margin_percentage: '32.81%' },
        { client_name: 'AnthroTech Labs', service_tier: 'Enterprise Platinum', gpu_clusters_count: 1, gross_revenue_usd: 107200, upstream_cost_usd: 70400, net_gross_spread_usd: 36800, margin_percentage: '34.33%' },
        { client_name: 'NeuralStream Media', service_tier: 'Scale Pro', gpu_clusters_count: 1, gross_revenue_usd: 77000, upstream_cost_usd: 48400, net_gross_spread_usd: 28600, margin_percentage: '37.14%' },
        { client_name: 'QuantEdge Capital', service_tier: 'Enterprise Platinum', gpu_clusters_count: 1, gross_revenue_usd: 47040, upstream_cost_usd: 29760, net_gross_spread_usd: 17280, margin_percentage: '36.73%' },
        { client_name: 'VoxFlow Contact Solutions', service_tier: 'Scale Pro', gpu_clusters_count: 1, gross_revenue_usd: 37440, upstream_cost_usd: 22320, net_gross_spread_usd: 15120, margin_percentage: '40.38%' },
      ],
    },
    gpu_high_margin: {
      label: 'GPU Models with Gross Margin > 35%',
      sql: `SELECT 
    g.gpu_cluster_code,
    p.provider_name,
    g.gpu_model,
    g.region,
    g.monthly_cost_usd,
    g.selling_price_usd,
    (g.selling_price_usd - g.monthly_cost_usd) AS unit_spread_usd,
    g.margin_percent,
    g.total_quantity,
    g.allocated_quantity
FROM gpu_nodes g
JOIN providers p ON p.id = g.provider_id
WHERE g.margin_percent >= 35.00
ORDER BY g.margin_percent DESC;`,
      mockResults: [
        { gpu_cluster_code: 'GPU-4090-EU-N1', provider_name: 'Equinix DC', gpu_model: 'NVIDIA RTX 4090 24GB', region: 'eu-north', monthly_cost_usd: 310, selling_price_usd: 520, unit_spread_usd: 210, margin_percent: '40.38%', total_quantity: 80, allocated_quantity: 72 },
        { gpu_cluster_code: 'GPU-A100-US-W2', provider_name: 'Lambda Labs', gpu_model: 'NVIDIA A100 SXM4 80GB', region: 'us-west', monthly_cost_usd: 1100, selling_price_usd: 1750, unit_spread_usd: 650, margin_percent: '37.14%', total_quantity: 48, allocated_quantity: 44 },
        { gpu_cluster_code: 'GPU-L40S-US-C1', provider_name: 'Vast.ai', gpu_model: 'NVIDIA L40S 48GB Ada', region: 'us-central', monthly_cost_usd: 620, selling_price_usd: 980, unit_spread_usd: 360, margin_percent: '36.73%', total_quantity: 64, allocated_quantity: 48 },
        { gpu_cluster_code: 'GPU-B200-US-E2', provider_name: 'Crusoe Energy', gpu_model: 'NVIDIA Blackwell B200 NVL', region: 'us-east', monthly_cost_usd: 3800, selling_price_usd: 5900, unit_spread_usd: 2100, margin_percent: '35.59%', total_quantity: 16, allocated_quantity: 0 },
      ],
    },
    sip_utilization: {
      label: 'Carrier SIP Channel Concurrency & Saturation',
      sql: `SELECT 
    p.provider_name,
    s.trunk_code,
    s.country,
    s.max_concurrent_channels,
    s.active_concurrent_channels,
    ROUND((s.active_concurrent_channels::NUMERIC / s.max_concurrent_channels::NUMERIC) * 100, 1) AS channel_saturation_percent,
    s.monthly_cost_usd,
    s.api_status
FROM sip_trunks s
JOIN providers p ON p.id = s.provider_id
ORDER BY channel_saturation_percent DESC;`,
      mockResults: [
        { provider_name: 'Telnyx Wholesale', trunk_code: 'TRUNK-TLX-US-PRIMARY', country: 'United States', max_concurrent_channels: 2500, active_concurrent_channels: 1840, channel_saturation_percent: '73.6%', monthly_cost_usd: 4500, api_status: 'OPERATIONAL' },
        { provider_name: 'Bandwidth Inc.', trunk_code: 'TRUNK-BND-GLOBAL-01', country: 'USA & Canada', max_concurrent_channels: 2000, active_concurrent_channels: 1420, channel_saturation_percent: '71.0%', monthly_cost_usd: 3800, api_status: 'OPERATIONAL' },
        { provider_name: 'Twilio Wholesale', trunk_code: 'TRUNK-TWL-EU-EAST', country: 'UK & Germany', max_concurrent_channels: 1200, active_concurrent_channels: 890, channel_saturation_percent: '74.2%', monthly_cost_usd: 2900, api_status: 'OPERATIONAL' },
        { provider_name: 'Tata Communications', trunk_code: 'TRUNK-TATA-APAC-01', country: 'Singapore & Japan', max_concurrent_channels: 800, active_concurrent_channels: 510, channel_saturation_percent: '63.8%', monthly_cost_usd: 2400, api_status: 'DEGRADED' },
      ],
    },
  };

  const handleRunQuery = () => {
    setQueryExecutionMs(Math.floor(Math.random() * 12 + 6));
    const preset = PRESET_QUERIES[selectedPresetQuery];
    if (preset) {
      setQueryResult(preset.mockResults);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (currentUser.role !== 'Super Admin') {
    return (
      <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Super Admin Restricted Module</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Database schemas, DDL scripts, and SQL structures are strictly restricted to Super Administrators in read-only mode.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-500" />
            Database Architecture &amp; SQL Schema (Read-Only)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            PostgreSQL relational DDL schemas, Prisma ORM models, and pre-compiled query templates for Super Admin inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-semibold border border-cyan-300 dark:border-cyan-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
            <span>Super Admin Read-Only Mode</span>
          </span>
        </div>
      </div>

      {/* Security Hardening Callout */}
      <div className="p-3 bg-slate-900 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs text-slate-300 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-cyan-300">Security Policy: </strong>
            Database modifications and arbitrary query executions are strictly disabled in the web console to prevent injection risks.
          </span>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-medium">{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'database-ops', label: 'Database Reset & Removal Actions (Danger Zone)' },
          { id: 'sql-schema', label: 'PostgreSQL Schema DDL (Read-Only)' },
          { id: 'sql-runner', label: 'SQL Query Templates (Read-Only)' },
          { id: 'prisma', label: 'Prisma Models (schema.prisma)' },
          { id: 'api', label: 'Backend REST API Spec' },
          { id: 'architecture', label: 'System Architecture & Data Flows' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? tab.id === 'database-ops'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 0: Database Reset & Removal Operations */}
      {activeTab === 'database-ops' && (
        <div className="space-y-4">
          {/* Top Summary Banner */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-500" />
              <span>Database Management &amp; Removal Controls</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Use the tools below to remove this Database tab from the sidebar menu, wipe all saved database records down to a zero clean slate, or zero out GPU provider counts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Remove Database Tab from Navigation */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-3 shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                    <EyeOff className="w-4 h-4 text-cyan-500" />
                    <span>Remove Database Tab from Sidebar</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    showDatabaseTab
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}>
                    {showDatabaseTab ? 'Visible in Navigation' : 'Hidden / Removed'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Hides the &quot;SQL Schema (Read-Only)&quot; tab from the left sidebar navigation menu. This setting persists across browser refreshes via localStorage.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const next = !showDatabaseTab;
                    setShowDatabaseTab(next);
                    setActionNotice(next ? 'Database tab has been restored to sidebar navigation.' : 'Database tab has been removed from sidebar navigation.');
                    setTimeout(() => setActionNotice(null), 4000);
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    showDatabaseTab
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>{showDatabaseTab ? 'Remove Database Tab from Sidebar Now' : 'Restore Database Tab to Sidebar'}</span>
                </button>
              </div>
            </div>

            {/* Card 2: Zero Out GPU Provider Counts */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-3 shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    <span>Zero Out GPU Provider Counts</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Unintegrated Counts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  If you haven&apos;t integrated GPU providers yet and still see counts or nodes, click this to reset all provider purchased, allocated, and available counts to 0.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    zeroOutGpuCounts();
                    setActionNotice('All GPU provider counts and hardware inventory have been zeroed out (0 GPUs).');
                    setTimeout(() => setActionNotice(null), 4000);
                  }}
                  className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Zero Out All GPU Counts Now</span>
                </button>
              </div>
            </div>

            {/* Card 3: Wipe Entire Database (Clean Slate) */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-xl flex flex-col justify-between space-y-3 shadow-xs bg-rose-50/20 dark:bg-rose-950/10">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-rose-800 dark:text-rose-300 text-xs flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>Wipe All Database Records (Clean Slate)</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                    Danger Zone
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Deletes all records across all database tables (clients, GPUs, DIDs, invoices, payments, requests, audit logs, sessions) and flushes localStorage. Leaves a completely clean production canvas.
                </p>
                <div className="mt-2 grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded">Clients: <strong>{clients.length}</strong></div>
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded">GPUs: <strong>{gpus.length}</strong></div>
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded">DIDs: <strong>{dids.length}</strong></div>
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded">Invoices: <strong>{invoices.length}</strong></div>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-100 dark:border-rose-900/40">
                <button
                  type="button"
                  onClick={() => setShowWipeModal(true)}
                  className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Wipe All Database Records (0 Records)</span>
                </button>
              </div>
            </div>

            {/* Card 4: Restore Sample Demo Records */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-3 shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-cyan-500" />
                    <span>Restore Sample Dataset</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                    Sample Data
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Need sample records for demonstration or testing? Click below to restore sample wholesale clients, Indian DID numbers, and test invoices.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    restoreDemoData();
                    setActionNotice('Sample dataset successfully restored.');
                    setTimeout(() => setActionNotice(null), 4000);
                  }}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore Sample Dataset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Developer Guide: Permanent Codebase Removal */}
          <div className="p-4 bg-slate-900 text-slate-300 border border-slate-800 rounded-xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Code2 className="w-4 h-4" />
              <span>How to Remove the Database Feature from the Codebase Permanently</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              If you want to permanently delete the Database view from your source code so it is completely excluded from your build:
            </p>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-sans font-semibold block text-[11px]">1. Remove Route in src/App.tsx</span>
                <span className="text-slate-500">// Remove the database case:</span>
                <div className="text-rose-400">- case &apos;database&apos;: return &lt;DatabaseDesignView /&gt;;</div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-sans font-semibold block text-[11px]">2. Remove from Navigation in src/components/layout/Sidebar.tsx</span>
                <span className="text-slate-500">// Remove the database entry from secondaryItems:</span>
                <div className="text-rose-400">- ...[{`{ id: 'database', label: 'SQL Schema (Read-Only)', icon: Database }`}]</div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-sans font-semibold block text-[11px]">3. Delete Component File</span>
                <div className="text-emerald-400 font-sans">rm src/components/views/DatabaseDesignView.tsx</div>
              </div>
            </div>
          </div>

          {/* Wipe Confirmation Modal */}
          {showWipeModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900 rounded-xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-sm">
                  <AlertOctagon className="w-5 h-5 shrink-0" />
                  <span>Confirm Database Wipe</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Are you sure you want to wipe all records? This will permanently delete all {clients.length} clients, {gpus.length} GPUs, {dids.length} DIDs, and {invoices.length} invoices, and clear browser localStorage.
                </p>
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-300">
                  Only the default Super Administrator account will be kept for login. All other tables will be reset to 0 records.
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWipeModal(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      wipeEntireDatabase();
                      setShowWipeModal(false);
                      setActionNotice('Entire database wiped successfully. All tables are now clean with 0 records.');
                      setTimeout(() => setActionNotice(null), 5000);
                    }}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold shadow-xs"
                  >
                    Yes, Wipe Entire Database
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 1: PostgreSQL DDL Schema */}
      {activeTab === 'sql-schema' && (
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>wholesale_postgresql_schema.sql</span>
              <span className="text-[10px] text-slate-500 font-sans">PostgreSQL 16 · DDL &amp; Constraints</span>
            </div>
            <button
              onClick={() => handleCopyCode(POSTGRESQL_SCHEMA_SQL)}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="p-4 text-cyan-300/90 overflow-x-auto leading-relaxed max-h-[600px] scrollbar-thin">
            {POSTGRESQL_SCHEMA_SQL}
          </pre>
        </div>
      )}

      {/* Tab 2: SQL Query Templates (Read-Only) */}
      {activeTab === 'sql-runner' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-500" />
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Select Wholesale Analytics Query Template:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedPresetQuery}
                  onChange={e => {
                    setSelectedPresetQuery(e.target.value);
                  }}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 text-xs"
                >
                  {Object.entries(PRESET_QUERIES).map(([key, q]) => (
                    <option key={key} value={key}>
                      {q.label}
                    </option>
                  ))}
                </select>
                <span className="px-3 py-1 text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded flex items-center gap-1">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>Read-Only Template</span>
                </span>
              </div>
            </div>

            {/* SQL Query Editor Box */}
            <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-xs text-emerald-400 overflow-x-auto">
              <pre className="leading-relaxed">
                {PRESET_QUERIES[selectedPresetQuery]?.sql}
              </pre>
            </div>
          </div>

          {/* Query Results Viewport */}
          {queryResult && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Execution Output</span>
                  <span className="text-slate-400">· {queryResult.length} rows returned</span>
                </div>
                <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                  Query Latency: {queryExecutionMs} ms (Index Scan)
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium font-mono text-[11px]">
                      {Object.keys(queryResult[0] || {}).map(col => (
                        <th key={col} className="py-2 px-3">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                    {queryResult.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} className="py-2 px-3 text-slate-800 dark:text-slate-200">
                            {typeof val === 'number' ? `₹${val.toLocaleString('en-IN')}` : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Prisma Schema */}
      {activeTab === 'prisma' && (
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <FileCode className="w-4 h-4 text-purple-400" />
              <span>schema.prisma</span>
              <span className="text-[10px] text-slate-500 font-sans">Prisma ORM Models</span>
            </div>
            <button
              onClick={() => handleCopyCode(PRISMA_SCHEMA)}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Prisma'}</span>
            </button>
          </div>
          <pre className="p-4 text-purple-300/90 overflow-x-auto leading-relaxed max-h-[600px] scrollbar-thin">
            {PRISMA_SCHEMA}
          </pre>
        </div>
      )}

      {/* Tab 4: Backend REST API Spec */}
      {activeTab === 'api' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3 font-sans">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Wholesale Gateway Endpoints Spec</h3>
            <p className="text-slate-500 text-xs">
              Authenticated via Bearer JWT with RBAC scope verification.
            </p>
          </div>

          {[
            { method: 'POST', path: '/api/auth/signup', desc: 'Register organization account, create initial admin, generate tenant organization_id' },
            { method: 'POST', path: '/api/auth/login', desc: 'Authenticate user with bcrypt password verification and issue tenant-scoped JWT token' },
            { method: 'GET', path: '/api/organizations', desc: 'List / view organization profiles with strict organization-level data isolation' },
            { method: 'GET', path: '/api/users', desc: 'Manage users, roles (Super Admin, Ops, Client Portal), and granular permissions' },
            { method: 'POST', path: '/api/api-keys', desc: 'Generate and revoke organization API keys for Dialko and compute automation' },
            { method: 'GET', path: '/api/gpu/capacity', desc: 'Modular GPU provider layer (Lambda Labs, RunPod, CoreWeave) capacity & availability' },
            { method: 'GET', path: '/api/gpu/usage', desc: 'Live GPU cluster telemetry, power draw (W), and allocated compute nodes' },
            { method: 'GET', path: '/api/gpu/requests', desc: 'Incoming GPU capacity requests with approve/reject workflow states' },
            { method: 'POST', path: '/api/gpu/allocations', desc: 'Transactional allocation of GPU node capacity preventing double assignment' },
            { method: 'GET', path: '/api/did/requests', desc: 'Client DID requests pool awaiting administrator approval or rejection' },
            { method: 'POST', path: '/api/did/allocations', desc: 'Automatically assign selected available DIDs to client upon request approval' },
            { method: 'GET', path: '/api/did/numbers', desc: 'Full DID numbers inventory linked to carrier SIP trunk and allocated client' },
            { method: 'GET', path: '/api/sip-trunks', desc: 'Wholesale SIP trunks with channel capacity (Tata, Airtel, Jio, Vi)' },
            { method: 'GET', path: '/api/dialko/status', desc: 'Dialko AI voice gateway interconnect heartbeat and SIP latency' },
            { method: 'GET', path: '/api/dialko/calls', desc: 'Real-time call routing, concurrent sessions, and trunk channel occupancy' },
            { method: 'GET', path: '/api/dialko/agents', desc: 'Voice AI agents mapped to allocated DID numbers and carrier trunks' },
          ].map((endpoint, i) => (
            <div
              key={i}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2 hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    endpoint.method === 'GET'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {endpoint.method}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{endpoint.path}</span>
              </div>
              <span className="text-slate-500 font-sans text-xs">{endpoint.desc}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Architecture & Data Flows */}
      {activeTab === 'architecture' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
              Brokerage Architecture &amp; Data Pipeline
            </h3>
            <p className="text-slate-500">
              Distributed infrastructure reseller flow connecting bulk suppliers to client downstream consumers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-cyan-600 dark:text-cyan-400">1. Upstream Acquisition</div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Purchasing reserved blocks from E2E Networks, Yotta, CtrlS, Tata Teleservices, Airtel Business at wholesale rates (₹1,75,000/H100/mo, ₹85/DID). Long-term master commitments.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-indigo-600 dark:text-indigo-400">2. AetherVox Broker Core</div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Automated inventory pools, telemetry polling, role-based approval engine, contract countdown monitors, and tamper-evident audit logging.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-emerald-600 dark:text-emerald-400">3. Downstream Client Billing</div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Reselling to AI research labs and voice contact platforms (₹2,60,000/H100/mo, ₹140/DID) generating 34.5% gross arbitrage margin with automated itemized billing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
