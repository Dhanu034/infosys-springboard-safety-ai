import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Eye, 
  RefreshCw, 
  Layers, 
  HardHat, 
  MapPin, 
  ChevronRight,
  Database,
  Info
} from 'lucide-react';
import { fetchSafetySummary, fetchViolations } from '../../services/api';
import { useProject } from '../../context/ProjectContext';

/**
 * SafetyDashboardPage Component
 * Displays project-filtered database KPIs, dynamic PPE compliance concentric gauge,
 * zone violation breakdown, and live recent violations feed without static fallbacks.
 */
export default function SafetyDashboardPage() {
  const { selectedProject, selectedProjectId, isSimulationMode } = useProject();
  const [summary, setSummary] = useState(null);
  const [violations, setViolations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    try {
      const [sum, vios] = await Promise.all([
        fetchSafetySummary(selectedProjectId).catch(() => null),
        fetchViolations({ projectId: selectedProjectId }).catch(() => [])
      ]);
      setSummary(sum);
      setViolations(vios || []);
    } catch (e) {
      console.error("Safety dashboard load error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSummary(null);
    setViolations([]);
    loadData();
  }, [selectedProjectId]);

  const hasData = summary && summary.has_data && summary.safety_score !== null;
  const helmetRate = summary?.helmet_compliance_rate ?? 0;
  const vestRate = summary?.vest_compliance_rate ?? 0;
  const overallRate = summary?.overall_ppe_compliance_rate;

  // Concentric circle stroke math
  // Outer (radius 44): circumference = 2 * PI * 44 ≈ 276.46
  const outerCircumference = 2 * Math.PI * 44;
  const outerOffset = hasData ? outerCircumference - (helmetRate / 100) * outerCircumference : outerCircumference;

  // Middle (radius 40): circumference = 2 * PI * 40 ≈ 251.33
  const middleCircumference = 2 * Math.PI * 40;
  const middleOffset = hasData ? middleCircumference - (vestRate / 100) * middleCircumference : middleCircumference;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#e0e3e5] font-sans">Safety Intelligence Dashboard</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
              DATABASE
            </span>
          </div>
          <p className="text-xs font-mono text-[#859397] mt-0.5 tracking-wider uppercase">
            PROJECT: <span className="text-cyan-300 font-bold">{selectedProject?.name || selectedProjectId}</span> | ID: {selectedProjectId}
          </p>
        </div>
        <button
          onClick={loadData}
          title="Refresh Dashboard"
          className="p-2 rounded-lg bg-[#191c1e] text-[#859397] hover:text-cyan-300 border border-[#3c494c]/30 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1: Open Violations */}
        <div className="glass-panel p-5 rounded-xl border border-red-500/30 bg-red-950/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div className="flex items-center justify-between text-xs font-mono text-[#859397]">
            <span className="font-bold text-red-300">OPEN VIOLATIONS</span>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-extrabold font-mono text-[#e0e3e5]">
              {summary ? summary.open_violations : 0}
            </span>
          </div>
          <p className="text-[11px] font-mono text-red-400">
            {hasData ? `${summary.open_violations} active violation(s) require action` : "No open violations recorded"}
          </p>
        </div>

        {/* KPI 2: Critical Alerts */}
        <div className="glass-panel p-5 rounded-xl border border-amber-500/30 bg-amber-950/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#fd8b00]"></div>
          <div className="flex items-center justify-between text-xs font-mono text-[#859397]">
            <span className="font-bold text-[#ffb77d]">CRITICAL ALERTS</span>
            <ShieldAlert className="h-4 w-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-extrabold font-mono text-[#ffb77d]">
              {summary ? String(summary.critical_violations).padStart(2, '0') : '00'}
            </span>
          </div>
          <p className="text-[11px] font-mono text-amber-400">
            {hasData && summary.critical_violations > 0 ? "Immediate supervisor escalation required" : "0 critical alarms active"}
          </p>
        </div>

        {/* KPI 3: Safety Score */}
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 bg-cyan-950/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400"></div>
          <div className="flex items-center justify-between text-xs font-mono text-[#859397]">
            <span className="font-bold text-cyan-300">SAFETY SCORE</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-extrabold font-mono text-cyan-300">
              {hasData ? `${summary.safety_score}%` : 'N/A'}
            </span>
          </div>
          <p className="text-[11px] font-mono text-[#859397]">
            {hasData ? "Dynamic Actuarial Safety Rating" : "No safety observation records"}
          </p>
        </div>

      </div>

      {/* Middle Row: Zone Breakdown & PPE Compliance Concentric Gauge */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Zone Breakdown Panel (Span 8) */}
        <div className="col-span-12 lg:col-span-8 glass-panel p-5 rounded-xl border border-[#3c494c]/30 flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between mb-3 border-l-4 border-cyan-400 pl-3">
            <div>
              <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Zone Safety Breakdown</h3>
              <p className="text-[11px] font-mono text-[#859397]">Active violation density across project sectors</p>
            </div>
            <span className="text-[10px] font-mono text-[#859397] bg-[#101415] px-2 py-0.5 rounded border border-[#3c494c]/40">
              {selectedProjectId}
            </span>
          </div>

          {/* Zone items */}
          <div className="space-y-3 my-auto">
            {summary && summary.violations_by_zone && Object.keys(summary.violations_by_zone).length > 0 ? (
              Object.entries(summary.violations_by_zone).map(([zoneName, count]) => (
                <div key={zoneName} className="bg-[#101415]/80 p-3.5 rounded-lg border border-[#3c494c]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200">{zoneName}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-[#859397]">Violations: <strong className={count > 0 ? "text-amber-400" : "text-emerald-400"}>{count}</strong></span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      count > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {count > 0 ? 'ATTENTION' : 'CLEAR'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center border border-dashed border-[#3c494c]/30 rounded-lg">
                <Info className="h-5 w-5 text-slate-500 mx-auto mb-1.5" />
                <p className="text-xs font-mono text-slate-400">No zone violation statistics available for {selectedProjectId}.</p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">Upload images or run inspections to generate spatial data.</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#3c494c]/30 flex items-center justify-between text-xs font-mono text-[#859397]">
            <span>Monitored Personnel: <strong className="text-slate-200">{summary?.total_workers_monitored || 0}</strong></span>
            <span>Total Logged Records: <strong className="text-slate-200">{violations.length}</strong></span>
          </div>
        </div>

        {/* PPE Compliance Concentric Circles Chart (Span 4) */}
        <div className="col-span-12 lg:col-span-4 glass-panel p-5 rounded-xl border border-[#3c494c]/30 flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between mb-2 border-l-4 border-cyan-400 pl-3">
            <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">PPE Compliance</h3>
            <span className="text-[10px] font-mono text-slate-400">ACTUAL RATE</span>
          </div>

          {/* Concentric Progress Graphic */}
          <div className="relative w-44 h-44 mx-auto my-2 flex items-center justify-center">
            {/* Outer ring (Hardhats) */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="44" stroke="rgba(133, 147, 151, 0.15)" strokeWidth="6"></circle>
              <circle
                cx="50"
                cy="50"
                fill="none"
                r="44"
                stroke="#68f5b8"
                strokeDasharray="276"
                strokeDashoffset={outerOffset}
                strokeWidth="6"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              ></circle>
            </svg>

            {/* Middle ring (Vests) */}
            <svg className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)] transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="40" stroke="rgba(133, 147, 151, 0.15)" strokeWidth="6"></circle>
              <circle
                cx="50"
                cy="50"
                fill="none"
                r="40"
                stroke="#fd8b00"
                strokeDasharray="251"
                strokeDashoffset={middleOffset}
                strokeWidth="6"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              ></circle>
            </svg>

            {/* Center score */}
            <div className="text-center z-10">
              <span className={`text-3xl font-extrabold font-mono block leading-none ${hasData ? 'text-[#e0e3e5]' : 'text-slate-500'}`}>
                {hasData && overallRate !== null && overallRate !== undefined ? `${overallRate}%` : 'N/A'}
              </span>
              <span className="text-[10px] font-mono text-[#859397]">AVG RATE</span>
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-2 font-mono text-xs pt-2 border-t border-[#3c494c]/30">
            <div className="flex justify-between items-center text-[#bbc9cd]">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-[#68f5b8] rounded-full"></span> Hardhat Compliance</span>
              <span className="font-bold text-[#e0e3e5]">{hasData ? `${helmetRate}%` : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-[#bbc9cd]">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-[#fd8b00] rounded-full"></span> Safety Vest Compliance</span>
              <span className="font-bold text-[#e0e3e5]">{hasData ? `${vestRate}%` : 'N/A'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom: Recent Violations Feed Table */}
      <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 space-y-4">
        <div className="flex items-center justify-between border-b border-[#3c494c]/30 pb-3">
          <div className="flex items-center gap-2 border-l-4 border-cyan-400 pl-3">
            <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Recent Violations Feed</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
              {violations.length} RECORDS
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            PROJECT: {selectedProjectId}
          </span>
        </div>

        <div className="overflow-x-auto">
          {violations.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-[#3c494c]/30 text-[#859397] text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">EVIDENCE</th>
                  <th className="py-2.5 px-3">TIMESTAMP</th>
                  <th className="py-2.5 px-3">ZONE</th>
                  <th className="py-2.5 px-3">VIOLATION TYPE</th>
                  <th className="py-2.5 px-3">SEVERITY</th>
                  <th className="py-2.5 px-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3c494c]/20">
                {violations.map((v) => (
                  <tr key={v.violation_id} className="hover:bg-[#1d2022]/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="w-14 h-10 rounded bg-[#101415] border border-[#3c494c]/40 overflow-hidden flex items-center justify-center">
                        {v.annotated_image_path || v.original_image_path ? (
                          <img
                            src={v.annotated_image_path || v.original_image_path}
                            alt="Evidence frame"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-[9px] text-slate-500">NO IMG</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#bbc9cd]">
                      {v.detected_at ? new Date(v.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Recent'}
                    </td>
                    <td className="py-3 px-3 text-[#e0e3e5] font-bold">{v.zone_name}</td>
                    <td className="py-3 px-3 text-cyan-300">{v.violation_type?.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        v.risk_category?.toLowerCase().includes('crit') ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {v.risk_category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        v.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        v.status === 'ACKNOWLEDGED' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                        'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {v.status || 'OPEN'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center border border-dashed border-[#3c494c]/30 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-mono text-slate-300">No violation records logged for {selectedProject?.name || selectedProjectId}.</p>
              <p className="text-[11px] font-mono text-slate-500 mt-1">All monitored PPE rules and zone observations are clean.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
