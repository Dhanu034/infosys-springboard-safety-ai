import os
import sys
import io
import datetime
from pypdf import PdfWriter

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_sample_pdf_bytes():
    """Create a valid in-memory PDF with sample safety policy clauses."""
    writer = PdfWriter()
    page1_text = """
    BUILDSURE CONSTRUCTION SAFETY COUNCIL
    PROJECT ALPHA - SITE SAFETY AND REGULATORY PLAN
    Issue Date: 2026-01-15
    Valid Until: 2027-01-15
    Issuing Authority: Directorate General of Factory Advice Service and Labour Institutes (DGFASLI)

    SECTION 4: PERSONAL PROTECTIVE EQUIPMENT (PPE) MANDATES
    4.1 All employees and site visitors in active construction zones shall be provided with and 
    shall wear an approved safety helmet conforming to Bureau of Indian Standards specification IS 2925 / ANSI Z89.1.
    Hard hats must be inspected daily before entry.
    """
    page2_text = """
    SECTION 5: WORKING AT HEIGHTS AND FALL ARREST
    5.1 Full body safety harnesses conforming to IS 3521 and anchored to certified 5000-lb lifelines 
    shall be mandatory for all activities exceeding 6 feet (1.8 meters) above lower levels.
    5.2 Guardrails, mid-rails, and toe-boards must be installed on all perimeter scaffolding.
    """
    writer.add_blank_page(width=612, height=792)
    writer.add_blank_page(width=612, height=792)
    
    # Write text into PDF structure
    # For a real readable text stream in pypdf, we can use pypdf's annotation or a minimal synthetic PDF
    # Alternatively write a standard PDF format string
    pdf_content = (
        b"%PDF-1.4\n"
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Kids[3 0 R 4 0 R]/Count 2>>endobj\n"
        b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 5 0 R/Resources<<>>>>endobj\n"
        b"4 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 6 0 R/Resources<<>>>>endobj\n"
        b"5 0 obj<</Length 350>>stream\nBT /F1 12 Tf 50 700 Td (BUILDSURE SITE SAFETY PLAN) Tj ET\n"
        b"BT /F1 10 Tf 50 680 Td (Issue Date: 2026-01-15 Valid Until: 2027-12-31) Tj ET\n"
        b"BT /F1 10 Tf 50 660 Td (Issuing Authority: Building and Other Construction Workers Board) Tj ET\n"
        b"BT /F1 10 Tf 50 640 Td (All workers shall wear safety helmet conforming to IS 2925 and ANSI Z89 hard hat standard.) Tj ET\n"
        b"endstream\nendobj\n"
        b"6 0 obj<</Length 300>>stream\nBT /F1 12 Tf 50 700 Td (SECTION 5: FALL PROTECTION) Tj ET\n"
        b"BT /F1 10 Tf 50 680 Td (Full body safety harness conforming to IS 3521 and anchor point for fall protection.) Tj ET\n"
        b"BT /F1 10 Tf 50 660 Td (Guardrail and scaffolding safety required at 6 feet height.) Tj ET\n"
        b"endstream\nendobj\n"
        b"xref\n0 7\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n"
        b"0000000210 00000 n \n0000000305 00000 n \n0000000710 00000 n \n"
        b"trailer<</Size 7/Root 1 0 R>>\nstartxref\n1065\n%%EOF\n"
    )
    return pdf_content

def test_phase2():
    print("=== Phase 2 Comprehensive Test Suite ===")

    # 1. Existing Safety Endpoints (Regression Check)
    print("\n[1] Testing Existing Milestone 1/2 Safety Endpoints...")
    res_health = client.get("/health")
    assert res_health.status_code == 200
    print(f"    [OK] /health -> {res_health.json()['status']}")

    res_sum = client.get("/api/safety/summary?project_id=PRJ-101")
    assert res_sum.status_code == 200
    print(f"    [OK] /api/safety/summary -> safety_score={res_sum.json()['safety_score']}")

    # 2. Compliance Document Upload & Multi-Tier Extraction
    print("\n[2] Testing Compliance Document Upload & Multi-Tier Extraction...")
    pdf_bytes = create_sample_pdf_bytes()
    files = {"file": ("test_site_safety_plan.pdf", pdf_bytes, "application/pdf")}
    data = {"project_id": "PRJ-101", "document_category": "site_safety_plan"}

    res_upload = client.post("/api/compliance/documents/upload", files=files, data=data)
    assert res_upload.status_code == 200, f"Upload failed: {res_upload.text}"
    uploaded_doc = res_upload.json()
    doc_id = uploaded_doc["doc_id"]
    print(f"    [OK] Uploaded doc_id: {doc_id}")
    print(f"    [OK] Extraction Method: {uploaded_doc['extraction_method']}")
    print(f"    [OK] Page Count: {uploaded_doc['page_count']}")
    print(f"    [OK] Issuing Authority: {uploaded_doc['issuing_authority']}")
    print(f"    [OK] Expiry Date: {uploaded_doc['expiry_date']}")

    # 3. Regulatory Rules Knowledge Base
    print("\n[3] Testing Regulatory Reference Knowledge Base...")
    res_rules = client.get("/api/compliance/regulations")
    assert res_rules.status_code == 200
    rules = res_rules.json()
    print(f"    [OK] Loaded {len(rules)} reference standards.")
    for r in rules[:3]:
        print(f"         - {r['standard_code']} ({r['jurisdiction']}): {r['category']}")

    # 4. Compliance Evaluations with Citations
    print("\n[4] Testing Compliance Evaluations & Page Citations...")
    res_evals = client.get(f"/api/compliance/evaluations?project_id=PRJ-101&doc_id={doc_id}")
    assert res_evals.status_code == 200
    evals = res_evals.json()
    print(f"    [OK] Evaluated {len(evals)} rules against uploaded document:")
    for ev in evals:
        print(f"         - [{ev['status'].upper()}] {ev['standard_code']}: Page {ev['evidence_page']} | Snippet: {ev['evidence_snippet'][:60]}...")
        assert "Reference Rule Match" in ev["disclaimer"]

    # 5. Human Supervisor Review for Compliance Evaluation
    print("\n[5] Testing Human Review Override for Compliance Evaluation...")
    if evals:
        target_eval = evals[0]
        review_payload = {
            "reviewed_by": "Senior Safety Auditor — S. Raman",
            "status_override": "compliant",
            "review_notes": "Supervisor verified IS 2925 certification clause on page 1."
        }
        res_rev = client.post(f"/api/compliance/evaluations/{target_eval['evaluation_id']}/review", json=review_payload)
        assert res_rev.status_code == 200
        rev_data = res_rev.json()
        assert rev_data["human_reviewed"] == True
        print(f"    [OK] Human review submitted: reviewed_by='{rev_data['reviewed_by']}', status='{rev_data['status']}'")

    # 6. Inspection & Renewal Schedules
    print("\n[6] Testing Inspection & Renewal Due-Date Schedules...")
    res_sched = client.get("/api/compliance/schedules?project_id=PRJ-101")
    assert res_sched.status_code == 200
    schedules = res_sched.json()
    print(f"    [OK] Retrieved {len(schedules)} inspection schedules:")
    for s in schedules:
        print(f"         - [{s['status']}] {s['item_title']} (Due in {s['days_until_due']} days)")

    # 7. Compliance Audit Report Generation
    print("\n[7] Testing Compliance Audit Report Generation...")
    res_rep = client.get("/api/compliance/report?project_id=PRJ-101")
    assert res_rep.status_code == 200
    rep = res_rep.json()
    print(f"    [OK] Generated Report: Compliance Rate = {rep['compliance_rate']}%, Breakdown = {rep['status_breakdown']}")

    # 8. Insurance Exposure Summary (Read-Only SQLite Ingestion)
    print("\n[8] Testing Insurance Exposure Calculation...")
    res_exp = client.get("/api/insurance/exposure-summary?project_id=PRJ-101")
    assert res_exp.status_code == 200
    exp = res_exp.json()
    print(f"    [OK] Exposure Score = {exp['exposure_score']}/100 ({exp['exposure_tier']})")
    print(f"    [OK] Total Safety Events Processed = {exp['total_safety_events']}")
    print(f"    [OK] Evidence Completeness Rate = {exp['evidence_completeness_rate']}%")
    print(f"    [OK] Illustrative Liability Range = {exp['illustrative_liability_range']}")

    # 9. Insurance Claims & Documentation Checklist
    print("\n[9] Testing Insurance Claims & Checklists...")
    res_claims = client.get("/api/insurance/claims?project_id=PRJ-101")
    assert res_claims.status_code == 200
    claims = res_claims.json()
    print(f"    [OK] Generated/Retrieved {len(claims)} claim assessment records:")
    if claims:
        first_claim = claims[0]
        print(f"         - Assessment ID: {first_claim['assessment_id']}")
        print(f"         - Incident: {first_claim['incident_type']} in {first_claim['zone_name']}")
        print(f"         - Decision Status: {first_claim['decision_status']}")
        print(f"         - Checklist Items ({len(first_claim['checklist'])}):")
        for chk in first_claim['checklist']:
            print(f"             [{'X' if chk['is_attached'] else ' '}] {chk['item_title']}")

        # 10. Human Review Workflow for Insurance Claim
        print("\n[10] Testing Insurance Claim Human Review Sign-Off...")
        claim_review_payload = {
            "reviewed_by": "Senior Risk Engineer — M. Johnson",
            "decision_status": "APPROVED_FOR_FILING",
            "supervisor_notes": "All visual evidence, telemetry frames, and worker zone records verified.",
            "legal_counsel_sign_off": False
        }
        res_claim_rev = client.post(
            f"/api/insurance/claims/{first_claim['assessment_id']}/human-review",
            json=claim_review_payload
        )
        assert res_claim_rev.status_code == 200
        rev_claim_data = res_claim_rev.json()
        assert rev_claim_data["decision_status"] == "APPROVED_FOR_FILING"
        print(f"    [OK] Claim review updated: status='{rev_claim_data['decision_status']}', reviewer='{rev_claim_data['reviewed_by']}'")

    print("\n>>> ALL PHASE 2 TESTS COMPLETED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    test_phase2()
