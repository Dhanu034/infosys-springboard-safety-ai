import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class SafetyZoneRule(Base):
    __tablename__ = "safety_zone_rules"

    rule_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(50), nullable=True)
    zone_name = Column(String(100), nullable=False)
    requires_helmet = Column(Boolean, default=True)
    requires_vest = Column(Boolean, default=False)
    requires_harness = Column(Boolean, default=False)
    risk_multiplier = Column(Float, default=1.0)
    is_active = Column(Boolean, default=True)

class PPEViolation(Base):
    __tablename__ = "ppe_violations"

    violation_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(50), nullable=False, default="PRJ-101")
    zone_name = Column(String(100), nullable=False)
    camera_id = Column(String(50), nullable=True, default="CAM-01")
    anonymous_worker_id = Column(String(50), nullable=False, default="Worker-01")
    violation_type = Column(String(100), nullable=False) # missing_helmet, missing_safety_vest, missing_helmet_and_vest, needs_human_review, compliant
    
    required_ppe = Column(Text, nullable=True) # Comma-separated or JSON
    detected_ppe = Column(Text, nullable=True)
    missing_ppe = Column(Text, nullable=True)
    
    confidence_score = Column(Float, default=0.90)
    base_risk_score = Column(Float, default=60.0)
    zone_multiplier = Column(Float, default=1.0)
    final_risk_score = Column(Float, default=60.0)
    risk_category = Column(String(20), default="Medium") # Low, Medium, High, Critical
    decision_status = Column(String(50), default="confirmed_violation") # confirmed_violation, needs_human_review, compliant
    
    original_image_path = Column(String(255), nullable=True)
    annotated_image_path = Column(String(255), nullable=True)
    bounding_box_data = Column(Text, nullable=True) # JSON string
    
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(20), default="OPEN") # OPEN, ACKNOWLEDGED, RESOLVED
    
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(100), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_note = Column(Text, nullable=True)

    alerts = relationship("SafetyAlert", back_populates="violation", cascade="all, delete-orphan")

class SafetyAlert(Base):
    __tablename__ = "safety_alerts"

    alert_id = Column(String(36), primary_key=True, default=generate_uuid)
    violation_id = Column(String(36), ForeignKey("ppe_violations.violation_id"), nullable=True)
    project_id = Column(String(50), nullable=False, default="PRJ-101")
    severity = Column(String(20), nullable=False, default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    risk_score = Column(Float, default=60.0)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="OPEN") # OPEN, ACKNOWLEDGED, RESOLVED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    automation_status = Column(String(50), default="Not Configured") # Not Configured, Not Required, Logged, Supervisor Notified, Urgent Review Required, Failed
    automation_attempted_at = Column(DateTime, nullable=True)
    automation_response_code = Column(Integer, nullable=True)
    automation_response_message = Column(Text, nullable=True)
    automation_last_error = Column(Text, nullable=True)
    delivery_channel = Column(String(50), nullable=True, default="None") # Email, Slack, Teams, None

    violation = relationship("PPEViolation", back_populates="alerts")
    audit_logs = relationship("SafetyAuditLog", back_populates="alert", cascade="all, delete-orphan")

class SafetyAuditLog(Base):
    __tablename__ = "safety_audit_logs"

    audit_id = Column(String(36), primary_key=True, default=generate_uuid)
    alert_id = Column(String(36), ForeignKey("safety_alerts.alert_id"), nullable=False)
    action = Column(String(50), nullable=False) # CREATE, ACKNOWLEDGE, RESOLVE
    user_reference = Column(String(100), nullable=False, default="Safety Supervisor")
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    alert = relationship("SafetyAlert", back_populates="audit_logs")


# =====================================================================
# Milestone 3: Compliance & Regulatory Intelligence Models
# =====================================================================

class ComplianceDocument(Base):
    __tablename__ = "compliance_documents"

    doc_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(50), nullable=False, default="PRJ-101")
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(20), nullable=False) # pdf, scanned_pdf, image
    document_category = Column(String(100), nullable=False) # site_safety_plan, equipment_cert, inspection_log, insurance_policy, permit_to_work, training_cert
    extracted_text = Column(Text, nullable=True)
    page_count = Column(Integer, default=1)
    extraction_method = Column(String(50), default="pypdf") # pypdf, pytesseract_ocr, ocr_unavailable, manual
    ocr_confidence = Column(Float, nullable=True)
    issuing_authority = Column(String(150), nullable=True)
    issue_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), default="PROCESSED") # PROCESSED, NEEDS_HUMAN_REVIEW, EXTRACTION_FAILED
    review_notes = Column(Text, nullable=True)

    evaluations = relationship("ComplianceEvaluation", back_populates="document", cascade="all, delete-orphan")


class RegulatoryRule(Base):
    __tablename__ = "regulatory_rules"

    rule_id = Column(String(36), primary_key=True, default=generate_uuid)
    source_name = Column(String(150), nullable=False) # e.g. "BOCW Central Rules 1998", "OSHA 1926 Safety and Health Regulations", "ISO 45001"
    standard_code = Column(String(100), nullable=False) # e.g. "BOCW-R231", "OSHA 1926.100(a)", "ISO 45001:2018-6.1"
    jurisdiction = Column(String(100), nullable=False, default="Reference Standard") # India — Central (BOCW), US — OSHA, International
    version_or_reference_date = Column(String(50), nullable=True, default="2026 Reference Edition")
    category = Column(String(100), nullable=False) # Head Protection, Fall Protection, Scaffold Safety, Electrical Safety
    title = Column(String(255), nullable=False)
    requirement_summary = Column(Text, nullable=False)
    mandatory_keywords = Column(Text, nullable=True) # JSON array of keyword triggers
    penalty_severity = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    human_review_required = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)

    evaluations = relationship("ComplianceEvaluation", back_populates="rule", cascade="all, delete-orphan")


class ComplianceEvaluation(Base):
    __tablename__ = "compliance_evaluations"

    evaluation_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(50), nullable=False, default="PRJ-101")
    doc_id = Column(String(36), ForeignKey("compliance_documents.doc_id"), nullable=True)
    rule_id = Column(String(36), ForeignKey("regulatory_rules.rule_id"), nullable=False)
    
    # 4 distinct statuses: compliant, non_compliant, missing_evidence, needs_human_review
    status = Column(String(50), nullable=False, default="needs_human_review")
    status_label = Column(String(100), default="Rule-based compliance indication")
    confidence = Column(Float, default=0.85)
    matched_clause = Column(Text, nullable=True)
    evidence_snippet = Column(Text, nullable=True)
    evidence_page = Column(Integer, nullable=True)
    evidence_section = Column(String(100), nullable=True)
    extraction_method = Column(String(50), default="pypdf")
    
    evaluated_at = Column(DateTime, default=datetime.datetime.utcnow)
    human_reviewed = Column(Boolean, default=False)
    reviewed_by = Column(String(100), nullable=True)
    review_notes = Column(Text, nullable=True)
    disclaimer = Column(String(255), default="Reference Rule Match — Human Verification Required. Not a legal or regulatory certification.")

    document = relationship("ComplianceDocument", back_populates="evaluations")
    rule = relationship("RegulatoryRule", back_populates="evaluations")


class InspectionSchedule(Base):
    __tablename__ = "inspection_schedules"

    schedule_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(50), nullable=False, default="PRJ-101")
    item_title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # Equipment, Site Audit, Worker Certification, Fire Safety
    due_date = Column(DateTime, nullable=False)
    frequency_days = Column(Integer, default=30)
    assigned_inspector = Column(String(100), default="Site Safety Engineer")
    last_inspected_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="UPCOMING") # UPCOMING, DUE_SOON, OVERDUE, COMPLETED


# =====================================================================
# Milestone 3: Insurance & Claim Intelligence Models
# =====================================================================

class InsuranceAssessment(Base):
    __tablename__ = "insurance_assessments"

    assessment_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(50), nullable=False, default="PRJ-101")
    violation_id = Column(String(36), ForeignKey("ppe_violations.violation_id"), nullable=True)
    alert_id = Column(String(36), ForeignKey("safety_alerts.alert_id"), nullable=True)
    
    incident_severity = Column(String(20), nullable=False, default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    exposure_score = Column(Float, default=50.0) # 0.0 to 100.0
    claim_risk_tier = Column(String(50), default="MODERATE") # NEGLIGIBLE, LOW, MODERATE, HIGH, CATASTROPHIC
    illustrative_liability_range = Column(String(200), default="Illustrative internal estimate ($10,000 - $25,000) — not an insurance quotation or claim value.")
    
    missing_documentation = Column(Text, nullable=True) # JSON checklist string
    checklist_data = Column(Text, nullable=True) # JSON string of all checklist items with status
    evidence_completeness = Column(Float, default=75.0) # percentage
    
    decision_status = Column(String(50), default="PENDING_HUMAN_REVIEW") # PENDING_HUMAN_REVIEW, APPROVED_FOR_FILING, REJECTED, DEFENSE_RECOMMENDED
    supervisor_notes = Column(Text, nullable=True)
    reviewed_by = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    disclaimer = Column(String(255), default="Internal safety decision-support estimate only. Does not represent actual insurance policy terms, premiums, or claim settlements.")

