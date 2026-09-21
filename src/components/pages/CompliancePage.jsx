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
  Bookmark,
  CheckSquare,
  Square,
  Layers,
  ChevronDown
} from 'lucide-react';
import { 
  fetchComplianceDocuments, 
  fetchComplianceEvaluations, 
  fetchDocumentChecklist,
  fetchInspectionSchedules, 
  fetchComplianceReport 
} from '../../services/api';
import DocumentUploadModal from '../compliance/DocumentUploadModal';
import EvidenceViewerModal from '../compliance/EvidenceViewerModal';

export default function CompliancePage({ selectedProject }) {
  const projectId = selectedProject?.id || "PRJ-101";

  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [docChecklist, setDocChecklist] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [report, setReport] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('CHECKLIST'); // 'CHECKLIST' | 'REGULATIONS'
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Load baseline project documents and schedules
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [docsData, schedData, repData] = await Promise.all([
        fetchComplianceDocuments(projectId).catch(() => []),
        fetchInspectionSchedules(projectId).catch(() => []),
        fetchComplianceReport(projectId).catch(() => null)
      ]);
      setDocuments(docsData);
      setSchedules(schedData);
      setReport(repData);

      // Auto-select first document if none selected
      if (docsData && docsData.length > 0) {
        const firstDocId = docsData[0].document_id || docsData[0].doc_id;
        setSelectedDocId(firstDocId);
      } else {
        setSelectedDocId('ALL');
      }
    } catch (err) {
      console.error("Error loading compliance documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [projectId]);

  // Load document-specific evaluations and dynamic checklist when selectedDocId changes
  useEffect(() => {
    if (!selectedDocId) return;

    let isMounted = true;
    const fetchDocSpecificData = async () => {
      // REQUIREMENT 7: Clear old evaluations and checklist before fetching new document data
      setEvaluations([]);
      setDocChecklist(null);
      setDocLoading(true);

      try {
        if (selectedDocId === 'ALL') {
          const allEvals = await fetchComplianceEvaluations(projectId);
          if (isMounted) {
            setEvaluations(allEvals);
            setDocChecklist(null);
          }
        } else {
          const [evalsData, chkData] = await Promise.all([
            fetchComplianceEvaluations(projectId, null, selectedDocId).catch(() => []),
            fetchDocumentChecklist(selectedDocId).catch(() => null)
          ]);
          if (isMounted) {
            setEvaluations(evalsData);
            setDocChecklist(chkData);
          }
        }
      } catch (err) {
        console.error("Error loading document-specific evaluations/checklist:", err);
      } finally {
        if (isMounted) setDocLoading(false);
      }
    };

    fetchDocSpecificData();

    return () => {
      isMounted = false;
    };
  }, [selectedDocId, projectId]);

  const handleUploadSuccess = async (uploadedDoc) => {
    const newDocId = uploadedDoc.document_id || uploadedDoc.doc_id;
    // Refresh document list and auto-select newly uploaded document
    const updatedDocs = await fetchComplianceDocuments(projectId).catch(() => []);
    setDocuments(updatedDocs);
    // Explicitly set selectedDocId to newly uploaded document
    setSelectedDocId(newDocId);
    setIsUploadOpen(false);
  };

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

  const selectedDocument = documents.find(
    d => (d.document_id || d.doc_id) === selectedDocId
  );

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

  // Calculate dynamic compliance metrics based on current evaluations
  const totalEvals = evaluations.length;
  const compliantCount = evaluations.filter(e => e.status === 'compliant').length;
  const docComplianceRate = totalEvals > 0 ? Math.round((compliantCount / totalEvals) * 100) : (docChecklist?.completeness_percentage ?? 0);
  const needsReviewCount = evaluations.filter(e => e.status === 'needs_human_review').length;

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
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1d2022] text-[#859397] border border-[#3c494c]/40">
              [IMPORTED PDF]
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1d2022] text-[#859397] border border-[#3c494c]/40">
              [DATABASE]
            </span>
          </div>
          <p className="text-xs font-mono text-[#859397] mt-1 tracking-wide">
            DOCUMENT-SPECIFIC OSHA 1926 & BOCW 1998 RULE MATCHING // {selectedProject?.name || "PROJECT ALPHA"} ({projectId})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadInitialData}
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

      {/* Active Document Selector Bar */}
      <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 bg-[#162032]/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <label className="text-[10px] font-mono text-[#859397] block font-bold uppercase tracking-wider">
              Selected Compliance Document
            </label>
            <div className="relative mt-0.5">
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="bg-[#101415] border border-cyan-500/50 rounded-lg px-3 py-1.5 pr-8 text-xs font-mono font-bold text-[#e0e3e5] focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer appearance-none min-w-[280px]"
              >
                {documents.map((doc) => {
                  const dId = doc.document_id || doc.doc_id;
                  return (
                    <option key={dId} value={dId}>
                      {doc.filename} ({doc.document_category} • {doc.page_count} pg)
                    </option>
                  );
                })}
                <option value="ALL">All Documents (Consolidated Project View)</option>
              </select>
              <ChevronDown className="h-4 w-4 text-cyan-400 absolute right-2.5 top-2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Selected Document Metadata Badges */}
        {selectedDocument && selectedDocId !== 'ALL' && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-md bg-[#101415] border border-[#3c494c]/40 text-[#bbc9cd]">
              Category: <strong className="text-cyan-300">{selectedDocument.document_category}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#101415] border border-[#3c494c]/40 text-[#bbc9cd]">
              Pages: <strong className="text-cyan-300">{selectedDocument.page_count}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#101415] border border-[#3c494c]/40 text-[#bbc9cd]">
              Method: <strong className="text-cyan-300">{selectedDocument.extraction_method?.toUpperCase()}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-bold">
              Status: {selectedDocument.status}
            </span>
          </div>
        )}
      </div>

      {/* Dynamic KPI Metric Cards (Document-Specific) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Ingested Document */}
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/20 bg-[#162032]/90 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-[#859397]">
            <span className="text-cyan-400 font-bold">DOC-INGEST-01</span>
            <FileText className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-xs font-semibold text-[#bbc9cd]">Target Document</p>
          <div className="truncate">
            <span className="text-base font-extrabold font-mono text-[#e0e3e5] block truncate">
              {selectedDocId === 'ALL' ? "All Project Documents" : (selectedDocument?.filename || "No Document")}
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              {selectedDocId === 'ALL' ? `${documents.length} Total Ingested` : `${selectedDocument?.page_count || 1} Pages • ${selectedDocument?.extraction_method?.toUpperCase() || 'PYPDF'}`}
            </span>
          </div>
        </div>

        {/* Card 2: Document Inspection Completeness */}
        <div className="glass-panel p-5 rounded-xl border border-emerald-500/20 bg-[#162032]/90 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-[#859397]">
            <span className="text-emerald-400 font-bold">DOC-CHK-02</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-[#bbc9cd]">Document Inspection Readiness</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {docChecklist ? `${docChecklist.completeness_percentage}%` : `${docComplianceRate}%`}
            </span>
            <span className="text-[11px] font-mono text-[#859397]">
              {docChecklist ? `${docChecklist.found_count}/${docChecklist.checklist_items?.length} Found` : 'Evaluated'}
            </span>
          </div>
        </div>

        {/* Card 3: Needs Human Review */}
        <div className="glass-panel p-5 rounded-xl border border-amber-500/20 bg-[#162032]/90 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-[#859397]">
            <span className="text-amber-400 font-bold">REV-PEND-03</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-xs font-semibold text-[#bbc9cd]">Needs Supervisor Review</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-amber-400">
              {needsReviewCount}
            </span>
            <span className="text-[11px] font-mono text-[#ffb77d]">Rule Citations</span>
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

      {/* Main Split: Dynamic Inspection Checklist & Regulatory Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Dynamic Tabs for Document Inspection Checklist vs Regulatory Matrix */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-4">
          
          {/* Section Header & Sub-Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#3c494c]/30">
            <div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('CHECKLIST')}
                  className={`text-sm font-bold font-sans transition-colors pb-1 border-b-2 ${
                    activeTab === 'CHECKLIST'
                      ? 'border-cyan-400 text-cyan-300'
                      : 'border-transparent text-[#859397] hover:text-[#e0e3e5]'
                  }`}
                >
                  Document Inspection Checklist
                </button>
                <button
                  onClick={() => setActiveTab('REGULATIONS')}
                  className={`text-sm font-bold font-sans transition-colors pb-1 border-b-2 ${
                    activeTab === 'REGULATIONS'
                      ? 'border-cyan-400 text-cyan-300'
                      : 'border-transparent text-[#859397] hover:text-[#e0e3e5]'
                  }`}
                >
                  Regulatory Verification Matrix
                </button>
              </div>
              <p className="text-[11px] font-mono text-[#859397] mt-1">
                {activeTab === 'CHECKLIST' 
                  ? `CONTENT-DERIVED SAFETY REQUIREMENTS // ${selectedDocument?.filename || 'ALL'}` 
                  : `OSHA 1926 & BOCW 1998 CLAUSE CITATIONS // ${selectedDocument?.filename || 'ALL'}`
                }
              </p>
            </div>

            {/* Filter buttons if in regulatory view */}
            {activeTab === 'REGULATIONS' && (
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
            )}
          </div>

          {/* Loading Indicator */}
          {docLoading && (
            <div className="py-12 text-center text-[#859397] space-y-2">
              <RefreshCw className="h-6 w-6 mx-auto animate-spin text-cyan-400" />
              <p className="text-xs font-mono">Analyzing document-specific compliance evidence...</p>
            </div>
          )}

          {/* TAB 1: Document Inspection Checklist */}
          {!docLoading && activeTab === 'CHECKLIST' && (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {docChecklist && docChecklist.checklist_items && docChecklist.checklist_items.length > 0 ? (
                docChecklist.checklist_items.map((item) => {
                  let statusBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-400/30";
                  let statusIcon = <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />;

                  if (item.status === 'MISSING') {
                    statusBadge = "bg-rose-500/10 text-rose-400 border-rose-400/30";
                    statusIcon = <Square className="h-4 w-4 text-rose-400 shrink-0" />;
                  } else if (item.status === 'NEEDS_REVIEW') {
                    statusBadge = "bg-amber-500/10 text-amber-400 border-amber-400/30";
                    statusIcon = <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
                  }

                  return (
                    <div 
                      key={item.checklist_id}
                      className="p-4 rounded-xl bg-[#101415]/70 border border-[#3c494c]/30 hover:border-cyan-500/60 transition-all space-y-2 hover:bg-[#162032]/80 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          {statusIcon}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-cyan-300">{item.code}</span>
                              <span className="text-xs font-semibold text-[#e0e3e5]">{item.title}</span>
                            </div>
                            <p className="text-[11px] text-[#bbc9cd] mt-0.5">{item.requirement}</p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border shrink-0 ${statusBadge}`}>
                          {item.status}
                        </span>
                      </div>

                      {/* Evidence citation snippet if found */}
                      {item.evidence_snippet ? (
                        <div className="p-2.5 rounded-lg bg-[#162032] border border-cyan-500/20 text-[11px] font-mono text-[#bbc9cd] space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-[#859397]">
                            <span>CITATION // PAGE {item.evidence_page || 1} • {item.evidence_section || 'Verified Clause'}</span>
                            <span className="text-cyan-400 font-bold">CONFIDENCE: {Math.round(item.confidence * 100)}%</span>
                          </div>
                          <p className="italic text-cyan-100/90">"{item.evidence_snippet}"</p>
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-[#859397] italic pl-6">
                          Clause not found in current extracted text. Flagged for review.
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-mono text-[#859397] pt-1">
                        <span>SOURCE: {item.source} ({item.source_table})</span>
                        <span className="text-cyan-400">Review Required: Yes</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-[#859397] space-y-2">
                  <FileCheck className="h-8 w-8 mx-auto text-[#859397]/50" />
                  <p className="text-xs font-mono">Select a specific document to view its content-derived inspection checklist.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Regulatory Verification Matrix */}
          {!docLoading && activeTab === 'REGULATIONS' && (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredEvaluations.length === 0 ? (
                <div className="py-12 text-center text-[#859397] space-y-2">
                  <FileCheck className="h-8 w-8 mx-auto text-[#859397]/50" />
                  <p className="text-xs font-mono">No evaluation records matching the filter.</p>
                </div>
              ) : (
                filteredEvaluations.map((ev) => {
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
                })
              )}
            </div>
          )}

        </div>

        {/* Right 1 Col: Documents & Inspection Tracker */}
        <div className="space-y-6">
          
          {/* Ingested Documents List */}
          <div className="glass-panel p-5 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Ingested Documents</h3>
              <span className="text-[10px] font-mono text-cyan-400">{documents.length} Uploaded</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {documents.length === 0 ? (
                <div className="py-6 text-center text-[#859397] text-xs font-mono">
                  No documents uploaded yet.
                </div>
              ) : (
                documents.map(d => {
                  const dId = d.document_id || d.doc_id;
                  const isSelected = selectedDocId === dId;

                  return (
                    <div 
                      key={dId}
                      onClick={() => setSelectedDocId(dId)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs font-mono cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-[#1d2022] border-cyan-400 shadow-sm' 
                          : 'bg-[#101415]/70 border-[#3c494c]/20 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className={`font-semibold truncate ${isSelected ? 'text-cyan-300' : 'text-[#e0e3e5]'}`}>
                          {d.filename}
                        </p>
                        <p className="text-[10px] text-[#859397]">{d.document_category} • {d.page_count} pg ({d.extraction_method})</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 shrink-0">
                        {d.status}
                      </span>
                    </div>
                  );
                })
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
              {schedules.length === 0 ? (
                <div className="py-6 text-center text-[#859397] text-xs font-mono">
                  No upcoming inspections scheduled.
                </div>
              ) : (
                schedules.map(s => {
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
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Upload Document Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        projectId={projectId}
      />

      {/* Evidence Viewer Modal */}
      <EvidenceViewerModal
        isOpen={Boolean(selectedEvaluation)}
        evaluation={selectedEvaluation}
        onClose={() => setSelectedEvaluation(null)}
        onReviewSuccess={() => {
          if (selectedDocId) {
            fetchComplianceEvaluations(projectId, null, selectedDocId === 'ALL' ? null : selectedDocId).then(setEvaluations);
          }
        }}
      />

    </div>
  );
}
