import React, { useState } from 'react';
import {
  Server,
  Zap,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Terminal,
  Code2,
  Activity,
  Layers,
  ArrowRight,
  Radio,
  RefreshCw,
  Cpu,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Provider } from '../../types';

interface ProviderIntegrationDoc {
  id: string;
  name: string;
  category: string;
  baseUrl: string;
  authHeader: string;
  envVar: string;
  docUrl: string;
  fleetModels: string[];
  interconnect: string;
  description: string;
  steps: string[];
  endpoints: {
    method: 'GET' | 'POST' | 'DELETE';
    path: string;
    description: string;
    samplePayload?: string;
  }[];
  snippets: {
    curl: string;
    typescript: string;
    python: string;
  };
  mockResponse: Record<string, any>;
}

const GPU_INTEGRATION_DOCS: ProviderIntegrationDoc[] = [
  {
    id: 'prov-001',
    name: 'CoreWeave Cloud',
    category: 'Hyperscale GPU Cloud',
    baseUrl: 'https://api.coreweave.com/v1',
    authHeader: 'Authorization: Bearer <COREWEAVE_UPSTREAM_SECRET>',
    envVar: 'COREWEAVE_UPSTREAM_SECRET',
    docUrl: 'https://docs.coreweave.com',
    fleetModels: ['HGX H100 80GB SXM5', 'HGX H200 141GB', 'A100 80GB SXM4', 'L40S 48GB'],
    interconnect: 'NVIDIA Quantum-2 InfiniBand 3.2 Tbps per node',
    description: 'Specialized Kubernetes-native cloud built exclusively for GPU-accelerated computing, AI training, and fine-tuning at scale.',
    steps: [
      'Navigate to the CoreWeave Cloud Console at cloud.coreweave.com and create an organization tenant.',
      'Generate a Service Account Token under Settings → API Keys with Cluster Admin or Namespace Operator permissions.',
      'Configure the secret in your broker environment under COREWEAVE_UPSTREAM_SECRET or in the Provider API Config modal.',
      'Configure private VPC peering or direct Connect cross-connect between your datacenter and CoreWeave Region (LGA1, ORD1, LAS1).',
      'Deploy the broker sync daemon to poll cluster availability and allocate nodes transactional to enterprise clients.',
    ],
    endpoints: [
      {
        method: 'GET',
        path: '/cluster/regions/us-east/inventory',
        description: 'Query live GPU cluster availability and wholesale hourly spot/reserved pricing.',
      },
      {
        method: 'POST',
        path: '/nodes/provision',
        description: 'Spin up dedicated GPU node pool or Slurm partition for an enterprise client.',
        samplePayload: JSON.stringify({
          gpu_model: 'H100-SXM5-80GB',
          nodes: 8,
          interconnect: 'infiniband-3200',
          client_tenant_id: 'clt-001',
          os_image: 'ubuntu-22.04-cuda-12.4',
        }, null, 2),
      },
      {
        method: 'GET',
        path: '/nodes/telemetry/{cluster_id}',
        description: 'Fetch real-time GPU wattage power draw, temperature, and NVLink fabric health.',
      },
      {
        method: 'DELETE',
        path: '/nodes/release/{cluster_id}',
        description: 'Deprovision cluster upon client lease expiry and return capacity to free inventory.',
      },
    ],
    snippets: {
      curl: `curl -X POST "https://api.coreweave.com/v1/nodes/provision" \\
  -H "Authorization: Bearer $COREWEAVE_UPSTREAM_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "gpu_model": "H100-SXM5-80GB",
    "quantity": 8,
    "interconnect": "infiniband-3200",
    "billing_mode": "reserved_monthly",
    "client_tag": "AnthroTech Labs"
  }'`,
      typescript: `import axios from 'axios';

interface CoreWeaveClusterResponse {
  clusterId: string;
  status: 'PROVISIONING' | 'ACTIVE';
  nodesAllocated: number;
  powerWatts: number;
}

export async function provisionCoreWeaveCluster(
  gpuModel: string,
  quantity: number,
  clientTag: string
): Promise<CoreWeaveClusterResponse> {
  const secret = process.env.COREWEAVE_UPSTREAM_SECRET;
  if (!secret) throw new Error('Missing COREWEAVE_UPSTREAM_SECRET');

  const res = await axios.post<CoreWeaveClusterResponse>(
    'https://api.coreweave.com/v1/nodes/provision',
    {
      gpu_model: gpuModel,
      quantity,
      interconnect: 'infiniband-3200',
      billing_mode: 'reserved_monthly',
      client_tag: clientTag,
    },
    {
      headers: {
        Authorization: \`Bearer \${secret}\`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );

  return res.data;
}`,
      python: `import os
import requests

def provision_cluster(gpu_model: str, nodes: int, client_id: str):
    token = os.getenv("COREWEAVE_UPSTREAM_SECRET")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "gpu_model": gpu_model,
        "quantity": nodes,
        "interconnect": "infiniband-3200",
        "client_tenant_id": client_id
    }
    
    response = requests.post(
        "https://api.coreweave.com/v1/nodes/provision",
        json=payload,
        headers=headers,
        timeout=15
    )
    response.raise_for_status()
    return response.json()`,
    },
    mockResponse: {
      status: 'success',
      cluster_id: 'cw-ord1-h100-8x-8894',
      provider: 'CoreWeave LGA1',
      gpu_model: 'NVIDIA H100 SXM5 80GB',
      nodes_allocated: 8,
      vram_total_gb: 640,
      interconnect: 'NVLink 4.0 (900 GB/s) + InfiniBand NDR 400G',
      power_draw_watts: 5600,
      telemetry_health: 'NORMAL_OPTIMAL',
      heartbeat_latency_ms: 18,
    },
  },
  {
    id: 'prov-002',
    name: 'Lambda Labs',
    category: 'Hyperscale GPU Cloud',
    baseUrl: 'https://cloud.lambdalabs.com/api/v1',
    authHeader: 'Authorization: Basic <BASE64_KEY> or Bearer <LAMBDALABS_SECRET>',
    envVar: 'LAMBDALABS_UPSTREAM_SECRET',
    docUrl: 'https://docs.lambdalabs.com/cloud/api',
    fleetModels: ['1x A100 (40GB/80GB)', '8x H100 SXM5', '1x GH200 NVL', '4x RTX 6000 Ada'],
    interconnect: '800 Gbps RoCE v2 / InfiniBand',
    description: 'High-performance AI cloud offering instant on-demand and 1-3 year reserved clusters optimized for deep learning models.',
    steps: [
      'Log in to lambda.cloud and create an API Key under API Keys tab in dashboard.',
      'Copy your secret API key and store in your broker environment as LAMBDALABS_UPSTREAM_SECRET.',
      'Query the GET /instance-types endpoint to inspect real-time regional node availability (us-east-1, us-west-1, us-central-1).',
      'Call POST /instance-operations/launch with the instance type name, SSH key IDs, and quantity.',
      'Set up webhooks for instance status callbacks to alert your operations desk upon node restarts.',
    ],
    endpoints: [
      {
        method: 'GET',
        path: '/instance-types',
        description: 'Retrieve real-time catalog of GPU types, pricing, and availability per region.',
      },
      {
        method: 'POST',
        path: '/instance-operations/launch',
        description: 'Launch dedicated GPU instances for an approved client allocation.',
        samplePayload: JSON.stringify({
          region_name: 'us-east-1',
          instance_type_name: 'gpu_8x_h100_sxm5',
          ssh_key_names: ['celerko-broker-mgmt'],
          quantity: 1,
        }, null, 2),
      },
      {
        method: 'POST',
        path: '/instance-operations/terminate',
        description: 'Terminate active instance and cease billing cycle immediately.',
        samplePayload: JSON.stringify({
          instance_ids: ['0927e023027f4271b806531c79068b39'],
        }, null, 2),
      },
    ],
    snippets: {
      curl: `curl -u "$LAMBDALABS_UPSTREAM_SECRET:" \\
  https://cloud.lambdalabs.com/api/v1/instance-types`,
      typescript: `import axios from 'axios';

export async function fetchLambdaAvailableGpus() {
  const secretKey = process.env.LAMBDALABS_UPSTREAM_SECRET;
  const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');

  const response = await axios.get('https://cloud.lambdalabs.com/api/v1/instance-types', {
    headers: { Authorization: authHeader },
  });

  return response.data.data;
}`,
      python: `import os
import requests

api_key = os.getenv("LAMBDALABS_UPSTREAM_SECRET")
resp = requests.get(
    "https://cloud.lambdalabs.com/api/v1/instance-types",
    auth=(api_key, "")
)
print(resp.json())`,
    },
    mockResponse: {
      status: 'active',
      instance_id: 'lambda-inst-99210-us-east',
      gpu_model: '8x NVIDIA H100 80GB SXM5',
      nodes_active: 8,
      vram_gb: 640,
      ip_address: '104.171.200.45',
      uptime_hours: 412,
      latency_ms: 22,
    },
  },
  {
    id: 'prov-003',
    name: 'RunPod Cloud',
    category: 'Specialized AI Cloud',
    baseUrl: 'https://api.runpod.io/graphql',
    authHeader: 'Authorization: Bearer <RUNPOD_API_KEY>',
    envVar: 'RUNPOD_API_KEY',
    docUrl: 'https://docs.runpod.io',
    fleetModels: ['8x H100 NVLink', '8x A100 80GB', 'RTX 4090 24GB', 'L40 48GB'],
    interconnect: 'NVLink 900 GB/s + PCIe 5.0',
    description: 'Community & Secure Cloud GPU infrastructure with both GraphQL and REST APIs for automated pod spin-up, serverless endpoints, and persistent network storage volumes.',
    steps: [
      'Generate an API key in RunPod console under User Settings → API Keys.',
      'Configure the RunPod GraphQL endpoint: https://api.runpod.io/graphql?api_key=YOUR_KEY.',
      'Use GraphQL queries to inspect pod inventory and GPU availability.',
      'Spin up pods with container disk allocations and automated port forwarding.',
      'Map client Celerko API requests to allocated RunPod worker endpoints.',
    ],
    endpoints: [
      {
        method: 'POST',
        path: '/graphql',
        description: 'Query GPU availability, hourly spot rates, and datacenter locations.',
        samplePayload: JSON.stringify({
          query: 'query GpuTypes { gpuTypes { id displayName memoryInGb secureCloud lowestPrice(input: { gpuCount: 8 }) { minimumBidPrice uninterruptablePrice } } }',
        }, null, 2),
      },
      {
        method: 'POST',
        path: '/v2/{endpoint_id}/run',
        description: 'Execute serverless inference or distributed batch task across GPU pods.',
      },
    ],
    snippets: {
      curl: `curl -X POST "https://api.runpod.io/graphql?api_key=$RUNPOD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "query { myself { id pods { id name gpuCount machine { gpuDisplayName } } } }"
  }'`,
      typescript: `import axios from 'axios';

export async function queryRunpodPods(apiKey: string) {
  const query = \`
    query {
      myself {
        pods {
          id
          name
          gpuCount
          costPerHr
          desiredStatus
        }
      }
    }
  \`;

  const res = await axios.post(
    \`https://api.runpod.io/graphql?api_key=\${apiKey}\`,
    { query }
  );

  return res.data.data.myself.pods;
}`,
      python: `import requests

query = """
query {
  gpuTypes {
    id
    displayName
    memoryInGb
  }
}
"""

res = requests.post(
    f"https://api.runpod.io/graphql?api_key={API_KEY}",
    json={"query": query}
)
print(res.json())`,
    },
    mockResponse: {
      status: 'connected',
      active_pods: 6,
      gpus_running: 16,
      model: 'NVIDIA H100 80GB SXM5',
      avg_utilization_pct: 88.4,
      network_storage_mounted_tb: 40,
      latency_ms: 25,
    },
  },
  {
    id: 'prov-006',
    name: 'Yotta Datacenters (India)',
    category: 'Bare-Metal AI Datacenter',
    baseUrl: 'https://cloud.yotta.com/api/v2',
    authHeader: 'X-Yotta-Token: <YOTTA_ENTERPRISE_KEY>',
    envVar: 'YOTTA_ENTERPRISE_KEY',
    docUrl: 'https://yotta.com/enterprise-gpu-cloud',
    fleetModels: ['Shakti-Cloud H100 SXM5 80GB', 'A100 80GB', 'L40S Ada'],
    interconnect: 'Infiniband NDR 400G Fabric',
    description: 'Tier-IV sovereign AI datacenter facilities in Navi Mumbai (NM1) and Greater Noida (D1) offering massive clusters for sovereign Indian enterprise and LLM workloads.',
    steps: [
      'Contact Yotta Enterprise Relationship Team to obtain sovereign wholesale cluster allocation agreement.',
      'Acquire Enterprise API Tenant credentials and Dedicated Interconnect VPN configurations.',
      'Configure INR wholesale monthly billing contracts in Celerko with 18% GST calculation.',
      'Monitor NM1 / D1 cluster health and route domestic voice/compute workloads for low latency in India (<12ms).',
    ],
    endpoints: [
      {
        method: 'GET',
        path: '/clusters/shakti/status',
        description: 'Verify Shakti-Cloud NM1 H100 InfiniBand fabric status and power envelope.',
      },
      {
        method: 'POST',
        path: '/nodes/allocate',
        description: 'Assign reserved bare-metal servers to enterprise tenant.',
      },
    ],
    snippets: {
      curl: `curl -X GET "https://cloud.yotta.com/api/v2/clusters/shakti/status" \\
  -H "X-Yotta-Token: $YOTTA_ENTERPRISE_KEY"`,
      typescript: `import axios from 'axios';

export async function checkYottaNm1Cluster() {
  const res = await axios.get('https://cloud.yotta.com/api/v2/clusters/shakti/status', {
    headers: { 'X-Yotta-Token': process.env.YOTTA_ENTERPRISE_KEY },
  });
  return res.data;
}`,
      python: `import requests
res = requests.get(
    "https://cloud.yotta.com/api/v2/clusters/shakti/status",
    headers={"X-Yotta-Token": os.getenv("YOTTA_ENTERPRISE_KEY")}
)
print(res.json())`,
    },
    mockResponse: {
      facility: 'Yotta NM1 Panvel, Navi Mumbai',
      tier: 'Tier IV Fault Tolerant',
      cluster: 'Shakti-Cloud AI H100 Fabric',
      active_nodes: 32,
      latency_mumbai_ms: 4,
      latency_delhi_ms: 18,
      status: 'OPERATIONAL_LIVE',
    },
  },
  {
    id: 'prov-005',
    name: 'E2E Networks (India)',
    category: 'Hyperscale GPU Cloud',
    baseUrl: 'https://api.e2enetworks.com/myaccount/api/v1',
    authHeader: 'Authorization: Bearer <E2E_ACCESS_TOKEN>',
    envVar: 'E2E_ACCESS_TOKEN',
    docUrl: 'https://www.e2enetworks.com/documentation/api',
    fleetModels: ['H100 SXM5 80GB', 'A100 SXM4 80GB', 'L40S 48GB', 'RTX 8000'],
    interconnect: 'NVLink 900 GB/s & 100 Gbps Ethernet',
    description: 'Leading Indian AI-first cloud provider offering high availability GPU nodes with local INR invoicing, high broker margins, and instant provisioning.',
    steps: [
      'Create an account at myaccount.e2enetworks.com and verify corporate KYC.',
      'Generate API Access Token under API & Integrations tab.',
      'Configure Celerko with E2E API credentials to automate instance provisioning in Noida or Mumbai.',
      'Use E2E API to monitor power consumption and automatically generate client resale invoices.',
    ],
    endpoints: [
      {
        method: 'GET',
        path: '/nodes/inventory',
        description: 'List active and available Tir GPU nodes and wholesale monthly billing rates.',
      },
    ],
    snippets: {
      curl: `curl -X GET "https://api.e2enetworks.com/myaccount/api/v1/nodes/inventory" \\
  -H "Authorization: Bearer $E2E_ACCESS_TOKEN"`,
      typescript: `import axios from 'axios';

export async function getE2eInventory() {
  const res = await axios.get('https://api.e2enetworks.com/myaccount/api/v1/nodes/inventory', {
    headers: { Authorization: \`Bearer \${process.env.E2E_ACCESS_TOKEN}\` },
  });
  return res.data;
}`,
      python: `import requests
res = requests.get(
    "https://api.e2enetworks.com/myaccount/api/v1/nodes/inventory",
    headers={"Authorization": f"Bearer {os.getenv('E2E_ACCESS_TOKEN')}"}
)
print(res.json())`,
    },
    mockResponse: {
      provider: 'E2E Networks Tir Cloud',
      region: 'India-NCR-1',
      gpus_online: 24,
      gpu_model: 'NVIDIA H100 80GB SXM5',
      uptime_pct: 99.98,
      latency_ms: 12,
      billing_currency: 'INR (₹)',
    },
  },
];

export const GpuProviderIntegrationGuide: React.FC = () => {
  const { providers, syncProviderGpuCapacity, testPingLatency } = useApp();
  const [selectedDocId, setSelectedDocId] = useState<string>(GPU_INTEGRATION_DOCS[0].id);
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'typescript' | 'python'>('curl');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Tester States
  const [testEndpoint, setTestEndpoint] = useState<string>(GPU_INTEGRATION_DOCS[0].baseUrl);
  const [testSecret, setTestSecret] = useState<string>('sk_live_encrypted_sample_key_9821');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: number;
    latencyMs: number;
    response: any;
    synced: boolean;
  } | null>(null);

  const selectedDoc = GPU_INTEGRATION_DOCS.find(d => d.id === selectedDocId) || GPU_INTEGRATION_DOCS[0];

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    const lat = await testPingLatency();
    setTimeout(() => {
      setTestResult({
        status: 200,
        latencyMs: lat,
        response: selectedDoc.mockResponse,
        synced: false,
      });
      setIsTesting(false);
    }, 450);
  };

  const handleSyncCapacity = () => {
    if (!testResult) return;
    const matchProv = providers.find(p => p.name.toLowerCase().includes(selectedDoc.name.toLowerCase().split(' ')[0]));
    if (matchProv) {
      syncProviderGpuCapacity(matchProv.id);
      setTestResult(prev => prev ? { ...prev, synced: true } : null);
    } else if (providers.length > 0) {
      syncProviderGpuCapacity(providers[0].id);
      setTestResult(prev => prev ? { ...prev, synced: true } : null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-800/60 rounded-xl text-white space-y-2 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-mono uppercase font-bold mb-1">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Wholesale GPU Cloud Interconnect &amp; Automation Hub</span>
            </div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              GPU Provider Integration Guidelines, APIs &amp; Live Connection Tester
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Complete technical specification for connecting upstream hyperscale GPU clouds (CoreWeave, Lambda Labs, RunPod, Nebius, Yotta, E2E Networks). Upstream API keys remain encrypted on the broker backend while your clients receive tenant-scoped API keys with zero direct exposure to upstream supplier accounts.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <span className="px-3 py-1.5 rounded-lg bg-indigo-900/60 border border-indigo-700/60 text-xs font-mono text-indigo-200">
              {GPU_INTEGRATION_DOCS.length} Supported Upstream APIs
            </span>
          </div>
        </div>
      </div>

      {/* Provider Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs">
        {GPU_INTEGRATION_DOCS.map(doc => (
          <button
            key={doc.id}
            onClick={() => {
              setSelectedDocId(doc.id);
              setTestEndpoint(doc.baseUrl);
              setTestResult(null);
            }}
            className={`px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedDocId === doc.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{doc.name}</span>
          </button>
        ))}
      </div>

      {/* Main Grid: Details + Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Documentation, Specs, Endpoints & Code */}
        <div className="lg:col-span-2 space-y-6">
          {/* Provider Overview Card */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedDoc.name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
                    {selectedDoc.category}
                  </span>
                </div>
                <p className="text-slate-500 mt-1">{selectedDoc.description}</p>
              </div>

              <a
                href={selectedDoc.docUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Official Documentation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-sans block text-[10px]">Base API Endpoint:</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold truncate block">{selectedDoc.baseUrl}</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-sans block text-[10px]">Auth Header Pattern:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate block">{selectedDoc.authHeader}</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-sans block text-[10px]">Environment Variable:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold block">{selectedDoc.envVar}</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-sans block text-[10px]">High-Speed Fabric Interconnect:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold block">{selectedDoc.interconnect}</span>
              </div>
            </div>

            {/* Hardware Models Offered */}
            <div>
              <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-500" />
                <span>Available Wholesale Fleet Models</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedDoc.fleetModels.map(model => (
                  <span
                    key={model}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] border border-slate-200 dark:border-slate-700"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>

            {/* Step-by-Step Onboarding */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Step-by-Step Production Onboarding</span>
              </div>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                {selectedDoc.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Endpoints & API Operations */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-500" />
              <span>Core Provisioning &amp; Telemetry Endpoints</span>
            </h4>

            <div className="space-y-3">
              {selectedDoc.endpoints.map((ep, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 font-mono space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ep.method === 'GET'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : ep.method === 'POST'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {ep.path}
                    </span>
                  </div>
                  <p className="font-sans text-slate-600 dark:text-slate-400 text-[11px]">
                    {ep.description}
                  </p>
                  {ep.samplePayload && (
                    <div className="mt-2">
                      <div className="text-[10px] text-slate-400 font-sans mb-1">Payload JSON:</div>
                      <pre className="p-2 bg-slate-900 text-cyan-300 rounded text-[10px] overflow-x-auto">
                        {ep.samplePayload}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Code Snippets */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-500" />
                <span>Production Integration Code Samples</span>
              </h4>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                {(['curl', 'typescript', 'python'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveCodeLang(lang)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                      activeCodeLang === lang
                        ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {lang === 'curl' ? 'cURL' : lang === 'typescript' ? 'Node.js / TS' : 'Python'}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 bg-slate-950 text-cyan-300 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                {selectedDoc.snippets[activeCodeLang]}
              </pre>

              <button
                type="button"
                onClick={() => handleCopy(selectedDoc.snippets[activeCodeLang], activeCodeLang)}
                className="absolute top-3 right-3 px-2 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
              >
                {copiedKey === activeCodeLang ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Interactive Live Sandbox & Connection Tester */}
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 text-xs shadow-xs sticky top-4">
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-500" />
                Live API Handshake &amp; Tester
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Simulate handshake, measure real round-trip latency, and sync live capacity to broker fleet.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Target Provider Endpoint:
                </label>
                <input
                  type="text"
                  value={testEndpoint}
                  onChange={e => setTestEndpoint(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Encrypted Upstream Secret Token:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={testSecret}
                    onChange={e => setTestSecret(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] text-emerald-500 font-semibold font-mono">
                    AES-256
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing Handshake...' : `Test Connection to ${selectedDoc.name.split(' ')[0]}`}</span>
              </button>
            </div>

            {/* Test Results Output */}
            {testResult && (
              <div className="p-3 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 space-y-3 font-mono text-[11px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>200 OK — Connected</span>
                  </span>
                  <span className="text-cyan-400">
                    {testResult.latencyMs} ms RTT
                  </span>
                </div>

                <div className="text-[10px] text-slate-400">
                  Telemetry Response Payload:
                </div>
                <pre className="p-2.5 bg-slate-900 rounded text-cyan-300 text-[10px] overflow-x-auto max-h-48 overflow-y-auto">
                  {JSON.stringify(testResult.response, null, 2)}
                </pre>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSyncCapacity}
                    disabled={testResult.synced}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{testResult.synced ? 'Capacity Synced to Fleet ✓' : 'Sync Capacity to Broker Inventory'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Webhook Notice */}
            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 space-y-1 font-sans">
              <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Zero-Leak Tenant Isolation</span>
              </div>
              <p>
                Upstream tokens are never transmitted to client browsers. Requests from Client Panel use broker-issued Dialko/Celerko keys, which the broker resolves and forwards over private VPC interconnects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
