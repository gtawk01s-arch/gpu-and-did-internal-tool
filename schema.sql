-- =====================================================================
-- CELERKO WHOLESALE GPU & DID RESOURCE MANAGEMENT SYSTEM
-- Complete Production PostgreSQL / MySQL Relational Schema
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- 2. WHOLESALE GPU CLOUD PROVIDERS (Strictly GPU Providers Only)
CREATE TABLE gpu_cloud_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name VARCHAR(120) NOT NULL, -- e.g. 'CoreWeave', 'Lambda Labs', 'RunPod', 'Nebius AI', 'Vast.ai'
    provider_type VARCHAR(60) NOT NULL DEFAULT 'GPU Cloud Provider', -- 'GPU Cloud Provider' or 'Bare-Metal AI DC'
    api_base_url VARCHAR(255) NOT NULL, -- e.g. 'https://api.coreweave.com/v1'
    upstream_api_key_encrypted TEXT NOT NULL, -- Kept securely in backend; NEVER exposed to clients!
    purchased_gpu_count INT NOT NULL DEFAULT 0,
    allocated_gpu_count INT NOT NULL DEFAULT 0,
    running_gpu_count INT NOT NULL DEFAULT 0,
    available_gpu_count INT GENERATED ALWAYS AS (purchased_gpu_count - allocated_gpu_count) STORED,
    gpu_models_offered VARCHAR(255) NOT NULL, -- e.g. 'NVIDIA H100 SXM5, H200, B200'
    monthly_commitment_inr NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    api_status VARCHAR(30) NOT NULL DEFAULT 'OPERATIONAL', -- 'OPERATIONAL', 'DEGRADED', 'OFFLINE'
    api_latency_ms INT NOT NULL DEFAULT 15,
    uptime_sla_percent NUMERIC(5, 2) NOT NULL DEFAULT 99.99,
    contract_start DATE NOT NULL,
    contract_end DATE NOT NULL,
    contact_email CITEXT NOT NULL,
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. GPU CLUSTERS & HARDWARE CAPACITY POOL
CREATE TABLE gpu_clusters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES gpu_cloud_providers(id) ON DELETE RESTRICT,
    cluster_code VARCHAR(80) UNIQUE NOT NULL, -- e.g. 'GPU-H100-MUM-01'
    gpu_model VARCHAR(100) NOT NULL, -- e.g. 'NVIDIA H100 SXM5 80GB'
    datacenter_region VARCHAR(120) NOT NULL,
    total_nodes INT NOT NULL DEFAULT 1,
    allocated_nodes INT NOT NULL DEFAULT 0,
    available_nodes INT GENERATED ALWAYS AS (total_nodes - allocated_nodes) STORED,
    vram_per_node_gb INT NOT NULL DEFAULT 80,
    interconnect_type VARCHAR(80) NOT NULL DEFAULT 'NVLink 900 GB/s + 400G InfiniBand',
    wholesale_hourly_cost_inr NUMERIC(10, 2) NOT NULL,
    resale_hourly_price_inr NUMERIC(10, 2) NOT NULL,
    wholesale_monthly_cost_inr NUMERIC(12, 2) NOT NULL,
    resale_monthly_price_inr NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'IN_USE', 'RESERVED', 'MAINTENANCE'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TELECOM SIP PROVIDERS & DID INVENTORY (Isolated from wholesale GPU)
CREATE TABLE sip_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name VARCHAR(120) NOT NULL, -- 'Tata Teleservices', 'Bharti Airtel', 'Reliance Jio'
    trunk_identifier VARCHAR(100) UNIQUE NOT NULL,
    monthly_cost_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    max_channels INT NOT NULL DEFAULT 1000,
    active_channels INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE did_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sip_provider_id UUID NOT NULL REFERENCES sip_providers(id) ON DELETE RESTRICT,
    did_number VARCHAR(40) UNIQUE NOT NULL,
    country VARCHAR(60) NOT NULL DEFAULT 'India',
    area_code VARCHAR(40) NOT NULL,
    wholesale_monthly_cost_inr NUMERIC(10, 2) NOT NULL,
    resale_monthly_price_inr NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'ASSIGNED', 'SUSPENDED'
    assigned_client_id UUID
);

-- 5. CLIENT ORGANIZATIONS
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(120) NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'TRIAL', 'SUSPENDED', 'DELINQUENT'
    resource_requirement VARCHAR(40) NOT NULL DEFAULT 'Both GPU & DID',
    monthly_spend_inr NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    monthly_cost_inr NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CLIENT CELERKO API KEYS (Self-Service from Client Panel)
-- An API key authenticates access; it does NOT grant GPU execution without an active admin allocation!
CREATE TABLE client_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL, -- e.g. 'ck_live_9f82d1c7'
    key_hash VARCHAR(255) NOT NULL, -- SHA-256 hash of the full token
    rate_limit_rpm INT NOT NULL DEFAULT 1200,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'REVOKED'
    total_requests_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- 7. GPU ALLOCATIONS (Controlled Strictly by Admin Desk)
CREATE TABLE gpu_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    gpu_cluster_id UUID NOT NULL REFERENCES gpu_clusters(id) ON DELETE RESTRICT,
    allocated_quantity INT NOT NULL DEFAULT 1,
    ingress_api_endpoint VARCHAR(255) NOT NULL, -- e.g. 'https://node-h100-01.celerko.cloud:8443/v1'
    client_access_token VARCHAR(255) NOT NULL, -- Isolated proxy token (provider secret is NEVER given)
    jupyter_notebook_url VARCHAR(255),
    ssh_connection_string VARCHAR(255),
    monthly_wholesale_cost_inr NUMERIC(12, 2) NOT NULL,
    monthly_selling_price_inr NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'TERMINATED', 'PAUSED'
    approved_by VARCHAR(100) NOT NULL,
    approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. USAGE TELEMETRY & METERING LOGS (For Billing & Arbitrage)
CREATE TABLE usage_telemetry_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    api_key_id UUID NOT NULL REFERENCES client_api_keys(id) ON DELETE CASCADE,
    gpu_cluster_id UUID REFERENCES gpu_clusters(id) ON DELETE SET NULL,
    request_count INT NOT NULL DEFAULT 1,
    compute_duration_seconds INT NOT NULL DEFAULT 0,
    tokens_processed BIGINT DEFAULT 0,
    calculated_wholesale_cost_inr NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
    calculated_client_charge_inr NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 9. PROFITABILITY CALCULATIONS & VIEWS
-- Separately calculates GPU profit, DID profit, and combined total profit
-- =====================================================================

-- GPU Profitability View
CREATE OR REPLACE VIEW vw_gpu_profitability AS
SELECT
    COALESCE(SUM(ga.monthly_selling_price_inr), 0) AS gpu_revenue_inr,
    COALESCE(SUM(ga.monthly_wholesale_cost_inr), 0) AS gpu_cost_inr,
    COALESCE(SUM(ga.monthly_selling_price_inr - ga.monthly_wholesale_cost_inr), 0) AS gpu_net_profit_inr,
    CASE 
        WHEN COALESCE(SUM(ga.monthly_selling_price_inr), 0) > 0 
        THEN ROUND(((SUM(ga.monthly_selling_price_inr - ga.monthly_wholesale_cost_inr) / SUM(ga.monthly_selling_price_inr)) * 100)::numeric, 2)
        ELSE 0.00 
    END AS gpu_margin_percent,
    COUNT(ga.id) AS active_gpu_allocations_count,
    COALESCE(SUM(ga.allocated_quantity), 0) AS total_gpus_allocated
FROM gpu_allocations ga
WHERE ga.status = 'ACTIVE';

-- DID / Telecom Profitability View
CREATE OR REPLACE VIEW vw_did_profitability AS
SELECT
    COALESCE(SUM(d.resale_monthly_price_inr), 0) AS did_revenue_inr,
    COALESCE(SUM(d.wholesale_monthly_cost_inr), 0) AS did_cost_inr,
    COALESCE(SUM(d.resale_monthly_price_inr - d.wholesale_monthly_cost_inr), 0) AS did_net_profit_inr,
    CASE 
        WHEN COALESCE(SUM(d.resale_monthly_price_inr), 0) > 0 
        THEN ROUND(((SUM(d.resale_monthly_price_inr - d.wholesale_monthly_cost_inr) / SUM(d.resale_monthly_price_inr)) * 100)::numeric, 2)
        ELSE 0.00 
    END AS did_margin_percent,
    COUNT(d.id) AS assigned_did_count
FROM did_inventory d
WHERE d.status = 'ASSIGNED';

-- Total Combined Consolidated Profitability View
CREATE OR REPLACE VIEW vw_consolidated_profitability AS
WITH gpu AS (SELECT * FROM vw_gpu_profitability),
     did AS (SELECT * FROM vw_did_profitability)
SELECT
    gpu.gpu_revenue_inr,
    gpu.gpu_cost_inr,
    gpu.gpu_net_profit_inr,
    gpu.gpu_margin_percent,
    did.did_revenue_inr,
    did.did_cost_inr,
    did.did_net_profit_inr,
    did.did_margin_percent,
    -- Total Calculations
    (gpu.gpu_revenue_inr + did.did_revenue_inr) AS total_revenue_inr,
    (gpu.gpu_cost_inr + did.did_cost_inr) AS total_cost_inr,
    (gpu.gpu_net_profit_inr + did.did_net_profit_inr) AS total_net_profit_inr,
    CASE 
        WHEN (gpu.gpu_revenue_inr + did.did_revenue_inr) > 0 
        THEN ROUND((((gpu.gpu_net_profit_inr + did.did_net_profit_inr) / (gpu.gpu_revenue_inr + did.did_revenue_inr)) * 100)::numeric, 2)
        ELSE 0.00 
    END AS total_combined_margin_percent,
    -- Contribution percentages
    CASE 
        WHEN (gpu.gpu_net_profit_inr + did.did_net_profit_inr) > 0 
        THEN ROUND(((gpu.gpu_net_profit_inr / (gpu.gpu_net_profit_inr + did.did_net_profit_inr)) * 100)::numeric, 1)
        ELSE 0.0 
    END AS gpu_profit_contribution_pct,
    CASE 
        WHEN (gpu.gpu_net_profit_inr + did.did_net_profit_inr) > 0 
        THEN ROUND(((did.did_net_profit_inr / (gpu.gpu_net_profit_inr + did.did_net_profit_inr)) * 100)::numeric, 1)
        ELSE 0.0 
    END AS did_profit_contribution_pct
FROM gpu CROSS JOIN did;
