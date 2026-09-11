import os
import sys
import json
import datetime

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app.database import SessionLocal, engine, Base
from app import models

def seed_regulatory_rules_and_schedules():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if rules already exist
        existing_rules_count = db.query(models.RegulatoryRule).count()
        if existing_rules_count == 0:
            rules_data = [
                # 1. OSHA 1926 Head Protection
                models.RegulatoryRule(
                    source_name="OSHA 1926 Safety and Health Regulations for Construction",
                    standard_code="OSHA 1926.100(a)",
                    jurisdiction="US — Federal (OSHA)",
                    version_or_reference_date="2026 Reference Edition",
                    category="Head Protection",
                    title="Head Protection Mandate in Hazard Areas",
                    requirement_summary="Employees working in areas where there is a possible danger of head injury from impact, falling or flying objects, or electrical shock shall be protected by protective helmets.",
                    mandatory_keywords=json.dumps(["helmet", "hard hat", "head protection", "protective helmets", "ansi z89", "impact protection"]),
                    penalty_severity="HIGH",
                    human_review_required=True,
                    is_active=True
                ),
                # 2. OSHA 1926 Fall Protection
                models.RegulatoryRule(
                    source_name="OSHA 1926 Safety and Health Regulations for Construction",
                    standard_code="OSHA 1926.501(b)(1)",
                    jurisdiction="US — Federal (OSHA)",
                    version_or_reference_date="2026 Reference Edition",
                    category="Fall Protection",
                    title="Duty to Have Fall Protection at 6 Feet or Higher",
                    requirement_summary="Each employee on a walking/working surface with an unprotected side or edge 6 feet (1.8 m) or more above a lower level shall be protected from falling by guardrails, safety nets, or personal fall arrest systems.",
                    mandatory_keywords=json.dumps(["fall protection", "guardrail", "safety harness", "lanyard", "anchor point", "fall arrest", "6 feet"]),
                    penalty_severity="CRITICAL",
                    human_review_required=True,
                    is_active=True
                ),
                # 3. India BOCW Central Rules 1998 - Rule 231 Head Protection
                models.RegulatoryRule(
                    source_name="Building and Other Construction Workers (BOCW) Central Rules 1998",
                    standard_code="BOCW-R231",
                    jurisdiction="India — Central (BOCW)",
                    version_or_reference_date="BOCW Act 1996 / Rules 1998",
                    category="Head Protection",
                    title="Safety Helmets Conforming to IS 2925",
                    requirement_summary="Every building worker at a construction site shall be provided with and shall wear an approved safety helmet conforming to Bureau of Indian Standards specification IS 2925.",
                    mandatory_keywords=json.dumps(["helmet", "is 2925", "hard hat", "bocw", "head gear", "bis specification"]),
                    penalty_severity="HIGH",
                    human_review_required=True,
                    is_active=True
                ),
                # 4. India BOCW Central Rules 1998 - Rule 212 Safety Belts & Harnesses
                models.RegulatoryRule(
                    source_name="Building and Other Construction Workers (BOCW) Central Rules 1998",
                    standard_code="BOCW-R212",
                    jurisdiction="India — Central (BOCW)",
                    version_or_reference_date="BOCW Act 1996 / Rules 1998",
                    category="Work at Height",
                    title="Safety Belts, Harnesses and Life Lines Conforming to IS 3521",
                    requirement_summary="Full body safety harnesses conforming to IS 3521 and anchored to secure lifelines shall be provided and used by all workers exposed to falls exceeding 2 meters.",
                    mandatory_keywords=json.dumps(["safety harness", "is 3521", "life line", "safety belt", "work at height", "anchorage", "fall protection"]),
                    penalty_severity="CRITICAL",
                    human_review_required=True,
                    is_active=True
                ),
                # 5. India Factories Act 1948 - Section 32
                models.RegulatoryRule(
                    source_name="The Factories Act 1948",
                    standard_code="FA-1948-S32",
                    jurisdiction="India — National (Factories Act)",
                    version_or_reference_date="Act 63 of 1948",
                    category="Access & Scaffolding",
                    title="Floors, Stairs and Means of Access Maintenance",
                    requirement_summary="All floors, steps, stairs, passages and gangways shall be of sound construction and properly maintained, with substantial handrails and unobstructed safe access.",
                    mandatory_keywords=json.dumps(["scaffolding", "gangway", "handrail", "safe access", "floor opening", "toe board", "passage"]),
                    penalty_severity="MEDIUM",
                    human_review_required=True,
                    is_active=True
                ),
                # 6. ISO 45001:2018 - Clause 8.1.2
                models.RegulatoryRule(
                    source_name="ISO 45001:2018 Occupational Health & Safety Management Systems",
                    standard_code="ISO 45001-8.1.2",
                    jurisdiction="International (ISO)",
                    version_or_reference_date="ISO 45001:2018",
                    category="PPE Governance",
                    title="Hierarchy of Controls & PPE Provision",
                    requirement_summary="The organization shall establish, implement and maintain processes for hazard elimination and OH&S risk reduction using the hierarchy of controls, including provision of adequate PPE.",
                    mandatory_keywords=json.dumps(["hierarchy of controls", "personal protective equipment", "ppe", "risk assessment", "hazard identification", "iso 45001"]),
                    penalty_severity="HIGH",
                    human_review_required=True,
                    is_active=True
                )
            ]
            db.add_all(rules_data)
            db.commit()
            print(f"[Seed] Added {len(rules_data)} baseline regulatory rules.")
        else:
            print(f"[Seed] Regulatory rules already present ({existing_rules_count} records).")

        # Check if inspection schedules exist
        existing_schedules_count = db.query(models.InspectionSchedule).count()
        if existing_schedules_count == 0:
            now = datetime.datetime.utcnow()
            schedules_data = [
                models.InspectionSchedule(
                    project_id="PRJ-101",
                    item_title="Tower Crane Structural & Cable Inspection",
                    category="Heavy Equipment",
                    due_date=now + datetime.timedelta(days=4),
                    frequency_days=30,
                    assigned_inspector="Senior Mechanical Inspector",
                    status="DUE_SOON"
                ),
                models.InspectionSchedule(
                    project_id="PRJ-101",
                    item_title="Scaffolding Rigidity & Toe-Board Verification",
                    category="Site Safety",
                    due_date=now + datetime.timedelta(days=12),
                    frequency_days=14,
                    assigned_inspector="Civil Safety Officer",
                    status="UPCOMING"
                ),
                models.InspectionSchedule(
                    project_id="PRJ-101",
                    item_title="Temporary Electrical Distribution & GFCI Breakers",
                    category="Electrical Safety",
                    due_date=now - datetime.timedelta(days=2),
                    frequency_days=30,
                    assigned_inspector="Electrical Safety Lead",
                    status="OVERDUE"
                ),
                models.InspectionSchedule(
                    project_id="PRJ-101",
                    item_title="Full Body Harness IS 3521 Load Certification",
                    category="PPE Certification",
                    due_date=now + datetime.timedelta(days=28),
                    frequency_days=180,
                    assigned_inspector="Equipment QA Auditor",
                    status="UPCOMING"
                )
            ]
            db.add_all(schedules_data)
            db.commit()
            print(f"[Seed] Added {len(schedules_data)} baseline inspection schedules.")
        else:
            print(f"[Seed] Inspection schedules already present ({existing_schedules_count} records).")

    except Exception as e:
        db.rollback()
        print(f"[Seed Error] Failed to seed compliance data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_regulatory_rules_and_schedules()
