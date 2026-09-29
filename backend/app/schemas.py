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

class ModelInfoResponse(BaseModel):
    model_name: str
    model_path: str
    model_size_mb: str
    classes: List[str]
    inference_mode: str
    fallback: str

class SafetyAnalysisResponse(BaseModel):
    model_name: Optional[str] = "Hansung-Cho/yolov8-ppe-detection"
    detections: Optional[List[dict]] = []
    violations: List[dict] = []
    zone_name: str
    annotated_image: Optional[str] = None
    annotated_image_url: str
    original_image_url: str
    human_review_required: bool = False
    analysis_id: str
    project_id: str
    total_workers_detected: int
    compliant_workers_count: int
    violations_detected_count: int
    overall_safety_score: float
    risk_category: str
    processing_time_ms: float
    model_confidence_threshold: float
    workers_compliance: List[dict]
    recommendations: List[str]
    disclaimer: str = "AI detections are decision-support signals and require safety supervisor verification."

class SafetySummaryResponse(BaseModel):
    project_id: str
    has_data: bool = False
    total_workers_monitored: int = 0
    helmet_compliance_rate: Optional[float] = None
    vest_compliance_rate: Optional[float] = None
    overall_ppe_compliance_rate: Optional[float] = None
    open_violations: int = 0
    critical_violations: int = 0
    safety_score: Optional[float] = None
    violations_by_type: dict = {}
    violations_by_zone: dict = {}
    alert_status_distribution: dict = {}
    daily_trend_data: List[dict] = []
    recent_violations: List[PPEViolationSchema] = []

# =====================================================================
# Post-M4 Enhancement: Offline Video Safety Analysis Schemas
# =====================================================================

class VideoMetadataSchema(BaseModel):
    fps: float
    duration_seconds: float
    total_frames: int
    sampled_frames: int
    resolution: Optional[str] = None
    file_size_mb: Optional[float] = None

class VideoSummarySchema(BaseModel):
    persons_detected: int = 0
    helmet_violation_incidents: int = 0
    vest_violation_incidents: int = 0
    highest_risk_score: Optional[float] = None
    critical_incidents: int = 0
    needs_human_review: int = 0

class GroupedIncidentSchema(BaseModel):
    incident_id: str
    violation_type: str
    start_timestamp_seconds: float
    end_timestamp_seconds: float
    start_frame: Optional[int] = None
    end_frame: Optional[int] = None
    occurrences_count: int = 1
    peak_risk_score: float
    max_confidence: float
    status: str = "OPEN"
    risk_category: str = "Medium"
    evidence_frame_reference: Optional[str] = None
    needs_human_review: bool = False
    recommendation: Optional[str] = None
    required_ppe: Optional[str] = None
    missing_ppe: Optional[str] = None
    detected_ppe: Optional[str] = None
    bounding_box: Optional[List[int]] = None

class KeyframeEvidenceSchema(BaseModel):
    frame_number: int
    timestamp_seconds: float
    image_url: str
    persons_detected: int
    violations_count: int
    decision_status: str

class VideoSafetyAnalysisResponse(BaseModel):
    analysis_id: str
    project_id: str
    zone: str
    status: str = "COMPLETED"
    mode: str = "OFFLINE_VIDEO_ANALYSIS"
    metadata: VideoMetadataSchema
    summary: VideoSummarySchema
    grouped_incidents: List[GroupedIncidentSchema] = []
    annotated_video_url: Optional[str] = None
    keyframe_evidence: List[KeyframeEvidenceSchema] = []
    message: str
    disclaimer: str = "Offline video analysis is advisory decision support. It is not live CCTV monitoring and requires supervisor review."

