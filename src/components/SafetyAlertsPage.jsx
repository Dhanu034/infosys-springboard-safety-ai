import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, CheckCircle2, CheckSquare, Clock, FileText, Sparkles, RefreshCw, Eye, Zap, AlertTriangle, Radio, HelpCircle, X } from 'lucide-react';
import { fetchSafetyAlerts, acknowledgeAlert, resolveAlert, retryAlertAutomation } from '../services/api';
import ChartPanel from './ui/ChartPanel';
import RiskBadge from './ui/RiskBadge';
import StatusPill from './ui/StatusPill';
import BilingualLabel from './ui/BilingualLabel';
import EmptyState from './ui/EmptyState';
import LoadingState from './ui/LoadingState';

/**
 * SafetyAlertsPage Component (Phase 3 Redesign)
 * Milestone 2 Safety Alerts, n8n automation status, and audit logs styled with Industrial Precision Glassmorphism.
 */
export default function SafetyAlertsPage({ selectedProject }) {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlertForAudit, setSelectedAlertForAudit] = useState(null);
  const [retryingAlertId, setRetryingAlertId] = useState(null);
  const [showDevDetails, setShowDevDetails] = useState(false);

  // Resolve Modal
  const [selectedAlertForResolve, setSelectedAlertForResolve] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSafetyAlerts(selectedProject.id);
      setAlerts(data);
    } catch (err) {
      console.error("Fetch alerts error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [selectedProject]);

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId, "Safety Supervisor", "Supervisor reviewed alert.");
      loadAlerts();
    } catch (err) {
      alert("Acknowledge error: " + err.message);
    }
  };

  const handleResolveSubmit = async () => {
    if (!selectedAlertForResolve || !resolutionNote) return;
    try {
      await resolveAlert(selectedAlertForResolve.alert_id, "Safety Supervisor", resolutionNote);
      setSelectedAlertForResolve(null);
      setResolutionNote('');
      loadAlerts();
    } catch (err) {
      alert("Resolve error: " + err.message);
    }
  };

  const handleRetryAutomation = async (alertId) => {
    setRetryingAlertId(alertId);
    try {
      await retryAlertAutomation(alertId);
      await loadAlerts();
    } catch (err) {
      alert("Retry automation error: " + err.message);
    } finally {
      setRetryingAlertId(null);
    }
  };

  const getAccentClass = (status, severity) => {
    if (status === 'RESOLVED') return 'border-accent-low bg-emerald-950/10';
    if (severity === 'CRITICAL' || status === 'OPEN') return 'border-accent-critical bg-red-950/10';
    return 'border-accent-high bg-amber-950/10';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border-accent-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 shrink-0 glow-amber">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <BilingualLabel
                  en="Safety Alerts & Automation Feed"
                  ta="பாதுகாப்பு எச்சரிக்கைகள் & தானியங்கி ஊட்டல்"
                  enClassName="text-xl font-bold tracking-tight text-slate-100 font-sans"
                />
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Audit Trail Active
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> n8n Workflow Integrated
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Real-time safety alert feed with supervisor acknowledgment, n8n webhook automation tracking, and immutable audit logs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setShowDevDetails(!showDevDetails)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center gap-1.5 ${
              showDevDetails
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 glow-amber'
                : 'bg-[#0b0f10] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Developer & Integration Diagnostics"
          >
            <Radio className="h-3.5 w-3.5" />
            <span>{showDevDetails ? 'Dev Mode (ON)' : 'Dev Mode (OFF)'}</span>
          </button>

          <button
            onClick={loadAlerts}
            className="px-3.5 py-2 rounded-xl bg-[#0b0f10] border border-slate-700 text-xs font-mono font-bold text-slate-200 hover:text-amber-300 hover:border-amber-500/50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Alerts</span>
          </button>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {isLoading && alerts.length === 0 && (
          <LoadingState
            message="Fetching Real-Time Safety Alerts..."
            messageTa="எச்சரிக்கை தரவு பெறப்படுகிறது..."
          />
        )}

        {alerts.length === 0 && !isLoading && (
          <EmptyState
            title="No Active Alerts"
            titleTa="செயலில் உள்ள எச்சரிக்கைகள் இல்லை"
            message="No active safety alerts recorded. Upload images in PPE Detection to trigger alerts."
            icon={ShieldAlert}
          />
        )}

        {alerts.map((alertItem) => {
          const isHighOrCritical = alertItem.severity === 'CRITICAL' || alertItem.severity === 'HIGH' || alertItem.risk_score >= 61;
          const isFailedAutomation = alertItem.automation_status === 'Failed';
          const canRetry = isHighOrCritical && (isFailedAutomation || alertItem.automation_status === 'Not Configured');
          const accentStyle = getAccentClass(alertItem.status, alertItem.severity);

          return (
            <div
              key={alertItem.alert_id}
              className={`glass-panel p-5 transition-all relative overflow-hidden flex flex-col justify-between ${accentStyle}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskBadge severity={alertItem.severity} />
                  <span className="text-xs font-mono text-cyan-400 font-bold bg-[#0b0f10] px-2 py-0.5 rounded border border-slate-800">
                    [{alertItem.alert_id.slice(0, 8)}]
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 font-sans">{alertItem.title}</h3>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Risk Score:</span>
                  <span className="font-bold text-slate-100 bg-[#0b0f10] px-2.5 py-0.5 rounded border border-slate-700">
                    {alertItem.risk_score}/100
                  </span>
                </div>
              </div>

              {/* Alert Message */}
              <p className="text-xs text-slate-300 leading-relaxed mb-3.5 bg-[#101415]/90 p-3 rounded-lg border border-slate-800 font-sans">
                {alertItem.message}
              </p>

              {/* Automation Status & Channel Banner */}
              <div className="mb-3.5 p-3 rounded-lg bg-[#0b0f10] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400">n8n Automation:</span>
                  <StatusPill
                    status={alertItem.automation_status || 'Not Configured'}
                    channel={alertItem.delivery_channel}
                  />
                  {alertItem.automation_attempted_at && (
                    <span className="text-slate-500 text-[10px]">
                      (Attempted: {new Date(alertItem.automation_attempted_at).toLocaleTimeString()})
                    </span>
                  )}
                </div>

                {/* Retry Automation Action */}
                {canRetry && (
                  <button
                    onClick={() => handleRetryAutomation(alertItem.alert_id)}
                    disabled={retryingAlertId === alertItem.alert_id}
                    className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-bold font-mono border border-red-500/40 flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${retryingAlertId === alertItem.alert_id ? 'animate-spin' : ''}`} />
                    <span>Retry Automation</span>
                  </button>
                )}
              </div>

              {/* Developer / Admin Diagnostic Info */}
              {showDevDetails && alertItem.automation_last_error && (
                <div className="mb-3.5 p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-[11px] font-mono text-red-300 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> Last Automation Error:
                  </div>
                  <p className="text-slate-300 break-all">{alertItem.automation_last_error}</p>
                  {alertItem.automation_response_code && (
                    <p className="text-slate-400 text-[10px]">HTTP Response Code: {alertItem.automation_response_code}</p>
                  )}
                </div>
              )}

              {/* Bottom Actions Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80 text-xs font-mono">
                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>Status: <strong className="text-slate-200">{alertItem.status}</strong></span>
                  <span>•</span>
                  <span>Created: {new Date(alertItem.created_at).toLocaleTimeString()}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {alertItem.audit_logs?.length > 0 && (
                    <button
                      onClick={() => setSelectedAlertForAudit(alertItem)}
                      className="px-3 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-cyan-300 text-xs border border-slate-700"
                    >
                      View Audit Trail ({alertItem.audit_logs.length})
                    </button>
                  )}

                  {alertItem.status === 'OPEN' && (
                    <button
                      onClick={() => handleAcknowledge(alertItem.alert_id)}
                      className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold border border-amber-500/40"
                    >
                      Acknowledge Alert
                    </button>
                  )}

                  {alertItem.status !== 'RESOLVED' && (
                    <button
                      onClick={() => setSelectedAlertForResolve(alertItem)}
                      className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold border border-emerald-500/40"
                    >
                      Resolve Alert
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit History Drawer Modal */}
      {selectedAlertForAudit && (
        <div className="fixed inset-0 z-50 bg-[#0b0f10]/80 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-md bg-[#14181a] border-l border-cyan-500/30 h-full p-6 overflow-y-auto space-y-4 blueprint-grid">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
                <FileText className="h-4 w-4 text-cyan-400" /> Audit Log History
              </h4>
              <button onClick={() => setSelectedAlertForAudit(null)} className="text-slate-400 hover:text-slate-100 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {selectedAlertForAudit.audit_logs.map((log) => (
                <div key={log.audit_id} className="p-3.5 rounded-xl bg-[#0b0f10] border border-slate-800 space-y-1">
                  <div className="flex justify-between text-cyan-400 font-bold">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300 font-sans">{log.note}</p>
                  <p className="text-[10px] text-slate-500">By: {log.user_reference}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {selectedAlertForResolve && (
        <div className="fixed inset-0 z-50 bg-[#0b0f10]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full border border-emerald-500/40 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-slate-100 font-sans">Resolve Alert #{selectedAlertForResolve.alert_id.slice(0, 8)}</h4>
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5">Resolution Audit Note:</label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Enter resolution details..."
                className="w-full bg-[#0b0f10] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 h-24 font-sans"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedAlertForResolve(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                className="px-4 py-2 rounded-lg bg-emerald-400 text-slate-950 font-bold text-xs font-mono hover:bg-emerald-300"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
