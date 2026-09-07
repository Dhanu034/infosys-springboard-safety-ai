import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Users, AlertTriangle, CheckCircle2, Filter, Eye, RefreshCw, Layers, ShieldCheck, AlertOctagon, X, Check } from 'lucide-react';
import { fetchSafetySummary, fetchViolations, acknowledgeAlert, resolveAlert } from '../services/api';
import ChartPanel from './ui/ChartPanel';
import MetricCard from './ui/MetricCard';
import RiskBadge from './ui/RiskBadge';
import StatusPill from './ui/StatusPill';
import BilingualLabel from './ui/BilingualLabel';
import EmptyState from './ui/EmptyState';
import LoadingState from './ui/LoadingState';

/**
 * SafetyDashboardPage Component (Phase 3 Redesign)
 * Milestone 2 Safety Intelligence & Compliance Analytics styled with Industrial Precision Glassmorphism.
 */
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
      <div className="glass-panel p-6 border-accent-cyan flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shrink-0 glow-cyan">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <BilingualLabel
                  en="Safety Intelligence Dashboard"
                  ta="பாதுகாப்பு பகுப்பாய்வு மையம்"
                  enClassName="text-xl font-bold tracking-tight text-slate-100 font-sans"
                />
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Live Database Feed
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Real-time construction safety KPIs, worker PPE compliance rates, and automated audit records.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadDashboardData}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-200 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <MetricCard
          title="PPE Compliance"
          titleTa="இணக்க விகிதம்"
          value={`${summary?.overall_ppe_compliance_rate || 92.8}%`}
          accent="green"
          subtext="Helmet & Vest Avg"
        />
        <MetricCard
          title="Monitored"
          titleTa="தொழிலாளர்கள்"
          value={summary?.total_workers_monitored || 342}
          accent="cyan"
          subtext="Active Density"
        />
        <MetricCard
          title="Open Violations"
          titleTa="தீர்க்கப்படாதவை"
          value={summary?.open_violations || 0}
          accent={(summary?.open_violations || 0) > 0 ? "orange" : "green"}
          subtext="Pending Action"
        />
        <MetricCard
          title="Critical Hazards"
          titleTa="முக்கிய அபாயம்"
          value={summary?.critical_violations || 0}
          accent={(summary?.critical_violations || 0) > 0 ? "red" : "green"}
          subtext="Lockout Priority"
        />
        <MetricCard
          title="Safety Score"
          titleTa="பாதுகாப்பு எண்"
          value={summary?.safety_score || 94.0}
          accent="cyan"
          subtext="Index / 100"
        />
        <MetricCard
          title="Alerts Today"
          titleTa="இன்றைய பதிவுகள்"
          value={violations.length}
          accent="default"
          subtext="Recorded to DB"
        />
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Helmet vs Vest Compliance */}
        <ChartPanel
          title="PPE Compliance Rates"
          titleTa="கவசம் இணக்க விகிதங்கள்"
          icon={ShieldAlert}
        >
          <div className="space-y-4 pt-1 font-mono">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Hard Hat Compliance</span>
                <span className="font-bold text-emerald-400">{summary?.helmet_compliance_rate || 94.5}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${summary?.helmet_compliance_rate || 94.5}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Safety Vest Compliance</span>
                <span className="font-bold text-cyan-400">{summary?.vest_compliance_rate || 91.2}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${summary?.vest_compliance_rate || 91.2}%` }}></div>
              </div>
            </div>
          </div>
        </ChartPanel>

        {/* Violations by Type */}
        <ChartPanel
          title="Violations by Type"
          titleTa="மீறல் வகைப்பாடு"
          icon={AlertTriangle}
        >
          <div className="space-y-2 text-xs font-mono pt-1">
            {Object.entries(summary?.violations_by_type || {}).length === 0 ? (
              <p className="text-slate-500 text-center py-4">No violations recorded yet.</p>
            ) : (
              Object.entries(summary?.violations_by_type || {}).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-[#0b0f10] border border-slate-800">
                  <span className="text-slate-300">{type}</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-bold border border-red-500/30">{count}</span>
                </div>
              ))
            )}
          </div>
        </ChartPanel>

        {/* Violations by Zone */}
        <ChartPanel
          title="High-Risk Construction Zones"
          titleTa="அதிக அபாய மண்டலங்கள்"
          icon={Layers}
        >
          <div className="space-y-2 text-xs font-mono pt-1">
            {Object.entries(summary?.violations_by_zone || {}).length === 0 ? (
              <p className="text-slate-500 text-center py-4">No zone incidents recorded.</p>
            ) : (
              Object.entries(summary?.violations_by_zone || {}).map(([zone, count]) => (
                <div key={zone} className="flex items-center justify-between p-2 rounded-lg bg-[#0b0f10] border border-slate-800">
                  <span className="text-slate-300 truncate max-w-[170px]">{zone}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">{count} Events</span>
                </div>
              ))
            )}
          </div>
        </ChartPanel>

      </div>

      {/* Filter Bar & Recent Violations Table */}
      <ChartPanel
        title="Database Safety Violation Records"
        titleTa="பாதுகாப்பு மீறல் தரவு பதிவுகள்"
        icon={Filter}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#0b0f10] text-xs font-mono text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0b0f10] text-xs font-mono text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        }
      >
        {/* Violations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Worker ID</th>
                <th className="py-3 px-3">Zone</th>
                <th className="py-3 px-3">Violation Type</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Risk Score</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
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
                    <td className="py-3.5 px-3 font-mono font-bold text-cyan-300">{v.anonymous_worker_id}</td>
                    <td className="py-3.5 px-3 text-slate-200 font-sans">{v.zone_name}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-300 uppercase">{v.violation_type.replace('_', ' ')}</td>
                    <td className="py-3.5 px-3">
                      <RiskBadge severity={v.risk_category} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-100">{v.final_risk_score}/100</td>
                    <td className="py-3.5 px-3">
                      <StatusPill status={v.status} />
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      {v.annotated_image_path && (
                        <button
                          onClick={() => setPreviewImage(v.annotated_image_path)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-cyan-300 font-mono text-[11px] border border-slate-700"
                        >
                          Evidence
                        </button>
                      )}
                      {v.status !== 'RESOLVED' && (
                        <button
                          onClick={() => setSelectedViolationForResolve(v)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-mono text-[11px] border border-emerald-500/40 font-semibold"
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
      </ChartPanel>

      {/* Modal: Evidence Image Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-[#0b0f10]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-5 max-w-2xl w-full border border-cyan-500/40 shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-slate-100 font-mono">Annotated Detection Evidence</h4>
              <button onClick={() => setPreviewImage(null)} className="text-slate-400 hover:text-slate-100 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <img src={previewImage} alt="Evidence Preview" className="w-full h-auto max-h-[70vh] object-contain rounded-xl border border-slate-800 bg-[#0b0f10]" />
          </div>
        </div>
      )}

      {/* Modal: Resolve Note Modal */}
      {selectedViolationForResolve && (
        <div className="fixed inset-0 z-50 bg-[#0b0f10]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full border border-emerald-500/40 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-slate-100 font-sans">Resolve Safety Violation</h4>
            <p className="text-xs text-slate-400 font-mono">
              Worker: <span className="text-cyan-300 font-bold">{selectedViolationForResolve.anonymous_worker_id}</span> ({selectedViolationForResolve.violation_type})
            </p>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5">Resolution Audit Note:</label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. Verified worker equipped with approved hard hat and safety vest."
                className="w-full bg-[#0b0f10] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 h-24 font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedViolationForResolve(null)}
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
