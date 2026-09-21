import os
import sys
import datetime

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_milestone4():
    print("===========================================================================")
    print("BUILDSURE AI — MILESTONE 4 REPORTING INTELLIGENCE TEST SUITE")
    print("===========================================================================\n")

    # 1. Executive Summary Report (PRJ-101 with data)
    print("[1] Testing /api/reports/project-summary (PRJ-101)...")
    res1 = client.get("/api/reports/project-summary?project_id=PRJ-101")
    assert res1.status_code == 200, f"Error: {res1.text}"
    data1 = res1.json()
    assert data1["project_id"] == "PRJ-101"
    assert data1["has_data"] == True
    assert data1["records_count"] > 0
    assert "safety_score" in data1["metrics"]
    assert "ppe_compliance_rate" in data1["metrics"]
    assert "regulatory_compliance_rate" in data1["metrics"]
    assert "executive_health_summary" in data1["metrics"]
    print(f"    [OK] Executive Health Summary: {data1['metrics']['executive_health_summary']}")
    print(f"    [OK] Safety Score: {data1['metrics']['safety_score']}")
    print(f"    [OK] PPE Compliance Rate: {data1['metrics']['ppe_compliance_rate']}%")

    # 2. Executive Summary Report (PRJ-999 empty project -> No fake values!)
    print("\n[2] Testing /api/reports/project-summary (PRJ-999 Empty Project)...")
    res_empty = client.get("/api/reports/project-summary?project_id=PRJ-999")
    assert res_empty.status_code == 200
    data_empty = res_empty.json()
    assert data_empty["has_data"] == False
    assert data_empty["records_count"] == 0
    assert data_empty["metrics"]["safety_score"] is None
    assert data_empty["metrics"]["ppe_compliance_rate"] is None
    assert data_empty["metrics"]["message"] == "No records available for selected project and period."
    print("    [OK] Empty state returned has_data=False and None metrics as expected.")

    # 3. Site Risk Report
    print("\n[3] Testing /api/reports/risk...")
    res_risk = client.get("/api/reports/risk?project_id=PRJ-101")
    assert res_risk.status_code == 200
    risk_data = res_risk.json()
    assert risk_data["has_data"] == True
    print(f"    [OK] Monitored Zones: {risk_data['metrics']['total_monitored_zones']}")
    print(f"    [OK] High-Risk Zones: {risk_data['metrics']['high_risk_zone_count']}")

    # 4. PPE Safety Report & Denominators
    print("\n[4] Testing /api/reports/safety (PPE Denominators & MTTA/MTTR)...")
    res_ppe = client.get("/api/reports/safety?project_id=PRJ-101")
    assert res_ppe.status_code == 200
    ppe_data = res_ppe.json()
    assert ppe_data["has_data"] == True
    m = ppe_data["metrics"]
    print(f"    [OK] Evaluated Workers: {m['evaluated_workers_count']}")
    print(f"    [OK] Helmet Assessment Count: {m['helmet_assessment_count']} | Rate: {m['helmet_compliance_rate']}%")
    print(f"    [OK] Vest Assessment Count: {m['vest_assessment_count']} | Rate: {m['vest_compliance_rate']}%")
    print(f"    [OK] Overall PPE Compliant Workers: {m['overall_ppe_compliant_worker_count']} | Rate: {m['overall_ppe_compliance_rate']}%")
    print(f"    [OK] MTTA: {m['mtta_minutes']} ({m['mtta_message']})")
    print(f"    [OK] MTTR: {m['mttr_minutes']} ({m['mttr_message']})")

    # 5. Compliance & Regulatory Report
    print("\n[5] Testing /api/reports/compliance...")
    res_comp = client.get("/api/reports/compliance?project_id=PRJ-101")
    assert res_comp.status_code == 200
    comp_data = res_comp.json()
    print(f"    [OK] Regulatory Compliance Rate: {comp_data['metrics']['regulatory_compliance_rate']}%")
    print(f"    [OK] Ingested Documents: {comp_data['metrics']['ingested_documents_count']}")
    print(f"    [OK] Human Verified Evaluations: {comp_data['metrics']['human_verified_count']}")

    # 6. Incidents & Alerts Report
    print("\n[6] Testing /api/reports/incidents-alerts...")
    res_alerts = client.get("/api/reports/incidents-alerts?project_id=PRJ-101")
    assert res_alerts.status_code == 200
    alerts_data = res_alerts.json()
    print(f"    [OK] Total Alerts: {alerts_data['metrics']['total_alerts']}")
    print(f"    [OK] Severity Counts: {alerts_data['metrics']['severity_counts']}")

    # 7. Insurance Exposure Report
    print("\n[7] Testing /api/reports/insurance...")
    res_ins = client.get("/api/reports/insurance?project_id=PRJ-101")
    assert res_ins.status_code == 200
    ins_data = res_ins.json()
    print(f"    [OK] Insurance Exposure Score: {ins_data['metrics']['insurance_exposure_score']}")
    print(f"    [OK] Exposure Risk Tier: {ins_data['metrics']['exposure_tier']}")

    # 8. Export Generator Endpoints (JSON, CSV, HTML)
    print("\n[8] Testing Export Endpoints (JSON, CSV, HTML)...")
    res_csv = client.get("/api/reports/export?project_id=PRJ-101&report_type=project_summary&format=csv")
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert "BUILDSURE AI ENTERPRISE REPORTING INTELLIGENCE PROTOTYPE" in res_csv.text
    print("    [OK] CSV Export Generated Successfully.")

    res_html = client.get("/api/reports/export?project_id=PRJ-101&report_type=project_summary&format=html")
    assert res_html.status_code == 200
    assert "text/html" in res_html.headers["content-type"]
    assert "BuildSure AI — Enterprise Reporting Intelligence Prototype" in res_html.text
    print("    [OK] Standalone Printable HTML Export Generated Successfully.")

    # 9. Audit Logs Auto-Creation
    print("\n[9] Testing Report Audit Logs Auto-Creation...")
    res_audit = client.get("/api/reports/audit-logs?project_id=PRJ-101")
    assert res_audit.status_code == 200
    audit_logs = res_audit.json()
    assert len(audit_logs) > 0
    print(f"    [OK] Found {len(audit_logs)} automatic report audit log entries.")
    print(f"         - Latest entry: report_type='{audit_logs[0]['report_type']}', format='{audit_logs[0]['export_format']}', role='{audit_logs[0]['user_role']}'")

    print("\n===========================================================================")
    print(">>> ALL MILESTONE 4 REPORTING INTELLIGENCE TESTS PASSED PERFECTLY! <<<")
    print("===========================================================================")

if __name__ == "__main__":
    test_milestone4()
