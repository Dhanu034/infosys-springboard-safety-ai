import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, CheckCircle2, CheckSquare, Clock, FileText, Sparkles, RefreshCw, Eye, Zap, AlertTriangle, Radio, HelpCircle } from 'lucide-react';
import { fetchSafetyAlerts, acknowledgeAlert, resolveAlert, retryAlertAutomation } from '../services/api';

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

  const getAutomationBadge = (status) => {
    switch (status) {
      case 'Supervisor Notified':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Logged':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Urgent Review Required':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Failed':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'Not Required':
      case 'Not Configured':
      default:
        return 'bg-slate-700/40 text-slate-400 border-slate-600/40';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Bell className="h-7 w-7 text-amber-400" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">Safety Alerts & Automation Feed</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Audit Trail Active
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Zap className="h-3 w-3" /> n8n Workflow Integrated
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time safety alert feed with supervisor acknowledgment, n8n webhook automation tracking, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setShowDevDetails(!showDevDetails)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              showDevDetails
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Developer & Integration Diagnostics"
          >
            <Radio className="h-3.5 w-3.5" />
            <span>{showDevDetails ? 'Dev Mode (ON)' : 'Dev Mode (OFF)'}</span>
          </button>

          <button
            onClick={loadAlerts}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Alerts</span>
          </button>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {alerts.length === 0 && !isLoading && (
          <div className="glass-panel p-12 rounded-xl border border-slate-800 text-center text-slate-500 font-mono">
            No active safety alerts recorded. Upload images in PPE Detection to trigger alerts.
          </div>
        )}

        {alerts.map((alertItem) => {
          const isHighOrCritical = alertItem.severity === 'CRITICAL' || alertItem.severity === 'HIGH' || alertItem.risk_score >= 61;
          const isFailedAutomation = alertItem.automation_status === 'Failed';
          const canRetry = isHighOrCritical && (isFailedAutomation || alertItem.automation_status === 'Not Configured');

          return (
            <div
              key={alertItem.alert_id}
              className={`glass-panel p-5 rounded-xl border transition-all ${
                alertItem.status === 'OPEN'
                  ? 'border-red-500/40 bg-red-950/10'
                  : alertItem.status === 'ACKNOWLEDGED'
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-emerald-500/30 bg-slate-900/60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    alertItem.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {alertItem.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-400">[{alertItem.alert_id.slice(0, 8)}]</span>
                  <h3 className="text-sm font-bold text-slate-100">{alertItem.title}</h3>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Risk Score:</span>
                  <span className="font-bold text-slate-100 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {alertItem.risk_score}/100
                  </span>
                </div>
              </div>

              {/* Alert Message */}
              <p className="text-xs text-slate-300 leading-relaxed mb-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                {alertItem.message}
              </p>

              {/* Automation Status & Channel Banner */}
              <div className="mb-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400 font-mono text-[11px]">n8n Automation:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getAutomationBadge(alertItem.automation_status)}`}>
                    {alertItem.automation_status || 'Not Configured'}
                  </span>
                  {alertItem.delivery_channel && alertItem.delivery_channel !== 'None' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      Channel: {alertItem.delivery_channel}
                    </span>
                  )}
                  {alertItem.automation_attempted_at && (
                    <span className="text-slate-500 text-[10px] font-mono">
                      (Attempted: {new Date(alertItem.automation_attempted_at).toLocaleTimeString()})
                    </span>
                  )}
                </div>

                {/* Retry Automation Action */}
                {canRetry && (
                  <button
                    onClick={() => handleRetryAutomation(alertItem.alert_id)}
                    disabled={retryingAlertId === alertItem.alert_id}
                    className="px-2.5 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-bold border border-red-500/40 flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${retryingAlertId === alertItem.alert_id ? 'animate-spin' : ''}`} />
                    <span>Retry Automation</span>
                  </button>
                )}
              </div>

              {/* Developer / Admin Diagnostic Info */}
              {showDevDetails && alertItem.automation_last_error && (
                <div className="mb-3 p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 text-[11px] font-mono text-red-300 space-y-1">
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span>Status: <strong className="text-slate-200">{alertItem.status}</strong></span>
                  <span>•</span>
                  <span>Created: {new Date(alertItem.created_at).toLocaleTimeString()}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {alertItem.audit_logs?.length > 0 && (
                    <button
                      onClick={() => setSelectedAlertForAudit(alertItem)}
                      className="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-mono border border-slate-700"
                    >
                      View Audit Trail ({alertItem.audit_logs.length})
                    </button>
                  )}

                  {alertItem.status === 'OPEN' && (
                    <button
                      onClick={() => handleAcknowledge(alertItem.alert_id)}
                      className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold border border-amber-500/40"
                    >
                      Acknowledge Alert
                    </button>
                  )}

                  {alertItem.status !== 'RESOLVED' && (
                    <button
                      onClick={() => setSelectedAlertForResolve(alertItem)}
                      className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold border border-emerald-500/40"
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" /> Audit Log History
              </h4>
              <button onClick={() => setSelectedAlertForAudit(null)} className="text-slate-400 hover:text-slate-100 font-bold text-sm">✕</button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {selectedAlertForAudit.audit_logs.map((log) => (
                <div key={log.audit_id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between text-cyan-400 font-bold">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300">{log.note}</p>
                  <p className="text-[10px] text-slate-500">By: {log.user_reference}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {selectedAlertForResolve && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl max-w-md w-full space-y-4">
            <h4 className="text-sm font-bold text-slate-100">Resolve Alert #{selectedAlertForResolve.alert_id.slice(0, 8)}</h4>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Resolution Note:</label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Enter resolution details..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 h-24"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedAlertForResolve(null)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs">Cancel</button>
              <button onClick={handleResolveSubmit} className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">Confirm Resolution</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
