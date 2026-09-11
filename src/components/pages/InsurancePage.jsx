import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  UserCheck, 
  DollarSign, 
  Layers, 
  FileText,
  Search,
  CheckSquare,
  Square,
  Scale,
  Camera
} from 'lucide-react';
import { 
  fetchInsuranceExposureSummary, 
  fetchInsuranceClaims 
} from '../../services/api';
import ClaimReviewModal from '../insurance/ClaimReviewModal';

export default function InsurancePage({ selectedProject }) {
  const projectId = selectedProject?.id || "PRJ-101";

  const [exposure, setExposure] = useState(null);
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expData, claimsData] = await Promise.all([
        fetchInsuranceExposureSummary(projectId).catch(() => null),
        fetchInsuranceClaims(projectId).catch(() => [])
      ]);
      setExposure(expData);
      setClaims(claimsData);
      if (claimsData && claimsData.length > 0) {
        // If a claim was previously selected, keep it updated
        setSelectedClaim(prev => {
          if (!prev) return claimsData[0];
          const found = claimsData.find(c => c.assessment_id === prev.assessment_id);
          return found || claimsData[0];
        });
      }
    } catch (err) {
      console.error("Error loading insurance intelligence:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const filteredClaims = claims.filter(c => {
    if (statusFilter !== 'ALL' && c.decision_status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#e0e3e5] font-sans">Insurance Exposure & Claim Intelligence</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-400/30">
              INTERNAL DECISION SUPPORT
            </span>
          </div>
          <p className="text-xs font-mono text-[#859397] mt-1 tracking-wide">
            ACTUARIAL EXPOSURE INDEX & CLAIM EVIDENCE CHECKLIST // {selectedProject?.name || "PROJECT ALPHA"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-lg bg-[#191c1e] hover:bg-[#1d2022] text-[#bbc9cd] hover:text-[#e0e3e5] border border-[#3c494c]/40 text-xs font-mono font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>RECALCULATE EXPOSURE</span>
          </button>
        </div>
      </div>

      {/* Mandatory Insurance Decision Support Disclaimer */}
      <div className="p-3 rounded-xl bg-[#191c1e] border border-amber-500/30 text-[#ffdcc3] text-xs font-mono flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            Internal safety decision-support estimate only. Does not represent actual insurance policy terms, premiums, or claim settlements.
          </span>
        </div>
        <span className="text-[10px] text-[#859397] hidden lg:inline">Underwriting AI Support</span>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Insurance Exposure Score */}
        <div className="glass-panel p-5 rounded-xl border border-amber-500/30 bg-[#162032]/90 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-[#859397]">
            <span className="text-amber-400 font-bold">INS-EXP-01</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-xs font-semibold text-[#bbc9cd]">Exposure Risk Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#e0e3e5]">
              {exposure?.exposure_score ?? 34.3}
            </span>
            <span className="text-xs font-mono text-amber-300 font-bold">
              / 100 ({exposure?.exposure_tier ?? "LOW"})
            </span>
          </div>
        </div>

        {/* Card 2: Total Safety Events */}
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/20 bg-[#162032]/90 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-[#859397]">
            <span className="text-cyan-400 font-bold">EVT-CORR-02</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-xs font-semibold text-[#bbc9cd]">Safety Events Ingested</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#e0e3e5]">
              {exposure?.total_safety_events ?? claims.length}
            </span>
            <span className="text-[11px] font-mono text-cyan-400">SQLite Records</span>
          </div>
        </div>

        {/* Card 3: Evidence Completeness */}
        <div className="glass-panel p-5 rounded-xl border border-emerald-500/20 bg-[#162032]/90 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-[#859397]">
            <span className="text-emerald-400 font-bold">EVD-CMPL-03</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-[#bbc9cd]">Evidence Completeness</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {exposure?.evidence_completeness_rate ?? 100}%
            </span>
            <span className="text-[11px] font-mono text-[#859397]">Ready for Review</span>
          </div>
        </div>

        {/* Card 4: Illustrative Liability Range */}
        <div className="glass-panel p-5 rounded-xl border border-[#3c494c]/30 bg-[#162032]/90 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-[#859397]">
            <span className="text-cyan-300 font-bold">EST-LIAB-04</span>
            <DollarSign className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-xs font-semibold text-[#bbc9cd]">Illustrative Estimate</p>
          <div>
            <p className="text-sm font-extrabold font-mono text-[#e0e3e5] truncate">
              {exposure?.illustrative_liability_range?.includes('$') ? exposure.illustrative_liability_range.split('—')[0] : "$15,000 - $35,000"}
            </p>
            <p className="text-[9px] font-mono text-[#859397] mt-0.5 italic">
              Illustrative internal estimate — not an insurance quotation or claim value.
            </p>
          </div>
        </div>

      </div>

      {/* Main Split: Claim Incidents List & Checklist Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Incident Claim Assessments List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#3c494c]/30">
            <div>
              <h3 className="text-base font-bold text-[#e0e3e5] font-sans">Safety Incidents & Claim Exposure Feed</h3>
              <p className="text-[11px] font-mono text-[#859397]">CORRELATED FROM SQLITE VIOLATIONS</p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              {[
                { id: 'ALL', label: 'ALL' },
                { id: 'PENDING_HUMAN_REVIEW', label: 'PENDING REVIEW' },
                { id: 'APPROVED_FOR_FILING', label: 'SUPERVISOR APPROVED' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    statusFilter === tab.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                      : 'text-[#859397] hover:text-[#e0e3e5] hover:bg-[#1d2022]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredClaims.length === 0 ? (
            <div className="py-12 text-center text-[#859397]">
              <FileSpreadsheet className="h-8 w-8 mx-auto text-[#859397]/50" />
              <p className="text-xs font-mono mt-2">No claim assessment records found.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredClaims.map((c) => {
                const isSelected = selectedClaim?.assessment_id === c.assessment_id;
                let tierStyle = "text-amber-400 bg-amber-500/10 border-amber-400/30";
                if (c.claim_risk_tier === 'HIGH' || c.claim_risk_tier === 'CATASTROPHIC') {
                  tierStyle = "text-rose-400 bg-rose-500/10 border-rose-400/30";
                }

                return (
                  <div
                    key={c.assessment_id}
                    onClick={() => setSelectedClaim(c)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-[#1d2022] border-amber-400/60 shadow-md'
                        : 'bg-[#101415]/70 border-[#3c494c]/30 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-300">{c.incident_type}</span>
                          <span className="text-[10px] font-mono text-[#859397]">in {c.zone_name}</span>
                        </div>
                        <p className="text-[11px] font-mono text-[#bbc9cd] mt-0.5">
                          Score: {c.exposure_score} • Severity: {c.incident_severity}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${tierStyle}`}>
                          {c.claim_risk_tier}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#162032] border border-[#3c494c]/40 text-[#859397]">
                          {c.decision_status === 'APPROVED_FOR_FILING' ? 'SUPERVISOR APPROVED' : 'PENDING REVIEW'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-[#859397]">
                      <span>Checklist: {c.checklist ? c.checklist.filter(i => i.is_attached).length : 0}/{c.checklist?.length || 5} Attached</span>
                      <span>{new Date(c.detected_at || c.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right 1 Col: Selected Claim Checklist & Supervisor Review */}
        <div className="glass-panel p-6 rounded-2xl border border-[#3c494c]/30 bg-[#162032]/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#3c494c]/30">
            <div>
              <h3 className="text-sm font-bold text-[#e0e3e5] font-sans">Claim Dossier Checklist</h3>
              <p className="text-[10px] font-mono text-cyan-400 mt-0.5">
                {selectedClaim ? `INCIDENT: ${selectedClaim.incident_type}` : "SELECT AN INCIDENT"}
              </p>
            </div>
            
            {selectedClaim && (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-mono font-black flex items-center gap-1.5 shadow-sm transition-all"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>ADJUDICATE</span>
              </button>
            )}
          </div>

          {selectedClaim ? (
            <div className="space-y-4 text-xs font-mono">
              
              {/* Checklist Items */}
              <div className="space-y-2">
                {selectedClaim.checklist && selectedClaim.checklist.map((item, idx) => (
                  <div key={item.item_id || idx} className="p-2.5 rounded-lg bg-[#101415]/70 border border-[#3c494c]/20 space-y-1">
                    <div className="flex items-center gap-2">
                      {item.is_attached ? (
                        <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-[#859397] shrink-0" />
                      )}
                      <span className={`font-semibold ${item.is_attached ? 'text-[#e0e3e5]' : 'text-[#859397]'}`}>
                        {item.item_title}
                      </span>
                    </div>
                    {item.evidence_reference && (
                      <p className="text-[10px] text-[#859397] pl-6 truncate">{item.evidence_reference}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Review Status & Notes */}
              <div className="p-3.5 rounded-lg bg-[#101415] border border-[#3c494c]/40 space-y-2 text-[11px]">
                <div className="flex justify-between items-center text-[#859397]">
                  <span>DECISION STATUS</span>
                  <span className="text-cyan-300 font-bold">{selectedClaim.decision_status}</span>
                </div>
                {selectedClaim.reviewed_by && (
                  <div className="flex justify-between items-center text-[#859397]">
                    <span>REVIEWED BY</span>
                    <span className="text-[#e0e3e5]">{selectedClaim.reviewed_by}</span>
                  </div>
                )}
                {selectedClaim.supervisor_notes && (
                  <div className="pt-1 border-t border-[#3c494c]/20 text-[10px] text-[#bbc9cd] italic">
                    "{selectedClaim.supervisor_notes}"
                  </div>
                )}
                <div className="pt-1 border-t border-[#3c494c]/20 text-[10px] text-[#859397] space-y-0.5">
                  <p>Legal counsel sign-off: Not provided.</p>
                  <p className="italic text-amber-400/80">Internal supervisor workflow — not legal approval.</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-[#859397] text-xs font-mono">
              Select an incident from the list to view claim documentation readiness.
            </div>
          )}

        </div>

      </div>

      {/* Claim Review Modal */}
      <ClaimReviewModal
        isOpen={isReviewModalOpen}
        claim={selectedClaim}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSuccess={() => {
          loadData();
          setIsReviewModalOpen(false);
        }}
      />

    </div>
  );
}
