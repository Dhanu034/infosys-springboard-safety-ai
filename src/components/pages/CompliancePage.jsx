import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  Eye, 
  RefreshCw, 
  Plus, 
  Download, 
  Search,
  Filter,
  FileCheck,
  Bookmark
} from 'lucide-react';
import { 
  fetchComplianceDocuments, 
  fetchComplianceEvaluations, 
  fetchInspectionSchedules, 
  fetchComplianceReport 
} from '../../services/api';
import DocumentUploadModal from '../compliance/DocumentUploadModal';
import EvidenceViewerModal from '../compliance/EvidenceViewerModal';

export default function CompliancePage({ selectedProject }) {
  const projectId = selectedProject?.id || "PRJ-101";

  const [documents, setDocuments] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsData, evalsData, schedData, repData] = await Promise.all([
        fetchComplianceDocuments(projectId).catch(() => []),
        fetchComplianceEvaluations(projectId).catch(() => []),
        fetchInspectionSchedules(projectId).catch(() => []),
        fetchComplianceReport(projectId).catch(() => null)
      ]);
      setDocuments(docsData);
      setEvaluations(evalsData);
      setSchedules(schedData);
      setReport(repData);
    } catch (err) {
      console.error("Error loading compliance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleDownloadReport = async () => {
    try {
      setGeneratingReport(true);
      const rep = await fetchComplianceReport(projectId);
      if (rep) {
        const jsonStr = JSON.stringify(rep, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `buildsure_compliance_audit_${projectId}_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert("Failed to generate audit report: " + err.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  const filteredEvaluations = evaluations.filter(ev => {
    if (activeFilter !== 'ALL' && ev.status !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (ev.standard_code && ev.standard_code.toLowerCase().includes(q)) ||
        (ev.source_name && ev.source_name.toLowerCase().includes(q)) ||
        (ev.category && ev.category.toLowerCase().includes(q)) ||
        (ev.evidence_snippet && ev.evidence_snippet.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#e0e3e5] font-sans">Compliance & Regulatory Intelligence</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
              AGENT VIGILANCE M3
            </span>
          </div>
          <p className="text-xs font-mono text-[#859397] mt-1 tracking-wide">
            AUTOMATED OSHA 1926 & BOCW 1998 RULE MATCHING // {selectedProject?.name || "PROJECT ALPHA"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-lg bg-[#191c1e] hover:bg-[#1d2022] text-[#bbc9cd] hover:text-[#e0e3e5] border border-[#3c494c]/40 text-xs font-mono font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>REFRESH</span>
          </button>

          <button
            onClick={handleDownloadReport}
            disabled={generatingReport}
            className="px-3.5 py-2 rounded-lg bg-[#191c1e] hover:bg-[#1d2022] text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>{generatingReport ? "EXPORTING..." : "EXPORT AUDIT JSON"}</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-mono font-black flex items-center gap-2 shadow-md glow-cyan transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ UPLOAD DOCUMENT</span>
          </button>
        </div>
      </div>

      {/* Mandatory Regulatory Disclaimer */}
      <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs font-mono flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>
            Automated AI Assessment — Reference Rule Match — Requires Qualified Safety Supervisor Review. Not a final legal or regulatory certification.
          </span>
        </div>
        <span className="text-[10px] text-[#859397] hidden lg:inline">BOCW / OSHA / ISO</span>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Documents Ingested */}
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/20 bg-[#162032]/90 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-[#859397]">
            <span className="text-cyan-400 font-bold">DOC-INGEST-01</span>
            <FileText className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-xs font-semibold text-[#bbc9cd]">Active Documents</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#e0e3e5]">{documents.length}</span>
            <span className="text-[11px] font-mono text-cyan-400">PDF / Scans</span>
          </div>
        </div>

        {/* Card 2: Rule-Based Compliance Rate */}
        <div className="glass-panel p-5 rounded-xl border border-emerald-500/20 bg-[#162032]/90 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-[#859397]">
            <span className="text-emerald-400 font-bold">RULE-MATCH-02</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-[#bbc9cd]">Rule Match Indication</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">{report?.compliance_rate ?? 0}%</span>
            <span className="text-[11px] font-mono text-[#859397]">Evaluated</span>
          </div>
        </div>

        {/* Card 3: Needs Human Review */}
        <div className="glass-panel p-5 rounded-xl border border-amber-500/20 bg-[#162032]/90 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-[#859397]">
            <span className="text-amber-400 font-bold">REV-PEND-03</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-xs font-semibold text-[#bbc9cd]">Needs Human Review</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-amber-400">
              {evaluations.filter(e => e.status === 'needs_human_review').length}
            </span>
            <span className="text-[11px] font-mono text-[#ffb77d]">Supervisor Gate</span>
          </div>
        </div>

        {/* Card 4: Inspection Schedules */}
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/20 bg-[#162032]/90 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-[#859397]">
            <span className="text-cyan-400 font-bold">SCHED-AUD-04</span>
            <Clock className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-xs font-semibold text-[#bbc9cd]">Due Inspections</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#e0e3e5]">{schedules.length}</span>
            <span className="text-[11px] font-mono text-rose-400">
              {schedules.filter(s => s.status === 'OVERDUE').length} Overdue
            </span>
          </div>
        </div>

      </div>

      {/* Main Checklist Matrix & Ingestion Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Regulatory Rule Checklist Matrix */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#3c494c]/30">
            <div>
              <h3 className="text-base font-bold text-[#e0e3e5] font-sans">Regulatory Verification Matrix</h3>
              <p className="text-[11px] font-mono text-[#859397]">OSHA 1926 & BOCW 1998 CLAUSE CITATIONS</p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              {[
                { key: 'ALL', label: 'ALL' },
                { key: 'compliant', label: 'COMPLIANT' },
                { key: 'needs_human_review', label: 'NEEDS REVIEW' },
                { key: 'missing_evidence', label: 'MISSING' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    activeFilter === tab.key
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                      : 'text-[#859397] hover:text-[#e0e3e5] hover:bg-[#1d2022]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Evaluations List */}
          {filteredEvaluations.length === 0 ? (
            <div className="py-12 text-center text-[#859397] space-y-2">
              <FileCheck className="h-8 w-8 mx-auto text-[#859397]/50" />
              <p className="text-xs font-mono">No evaluation records matching the filter.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredEvaluations.map((ev) => {
                let badgeStyle = "bg-cyan-500/10 text-cyan-300 border-cyan-400/30";
                if (ev.status === 'compliant') badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-400/30";
                if (ev.status === 'non_compliant') badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-400/30";
                if (ev.status === 'needs_human_review') badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-400/30";
                if (ev.status === 'missing_evidence') badgeStyle = "bg-[#1d2022] text-[#859397] border-[#3c494c]/40";

                return (
                  <div 
                    key={ev.evaluation_id}
                    onClick={() => setSelectedEvaluation(ev)}
                    className="p-4 rounded-xl bg-[#101415]/70 border border-[#3c494c]/30 hover:border-cyan-500/60 cursor-pointer transition-all space-y-2 hover:bg-[#162032]/80 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-300">{ev.standard_code}</span>
                          <span className="text-[10px] font-mono text-[#859397]">({ev.category})</span>
                        </div>
                        <h4 className="text-xs font-semibold text-[#e0e3e5] mt-0.5 group-hover:text-cyan-200">{ev.source_name}</h4>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border shrink-0 ${badgeStyle}`}>
                        {ev.status_label || ev.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Evidence Snippet with Page Citation */}
                    {ev.evidence_snippet && (
                      <div className="p-2.5 rounded-lg bg-[#162032] border border-[#3c494c]/20 text-[11px] font-mono text-[#bbc9cd] space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-[#859397]">
                          <span>CITATION // PAGE {ev.evidence_page || 1} • {ev.evidence_section || 'Section 1'}</span>
                          <span>CONFIDENCE: {Math.round(ev.confidence * 100)}%</span>
                        </div>
                        <p className="line-clamp-2 italic">"{ev.evidence_snippet}"</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] font-mono text-[#859397] pt-1">
                      <span>DOC: {ev.document_filename || "Policy Doc"}</span>
                      <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        Click to Inspect Evidence & Review &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right 1 Col: Documents & Inspection Tracker */}
        <div className="space-y-6">
          
          {/* Ingested Documents Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Ingested Documents</h3>
              <span className="text-[10px] font-mono text-cyan-400">{documents.length} Uploaded</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {documents.length === 0 ? (
                <div className="py-6 text-center text-[#859397] text-xs font-mono">
                  No documents uploaded yet.
                </div>
              ) : (
                documents.map(d => (
                  <div key={d.doc_id} className="p-2.5 rounded-lg bg-[#101415]/70 border border-[#3c494c]/20 flex items-center justify-between text-xs font-mono">
                    <div className="truncate pr-2">
                      <p className="text-[#e0e3e5] truncate font-semibold">{d.filename}</p>
                      <p className="text-[10px] text-[#859397]">{d.document_category} • {d.page_count} pg ({d.extraction_method})</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 shrink-0">
                      {d.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Inspection Schedules Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Inspection Due Dates</h3>
              <Clock className="h-4 w-4 text-cyan-400" />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {schedules.map(s => {
                let badge = "text-cyan-400 bg-cyan-500/10 border-cyan-400/20";
                if (s.status === 'OVERDUE') badge = "text-rose-400 bg-rose-500/10 border-rose-400/20";
                if (s.status === 'DUE_SOON') badge = "text-amber-400 bg-amber-500/10 border-amber-400/20";

                return (
                  <div key={s.schedule_id} className="p-2.5 rounded-lg bg-[#101415]/70 border border-[#3c494c]/20 flex items-center justify-between text-xs font-mono">
                    <div>
                      <p className="text-[#e0e3e5] font-semibold">{s.item_title}</p>
                      <p className="text-[10px] text-[#859397]">{s.category} • {s.days_until_due}d remaining</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${badge}`}>
                      {s.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Upload Document Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          loadData();
          setIsUploadOpen(false);
        }}
        projectId={projectId}
      />

      {/* Evidence Viewer Modal */}
      <EvidenceViewerModal
        isOpen={Boolean(selectedEvaluation)}
        evaluation={selectedEvaluation}
        onClose={() => setSelectedEvaluation(null)}
        onReviewSuccess={() => {
          loadData();
        }}
      />

    </div>
  );
}
