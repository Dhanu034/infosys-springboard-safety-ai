import os
import sys
import sqlite3

# Ensure backend directory is in path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app.database import engine, Base, SessionLocal
from app import models
import app.schemas_compliance as sc
import app.schemas_insurance as si

def run_phase1_verification():
    print("=== Phase 1 Verification: Additive Database & Model Setup ===")
    
    # 1. Create tables additively
    Base.metadata.create_all(bind=engine)
    print("[1] Base.metadata.create_all(bind=engine) executed successfully.")
    
    # 2. Inspect active SQLite DB
    db_path = os.path.join(backend_dir, "safety_intelligence.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall() if not row[0].startswith("sqlite_")]
    
    print(f"[2] Active Database: {db_path}")
    print(f"[2] All Database Tables ({len(tables)}): {tables}")
    
    # Expected tables
    expected_m1_m2 = ["safety_zone_rules", "ppe_violations", "safety_alerts", "safety_audit_logs"]
    expected_m3 = [
        "compliance_documents",
        "regulatory_rules",
        "compliance_evaluations",
        "inspection_schedules",
        "insurance_assessments"
    ]
    
    # Verify M1/M2 preserved
    for t in expected_m1_m2:
        assert t in tables, f"CRITICAL: Existing table {t} is missing!"
        cursor.execute(f"SELECT COUNT(*) FROM {t}")
        cnt = cursor.fetchone()[0]
        print(f"    [OK] Milestone 1/2 Table preserved: {t} ({cnt} rows)")
        
    # Verify M3 created
    for t in expected_m3:
        assert t in tables, f"Milestone 3 table {t} was not created!"
        print(f"    [OK] Milestone 3 Table created: {t}")
        
    conn.close()
    
    # 3. Test existing Safety database session
    db = SessionLocal()
    try:
        zone_rules = db.query(models.SafetyZoneRule).all()
        print(f"[3] SafetyZoneRule query check: {len(zone_rules)} active zone rules loaded.")
        
        violations_count = db.query(models.PPEViolation).count()
        print(f"[3] PPEViolation query check: {violations_count} violation records intact.")
        
        alerts_count = db.query(models.SafetyAlert).count()
        print(f"[3] SafetyAlert query check: {alerts_count} alert records intact.")
    finally:
        db.close()
        
    # 4. Test Schema Instantation
    exp = si.InsuranceExposureSummary(
        project_id="PRJ-101",
        exposure_score=45.0,
        exposure_tier="MODERATE",
        total_safety_events=violations_count,
        critical_events=2,
        high_severity_events=5,
        evidence_completeness_rate=80.0,
        pending_human_reviews=1
    )
    print(f"[4] Insurance Schema validation: Exposure Tier = {exp.exposure_tier}, Score = {exp.exposure_score}")
    
    reg_rule = sc.RegulatoryRuleResponse(
        rule_id="test-rule-1",
        source_name="BOCW Central Rules 1998",
        standard_code="BOCW-R231",
        jurisdiction="India — Central (BOCW)",
        version_or_reference_date="2026 Reference",
        category="Head Protection",
        requirement_summary="Head protection mandatory for all workers in construction zones.",
        mandatory_keywords='["helmet", "hard hat", "head protection"]',
        penalty_severity="HIGH",
        human_review_required=True,
        is_active=True
    )
    print(f"[5] Compliance Schema validation: Standard Code = {reg_rule.standard_code}")
    
    print("\n>>> ALL PHASE 1 VERIFICATION CHECKS PASSED PERFECTLY! <<<")

if __name__ == "__main__":
    run_phase1_verification()
