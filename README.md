# Celerko — Wholesale GPU & DID Resource Management System

[![Netlify Status](https://api.netlify.com/api/v1/badges/5566cc2f-831a-49bd-93ae-53ead98d0ef1/deploy-status)](https://app.netlify.com/projects/cerelkointernaltool/deploys)

Enterprise broker and reseller management platform for wholesale GPU compute clusters, SIP trunks, and DID telecom resources with real-time billing and profitability analytics.

---

## 🚀 Live Netlify Deployment

Your site is configured for automatic deployment on Netlify:
- **Netlify Deploys Dashboard**: [https://app.netlify.com/projects/cerelkointernaltool/deploys](https://app.netlify.com/projects/cerelkointernaltool/deploys)
- **Live URL**: `https://cerelkointernaltool.netlify.app`

### Netlify Build Settings
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: `22` (configured in `netlify.toml`)
- **SPA Redirect Rule**: `/* -> /index.html (200)` configured in `netlify.toml` and `public/_redirects`

---

## 💻 Local Development

```bash
# 1. Clone the repository
git clone https://github.com/gtawk01s-arch/gpu-and-did-internal-tool.git
cd gpu-and-did-internal-tool

# 2. Install dependencies (Node.js 20+ or 22 LTS)
npm install

# 3. Start local development server
npm run dev

# 4. Open in your browser
# http://localhost:3000
```

---

## 🛠️ Key Features

- **Wholesale GPU Cloud Providers**: RunPod, Lambda Labs, CoreWeave, Nebius AI, E2E Networks Cloud, Yotta D1, CtrlS, Vast.ai, and Crusoe Energy.
- **Provider API Connector**: Connects upstream wholesale GPU provider endpoints securely from Admin Panel. Secret provider keys are never exposed to clients.
- **Capacity Manager**: Real-time tracking of Purchased, Allocated, Running, and Available GPU nodes.
- **Client Panel API Keys**: Self-service Celerko API key creation with proxy access to approved GPU clusters.
- **Discrete Profitability Engine**:
  - Independent **GPU Compute Profit**: `GPU Revenue - GPU Cost`
  - Independent **DID Telecom Profit**: `DID Revenue - DID Cost`
  - Consolidated **Total Net Profit**: `GPU Profit + DID Profit`
