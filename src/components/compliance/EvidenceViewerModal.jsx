import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  UserCheck, 
  Loader2, 
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { reviewComplianceEvaluation } from '../../services/api';

export default function EvidenceViewerModal({ isOpen, evaluation, onClose, onReviewSuccess }) {
  if (!isOpen || !evaluation) return null;

  const [reviewMode, setReviewMode] = useState(false);
  const [reviewerName, setReviewerName] = useState(evaluation.reviewed_by || "Safety Supervisor — Raman");
  const [statusOverride, setStatusOverride] = useState(evaluation.status === 'needs_human_review' ? 'compliant' : evaluation.status);
  const [reviewNotes, setReviewNotes] = useState(evaluation.review_notes || "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewNotes.trim() || submitting) {
      setErrorMessage("Reviewer identity and detailed review notes are required.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const updated = await reviewComplianceEvaluation(
        evaluation.evaluation_id,
        reviewerName.trim(),
        statusOverride,
        reviewNotes.trim()
      );

      setSuccessMessage("Supervisor review successfully recorded in audit trail.");
      if (onReviewSuccess) {
        onReviewSuccess(updated);
      }
      setTimeout(() => {
        setReviewMode(false);
      }, 1200);
    } catch (err) {
      setErrorMessage(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  let badgeStyle = "bg-cyan-500/10 text-cyan-300 border-cyan-400/30";
  if (evaluation.status === 'compliant') badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-400/30";
  if (evaluation.status === 'non_compliant') badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-400/30";
  if (evaluation.status === 'needs_human_review') badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-400/30";
  if (evaluation.status === 'missing_evidence') badgeStyle = "bg-[#1d2022] text-[#859397] border-[#3c494c]/40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#162032] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden glow-cyan flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3c494c]/30 flex items-center justify-between bg-[#101415]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#e0e3e5] font-sans">{evaluation.standard_code}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badgeStyle}`}>
                  {evaluation.status_label || evaluation.status.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#859397] truncate max-w-md">{evaluation.source_name}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#859397] hover:text-[#e0e3e5] hover:bg-[#1d2022] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs font-mono">
          
          {/* Mandatory Disclaimer */}
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-[11px] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>
              {evaluation.disclaimer || "Reference Rule Match — Human Verification Required. Not a legal or regulatory certification."}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#101415]/80 border border-[#3c494c]/30 text-[#bbc9cd]">
            <div>
              <span className="text-[#859397] block text-[10px]">CATEGORY</span>
              <span className="text-[#e0e3e5] font-semibold">{evaluation.category}</span>
            </div>
            <div>
              <span className="text-[#859397] block text-[10px]">JURISDICTION</span>
              <span className="text-[#e0e3e5] font-semibold truncate block">{evaluation.jurisdiction}</span>
            </div>
            <div>
              <span className="text-[#859397] block text-[10px]">CONFIDENCE</span>
              <span className="text-cyan-300 font-bold">{Math.round(evaluation.confidence * 100)}%</span>
            </div>
            <div>
              <span className="text-[#859397] block text-[10px]">DOCUMENT</span>
              <span className="text-[#e0e3e5] truncate block">{evaluation.document_filename || "Policy Doc"}</span>
            </div>
            <div>
              <span className="text-[#859397] block text-[10px]">PAGE CITATION</span>
              <span className="text-cyan-300 font-bold">Page {evaluation.evidence_page || 1}</span>
            </div>
            <div>
              <span className="text-[#859397] block text-[10px]">EXTRACTION METHOD</span>
              <span className="text-[#e0e3e5] font-semibold">{evaluation.extraction_method?.toUpperCase()}</span>
            </div>
          </div>

          {/* Requirement Summary */}
          {evaluation.matched_clause && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-[#859397] flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-cyan-400" />
                <span>REGULATORY REQUIREMENT CLAUSE</span>
              </label>
              <div className="p-3 rounded-lg bg-[#101415] border border-[#3c494c]/30 text-[#e0e3e5] leading-relaxed">
                {evaluation.matched_clause}
              </div>
            </div>
          )}

          {/* Extracted Evidence Citation Snippet */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-[#859397] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Bookmark className="h-3.5 w-3.5 text-cyan-400" />
                <span>DOCUMENT EVIDENCE CITATION (PAGE {evaluation.evidence_page || 1})</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-bold">{evaluation.evidence_section || 'Section Verified'}</span>
            </label>
            
            {evaluation.evidence_snippet ? (
              <div className="p-3.5 rounded-lg bg-[#162032] border border-cyan-500/30 text-cyan-100 italic leading-relaxed">
                "{evaluation.evidence_snippet}"
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[#101415] border border-[#3c494c]/30 text-[#859397] text-center">
                No text evidence snippet extracted for this rule. Status marked as missing evidence.
              </div>
            )}
          </div>

          {/* Supervisor Review Status & Action */}
          <div className="pt-2 border-t border-[#3c494c]/30 space-y-3">
            
            {evaluation.human_reviewed && !reviewMode && (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-1 text-emerald-200">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    SUPERVISOR AUDIT RECORDED
                  </span>
                  <span>Reviewed by: {evaluation.reviewed_by}</span>
                </div>
                {evaluation.review_notes && (
                  <p className="text-[11px] text-[#bbc9cd] italic">"{evaluation.review_notes}"</p>
                )}
              </div>
            )}

            {/* Interactive Review Form */}
            {reviewMode ? (
              <form onSubmit={handleSubmitReview} className="p-4 rounded-xl bg-[#101415] border border-cyan-500/40 space-y-3">
                <h4 className="text-xs font-bold text-cyan-300 font-sans">Supervisor Compliance Adjudication</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#859397] mb-1">REVIEWER NAME</label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-lg bg-[#162032] border border-[#3c494c]/40 text-xs text-[#e0e3e5] focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#859397] mb-1">STATUS OVERRIDE</label>
                    <select
                      value={statusOverride}
                      onChange={(e) => setStatusOverride(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#162032] border border-[#3c494c]/40 text-xs text-[#e0e3e5] focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="compliant">Compliant (Rule Match Verified)</option>
                      <option value="non_compliant">Non-Compliant (Deficiency Confirmed)</option>
                      <option value="needs_human_review">Needs Human Review (Pending Data)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[#859397] mb-1">SUPERVISOR AUDIT NOTES</label>
                  <textarea
                    rows={2}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    required
                    placeholder="Enter technical justification, verified clause details, or corrective action..."
                    className="w-full px-3 py-2 rounded-lg bg-[#162032] border border-[#3c494c]/40 text-xs text-[#e0e3e5] focus:border-cyan-400 focus:outline-none placeholder:text-[#859397]/50"
                  />
                </div>

                {errorMessage && (
                  <p className="text-rose-400 text-[10px]">{errorMessage}</p>
                )}
                {successMessage && (
                  <p className="text-emerald-400 text-[10px]">{successMessage}</p>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReviewMode(false)}
                    disabled={submitting}
                    className="px-3 py-1.5 rounded-md bg-[#191c1e] text-[#859397] hover:text-[#e0e3e5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-md bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black flex items-center gap-1.5"
                  >
                    {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                    <span>SAVE AUDIT DECISION</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setReviewMode(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1d2022] hover:bg-[#272a2c] text-cyan-300 border border-cyan-400/30 text-xs font-bold flex items-center gap-1.5"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>RECORD SUPERVISOR REVIEW</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-[#191c1e] text-[#bbc9cd] hover:text-[#e0e3e5] text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
