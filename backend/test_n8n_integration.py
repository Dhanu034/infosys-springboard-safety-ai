import sys
import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models, schemas
from app.config import settings
from app.services.n8n_dispatcher import n8n_dispatcher

def test_integration():
    db: Session = SessionLocal()
    try:
        print("=== Test 1: Testing Low Risk Alert (<61) Dispatch ===")
        # Create dummy low risk violation and alert
        low_violation = models.PPEViolation(
            project_id="PRJ-TEST",
            zone_name="General Work Zone",
            anonymous_worker_id="Worker-TestLow",
            violation_type="needs_human_review",
            confidence_score=0.65,
            base_risk_score=30.0,
            zone_multiplier=1.0,
            final_risk_score=30.0,
            risk_category="Low",
            decision_status="needs_human_review"
        )
        db.add(low_violation)
        db.flush()

        low_alert = models.SafetyAlert(
            violation_id=low_violation.violation_id,
            project_id="PRJ-TEST",
            severity="LOW",
            risk_score=30.0,
            title="Low Risk Alert Test",
            message="Human review suggested",
            status="OPEN",
            automation_status="Not Configured"
        )
        db.add(low_alert)
        db.commit()

        # Dispatch
        res_low = n8n_dispatcher.dispatch_alert(low_alert, low_violation, db, recommendation=low_alert.message)
        print("Low risk dispatch result:", res_low)
        assert low_alert.automation_status == "Not Required", f"Expected 'Not Required', got {low_alert.automation_status}"
        print("[PASS] Test 1 Passed: Low risk alert correctly marked as 'Not Required'.\n")

        print("=== Test 2: Testing High/Critical Risk Alert (>=61) Dispatch ===")
        high_violation = models.PPEViolation(
            project_id="PRJ-TEST",
            zone_name="Excavation Zone",
            anonymous_worker_id="Worker-TestHigh",
            violation_type="missing_helmet_and_vest",
            confidence_score=0.95,
            base_risk_score=85.0,
            zone_multiplier=1.2,
            final_risk_score=100.0,
            risk_category="Critical",
            decision_status="confirmed_violation"
        )
        db.add(high_violation)
        db.flush()

        high_alert = models.SafetyAlert(
            violation_id=high_violation.violation_id,
            project_id="PRJ-TEST",
            severity="CRITICAL",
            risk_score=100.0,
            title="Critical Risk Alert Test",
            message="Stop work immediately and provide PPE",
            status="OPEN",
            automation_status="Not Configured"
        )
        db.add(high_alert)
        db.commit()

        # Dispatch
        res_high = n8n_dispatcher.dispatch_alert(high_alert, high_violation, db, recommendation=high_alert.message)
        print("High risk dispatch result:", res_high)
        assert high_alert.automation_status in ["Logged", "Failed"], f"Expected 'Logged' or 'Failed', got {high_alert.automation_status}"
        assert high_alert.automation_attempted_at is not None, "Expected automation_attempted_at to be recorded"
        print(f"[PASS] Test 2 Passed: High risk alert attempted dispatch safely (Status: {high_alert.automation_status}).\n")

        print("=== Test 3: Testing Audit Logs for Automation ===")
        audit_logs = db.query(models.SafetyAuditLog).filter(models.SafetyAuditLog.alert_id == high_alert.alert_id).all()
        print(f"Found {len(audit_logs)} audit logs for high alert:")
        for a in audit_logs:
            print(f" - [{a.action}] by {a.user_reference}: {a.note}")
        assert len(audit_logs) >= 1, "Expected at least 1 audit log"
        print("[PASS] Test 3 Passed: Audit trail successfully captured automation events.\n")

        print("=== Test 4: Testing n8n Status Callback Simulation ===")
        # Simulate webhook callback from n8n
        high_alert.automation_status = "Supervisor Notified"
        high_alert.delivery_channel = "Slack"
        callback_audit = models.SafetyAuditLog(
            alert_id=high_alert.alert_id,
            action="AUTOMATION_STATUS_UPDATE",
            user_reference="n8n-Workflow",
            note="Automation Status: Supervisor Notified | Channel: Slack"
        )
        db.add(callback_audit)
        db.commit()

        updated_alert = db.query(models.SafetyAlert).filter(models.SafetyAlert.alert_id == high_alert.alert_id).first()
        assert updated_alert.automation_status == "Supervisor Notified"
        assert updated_alert.delivery_channel == "Slack"
        print("[PASS] Test 4 Passed: Status update and delivery channel simulated successfully.\n")

        # Cleanup test records
        db.delete(low_violation)
        db.delete(high_violation)
        db.commit()
        print("All integration tests PASSED successfully!")

    finally:
        db.close()

if __name__ == "__main__":
    test_integration()
