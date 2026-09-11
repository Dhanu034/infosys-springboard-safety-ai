import os
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.config import settings
from app.database import get_db
from app import models, schemas_compliance as sc
from app.services.document_extractor import document_extractor
from app.services.compliance_engine import compliance_engine

router = APIRouter(prefix="/api/compliance", tags=["Compliance Intelligence"])


@router.post("/documents/upload", response_model=sc.ComplianceDocumentResponse)
async def upload_compliance_document(
    file: UploadFile = File(...),
    project_id: str = Form("PRJ-101"),
    document_category: str = Form("site_safety_plan"),
    db: Session = Depends(get_db)
):
    """
    Upload a compliance document (PDF or scanned image).
    Applies multi-tier text extraction (pypdf first -> pytesseract OCR fallback -> needs_human_review).
    Automatically triggers rule-based compliance validation.
    """
    # 1. Read file content and validate
    content = await file.read()
    file_size = len(content)

    val_result = document_extractor.validate_file(file.filename, file_size)
    if not val_result["valid"]:
        raise HTTPException(status_code=400, detail=val_result["error"])

    # 2. Sanitize filename and save securely
    secure_filename = document_extractor.sanitize_filename(file.filename)
    save_path = os.path.join(settings.DOCUMENTS_DIR, secure_filename)

    with open(save_path, "wb") as f:
        f.write(content)

    # 3. Extract text content via multi-tier extractor
    ext_result = document_extractor.extract_content(save_path)
    file_ext = os.path.splitext(file.filename)[1].lower().replace(".", "")

    # 4. Create document record in database
    doc_record = models.ComplianceDocument(
        project_id=project_id,
        filename=file.filename,
        file_path=save_path,
        file_type=file_ext,
        document_category=document_category,
        extracted_text=ext_result.get("full_text", ""),
        page_count=ext_result.get("page_count", 1),
        extraction_method=ext_result.get("extraction_method", "pypdf"),
        ocr_confidence=ext_result.get("ocr_confidence"),
        issuing_authority=ext_result.get("issuing_authority"),
        issue_date=ext_result.get("issue_date"),
        expiry_date=ext_result.get("expiry_date"),
        status=ext_result.get("status", "PROCESSED"),
        review_notes=ext_result.get("review_notes")
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    # 5. Automatically evaluate document against active regulatory rules
    evaluations = compliance_engine.evaluate_document_against_rules(db, doc_record)
    if evaluations:
        db.add_all(evaluations)
        db.commit()

    # 6. Format preview
    preview = doc_record.extracted_text[:300] if doc_record.extracted_text else "No text extracted."
    
    return sc.ComplianceDocumentResponse(
        doc_id=doc_record.doc_id,
        project_id=doc_record.project_id,
        filename=doc_record.filename,
        file_type=doc_record.file_type,
        document_category=doc_record.document_category,
        page_count=doc_record.page_count,
        extraction_method=doc_record.extraction_method,
        ocr_confidence=doc_record.ocr_confidence,
        issuing_authority=doc_record.issuing_authority,
        issue_date=doc_record.issue_date,
        expiry_date=doc_record.expiry_date,
        uploaded_at=doc_record.uploaded_at,
        status=doc_record.status,
        extracted_text_preview=preview
    )


@router.get("/documents", response_model=List[sc.ComplianceDocumentResponse])
def get_compliance_documents(
    project_id: str = Query("PRJ-101"),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List all compliance documents for a project."""
    query = db.query(models.ComplianceDocument).filter(models.ComplianceDocument.project_id == project_id)
    if category:
        query = query.filter(models.ComplianceDocument.document_category == category)
    
    docs = query.order_by(desc(models.ComplianceDocument.uploaded_at)).all()
    
    results = []
    for d in docs:
        preview = d.extracted_text[:300] if d.extracted_text else "No text extracted."
        results.append(sc.ComplianceDocumentResponse(
            doc_id=d.doc_id,
            project_id=d.project_id,
            filename=d.filename,
            file_type=d.file_type,
            document_category=d.document_category,
            page_count=d.page_count,
            extraction_method=d.extraction_method,
            ocr_confidence=d.ocr_confidence,
            issuing_authority=d.issuing_authority,
            issue_date=d.issue_date,
            expiry_date=d.expiry_date,
            uploaded_at=d.uploaded_at,
            status=d.status,
            extracted_text_preview=preview
        ))
    return results


@router.get("/documents/{doc_id}", response_model=sc.ComplianceDocumentResponse)
def get_compliance_document_details(doc_id: str, db: Session = Depends(get_db)):
    """Get single document metadata and text preview."""
    doc = db.query(models.ComplianceDocument).filter(models.ComplianceDocument.doc_id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Compliance document not found")
    
    preview = doc.extracted_text[:500] if doc.extracted_text else "No text extracted."
    return sc.ComplianceDocumentResponse(
        doc_id=doc.doc_id,
        project_id=doc.project_id,
        filename=doc.filename,
        file_type=doc.file_type,
        document_category=doc.document_category,
        page_count=doc.page_count,
        extraction_method=doc.extraction_method,
        ocr_confidence=doc.ocr_confidence,
        issuing_authority=doc.issuing_authority,
        issue_date=doc.issue_date,
        expiry_date=doc.expiry_date,
        uploaded_at=doc.uploaded_at,
        status=doc.status,
        extracted_text_preview=preview
    )


@router.delete("/documents/{doc_id}")
def delete_compliance_document(doc_id: str, db: Session = Depends(get_db)):
    """Delete a compliance document and its linked evaluations."""
    doc = db.query(models.ComplianceDocument).filter(models.ComplianceDocument.doc_id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Compliance document not found")
    
    # Delete physical file if exists
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass
            
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully", "doc_id": doc_id}


@router.get("/regulations", response_model=List[sc.RegulatoryRuleResponse])
def get_regulatory_rules(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve all regulatory standards and reference rules from the knowledge base."""
    query = db.query(models.RegulatoryRule).filter(models.RegulatoryRule.is_active == True)
    if category:
        query = query.filter(models.RegulatoryRule.category == category)
    return query.all()


@router.get("/evaluations", response_model=List[sc.ComplianceEvaluationResponse])
def get_compliance_evaluations(
    project_id: str = Query("PRJ-101"),
    status: Optional[str] = Query(None),
    doc_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get all rule-based compliance evaluation records with page citations and evidence snippets.
    Supports filtering by status: compliant, non_compliant, missing_evidence, needs_human_review.
    """
    query = db.query(models.ComplianceEvaluation).filter(models.ComplianceEvaluation.project_id == project_id)
    if status:
        query = query.filter(models.ComplianceEvaluation.status == status)
    if doc_id:
        query = query.filter(models.ComplianceEvaluation.doc_id == doc_id)

    evals = query.order_by(desc(models.ComplianceEvaluation.evaluated_at)).all()
    results = []
    
    for ev in evals:
        rule = ev.rule or db.query(models.RegulatoryRule).filter(models.RegulatoryRule.rule_id == ev.rule_id).first()
        doc = ev.document or (db.query(models.ComplianceDocument).filter(models.ComplianceDocument.doc_id == ev.doc_id).first() if ev.doc_id else None)
        
        results.append(sc.ComplianceEvaluationResponse(
            evaluation_id=ev.evaluation_id,
            project_id=ev.project_id,
            doc_id=ev.doc_id,
            document_filename=doc.filename if doc else "Reference Safety Record",
            rule_id=ev.rule_id,
            standard_code=rule.standard_code if rule else "OSHA/BOCW-REF",
            source_name=rule.source_name if rule else "Standard Safety Regulation",
            jurisdiction=rule.jurisdiction if rule else "Reference Rule Match — Human Verification Required",
            category=rule.category if rule else "General Safety",
            status=ev.status,
            status_label=ev.status_label or "Rule-based compliance indication",
            confidence=ev.confidence or 0.85,
            matched_clause=ev.matched_clause,
            evidence_snippet=ev.evidence_snippet,
            evidence_page=ev.evidence_page or 1,
            evidence_section=ev.evidence_section,
            extraction_method=ev.extraction_method or "pypdf",
            evaluated_at=ev.evaluated_at,
            human_reviewed=ev.human_reviewed,
            reviewed_by=ev.reviewed_by,
            review_notes=ev.review_notes,
            disclaimer="Reference Rule Match — Human Verification Required. Not a legal or regulatory certification."
        ))
    return results


@router.post("/evaluations/{eval_id}/review", response_model=sc.ComplianceEvaluationResponse)
def review_compliance_evaluation(
    eval_id: str,
    review_req: sc.ComplianceReviewRequest,
    db: Session = Depends(get_db)
):
    """Human supervisor validation and override review for a compliance evaluation item."""
    evaluation = db.query(models.ComplianceEvaluation).filter(models.ComplianceEvaluation.evaluation_id == eval_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Compliance evaluation not found")

    evaluation.human_reviewed = True
    evaluation.reviewed_by = review_req.reviewed_by
    evaluation.review_notes = review_req.review_notes
    if review_req.status_override:
        evaluation.status = review_req.status_override
        if review_req.status_override == "compliant":
            evaluation.status_label = "Rule-based compliance indication (Supervisor Verified)"
        elif review_req.status_override == "non_compliant":
            evaluation.status_label = "Non-compliant indication (Supervisor Confirmed)"

    db.commit()
    db.refresh(evaluation)

    rule = evaluation.rule
    doc = evaluation.document
    return sc.ComplianceEvaluationResponse(
        evaluation_id=evaluation.evaluation_id,
        project_id=evaluation.project_id,
        doc_id=evaluation.doc_id,
        document_filename=doc.filename if doc else "Safety Policy Doc",
        rule_id=evaluation.rule_id,
        standard_code=rule.standard_code if rule else "OSHA/BOCW-REF",
        source_name=rule.source_name if rule else "Safety Regulation",
        jurisdiction=rule.jurisdiction if rule else "Reference Rule Match — Human Verification Required",
        category=rule.category if rule else "General Safety",
        status=evaluation.status,
        status_label=evaluation.status_label,
        confidence=evaluation.confidence,
        matched_clause=evaluation.matched_clause,
        evidence_snippet=evaluation.evidence_snippet,
        evidence_page=evaluation.evidence_page,
        evidence_section=evaluation.evidence_section,
        extraction_method=evaluation.extraction_method,
        evaluated_at=evaluation.evaluated_at,
        human_reviewed=evaluation.human_reviewed,
        reviewed_by=evaluation.reviewed_by,
        review_notes=evaluation.review_notes,
        disclaimer="Reference Rule Match — Human Verification Required. Not a legal or regulatory certification."
    )


@router.get("/schedules", response_model=List[sc.InspectionScheduleResponse])
def get_inspection_schedules(
    project_id: str = Query("PRJ-101"),
    db: Session = Depends(get_db)
):
    """Retrieve inspection and renewal due-date tracking items with updated dynamic status."""
    schedules = db.query(models.InspectionSchedule).filter(models.InspectionSchedule.project_id == project_id).all()
    results = []

    for s in schedules:
        stat_info = compliance_engine.compute_schedule_status(s.due_date)
        s.status = stat_info["status"]
        results.append(sc.InspectionScheduleResponse(
            schedule_id=s.schedule_id,
            project_id=s.project_id,
            item_title=s.item_title,
            category=s.category,
            due_date=s.due_date,
            frequency_days=s.frequency_days,
            assigned_inspector=s.assigned_inspector,
            last_inspected_at=s.last_inspected_at,
            status=stat_info["status"],
            days_until_due=stat_info["days_until_due"]
        ))
    db.commit()
    return results


@router.post("/schedules", response_model=sc.InspectionScheduleResponse)
def create_inspection_schedule(
    item: sc.InspectionScheduleCreate,
    db: Session = Depends(get_db)
):
    """Add a new inspection or certification renewal tracking item."""
    stat_info = compliance_engine.compute_schedule_status(item.due_date)
    record = models.InspectionSchedule(
        project_id=item.project_id,
        item_title=item.item_title,
        category=item.category,
        due_date=item.due_date,
        frequency_days=item.frequency_days,
        assigned_inspector=item.assigned_inspector,
        status=stat_info["status"]
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return sc.InspectionScheduleResponse(
        schedule_id=record.schedule_id,
        project_id=record.project_id,
        item_title=record.item_title,
        category=record.category,
        due_date=record.due_date,
        frequency_days=record.frequency_days,
        assigned_inspector=record.assigned_inspector,
        last_inspected_at=record.last_inspected_at,
        status=record.status,
        days_until_due=stat_info["days_until_due"]
    )


@router.get("/report", response_model=sc.ComplianceReportResponse)
def get_compliance_audit_report(
    project_id: str = Query("PRJ-101"),
    db: Session = Depends(get_db)
):
    """Generate structured compliance audit summary report."""
    docs_count = db.query(models.ComplianceDocument).filter(models.ComplianceDocument.project_id == project_id).count()
    evals = db.query(models.ComplianceEvaluation).filter(models.ComplianceEvaluation.project_id == project_id).all()
    schedules = db.query(models.InspectionSchedule).filter(models.InspectionSchedule.project_id == project_id).all()

    total_evals = len(evals)
    compliant_count = sum(1 for e in evals if e.status == "compliant")
    non_compliant_count = sum(1 for e in evals if e.status == "non_compliant")
    missing_count = sum(1 for e in evals if e.status == "missing_evidence")
    review_count = sum(1 for e in evals if e.status == "needs_human_review")

    rate = round((compliant_count / max(1, total_evals)) * 100.0, 1) if total_evals > 0 else 0.0

    eval_responses = []
    for ev in evals:
        rule = ev.rule
        doc = ev.document
        eval_responses.append(sc.ComplianceEvaluationResponse(
            evaluation_id=ev.evaluation_id,
            project_id=ev.project_id,
            doc_id=ev.doc_id,
            document_filename=doc.filename if doc else "Safety Policy Doc",
            rule_id=ev.rule_id,
            standard_code=rule.standard_code if rule else "OSHA/BOCW-REF",
            source_name=rule.source_name if rule else "Safety Regulation",
            jurisdiction=rule.jurisdiction if rule else "Reference Rule Match — Human Verification Required",
            category=rule.category if rule else "General Safety",
            status=ev.status,
            status_label=ev.status_label,
            confidence=ev.confidence,
            matched_clause=ev.matched_clause,
            evidence_snippet=ev.evidence_snippet,
            evidence_page=ev.evidence_page,
            evidence_section=ev.evidence_section,
            extraction_method=ev.extraction_method,
            evaluated_at=ev.evaluated_at,
            human_reviewed=ev.human_reviewed,
            reviewed_by=ev.reviewed_by,
            review_notes=ev.review_notes,
            disclaimer="Reference Rule Match — Human Verification Required. Not a legal or regulatory certification."
        ))

    sched_responses = []
    for s in schedules:
        stat_info = compliance_engine.compute_schedule_status(s.due_date)
        sched_responses.append(sc.InspectionScheduleResponse(
            schedule_id=s.schedule_id,
            project_id=s.project_id,
            item_title=s.item_title,
            category=s.category,
            due_date=s.due_date,
            frequency_days=s.frequency_days,
            assigned_inspector=s.assigned_inspector,
            last_inspected_at=s.last_inspected_at,
            status=stat_info["status"],
            days_until_due=stat_info["days_until_due"]
        ))

    return sc.ComplianceReportResponse(
        project_id=project_id,
        generated_at=datetime.datetime.utcnow(),
        total_documents_analyzed=docs_count,
        total_rules_evaluated=total_evals,
        compliance_rate=rate,
        status_breakdown={
            "compliant": compliant_count,
            "non_compliant": non_compliant_count,
            "missing_evidence": missing_count,
            "needs_human_review": review_count
        },
        evaluations=eval_responses,
        upcoming_inspections=sched_responses,
        disclaimer="Automated AI Assessment & Rule-Based Compliance Indication — Requires Qualified Safety Supervisor Review Before Legal Filing."
    )
