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
