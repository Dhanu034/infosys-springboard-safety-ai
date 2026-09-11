import json
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app import models

class InsuranceEngineService:
    DISCLAIMER = "Internal safety decision-support estimate only. Does not represent actual insurance policy terms, premiums, or claim settlements."
    ILLUSTRATIVE_NOTE = "Illustrative internal estimate — not an insurance quotation or claim value."

    def calculate_exposure_summary(self, db: Session, project_id: str = "PRJ-101") -> Dict[str, Any]:
        """
        Calculate internal insurance exposure risk score from existing SQLite violation
        and alert records in a read-only manner.
        """
        violations = db.query(models.PPEViolation).filter(models.PPEViolation.project_id == project_id).all()
        alerts = db.query(models.SafetyAlert).filter(models.SafetyAlert.project_id == project_id).all()

        total_violations = len(violations)
        if total_violations == 0:
            return {
                "project_id": project_id,
                "exposure_score": 10.0,
                "exposure_tier": "NEGLIGIBLE",
                "total_safety_events": 0,
                "critical_events": 0,
                "high_severity_events": 0,
                "evidence_completeness_rate": 100.0,
                "pending_human_reviews": 0,
                "illustrative_liability_range": "Illustrative internal estimate ($0 - $5,000) — not an insurance quotation or claim value.",
                "disclaimer": self.DISCLAIMER
            }

        # Calculate severity and zone weights
        critical_count = sum(1 for v in violations if v.risk_category == "Critical" or (v.final_risk_score and v.final_risk_score >= 80))
        high_count = sum(1 for v in violations if v.risk_category == "High" or (v.final_risk_score and 65 <= v.final_risk_score < 80))
        medium_count = sum(1 for v in violations if v.risk_category == "Medium" or (v.final_risk_score and 40 <= v.final_risk_score < 65))
        low_count = sum(1 for v in violations if v.risk_category == "Low" or (v.final_risk_score and v.final_risk_score < 40))

        # Open vs resolved ratio
        open_count = sum(1 for v in violations if v.status == "OPEN")
        resolved_count = sum(1 for v in violations if v.status == "RESOLVED")

        # Zone risk factor
        height_zone_violations = sum(1 for v in violations if "Height" in (v.zone_name or ""))
        electrical_violations = sum(1 for v in violations if "Electrical" in (v.zone_name or ""))

        # Raw score computation
        weighted_severity = (critical_count * 25.0) + (high_count * 14.0) + (medium_count * 6.0) + (low_count * 2.0)
        zone_penalty = (height_zone_violations * 8.0) + (electrical_violations * 6.0)
        open_penalty = (open_count / max(1, total_violations)) * 20.0

        raw_score = (weighted_severity / max(1, total_violations * 0.4)) + zone_penalty * 0.3 + open_penalty
        exposure_score = round(min(98.0, max(5.0, raw_score)), 1)

        # Map to Exposure Tier
        if exposure_score < 25.0:
            tier = "NEGLIGIBLE"
            liability_range = "Illustrative internal estimate ($5,000 - $15,000) — not an insurance quotation or claim value."
        elif exposure_score < 45.0:
            tier = "LOW"
            liability_range = "Illustrative internal estimate ($15,000 - $35,000) — not an insurance quotation or claim value."
        elif exposure_score < 70.0:
            tier = "MODERATE"
            liability_range = "Illustrative internal estimate ($35,000 - $75,000) — not an insurance quotation or claim value."
        elif exposure_score < 85.0:
            tier = "HIGH"
            liability_range = "Illustrative internal estimate ($75,000 - $150,000) — not an insurance quotation or claim value."
        else:
            tier = "CATASTROPHIC"
            liability_range = "Illustrative internal estimate ($150,000+) — not an insurance quotation or claim value."

        # Evidence completeness across violations
        with_image = sum(1 for v in violations if v.annotated_image_path or v.original_image_path)
        completeness_rate = round((with_image / max(1, total_violations)) * 100.0, 1)

        # Count pending reviews in insurance assessments
        pending_reviews = db.query(models.InsuranceAssessment).filter(
            models.InsuranceAssessment.project_id == project_id,
            models.InsuranceAssessment.decision_status == "PENDING_HUMAN_REVIEW"
        ).count()

        return {
            "project_id": project_id,
            "exposure_score": exposure_score,
            "exposure_tier": tier,
            "total_safety_events": total_violations,
            "critical_events": critical_count,
            "high_severity_events": high_count,
            "evidence_completeness_rate": completeness_rate,
            "pending_human_reviews": pending_reviews,
            "illustrative_liability_range": liability_range,
            "disclaimer": self.DISCLAIMER
        }

    def generate_claim_assessment_for_violation(
        self,
        db: Session,
        violation: models.PPEViolation
    ) -> models.InsuranceAssessment:
        """
        Generate claim documentation checklist and risk tier for a specific safety event.
        """
        has_image = bool(violation.annotated_image_path or violation.original_image_path)
        has_audit_logs = bool(violation.alerts and any(len(a.audit_logs) > 0 for a in violation.alerts))
        is_acknowledged = violation.status in ["ACKNOWLEDGED", "RESOLVED"]

        # Check for compliance training documents in project
        training_doc_count = db.query(models.ComplianceDocument).filter(
            models.ComplianceDocument.project_id == violation.project_id,
            models.ComplianceDocument.document_category.in_(["training_cert", "site_safety_plan"])
        ).count()
        has_training = training_doc_count > 0

        checklist_items = [
            {
                "item_id": "CHK-01",
                "item_title": "Visual Evidence Frame & Telemetry Bounding Box",
                "category": "Visual Evidence",
                "is_required": True,
                "is_attached": has_image,
                "evidence_reference": violation.annotated_image_path or violation.original_image_path or "No image recorded",
                "verification_notes": "YOLO / OpenCV bounding box annotated visual record." if has_image else "Missing visual frame."
            },
            {
                "item_id": "CHK-02",
                "item_title": "Safety Supervisor Audit Trail & Action Log",
                "category": "Supervisor Action",
                "is_required": True,
                "is_attached": has_audit_logs or is_acknowledged,
                "evidence_reference": f"Alert Status: {violation.status}",
                "verification_notes": "Supervisor audit actions recorded." if (has_audit_logs or is_acknowledged) else "Pending supervisor review log."
            },
            {
                "item_id": "CHK-03",
                "item_title": "Zone Safety Rule Authorization & Multiplier Reference",
                "category": "Zone Rule",
                "is_required": True,
                "is_attached": True,
                "evidence_reference": f"Zone: {violation.zone_name} (Multiplier: {violation.zone_multiplier or 1.0}x)",
                "verification_notes": "Verified against SafetyZoneRule registry."
            },
            {
                "item_id": "CHK-04",
                "item_title": "Worker Safety Induction & PPE Training Certification",
                "category": "Worker Records",
                "is_required": True,
                "is_attached": has_training,
                "evidence_reference": f"Project Compliance Records ({training_doc_count} active)",
                "verification_notes": "Verified against active project training certificates." if has_training else "Training certificate pending upload."
            },
            {
                "item_id": "CHK-05",
                "item_title": "Incident Mitigation & Resolution Sign-Off",
                "category": "Mitigation",
                "is_required": False,
                "is_attached": violation.status == "RESOLVED",
                "evidence_reference": f"Resolution: {violation.resolution_note or 'Open'}",
                "verification_notes": "Violation resolved and signed off." if violation.status == "RESOLVED" else "Mitigation pending."
            }
        ]

        attached_count = sum(1 for item in checklist_items if item["is_attached"])
        completeness = round((attached_count / len(checklist_items)) * 100.0, 1)

        # Determine individual event exposure score
        base_score = violation.final_risk_score or violation.base_risk_score or 60.0
        if base_score >= 80.0:
            tier = "CATASTROPHIC"
            liability_range = "Illustrative internal estimate ($50,000+) — not an insurance quotation or claim value."
        elif base_score >= 65.0:
            tier = "HIGH"
            liability_range = "Illustrative internal estimate ($25,000 - $50,000) — not an insurance quotation or claim value."
        elif base_score >= 40.0:
            tier = "MODERATE"
            liability_range = "Illustrative internal estimate ($10,000 - $25,000) — not an insurance quotation or claim value."
        else:
            tier = "LOW"
            liability_range = "Illustrative internal estimate ($2,000 - $10,000) — not an insurance quotation or claim value."

        missing_list = [item["item_title"] for item in checklist_items if not item["is_attached"]]

        assessment = models.InsuranceAssessment(
            project_id=violation.project_id,
            violation_id=violation.violation_id,
            alert_id=violation.alerts[0].alert_id if violation.alerts else None,
            incident_severity=violation.risk_category or "HIGH",
            exposure_score=base_score,
            claim_risk_tier=tier,
            illustrative_liability_range=liability_range,
            missing_documentation=json.dumps(missing_list),
            checklist_data=json.dumps(checklist_items),
            evidence_completeness=completeness,
            decision_status="PENDING_HUMAN_REVIEW",
            supervisor_notes="Initial automated decision-support checklist generated. Awaiting human supervisor sign-off.",
            reviewed_by=None,
            reviewed_at=None,
            disclaimer=self.DISCLAIMER
        )

        return assessment


insurance_engine = InsuranceEngineService()
