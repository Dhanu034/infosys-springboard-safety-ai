import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  FileSpreadsheet, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  AlertTriangle,
  Scale
} from 'lucide-react';
import { submitClaimHumanReview } from '../../services/api';

const DECISION_STATUS_OPTIONS = [
  { id: 'PENDING_HUMAN_REVIEW', label: 'Pending Human Review' },
  { id: 'APPROVED_FOR_FILING', label: 'Approved for Filing (Internal Workflow Only)' },
  { id: 'REJECTED', label: 'Rejected / Non-Actionable' },
  { id: 'DEFENSE_RECOMMENDED', label: 'Defense Recommended / Disputed' },
  { id: 'PENDING_INVESTIGATION', label: 'Pending Further Site Investigation' }
];

export default function ClaimReviewModal({ isOpen, claim, onClose, onReviewSuccess }) {
  if (!isOpen || !claim) return null;

  const [reviewerName, setReviewerName] = useState(claim.reviewed_by || "Senior Risk Engineer — Johnson");
  const [decisionStatus, setDecisionStatus] = useState(claim.decision_status || 'APPROVED_FOR_FILING');
  const [supervisorNotes, setSupervisorNotes] = useState(claim.supervisor_notes || "");
  const [legalCounselSignOff, setLegalCounselSignOff] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !supervisorNotes.trim() || submitting) {
      setErrorMessage("Reviewer identity and detailed supervisor notes are mandatory.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const result = await submitClaimHumanReview(
        claim.assessment_id,
        reviewerName.trim(),
        decisionStatus,
        supervisorNotes.trim(),
        legalCounselSignOff
      );

      setSuccessMessage("Claim workflow decision successfully recorded.");
      if (onReviewSuccess) {
        onReviewSuccess(result);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage(err.message || "Failed to submit supervisor claim review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#162032] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden glow-amber flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3c494c]/30 flex items-center justify-between bg-[#101415]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-400/30 text-amber-300">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#e0e3e5] font-sans">Claim Adjudication & Supervisor Review</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-400/30">
                  {claim.claim_risk_tier}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#859397]">
                INCIDENT: {claim.incident_type} in {claim.zone_name}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-[#859397] hover:text-[#e0e3e5] hover:bg-[#1d2022] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs font-mono">
          
          {/* Mandatory Disclaimers */}
          <div className="p-3.5 rounded-xl bg-[#101415] border border-amber-500/30 text-[#ffdcc3] text-[11px] space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Internal Safety Decision-Support Estimate Only</span>
            </div>
            <p className="text-[#bbc9cd]">
              Does not represent actual insurance policy terms, premiums, or claim settlements.
            </p>
            <p className="text-[10px] text-[#859397] italic pt-1 border-t border-[#3c494c]/20">
              Illustrative internal estimate — not an insurance quotation or claim value.
            </p>
          </div>

          {/* Incident Assessment Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-[#101415]/70 border border-[#3c494c]/30 text-[#bbc9cd]">
            <div>
              <span className="text-[#859397] block text-[10px]">SEVERITY</span>
              <span className="text-rose-400 font-bold">{claim.incident_severity}</span>
            </div>
            <div>
              <span className="text-[#859397] block text-[10px]">EXPOSURE SCORE</span>
              <span className="text-amber-300 font-bold">{claim.exposure_score} / 100</span>
            </div>
            <div>
              <span className="text-[#859397] block text-[10px]">EVIDENCE COMPLETENESS</span>
              <span className="text-emerald-400 font-bold">{claim.evidence_completeness}%</span>
            </div>
            <div>
              <span className="text-[#859397] block text-[10px]">CURRENT STATUS</span>
              <span className="text-cyan-300 font-bold truncate block">{claim.decision_status}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#bbc9cd] mb-1 font-sans">
                  Supervisor / Auditor Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                  placeholder="e.g. Senior Risk Engineer — M. Johnson"
                  disabled={submitting}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#101415] border border-[#3c494c]/40 text-xs text-[#e0e3e5] focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#bbc9cd] mb-1 font-sans">
                  Adjudication Decision Status <span className="text-rose-400">*</span>
                </label>
                <select
                  value={decisionStatus}
                  onChange={(e) => setDecisionStatus(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#101415] border border-[#3c494c]/40 text-xs text-[#e0e3e5] focus:border-cyan-400 focus:outline-none"
                >
                  {DECISION_STATUS_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Supervisor Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#bbc9cd] mb-1 font-sans">
                Supervisor Audit & Mitigation Notes <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={supervisorNotes}
                onChange={(e) => setSupervisorNotes(e.target.value)}
                required
                placeholder="Enter supervisor findings, witness logs, CCTV evidence verification, and mitigation steps..."
                disabled={submitting}
                className="w-full px-3.5 py-2 rounded-lg bg-[#101415] border border-[#3c494c]/40 text-xs text-[#e0e3e5] focus:border-cyan-400 focus:outline-none placeholder:text-[#859397]/50"
              />
            </div>

            {/* Legal Counsel Sign-off Field */}
            <div className="p-3 rounded-lg bg-[#101415] border border-[#3c494c]/30 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={legalCounselSignOff}
                  onChange={(e) => setLegalCounselSignOff(e.target.checked)}
                  disabled={submitting}
                  className="mt-0.5 rounded border-[#3c494c] bg-[#162032] text-cyan-400 focus:ring-0"
                />
                <div>
                  <span className="text-xs font-semibold text-[#e0e3e5] font-sans">
                    Legal Counsel Review & Sign-Off (Optional Policy Gate)
                  </span>
                  <p className="text-[10px] text-[#859397] mt-0.5">
                    Check only if external or in-house legal counsel has reviewed the incident dossier.
                  </p>
                </div>
              </label>

              <div className="pt-1 border-t border-[#3c494c]/20 text-[10px] text-[#859397] flex items-center justify-between">
                <span>
                  Legal counsel sign-off: {legalCounselSignOff ? "Provided & Attached." : "Not provided."}
                </span>
                <span className="italic text-amber-400/80">
                  Internal supervisor workflow — not legal approval.
                </span>
              </div>
            </div>

            {/* Error / Success Feedback */}
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-[#191c1e] text-[#bbc9cd] hover:text-[#e0e3e5] text-xs font-mono font-semibold"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 text-xs font-mono font-black flex items-center gap-2 shadow-md glow-amber transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>SAVING REVIEW...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>SAVE SUPERVISOR ADJUDICATION</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
