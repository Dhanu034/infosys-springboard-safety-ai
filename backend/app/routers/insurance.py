import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app import models, schemas_insurance as si
from app.services.insurance_engine import insurance_engine

router = APIRouter(prefix="/api/insurance", tags=["Insurance Intelligence"])


@router.get("/exposure-summary", response_model=si.InsuranceExposureSummary)
def get_insurance_exposure_summary(
    project_id: str = Query("PRJ-101"),
    db: Session = Depends(get_db)
):
    """
    Compute internal decision-support insurance exposure score (0-100),
    claim risk tier, and documentation completeness from existing safety records.
    """
    summary = insurance_engine.calculate_exposure_summary(db, project_id=project_id)
    return si.InsuranceExposureSummary(**summary)


@router.get("/claims", response_model=List[si.InsuranceClaimAssessmentResponse])
def get_all_claim_assessments(
    project_id: str = Query("PRJ-101"),
    decision_status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List all safety event insurance claim assessments and checklists."""
    # Ensure assessments exist for top high-severity violations
    violations = db.query(models.PPEViolation).filter(models.PPEViolation.project_id == project_id).all()
    for v in violations:
        existing = db.query(models.InsuranceAssessment).filter(models.InsuranceAssessment.violation_id == v.violation_id).first()
        if not existing:
            new_assessment = insurance_engine.generate_claim_assessment_for_violation(db, v)
            db.add(new_assessment)
    db.commit()

    query = db.query(models.InsuranceAssessment).filter(models.InsuranceAssessment.project_id == project_id)
    if decision_status:
        query = query.filter(models.InsuranceAssessment.decision_status == decision_status)
        
    assessments = query.order_by(desc(models.InsuranceAssessment.created_at)).all()
    results = []

    for a in assessments:
        v = db.query(models.PPEViolation).filter(models.PPEViolation.violation_id == a.violation_id).first()
        raw_checklist = json.loads(a.checklist_data) if a.checklist_data else []
        checklist_items = [si.ClaimChecklistItem(**item) for item in raw_checklist]

        results.append(si.InsuranceClaimAssessmentResponse(
            assessment_id=a.assessment_id,
            project_id=a.project_id,
            violation_id=a.violation_id,
            alert_id=a.alert_id,
            incident_type=v.violation_type if v else "Safety Zone Incident",
            zone_name=v.zone_name if v else "Site Zone",
            detected_at=v.detected_at if v else a.created_at,
            incident_severity=a.incident_severity,
            exposure_score=a.exposure_score,
            claim_risk_tier=a.claim_risk_tier,
            illustrative_liability_range=a.illustrative_liability_range or "Illustrative internal estimate ($10,000 - $25,000) — not an insurance quotation or claim value.",
            checklist=checklist_items,
            evidence_completeness=a.evidence_completeness,
            decision_status=a.decision_status,
            supervisor_notes=a.supervisor_notes,
            reviewed_by=a.reviewed_by,
            reviewed_at=a.reviewed_at,
            created_at=a.created_at,
            disclaimer=a.disclaimer or "Internal safety decision-support estimate only. Does not represent actual insurance policy terms, premiums, or claim settlements."
        ))

    return results


@router.get("/claims/{violation_id}/assessment", response_model=si.InsuranceClaimAssessmentResponse)
def get_claim_assessment_for_incident(
    violation_id: str,
    db: Session = Depends(get_db)
):
    """Retrieve or generate claim documentation checklist and exposure rating for a specific incident."""
    violation = db.query(models.PPEViolation).filter(models.PPEViolation.violation_id == violation_id).first()
    if not violation:
        raise HTTPException(status_code=404, detail="Safety violation record not found")

    assessment = db.query(models.InsuranceAssessment).filter(models.InsuranceAssessment.violation_id == violation_id).first()
    if not assessment:
        assessment = insurance_engine.generate_claim_assessment_for_violation(db, violation)
        db.add(assessment)
        db.commit()
        db.refresh(assessment)

    raw_checklist = json.loads(assessment.checklist_data) if assessment.checklist_data else []
    checklist_items = [si.ClaimChecklistItem(**item) for item in raw_checklist]

    return si.InsuranceClaimAssessmentResponse(
        assessment_id=assessment.assessment_id,
        project_id=assessment.project_id,
        violation_id=assessment.violation_id,
        alert_id=assessment.alert_id,
        incident_type=violation.violation_type,
        zone_name=violation.zone_name,
        detected_at=violation.detected_at,
        incident_severity=assessment.incident_severity,
        exposure_score=assessment.exposure_score,
        claim_risk_tier=assessment.claim_risk_tier,
        illustrative_liability_range=assessment.illustrative_liability_range or "Illustrative internal estimate — not an insurance quotation or claim value.",
        checklist=checklist_items,
        evidence_completeness=assessment.evidence_completeness,
        decision_status=assessment.decision_status,
        supervisor_notes=assessment.supervisor_notes,
        reviewed_by=assessment.reviewed_by,
        reviewed_at=assessment.reviewed_at,
        created_at=assessment.created_at,
        disclaimer=assessment.disclaimer or "Internal safety decision-support estimate only. Does not represent actual insurance policy terms, premiums, or claim settlements."
    )


@router.post("/claims/{assessment_id}/human-review", response_model=si.InsuranceClaimAssessmentResponse)
def submit_claim_human_review(
    assessment_id: str,
    review_req: si.InsuranceClaimReviewRequest,
    db: Session = Depends(get_db)
):
    """
    Human supervisor review and adjudication sign-off for an insurance claim assessment.
    Enforces human approval before any claim can be marked APPROVED_FOR_FILING.
    """
    assessment = db.query(models.InsuranceAssessment).filter(models.InsuranceAssessment.assessment_id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Insurance assessment record not found")

    assessment.decision_status = review_req.decision_status
    assessment.supervisor_notes = review_req.supervisor_notes
    assessment.reviewed_by = review_req.reviewed_by
    assessment.reviewed_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(assessment)

    violation = db.query(models.PPEViolation).filter(models.PPEViolation.violation_id == assessment.violation_id).first()
    raw_checklist = json.loads(assessment.checklist_data) if assessment.checklist_data else []
    checklist_items = [si.ClaimChecklistItem(**item) for item in raw_checklist]

    return si.InsuranceClaimAssessmentResponse(
        assessment_id=assessment.assessment_id,
        project_id=assessment.project_id,
        violation_id=assessment.violation_id,
        alert_id=assessment.alert_id,
        incident_type=violation.violation_type if violation else "Safety Incident",
        zone_name=violation.zone_name if violation else "Site Zone",
        detected_at=violation.detected_at if violation else assessment.created_at,
        incident_severity=assessment.incident_severity,
        exposure_score=assessment.exposure_score,
        claim_risk_tier=assessment.claim_risk_tier,
        illustrative_liability_range=assessment.illustrative_liability_range or "Illustrative internal estimate — not an insurance quotation or claim value.",
        checklist=checklist_items,
        evidence_completeness=assessment.evidence_completeness,
        decision_status=assessment.decision_status,
        supervisor_notes=assessment.supervisor_notes,
        reviewed_by=assessment.reviewed_by,
        reviewed_at=assessment.reviewed_at,
        created_at=assessment.created_at,
        disclaimer=assessment.disclaimer or "Internal safety decision-support estimate only. Does not represent actual insurance policy terms, premiums, or claim settlements."
    )
