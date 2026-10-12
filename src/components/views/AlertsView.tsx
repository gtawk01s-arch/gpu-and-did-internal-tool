import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  Filter,
  Plus,
  Server,
  PhoneCall,
  CreditCard,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { SystemAlert, AlertSeverity } from '../../types';

export const AlertsView: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert, createAlert } = useApp();

  const [severityFilter, setSeverityFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newAlert, setNewAlert] = useState<Partial<SystemAlert>>({
    title: '',
    description: '',
    category: 'Provider API Down',
    severity: 'High',
    targetResource: '',
  });

  const criticalCount = alerts.filter(a => !a.resolved && a.severity === 'Critical').length;
  const highCount = alerts.filter(a => !a.resolved && a.severity === 'High').length;
  const mediumCount = alerts.filter(a => !a.resolved && a.severity === 'Medium').length;
  const resolvedCount = alerts.filter(a => a.resolved).length;

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'All') return true;
    if (severityFilter === 'Resolved') return a.resolved;
    return !a.resolved && a.severity === severityFilter;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.title) return;
    createAlert(newAlert);
    setShowCreateModal(false);
    setNewAlert({
      title: '',
      description: '',
      category: 'Provider API Down',
      severity: 'High',
      targetResource: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            Mission-Critical Alert Center &amp; Wholesale Incident Room
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time monitoring for upstream provider API outages, capacity exhaustion, and SLA degradation.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Simulate Telemetry Alert</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Critical Incidents" value={criticalCount} subValue="Immediate action required" highlight badge="P0 Outage" />
        <MetricCard label="High Severity" value={highCount} subValue="Degraded routes / contracts" badge="P1 Warning" />
        <MetricCard label="Medium Warnings" value={mediumCount} subValue="Inventory thresholds" badge="P2 Advisory" />
        <MetricCard label="Resolved Incidents" value={resolvedCount} subValue="Closed in last 30d" badge="Resolved" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        {['All', 'Critical', 'High', 'Medium', 'Resolved'].map(tab => (
          <button
            key={tab}
            onClick={() => setSeverityFilter(tab)}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              severityFilter === tab
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            No active incidents matching the selected severity level.
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border transition-all ${
                alert.resolved
                  ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  : alert.severity === 'Critical'
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80'
                  : alert.severity === 'High'
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/70'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      alert.severity === 'Critical'
                        ? 'text-rose-600'
                        : alert.severity === 'High'
                        ? 'text-amber-500'
                        : 'text-blue-500'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {alert.title}
                      </span>
                      <StatusBadge status={alert.severity} />
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {alert.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {alert.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 mt-2">
                      <span>Timestamp: {alert.timestamp}</span>
                      {alert.targetResource && (
                        <span>Resource: <strong className="text-slate-600 dark:text-slate-300">{alert.targetResource}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  {!alert.acknowledged && !alert.resolved && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {!alert.resolved && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}
                  {alert.resolved && (
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Alert */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Simulate New Wholesale System Incident
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Inject a synthetic alarm to verify response workflows and notification routing.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Incident Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Frankfurt Infiniband Switch Firmware Error"
                  value={newAlert.title || ''}
                  onChange={e => setNewAlert({ ...newAlert, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Category</label>
                  <select
                    value={newAlert.category}
                    onChange={e => setNewAlert({ ...newAlert, category: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  >
                    <option value="Provider API Down">Provider API Down</option>
                    <option value="Failed Provisioning">Failed Provisioning</option>
                    <option value="GPU Inventory Low">GPU Inventory Low</option>
                    <option value="SIP Trunk Down">SIP Trunk Down</option>
                    <option value="DID Exhaustion">DID Exhaustion</option>
                    <option value="Poor Call Quality">Poor Call Quality</option>
                    <option value="Failed Payment">Failed Payment</option>
                    <option value="Contract Expiring">Contract Expiring</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Severity</label>
                  <select
                    value={newAlert.severity}
                    onChange={e => setNewAlert({ ...newAlert, severity: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Affected Target Resource</label>
                <input
                  type="text"
                  placeholder="e.g. RunPod FRA-01 / TRUNK-TLX-01"
                  value={newAlert.targetResource || ''}
                  onChange={e => setNewAlert({ ...newAlert, targetResource: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={newAlert.description || ''}
                  onChange={e => setNewAlert({ ...newAlert, description: e.target.value })}
                  placeholder="Details regarding packet loss, latency, or contract term..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
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
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
