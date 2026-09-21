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
  Filter, 
  Users, 
  Layers, 
  ShieldAlert, 
  History,
  Info,
  Calendar
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

export default function ExecutiveReportsPage() {
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
    const { from, to } = getDateBounds();
    const reportType = activeTab === 'EXECUTIVE' ? 'project_summary' : activeTab.toLowerCase();
    downloadReportExport(selectedProjectId, reportType, from, to, roleFilter, format);
  };

  const handleOpenAuditModal = async () => {
    setIsAuditModalOpen(true);
    setAuditLoading(true);
    try {
      const logs = await fetchReportAuditLogs(selectedProjectId);
      setAuditLogs(logs);
    } catch (err) {
      console.error("Error fetching report audit logs:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  const metrics = reportData?.metrics || {};
  const hasData = reportData?.has_data ?? false;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header with Title & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#e0e3e5] font-sans">
              Enterprise Reporting Intelligence Prototype
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              MILESTONE 4 MVP
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1d2022] text-[#859397] border border-[#3c494c]/40">
              [DATABASE]
            </span>
          </div>
          <p className="text-xs font-mono text-[#859397] mt-0.5 tracking-wider">
            CROSS-MILESTONE REAL-TIME AUDIT INTELLIGENCE // {selectedProject?.name || "PROJECT ALPHA"} ({selectedProjectId})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Audit Trail Log Button */}
          <button
            onClick={handleOpenAuditModal}
            className="px-3 py-2 rounded-lg bg-[#191c1e] hover:bg-[#1d2022] text-[#bbc9cd] hover:text-[#e0e3e5] border border-[#3c494c]/40 text-xs font-mono font-bold flex items-center gap-2 transition-colors"
          >
            <History className="h-3.5 w-3.5 text-cyan-400" />
            <span>AUDIT TRAIL</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <button
            onClick={() => handleExport('json')}
            className="px-3 py-2 rounded-lg bg-[#191c1e] hover:bg-[#1d2022] text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-2 rounded-lg bg-[#191c1e] hover:bg-[#1d2022] text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

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
      <div className="glass-panel p-4 rounded-xl border border-[#3c494c]/30 bg-[#162032]/90 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
        
        {/* Date Range Selector */}
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="text-[#859397] font-bold">DATE RANGE:</span>
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
          <span className="text-[#859397] font-bold">ROLE VIEW PRESET:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#101415] border border-amber-500/50 rounded-lg px-3 py-1 text-xs font-mono font-bold text-amber-300 focus:outline-none cursor-pointer"
          >
            <option value="Executive">Executive View</option>
            <option value="Safety Officer">Safety Officer View</option>
            <option value="Compliance Auditor">Compliance Auditor View</option>
            <option value="Underwriter">Underwriter / Risk Engineer View</option>
          </select>
        </div>

      </div>

      {/* 6 Report Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#3c494c]/30 pb-3">
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
          <p className="text-xs font-mono text-[#859397]">Aggregating live database metrics for {selectedProjectId}...</p>
        </div>
      )}

      {/* Honest Empty State Notice when hasData is false */}
      {!loading && !hasData && (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3 border border-amber-500/30 bg-amber-950/10">
          <AlertTriangle className="h-8 w-8 mx-auto text-amber-400" />
          <h3 className="text-base font-bold text-[#e0e3e5] font-sans">No Records Available</h3>
          <p className="text-xs font-mono text-[#859397] max-w-md mx-auto">
            No safety, compliance, or insurance records available for the selected project ({selectedProjectId}) and time period. No synthetic or fake metrics are generated.
          </p>
        </div>
      )}

      {/* TAB 1: EXECUTIVE SUMMARY */}
      {!loading && hasData && activeTab === 'EXECUTIVE' && (
        <div className="space-y-6">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            
            {/* Card 1: Executive Health Summary */}
            <div className="glass-panel p-5 rounded-xl border border-emerald-500/30 bg-[#162032]/90 space-y-2">
              <div className="flex justify-between items-center text-xs text-[#859397]">
                <span className="text-emerald-400 font-bold">HLTH-SUM-01</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-xs font-semibold text-[#bbc9cd]">Executive Health Summary</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#e0e3e5]">
                  {metrics.executive_health_summary ?? "N/A"}
                </span>
                <span className="text-xs text-emerald-400 font-bold">/ 100</span>
              </div>
            </div>

            {/* Card 2: Safety Score */}
            <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 bg-[#162032]/90 space-y-2">
              <div className="flex justify-between items-center text-xs text-[#859397]">
                <span className="text-cyan-400 font-bold">SFT-SCR-02</span>
                <TrendingUp className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="text-xs font-semibold text-[#bbc9cd]">Safety Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-cyan-300">
                  {metrics.safety_score ?? "N/A"}
                </span>
                <span className="text-xs text-cyan-400 font-bold">/ 100</span>
              </div>
            </div>

            {/* Card 3: PPE Compliance Rate */}
            <div className="glass-panel p-5 rounded-xl border border-indigo-500/30 bg-[#162032]/90 space-y-2">
              <div className="flex justify-between items-center text-xs text-[#859397]">
                <span className="text-indigo-400 font-bold">PPE-RTE-03</span>
                <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-xs font-semibold text-[#bbc9cd]">PPE Compliance Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-300">
                  {metrics.ppe_compliance_rate != null ? `${metrics.ppe_compliance_rate}%` : "N/A"}
                </span>
              </div>
            </div>

            {/* Card 4: Insurance Exposure Score */}
            <div className="glass-panel p-5 rounded-xl border border-amber-500/30 bg-[#162032]/90 space-y-2">
              <div className="flex justify-between items-center text-xs text-[#859397]">
                <span className="text-amber-400 font-bold">INS-EXP-04</span>
                <ShieldAlert className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-xs font-semibold text-[#bbc9cd]">Insurance Exposure Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-300">
                  {metrics.insurance_exposure_score ?? "N/A"}
                </span>
                <span className="text-xs text-amber-400 font-bold">/ 100</span>
              </div>
            </div>

          </div>

          {/* Unresolved Actions List */}
          <div className="glass-panel p-6 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-3 font-mono">
            <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Unresolved Executive Actions & Open Risks</h3>
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
              <p className="text-xs text-[#859397]">No pending unresolved executive actions.</p>
            )}
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

          {/* MTTA & MTTR Explanatory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#101415] border border-cyan-500/20 text-xs">
              <span className="text-[#859397] block">MEAN TIME TO ACKNOWLEDGE (MTTA)</span>
              <p className="text-lg font-bold text-cyan-300 mt-1">
                {metrics.mtta_minutes != null ? `${metrics.mtta_minutes} mins` : "null"}
              </p>
              <p className="text-[10px] text-[#859397] italic mt-1">{metrics.mtta_message}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#101415] border border-emerald-500/20 text-xs">
              <span className="text-[#859397] block">MEAN TIME TO RESOLVE (MTTR)</span>
              <p className="text-lg font-bold text-emerald-300 mt-1">
                {metrics.mttr_minutes != null ? `${metrics.mttr_minutes} mins` : "null"}
              </p>
              <p className="text-[10px] text-[#859397] italic mt-1">{metrics.mttr_message}</p>
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
          <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Incidents & Alert Severity Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(metrics.severity_counts || {}).map(([sev, cnt]) => (
              <div key={sev} className="p-4 rounded-xl bg-[#101415] border border-[#3c494c]/30">
                <span className="text-[10px] text-[#859397] block">{sev} SEVERITY</span>
                <span className="text-2xl font-bold text-amber-300">{cnt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: INSURANCE EXPOSURE */}
      {!loading && hasData && activeTab === 'INSURANCE' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-4 font-mono">
          <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Insurance Exposure Index & Underwriting Readiness</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#101415] border border-amber-500/30">
              <span className="text-[10px] text-[#859397] block">EXPOSURE SCORE</span>
              <span className="text-2xl font-bold text-amber-300">{metrics.insurance_exposure_score ?? "N/A"} / 100</span>
            </div>
            <div className="p-4 rounded-xl bg-[#101415] border border-amber-500/30">
              <span className="text-[10px] text-[#859397] block">CLAIM RISK TIER</span>
              <span className="text-2xl font-bold text-rose-400">{metrics.exposure_tier ?? "N/A"}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#101415] border border-emerald-500/30">
              <span className="text-[10px] text-[#859397] block">EVIDENCE COMPLETENESS</span>
              <span className="text-2xl font-bold text-emerald-400">{metrics.evidence_completeness_rate ?? "N/A"}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Disclaimers Banner */}
      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs font-mono space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <Info className="h-4 w-4 shrink-0" />
          <span>Mandatory Regulatory & Underwriting Disclaimers</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-[11px] text-[#bbc9cd]">
          {reportData?.disclaimers?.map((d, idx) => (
            <li key={idx}>{d}</li>
          )) || (
            <>
              <li>Automated AI Assessment & Reference Rule Match — Requires qualified Safety Supervisor review. Not a final legal or statutory regulatory certification.</li>
              <li>Internal safety decision-support estimate only — Does not represent actual insurance policy terms, premiums, or claim settlements.</li>
              <li>Computer vision telemetry is advisory decision support and does not guarantee accident prevention or absolute hazard elimination.</li>
            </>
          )}
        </ul>
      </div>

      {/* Report Audit Logs Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel max-w-2xl w-full p-6 rounded-2xl border border-cyan-500/40 bg-[#101415] space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-[#3c494c]/40 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <History className="h-4 w-4 text-cyan-400" />
                <span>Automatic Report Generation Audit Trail</span>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-2 py-1 rounded bg-[#191c1e] text-[#859397] hover:text-[#e0e3e5]"
              >
                Close ✕
              </button>
            </div>

            {auditLoading ? (
              <div className="py-8 text-center text-[#859397]">
                <RefreshCw className="h-5 w-5 mx-auto animate-spin text-cyan-400" />
                <p className="mt-2">Fetching audit log history...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <p className="text-center text-[#859397] py-6">No report generation logs recorded yet.</p>
                ) : (
                  auditLogs.map(log => (
                    <div key={log.log_id} className="p-2.5 rounded bg-[#162032] border border-[#3c494c]/30 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-cyan-300 font-bold">{log.report_type.toUpperCase()}</span>
                        <span className="text-[#859397] ml-2">({log.user_role})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase text-[9px]">
                          {log.export_format}
                        </span>
                        <span className="text-[#859397]">{new Date(log.generated_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
