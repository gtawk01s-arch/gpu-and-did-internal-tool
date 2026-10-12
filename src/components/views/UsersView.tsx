import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Lock,
  KeyRound,
  UserX,
  UserCheck,
  Check,
  X,
  Search,
  Filter,
  Shield,
  Laptop,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { User, UserRole } from '../../types';
import { RBAC_MATRIX } from '../../data/mockData';

export const UsersView: React.FC = () => {
  const { users, createUser, updateUser, toggleUserStatus, currentUser, switchRole, changeUserPassword } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'rbac' | 'sessions'>('users');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showBackendProtectedModal, setShowBackendProtectedModal] = useState(false);

  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'Operations Manager',
  });

  const activeUsersCount = users.filter(u => u.status === 'Active').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    createUser(newUser);
    setShowCreateModal(false);
    setNewUser({ name: '', email: '', role: 'Operations Manager' });
  };

  const handlePasswordAction = (user: User) => {
    if (user.role === 'Super Admin' || user.id === 'usr-1') {
      setShowBackendProtectedModal(true);
      return;
    }
    setResettingUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setResetError(null);
    setResetSuccess(false);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    const res = changeUserPassword(resettingUser.id, newPassword);
    if (!res.success) {
      setResetError(res.message);
      return;
    }

    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setResettingUser(null);
      setNewPassword('');
      setConfirmPassword('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            User Administration &amp; RBAC Access Governance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-user authentication, privilege matrices, active session tracking, and IP logs.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Provision User</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Total Staff Accounts" value={users.length} subValue="Assigned operators" badge="Users" />
        <MetricCard label="Active Accounts" value={activeUsersCount} subValue="MFA enforced" highlight badge="Active" />
        <MetricCard label="RBAC Roles Defined" value="6 Roles" subValue="Least privilege model" badge="RBAC" />
        <MetricCard label="Current Session Role" value={currentUser.role} subValue={currentUser.name} badge="Current" />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          User Accounts Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'rbac'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          RBAC Permission Matrix
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'sessions'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Active Sessions &amp; IP Tracking
        </button>
      </div>

      {/* Tab 1: User Accounts Directory */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">User Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Assigned Role</th>
                  <th className="py-2.5 px-3">Last Login (UTC)</th>
                  <th className="py-2.5 px-3">Registered IP</th>
                  <th className="py-2.5 px-3 text-right">Active Sessions</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {u.name}
                      {currentUser.id === u.id && (
                        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 ml-1.5 font-mono">
                          (You)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {u.email}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {u.lastLogin}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {u.lastIp}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {u.activeSessions}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setResettingUser(u)}
                          className="px-2 py-1 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                            u.status === 'Active'
                              ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}
                        >
                          {u.status === 'Active' ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Permission Matrix */}
      {activeTab === 'rbac' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Enterprise RBAC Entitlement Matrix
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Platform Capability / Module</th>
                  <th className="py-2.5 px-3 text-center">Super Admin</th>
                  <th className="py-2.5 px-3 text-center">Ops Manager</th>
                  <th className="py-2.5 px-3 text-center">Finance Mgr</th>
                  <th className="py-2.5 px-3 text-center">Sales Mgr</th>
                  <th className="py-2.5 px-3 text-center">Support Agent</th>
                  <th className="py-2.5 px-3 text-center">Client Portal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {RBAC_MATRIX.map(row => (
                  <tr key={row.module} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {row.module}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.superAdmin ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.opsManager ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.financeManager ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.salesManager ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.supportAgent ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.clientPortal ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Active Sessions & IP Tracking */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map(u => (
              <div
                key={u.id}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-start justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{u.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{u.email} ({u.role})</div>
                  <div className="mt-3 space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    <div>Last Login: <span className="text-slate-900 dark:text-slate-100">{u.lastLogin}</span></div>
                    <div>Source IP: <span className="text-cyan-600 dark:text-cyan-400">{u.lastIp}</span> (San Francisco, CA)</div>
                    <div>Active JWT Sessions: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{u.activeSessions} device(s)</span></div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block mb-2" title="Online" />
                  <div>
                    <button
                      onClick={() => switchRole(u.role)}
                      className="px-2 py-1 text-[10px] font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300 rounded"
                    >
                      Impersonate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Provision User */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Provision New User Account
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a team member and assign explicit role-based permissions.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Jessica Chen"
                  value={newUser.name || ''}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Corporate Email</label>
                <input
                  required
                  type="email"
                  placeholder="jessica.c@aethervox.cloud"
                  value={newUser.email || ''}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">RBAC Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Operations Manager">Operations Manager</option>
                  <option value="Finance Manager">Finance Manager</option>
                  <option value="Sales Manager">Sales Manager</option>
                  <option value="Support Agent">Support Agent</option>
                  <option value="Client Portal User">Client Portal User</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Reset Password: {resettingUser.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Issue a temporary credential or send an automated secure reset link to {resettingUser.email}.
            </p>

            {resetSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded text-center text-xs font-semibold">
                Password successfully reset and temporary token emailed!
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">New Temporary Password</label>
                  <input
                    required
                    type="password"
                    placeholder="Minimum 12 characters..."
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setResettingUser(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded"
                  >
                    Commit Reset
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
