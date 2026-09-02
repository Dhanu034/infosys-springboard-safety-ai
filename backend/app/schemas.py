from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class HealthCheckResponse(BaseModel):
    status: str
    database_status: str
    yolo_model_status: str
    model_path: str
    configured_confidence_threshold: float

class ZoneRuleSchema(BaseModel):
    rule_id: str
    zone_name: str
    requires_helmet: bool
    requires_vest: bool
    requires_harness: bool
    risk_multiplier: float
    is_active: bool

    class Config:
        from_attributes = True

class AlertAcknowledgeRequest(BaseModel):
    acknowledged_by: str = Field(default="Safety Supervisor")
    note: Optional[str] = None

class AlertResolveRequest(BaseModel):
    resolved_by: str = Field(default="Safety Supervisor")
    resolution_note: str

class AuditLogSchema(BaseModel):
    audit_id: str
    alert_id: str
    action: str
    user_reference: str
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class N8NStatusUpdateRequest(BaseModel):
    automation_status: str # Logged | Supervisor Notified | Urgent Review Required | Failed
    delivery_channel: Optional[str] = "None" # Email | Slack | Teams | None
    message: Optional[str] = None

class SafetyAlertSchema(BaseModel):
    alert_id: str
    violation_id: Optional[str]
    project_id: str
    severity: str
    risk_score: float
    title: str
    message: str
    status: str
    created_at: datetime
    automation_status: str = "Not Configured"
    automation_attempted_at: Optional[datetime] = None
    automation_response_code: Optional[int] = None
    automation_response_message: Optional[str] = None
    automation_last_error: Optional[str] = None
    delivery_channel: Optional[str] = "None"
    evidence_image_url: Optional[str] = None
    audit_logs: List[AuditLogSchema] = []

    class Config:
        from_attributes = True

class PPEViolationSchema(BaseModel):
    violation_id: str
    project_id: str
    zone_name: str
    camera_id: Optional[str]
    anonymous_worker_id: str
    violation_type: str
    required_ppe: Optional[str]
    detected_ppe: Optional[str]
    missing_ppe: Optional[str]
    confidence_score: float
    base_risk_score: float
    zone_multiplier: float
    final_risk_score: float
    risk_category: str
    decision_status: str
    original_image_path: Optional[str]
    annotated_image_path: Optional[str]
    bounding_box_data: Optional[str]
    detected_at: datetime
    status: str
    recommendation: Optional[str] = None

    class Config:
        from_attributes = True

class SafetyAnalysisResponse(BaseModel):
    analysis_id: str
    project_id: str
    zone_name: str
    total_workers_detected: int
    compliant_workers_count: int
    violations_detected_count: int
    overall_safety_score: float
    risk_category: str
    processing_time_ms: float
    model_confidence_threshold: float
    original_image_url: str
    annotated_image_url: str
    workers_compliance: List[dict]
    violations: List[dict]
    recommendations: List[str]
    disclaimer: str = "AI detections are decision-support signals and require safety supervisor verification."

class SafetySummaryResponse(BaseModel):
    total_workers_monitored: int
    helmet_compliance_rate: float
    vest_compliance_rate: float
    overall_ppe_compliance_rate: float
    open_violations: int
    critical_violations: int
    safety_score: float
    violations_by_type: dict
    violations_by_zone: dict
    alert_status_distribution: dict
    daily_trend_data: List[dict]
    recent_violations: List[PPEViolationSchema]
