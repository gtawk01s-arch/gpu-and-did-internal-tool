import React, { useState } from 'react';
import {
  Server,
  Database,
  FileCode,
  Download,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  CheckCircle2,
  FolderArchive,
  Layers,
  ArrowRight,
  Globe,
  Cloud,
  KeyRound,
  ShieldCheck,
  Code2,
} from 'lucide-react';

export const XamppGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'local' | 'netlify' | 'sql' | 'backend_proxy' | 'html_css'>('local');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const NETLIFY_TOML_CONTENT = `# netlify.toml - Production Netlify Configuration
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

# SPA Single-Page App Routing: Redirect all routes to index.html with 200 OK
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security Headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
`;

  const LOCAL_RUN_COMMANDS = `# 1. Clone repository
git clone https://github.com/gtawk01s-arch/gpu-and-did-internal-tool.git
cd gpu-and-did-internal-tool

# 2. Install dependencies (Node.js 20+ or 22 recommended)
npm install

# 3. Create .env configuration (if needed)
cp .env.example .env

# 4. Start local Vite development server on port 3000
npm run dev

# App runs locally at: http://localhost:3000
`;

  const NETLIFY_CLI_COMMANDS = `# 1. Install Netlify CLI globally
npm install -g netlify-cli

# 2. Login to Netlify account
netlify login

# 3. Build optimized production assets
npm run build

# 4. Deploy directly to Netlify production
netlify deploy --prod --dir=dist
`;

  const COMPLETE_SQL_SCHEMA = `-- =====================================================================
-- CELERKO WHOLESALE GPU & DID MANAGEMENT SYSTEM
-- PostgreSQL / MySQL Relational Schema & Separate Profit Calculations
-- =====================================================================

-- 1. WHOLESALE GPU CLOUD PROVIDERS (Only GPU Providers)
CREATE TABLE gpu_cloud_providers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL, -- CoreWeave, Lambda Labs, RunPod, Nebius
    provider_type VARCHAR(60) NOT NULL,
    api_endpoint VARCHAR(255) NOT NULL,
    upstream_key_encrypted TEXT NOT NULL, -- NEVER exposed to clients
    purchased_gpus INT NOT NULL DEFAULT 0,
    allocated_gpus INT NOT NULL DEFAULT 0,
    running_gpus INT NOT NULL DEFAULT 0,
    available_gpus INT GENERATED ALWAYS AS (purchased_gpus - allocated_gpus) STORED,
    monthly_commitment DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    api_status VARCHAR(30) NOT NULL DEFAULT 'Operational',
    api_latency_ms INT NOT NULL DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CLIENT ORGANIZATIONS
CREATE TABLE clients (
    id VARCHAR(36) PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Active',
    allocated_gpu_count INT NOT NULL DEFAULT 0,
    allocated_did_count INT NOT NULL DEFAULT 0,
    monthly_spend DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    monthly_cost DECIMAL(14,2) NOT NULL DEFAULT 0.00
);

-- 3. CLIENT CELERKO API KEYS (Self-Service in Client Panel)
-- An API key authenticates access; it does NOT automatically allocate a GPU!
CREATE TABLE client_api_keys (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL, -- e.g. 'ck_live_9f82d1c7'
    key_hash VARCHAR(255) NOT NULL,
    rate_limit_rpm INT NOT NULL DEFAULT 1500,
    status ENUM('Active', 'Revoked') NOT NULL DEFAULT 'Active',
    total_requests BIGINT NOT NULL DEFAULT 0,
    created_at DATE NOT NULL,
    last_used TIMESTAMP NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 4. GPU ALLOCATIONS (Controlled by Admin Panel)
CREATE TABLE gpu_allocations (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) NOT NULL,
    gpu_model VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    ingress_endpoint VARCHAR(255) NOT NULL,
    monthly_wholesale_cost DECIMAL(12,2) NOT NULL,
    monthly_selling_price DECIMAL(12,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Active',
    approved_by VARCHAR(100) NOT NULL,
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
);

-- 5. DID TELECOM INVENTORY
CREATE TABLE did_numbers (
    id VARCHAR(36) PRIMARY KEY,
    did_number VARCHAR(40) UNIQUE NOT NULL,
    country VARCHAR(60) NOT NULL DEFAULT 'India',
    assigned_client_id VARCHAR(36) NULL,
    monthly_wholesale_cost DECIMAL(10,2) NOT NULL,
    monthly_selling_price DECIMAL(10,2) NOT NULL,
    status ENUM('Available', 'Assigned', 'Suspended') DEFAULT 'Available',
    FOREIGN KEY (assigned_client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- =====================================================================
-- 6. PROFITABILITY CALCULATIONS: SEPARATE GPU, DID, AND COMBINED VIEWS
-- =====================================================================

-- GPU Profit Calculation View
CREATE OR REPLACE VIEW vw_gpu_profitability AS
SELECT
    SUM(monthly_selling_price) AS gpu_revenue,
    SUM(monthly_wholesale_cost) AS gpu_cost,
    SUM(monthly_selling_price - monthly_wholesale_cost) AS gpu_profit,
    ROUND(((SUM(monthly_selling_price - monthly_wholesale_cost) / SUM(monthly_selling_price)) * 100), 2) AS gpu_margin_pct,
    COUNT(id) AS active_allocations
FROM gpu_allocations
WHERE status = 'Active';

-- DID Profit Calculation View
CREATE OR REPLACE VIEW vw_did_profitability AS
SELECT
    SUM(monthly_selling_price) AS did_revenue,
    SUM(monthly_wholesale_cost) AS did_cost,
    SUM(monthly_selling_price - monthly_wholesale_cost) AS did_profit,
    ROUND(((SUM(monthly_selling_price - monthly_wholesale_cost) / SUM(monthly_selling_price)) * 100), 2) AS did_margin_pct,
    COUNT(id) AS assigned_dids
FROM did_numbers
WHERE status = 'Assigned';

-- Combined Total Profitability View (GPU + DID)
CREATE OR REPLACE VIEW vw_consolidated_profitability AS
SELECT
    g.gpu_revenue,
    g.gpu_cost,
    g.gpu_profit,
    g.gpu_margin_pct,
    d.did_revenue,
    d.did_cost,
    d.did_profit,
    d.did_margin_pct,
    -- Total Combined
    (g.gpu_revenue + d.did_revenue) AS total_revenue,
    (g.gpu_cost + d.did_cost) AS total_cost,
    (g.gpu_profit + d.did_profit) AS total_profit,
    ROUND((((g.gpu_profit + d.did_profit) / (g.gpu_revenue + d.did_revenue)) * 100), 2) AS total_margin_pct
FROM vw_gpu_profitability g
CROSS JOIN vw_did_profitability d;
`;

  const BACKEND_PROXY_CODE = `// server.ts / api-proxy.ts - Celerko Automatic Backend Request Processor
import express, { Request, Response } from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// In-memory or database lookups
const UPSTREAM_GPU_PROVIDERS: Record<string, { endpoint: string; secretApiKey: string }> = {
  'coreweave': {
    endpoint: 'https://api.coreweave.com/v1',
    secretApiKey: process.env.COREWEAVE_UPSTREAM_SECRET || 'sk_cw_secret_live_encrypted',
  },
  'lambdalabs': {
    endpoint: 'https://cloud.lambdalabs.com/api/v1',
    secretApiKey: process.env.LAMBDALABS_UPSTREAM_SECRET || 'sk_lambda_secret_live_encrypted',
  },
};

// Middleware: Validate Client Celerko API Key & Active GPU Allocation
async function authenticateCelerkoClient(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ck_live_')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Celerko API key.' });
  }

  const clientApiKey = authHeader.replace('Bearer ', '').trim();
  // Lookup client in database via key hash
  const clientRecord = await getClientByApiKey(clientApiKey);

  if (!clientRecord) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key.' });
  }

  // CRITICAL CHECK: An API key does not automatically allocate a GPU!
  // Client must have an active GPU allocation approved by Admin
  if (clientRecord.allocatedGpuCount <= 0) {
    return res.status(403).json({
      error: 'No Active GPU Allocation: Your API key is authenticated, but no GPU nodes are currently assigned to your account. Please request allocation in the Client Panel.',
    });
  }

  // Attach client context to request
  (req as any).client = clientRecord;
  next();
}

// Proxied Inference Endpoint
app.post('/v1/chat/completions', authenticateCelerkoClient, async (req: Request, res: Response) => {
  const client = (req as any).client;
  const upstreamProvider = UPSTREAM_GPU_PROVIDERS['coreweave'];

  try {
    // Upstream secret key is injected on the backend and NEVER revealed to the client!
    const upstreamResponse = await fetch(\`\${upstreamProvider.endpoint}/chat/completions\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${upstreamProvider.secretApiKey}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstreamResponse.json();

    // Record usage telemetry, calculate wholesale cost, client charge, and profit
    await recordUsageTelemetry({
      clientId: client.id,
      model: req.body.model,
      tokens: data.usage?.total_tokens || 0,
      timestamp: new Date(),
    });

    res.json(data);
  } catch (error) {
    res.status(502).json({ error: 'Upstream GPU Provider Gateway Error' });
  }
});
`;

  const STANDALONE_HTML_CSS = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Celerko Client Portal & API Access</title>
  <style>
    :root {
      --bg: #090d16;
      --card: #111827;
      --border: #1f2937;
      --cyan: #06b6d4;
      --emerald: #10b981;
      --text: #f3f4f6;
      --muted: #9ca3af;
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 24px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    h1, h2, h3 { margin-top: 0; color: #fff; }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      background: rgba(6, 182, 212, 0.15);
      color: var(--cyan);
      border: 1px solid var(--cyan);
    }
    .badge-success {
      background: rgba(16, 185, 129, 0.15);
      color: var(--emerald);
      border-color: var(--emerald);
    }
    .code-box {
      background: #030712;
      border: 1px solid var(--border);
      padding: 12px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 13px;
      color: #38bdf8;
      overflow-x: auto;
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .metric { background: #1f2937; padding: 12px; border-radius: 8px; }
    .metric-label { font-size: 11px; color: var(--muted); text-transform: uppercase; }
    .metric-value { font-size: 20px; font-weight: bold; margin-top: 4px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Celerko Client GPU & API Portal</h1>
    
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3>HyperScale AI India Pvt Ltd</h3>
          <p style="color:var(--muted); font-size:13px; margin:0;">Client ID: clt-001</p>
        </div>
        <span class="badge badge-success">✓ 60x H100 GPUs Active</span>
      </div>
      <div class="grid" style="margin-top:16px;">
        <div class="metric">
          <div class="metric-label">Allocated GPUs</div>
          <div class="metric-value" style="color:var(--cyan)">60 Nodes</div>
        </div>
        <div class="metric">
          <div class="metric-label">Assigned DIDs</div>
          <div class="metric-value">180 DIDs</div>
        </div>
        <div class="metric">
          <div class="metric-label">Monthly Billing</div>
          <div class="metric-value" style="color:var(--emerald)">₹1,62,50,000</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Your Celerko API Keys</h3>
      <p style="color:var(--muted); font-size:13px;">
        An API key gives authenticated access to Celerko's proxy. An active GPU allocation is required to execute workloads.
      </p>
      <div class="code-box">ck_live_9f82d1c7••••••••••••••••381f</div>
      <p style="font-size:12px; color:#10b981; margin-top:8px;">🔒 Upstream provider keys (CoreWeave/Lambda) are encrypted on server and never exposed.</p>
    </div>

    <div class="card">
      <h3>Quickstart cURL Request</h3>
      <pre class="code-box">curl -X POST https://api.celerko.cloud/v1/chat/completions \\
  -H "Authorization: Bearer ck_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "meta-llama/Llama-3-70b-instruct", "messages": [{"role": "user", "content": "Hi Celerko!"}]}'</pre>
    </div>
  </div>
</body>
</html>
`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-500" />
            Local Run &amp; Netlify Production Deployment Guide
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Complete instructions and copyable scripts to run locally on your machine, deploy publicly on Netlify, and manage full HTML/CSS/SQL schemas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-semibold border border-cyan-300 dark:border-cyan-800 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-500" />
            <span>Ready for Local &amp; Netlify</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'local', label: '1. How to Run Locally' },
          { id: 'netlify', label: '2. How to Deploy on Netlify' },
          { id: 'sql', label: '3. Full SQL Schema & Calculations' },
          { id: 'backend_proxy', label: '4. Celerko Backend API Proxy' },
          { id: 'html_css', label: '5. Standalone HTML/CSS Template' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: How to Run Locally */}
      {activeTab === 'local' && (
        <div className="space-y-5 text-xs">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-500" />
              <span>Step-by-Step: Running Celerko Locally</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              This application is built with <strong>Vite</strong>, <strong>React 19</strong>, and <strong>Tailwind CSS</strong>. Follow these straightforward steps to run it on your local machine:
            </p>

            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 relative">
                <button
                  onClick={() => handleCopy('local_cmds', LOCAL_RUN_COMMANDS)}
                  className="absolute top-3 right-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-sans flex items-center gap-1"
                >
                  {copiedKey === 'local_cmds' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'local_cmds' ? 'Copied' : 'Copy'}</span>
                </button>
                <pre className="overflow-x-auto m-0 text-cyan-400">{LOCAL_RUN_COMMANDS}</pre>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">Prerequisites</div>
                <p className="text-slate-500 text-[11px]">
                  Node.js 20 or Node.js 22 (LTS) installed on your machine with npm.
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">Local Port</div>
                <p className="text-slate-500 text-[11px]">
                  The development server automatically binds to <strong className="font-mono text-cyan-500">http://localhost:3000</strong>.
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">Production Build Check</div>
                <p className="text-slate-500 text-[11px]">
                  Run <strong className="font-mono">npm run build</strong> locally to verify TypeScript type checking and dist bundling.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: How to Deploy on Netlify */}
      {activeTab === 'netlify' && (
        <div className="space-y-5 text-xs">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Cloud className="w-4 h-4 text-cyan-500" />
                <span>Step-by-Step: Deploying Publicly to Netlify</span>
              </h3>
              <button
                onClick={() => handleDownload('netlify.toml', NETLIFY_TOML_CONTENT)}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-xs"
              >
                <Download className="w-3 h-3" />
                <span>Download netlify.toml</span>
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Netlify provides instant global CDN hosting with automated SSL certificates. A pre-configured <strong className="font-mono text-cyan-500">netlify.toml</strong> file and <strong className="font-mono text-cyan-500">.npmrc</strong> are included at your repository root to guarantee successful builds without peer dependency conflicts.
            </p>

            {/* Quick Fix for Netlify ERESOLVE / esbuild Error */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Fixing Netlify Build Error (ERESOLVE / esbuild peer conflict)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                If your Netlify build failed with <code className="text-amber-300 bg-amber-950/60 px-1 py-0.5 rounded font-mono text-[10px]">npm error ERESOLVE: Could not resolve peerOptional esbuild</code>, choose either fix below:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                  <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
                    <span>Fix 1: Netlify Env Var (Zero Code Change)</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[10px]">
                    <li>In Netlify dashboard, open <strong>Site settings → Environment variables</strong>.</li>
                    <li>Add Key: <code className="text-amber-300 font-mono">NPM_FLAGS</code> with Value: <code className="text-emerald-400 font-mono">--legacy-peer-deps</code>.</li>
                    <li>Go to <strong>Deploys → Trigger deploy → Clear cache and deploy site</strong>.</li>
                  </ol>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                  <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
                    <span>Fix 2: Update package.json on GitHub</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[10px]">
                    <li>Open <code className="text-slate-300 font-mono">package.json</code> on your GitHub repo.</li>
                    <li>Remove the <code className="text-rose-300 font-mono">"esbuild"</code> line under <code className="font-mono">devDependencies</code> (Vite manages esbuild automatically).</li>
                    <li>Delete <code className="text-slate-300 font-mono">package-lock.json</code> and commit.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Method A: GitHub Integration */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Method A: Git Push (Recommended for Automatic Continuous Deployment)</span>
              </div>
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                <li>Push this repository to GitHub, GitLab, or Bitbucket.</li>
                <li>Go to <strong className="font-mono text-cyan-500">app.netlify.com</strong> and click <strong>"Add new site" → "Import an existing project"</strong>.</li>
                <li>Select your repository: <strong className="font-mono">gpu-and-did-internal-tool</strong>.</li>
                <li>Netlify will automatically detect settings from <strong className="font-mono">netlify.toml</strong>:
                  <ul className="list-disc pl-5 mt-1 font-mono text-[10px] text-slate-400">
                    <li>Build command: <strong className="text-cyan-400">npm run build</strong></li>
                    <li>Publish directory: <strong className="text-cyan-400">dist</strong></li>
                  </ul>
                </li>
                <li>Click <strong>"Deploy site"</strong>. Your app will be live globally in under 60 seconds at a free <strong className="font-mono">*.netlify.app</strong> URL!</li>
              </ol>
            </div>

            {/* Method B: Netlify CLI */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-500" />
                <span>Method B: 1-Command Deploy via Netlify CLI</span>
              </div>
              <div className="p-3 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 font-mono text-[11px] relative">
                <button
                  onClick={() => handleCopy('cli_cmds', NETLIFY_CLI_COMMANDS)}
                  className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-sans flex items-center gap-1"
                >
                  {copiedKey === 'cli_cmds' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'cli_cmds' ? 'Copied' : 'Copy'}</span>
                </button>
                <pre className="overflow-x-auto m-0 text-cyan-400">{NETLIFY_CLI_COMMANDS}</pre>
              </div>
            </div>

            {/* netlify.toml Viewer */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                <span>Production Configuration (/netlify.toml):</span>
                <button
                  onClick={() => handleCopy('netlify_toml', NETLIFY_TOML_CONTENT)}
                  className="text-cyan-500 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Configuration</span>
                </button>
              </div>
              <div className="p-3 bg-slate-950 text-slate-300 rounded-lg border border-slate-800 font-mono text-[11px] overflow-x-auto">
                <pre className="m-0 text-slate-300">{NETLIFY_TOML_CONTENT}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Full SQL Schema & Separate Calculations */}
      {activeTab === 'sql' && (
        <div className="space-y-5 text-xs">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-500" />
                  <span>Production SQL DDL &amp; Separate Profit Calculation Views</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Tables for GPU Providers, Capacity, Client API Keys, Allocations, and SQL views for GPU profit, DID profit, and combined total profit.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy('sql_schema', COMPLETE_SQL_SCHEMA)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1"
                >
                  {copiedKey === 'sql_schema' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy SQL</span>
                </button>
                <button
                  onClick={() => handleDownload('schema.sql', COMPLETE_SQL_SCHEMA)}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download schema.sql</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 font-mono text-[11px] max-h-96 overflow-y-auto">
              <pre className="m-0 text-slate-300">{COMPLETE_SQL_SCHEMA}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Backend API Proxy */}
      {activeTab === 'backend_proxy' && (
        <div className="space-y-5 text-xs">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-500" />
                  <span>Celerko Backend Proxy Pattern (Node.js &amp; Express)</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Validates client API keys, verifies active GPU allocation, and proxies requests securely without exposing upstream provider keys.
                </p>
              </div>
              <button
                onClick={() => handleCopy('proxy_code', BACKEND_PROXY_CODE)}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold flex items-center gap-1"
              >
                {copiedKey === 'proxy_code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Code</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 font-mono text-[11px] max-h-96 overflow-y-auto">
              <pre className="m-0 text-slate-300">{BACKEND_PROXY_CODE}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Standalone HTML/CSS Template */}
      {activeTab === 'html_css' && (
        <div className="space-y-5 text-xs">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-500" />
                  <span>Standalone Pure HTML &amp; CSS Client Portal Template</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Self-contained single-file HTML &amp; CSS template that can be hosted on static servers or XAMPP.
                </p>
              </div>
              <button
                onClick={() => handleDownload('portal.html', STANDALONE_HTML_CSS)}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Download portal.html</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 font-mono text-[11px] max-h-96 overflow-y-auto">
              <pre className="m-0 text-slate-300">{STANDALONE_HTML_CSS}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
