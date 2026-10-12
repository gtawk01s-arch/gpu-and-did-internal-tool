import React, { useState, useEffect } from 'react';
import {
  UserCircle2,
  Server,
  PhoneCall,
  Receipt,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  Activity,
  Layers,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  KeyRound,
  ShieldCheck,
  Building2,
  ArrowRight,
  ExternalLink,
  Save,
  Check,
  Copy,
  Share2,
  Link2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { Client, Invoice } from '../../types';
import { formatINR, SAMPLE_RECEIPT_IMAGE_SVG } from '../../data/mockData';

export const ClientPortalView: React.FC = () => {
  const {
    clients,
    gpus,
    dids,
    invoices,
    pendingRequests,
    createRequest,
    approveRequest,
    uploadPaymentProof,
    authenticatedClient,
    clientLogin,
    clientLogout,
    updateClientCredentials,
    setActiveTab,
    targetClientIdFromUrl,
    setTargetClientIdFromUrl,
    getClientPortalUrl,
    getClientShareMessage,
    returnToBrokerAdmin,
  } = useApp();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // If a specific client ID is targeted in the URL, identify it
  const targetedClient = targetClientIdFromUrl
    ? clients.find(
        c =>
          c.id === targetClientIdFromUrl ||
          c.companyName.toLowerCase().replace(/\s+/g, '-').includes(targetClientIdFromUrl.toLowerCase())
      ) || null
    : null;

  useEffect(() => {
    if (targetedClient && !authenticatedClient) {
      setLoginEmail(targetedClient.portalUsername || targetedClient.email);
    }
  }, [targetedClient, authenticatedClient]);

  // Portal view active tab
  const [activeTabPortal, setActiveTabPortal] = useState<'requests' | 'resources' | 'billing' | 'users-api' | 'security'>('requests');

  // Client Authorized Users & API Keys State
  const [clientApiKeys, setClientApiKeys] = useState<{ id: string; name: string; key: string; createdAt: string; lastUsed: string; status: 'Active' | 'Revoked' }[]>([
    { id: 'key-1', name: 'Production Dialko Agent Sync', key: 'ck_live_9f82d1c7a4b09e2381f', createdAt: '2026-08-10', lastUsed: '5 mins ago', status: 'Active' },
    { id: 'key-2', name: 'Staging Inference Cluster', key: 'ck_test_3a8b91cd20e57201fa', createdAt: '2026-09-02', lastUsed: '2 days ago', status: 'Active' },
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [createdKeySecret, setCreatedKeySecret] = useState<string | null>(null);

  const [clientTeamUsers, setClientTeamUsers] = useState<{ id: string; name: string; email: string; role: 'Admin' | 'Engineer' | 'Billing'; status: 'Active' | 'Invited' }[]>([
    { id: 'team-1', name: 'Sarah Jenkins', email: 'sjenkins@hyperscale.ai', role: 'Admin', status: 'Active' },
    { id: 'team-2', name: 'DevOps Lead', email: 'devops@hyperscale.ai', role: 'Engineer', status: 'Active' },
    { id: 'team-3', name: 'Accounts Payable', email: 'ap@hyperscale.ai', role: 'Billing', status: 'Active' },
  ]);
  const [showAddTeamUserModal, setShowAddTeamUserModal] = useState(false);
  const [newTeamUserName, setNewTeamUserName] = useState('');
  const [newTeamUserEmail, setNewTeamUserEmail] = useState('');
  const [newTeamUserRole, setNewTeamUserRole] = useState<'Admin' | 'Engineer' | 'Billing'>('Engineer');

  // Modals for raising requests
  const [showGpuRequestModal, setShowGpuRequestModal] = useState(false);
  const [showSipRequestModal, setShowSipRequestModal] = useState(false);
  const [requestSubmittedMessage, setRequestSubmittedMessage] = useState<string | null>(null);

  // Payment Proof Modal state
  const [attachingProofInvoice, setAttachingProofInvoice] = useState<Invoice | null>(null);
  const [proofScreenshotUrl, setProofScreenshotUrl] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [proofUtrNumber, setProofUtrNumber] = useState<string>('');
  const [proofPaymentMode, setProofPaymentMode] = useState<string>('RTGS / Corporate NetBanking');
  const [proofNotes, setProofNotes] = useState<string>('');
  const [proofSubmittedMessage, setProofSubmittedMessage] = useState<string | null>(null);
  const [viewingSubmittedProofInvoice, setViewingSubmittedProofInvoice] = useState<Invoice | null>(null);

  // Password update state
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordSavedMessage, setPasswordSavedMessage] = useState<string | null>(null);

  // New GPU Request Form
  const [gpuModelReq, setGpuModelReq] = useState('NVIDIA H100 SXM5 80GB');
  const [gpuQuantityReq, setGpuQuantityReq] = useState(8);
  const [gpuDurationReq, setGpuDurationReq] = useState('3 Months Reserved');
  const [gpuNotesReq, setGpuNotesReq] = useState('');

  // New SIP/DID Request Form
  const [sipChannelsReq, setSipChannelsReq] = useState(500);
  const [didCountReq, setDidCountReq] = useState(50);
  const [didCountryReq, setDidCountryReq] = useState('India (Tata / Airtel DIDs: Mumbai 022 & 1800 Toll-Free)');
  const [sipNotesReq, setSipNotesReq] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProofScreenshotUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUsePresetReceipt = () => {
    setProofScreenshotUrl(SAMPLE_RECEIPT_IMAGE_SVG);
    setProofFileName('HDFC_Bank_Corporate_RTGS_Receipt_UTR982341.png');
    setProofUtrNumber('HDFCR520261012984102');
    setProofPaymentMode('RTGS / Corporate NetBanking');
    setProofNotes('Transferred via Corporate NetBanking RTGS. Reference invoice memo verified.');
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachingProofInvoice || !proofScreenshotUrl) return;
    uploadPaymentProof(attachingProofInvoice.id, {
      screenshotUrl: proofScreenshotUrl,
      fileName: proofFileName || 'Payment_Proof.png',
      utrNumber: proofUtrNumber.trim() || `UTR-${Date.now()}`,
      paymentMode: proofPaymentMode,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      notes: proofNotes,
      clientContact: authenticatedClient?.contactPerson || authenticatedClient?.email,
    });
    setProofSubmittedMessage(`Payment proof successfully submitted for ${attachingProofInvoice.invoiceNumber}! Wholesale Admin will review & verify.`);
    setAttachingProofInvoice(null);
    setProofScreenshotUrl('');
    setProofFileName('');
    setProofUtrNumber('');
    setProofNotes('');
    setTimeout(() => setProofSubmittedMessage(null), 6000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    setTimeout(() => {
      const res = clientLogin(loginEmail, loginPassword);
      if (!res.success) {
        setLoginError(res.error || 'Authentication failed. Please verify credentials.');
      } else {
        setLoginError(null);
        setLoginPassword('');
      }
      setIsLoggingIn(false);
    }, 200);
  };

  const handleFillDemo = (client: Client) => {
    setLoginEmail(client.portalUsername || client.email);
    setLoginPassword(client.portalPassword || 'HyperScale@2026');
    setLoginError(null);
  };

  const handleQuickLogin = (client: Client) => {
    const user = client.portalUsername || client.email;
    const pass = client.portalPassword || 'HyperScale@2026';
    clientLogin(user, pass);
  };

  // If NOT authenticated, render the dedicated Client Portal Login Screen
  if (!authenticatedClient) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 space-y-4">
        {/* Top Operator Bar */}
        <div className="w-full max-w-xl p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300 shadow-md">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold text-white">Dedicated Client Portal URL</span>
            <span className="text-slate-500 hidden sm:inline">| Standalone Mode</span>
          </div>
          <button
            onClick={() => returnToBrokerAdmin('clients')}
            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
          >
            ← Return to Admin Portal
          </button>
        </div>

        <div className="w-full max-w-xl space-y-5">
          {/* Brand header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-xs font-semibold border border-cyan-200 dark:border-cyan-800">
              <Lock className="w-3.5 h-3.5" />
              <span>Dedicated Client Self-Service Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {targetedClient ? `${targetedClient.companyName} Portal` : 'Client Infrastructure Portal'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {targetedClient
                ? `Authorized infrastructure portal for ${targetedClient.companyName}. Sign in with your assigned credentials to submit GPU and SIP requests.`
                : 'Sign in with your company-specific client credentials to view allocated GPU nodes, manage SIP phone lines, and request capacity expansions.'}
            </p>
          </div>

          {/* Dedicated URL Chip if targeted */}
          {targetedClient && (
            <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-200 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-200 font-bold uppercase">
                  Targeted Client Account
                </span>
                <button
                  type="button"
                  onClick={() => setTargetClientIdFromUrl(null)}
                  className="text-[11px] text-cyan-700 dark:text-cyan-400 hover:underline font-medium"
                >
                  Switch Account
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="truncate">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{targetedClient.companyName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Contact: {targetedClient.contactPerson} ({targetedClient.email})
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getClientPortalUrl(targetedClient.id));
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 2000);
                  }}
                  className="shrink-0 px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUrl ? 'URL Copied!' : 'Copy Dedicated URL'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Login Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-6 sm:p-8 space-y-5">
            {loginError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
                  Company Email or Portal Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    required
                    type="text"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="e.g. sjenkins@hyperscale.ai"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-hidden focus:border-cyan-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                    Portal Access Password
                  </label>
                  <span className="text-[11px] text-slate-400">Case-sensitive</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-hidden focus:border-cyan-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                {isLoggingIn ? (
                  <span>Authenticating Client...</span>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Sign In to Client Portal</span>
                  </>
                )}
              </button>

              {/* Targeted client 1-click test button */}
              {targetedClient && (
                <button
                  type="button"
                  onClick={() => handleQuickLogin(targetedClient)}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>1-Click Test Login as {targetedClient.companyName}</span>
                </button>
              )}
            </form>

            {/* Quick Demo Credentials Panel */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Test Credentials (Click to Auto-Fill &amp; Login)
                </span>
                <span className="text-cyan-600 dark:text-cyan-400 font-medium">1-Click Test</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {clients.slice(0, 4).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleQuickLogin(c)}
                    className="p-2 text-left bg-slate-50 dark:bg-slate-800/60 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors group"
                  >
                    <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 flex items-center justify-between">
                      <span className="truncate">{c.companyName}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      {c.portalUsername || c.email}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Pass: <span className="text-slate-600 dark:text-slate-300 font-semibold">{c.portalPassword || 'HyperScale@2026'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Link back to admin platform */}
          <div className="text-center text-xs text-slate-500">
            <span>Are you a wholesale broker operator? </span>
            <button
              onClick={() => returnToBrokerAdmin('clients')}
              className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
            >
              Go to Broker Admin Console →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN CLIENT VIEW
  const client = authenticatedClient;
  const clientGpus = gpus.filter(g => g.assignedClient === client.companyName);
  const clientDids = dids.filter(d => d.assignedClient === client.companyName || d.assignedClientId === client.id);
  const clientInvoices = invoices.filter(i => i.clientId === client.id || i.clientName === client.companyName);
  const clientRequests = pendingRequests.filter(r => r.clientId === client.id || r.clientName === client.companyName);
  const totalGpuUnits = clientGpus.reduce((sum, g) => sum + g.allocatedQuantity, 0);

  const handleRaiseGpuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest({
      clientId: client.id,
      clientName: client.companyName,
      resourceType: 'GPU Cluster',
      specs: `${gpuQuantityReq}x ${gpuModelReq} (${gpuDurationReq})`,
      quantity: gpuQuantityReq,
      monthlyCost: gpuQuantityReq * 2150,
      sellingPrice: gpuQuantityReq * 3200,
      notes: gpuNotesReq || `Direct client request submitted by ${client.contactPerson}`,
    });

    setShowGpuRequestModal(false);
    setRequestSubmittedMessage(`GPU Cluster request for ${gpuQuantityReq}x ${gpuModelReq} successfully submitted to the wholesale broker!`);
    setTimeout(() => setRequestSubmittedMessage(null), 4000);
  };

  const handleRaiseSipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest({
      clientId: client.id,
      clientName: client.companyName,
      resourceType: 'SIP Trunk',
      specs: `${sipChannelsReq} Channels + ${didCountReq} DIDs (${didCountryReq})`,
      quantity: sipChannelsReq,
      monthlyCost: Math.round(sipChannelsReq * 2.5),
      sellingPrice: Math.round(sipChannelsReq * 4.2),
      notes: sipNotesReq || `Voice capacity expansion submitted by ${client.contactPerson}`,
    });

    setShowSipRequestModal(false);
    setRequestSubmittedMessage(`SIP & DID request for ${sipChannelsReq} channels submitted to the wholesale broker!`);
    setTimeout(() => setRequestSubmittedMessage(null), 4000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) return;
    updateClientCredentials(client.id, client.portalUsername || client.email, newPasswordInput.trim());
    setPasswordSavedMessage('Portal password successfully updated.');
    setNewPasswordInput('');
    setTimeout(() => setPasswordSavedMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Operator Banner */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 shadow-lg">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-white">Client Portal Active:</span>
          <span className="text-cyan-300 font-bold">{client.companyName}</span>
          <span className="text-slate-500 hidden sm:inline">·</span>
          <span className="text-slate-400 font-mono text-[11px] hidden md:inline truncate max-w-sm">
            {getClientPortalUrl(client.id)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(getClientPortalUrl(client.id));
              setCopiedUrl(true);
              setTimeout(() => setCopiedUrl(false), 2000);
            }}
            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'URL Copied!' : 'Copy Dedicated URL'}</span>
          </button>
          <button
            onClick={() => returnToBrokerAdmin('clients')}
            className="px-2.5 py-1 text-[11px] font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs"
          >
            <span>Broker Console →</span>
          </button>
        </div>
      </div>

      {/* Client Identity & Panel Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Authenticated Session
            </span>
            <span className="text-xs text-slate-300 font-medium">Logged in as: <strong>{client.contactPerson}</strong></span>
            <span className="text-slate-500 text-xs">({client.email})</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{client.companyName}</h2>
          <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
            <span>Resource Need: <strong>{client.resourceRequirement}</strong></span>
            <span>·</span>
            <span>Account Status: <strong className="text-emerald-400">{client.status}</strong></span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={() => {
              navigator.clipboard.writeText(getClientPortalUrl(client.id));
              setCopiedUrl(true);
              setTimeout(() => setCopiedUrl(false), 2000);
            }}
            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5"
            title="Copy Shareable Link"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedUrl ? 'Copied Link!' : 'Share URL'}</span>
          </button>
          <button
            onClick={clientLogout}
            className="px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800 rounded-lg transition-colors flex items-center gap-1.5"
            title="Sign Out of Client Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Primary Actions: Raise GPU / Raise SIP Request */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Request Additional Infrastructure from Wholesale Broker
          </h3>
          <p className="text-xs text-slate-500">
            Submit capacity requests for high-performance GPU nodes or telecom DID phone lines.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setShowGpuRequestModal(true)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Server className="w-3.5 h-3.5" />
            <span>+ Raise GPU Request</span>
          </button>
          <button
            onClick={() => setShowSipRequestModal(true)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>+ Raise SIP / DID Request</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {requestSubmittedMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{requestSubmittedMessage}</span>
        </div>
      )}

      {/* Quick KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Active Dedicated GPUs" value={`${totalGpuUnits} Nodes`} subValue={clientGpus.length > 0 ? clientGpus[0].gpuModel : 'None'} highlight badge="Compute" />
        <MetricCard label="Active DID Numbers" value={`${clientDids.length} Numbers`} subValue="Inbound VoIP lines" badge="Telecom" />
        <MetricCard label="Monthly Billing" value={formatINR(client.monthlySpend)} subValue="Active contracts" badge="Billing" />
        <MetricCard label="Pending Requests" value={clientRequests.filter(r => r.status === 'Pending').length} subValue="Awaiting broker review" badge="Queue" />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'requests', label: `My Submitted Requests (${clientRequests.length})` },
          { id: 'resources', label: `Allocated Infrastructure (${clientGpus.length + clientDids.length})` },
          { id: 'billing', label: `Invoices & Receipts (${clientInvoices.length})` },
          { id: 'users-api', label: `Authorized Users & API Keys (${clientTeamUsers.length + clientApiKeys.length})` },
          { id: 'security', label: 'Portal Credentials & Security' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTabPortal(tab.id as any)}
            className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
              activeTabPortal === tab.id
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Requests & Tracking */}
      {activeTabPortal === 'requests' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              My Resource Requests Status (Real-Time Broker Sync)
            </span>
            <span className="text-slate-400 text-[11px]">Auto-updates when Broker Approves</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Request ID</th>
                  <th className="py-2.5 px-3">Resource Type</th>
                  <th className="py-2.5 px-3">Requested Specifications</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Est. Monthly Rate</th>
                  <th className="py-2.5 px-3">Date Submitted</th>
                  <th className="py-2.5 px-3">Broker Status</th>
                  <th className="py-2.5 px-3 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {clientRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      You haven't submitted any resource requests yet. Click <strong>+ Raise GPU Request</strong> or <strong>+ Raise SIP / DID Request</strong> above.
                    </td>
                  </tr>
                ) : (
                  clientRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {req.requestId}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                          {req.resourceType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        <div>{req.specs}</div>
                        {req.notes && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5">
                            Note: {req.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                        {req.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                        {formatINR(req.sellingPrice)}/mo
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                        {req.date}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {req.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => approveRequest(req.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1 transition-colors"
                              title="Instantly approve and provision resource to this client"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Test Approve</span>
                            </button>
                            <button
                              onClick={() => setActiveTab('approvals')}
                              className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded transition-colors"
                            >
                              Admin Desk
                            </button>
                          </div>
                        ) : req.status === 'Approved' ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            ✓ Provisioned
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Active Allocated Resources */}
      {activeTabPortal === 'resources' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-500" />
              <span>Allocated GPU Nodes ({clientGpus.length})</span>
            </h3>
            {clientGpus.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No GPU nodes currently allocated. Use the "Raise GPU Request" button above to request compute nodes.
              </div>
            ) : (
              <div className="space-y-2">
                {clientGpus.map(g => (
                  <div key={g.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-mono">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{g.gpuId} — {g.gpuModel}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{g.region} · {g.vramGb}GB VRAM · Provider: {g.provider}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold font-sans">{formatINR(g.sellingPrice)}/mo</div>
                      <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded text-[10px]">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-indigo-500" />
                <span>Assigned DID Numbers &amp; Telecom Trunks ({clientDids.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-sans">
                Real-time carrier allocation &amp; SIP trunk mapping
              </span>
            </div>
            {clientDids.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                <PhoneCall className="w-6 h-6 mx-auto mb-2 text-slate-400 opacity-60" />
                <div>No DID telephone numbers currently assigned to your account.</div>
                <div className="text-[11px] text-slate-500 mt-1">Use the "Raise SIP / DID Request" button above to request telephone numbers.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                      <th className="py-2.5 px-3">DID Number (E.164)</th>
                      <th className="py-2.5 px-3">Associated SIP Trunk</th>
                      <th className="py-2.5 px-3">Provider</th>
                      <th className="py-2.5 px-3">Region &amp; Type</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Allocation Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                    {clientDids.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                          {d.didNumber}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">
                          {d.sipTrunkName || 'Direct Carrier Trunk'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                          {d.provider}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {d.country} · <span className="font-mono text-slate-400">({d.type})</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500 text-[11px]">
                          {d.assignedDate || 'Active'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Billing & Invoices */}
      {activeTabPortal === 'billing' && (
        <div className="space-y-4">
          {proofSubmittedMessage && (
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 rounded-lg text-purple-900 dark:text-purple-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>{proofSubmittedMessage}</span>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Corporate Invoices &amp; Remittance Proof Center (INR ₹)
              </span>
              <span className="text-slate-400 text-[11px]">Attach transaction screenshot for Admin verification</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Billing Period</th>
                    <th className="py-2.5 px-3 text-right">Amount Due (INR ₹)</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Billing Status</th>
                    <th className="py-2.5 px-3 text-right">Payment Proof &amp; Remittance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {clientInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No invoices dispatched to your panel yet.
                      </td>
                    </tr>
                  ) : (
                    clientInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          {inv.billingPeriod}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatINR(inv.totalAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                          {inv.dueDate}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {inv.status === 'Paid' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Paid &amp; Settled</span>
                            </span>
                          ) : inv.status === 'Verification Pending' ? (
                            <button
                              onClick={() => setViewingSubmittedProofInvoice(inv)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-md transition-colors"
                              title="Click to view attached proof"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                              <span>⚡ Proof Under Review</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setAttachingProofInvoice(inv);
                                setProofScreenshotUrl('');
                                setProofFileName('');
                                setProofUtrNumber('');
                                setProofNotes('');
                              }}
                              className="px-3 py-1.5 text-[11px] font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors shadow-xs flex items-center gap-1.5 ml-auto"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Attach Payment Screenshot</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Indian Bank Coordinates Card for Client Remittance */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-500" />
              <span>Official Bank Transfer Coordinates (RTGS / NEFT / IMPS)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 pt-1">
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-sans text-[10px]">Beneficiary Name:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">AetherVox Wholesale Infra Ltd</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-sans text-[10px]">Bank &amp; Account Number:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">ICICI Bank · 001105029381</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-sans text-[10px]">IFSC Code &amp; Branch:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">ICIC0000011 (Nariman Point, Mumbai)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              After completing the bank transfer, click <strong>"Attach Payment Screenshot"</strong> above to upload your payment receipt and UTR number. The Wholesale Admin will verify and mark your invoice as Paid.
            </p>
          </div>
        </div>
      )}

      {/* Tab: Authorized Team Users & API Keys */}
      {activeTabPortal === 'users-api' && (
        <div className="space-y-6">
          {/* Section A: Authorized Organization Users */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                  <UserCircle2 className="w-4 h-4 text-cyan-500" />
                  <span>Authorized Organization Users ({client.companyName})</span>
                </h3>
                <p className="text-slate-500 text-xs">
                  Colleagues and engineers authorized to request GPU and DID infrastructure on behalf of {client.companyName}.
                </p>
              </div>
              <button
                onClick={() => setShowAddTeamUserModal(true)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Invite Team Member</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Role / Permissions</th>
                    <th className="py-2.5 px-3">Access Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {clientTeamUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                        {u.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {u.email}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {u.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setClientTeamUsers(prev => prev.filter(item => item.id !== u.id))}
                          className="text-rose-500 hover:text-rose-600 text-[11px] font-medium"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: API Keys for Dialko & Compute Integrations */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-500" />
                  <span>API Keys &amp; Dialko Agent Integration Tokens</span>
                </h3>
                <p className="text-slate-500 text-xs">
                  Authenticate programmatic requests to allocate GPUs, manage SIP call trunks, or route through Dialko voice agents.
                </p>
              </div>
              <button
                onClick={() => {
                  setNewKeyName('');
                  setCreatedKeySecret(null);
                  setShowCreateKeyModal(true);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Generate API Key</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                    <th className="py-2.5 px-3">Token Name</th>
                    <th className="py-2.5 px-3">Key Preview</th>
                    <th className="py-2.5 px-3">Created Date</th>
                    <th className="py-2.5 px-3">Last Activity</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {clientApiKeys.map(k => (
                    <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                        {k.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-cyan-600 dark:text-cyan-400">
                        {k.key.substring(0, 12)}••••••••
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                        {k.createdAt}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {k.lastUsed}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          k.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {k.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {k.status === 'Active' ? (
                          <button
                            onClick={() => {
                              setClientApiKeys(prev =>
                                prev.map(item => item.id === k.id ? { ...item, status: 'Revoked' } : item)
                              );
                            }}
                            className="text-rose-500 hover:text-rose-600 text-[11px] font-medium"
                          >
                            Revoke
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Revoked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Portal Login Credentials */}
      {activeTabPortal === 'security' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-cyan-500" />
              <span>Dedicated Portal URL &amp; Login Credentials</span>
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Share this dedicated URL with your team members along with the credentials below to access the {client.companyName} self-service portal.
            </p>
          </div>

          {passwordSavedMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{passwordSavedMessage}</span>
            </div>
          )}

          {/* Dedicated URL Card */}
          <div className="p-4 bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-200 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-200 font-bold uppercase">
                Your Direct Portal URL
              </span>
              <span className="text-[11px] text-cyan-700 dark:text-cyan-300 font-semibold">Unique to {client.companyName}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                readOnly
                type="text"
                value={getClientPortalUrl(client.id)}
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-xs select-all outline-hidden"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getClientPortalUrl(client.id));
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const invite = getClientShareMessage(client);
                navigator.clipboard.writeText(invite);
                setCopiedInvite(true);
                setTimeout(() => setCopiedInvite(false), 2000);
              }}
              className="w-full py-2 bg-white dark:bg-slate-900 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 border border-cyan-300 dark:border-cyan-700 text-cyan-800 dark:text-cyan-200 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors text-xs"
            >
              {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-cyan-600" />}
              <span>{copiedInvite ? 'Full Invitation Copied to Clipboard!' : 'Copy Complete Invitation Message (URL + Credentials)'}</span>
            </button>
          </div>

          {/* Credentials Display */}
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">Portal Login Username / Email:</span>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 select-all">
                  {client.portalUsername || client.email}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(client.portalUsername || client.email);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 1500);
                }}
                className="p-1.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded"
                title="Copy Username"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">Current Password:</span>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 select-all">
                  {client.portalPassword || 'HyperScale@2026'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(client.portalPassword || 'HyperScale@2026');
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 1500);
                }}
                className="p-1.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded"
                title="Copy Password"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Update Password Form */}
          <form onSubmit={handleUpdatePassword} className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Change Portal Password</h4>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">New Password</label>
              <input
                required
                type="text"
                placeholder="Enter new secure password (e.g. MySecretPass@2026)"
                value={newPasswordInput}
                onChange={e => setNewPasswordInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-xs outline-hidden focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Password</span>
            </button>
          </form>
        </div>
      )}

      {/* Modal: Raise GPU Request */}
      {showGpuRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-cyan-500" />
              <span>Raise GPU Compute Cluster Request</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit your GPU cluster requirements to our wholesale broker team for rapid provisioning.
            </p>

            <form onSubmit={handleRaiseGpuSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">GPU Architecture Model</label>
                <select
                  value={gpuModelReq}
                  onChange={e => setGpuModelReq(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  <option value="NVIDIA H100 SXM5 80GB">NVIDIA H100 SXM5 80GB (NVLink 900 GB/s)</option>
                  <option value="NVIDIA A100 SXM4 80GB">NVIDIA A100 SXM4 80GB (NVLink 600 GB/s)</option>
                  <option value="NVIDIA L40S 48GB Ada">NVIDIA L40S 48GB Ada (PCIe 4.0)</option>
                  <option value="NVIDIA RTX 4090 24GB">NVIDIA RTX 4090 24GB (High Density)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">GPU Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="128"
                    value={gpuQuantityReq}
                    onChange={e => setGpuQuantityReq(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Commitment Period</label>
                  <select
                    value={gpuDurationReq}
                    onChange={e => setGpuDurationReq(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  >
                    <option value="1 Month Flex">1 Month Flex</option>
                    <option value="3 Months Reserved">3 Months Reserved</option>
                    <option value="6 Months Committed">6 Months Committed</option>
                    <option value="12 Months Enterprise">12 Months Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Workload Notes / Network Requirements</label>
                <textarea
                  rows={2}
                  value={gpuNotesReq}
                  onChange={e => setGpuNotesReq(e.target.value)}
                  placeholder="e.g. Distributed LLM pre-training, require 400Gbps InfiniBand cluster."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGpuRequestModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg"
                >
                  Submit GPU Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Raise SIP Request */}
      {showSipRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-indigo-500" />
              <span>Raise SIP Trunk &amp; DID Number Request</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Request voice carrier channels and E.164 phone numbers for inbound/outbound calling.
            </p>

            <form onSubmit={handleRaiseSipSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Concurrent Channels</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={sipChannelsReq}
                    onChange={e => setSipChannelsReq(parseInt(e.target.value) || 50)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Quantity of DIDs</label>
                  <input
                    type="number"
                    min="1"
                    value={didCountReq}
                    onChange={e => setDidCountReq(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Telecom Circle / Area Region</label>
                <select
                  value={didCountryReq}
                  onChange={e => setDidCountryReq(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  <option value="India (Mumbai 022 - Tata Teleservices)">India (Mumbai 022 - Tata Teleservices)</option>
                  <option value="India (Delhi NCR 011 - Airtel Business)">India (Delhi NCR 011 - Airtel Business)</option>
                  <option value="India (Bengaluru 080 - Reliance Jio Enterprise)">India (Bengaluru 080 - Reliance Jio Enterprise)</option>
                  <option value="India (National Toll-Free 1800 - Tata / Airtel)">India (National Toll-Free 1800 - Tata / Airtel)</option>
                  <option value="India (Hyderabad 040 / Pune 020)">India (Hyderabad 040 / Pune 020)</option>
                  <option value="India (Chennai 044 - Vi Business)">India (Chennai 044 - Vi Business)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Use Case / Call Volume Notes</label>
                <textarea
                  rows={2}
                  value={sipNotesReq}
                  onChange={e => setSipNotesReq(e.target.value)}
                  placeholder="e.g. Inbound customer service call center expansion; high CPS required."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSipRequestModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  Submit Voice Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Client Uploads Payment Proof Screenshot (Requirement 3) */}
      {attachingProofInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-500" />
                  <span>Attach Bank Remittance Screenshot</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Invoice <strong className="font-mono text-slate-700 dark:text-slate-300">{attachingProofInvoice.invoiceNumber}</strong> · Amount Due: <strong className="text-emerald-600 font-mono">{formatINR(attachingProofInvoice.totalAmount)}</strong>
                </p>
              </div>
              <button
                onClick={() => setAttachingProofInvoice(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4 text-xs">
              {/* Preset 1-Click receipt helper */}
              <div className="p-3 bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-cyan-900 dark:text-cyan-200 text-xs block">Need quick test proof?</span>
                  <span className="text-[11px] text-cyan-700 dark:text-cyan-400">Autofill a verified HDFC Bank Corporate RTGS Receipt.</span>
                </div>
                <button
                  type="button"
                  onClick={handleUsePresetReceipt}
                  className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs transition-colors shadow-xs shrink-0"
                >
                  ⚡ Use Sample Receipt
                </button>
              </div>

              {/* File Upload Selector */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Upload Payment Screenshot / Counterfoil (Image / PNG / JPEG)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 dark:file:bg-cyan-950/50 file:text-cyan-700 dark:file:text-cyan-300 hover:file:bg-cyan-100"
                />
                {proofFileName && (
                  <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                    Selected file: {proofFileName}
                  </span>
                )}
              </div>

              {/* Image Preview */}
              {proofScreenshotUrl && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-950 p-2 flex items-center justify-center max-h-48">
                  <img
                    src={proofScreenshotUrl}
                    alt="Proof preview"
                    className="max-h-44 object-contain rounded"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Bank UTR / Ref Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFCR520261012984102"
                    value={proofUtrNumber}
                    onChange={e => setProofUtrNumber(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Payment Mode</label>
                  <select
                    value={proofPaymentMode}
                    onChange={e => setProofPaymentMode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="RTGS / Corporate NetBanking">RTGS (Real-Time Gross Settlement)</option>
                    <option value="NEFT">NEFT (National Electronic Fund Transfer)</option>
                    <option value="IMPS / Immediate Transfer">IMPS (Immediate Payment)</option>
                    <option value="Corporate UPI / QR">Corporate UPI / QR</option>
                    <option value="Corporate NetBanking Direct">Corporate NetBanking Direct</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Remarks / Transfer Memo</label>
                <textarea
                  rows={2}
                  value={proofNotes}
                  onChange={e => setProofNotes(e.target.value)}
                  placeholder="e.g. Settled from HDFC Current Account. Reference INV memo included."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAttachingProofInvoice(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!proofScreenshotUrl}
                  className="px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Submit Proof to Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Client Reviews Their Already Submitted Proof */}
      {viewingSubmittedProofInvoice && viewingSubmittedProofInvoice.paymentProof && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Submitted Remittance Counterfoil</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Invoice <strong className="font-mono text-slate-700 dark:text-slate-300">{viewingSubmittedProofInvoice.invoiceNumber}</strong> · Under review by Wholesale Admin
                </p>
              </div>
              <button
                onClick={() => setViewingSubmittedProofInvoice(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl font-mono text-[11px] space-y-1">
                <div>UTR Number: <strong className="text-purple-900 dark:text-purple-200">{viewingSubmittedProofInvoice.paymentProof.utrNumber}</strong></div>
                <div>Payment Mode: <strong>{viewingSubmittedProofInvoice.paymentProof.paymentMode}</strong></div>
                <div>Submitted At: <strong>{viewingSubmittedProofInvoice.paymentProof.uploadedAt}</strong></div>
                {viewingSubmittedProofInvoice.paymentProof.notes && (
                  <div>Remarks: <span className="italic">{viewingSubmittedProofInvoice.paymentProof.notes}</span></div>
                )}
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-950 p-2 flex items-center justify-center max-h-72">
                <img
                  src={viewingSubmittedProofInvoice.paymentProof.screenshotUrl}
                  alt="Submitted counterfoil"
                  className="max-h-68 object-contain rounded"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setViewingSubmittedProofInvoice(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Generate API Key */}
      {showCreateKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Generate API Integration Key
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowCreateKeyModal(false);
                  setCreatedKeySecret(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            {createdKeySecret ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-200">
                  <div className="font-bold mb-1">API Key Successfully Generated!</div>
                  <div className="text-[11px]">Copy this key now. It will not be shown in full again for security reasons.</div>
                </div>
                <div className="p-2.5 bg-slate-950 text-emerald-400 font-mono text-xs rounded border border-slate-800 select-all break-all">
                  {createdKeySecret}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdKeySecret);
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold text-xs flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy API Key</span>
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!newKeyName.trim()) return;
                  const keySecret = `ck_live_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
                  const newEntry = {
                    id: `key-${Date.now()}`,
                    name: newKeyName.trim(),
                    key: keySecret,
                    createdAt: new Date().toISOString().split('T')[0],
                    lastUsed: 'Never',
                    status: 'Active' as const,
                  };
                  setClientApiKeys(prev => [newEntry, ...prev]);
                  setCreatedKeySecret(keySecret);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Token Name / Application</label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production Dialko Voice Gateway, AI Inference Worker"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500">
                  This key will have authorized tenant permissions strictly scoped to <strong>{client.companyName}</strong>. Cross-organization access is prohibited by backend tenant isolation.
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateKeyModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
                  >
                    Create Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Invite Team User */}
      {showAddTeamUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserCircle2 className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Invite Team Member to {client.companyName}
                </h3>
              </div>
              <button
                onClick={() => setShowAddTeamUserModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newTeamUserName || !newTeamUserEmail) return;
                setClientTeamUsers(prev => [
                  ...prev,
                  {
                    id: `team-${Date.now()}`,
                    name: newTeamUserName.trim(),
                    email: newTeamUserEmail.trim(),
                    role: newTeamUserRole,
                    status: 'Active',
                  },
                ]);
                setShowAddTeamUserModal(false);
                setNewTeamUserName('');
                setNewTeamUserEmail('');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={newTeamUserName}
                  onChange={e => setNewTeamUserName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Work Email Address</label>
                <input
                  type="email"
                  required
                  value={newTeamUserEmail}
                  onChange={e => setNewTeamUserEmail(e.target.value)}
                  placeholder="e.g. alex@company.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Role &amp; Permissions</label>
                <select
                  value={newTeamUserRole}
                  onChange={e => setNewTeamUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  <option value="Engineer">Engineer (Submit GPU &amp; SIP Requests, Read Infrastructure)</option>
                  <option value="Billing">Billing (View Invoices, Attach Payment Counterfoils)</option>
                  <option value="Admin">Admin (Full Organization Access, Generate API Keys)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTeamUserModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
