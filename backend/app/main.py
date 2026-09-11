import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, SessionLocal
from app import models
from app.routers import safety, compliance, insurance

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BuildSure AI — Safety & Compliance Intelligence API",
    description="Backend service for YOLO Worker PPE Detection, SafetyAgent, Compliance Regulation Engine, and Insurance Intelligence (Milestones 2 & 3)",
    version="3.0.0"
)

@app.get("/")
def root():
    return {
        "message": "BuildSure AI — Safety & Compliance Intelligence API is running!",
        "docs": "http://127.0.0.1:8000/docs",
        "health": "http://127.0.0.1:8000/health",
        "frontend": "http://localhost:5173"
    }

# CORS Configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for Uploads and Result Images
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/results", StaticFiles(directory=settings.RESULTS_DIR), name="results")

# Include Routers (Safety remains isolated and untouched; Compliance and Insurance added)
app.include_router(safety.router)
app.include_router(compliance.router)
app.include_router(insurance.router)

# Seed Zone Rules and Regulatory Standards on Startup if empty
@app.on_event("startup")
def seed_default_zone_and_compliance_rules():
    db = SessionLocal()
    try:
        # 1. Seed Zone Rules
        count = db.query(models.SafetyZoneRule).count()
        if count == 0:
            default_rules = [
                models.SafetyZoneRule(zone_name="General Work Zone", requires_helmet=True, requires_vest=False, requires_harness=False, risk_multiplier=1.0),
                models.SafetyZoneRule(zone_name="Excavation Zone", requires_helmet=True, requires_vest=True, requires_harness=False, risk_multiplier=1.2),
                models.SafetyZoneRule(zone_name="Vehicle Movement Zone", requires_helmet=True, requires_vest=True, requires_harness=False, risk_multiplier=1.3),
                models.SafetyZoneRule(zone_name="Electrical Work Zone", requires_helmet=True, requires_vest=True, requires_harness=False, risk_multiplier=1.3),
                models.SafetyZoneRule(zone_name="Work-at-Height Zone", requires_helmet=True, requires_vest=True, requires_harness=True, risk_multiplier=1.5),
            ]
            db.add_all(default_rules)
            db.commit()
            print("[BuildSure AI] Seeded default Safety Zone Rules successfully.")

        # 2. Seed Regulatory Reference Rules
        rules_count = db.query(models.RegulatoryRule).count()
        if rules_count == 0:
            import json
            default_reg_rules = [
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
                )
            ]
            db.add_all(default_reg_rules)
            db.commit()
            print("[BuildSure AI] Seeded default Regulatory Reference Rules successfully.")

    except Exception as e:
        print(f"[BuildSure AI] Error seeding zone/compliance rules: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)

