import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCircle2,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Server,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminLoginView: React.FC = () => {
  const { adminLogin, users, setIsClientPortalMode, setActiveTab } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please provide both administrator email and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = adminLogin(email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    }, 350);
  };

  const handleQuickDemoSelect = (userEmail: string, demoPass: string) => {
    setEmail(userEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-extrabold text-lg shadow-lg mb-1">
            CK
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Celerko Broker Command
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Administrative access gate for wholesale GPU clusters &amp; DID telecom infrastructure.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
              <span>Admin Authentication</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-semibold border border-cyan-200 dark:border-cyan-800">
              SHA-256 Hashed
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-lg flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@aethervox.cloud"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
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
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating with Hashed Credentials...</span>
              ) : (
                <>
                  <span>Sign In to Admin View</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Super Admin Quick Sign-In:
            </span>
            <button
              type="button"
              onClick={() => handleQuickDemoSelect('marcus.vance@aethervox.cloud', 'SuperAdmin@2026')}
              className="w-full p-2.5 text-left bg-slate-50 dark:bg-slate-800/60 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors group flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-500">
                  Marcus Vance
                </div>
                <div className="text-[10px] text-slate-400 font-mono">marcus.vance@aethervox.cloud · Super Admin</div>
              </div>
              <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold group-hover:underline">
                Use Credentials →
              </span>
            </button>
          </div>
        </div>

        {/* Client Portal Link */}
        <div className="text-center space-y-2">
          <button
            onClick={() => {
              setIsClientPortalMode(true);
              setActiveTab('client-portal');
              if (typeof window !== 'undefined') {
                window.history.pushState(null, '', '?panel=client');
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
          >
            <UserCircle2 className="w-4 h-4" />
            <span>Are you an enterprise client? Go to Client Portal (?panel=client) →</span>
          </button>
          <div className="text-[11px] text-slate-400 font-mono">
            Direct Admin URL: <span className="text-slate-500 select-all">?panel=admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};
