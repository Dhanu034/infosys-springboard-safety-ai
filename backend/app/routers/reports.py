import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Response, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas_reports import ReportCommonEnvelope, ReportAuditLogResponse, TimelineEventResponse
from app.services import reporting_engine

router = APIRouter(
    prefix="/api/reports",
    tags=["Reporting Intelligence"]
)

def parse_iso_datetime(dt_str: Optional[str]) -> Optional[datetime.datetime]:
    if not dt_str:
        return None
    try:
        # Handle ISO strings or simple YYYY-MM-DD
        if len(dt_str) == 10:
            return datetime.datetime.strptime(dt_str, "%Y-%m-%d")
        return datetime.datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except Exception:
        return None


@router.get("/project-summary", response_model=ReportCommonEnvelope)
def get_project_summary_report(
    project_id: str = Query("PRJ-101", description="Project ID (PRJ-101, PRJ-102, PRJ-103)"),
    from_date: Optional[str] = Query(None, description="ISO or YYYY-MM-DD start date filter"),
    to_date: Optional[str] = Query(None, description="ISO or YYYY-MM-DD end date filter"),
    role: str = Query("Executive", description="Role view preset"),
    db: Session = Depends(get_db)
):
    dt_from = parse_iso_datetime(from_date)
    dt_to = parse_iso_datetime(to_date)
    return reporting_engine.get_executive_summary_report(db, project_id, dt_from, dt_to, role)


@router.get("/risk", response_model=ReportCommonEnvelope)
def get_site_risk_report(
    project_id: str = Query("PRJ-101"),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    role: str = Query("Executive"),
    db: Session = Depends(get_db)
):
    dt_from = parse_iso_datetime(from_date)
    dt_to = parse_iso_datetime(to_date)
    return reporting_engine.get_site_risk_report(db, project_id, dt_from, dt_to, role)


@router.get("/safety", response_model=ReportCommonEnvelope)
def get_ppe_safety_report(
    project_id: str = Query("PRJ-101"),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    role: str = Query("Safety Officer"),
    db: Session = Depends(get_db)
):
    dt_from = parse_iso_datetime(from_date)
    dt_to = parse_iso_datetime(to_date)
    return reporting_engine.get_ppe_safety_report(db, project_id, dt_from, dt_to, role)


@router.get("/compliance", response_model=ReportCommonEnvelope)
def get_compliance_report(
    project_id: str = Query("PRJ-101"),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    role: str = Query("Compliance Auditor"),
    db: Session = Depends(get_db)
):
    dt_from = parse_iso_datetime(from_date)
    dt_to = parse_iso_datetime(to_date)
    return reporting_engine.get_compliance_report(db, project_id, dt_from, dt_to, role)


@router.get("/incidents-alerts", response_model=ReportCommonEnvelope)
def get_incidents_alerts_report(
    project_id: str = Query("PRJ-101"),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    role: str = Query("Safety Officer"),
    db: Session = Depends(get_db)
):
    dt_from = parse_iso_datetime(from_date)
    dt_to = parse_iso_datetime(to_date)
    return reporting_engine.get_incidents_alerts_report(db, project_id, dt_from, dt_to, role)


@router.get("/insurance", response_model=ReportCommonEnvelope)
def get_insurance_report(
    project_id: str = Query("PRJ-101"),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    role: str = Query("Underwriter"),
    db: Session = Depends(get_db)
):
    dt_from = parse_iso_datetime(from_date)
    dt_to = parse_iso_datetime(to_date)
    return reporting_engine.get_insurance_report(db, project_id, dt_from, dt_to, role)


@router.get("/export")
def export_report(
    project_id: str = Query("PRJ-101"),
    report_type: str = Query("project_summary", description="project_summary, site_risk, ppe_safety, compliance, incidents_alerts, insurance"),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    role: str = Query("Executive"),
    format: str = Query("json", description="json, csv, html"),
    db: Session = Depends(get_db)
):
    dt_from = parse_iso_datetime(from_date)
    dt_to = parse_iso_datetime(to_date)

    if report_type == "site_risk":
        data = reporting_engine.get_site_risk_report(db, project_id, dt_from, dt_to, role)
    elif report_type == "ppe_safety":
        data = reporting_engine.get_ppe_safety_report(db, project_id, dt_from, dt_to, role)
    elif report_type == "compliance":
        data = reporting_engine.get_compliance_report(db, project_id, dt_from, dt_to, role)
    elif report_type == "incidents_alerts":
        data = reporting_engine.get_incidents_alerts_report(db, project_id, dt_from, dt_to, role)
    elif report_type == "insurance":
        data = reporting_engine.get_insurance_report(db, project_id, dt_from, dt_to, role)
    else:
        data = reporting_engine.get_executive_summary_report(db, project_id, dt_from, dt_to, role)

    # Automatically record audit log for export action
    reporting_engine.log_report_generation(db, project_id, report_type, role, dt_from, dt_to, format)

    if format == "csv":
        csv_content = reporting_engine.generate_csv_export(data)
        filename = f"buildsure_report_{project_id}_{report_type}_{datetime.datetime.utcnow().strftime('%Y%m%d')}.csv"
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    elif format == "html":
        html_content = reporting_engine.generate_html_export(data)
        return Response(content=html_content, media_type="text/html")
    else:
        return data


@router.get("/audit-logs", response_model=List[ReportAuditLogResponse])
def get_report_audit_logs(
    project_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    q = db.query(models.ReportAuditLog)
    if project_id:
        q = q.filter(models.ReportAuditLog.project_id == project_id)
    logs = q.order_by(models.ReportAuditLog.generated_at.desc()).limit(limit).all()
    return logs


@router.get("/timeline", response_model=List[TimelineEventResponse])
def get_risk_decision_timeline_events(
    project_id: str = Query("PRJ-101", description="Project identifier (e.g., PRJ-101, PRJ-102, PRJ-103)"),
    from_date: Optional[str] = Query(None, description="ISO or YYYY-MM-DD start filter"),
    to_date: Optional[str] = Query(None, description="ISO or YYYY-MM-DD end filter"),
    limit: int = Query(50, ge=1, le=100, description="Max timeline events to return"),
    db: Session = Depends(get_db)
):
    dt_from = parse_iso_datetime(from_date)
    dt_to = parse_iso_datetime(to_date)
    return reporting_engine.get_risk_decision_timeline(db, project_id, dt_from, dt_to, limit)

