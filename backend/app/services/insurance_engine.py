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
        Generate claim documentation checklist and risk tier for a specific safety event
        using real database records and project-linked compliance documents.
        """
        # 1. Visual Evidence Check (CHK-01)
        has_image = bool(violation.annotated_image_path or violation.original_image_path)
        img_path = violation.annotated_image_path or violation.original_image_path
        chk01_item = {
            "item_id": "CHK-01",
            "code": "CHK-01",
            "item_title": "Visual Evidence Frame & Telemetry Bounding Box",
            "title": "Visual Evidence Frame & Telemetry Bounding Box",
            "category": "Visual Evidence",
            "is_required": True,
            "is_attached": has_image,
            "available": has_image,
            "source": "ppe_violations",
            "source_table": "ppe_violations",
            "linked_record_id": violation.violation_id,
            "document_id": None,
            "evidence_page": None,
            "evidence_section": None,
            "evidence_snippet": None,
            "evidence_reference": img_path or "No image recorded",
            "verification_notes": f"YOLO bounding box annotated visual record (Worker: {violation.anonymous_worker_id}, Conf: {int((violation.confidence_score or 0.9)*100)}%)." if has_image else "Missing visual frame in database.",
            "review_required": True
        }

        # 2. Supervisor Audit Trail & Action Log Check (CHK-02)
        audit_log_record = None
        if violation.alerts:
            for alert in violation.alerts:
                if alert.audit_logs:
                    audit_log_record = alert.audit_logs[0]
                    break

        is_acknowledged = bool(violation.status in ["ACKNOWLEDGED", "RESOLVED"] or violation.acknowledged_by)
        has_audit = bool(audit_log_record or is_acknowledged)

        if audit_log_record:
            chk02_notes = f"Supervisor action verified: {audit_log_record.action} by {audit_log_record.user_reference} - {audit_log_record.note or 'Confirmed'}"
            chk02_ref = f"Audit Log ID: {audit_log_record.audit_id[:8]} ({audit_log_record.action})"
            chk02_source = "safety_audit_logs"
            chk02_record_id = audit_log_record.audit_id
        elif is_acknowledged:
            chk02_notes = f"Acknowledged by {violation.acknowledged_by or 'Safety Supervisor'} (Status: {violation.status})."
            chk02_ref = f"Acknowledged by {violation.acknowledged_by or 'Supervisor'}"
            chk02_source = "ppe_violations"
            chk02_record_id = violation.violation_id
        else:
            chk02_notes = "Pending supervisor review log in safety audit trail."
            chk02_ref = f"Alert Status: {violation.status}"
            chk02_source = "safety_alerts"
            chk02_record_id = violation.alerts[0].alert_id if violation.alerts else violation.violation_id

        chk02_item = {
            "item_id": "CHK-02",
            "code": "CHK-02",
            "item_title": "Safety Supervisor Audit Trail & Action Log",
            "title": "Safety Supervisor Audit Trail & Action Log",
            "category": "Supervisor Action",
            "is_required": True,
            "is_attached": has_audit,
            "available": has_audit,
            "source": chk02_source,
            "source_table": chk02_source,
            "linked_record_id": chk02_record_id,
            "document_id": None,
            "evidence_page": None,
            "evidence_section": None,
            "evidence_snippet": None,
            "evidence_reference": chk02_ref,
            "verification_notes": chk02_notes,
            "review_required": True
        }

        # 3. Zone Safety Rule Authorization Check (CHK-03)
        zone_rule = db.query(models.SafetyZoneRule).filter(
            models.SafetyZoneRule.zone_name == violation.zone_name
        ).first()

        if zone_rule:
            chk03_attached = True
            chk03_source = "safety_zone_rules"
            chk03_record_id = zone_rule.rule_id
            chk03_ref = f"Zone: {zone_rule.zone_name} (Multiplier: {zone_rule.risk_multiplier}x)"
            reqs = []
            if zone_rule.requires_helmet: reqs.append("Helmet")
            if zone_rule.requires_vest: reqs.append("Vest")
            if zone_rule.requires_harness: reqs.append("Harness")
            chk03_notes = f"Verified against SafetyZoneRule (Required PPE: {', '.join(reqs) if reqs else 'Standard'})."
        else:
            chk03_attached = False
            chk03_source = "safety_zone_rules"
            chk03_record_id = None
            chk03_ref = f"Zone: {violation.zone_name} (Unregistered)"
            chk03_notes = f"No zone configuration rule found for '{violation.zone_name}'."

        chk03_item = {
            "item_id": "CHK-03",
            "code": "CHK-03",
            "item_title": "Zone Safety Rule Authorization & Multiplier Reference",
            "title": "Zone Safety Rule Authorization & Multiplier Reference",
            "category": "Zone Rule",
            "is_required": True,
            "is_attached": chk03_attached,
            "available": chk03_attached,
            "source": chk03_source,
            "source_table": "safety_zone_rules",
            "linked_record_id": chk03_record_id,
            "document_id": None,
            "evidence_page": None,
            "evidence_section": None,
            "evidence_snippet": None,
            "evidence_reference": chk03_ref,
            "verification_notes": chk03_notes,
            "review_required": True
        }

        # 4. Worker Safety Induction & Compliance Plan Reference (CHK-04)
        # Query compliance documents strictly for this violation's project_id
        project_docs = db.query(models.ComplianceDocument).filter(
            models.ComplianceDocument.project_id == violation.project_id
        ).order_by(models.ComplianceDocument.uploaded_at.desc()).all()

        matched_doc = None
        matched_eval = None

        if project_docs:
            # Pass 1: Look for a document with valid positive evidence matching the violation or PPE policy
            for p_doc in project_docs:
                doc_cat = (p_doc.document_category or "").lower()
                for ev in p_doc.evaluations:
                    if ev.status not in ["compliant", "needs_human_review"]:
                        continue
                    if not ev.evidence_snippet or ev.evidence_snippet.startswith("Document does not mention"):
                        continue
                    cat_lower = (ev.rule.category if (ev.rule and ev.rule.category) else "").lower()
                    vt_lower = (violation.violation_type or "").lower()
                    if ("helmet" in vt_lower or "vest" in vt_lower) and ("head" in cat_lower or "ppe" in cat_lower or "vest" in cat_lower):
                        matched_doc = p_doc
                        matched_eval = ev
                        break
                    elif "height" in (violation.zone_name or "").lower() and ("fall" in cat_lower or "height" in cat_lower or "scaffold" in cat_lower):
                        matched_doc = p_doc
                        matched_eval = ev
                        break
                if matched_doc:
                    break

            # Pass 2: Look for any site_safety_plan or training_cert document for this project
            if not matched_doc:
                for p_doc in project_docs:
                    doc_cat = (p_doc.document_category or "").lower()
                    if "site_safety" in doc_cat or "training" in doc_cat or "safety" in doc_cat:
                        matched_doc = p_doc
                        for ev in p_doc.evaluations:
                            if ev.status in ["compliant", "needs_human_review"] and ev.evidence_snippet and not ev.evidence_snippet.startswith("Document does not mention"):
                                matched_eval = ev
                                break
                        if not matched_eval and p_doc.evaluations:
                            matched_eval = p_doc.evaluations[0]
                        break

            # Pass 3: Fallback to the latest project document
            if not matched_doc:
                matched_doc = project_docs[0]
                if matched_doc.evaluations:
                    matched_eval = matched_doc.evaluations[0]

        if matched_doc:
            chk04_attached = True
            chk04_source = matched_doc.filename
            chk04_doc_id = matched_doc.doc_id
            chk04_record_id = matched_eval.evaluation_id if matched_eval else matched_doc.doc_id
            chk04_page = matched_eval.evidence_page if matched_eval else 1
            chk04_section = matched_eval.evidence_section if matched_eval else "General Site Plan"
            chk04_snippet = matched_eval.evidence_snippet if matched_eval else (matched_doc.extracted_text or "")[:250]
            chk04_ref = f"Doc: {matched_doc.filename} (Page {chk04_page})"
            chk04_notes = f"Verified against compliance document '{matched_doc.filename}' ({matched_doc.document_category})."
        else:
            chk04_attached = False
            chk04_source = None
            chk04_doc_id = None
            chk04_record_id = None
            chk04_page = None
            chk04_section = None
            chk04_snippet = None
            chk04_ref = f"No compliance documents for Project {violation.project_id}"
            chk04_notes = f"No compliance plan or training record registered for {violation.project_id}."

        chk04_item = {
            "item_id": "CHK-04",
            "code": "CHK-04",
            "item_title": "Worker Safety Induction & Compliance Plan Reference",
            "title": "Worker Safety Induction & Compliance Plan Reference",
            "category": "Worker Records",
            "is_required": True,
            "is_attached": chk04_attached,
            "available": chk04_attached,
            "source": chk04_source,
            "source_table": "compliance_documents" if matched_doc else None,
            "linked_record_id": chk04_record_id,
            "document_id": chk04_doc_id,
            "evidence_page": chk04_page,
            "evidence_section": chk04_section,
            "evidence_snippet": chk04_snippet,
            "evidence_reference": chk04_ref,
            "verification_notes": chk04_notes,
            "review_required": True
        }

        # 5. Incident Mitigation & Resolution Sign-Off (CHK-05)
        is_resolved = (violation.status == "RESOLVED")
        if is_resolved:
            chk05_notes = f"Violation resolved by {violation.resolved_by or 'Supervisor'}: {violation.resolution_note or 'Resolution complete'}"
            chk05_ref = f"Resolved: {violation.resolution_note or 'Approved closure'}"
        else:
            chk05_notes = "Mitigation action and supervisor resolution pending."
            chk05_ref = f"Status: {violation.status}"

        chk05_item = {
            "item_id": "CHK-05",
            "code": "CHK-05",
            "item_title": "Incident Mitigation & Resolution Sign-Off",
            "title": "Incident Mitigation & Resolution Sign-Off",
            "category": "Mitigation",
            "is_required": False,
            "is_attached": is_resolved,
            "available": is_resolved,
            "source": "ppe_violations",
            "source_table": "ppe_violations",
            "linked_record_id": violation.violation_id,
            "document_id": None,
            "evidence_page": None,
            "evidence_section": None,
            "evidence_snippet": None,
            "evidence_reference": chk05_ref,
            "verification_notes": chk05_notes,
            "review_required": True
        }

        checklist_items = [chk01_item, chk02_item, chk03_item, chk04_item, chk05_item]

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

