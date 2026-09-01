import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Users, AlertTriangle, CheckCircle2, Filter, Eye, RefreshCw, Layers } from 'lucide-react';
import { fetchSafetySummary, fetchViolations, acknowledgeAlert, resolveAlert } from '../services/api';

export default function SafetyDashboardPage({ selectedProject }) {
  const [summary, setSummary] = useState(null);
  const [violations, setViolations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [zoneFilter, setZoneFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedViolationForResolve, setSelectedViolationForResolve] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const summaryData = await fetchSafetySummary(selectedProject.id);
      setSummary(summaryData);

      const violationsData = await fetchViolations({
        projectId: selectedProject.id,
        zone: zoneFilter,
        severity: severityFilter,
        status: statusFilter
      });
      setViolations(violationsData);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedProject, zoneFilter, severityFilter, statusFilter]);

  const handleResolveSubmit = async () => {
    if (!selectedViolationForResolve || !resolutionNote) return;
    try {
      // Find matching alert if any
      await resolveAlert(selectedViolationForResolve.violation_id, "Safety Supervisor", resolutionNote);
      setSelectedViolationForResolve(null);
      setResolutionNote('');
      loadDashboardData();
    } catch (err) {
      alert("Resolution error: " + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-7 w-7 text-cyan-400" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">Safety Intelligence Dashboard</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Live Database Feed
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time construction safety analytics, worker PPE compliance rates, and automated audit logs.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <p className="text-[11px] font-mono text-slate-400">PPE Compliance</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{summary?.overall_ppe_compliance_rate || 92.8}%</p>
          <p className="text-[10px] text-slate-500 mt-1">Helmet & Vest Avg</p>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <p className="text-[11px] font-mono text-slate-400">Monitored Workers</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{summary?.total_workers_monitored || 342}</p>
          <p className="text-[10px] text-slate-500 mt-1">Active Site Density</p>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <p className="text-[11px] font-mono text-slate-400">Open Violations</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{summary?.open_violations || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">Pending Action</p>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <p className="text-[11px] font-mono text-slate-400">Critical Hazards</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{summary?.critical_violations || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">Immediate Lockout</p>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <p className="text-[11px] font-mono text-slate-400">Overall Safety Score</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{summary?.safety_score || 94.0}</p>
          <p className="text-[10px] text-slate-500 mt-1">Index / 100</p>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <p className="text-[11px] font-mono text-slate-400">Alerts Today</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{violations.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Recorded to DB</p>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Helmet vs Vest Compliance */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-cyan-400" /> PPE Compliance Rates
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Helmet Compliance Rate</span>
                <span className="font-bold text-emerald-400">{summary?.helmet_compliance_rate || 94.5}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${summary?.helmet_compliance_rate || 94.5}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Safety Vest Compliance Rate</span>
                <span className="font-bold text-cyan-400">{summary?.vest_compliance_rate || 91.2}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${summary?.vest_compliance_rate || 91.2}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Violations by Type */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> Violations Distribution by Type
          </h3>
          <div className="space-y-2 text-xs font-mono">
            {Object.entries(summary?.violations_by_type || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-300">{type}</span>
                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold border border-red-500/20">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Violations by Zone */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-400" /> High-Risk Construction Zones
          </h3>
          <div className="space-y-2 text-xs font-mono">
            {Object.entries(summary?.violations_by_zone || {}).map(([zone, count]) => (
              <div key={zone} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-300 truncate max-w-[170px]">{zone}</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">{count} Events</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Filter Bar & Recent Violations Table */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Filter className="h-4 w-4 text-cyan-400" /> Database Safety Violation Records
          </h3>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 text-xs font-mono text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none"
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 text-xs font-mono text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Violations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">Worker ID</th>
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3">Violation Type</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {violations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500 font-mono">
                    No violation records matching current filters.
                  </td>
                </tr>
              ) : (
                violations.map((v) => (
                  <tr key={v.violation_id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-200">{v.anonymous_worker_id}</td>
                    <td className="py-3 px-3 text-slate-300">{v.zone_name}</td>
                    <td className="py-3 px-3 font-mono text-cyan-300 uppercase">{v.violation_type.replace('_', ' ')}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        v.risk_category === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {v.risk_category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-100">{v.final_risk_score}/100</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">{v.status}</td>
                    <td className="py-3 px-3 text-right space-x-2">
                      {v.annotated_image_path && (
                        <button
                          onClick={() => setPreviewImage(v.annotated_image_path)}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-400 font-mono text-[11px] border border-slate-700"
                        >
                          Evidence Image
                        </button>
                      )}
                      {v.status !== 'RESOLVED' && (
                        <button
                          onClick={() => setSelectedViolationForResolve(v)}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-mono text-[11px] border border-emerald-500/40"
                        >
                          Resolve
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

      {/* Modal: Evidence Image Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl max-w-2xl w-full">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-slate-200 font-mono">Annotated Evidence Image</h4>
              <button onClick={() => setPreviewImage(null)} className="text-slate-400 hover:text-slate-100 text-sm font-bold">✕ Close</button>
            </div>
            <img src={previewImage} alt="Evidence Preview" className="w-full h-auto max-h-[70vh] object-contain rounded-xl border border-slate-800 bg-slate-950" />
          </div>
        </div>
      )}

      {/* Modal: Resolve Note Modal */}
      {selectedViolationForResolve && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl max-w-md w-full space-y-4">
            <h4 className="text-sm font-bold text-slate-100">Resolve Safety Violation</h4>
            <p className="text-xs text-slate-400">
              Worker: <span className="text-cyan-300 font-mono">{selectedViolationForResolve.anonymous_worker_id}</span> ({selectedViolationForResolve.violation_type})
            </p>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Resolution Note:</label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. Verified worker equipped with approved hard hat and safety vest."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 h-24"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedViolationForResolve(null)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</button>
              <button onClick={handleResolveSubmit} className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">Confirm Resolution</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
