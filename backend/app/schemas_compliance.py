from pydantic import BaseModel, Field
from typing import List, Optional
import datetime

# --- Document Ingestion Schemas ---

class ComplianceDocumentBase(BaseModel):
    filename: str
    project_id: str = "PRJ-101"
    document_category: str = Field(
        ...,
        description="Category: site_safety_plan, equipment_cert, inspection_log, insurance_policy, permit_to_work, training_cert"
    )
    jurisdiction: str = "Configurable / Reference"

class ComplianceDocumentCreate(ComplianceDocumentBase):
    pass

class ComplianceDocumentResponse(BaseModel):
    doc_id: str
    project_id: str
    filename: str
    file_type: str
    document_category: str
    page_count: int
    extraction_method: str
    ocr_confidence: Optional[float] = None
    issuing_authority: Optional[str] = None
    issue_date: Optional[datetime.datetime] = None
    expiry_date: Optional[datetime.datetime] = None
    uploaded_at: datetime.datetime
    status: str
    extracted_text_preview: Optional[str] = None

    class Config:
        from_attributes = True

# --- Regulatory Reference Rules Schemas ---

class RegulatoryRuleBase(BaseModel):
    source_name: str
    standard_code: str
    jurisdiction: str = "Reference Standard"
    version_or_reference_date: Optional[str] = None
    category: str
    requirement_summary: str
    mandatory_keywords: Optional[str] = None
    penalty_severity: str = "HIGH"
    human_review_required: bool = True

class RegulatoryRuleCreate(RegulatoryRuleBase):
    pass

class RegulatoryRuleResponse(RegulatoryRuleBase):
    rule_id: str
    is_active: bool

    class Config:
        from_attributes = True

# --- Compliance Evaluation Schemas ---

class ComplianceEvaluationResponse(BaseModel):
    evaluation_id: str
    project_id: str
    doc_id: Optional[str] = None
    document_filename: Optional[str] = None
    rule_id: str
    standard_code: str
    source_name: str
    jurisdiction: str = "Reference Rule Match — Human Verification Required"
    category: str
    status: str  # compliant, non_compliant, missing_evidence, needs_human_review
    status_label: str  # Rule-based compliance indication, Non-compliant indication, Missing Evidence, Needs Human Review
    confidence: float
    matched_clause: Optional[str] = None
    evidence_snippet: Optional[str] = None
    evidence_page: Optional[int] = None
    evidence_section: Optional[str] = None
    extraction_method: str = "pypdf"
    evaluated_at: datetime.datetime
    human_reviewed: bool = False
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None
    disclaimer: str = "Reference Rule Match — Human Verification Required. Not a legal or regulatory certification."

    class Config:
        from_attributes = True

class ComplianceReviewRequest(BaseModel):
    reviewed_by: str = "Safety Supervisor"
    status_override: Optional[str] = None
    review_notes: str

# --- Inspection & Renewal Schedule Schemas ---

class InspectionScheduleBase(BaseModel):
    project_id: str = "PRJ-101"
    item_title: str
    category: str
    due_date: datetime.datetime
    frequency_days: int = 30
    assigned_inspector: Optional[str] = "Site Safety Engineer"

class InspectionScheduleCreate(InspectionScheduleBase):
    pass

class InspectionScheduleResponse(InspectionScheduleBase):
    schedule_id: str
    last_inspected_at: Optional[datetime.datetime] = None
    status: str  # UPCOMING, DUE_SOON, OVERDUE, COMPLETED
    days_until_due: int

    class Config:
        from_attributes = True

# --- Compliance Audit Report Schema ---

class ComplianceReportResponse(BaseModel):
    project_id: str
    generated_at: datetime.datetime
    total_documents_analyzed: int
    total_rules_evaluated: int
    compliance_rate: float
    status_breakdown: dict
    evaluations: List[ComplianceEvaluationResponse]
    upcoming_inspections: List[InspectionScheduleResponse]
    disclaimer: str = "Automated AI Assessment & Rule-Based Compliance Indication — Requires Qualified Safety Supervisor Review Before Legal Filing."
