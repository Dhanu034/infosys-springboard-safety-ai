from pydantic import BaseModel, Field
from typing import List, Optional
import datetime

# --- Insurance Exposure Schemas ---

class InsuranceExposureSummary(BaseModel):
    project_id: str
    exposure_score: float = Field(..., ge=0.0, le=100.0, description="Internal risk exposure score from 0 to 100")
    exposure_tier: str  # NEGLIGIBLE, LOW, MODERATE, HIGH, CATASTROPHIC
    total_safety_events: int
    critical_events: int
    high_severity_events: int
    evidence_completeness_rate: float
    pending_human_reviews: int
    illustrative_liability_range: str = "Illustrative internal estimate ($10,000 - $30,000) — not an insurance quotation or claim value."
    disclaimer: str = "Internal safety decision-support estimate only. Does not represent actual insurance policy terms, premiums, or claim settlements."

# --- Claim Assessment Schemas ---

class ClaimChecklistItem(BaseModel):
    item_id: str
    item_title: str
    category: str
    is_required: bool = True
    is_attached: bool = False
    evidence_reference: Optional[str] = None
    verification_notes: Optional[str] = None

class InsuranceClaimAssessmentResponse(BaseModel):
    assessment_id: str
    project_id: str
    violation_id: Optional[str] = None
    alert_id: Optional[str] = None
    incident_type: str
    zone_name: str
    detected_at: datetime.datetime
    incident_severity: str
    exposure_score: float
    claim_risk_tier: str
    illustrative_liability_range: str = "Illustrative internal estimate — not an insurance quotation or claim value."
    checklist: List[ClaimChecklistItem]
    evidence_completeness: float
    decision_status: str  # PENDING_HUMAN_REVIEW, APPROVED_FOR_FILING, REJECTED, DEFENSE_RECOMMENDED
    supervisor_notes: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    disclaimer: str = "Internal safety decision-support estimate only. Does not represent actual insurance policy terms, premiums, or claim settlements."

    class Config:
        from_attributes = True

class InsuranceClaimReviewRequest(BaseModel):
    reviewed_by: str = "Senior Safety Supervisor"
    decision_status: str = Field(..., description="APPROVED_FOR_FILING, REJECTED, DEFENSE_RECOMMENDED, PENDING_INVESTIGATION")
    supervisor_notes: str
    legal_counsel_sign_off: bool = False
