import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Bell, 
  ShieldAlert, 
  Check, 
  RefreshCw, 
  Zap, 
  Eye, 
  Radio, 
  X, 
  HardHat,
  CheckCircle2,
  Clock,
  Send,
  Database
} from 'lucide-react';
import { fetchSafetyAlerts, acknowledgeAlert, resolveAlert, retryAlertAutomation } from '../../services/api';
import { useProject } from '../../context/ProjectContext';

/**
 * AlertCenterPage Component
 * Real-time Hazard Escalation & Multi-Agent Dispatch Lanes.
 * Renders database-backed alerts for the selected project with Kanban lanes,
 * evidence thumbnails, n8n automation tags, and supervisor resolution actions.
 */
export default function AlertCenterPage() {
  const { selectedProject, selectedProjectId, isSimulationMode } = useProject();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedStatus, setAssignedStatus] = useState({});
  const [retryingId, setRetryingId] = useState(null);

  // Resolve modal state
  const [resolvingAlert, setResolvingAlert] = useState(null);
  const [resolveNote, setResolveNote] = useState('');

  const loadAlerts = async () => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    try {
      const data = await fetchSafetyAlerts(selectedProjectId);
      setAlerts(data || []);
    } catch (err) {
      console.error("Alert load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setAlerts([]);
    loadAlerts();
  }, [selectedProjectId]);

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId, "Safety Supervisor", "Supervisor reviewed alert on-site.");
      loadAlerts();
    } catch (err) {
      console.error("Acknowledge error:", err);
    }
  };

  const handleResolveSubmit = async () => {
    if (!resolvingAlert) return;
    try {
      await resolveAlert(
        resolvingAlert.alert_id, 
        "Safety Supervisor", 
        resolveNote || "Incident mitigation and safety verification completed."
      );
      setResolvingAlert(null);
      setResolveNote('');
      loadAlerts();
    } catch (err) {
      console.error("Resolve error:", err);
    }
  };

  const handleRetry = async (alertId) => {
    setRetryingId(alertId);
    try {
      await retryAlertAutomation(alertId);
      loadAlerts();
    } catch (err) {
      console.error("Retry automation error:", err);
    } finally {
      setRetryingId(null);
    }
  };

  const handleAssign = (id) => {
    setAssignedStatus(prev => ({
      ...prev,
      [id]: "Lead: S. Raman"
    }));
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
  const highMediumAlerts = alerts.filter(a => a.severity !== 'CRITICAL');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#e0e3e5] font-sans">Alert Center</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
              DATABASE
            </span>
          </div>
          <p className="text-xs font-mono text-[#859397] mt-0.5 tracking-wider uppercase">
            PROJECT: <span className="text-cyan-300 font-bold">{selectedProject?.name || selectedProjectId}</span> | ACTIVE ALERTS: {alerts.length}
          </p>
        </div>
        <button
          onClick={loadAlerts}
          title="Refresh Alerts"
          className="p-2 rounded-lg bg-[#191c1e] text-[#859397] hover:text-cyan-300 border border-[#3c494c]/30 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Dual Kanban Lane Layout */}
      <div className="flex flex-col md:flex-row gap-6 items-start pb-6">
        
        {/* Lane 1: CRITICAL ALERTS */}
        <div className="w-full md:w-1/2 bg-[#1d2022]/60 rounded-xl border border-red-500/30 overflow-hidden flex flex-col">
          {/* Lane Header */}
          <div className="p-4 border-b border-red-500/30 bg-[#1d2022] flex justify-between items-center hazard-stripe">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 font-bold" />
              <h3 className="text-base font-bold text-[#e0e3e5] font-sans">CRITICAL SEVERITY</h3>
            </div>
            <span className="font-mono text-xs font-bold bg-red-950 text-red-300 px-2 py-1 rounded border border-red-500/40">
              {String(criticalAlerts.length).padStart(2, '0')}
            </span>
          </div>

          <div className="p-4 space-y-4">
            {criticalAlerts.length > 0 ? (
              criticalAlerts.map((a) => (
                <div 
                  key={a.alert_id} 
                  className={`bg-[#101415] border hover:border-red-500/60 transition-colors rounded-lg p-4 relative overflow-hidden shadow-lg space-y-3 ${
                    a.status === 'RESOLVED' ? 'border-emerald-500/40 opacity-75' : 'border-[#3c494c]/50'
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${a.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40">
                      ID: {a.alert_id.slice(0, 8)}
                    </span>
                    <span className="font-mono text-[10px] text-[#859397]">
                      {a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#e0e3e5] font-sans">
                    {a.title}
                  </h4>

                  <div className="flex gap-3">
                    {a.evidence_image_url && (
                      <div className="w-20 h-20 rounded border border-[#3c494c]/50 overflow-hidden shrink-0 bg-[#0b121e]">
                        <img
                          src={a.evidence_image_url}
                          alt="Surveillance Evidence"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="flex-1 flex flex-col justify-between">
                      <p className="text-xs text-[#bbc9cd] font-sans leading-relaxed line-clamp-3">
                        {a.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between font-mono text-[11px]">
                        <div>
                          <span className="text-[#859397] mr-1.5">SCORE:</span>
                          <span className="text-red-400 font-bold">{a.risk_score || 85}/100</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          a.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                          a.status === 'ACKNOWLEDGED' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' :
                          'bg-red-950 text-red-300 border border-red-500/40'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Automation & Action Row */}
                  <div className="flex items-center justify-between border-t border-[#3c494c]/30 pt-3 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-[#859397]">n8n:</span>
                      <span className="text-cyan-300 font-bold">{a.automation_status || "Logged"}</span>
                      {a.automation_status === 'Failed' && (
                        <button
                          onClick={() => handleRetry(a.alert_id)}
                          className="text-[10px] text-amber-400 underline ml-1 cursor-pointer"
                        >
                          {retryingId === a.alert_id ? "Retrying..." : "Retry"}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {a.status === 'OPEN' && (
                        <button
                          onClick={() => handleAcknowledge(a.alert_id)}
                          className="bg-[#1d2022] hover:bg-[#272a2c] text-[#e0e3e5] px-2.5 py-1 rounded font-mono text-[11px] border border-[#3c494c]/50 transition-colors cursor-pointer"
                        >
                          ACKNOWLEDGE
                        </button>
                      )}
                      {a.status !== 'RESOLVED' && (
                        <button
                          onClick={() => setResolvingAlert(a)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-mono text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          RESOLVE NOW
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="p-8 bg-[#101415]/80 rounded-lg border border-[#3c494c]/30 text-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-mono text-slate-300">0 Critical Alerts Active</p>
                <p className="text-[10px] font-mono text-slate-500 mt-1">All site operations within critical thresholds for {selectedProject?.name || selectedProjectId}.</p>
              </div>
            )}
          </div>
        </div>

        {/* Lane 2: HIGH & MEDIUM SEVERITY ALERTS */}
        <div className="w-full md:w-1/2 bg-[#1d2022]/60 rounded-xl border border-amber-500/30 overflow-hidden flex flex-col">
          {/* Lane Header */}
          <div className="p-4 border-b border-amber-500/30 bg-[#1d2022] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#ffb77d] font-bold" />
              <h3 className="text-base font-bold text-[#e0e3e5] font-sans">HIGH / WARNING SEVERITY</h3>
            </div>
            <span className="font-mono text-xs font-bold bg-amber-950 text-[#ffb77d] px-2 py-1 rounded border border-amber-500/40">
              {String(highMediumAlerts.length).padStart(2, '0')}
            </span>
          </div>

          <div className="p-4 space-y-4">
            {highMediumAlerts.length > 0 ? (
              highMediumAlerts.map((a) => (
                <div 
                  key={a.alert_id} 
                  className={`bg-[#101415] border hover:border-amber-500/60 transition-colors rounded-lg p-4 relative overflow-hidden space-y-3 ${
                    a.status === 'RESOLVED' ? 'border-emerald-500/40 opacity-75' : 'border-[#3c494c]/50'
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${a.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-[#fd8b00]'}`}></div>
                  
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] font-bold text-[#ffb77d] bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                      ID: {a.alert_id.slice(0, 8)}
                    </span>
                    <span className="font-mono text-[10px] text-[#859397]">
                      {a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#e0e3e5] font-sans">
                    {a.title}
                  </h4>

                  <p className="text-xs text-[#bbc9cd] font-sans leading-relaxed">
                    {a.message}
                  </p>

                  <div className="flex items-center justify-between border-t border-[#3c494c]/30 pt-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                      <span className="text-[#859397]">Status:</span>
                      <span className="text-amber-300 font-bold">{a.status}</span>
                    </div>

                    <div className="flex gap-2">
                      {a.status === 'OPEN' && (
                        <button
                          onClick={() => handleAcknowledge(a.alert_id)}
                          className="bg-[#1d2022] hover:bg-[#272a2c] text-[#e0e3e5] px-3 py-1 rounded font-mono text-[11px] border border-[#3c494c]/50 transition-colors cursor-pointer uppercase font-bold"
                        >
                          ACKNOWLEDGE
                        </button>
                      )}
                      {a.status !== 'RESOLVED' && (
                        <button
                          onClick={() => setResolvingAlert(a)}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded font-mono text-[11px] font-bold transition-colors cursor-pointer uppercase"
                        >
                          RESOLVE
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="p-8 bg-[#101415]/80 rounded-lg border border-[#3c494c]/30 text-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-mono text-slate-300">0 Warning Alerts Active</p>
                <p className="text-[10px] font-mono text-slate-500 mt-1">No secondary warnings registered for {selectedProject?.name || selectedProjectId}.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Resolve Modal */}
      {resolvingAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#191c1e] border border-cyan-500/40 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3c494c]/40 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-sans">
                Resolve Safety Alert ({resolvingAlert.alert_id.slice(0, 8)})
              </h3>
              <button onClick={() => setResolvingAlert(null)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-mono">
              Alert: {resolvingAlert.title}
            </p>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Supervisor Resolution Note:</label>
              <textarea
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder="Enter corrective action details (e.g., Worker equipped with PPE, scaffold guardrail re-installed)..."
                className="w-full h-24 p-3 bg-[#101415] border border-[#3c494c]/50 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setResolvingAlert(null)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-slate-300 hover:bg-[#272a2c]"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950"
              >
                Confirm & Sign Off
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
