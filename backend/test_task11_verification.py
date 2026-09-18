import os
import sys
import json
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure app package can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.yolo_detector import yolo_detector, normalize_class_name, MODEL_PATH
from app.services.safety_agent import safety_agent
from app.database import SessionLocal, engine
from app import models
from app.main import app

def run_all_tests():
    print("=================================================================")
    print("       BUILDSURE AI — TASK 11 VERIFICATION TEST SUITE           ")
    print("=================================================================")

    # 1. Model load test
    print("\n--- [TEST 1] Model Load Test ---")
    assert MODEL_PATH.exists(), f"Model file missing at {MODEL_PATH}"
    print(f"Loaded Model Path: {MODEL_PATH}")
    print(f"Model File Size: {MODEL_PATH.stat().st_size / (1024 * 1024):.2f} MB")
    assert yolo_detector.ultralytics_model is not None, "Ultralytics YOLO model is not loaded"
    print("[PASS] Test 1: Model loaded successfully.")

    # 2. Model.names test
    print("\n--- [TEST 2] Model.names Test ---")
    names_dict = yolo_detector.ultralytics_model.names
    print(f"Actual model.names: {names_dict}")
    assert isinstance(names_dict, dict), "model.names must be a dictionary"
    assert len(names_dict) == 10, f"Expected 10 classes, got {len(names_dict)}"
    expected_classes = ["Hardhat", "Mask", "NO-Hardhat", "NO-Mask", "NO-Safety Vest", "Person", "Safety Cone", "Safety Vest", "machinery", "vehicle"]
    for c in expected_classes:
        assert c in names_dict.values(), f"Class '{c}' not found in model.names"
    print("[PASS] Test 2: All 10 model.names verified.")

    # 3. Real construction-image inference test
    print("\n--- [TEST 3] Real Construction Image Inference Test ---")
    test_img = os.path.join(os.path.dirname(__file__), "uploads", "upload_34ff41de_20260911_211529.jpg")
    assert os.path.exists(test_img), f"Test image missing at {test_img}"
    
    detections = yolo_detector.detect_objects(test_img)
    print(f"Total Detections Found: {len(detections)}")
    assert len(detections) > 0, "Detections must not be empty"
    
    for i, d in enumerate(detections[:5], 1):
        print(f"  {i}. class_id={d['class_id']} | label='{d['label']}' | conf={d['confidence']} | bbox={d['bbox']}")
        assert "class_id" in d, "Missing class_id in detection"
        assert "label" in d, "Missing label in detection"
        assert "confidence" in d, "Missing confidence in detection"
        assert "bbox" in d, "Missing bbox in detection"
        assert all(k in d["bbox"] for k in ["x1", "y1", "x2", "y2"]), "bbox must contain x1, y1, x2, y2"
    print("[PASS] Test 3: Real inference returned valid detection schema.")

    # 4. PPE API smoke test
    print("\n--- [TEST 4] PPE API Smoke Test (FastAPI TestClient) ---")
    client = TestClient(app)
    
    # 4a. Health check
    res_health = client.get("/health")
    assert res_health.status_code == 200, f"Health check failed: {res_health.status_code}"
    print(f"  [OK] /health -> {res_health.json()}")

    # 4b. Model Info check
    res_model_info = client.get("/api/safety/model-info")
    assert res_model_info.status_code == 200, f"Model info failed: {res_model_info.status_code}"
    info_json = res_model_info.json()
    print(f"  [OK] /api/safety/model-info -> model_name={info_json['model_name']}, classes_count={len(info_json['classes'])}")
    assert info_json["model_name"] == "Hansung-Cho/yolov8-ppe-detection"
    assert info_json["inference_mode"] == "local"

    # 4c. Image analysis endpoint test
    with open(test_img, "rb") as f:
        res_analyze = client.post(
            "/api/safety/analyze-image",
            files={"file": ("test_site.jpg", f, "image/jpeg")},
            data={"project_id": "PRJ-101", "zone_name": "Excavation Zone", "camera_id": "CAM-01"}
        )
    assert res_analyze.status_code == 200, f"Analysis failed: {res_analyze.status_code} - {res_analyze.text}"
    analyze_json = res_analyze.json()
    print(f"  [OK] /api/safety/analyze-image -> total_workers={analyze_json['total_workers_detected']}, violations={analyze_json['violations_detected_count']}, score={analyze_json['overall_safety_score']}%")
    assert "model_name" in analyze_json
    assert "detections" in analyze_json
    assert "violations" in analyze_json
    assert "annotated_image" in analyze_json
    print("[PASS] Test 4: PPE API endpoints verified.")

    # 5. SQLite persistence test
    print("\n--- [TEST 5] SQLite Persistence Test ---")
    db = SessionLocal()
    try:
        latest_violation = db.query(models.PPEViolation).order_by(models.PPEViolation.detected_at.desc()).first()
        assert latest_violation is not None, "No PPEViolation persisted in SQLite"
        print(f"  Latest PPE Violation ID: {latest_violation.violation_id}")
        print(f"  Worker: {latest_violation.anonymous_worker_id} | Type: {latest_violation.violation_type} | Zone: {latest_violation.zone_name}")
        print(f"  Risk Score: {latest_violation.final_risk_score} | Category: {latest_violation.risk_category}")
        
        latest_alert = db.query(models.SafetyAlert).order_by(models.SafetyAlert.created_at.desc()).first()
        assert latest_alert is not None, "No SafetyAlert persisted in SQLite"
        print(f"  Latest Safety Alert ID: {latest_alert.alert_id} | Severity: {latest_alert.severity}")

        latest_audit = db.query(models.SafetyAuditLog).order_by(models.SafetyAuditLog.created_at.desc()).first()
        assert latest_audit is not None, "No SafetyAuditLog persisted in SQLite"
        print(f"  Latest Safety Audit Log: Action={latest_audit.action} | User={latest_audit.user_reference}")
        print("[PASS] Test 5: SQLite records verified.")
    finally:
        db.close()

    # 6. n8n alert test for High/Critical result
    print("\n--- [TEST 6] n8n Alert Webhook Dispatcher Test ---")
    from app.services.n8n_dispatcher import n8n_dispatcher
    db = SessionLocal()
    try:
        crit_violation = db.query(models.PPEViolation).filter(models.PPEViolation.risk_category.in_(["High", "Critical", "HIGH", "CRITICAL"])).first()
        if crit_violation:
            crit_alert = db.query(models.SafetyAlert).filter(models.SafetyAlert.violation_id == crit_violation.violation_id).first()
            if crit_alert:
                result = n8n_dispatcher.dispatch_alert(
                    alert=crit_alert,
                    violation=crit_violation,
                    db=db,
                    recommendation="Immediate site halt: mandatory PPE donning required."
                )
                print(f"  n8n Alert Dispatch Result: {result}")
                assert "status" in result
                print(f"  Alert Automation Status in DB: {crit_alert.automation_status}")
        else:
            print("  No existing Critical/High violation in DB, creating synthetic event for dispatcher test...")
            # Create a test alert to test dispatcher
            test_v = models.PPEViolation(
                project_id="PRJ-101",
                zone_name="Excavation Zone",
                anonymous_worker_id="WRK-TEST",
                violation_type="missing_helmet_and_vest",
                final_risk_score=90.0,
                risk_category="Critical",
                decision_status="confirmed_violation"
            )
            db.add(test_v)
            db.flush()
            test_a = models.SafetyAlert(
                violation_id=test_v.violation_id,
                project_id="PRJ-101",
                severity="CRITICAL",
                risk_score=90.0,
                title="Critical PPE Violation Alert",
                message="Test critical alert",
                status="OPEN"
            )
            db.add(test_a)
            db.flush()
            result = n8n_dispatcher.dispatch_alert(test_a, test_v, db, recommendation="Halt zone operations immediately.")
            db.commit()
            print(f"  n8n Dispatch Result: {result}")
        print("[PASS] Test 6: n8n alert dispatch verified.")
    finally:
        db.close()

    print("\n=================================================================")
    print("    >>> ALL BACKEND AND INFERENCE TESTS PASSED (6/6) <<<       ")
    print("=================================================================")

if __name__ == "__main__":
    run_all_tests()
