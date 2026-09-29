import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  FileSpreadsheet, 
  Printer, 
  Users, 
  Layers, 
  ShieldAlert, 
  History,
  Info,
  Calendar,
  ExternalLink,
  ChevronRight,
  HardHat,
  X,
  Sparkles
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { 
  fetchReportProjectSummary, 
  fetchReportRisk, 
  fetchReportSafety, 
  fetchReportCompliance, 
  fetchReportIncidents, 
  fetchReportInsurance,
  downloadReportExport,
  fetchReportAuditLogs
} from '../../services/api';
import RiskDecisionTimeline from '../RiskDecisionTimeline';


/**
 * ExecutiveReportsPage Component (Milestone 4 — Consolidated Risk Intelligence & Reporting)
 * Aggregates outputs from SiteRiskAgent, SafetyAgent, Compliance Engine, and Insurance Engine.
 */
export default function ExecutiveReportsPage({ onNavigateTab }) {
  const { selectedProject, selectedProjectId } = useProject();

  // State
  const [activeTab, setActiveTab] = useState('EXECUTIVE'); // EXECUTIVE | SITE_RISK | PPE_SAFETY | COMPLIANCE | INCIDENTS | INSURANCE
  const [dateRange, setDateRange] = useState('ALL_TIME'); // ALL_TIME | 24H | 7D | 30D
  const [roleFilter, setRoleFilter] = useState('Executive'); // Executive | Safety Officer | Compliance Auditor | Underwriter
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Audit Logs Modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Calculate Date bounds
  const getDateBounds = () => {
    const now = new Date();
    if (dateRange === '24H') {
      const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return { from: from.toISOString(), to: now.toISOString() };
    }
    if (dateRange === '7D') {
      const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { from: from.toISOString(), to: now.toISOString() };
    }
    if (dateRange === '30D') {
      const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { from: from.toISOString(), to: now.toISOString() };
    }
    return { from: null, to: null };
  };

  const loadReportData = async () => {
    setLoading(true);
    const { from, to } = getDateBounds();

    try {
      let data = null;
      if (activeTab === 'SITE_RISK') {
        data = await fetchReportRisk(selectedProjectId, from, to, roleFilter);
      } else if (activeTab === 'PPE_SAFETY') {
        data = await fetchReportSafety(selectedProjectId, from, to, roleFilter);
      } else if (activeTab === 'COMPLIANCE') {
        data = await fetchReportCompliance(selectedProjectId, from, to, roleFilter);
      } else if (activeTab === 'INCIDENTS') {
        data = await fetchReportIncidents(selectedProjectId, from, to, roleFilter);
      } else if (activeTab === 'INSURANCE') {
        data = await fetchReportInsurance(selectedProjectId, from, to, roleFilter);
      } else {
        data = await fetchReportProjectSummary(selectedProjectId, from, to, roleFilter);
      }
      setReportData(data);
    } catch (err) {
      console.error("Error loading reporting intelligence:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [selectedProjectId, activeTab, dateRange, roleFilter]);

  const handleExport = (format) => {
    if (format === 'html') {
      window.print();
      return;
    }
    const { from, to } = getDateBounds();
    const reportType = activeTab === 'EXECUTIVE' ? 'project_summary' : activeTab.toLowerCase();
    downloadReportExport(selectedProjectId, reportType, from, to, roleFilter, format);
  };

  const handleOpenAuditModal = async () => {
    setIsAuditModalOpen(true);
    setAuditLoading(true);
    try {
      const logs = await fetchReportAuditLogs(selectedProjectId);
      setAuditLogs(logs || []);
    } catch (err) {
      console.error("Error fetching report audit logs:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  const metrics = reportData?.metrics || {};
  const hasData = reportData?.has_data ?? false;

  // Tier color mapper
  const getTierColor = (tier) => {
    switch (tier) {
      case 'CRITICAL': return 'text-rose-400 bg-rose-950/80 border-rose-500/40';
      case 'HIGH': return 'text-amber-400 bg-amber-950/80 border-amber-500/40';
      case 'MODERATE': return 'text-yellow-400 bg-yellow-950/80 border-yellow-500/40';
      case 'LOW': return 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40';
      default: return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 print:bg-white print:text-black">
      
      {/* Header with Title & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:border-b-2 print:pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#e0e3e5] font-sans print:text-black">
              Construction Risk & Executive Intelligence
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 print:hidden">
              MILESTONE 4 REPORTING AGENT
            </span>
          </div>
          <p className="text-xs font-mono text-[#859397] mt-0.5 tracking-wider print:text-slate-600">
            CONSOLIDATED CROSS-AGENT INTELLIGENCE // PROJECT: <span className="text-cyan-300 font-bold print:text-black">{selectedProject?.name || selectedProjectId}</span> ({selectedProjectId})
          </p>
          {reportData?.generated_at && (
            <p className="text-[10px] font-mono text-slate-500 mt-0.5 print:text-slate-500">
              Report Generated At: {new Date(reportData.generated_at).toLocaleString()} • Data Sources: {reportData?.data_sources?.join(', ') || '[DATABASE]'}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {/* Refresh Action */}
          <button
            onClick={loadReportData}
            title="Refresh Report Data"
            className="p-2 rounded-lg bg-[#191c1e] hover:bg-[#1d2022] text-[#bbc9cd] hover:text-cyan-300 border border-[#3c494c]/40 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Audit Trail Log Button */}
          <button
            onClick={handleOpenAuditModal}
            className="px-3 py-2 rounded-lg bg-[#191c1e] hover:bg-[#1d2022] text-[#bbc9cd] hover:text-[#e0e3e5] border border-[#3c494c]/40 text-xs font-mono font-bold flex items-center gap-2 transition-colors"
          >
            <History className="h-3.5 w-3.5 text-cyan-400" />
            <span>AUDIT TRAIL</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={() => handleExport('json')}
            className="px-3 py-2 rounded-lg bg-[#191c1e] hover:bg-[#1d2022] text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>JSON</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-2 rounded-lg bg-[#191c1e] hover:bg-[#1d2022] text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          {/* Print / Save PDF */}
          <button
            onClick={() => handleExport('html')}
            className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-mono font-black flex items-center gap-2 shadow-md glow-cyan transition-all"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>PRINT / SAVE PDF</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Date Range Filter & Role View Preset */}
      <div className="glass-panel p-4 rounded-xl border border-[#3c494c]/30 bg-[#162032]/90 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono print:hidden">
        
        {/* Date Range Selector */}
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="text-[#859397] font-bold">PERIOD:</span>
          <div className="flex items-center gap-1 bg-[#101415] border border-[#3c494c]/40 p-1 rounded-lg">
            {[
              { id: 'ALL_TIME', label: 'ALL TIME' },
              { id: '24H', label: 'LAST 24H' },
              { id: '7D', label: 'LAST 7 DAYS' },
              { id: '30D', label: 'LAST 30 DAYS' }
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => setDateRange(preset.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  dateRange === preset.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-[#859397] hover:text-[#e0e3e5]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Role-Oriented View Preset Selector */}
        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="text-[#859397] font-bold">ROLE VIEW:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#101415] border border-amber-500/50 rounded-lg px-3 py-1 text-xs font-mono font-bold text-amber-300 focus:outline-none cursor-pointer"
          >
            <option value="Executive">Executive Overview</option>
            <option value="Safety Officer">Safety Officer View</option>
            <option value="Compliance Auditor">Compliance Auditor View</option>
            <option value="Underwriter">Insurance Underwriter View</option>
          </select>
        </div>

      </div>

      {/* 6 Report Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#3c494c]/30 pb-3 print:hidden">
        {[
          { id: 'EXECUTIVE', label: '1. EXECUTIVE SUMMARY' },
          { id: 'SITE_RISK', label: '2. SITE RISK REPORT' },
          { id: 'PPE_SAFETY', label: '3. PPE SAFETY REPORT' },
          { id: 'COMPLIANCE', label: '4. COMPLIANCE REPORT' },
          { id: 'INCIDENTS', label: '5. INCIDENTS & ALERTS' },
          { id: 'INSURANCE', label: '6. INSURANCE EXPOSURE' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-400 text-slate-950 font-black shadow-md'
                : 'bg-[#162032] text-[#859397] hover:text-[#e0e3e5] hover:bg-[#1d2022] border border-[#3c494c]/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3 border border-[#3c494c]/30">
          <RefreshCw className="h-6 w-6 mx-auto animate-spin text-cyan-400" />
          <p className="text-xs font-mono text-[#859397]">Aggregating cross-agent intelligence records for {selectedProjectId}...</p>
        </div>
      )}

      {/* Honest Empty State Notice when hasData is false */}
      {!loading && !hasData && (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3 border border-amber-500/30 bg-amber-950/10">
          <AlertTriangle className="h-8 w-8 mx-auto text-amber-400" />
          <h3 className="text-base font-bold text-[#e0e3e5] font-sans">No Records Available</h3>
          <p className="text-xs font-mono text-[#859397] max-w-md mx-auto">
            No records available for selected project and period. No synthetic or artificial metrics are generated.
          </p>
        </div>
      )}

      {/* TAB 1: EXECUTIVE SUMMARY */}
      {!loading && hasData && activeTab === 'EXECUTIVE' && (
        <div className="space-y-6">
          
          {/* Unified Project Risk Scorecard */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-[#162032]/90">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Left: Overall Risk Score & Tier */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Unified Project Risk Score</h3>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getTierColor(metrics.risk_tier)}`}>
                    {metrics.risk_tier ? `${metrics.risk_tier} RISK` : (metrics.score_status || 'INSUFFICIENT DATA')}
                  </span>
                </div>
                
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-cyan-300 font-mono">
                    {metrics.overall_risk_score != null ? metrics.overall_risk_score : 'N/A'}
                  </span>
                  <span className="text-xs text-[#859397] font-mono">/ 100 Index</span>
                </div>

                <p className="text-xs font-mono text-[#bbc9cd] max-w-2xl">
                  {metrics.score_explanation || "Deterministic formula consolidating Safety, Compliance, and Insurance."}
                </p>
              </div>

              {/* Right: Dimension Breakdown Bars */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs w-full lg:w-auto">
                <div className="p-3 rounded-xl bg-[#101415] border border-cyan-500/20 text-center">
                  <span className="text-[10px] text-[#859397] block">SAFETY RISK (35%)</span>
                  <span className="text-lg font-bold text-cyan-300">
                    {metrics.safety_risk != null ? metrics.safety_risk : 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#101415] border border-indigo-500/20 text-center">
                  <span className="text-[10px] text-[#859397] block">COMPLIANCE (35%)</span>
                  <span className="text-lg font-bold text-indigo-300">
                    {metrics.compliance_risk != null ? metrics.compliance_risk : 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#101415] border border-amber-500/20 text-center">
                  <span className="text-[10px] text-[#859397] block">INSURANCE (30%)</span>
                  <span className="text-lg font-bold text-amber-300">
                    {metrics.insurance_risk != null ? metrics.insurance_risk : 'N/A'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Cross-Agent Summary Cards Grid with Drill-Down Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            
            {/* Card 1: Worker PPE Compliance */}
            <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 bg-[#162032]/90 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs text-[#859397]">
                  <span className="text-cyan-400 font-bold">SAFETY AGENT</span>
                  <HardHat className="h-4 w-4 text-cyan-400" />
                </div>
                <p className="text-xs font-semibold text-[#bbc9cd] mt-1">PPE Compliance Rate</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-cyan-300">
                    {metrics.ppe_compliance_rate != null ? `${metrics.ppe_compliance_rate}%` : 'N/A'}
                  </span>
                  <span className="text-[11px] text-slate-400">({metrics.total_violations || 0} evaluated)</span>
                </div>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('PPE_DETECTION')}
                  className="w-full flex items-center justify-between text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/80 px-2.5 py-1.5 rounded border border-cyan-500/30 transition-colors"
                >
                  <span>View PPE Telemetry</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Card 2: Regulatory Compliance */}
            <div className="glass-panel p-5 rounded-xl border border-indigo-500/30 bg-[#162032]/90 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs text-[#859397]">
                  <span className="text-indigo-400 font-bold">COMPLIANCE HUB</span>
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                </div>
                <p className="text-xs font-semibold text-[#bbc9cd] mt-1">Regulatory Standard Match</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-indigo-300">
                    {metrics.regulatory_compliance_rate != null ? `${metrics.regulatory_compliance_rate}%` : 'N/A'}
                  </span>
                  <span className="text-[11px] text-slate-400">({metrics.total_evaluations || 0} rules)</span>
                </div>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('COMPLIANCE')}
                  className="w-full flex items-center justify-between text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-950/80 px-2.5 py-1.5 rounded border border-indigo-500/30 transition-colors"
                >
                  <span>View Compliance Hub</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Card 3: Insurance Exposure Score */}
            <div className="glass-panel p-5 rounded-xl border border-amber-500/30 bg-[#162032]/90 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs text-[#859397]">
                  <span className="text-amber-400 font-bold">INSURANCE AGENT</span>
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                </div>
                <p className="text-xs font-semibold text-[#bbc9cd] mt-1">Exposure Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-amber-300">
                    {metrics.insurance_exposure_score != null ? metrics.insurance_exposure_score : 'N/A'}
                  </span>
                  <span className="text-[11px] text-slate-400">/ 100</span>
                </div>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('INSURANCE')}
                  className="w-full flex items-center justify-between text-[11px] text-amber-400 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-950/80 px-2.5 py-1.5 rounded border border-amber-500/30 transition-colors"
                >
                  <span>View Insurance Dossiers</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Card 4: Open Critical Alerts & Overdue Audits */}
            <div className="glass-panel p-5 rounded-xl border border-rose-500/30 bg-[#162032]/90 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs text-[#859397]">
                  <span className="text-rose-400 font-bold">ATTENTION REQUIRED</span>
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                </div>
                <p className="text-xs font-semibold text-[#bbc9cd] mt-1">Critical Alerts & Overdue</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-rose-400">
                    {(metrics.open_critical_alerts || 0) + (metrics.overdue_inspections || 0)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({metrics.open_critical_alerts || 0} critical, {metrics.overdue_inspections || 0} overdue)
                  </span>
                </div>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('SAFETY_ALERTS')}
                  className="w-full flex items-center justify-between text-[11px] text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/80 px-2.5 py-1.5 rounded border border-rose-500/30 transition-colors"
                >
                  <span>View Alert Center</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* High-Risk Zones & Repeated Violations Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
            
            {/* High-Risk Zones */}
            <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-3">
              <div className="flex justify-between items-center border-l-4 border-cyan-400 pl-3">
                <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">High-Risk Site Zones</h3>
                <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                  REAL TELEMETRY
                </span>
              </div>
              {metrics.high_risk_zones && metrics.high_risk_zones.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {metrics.high_risk_zones.map((z, idx) => (
                    <div key={z.zone_name || idx} className="p-3 rounded-lg bg-[#101415] border border-[#3c494c]/40 flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{z.zone_name}</span>
                      <span className="text-rose-400 font-bold">{z.violations_count} violations</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No zone-specific violation records found.</p>
              )}
            </div>

            {/* Repeated Violations */}
            <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-3">
              <div className="flex justify-between items-center border-l-4 border-amber-400 pl-3">
                <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Repeated Site Violations</h3>
                <span className="text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  HISTORICAL RECURRENCE
                </span>
              </div>
              {metrics.repeated_violations && metrics.repeated_violations.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {metrics.repeated_violations.map((rv, idx) => (
                    <div key={rv.violation_type || idx} className="p-3 rounded-lg bg-[#101415] border border-[#3c494c]/40 flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{rv.violation_type?.replace(/_/g, ' ')}</span>
                      <span className="text-amber-400 font-bold">{rv.occurrence_count} occurrences</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No repeated violations detected in the selected period.</p>
              )}
            </div>

          </div>

          {/* Actionable Operational Recommendations */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-[#162032]/80 space-y-3 font-mono">
            <div className="flex items-center gap-2 border-l-4 border-cyan-400 pl-3">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Deterministic Operational Recommendations</h3>
            </div>
            {metrics.top_recommendations && metrics.top_recommendations.length > 0 ? (
              <div className="space-y-2">
                {metrics.top_recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#101415] border border-[#3c494c]/30 flex items-center gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-slate-200 font-sans">{rec}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#859397]">All site risk and compliance metrics are currently within nominal thresholds.</p>
            )}
          </div>

          {/* Unresolved Actions & Open Alert Log */}
          <div className="glass-panel p-6 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-3 font-mono">
            <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Unresolved Supervisor Actions & Inspection Items</h3>
            {metrics.unresolved_actions && metrics.unresolved_actions.length > 0 ? (
              <div className="space-y-2">
                {metrics.unresolved_actions.map(action => (
                  <div key={action.action_id} className="p-3 rounded-lg bg-[#101415] border border-[#3c494c]/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 mr-2">
                        {action.severity}
                      </span>
                      <span className="text-[#e0e3e5] font-semibold">{action.title}</span>
                    </div>
                    <span className="text-[10px] text-[#859397]">{new Date(action.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#859397]">No pending unresolved supervisor actions for this project.</p>
            )}
          </div>

          {/* Milestone 4 Enhancement: Risk Decision Timeline */}
          <RiskDecisionTimeline 
            projectId={selectedProjectId}
            fromDate={getDateBounds().from}
            toDate={getDateBounds().to}
            onNavigateTab={onNavigateTab}
          />

          {/* Statutory Disclaimers */}
          <div className="p-4 rounded-xl bg-[#101415] border border-amber-500/30 space-y-1.5 text-[11px] font-mono text-amber-300/80">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Info className="h-4 w-4 shrink-0" />
              <span>Mandatory Safety & Underwriting Disclaimers</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              {reportData?.disclaimers?.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>

        </div>
      )}

      {/* TAB 2: SITE RISK REPORT */}
      {!loading && hasData && activeTab === 'SITE_RISK' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Site Risk & Zone Multipliers Breakdown</h3>
            <span className="text-xs text-cyan-400 font-bold">Overall Risk Score: {metrics.overall_site_risk_score ?? "N/A"}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.zones_risk_breakdown?.map(z => (
              <div key={z.zone_name} className="p-4 rounded-xl bg-[#101415] border border-[#3c494c]/30 space-y-2">
                <h4 className="text-xs font-bold text-cyan-300">{z.zone_name}</h4>
                <p className="text-[11px] text-[#bbc9cd]">Risk Multiplier: <strong className="text-amber-400">{z.risk_multiplier}x</strong></p>
                <p className="text-[11px] text-[#bbc9cd]">Violations Count: <strong>{z.violation_count}</strong></p>
                <p className="text-[11px] text-[#bbc9cd]">Avg Zone Risk: <strong className="text-rose-400">{z.avg_risk_score}</strong></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PPE SAFETY REPORT */}
      {!loading && hasData && activeTab === 'PPE_SAFETY' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-6 font-mono">
          <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Worker PPE Safety Telemetry & Response Denominators</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#101415] border border-[#3c494c]/30">
              <span className="text-[10px] text-[#859397] block">EVALUATED WORKERS</span>
              <span className="text-2xl font-bold text-[#e0e3e5]">{metrics.evaluated_workers_count}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#101415] border border-[#3c494c]/30">
              <span className="text-[10px] text-[#859397] block">HELMET COMPLIANCE</span>
              <span className="text-2xl font-bold text-cyan-300">{metrics.helmet_compliance_rate ?? "N/A"}%</span>
              <span className="text-[9px] text-[#859397] block">Count: {metrics.helmet_assessment_count}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#101415] border border-[#3c494c]/30">
              <span className="text-[10px] text-[#859397] block">VEST COMPLIANCE</span>
              <span className="text-2xl font-bold text-indigo-300">{metrics.vest_compliance_rate ?? "N/A"}%</span>
              <span className="text-[9px] text-[#859397] block">Count: {metrics.vest_assessment_count}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#101415] border border-[#3c494c]/30">
              <span className="text-[10px] text-[#859397] block">OVERALL PPE COMPLIANT</span>
              <span className="text-2xl font-bold text-emerald-400">{metrics.overall_ppe_compliance_rate ?? "N/A"}%</span>
              <span className="text-[9px] text-[#859397] block">Workers: {metrics.overall_ppe_compliant_worker_count}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE REPORT */}
      {!loading && hasData && activeTab === 'COMPLIANCE' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Regulatory Verification & Ingested Document Audits</h3>
            <span className="text-xs text-cyan-400 font-bold">Regulatory Compliance: {metrics.regulatory_compliance_rate ?? "N/A"}%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#101415] border border-[#3c494c]/30">
              <span className="text-[10px] text-[#859397] block">INGESTED DOCUMENTS</span>
              <span className="text-2xl font-bold text-[#e0e3e5]">{metrics.ingested_documents_count}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#101415] border border-[#3c494c]/30">
              <span className="text-[10px] text-[#859397] block">HUMAN VERIFIED REVIEWS</span>
              <span className="text-2xl font-bold text-cyan-300">{metrics.human_verified_count}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#101415] border border-[#3c494c]/30">
              <span className="text-[10px] text-[#859397] block">OVERDUE INSPECTIONS</span>
              <span className="text-2xl font-bold text-rose-400">{metrics.overdue_inspections_count}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INCIDENTS & ALERTS */}
      {!loading && hasData && activeTab === 'INCIDENTS' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Incident & High-Risk Alert Logs</h3>
            <span className="text-xs text-rose-400 font-bold">Total Alerts: {metrics.total_alerts_count}</span>
          </div>

          <div className="space-y-2">
            {metrics.recent_alerts?.map(alert => (
              <div key={alert.alert_id} className="p-3 rounded-lg bg-[#101415] border border-[#3c494c]/40 flex items-center justify-between text-xs">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold mr-2 ${
                    alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-[#e0e3e5] font-semibold">{alert.title}</span>
                </div>
                <span className="text-[10px] text-[#859397]">{new Date(alert.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: INSURANCE EXPOSURE */}
      {!loading && hasData && activeTab === 'INSURANCE' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Underwriting Exposure & Claim Dossier Checklist Completeness</h3>
            <span className="text-xs text-amber-400 font-bold">Exposure Score: {metrics.insurance_exposure_score ?? "N/A"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#101415] border border-[#3c494c]/30">
              <span className="text-[10px] text-[#859397] block">EXPOSURE TIER</span>
              <span className="text-2xl font-bold text-amber-400">{metrics.exposure_tier || "MODERATE"}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#101415] border border-[#3c494c]/30">
              <span className="text-[10px] text-[#859397] block">EVIDENCE COMPLETENESS RATE</span>
              <span className="text-2xl font-bold text-cyan-300">{metrics.evidence_completeness_rate ?? "N/A"}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal Drawer */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#101415] border border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl font-mono">
            <div className="p-4 border-b border-[#3c494c]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-[#e0e3e5]">Reporting Intelligence Audit Trail</h3>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1d2022]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 text-xs flex-1">
              {auditLoading ? (
                <div className="text-center py-8 text-slate-400">Loading audit history...</div>
              ) : auditLogs.length > 0 ? (
                auditLogs.map(log => (
                  <div key={log.log_id} className="p-3 rounded-lg bg-[#162032] border border-[#3c494c]/30 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-cyan-300 mr-2">[{log.export_format?.toUpperCase()}]</span>
                      <span className="text-slate-200">{log.report_type}</span>
                      <span className="text-slate-400 block text-[10px]">User Role: {log.user_role}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{new Date(log.generated_at).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">No report generation logs recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
