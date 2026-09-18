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
    code: Optional[str] = None  # CHK-01, CHK-02, etc.
    item_title: str
    title: Optional[str] = None  # alias for item_title
    category: str
    is_required: bool = True
    is_attached: bool = False
    available: Optional[bool] = None  # alias for is_attached
    evidence_reference: Optional[str] = None
    verification_notes: Optional[str] = None
    source: Optional[str] = None  # e.g. "ppe_violations", "BuildSure_Safety_Manual_PRJ-101.pdf"
    source_table: Optional[str] = None  # e.g. "ppe_violations", "safety_audit_logs", "safety_zone_rules", "compliance_documents"
    linked_record_id: Optional[str] = None  # violation_id, audit_id, rule_id, doc_id
    document_id: Optional[str] = None
    evidence_page: Optional[int] = None
    evidence_section: Optional[str] = None
    evidence_snippet: Optional[str] = None
    review_required: bool = True

    def __init__(self, **data):
        if 'item_id' in data and 'code' not in data:
            data['code'] = data['item_id']
        if 'item_title' in data and 'title' not in data:
            data['title'] = data['item_title']
        if 'is_attached' in data and 'available' not in data:
            data['available'] = data['is_attached']
        super().__init__(**data)

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
