import datetime
from app.database import SessionLocal, engine, Base
from app import models

Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    try:
        violation_count = db.query(models.PPEViolation).count()
        if violation_count == 0:
            print("[SeedScript] Seeding initial sample safety violations and alerts into database...")
            
            v1 = models.PPEViolation(
                project_id="PRJ-101",
                zone_name="Excavation Zone",
                camera_id="CAM-02",
                anonymous_worker_id="Worker-01",
                violation_type="missing_helmet",
                required_ppe="Helmet, Safety Vest",
                detected_ppe="Safety Vest",
                missing_ppe="Helmet",
                confidence_score=0.92,
                base_risk_score=60.0,
                zone_multiplier=1.2,
                final_risk_score=72.0,
                risk_category="High",
                decision_status="confirmed_violation",
                original_image_path="/uploads/sample_excavation.jpg",
                annotated_image_path="/results/sample_excavation_annotated.jpg",
                bounding_box_data='[120, 45, 280, 310]',
                detected_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
                status="OPEN"
            )
            
            v2 = models.PPEViolation(
                project_id="PRJ-101",
                zone_name="Work-at-Height Zone",
                camera_id="CAM-04",
                anonymous_worker_id="Worker-03",
                violation_type="missing_helmet_and_vest",
                required_ppe="Helmet, Safety Vest, Harness",
                detected_ppe="None",
                missing_ppe="Helmet, Safety Vest",
                confidence_score=0.88,
                base_risk_score=85.0,
                zone_multiplier=1.5,
                final_risk_score=100.0,
                risk_category="Critical",
                decision_status="confirmed_violation",
                original_image_path="/uploads/sample_height.jpg",
                annotated_image_path="/results/sample_height_annotated.jpg",
                bounding_box_data='[310, 80, 490, 420]',
                detected_at=datetime.datetime.utcnow() - datetime.timedelta(hours=1),
                status="OPEN"
            )

            db.add_all([v1, v2])
            db.flush()

            a1 = models.SafetyAlert(
                violation_id=v1.violation_id,
                project_id="PRJ-101",
                severity="HIGH",
                risk_score=72.0,
                title="PPE Violation: Worker-01 (Missing Helmet)",
                message="Ensure worker wears an approved safety helmet before continuing work in Excavation Zone.",
                status="OPEN",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
            )

            a2 = models.SafetyAlert(
                violation_id=v2.violation_id,
                project_id="PRJ-101",
                severity="CRITICAL",
                risk_score=100.0,
                title="PPE Violation: Worker-03 (Missing Helmet & Vest)",
                message="Temporarily pause worker's activity in Work-at-Height Zone and ensure required PPE is worn before work resumes.",
                status="OPEN",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=1)
            )

            db.add_all([a1, a2])
            db.commit()

            print("[SeedScript] Seeded 2 sample violations and alerts successfully.")
        else:
            print("[SeedScript] Database already contains records. Skipping seed.")
    except Exception as e:
        print(f"[SeedScript] Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
