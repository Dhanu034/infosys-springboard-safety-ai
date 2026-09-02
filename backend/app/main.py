import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, SessionLocal
from app import models
from app.routers import safety

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BuildSure AI — Safety Intelligence API",
    description="Backend service for YOLO Worker PPE Detection, SafetyAgent Analysis, and Safety Analytics (Milestone 2)",
    version="2.0.0"
)

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

# Include Routers
app.include_router(safety.router)

# Seed Zone Rules on Startup if empty
@app.on_event("startup")
def seed_default_zone_rules():
    db = SessionLocal()
    try:
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
    except Exception as e:
        print(f"[BuildSure AI] Error seeding zone rules: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)
