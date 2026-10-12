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
  Activity,
  Zap,
  Radio,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { SystemAlert, AlertSeverity } from '../../types';

export const AlertsView: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert, createAlert, simulateTrunkAlert } = useApp();

  const [severityFilter, setSeverityFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [simulatedFeedback, setSimulatedFeedback] = useState<string | null>(null);

  const [newAlert, setNewAlert] = useState<Partial<SystemAlert>>({
    title: '',
    description: '',
    category: 'SIP Down',
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

  const handleSimulate = (type: 'sip_down' | 'poor_quality' | 'failed_provision') => {
    simulateTrunkAlert(type);
    const label =
      type === 'sip_down'
        ? 'Tata Teleservices SIP Down (SIP 503)'
        : type === 'poor_quality'
        ? 'Airtel Business Poor Call Quality (MOS 2.65)'
        : 'Jio Enterprise Failed Provisioning (CIR Block)';
    setSimulatedFeedback(`Received incoming carrier webhook: ${label}! Alert added.`);
    setTimeout(() => setSimulatedFeedback(null), 5000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.title) return;
    createAlert(newAlert);
    setShowCreateModal(false);
    setNewAlert({
      title: '',
      description: '',
      category: 'SIP Down',
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
            Telecom Trunk &amp; GPU Incident Telemetry Room
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time alerting for SIP trunk outages, poor call quality degradation, failed resource provisioning, and carrier webhooks.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Manual Incident Log</span>
        </button>
      </div>

      {/* Carrier Webhook Simulation Panel (Requirement 6) */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-xl text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-bold text-xs uppercase tracking-wider text-cyan-300">
              Carrier Trunk Side Webhook &amp; Notification Tester
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Direct carrier telemetry simulation: Tata Teleservices · Airtel · Jio
          </span>
        </div>

        {simulatedFeedback && (
          <div className="mb-3 p-2.5 bg-emerald-950/80 border border-emerald-500 rounded-lg text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{simulatedFeedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => handleSimulate('sip_down')}
            className="p-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/80 rounded-lg text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-rose-300 group-hover:text-rose-200">1. SIP Down (Tata Trunk)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-900 text-white rounded">SIP 503</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Simulates carrier signaling gateway timeout &amp; PRI link failure.
            </p>
          </button>

          <button
            onClick={() => handleSimulate('poor_quality')}
            className="p-2.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/80 rounded-lg text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-amber-300 group-hover:text-amber-200">2. Poor Call Quality (Airtel)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-900 text-white rounded">MOS 2.65</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Simulates high jitter (68ms) &amp; packet loss on active calls.
            </p>
          </button>

          <button
            onClick={() => handleSimulate('failed_provision')}
            className="p-2.5 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/80 rounded-lg text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-purple-300 group-hover:text-purple-200">3. Failed Provisioning (Jio/GPU)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-purple-900 text-white rounded">CIR Block</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Simulates carrier KYC batch reject for 100 Indian DIDs / GPU timeout.
            </p>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Critical Incidents" value={criticalCount} subValue="Immediate action required" highlight badge="P0 Outage" />
        <MetricCard label="High Severity" value={highCount} subValue="Degraded routes / call quality" badge="P1 Warning" />
        <MetricCard label="Medium Warnings" value={mediumCount} subValue="Inventory & contract alerts" badge="P2 Advisory" />
        <MetricCard label="Resolved Incidents" value={resolvedCount} subValue="Closed in session" badge="Resolved" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
        {['All', 'Critical', 'High', 'Medium', 'Resolved'].map(tab => (
          <button
            key={tab}
            onClick={() => setSeverityFilter(tab)}
            className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
              severityFilter === tab
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
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
              className={`p-4 rounded-xl border transition-all ${
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
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
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
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        {alert.category}
                      </span>
                      {alert.resolved && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                          ✓ Resolved
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                      {alert.description}
                    </p>

                    {/* Trunk Telemetry Diagnostic Badges (Requirement 6) */}
                    {alert.trunkTelemetry && (
                      <div className="flex items-center gap-3 mt-2 flex-wrap font-mono text-[11px] p-2 bg-slate-100/80 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-700 dark:text-slate-300 font-sans">Trunk Diagnostics:</span>
                        <span className="text-slate-600 dark:text-slate-300">Carrier: <strong>{alert.trunkTelemetry.carrier}</strong></span>
                        {alert.trunkTelemetry.mosScore !== undefined && (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            MOS: {alert.trunkTelemetry.mosScore} (Degraded)
                          </span>
                        )}
                        {alert.trunkTelemetry.jitterMs !== undefined && (
                          <span className="text-rose-600 dark:text-rose-400">
                            Jitter: {alert.trunkTelemetry.jitterMs}ms
                          </span>
                        )}
                        {alert.trunkTelemetry.packetLossPct !== undefined && (
                          <span className="text-rose-600 dark:text-rose-400">
                            Loss: {alert.trunkTelemetry.packetLossPct}%
                          </span>
                        )}
                        {alert.trunkTelemetry.sipCode && (
                          <span className="text-purple-600 dark:text-purple-400 font-bold">
                            SIP Code: {alert.trunkTelemetry.sipCode}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 mt-2">
                      <span>Timestamp: {alert.timestamp}</span>
                      {alert.targetResource && (
                        <span>Resource: <strong className="text-slate-600 dark:text-slate-300">{alert.targetResource}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Incident Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  {!alert.acknowledged && !alert.resolved && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {!alert.resolved && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve Incident</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Alert Log Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Log Telemetry / Incident Alert
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Trigger an operational warning for SIP down, call degradation, or failed provisioning.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Teleservices SIP Gateway Link Down"
                  value={newAlert.title}
                  onChange={e => setNewAlert({ ...newAlert, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Category</label>
                <select
                  value={newAlert.category}
                  onChange={e => setNewAlert({ ...newAlert, category: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="SIP Down">SIP Down (Trunk Unreachable)</option>
                  <option value="Poor Call Quality">Poor Call Quality (High Jitter / Low MOS)</option>
                  <option value="Failed Provisioning">Failed Provisioning (KYC / Hardware Error)</option>
                  <option value="Provider API Down">Provider API Down</option>
                  <option value="DID Exhaustion">DID Exhaustion</option>
                  <option value="Contract Expiring">Contract Expiring</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Severity</label>
                  <select
                    value={newAlert.severity}
                    onChange={e => setNewAlert({ ...newAlert, severity: e.target.value as AlertSeverity })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="Critical">Critical (P0 Outage)</option>
                    <option value="High">High (P1 Degraded)</option>
                    <option value="Medium">Medium (P2 Warning)</option>
                    <option value="Low">Low (Informational)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Target Resource</label>
                  <input
                    type="text"
                    placeholder="e.g. TRUNK-TATA-MUMBAI-01"
                    value={newAlert.targetResource}
                    onChange={e => setNewAlert({ ...newAlert, targetResource: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail symptoms, error codes, and impacted clients..."
                  value={newAlert.description}
                  onChange={e => setNewAlert({ ...newAlert, description: e.target.value })}
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
                  Publish Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
