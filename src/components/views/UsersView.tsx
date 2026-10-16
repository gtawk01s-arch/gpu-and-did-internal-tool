import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Lock,
  KeyRound,
  Trash2,
  Edit,
  Check,
  X,
  Shield,
  AlertTriangle,
  UserCheck,
  UserX,
  Layers,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp, DEFAULT_PERMISSIONS_BY_ROLE } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { User, UserRole, UserAccessPermissions } from '../../types';
import { RBAC_MATRIX } from '../../data/mockData';
import { hashPassword } from '../../utils/crypto';

const PERMISSION_MODULES: { key: keyof UserAccessPermissions; label: string; desc: string }[] = [
  { key: 'dashboard', label: 'Dashboard & Metrics', desc: 'Financial overview, capacity summaries, and utilization' },
  { key: 'allocations', label: 'Resource Allocations', desc: 'Approve, Reject, or Hold GPU/DID provisioning requests' },
  { key: 'gpus', label: 'GPU Cluster Fleet', desc: 'Wholesale GPU nodes, contract pricing, and hardware fleet' },
  { key: 'sips', label: 'SIP Trunks & DIDs', desc: 'Carrier interconnects, DID number blocks, and routing' },
  { key: 'clients', label: 'Enterprise Accounts', desc: 'Client account management, credit limits, and dedicated links' },
  { key: 'providers', label: 'Upstream Providers', desc: 'Cloud suppliers (RunPod, Lambda, Vast.ai), API keys, and SLAs' },
  { key: 'finance', label: 'Profitability Ledger', desc: 'Discrete GPU vs DID arbitrage calculations and spread metrics' },
  { key: 'invoices', label: 'Invoicing & Billing', desc: 'Generate invoices, apply GST/taxes, and billing summaries' },
  { key: 'payments', label: 'Payment Verifications', desc: 'Review client RTGS/NEFT/Wire proofs and reconcile accounts' },
  { key: 'alerts', label: 'Incidents & Alerts', desc: 'Capacity warnings and telecom trunk outage notifications' },
  { key: 'audit', label: 'Security & Audit Logs', desc: 'Immutable trail of user logins, role switches, and IP accesses' },
  { key: 'reports', label: 'Analytics Reports', desc: 'Generate and export CSV operational ledgers' },
  { key: 'users', label: 'User Governance', desc: 'Create, edit, reset passwords, and manage access permissions' },
  { key: 'database', label: 'PostgreSQL Schema', desc: 'Read-only access to PostgreSQL DDL & Prisma (Super Admin only)' },
];

export const UsersView: React.FC = () => {
  const {
    users,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    currentUser,
    switchRole,
    changeUserPassword,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'rbac' | 'sessions'>('users');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create user form state
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createRole, setCreateRole] = useState<UserRole>('Operations Manager');
  const [createPassword, setCreatePassword] = useState('Staff@2026');
  const [createPermissions, setCreatePermissions] = useState<UserAccessPermissions>(
    DEFAULT_PERMISSIONS_BY_ROLE['Operations Manager']
  );

  // Edit user form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('Operations Manager');
  const [editPassword, setEditPassword] = useState('');
  const [editPermissions, setEditPermissions] = useState<UserAccessPermissions>(
    DEFAULT_PERMISSIONS_BY_ROLE['Operations Manager']
  );

  // Reset password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  // RBAC Matrix dynamic view mode
  const [matrixViewMode, setMatrixViewMode] = useState<'users' | 'templates'>('users');

  const activeUsersCount = users.filter(u => u.status === 'Active').length;

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const getUserGrantedCount = (u: User): number => {
    if (u.role === 'Super Admin') return PERMISSION_MODULES.length;
    const perms = u.permissions || DEFAULT_PERMISSIONS_BY_ROLE[u.role] || {};
    return PERMISSION_MODULES.filter(m => Boolean(perms[m.key])).length;
  };

  const handleToggleMatrixPermission = (userId: string, modKey: keyof UserAccessPermissions) => {
    if (currentUser.role !== 'Super Admin') {
      showFeedback('Only Super Admin can modify user entitlements.', 'error');
      return;
    }
    const target = users.find(u => u.id === userId);
    if (!target) return;
    if (target.role === 'Super Admin') {
      showFeedback('Super Admin always has full access to all system modules.', 'error');
      return;
    }
    const currentPerms = target.permissions || DEFAULT_PERMISSIONS_BY_ROLE[target.role] || {};
    const updatedPerms: UserAccessPermissions = {
      ...DEFAULT_PERMISSIONS_BY_ROLE[target.role],
      ...currentPerms,
      [modKey]: !currentPerms[modKey],
    };
    updateUser(userId, { permissions: updatedPerms });
    showFeedback(`${!currentPerms[modKey] ? 'Granted' : 'Revoked'} "${modKey}" access for ${target.name}.`);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setCreateName('');
    setCreateEmail('');
    setCreateRole('Operations Manager');
    setCreatePassword('Staff@2026');
    setCreatePermissions(DEFAULT_PERMISSIONS_BY_ROLE['Operations Manager']);
    setShowCreateModal(true);
  };

  // Submit Create User
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || !createEmail.trim()) {
      showFeedback('Name and Email are required.', 'error');
      return;
    }
    createUser(
      {
        name: createName.trim(),
        email: createEmail.trim(),
        role: createRole,
      },
      createPassword.trim() || 'Staff@2026',
      createPermissions
    );
    setShowCreateModal(false);
    showFeedback(`User account for ${createEmail} has been provisioned with custom access rights.`);
  };

  // Open Edit Modal
  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditPassword('');
    setEditPermissions(u.permissions || DEFAULT_PERMISSIONS_BY_ROLE[u.role] || DEFAULT_PERMISSIONS_BY_ROLE['Operations Manager']);
  };

  // Submit Edit User
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim() || !editEmail.trim()) {
      showFeedback('Name and Email cannot be empty.', 'error');
      return;
    }

    const updates: Partial<User> = {
      name: editName.trim(),
      email: editEmail.trim(),
      role: editRole,
      permissions: editPermissions,
    };

    if (editPassword.trim()) {
      if (editPassword.trim().length < 8) {
        showFeedback('Password must be at least 8 characters.', 'error');
        return;
      }
      updates.passwordHash = hashPassword(editPassword.trim());
    }

    updateUser(editingUser.id, updates);
    setEditingUser(null);
    showFeedback(`User ${editName} was successfully updated with configured access privileges.`);
  };

  // Delete User Confirm
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    const res = deleteUser(deletingUser.id);
    setDeletingUser(null);
    if (res.success) {
      showFeedback(res.message, 'success');
    } else {
      showFeedback(res.message, 'error');
    }
  };

  // Reset Password Submit
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

    setResettingUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setResetError(null);
    showFeedback(`Password for ${resettingUser.email} has been updated and securely hashed.`);
  };

  const getGrantedPermissionsCount = (u: User) => {
    const perms = u.permissions || DEFAULT_PERMISSIONS_BY_ROLE[u.role] || DEFAULT_PERMISSIONS_BY_ROLE['Operations Manager'];
    return PERMISSION_MODULES.filter(m => perms[m.key] === true).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            User Governance &amp; Custom Access Rights
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Super Administrator can provision, edit, reset passwords, grant custom section permissions, and delete staff accounts.
          </p>
        </div>
        {currentUser.role === 'Super Admin' && (
          <button
            onClick={handleOpenCreateModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Provision New User</span>
          </button>
        )}
      </div>

      {feedbackMessage && (
        <div
          className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-between animate-fadeIn ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-rose-500" />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="p-0.5 opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Active Users" value={users.length} subValue="Governed accounts" badge="Users" />
        <MetricCard label="Active Status" value={activeUsersCount} subValue="MFA enforced" highlight badge="Active" />
        <MetricCard label="Access Modules" value={`${PERMISSION_MODULES.length} Sections`} subValue="Granular RBAC" badge="Security" />
        <MetricCard label="Current Operator" value={currentUser.role} subValue={currentUser.name} badge="Super Admin" />
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
          RBAC Permission Matrix ({users.length} {users.length === 1 ? 'User' : 'Users'})
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
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              System Operators &amp; Access Rights
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              Passwords stored as salted SHA-256 hashes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">User Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Assigned Role</th>
                  <th className="py-2.5 px-3">Configured Access</th>
                  <th className="py-2.5 px-3">Last Login</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {users.map(u => {
                  const accessCount = getGrantedPermissionsCount(u);
                  const isPrimarySuperAdmin = u.id === 'usr-1' || (u.role === 'Super Admin' && users.length === 1);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {currentUser.id === u.id && (
                            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold bg-cyan-100 dark:bg-cyan-950 px-1.5 py-0.2 rounded">
                              (You)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {u.email}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'Super Admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                            : u.role === 'Operations Manager'
                            ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {accessCount} / {PERMISSION_MODULES.length} Modules
                          </span>
                          {u.role === 'Super Admin' ? (
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">(Full Root Access)</span>
                          ) : (
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline"
                            >
                              Edit Rights
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {u.lastLogin}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit User & Permissions Button */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="px-2 py-1 text-[11px] font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300 rounded flex items-center gap-1 transition-colors"
                            title="Edit User Details & Access Permissions"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit Access</span>
                          </button>

                          {/* Reset Password Button */}
                          <button
                            onClick={() => {
                              setResettingUser(u);
                              setNewPassword('');
                              setConfirmPassword('');
                              setResetError(null);
                            }}
                            className="px-2 py-1 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors flex items-center gap-1"
                            title="Reset User Password"
                          >
                            <KeyRound className="w-3 h-3 text-amber-500" />
                            <span>Pass</span>
                          </button>

                          {/* Toggle Active/Disabled */}
                          {!isPrimarySuperAdmin && (
                            <button
                              onClick={() => toggleUserStatus(u.id)}
                              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                                u.status === 'Active'
                                  ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
                                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                              }`}
                            >
                              {u.status === 'Active' ? 'Disable' : 'Enable'}
                            </button>
                          )}

                          {/* Delete User Button */}
                          {!isPrimarySuperAdmin ? (
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 rounded flex items-center gap-1 transition-colors"
                              title="Delete User Account"
                            >
                              <Trash2 className="w-3 h-3 text-rose-500" />
                              <span>Delete</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic px-1 font-mono">Protected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Entitlement Matrix */}
      {activeTab === 'rbac' && (
        <div className="space-y-4">
          {/* Top Control Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">
                  Governed User Entitlement Matrix ({users.length} Active {users.length === 1 ? 'Account' : 'Accounts'})
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Dynamic RBAC matrix mapped directly to user creation. Super Admin can click any badge to toggle individual module permissions in real time.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* View Switcher */}
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setMatrixViewMode('users')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    matrixViewMode === 'users'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Governed Users ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixViewMode('templates')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    matrixViewMode === 'templates'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Role Blueprint Templates
                </button>
              </div>

              {currentUser.role === 'Super Admin' && (
                <button
                  onClick={handleOpenCreateModal}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Create User with Access</span>
                </button>
              )}
            </div>
          </div>

          {/* User Creation Info Banner */}
          {matrixViewMode === 'users' && users.length === 1 && (
            <div className="p-3.5 bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-cyan-900 dark:text-cyan-200">
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-cyan-950 dark:text-cyan-100">
                    Live User Matrix Active &middot; Currently 1 Super Admin account provisioned
                  </div>
                  <div className="text-[11px] text-cyan-800 dark:text-cyan-300">
                    When you create new team members (Operations, Finance, Sales, Support), each user account will automatically appear here as a column displaying the exact access checkboxes selected during user creation.
                  </div>
                </div>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[11px] transition-colors self-start sm:self-auto shadow-xs"
              >
                + Add User &amp; Assign Permissions
              </button>
            </div>
          )}

          {/* Matrix Table: Governed Users Mode */}
          {matrixViewMode === 'users' ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                      <th className="py-3 px-4 min-w-[260px] align-bottom">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                          Platform Module ({PERMISSION_MODULES.length} Total)
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Access granted based on user creation settings
                        </div>
                      </th>
                      {users.map(u => {
                        const isSelf = u.id === currentUser.id;
                        const grantedCount = getUserGrantedCount(u);
                        return (
                          <th key={u.id} className="py-3 px-4 text-center min-w-[180px] border-l border-slate-200 dark:border-slate-800/60 align-top">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate max-w-[140px]">
                                  {u.name}
                                </span>
                                {isSelf && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                                    You
                                  </span>
                                )}
                              </div>
                              <StatusBadge status={u.role} />
                              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">
                                {u.email}
                              </span>
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400">
                                {grantedCount}/{PERMISSION_MODULES.length} Modules Granted
                              </span>
                              {currentUser.role === 'Super Admin' && u.role !== 'Super Admin' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(u)}
                                  className="mt-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-sans font-medium"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Edit User Rights</span>
                                </button>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                    {PERMISSION_MODULES.map(mod => (
                      <tr key={mod.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                            {mod.label}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {mod.desc}
                          </div>
                        </td>
                        {users.map(u => {
                          const isSuper = u.role === 'Super Admin';
                          const perms = u.permissions || DEFAULT_PERMISSIONS_BY_ROLE[u.role] || {};
                          const isGranted = isSuper || Boolean(perms[mod.key]);

                          if (isSuper) {
                            return (
                              <td key={u.id} className="py-3 px-3 text-center border-l border-slate-100 dark:border-slate-800/40">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Granted (Super Admin)</span>
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td key={u.id} className="py-3 px-3 text-center border-l border-slate-100 dark:border-slate-800/40">
                              {currentUser.role === 'Super Admin' ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleMatrixPermission(u.id, mod.key)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                                    isGranted
                                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 hover:bg-rose-500/15 hover:text-rose-600 hover:border-rose-500/30'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-emerald-500/15 hover:text-emerald-600 hover:border-emerald-500/30'
                                  }`}
                                  title={`Click to ${isGranted ? 'revoke' : 'grant'} ${mod.label} for ${u.name}`}
                                >
                                  {isGranted ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      <span>Granted</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Restricted</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${
                                    isGranted
                                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  {isGranted ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      <span>Granted</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Restricted</span>
                                    </>
                                  )}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Role Baseline Templates Reference */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Role Default Blueprint Templates (Reference)
                </span>
                <span className="text-slate-400">Baseline role archetypes used when pre-filling new user creations</span>
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

      {/* MODAL 1: PROVISION NEW USER */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Provision New Staff Member
                </h3>
                <p className="text-xs text-slate-500">
                  Configure corporate credentials and grant explicit section permissions.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Jessica Chen"
                    value={createName}
                    onChange={e => setCreateName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Corporate Work Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="jessica.c@aethervox.cloud"
                    value={createEmail}
                    onChange={e => setCreateEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Assigned Job Role
                  </label>
                  <select
                    value={createRole}
                    onChange={e => {
                      const newR = e.target.value as UserRole;
                      setCreateRole(newR);
                      setCreatePermissions(DEFAULT_PERMISSIONS_BY_ROLE[newR]);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Operations Manager">Operations Manager</option>
                    <option value="Finance Manager">Finance Manager</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Support Agent">Support Agent</option>
                    <option value="Client Portal User">Client Portal User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Initial Password (will be SHA-256 hashed)
                  </label>
                  <input
                    type="text"
                    value={createPassword}
                    onChange={e => setCreatePassword(e.target.value)}
                    placeholder="Staff@2026"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Access Permissions Checkboxes */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Granular Section Access Privileges</span>
                  </span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        const allTrue = {} as any;
                        PERMISSION_MODULES.forEach(m => (allTrue[m.key] = true));
                        setCreatePermissions(allTrue);
                      }}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      Select All
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        const allFalse = {} as any;
                        PERMISSION_MODULES.forEach(m => (allFalse[m.key] = false));
                        setCreatePermissions(allFalse);
                      }}
                      className="text-slate-500 hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  {PERMISSION_MODULES.map(module => {
                    const isChecked = createPermissions[module.key] === true;
                    return (
                      <label
                        key={module.key}
                        className={`flex items-start gap-2.5 p-2 rounded cursor-pointer border transition-all ${
                          isChecked
                            ? 'bg-cyan-50/70 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-800'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e =>
                            setCreatePermissions(prev => ({
                              ...prev,
                              [module.key]: e.target.checked,
                            }))
                          }
                          className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                            {module.label}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                            {module.desc}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-xs"
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER & ACCESS PRIVILEGES */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Edit className="w-4 h-4 text-cyan-500" />
                  <span>Edit User Profile &amp; Access Rights</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Update account metadata, reset password, and customize which sections {editingUser.name} can access.
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Role Category
                  </label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Operations Manager">Operations Manager</option>
                    <option value="Finance Manager">Finance Manager</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Support Agent">Support Agent</option>
                    <option value="Client Portal User">Client Portal User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Reset Password (optional - leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password to hash..."
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Granular Section Access Checkboxes */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Configured Section Privileges</span>
                  </span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setEditPermissions(DEFAULT_PERMISSIONS_BY_ROLE[editRole])}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      Reset to {editRole} Presets
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        const allTrue = {} as any;
                        PERMISSION_MODULES.forEach(m => (allTrue[m.key] = true));
                        setEditPermissions(allTrue);
                      }}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  {PERMISSION_MODULES.map(module => {
                    const isChecked = editPermissions[module.key] === true;
                    return (
                      <label
                        key={module.key}
                        className={`flex items-start gap-2.5 p-2 rounded cursor-pointer border transition-all ${
                          isChecked
                            ? 'bg-cyan-50/70 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-800'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e =>
                            setEditPermissions(prev => ({
                              ...prev,
                              [module.key]: e.target.checked,
                            }))
                          }
                          className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                            {module.label}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                            {module.desc}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-xs"
                >
                  Save Changes &amp; Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE USER CONFIRMATION */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Confirm User Account Deletion
              </h3>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete the user account for{' '}
              <strong className="text-slate-900 dark:text-slate-100">{deletingUser.name}</strong> (
              <span className="font-mono">{deletingUser.email}</span>)?
            </p>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 text-[11px] text-rose-700 dark:text-rose-300">
              This will revoke all session tokens and remove user access to the administrative console. This action cannot be undone.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RESET PASSWORD */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Reset Password: {resettingUser.name}
                </h3>
              </div>
              <button
                onClick={() => setResettingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-500">
              The new password will be hashed with SHA-256 before storage.
            </p>

            {resetError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-900">
                {resetError}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  New Password
                </label>
                <input
                  required
                  type="password"
                  placeholder="Minimum 8 characters..."
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Confirm New Password
                </label>
                <input
                  required
                  type="password"
                  placeholder="Confirm password..."
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-xs"
                >
                  Save Hashed Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
