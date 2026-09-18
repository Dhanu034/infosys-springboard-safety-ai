import os
import sys
import json
import io
import datetime

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models

client = TestClient(app)

def run_comprehensive_tests():
    print("=" * 75)
    print("BUILDSURE AI — COMPLIANCE & INSURANCE DYNAMIC CHECKLIST TEST SUITE")
    print("=" * 75)
    
    db = SessionLocal()
    
    try:
        # -------------------------------------------------------------
        # TEST 1: Ingest PDF 1 — BuildSure Safety Manual (site_safety_plan)
        # -------------------------------------------------------------
        print("\n>>> TEST 1: Ingesting & Evaluating PDF 1 (Safety Manual)...")
        pdf1_text = (
            "BUILDSURE INFRASTRUCTURE PROJECTS LTD | PROJECT PRJ-101\n"
            "CONSTRUCTION SITE SAFETY & HEALTH MANUAL 2026\n"
            "Issuing Authority: BuildSure Construction Safety Council\n"
            "Issue Date: 15/01/2026\n"
            "Valid Until: 31/12/2026\n\n"
            "--- PAGE 1 ---\n"
            "SECTION 1: HEAD PROTECTION & PPE GOVERNANCE\n"
            "All workers, engineers, and site visitors must wear an industrial safety helmet conforming to IS 2925 and ANSI Z89 hard hat specifications in all active hazard zones. High-visibility reflective safety vests are mandatory.\n\n"
            "--- PAGE 2 ---\n"
            "SECTION 2: WORK AT HEIGHT & FALL PROTECTION\n"
            "Full body safety harness conforming to IS 3521 and 100% tie-off to life lines is mandatory for work above 6 feet (2 meters). Scaffolding must include top rails, mid rails, toe boards, and secured gangways.\n\n"
            "--- PAGE 3 ---\n"
            "SECTION 3: ELECTRICAL & HEAVY LIFTING SAFETY\n"
            "GFCI breakers and verified earthing are required on all temporary power distribution boards. 30-day load test and structural cable inspection are required for cranes and hoists. Safety induction training and supervisor sign-off logged."
        )

        doc1 = models.ComplianceDocument(
            project_id="PRJ-101",
            filename="BuildSure_Safety_Manual_PRJ-101.pdf",
            file_path="mock/BuildSure_Safety_Manual_PRJ-101.pdf",
            file_type="pdf",
            document_category="site_safety_plan",
            extracted_text=pdf1_text,
            page_count=3,
            extraction_method="pypdf",
            status="PROCESSED"
        )
        db.add(doc1)
        db.commit()
        db.refresh(doc1)

        # Trigger compliance engine evaluation
        from app.services.compliance_engine import compliance_engine
        evals1 = compliance_engine.evaluate_document_against_rules(db, doc1)
        db.add_all(evals1)
        db.commit()

        # Query endpoint: GET /api/compliance/documents/{doc_id}/checklist
        resp1 = client.get(f"/api/compliance/documents/{doc1.doc_id}/checklist")
        assert resp1.status_code == 200, f"Checklist endpoint failed: {resp1.text}"
        data1 = resp1.json()

        print(f"[OK] Document 1 ID: {data1['document_id']}")
        print(f"[OK] Filename: {data1['filename']} ({data1['category']})")
        print(f"[OK] Found: {data1['found_count']} | Missing: {data1['missing_count']} | Completeness: {data1['completeness_percentage']}%")
        print("Checklist Items Sample:")
        for item in data1["checklist_items"][:4]:
            print(f"   * [{item['status']}] {item['code']} - {item['title']}: Page {item['evidence_page']} ({item['evidence_section']})")
            print(f"     Snippet: \"{item['evidence_snippet'][:80]}...\"")

        assert data1["found_count"] >= 5, "Expected majority of safety items to be FOUND in Safety Manual"
        assert any(i["code"] == "DOC-PPE-001" and i["status"] == "FOUND" for i in data1["checklist_items"])
        assert any(i["code"] == "DOC-FALL-003" and i["status"] == "FOUND" for i in data1["checklist_items"])

        # -------------------------------------------------------------
        # TEST 2: Ingest PDF 2 — Equipment Load-Test Certificate (equipment_cert)
        # -------------------------------------------------------------
        print("\n>>> TEST 2: Ingesting & Evaluating PDF 2 (Equipment Certificate - Distinct Category)...")
        pdf2_text = (
            "HEAVY RIGGING & HOIST CRANE INSPECTION CERTIFICATE\n"
            "Asset Tag: CRANE-TWR-8055 | Model: Liebherr 280 EC-H\n"
            "Issuing Authority: Directorate General of Factory Advice Service and Labour Institutes (DGFASLI)\n"
            "Inspection Date: 10/02/2026\n"
            "Valid Until: 10/08/2026\n\n"
            "--- PAGE 1 ---\n"
            "SECTION 1: LOAD-TEST EVIDENCE & STRUCTURAL VERIFICATION\n"
            "Proof load test completed successfully at 125% Safe Working Load (SWL 12.5 tonnes). Structural cable and brake assembly verified with zero defect tolerance.\n\n"
            "--- PAGE 2 ---\n"
            "SECTION 2: COMPETENT-PERSON CERTIFICATE & OPERATIONAL CLEARANCE\n"
            "Certified by Senior QA Mechanical Engineer Raman K. Defect rectification closure recorded and operational clearance sign-off granted for active lifting."
        )

        doc2 = models.ComplianceDocument(
            project_id="PRJ-101",
            filename="Liebherr_Crane_Load_Certificate_CRN-8055.pdf",
            file_path="mock/Liebherr_Crane_Load_Certificate_CRN-8055.pdf",
            file_type="pdf",
            document_category="equipment_cert",
            extracted_text=pdf2_text,
            page_count=2,
            extraction_method="pypdf",
            status="PROCESSED"
        )
        db.add(doc2)
        db.commit()
        db.refresh(doc2)

        evals2 = compliance_engine.evaluate_document_against_rules(db, doc2)
        db.add_all(evals2)
        db.commit()

        # Query endpoint: GET /api/compliance/documents/{doc_id}/checklist
        resp2 = client.get(f"/api/compliance/documents/{doc2.doc_id}/checklist")
        assert resp2.status_code == 200, f"Checklist endpoint failed: {resp2.text}"
        data2 = resp2.json()

        print(f"[OK] Document 2 ID: {data2['document_id']}")
        print(f"[OK] Filename: {data2['filename']} ({data2['category']})")
        print(f"[OK] Found: {data2['found_count']} | Missing: {data2['missing_count']} | Completeness: {data2['completeness_percentage']}%")
        print("Equipment Checklist Items:")
        for item in data2["checklist_items"]:
            print(f"   * [{item['status']}] {item['code']} - {item['title']}: Page {item['evidence_page']}")
            if item["evidence_snippet"]:
                print(f"     Snippet: \"{item['evidence_snippet'][:80]}...\"")

        # Verify Document 2 has distinct equipment checklist codes
        assert data2["document_id"] != data1["document_id"]
        assert data2["filename"] != data1["filename"]
        assert any(i["code"] == "EQP-LOAD-004" and i["status"] == "FOUND" for i in data2["checklist_items"])
        assert any(i["code"] == "EQP-CERT-005" and i["status"] == "FOUND" for i in data2["checklist_items"])
        assert not any(i["code"] == "DOC-PPE-001" for i in data2["checklist_items"]), "Equipment cert must not use safety manual items"

        # -------------------------------------------------------------
        # TEST 3: Document-Specific Evaluation Filtering
        # -------------------------------------------------------------
        print("\n>>> TEST 3: Verifying Document-Specific Evaluations Query...")
        evals_doc1_resp = client.get(f"/api/compliance/evaluations?doc_id={doc1.doc_id}")
        assert evals_doc1_resp.status_code == 200
        evals_doc1 = evals_doc1_resp.json()
        assert all(e["doc_id"] == doc1.doc_id for e in evals_doc1), "All evaluations must strictly belong to doc1"

        evals_doc2_resp = client.get(f"/api/compliance/evaluations?doc_id={doc2.doc_id}")
        assert evals_doc2_resp.status_code == 200
        evals_doc2 = evals_doc2_resp.json()
        assert all(e["doc_id"] == doc2.doc_id for e in evals_doc2), "All evaluations must strictly belong to doc2"
        print(f"[OK] Filtered doc1 evaluations: {len(evals_doc1)} records (All doc_id == {doc1.doc_id[:8]})")
        print(f"[OK] Filtered doc2 evaluations: {len(evals_doc2)} records (All doc_id == {doc2.doc_id[:8]})")

        # -------------------------------------------------------------
        # TEST 4: Non-matching / Empty Safety PDF
        # -------------------------------------------------------------
        print("\n>>> TEST 4: Evaluating PDF with No Matching Safety Rules...")
        doc_empty = models.ComplianceDocument(
            project_id="PRJ-101",
            filename="Cafeteria_Weekly_Menu.pdf",
            file_path="mock/Cafeteria_Weekly_Menu.pdf",
            file_type="pdf",
            document_category="general",
            extracted_text="Cafeteria menu for week 38: Monday sandwiches, Tuesday pasta, Wednesday salad.",
            page_count=1,
            extraction_method="pypdf",
            status="PROCESSED"
        )
        db.add(doc_empty)
        db.commit()
        db.refresh(doc_empty)

        resp_empty = client.get(f"/api/compliance/documents/{doc_empty.doc_id}/checklist")
        assert resp_empty.status_code == 200
        data_empty = resp_empty.json()
        print(f"[OK] Empty Doc Completeness: {data_empty['completeness_percentage']}% (Found: {data_empty['found_count']}, Missing: {data_empty['missing_count']})")
        assert data_empty["completeness_percentage"] == 0.0 or data_empty["found_count"] == 0

        # -------------------------------------------------------------
        # TEST 5: Insurance Claim Incident-Specific Evidence Linking
        # -------------------------------------------------------------
        print("\n>>> TEST 5: Verifying Insurance Claim Incident Evidence Linking...")
        # Create a test violation
        test_violation = models.PPEViolation(
            project_id="PRJ-101",
            zone_name="Work-at-Height Zone",
            camera_id="CAM-02",
            anonymous_worker_id="Worker-77",
            violation_type="missing_safety_vest",
            confidence_score=0.94,
            base_risk_score=70.0,
            zone_multiplier=1.5,
            final_risk_score=78.0,
            risk_category="High",
            original_image_path="/uploads/test_violation_orig.jpg",
            annotated_image_path="/uploads/test_violation_annot.jpg",
            status="ACKNOWLEDGED",
            acknowledged_by="Supervisor Sharma"
        )
        db.add(test_violation)
        db.commit()
        db.refresh(test_violation)

        claim_resp = client.get(f"/api/insurance/claims/{test_violation.violation_id}/assessment")
        assert claim_resp.status_code == 200, f"Claim assessment failed: {claim_resp.text}"
        claim_data = claim_resp.json()

        print(f"[OK] Assessment ID: {claim_data['assessment_id']}")
        print(f"[OK] Incident: {claim_data['incident_type']} in {claim_data['zone_name']}")
        print(f"[OK] Evidence Completeness: {claim_data['evidence_completeness']}%")
        print("Incident Evidence Checklist Items:")
        for chk in claim_data["checklist"]:
            print(f"   * [{chk['code']}] {chk['item_title']}: Attached={chk['is_attached']}")
            print(f"     Source: {chk['source']} (Table: {chk['source_table']}, Record ID: {chk['linked_record_id']})")
            if chk["evidence_snippet"]:
                print(f"     Linked Evidence: \"{chk['evidence_snippet'][:70]}...\" (Page {chk['evidence_page']})")

        # Verify CHK-01 has real violation image
        chk01 = next(c for c in claim_data["checklist"] if c["code"] == "CHK-01")
        assert chk01["is_attached"] == True
        assert chk01["linked_record_id"] == test_violation.violation_id

        # Verify CHK-03 has zone rule
        chk03 = next(c for c in claim_data["checklist"] if c["code"] == "CHK-03")
        assert chk03["is_attached"] == True
        assert chk03["source_table"] == "safety_zone_rules"

        # Verify CHK-04 has linked project compliance document
        chk04 = next(c for c in claim_data["checklist"] if c["code"] == "CHK-04")
        assert chk04["is_attached"] == True
        assert "BuildSure_Safety_Manual_PRJ-101.pdf" in chk04["source"]
        assert chk04["document_id"] == doc1.doc_id
        assert chk04["evidence_page"] is not None

        # Clean up test violation and temporary records
        db.delete(test_violation)
        db.delete(doc_empty)
        db.delete(doc2)
        db.delete(doc1)
        db.commit()

        print("\n" + "=" * 75)
        print(">>> ALL COMPLIANCE & INSURANCE DYNAMIC CHECKLIST TESTS PASSED! <<<")
        print("=" * 75)

    finally:
        db.close()

if __name__ == "__main__":
    run_comprehensive_tests()
