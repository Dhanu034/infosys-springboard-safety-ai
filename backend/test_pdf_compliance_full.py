import os
import sys

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app.database import SessionLocal
from app import models
from app.services.compliance_engine import compliance_engine
from app.services.document_extractor import document_extractor

def test_full_text_compliance():
    print("=== Testing Full Text PDF Extraction & Deterministic Rule Matching ===")
    
    # 1. Simulate an ingested document with OSHA and BOCW clauses across 3 pages
    sample_text = (
        "BUILDSURE CONSTRUCTION RISK INTELLIGENCE // PROJECT ALPHA\n"
        "SITE SAFETY AND REGULATORY COMPLIANCE PLAN 2026\n"
        "Issuing Authority: Directorate General of Factory Advice Service and Labour Institutes (DGFASLI)\n"
        "Issue Date: 15/01/2026\n"
        "Valid Until: 31/12/2026\n\n"
        "--- PAGE 1 ---\n"
        "SECTION 1: GENERAL SITE PPE RULES\n"
        "All workers, contractors, and site supervisors must wear protective helmets conforming to IS 2925 and ANSI Z89 hard hat standards at all times in active zones.\n\n"
        "--- PAGE 2 ---\n"
        "SECTION 2: WORK AT HEIGHT AND FALL ARREST SYSTEMS\n"
        "Employees on elevated platforms exceeding 6 feet height must be equipped with full body safety harness conforming to IS 3521 and anchored to certified life lines.\n\n"
        "--- PAGE 3 ---\n"
        "SECTION 3: SCAFFOLDING AND ELECTRICAL SAFETY\n"
        "All perimeter scaffolding shall be constructed with proper guardrails, toe boards, and safe access gangways. GFCI breakers must be tested monthly."
    )
    
    db = SessionLocal()
    try:
        # Create test document record
        test_doc = models.ComplianceDocument(
            project_id="PRJ-101",
            filename="site_safety_master_plan_2026.pdf",
            file_path="mock/path/site_safety_master_plan_2026.pdf",
            file_type="pdf",
            document_category="site_safety_plan",
            extracted_text=sample_text,
            page_count=3,
            extraction_method="pypdf",
            status="PROCESSED"
        )
        db.add(test_doc)
        db.commit()
        db.refresh(test_doc)
        
        # Evaluate against all active rules
        evaluations = compliance_engine.evaluate_document_against_rules(db, test_doc)
        
        print(f"[OK] Generated {len(evaluations)} rule evaluations:")
        for ev in evaluations:
            rule = db.query(models.RegulatoryRule).filter(models.RegulatoryRule.rule_id == ev.rule_id).first()
            print(f"     [{ev.status.upper()}] {rule.standard_code} ({rule.category}):")
            print(f"         Confidence: {ev.confidence} | Page: {ev.evidence_page} | Section: {ev.evidence_section}")
            print(f"         Snippet: {ev.evidence_snippet}")
            print(f"         Disclaimer: {ev.disclaimer}")
            print()
            
            # Assertions for regulatory safety
            assert ev.status in ["compliant", "non_compliant", "missing_evidence", "needs_human_review"]
            assert "Reference Rule Match" in ev.disclaimer
            assert ev.evidence_page in [1, 2, 3]

        # Clean up mock doc
        db.delete(test_doc)
        db.commit()
        print(">>> FULL TEXT COMPLIANCE ENGINE VERIFICATION PASSED! <<<")

    finally:
        db.close()

if __name__ == "__main__":
    test_full_text_compliance()
