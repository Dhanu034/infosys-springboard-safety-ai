import json
import datetime
import requests
from sqlalchemy.orm import Session

from app.config import settings
from app import models

class N8NDispatcher:
    """
    BuildSure AI — n8n Automation Webhook Dispatcher
    Dispatches High and Critical PPE violation alerts to the configured n8n workflow.
    Guarantees non-blocking and fail-safe execution: failures in automation will not
    interrupt core image analysis or dashboard updates.
    """

    def dispatch_alert(
        self,
        alert: models.SafetyAlert,
        violation: models.PPEViolation,
        db: Session,
        recommendation: str = ""
    ) -> dict:
        """
        Dispatches a single alert to n8n if risk threshold (final_risk_score >= 61 or High/Critical) is met.
        Updates database alert record and adds an audit log entry on completion or failure.
        """
        risk_score = float(alert.risk_score or 0.0)
        severity_upper = (alert.severity or "").upper()
        is_high_or_critical = risk_score >= 61.0 or severity_upper in ["HIGH", "CRITICAL"]

        # 1. Check if automation is required
        if not is_high_or_critical:
            alert.automation_status = "Not Required"
            db.commit()
            return {
                "success": True,
                "status": "Not Required",
                "message": f"Automation not required for risk score {risk_score} (< 61)."
            }

        # 2. Check if n8n webhook URL is configured
        webhook_url = settings.N8N_SAFETY_WEBHOOK_URL.strip() if settings.N8N_SAFETY_WEBHOOK_URL else ""
        if not webhook_url:
            alert.automation_status = "Not Configured"
            alert.automation_last_error = "N8N_SAFETY_WEBHOOK_URL environment variable is not configured."
            db.commit()
            return {
                "success": False,
                "status": "Not Configured",
                "message": "N8N_SAFETY_WEBHOOK_URL is not set in environment."
            }

        # 3. Format Webhook Payload
        detected_at_iso = violation.detected_at.isoformat() if violation and violation.detected_at else datetime.datetime.utcnow().isoformat()
        
        # Build absolute image URL for evidence if relative
        evidence_url = violation.annotated_image_path if violation and violation.annotated_image_path else ""
        if evidence_url and evidence_url.startswith("/"):
            evidence_url = f"{settings.FRONTEND_URL.rstrip('/')}{evidence_url}"

        payload = {
            "event_type": "ppe_violation",
            "project_id": alert.project_id or "PRJ-101",
            "violation_id": violation.violation_id if violation else "",
            "alert_id": alert.alert_id,
            "zone": violation.zone_name if violation else "General Work Zone",
            "anonymous_worker_id": violation.anonymous_worker_id if violation else "Worker-01",
            "violation_type": violation.violation_type if violation else "general_hazard",
            "required_ppe": violation.required_ppe or "",
            "missing_ppe": violation.missing_ppe or "",
            "confidence_score": float(violation.confidence_score) if violation and violation.confidence_score else 0.90,
            "severity": alert.severity.lower() if alert.severity else "high",
            "risk_score": float(alert.risk_score) if alert.risk_score is not None else 60.0,
            "detected_at": detected_at_iso,
            "evidence_image_url": evidence_url,
            "recommendation": recommendation or alert.message or ""
        }

        headers = {
            "Content-Type": "application/json",
            "User-Agent": "BuildSure-AI/2.0"
        }
        if settings.N8N_SHARED_SECRET:
            headers["X-N8N-Secret"] = settings.N8N_SHARED_SECRET

        attempted_time = datetime.datetime.utcnow()
        alert.automation_attempted_at = attempted_time

        # 4. Dispatch POST Request
        try:
            response = requests.post(
                webhook_url,
                json=payload,
                headers=headers,
                timeout=5.0
            )

            alert.automation_response_code = response.status_code
            alert.automation_response_message = response.text[:500] if response.text else "OK"

            if 200 <= response.status_code < 300:
                alert.automation_status = "Logged"
                alert.automation_last_error = None
                
                audit_log = models.SafetyAuditLog(
                    alert_id=alert.alert_id,
                    action="AUTOMATION_DISPATCH",
                    user_reference="n8n-Integration",
                    note=f"Successfully dispatched alert payload to n8n webhook (HTTP {response.status_code})."
                )
                db.add(audit_log)
                db.commit()

                return {
                    "success": True,
                    "status": "Logged",
                    "status_code": response.status_code,
                    "message": "Alert dispatched to n8n webhook successfully."
                }
            else:
                alert.automation_status = "Failed"
                err_msg = f"n8n webhook returned HTTP {response.status_code}: {response.text[:200]}"
                alert.automation_last_error = err_msg
                
                audit_log = models.SafetyAuditLog(
                    alert_id=alert.alert_id,
                    action="AUTOMATION_ERROR",
                    user_reference="n8n-Integration",
                    note=f"n8n webhook error: HTTP {response.status_code}"
                )
                db.add(audit_log)
                db.commit()

                return {
                    "success": False,
                    "status": "Failed",
                    "status_code": response.status_code,
                    "message": err_msg
                }

        except Exception as e:
            alert.automation_status = "Failed"
            err_msg = f"Failed to connect to n8n webhook: {str(e)}"
            alert.automation_last_error = err_msg
            
            audit_log = models.SafetyAuditLog(
                alert_id=alert.alert_id,
                action="AUTOMATION_FAILED",
                user_reference="n8n-Integration",
                note=f"n8n connection failure: {str(e)[:200]}"
            )
            db.add(audit_log)
            db.commit()

            return {
                "success": False,
                "status": "Failed",
                "message": err_msg
            }

n8n_dispatcher = N8NDispatcher()
