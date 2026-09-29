import datetime
import csv
import io
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models

PROJECT_NAMES = {
    "PRJ-101": "Metro Station Expansion Site A",
    "PRJ-102": "High-Rise Residential Tower B",
    "PRJ-103": "Greenfield Industrial Warehouse Site C"
}

STANDARD_DISCLAIMERS = [
    "Automated AI Assessment & Reference Rule Match — Requires qualified Safety Supervisor review. Not a final legal or statutory regulatory certification.",
    "Internal safety decision-support estimate only — Does not represent actual insurance policy terms, premiums, or claim settlements.",
    "Computer vision telemetry is advisory decision support and does not guarantee accident prevention or absolute hazard elimination."
]

def log_report_generation(
    db: Session,
    project_id: str,
    report_type: str,
    user_role: str = "Executive",
    from_date: Optional[datetime.datetime] = None,
    to_date: Optional[datetime.datetime] = None,
    export_format: str = "view"
) -> models.ReportAuditLog:
    """Automatically record a ReportAuditLog entry in SQLite during report generation or export."""
    audit_entry = models.ReportAuditLog(
        project_id=project_id,
        report_type=report_type,
        user_role=user_role,
        from_date=from_date,
        to_date=to_date,
        export_format=export_format,
        generated_at=datetime.datetime.utcnow()
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry


def get_executive_summary_report(
    db: Session,
    project_id: str,
    from_date: Optional[datetime.datetime] = None,
    to_date: Optional[datetime.datetime] = None,
    user_role: str = "Executive"
) -> Dict[str, Any]:
    log_report_generation(db, project_id, "executive_summary", user_role, from_date, to_date, "view")
    
    # 1. PPE Violation Query (detected_at)
    v_query = db.query(models.PPEViolation).filter(models.PPEViolation.project_id == project_id)
    if from_date:
        v_query = v_query.filter(models.PPEViolation.detected_at >= from_date)
    if to_date:
        v_query = v_query.filter(models.PPEViolation.detected_at <= to_date)
    violations = v_query.all()

    # 2. Safety Alert Query (created_at)
    a_query = db.query(models.SafetyAlert).filter(models.SafetyAlert.project_id == project_id)
    if from_date:
        a_query = a_query.filter(models.SafetyAlert.created_at >= from_date)
    if to_date:
        a_query = a_query.filter(models.SafetyAlert.created_at <= to_date)
    alerts = a_query.all()

    # 3. Compliance Document Query (uploaded_at)
    d_query = db.query(models.ComplianceDocument).filter(models.ComplianceDocument.project_id == project_id)
    if from_date:
        d_query = d_query.filter(models.ComplianceDocument.uploaded_at >= from_date)
    if to_date:
        d_query = d_query.filter(models.ComplianceDocument.uploaded_at <= to_date)
    docs = d_query.all()

    # 4. Compliance Evaluation Query (evaluated_at)
    e_query = db.query(models.ComplianceEvaluation).filter(models.ComplianceEvaluation.project_id == project_id)
    if from_date:
        e_query = e_query.filter(models.ComplianceEvaluation.evaluated_at >= from_date)
    if to_date:
        e_query = e_query.filter(models.ComplianceEvaluation.evaluated_at <= to_date)
    evals = e_query.all()

    # 5. Inspection Schedule Query (due_date)
    s_query = db.query(models.InspectionSchedule).filter(models.InspectionSchedule.project_id == project_id)
    if from_date:
        s_query = s_query.filter(models.InspectionSchedule.due_date >= from_date)
    if to_date:
        s_query = s_query.filter(models.InspectionSchedule.due_date <= to_date)
    schedules = s_query.all()

    # 6. Insurance Assessment Query (created_at)
    i_query = db.query(models.InsuranceAssessment).filter(models.InsuranceAssessment.project_id == project_id)
    if from_date:
        i_query = i_query.filter(models.InsuranceAssessment.created_at >= from_date)
    if to_date:
        i_query = i_query.filter(models.InsuranceAssessment.created_at <= to_date)
    insurance_assessments = i_query.all()

    total_records = len(violations) + len(alerts) + len(docs) + len(evals) + len(schedules) + len(insurance_assessments)
    has_data = total_records > 0

    project_name = PROJECT_NAMES.get(project_id, f"Project {project_id}")

    if not has_data:
        return {
            "project_id": project_id,
            "project_name": project_name,
            "from_date": from_date,
            "to_date": to_date,
            "has_data": False,
            "records_count": 0,
            "generated_at": datetime.datetime.utcnow(),
            "data_sources": ["[DATABASE]"],
            "disclaimers": STANDARD_DISCLAIMERS,
            "metrics": {
                "message": "No records available for selected project and period.",
                "overall_risk_score": None,
                "risk_tier": None,
                "score_status": "INSUFFICIENT_DATA",
                "score_explanation": "No records available for selected project and period.",
                "safety_risk": None,
                "compliance_risk": None,
                "insurance_risk": None,
                "safety_score": None,
                "ppe_compliance_rate": None,
                "site_risk_score": None,
                "regulatory_compliance_rate": None,
                "insurance_exposure_score": None,
                "open_critical_alerts": 0,
                "open_violations": 0,
                "overdue_inspections": 0,
                "human_review_items": 0,
                "top_hazards": [],
                "high_risk_zones": [],
                "repeated_violations": [],
                "top_recommendations": [],
                "unresolved_actions": []
            }
        }

    # 1. Safety Dimension Telemetry
    valid_risk_scores = [v.final_risk_score for v in violations if v.final_risk_score is not None]
    if valid_risk_scores:
        avg_risk = sum(valid_risk_scores) / len(valid_risk_scores)
        safety_risk = round(avg_risk, 1)
        safety_score = round(max(0.0, min(100.0, 100.0 - avg_risk)), 1)
        site_risk_score = round(avg_risk, 1)
    else:
        safety_risk = None
        safety_score = None
        site_risk_score = None

    if violations:
        compliant_count = sum(1 for v in violations if v.decision_status == "compliant" or v.violation_type == "compliant")
        ppe_compliance_rate = round((compliant_count / len(violations)) * 100.0, 1)
    else:
        ppe_compliance_rate = None

    # 2. Compliance Dimension Telemetry
    if evals:
        comp_evals_count = sum(1 for ev in evals if ev.status == "compliant" or ev.human_reviewed)
        regulatory_compliance_rate = round((comp_evals_count / len(evals)) * 100.0, 1)
        # Compliance Risk: Percentage of non-compliant or missing-evidence evaluations
        non_comp_count = sum(1 for ev in evals if ev.status in ["non_compliant", "missing_evidence"])
        compliance_risk = round((non_comp_count / len(evals)) * 100.0, 1)
    else:
        regulatory_compliance_rate = None
        compliance_risk = None

    # 3. Insurance Dimension Telemetry
    exp_scores = [ia.exposure_score for ia in insurance_assessments if ia.exposure_score is not None]
    if exp_scores:
        insurance_exposure_score = round(sum(exp_scores) / len(exp_scores), 1)
        insurance_risk = insurance_exposure_score
    else:
        insurance_exposure_score = None
        insurance_risk = None

    # 4. Deterministic Unified Project Risk Score Computation
    # Formula: Unified Project Risk = round(0.35 * SafetyRisk + 0.35 * ComplianceRisk + 0.30 * InsuranceRisk)
    # Rule: Only calculate when all required source dimensions are available. Missing data must NOT be treated as zero.
    if safety_risk is not None and compliance_risk is not None and insurance_risk is not None:
        overall_risk_score = round(0.35 * safety_risk + 0.35 * compliance_risk + 0.30 * insurance_risk)
        if overall_risk_score >= 75:
            risk_tier = "CRITICAL"
        elif overall_risk_score >= 50:
            risk_tier = "HIGH"
        elif overall_risk_score >= 25:
            risk_tier = "MODERATE"
        else:
            risk_tier = "LOW"
        score_status = "CALCULATED"
        score_explanation = f"Unified Project Risk of {overall_risk_score}/100 computed via deterministic formula: 35% Safety ({safety_risk}) + 35% Compliance ({compliance_risk}) + 30% Insurance ({insurance_risk})."
    else:
        overall_risk_score = None
        risk_tier = None
        score_status = "INSUFFICIENT_DATA"
        missing = []
        if safety_risk is None: missing.append("Safety Risk")
        if compliance_risk is None: missing.append("Compliance Risk")
        if insurance_risk is None: missing.append("Insurance Risk")
        score_explanation = f"Unified score withheld: Missing required source dimensions ({', '.join(missing)}). Missing data is not treated as zero."

    # Counts & Human Review Items
    open_critical_alerts = sum(1 for a in alerts if a.severity == "CRITICAL" and a.status == "OPEN")
    open_violations = sum(1 for v in violations if v.status == "OPEN")
    overdue_inspections = sum(1 for s in schedules if s.status == "OVERDUE")
    human_review_items = (
        sum(1 for v in violations if v.decision_status == "needs_human_review") +
        sum(1 for ev in evals if ev.status == "needs_human_review" and not ev.human_reviewed) +
        sum(1 for ia in insurance_assessments if ia.decision_status == "PENDING_HUMAN_REVIEW")
    )

    # 5. Top Hazards, High-Risk Zones, and Repeated Violations
    zone_counts: Dict[str, int] = {}
    type_counts: Dict[str, int] = {}
    for v in violations:
        if v.zone_name:
            zone_counts[v.zone_name] = zone_counts.get(v.zone_name, 0) + 1
        if v.violation_type and v.violation_type != "compliant":
            type_counts[v.violation_type] = type_counts.get(v.violation_type, 0) + 1

    high_risk_zones = sorted(
        [{"zone_name": k, "violations_count": v} for k, v in zone_counts.items()],
        key=lambda x: x["violations_count"],
        reverse=True
    )

    repeated_violations = sorted(
        [{"violation_type": k, "occurrence_count": v} for k, v in type_counts.items() if v > 1],
        key=lambda x: x["occurrence_count"],
        reverse=True
    )

    top_hazards = [
        {
            "violation_id": v.violation_id,
            "zone_name": v.zone_name,
            "violation_type": v.violation_type,
            "risk_score": v.final_risk_score,
            "risk_category": v.risk_category,
            "detected_at": v.detected_at
        } for v in sorted(violations, key=lambda x: (x.final_risk_score or 0.0), reverse=True)[:5]
    ]

    # 6. Operational Recommendations derived deterministically from unresolved findings
    top_recommendations = []
    if open_critical_alerts > 0:
        top_recommendations.append(f"Immediate Action: Dispatch safety supervisor to acknowledge and resolve {open_critical_alerts} open CRITICAL safety alerts.")
    if overdue_inspections > 0:
        top_recommendations.append(f"Statutory Action: Schedule mandatory equipment/site audits for {overdue_inspections} OVERDUE inspection checkpoints.")
    if human_review_items > 0:
        top_recommendations.append(f"Compliance Action: Complete supervisor adjudication for {human_review_items} items flagged for human review.")
    if high_risk_zones:
        top_recommendations.append(f"Zone Protocol: Reinforce PPE compliance audits in '{high_risk_zones[0]['zone_name']}' which accounts for {high_risk_zones[0]['violations_count']} detected incidents.")
    if not top_recommendations and has_data:
        top_recommendations.append("Operational Status: All site telemetry indicators currently within normal operational safety parameters.")

    # Unresolved actions list for audit
    unresolved_actions = []
    for a in alerts:
        if a.status == "OPEN":
            unresolved_actions.append({
                "action_id": a.alert_id,
                "type": "OPEN_ALERT",
                "severity": a.severity,
                "title": a.title,
                "created_at": a.created_at
            })
    for s in schedules:
        if s.status == "OVERDUE":
            unresolved_actions.append({
                "action_id": s.schedule_id,
                "type": "OVERDUE_INSPECTION",
                "severity": "HIGH",
                "title": s.item_title,
                "created_at": s.due_date
            })

    return {
        "project_id": project_id,
        "project_name": project_name,
        "from_date": from_date,
        "to_date": to_date,
        "has_data": True,
        "records_count": total_records,
        "generated_at": datetime.datetime.utcnow(),
        "data_sources": ["[DATABASE]", "[YOLO VISION]", "[COMPLIANCE DOCS]", "[INSURANCE ADJUDICATIONS]"],
        "disclaimers": STANDARD_DISCLAIMERS,
        "metrics": {
            "overall_risk_score": overall_risk_score,
            "risk_tier": risk_tier,
            "score_status": score_status,
            "score_explanation": score_explanation,
            "safety_risk": safety_risk,
            "compliance_risk": compliance_risk,
            "insurance_risk": insurance_risk,
            "safety_score": safety_score,
            "ppe_compliance_rate": ppe_compliance_rate,
            "site_risk_score": site_risk_score,
            "regulatory_compliance_rate": regulatory_compliance_rate,
            "insurance_exposure_score": insurance_exposure_score,
            "open_critical_alerts": open_critical_alerts,
            "open_violations": open_violations,
            "overdue_inspections": overdue_inspections,
            "human_review_items": human_review_items,
            "total_violations": len(violations),
            "total_alerts": len(alerts),
            "total_documents": len(docs),
            "total_evaluations": len(evals),
            "top_hazards": top_hazards,
            "high_risk_zones": high_risk_zones[:5],
            "repeated_violations": repeated_violations[:5],
            "top_recommendations": top_recommendations[:5],
            "unresolved_actions": unresolved_actions[:10]
        }
    }



def get_site_risk_report(
    db: Session,
    project_id: str,
    from_date: Optional[datetime.datetime] = None,
    to_date: Optional[datetime.datetime] = None,
    user_role: str = "Executive"
) -> Dict[str, Any]:
    log_report_generation(db, project_id, "site_risk", user_role, from_date, to_date, "view")
    
    # Query PPEViolations & Zone Rules
    v_query = db.query(models.PPEViolation).filter(models.PPEViolation.project_id == project_id)
    if from_date:
        v_query = v_query.filter(models.PPEViolation.detected_at >= from_date)
    if to_date:
        v_query = v_query.filter(models.PPEViolation.detected_at <= to_date)
    violations = v_query.all()

    z_rules = db.query(models.SafetyZoneRule).filter(models.SafetyZoneRule.project_id == project_id).all()

    has_data = len(violations) > 0 or len(z_rules) > 0
    project_name = PROJECT_NAMES.get(project_id, f"Project {project_id}")

    if not has_data:
        return {
            "project_id": project_id,
            "project_name": project_name,
            "from_date": from_date,
            "to_date": to_date,
            "has_data": False,
            "records_count": 0,
            "generated_at": datetime.datetime.utcnow(),
            "data_sources": ["[DATABASE]", "[SPATIAL MODEL]"],
            "disclaimers": STANDARD_DISCLAIMERS,
            "metrics": {
                "message": "No records available for selected project and period.",
                "overall_site_risk_score": None,
                "high_risk_zone_count": 0,
                "zones_risk_breakdown": [],
                "recent_spatial_events": []
            }
        }

    # Aggregate by zone
    zones_map = {}
    for z in z_rules:
        zones_map[z.zone_name] = {
            "zone_name": z.zone_name,
            "risk_multiplier": z.risk_multiplier,
            "requires_helmet": z.requires_helmet,
            "requires_vest": z.requires_vest,
            "requires_harness": z.requires_harness,
            "violation_count": 0,
            "avg_risk_score": 0.0,
            "risk_scores": []
        }

    for v in violations:
        zname = v.zone_name or "General Work Zone"
        if zname not in zones_map:
            zones_map[zname] = {
                "zone_name": zname,
                "risk_multiplier": v.zone_multiplier or 1.0,
                "requires_helmet": True,
                "requires_vest": False,
                "requires_harness": False,
                "violation_count": 0,
                "avg_risk_score": 0.0,
                "risk_scores": []
            }
        zones_map[zname]["violation_count"] += 1
        if v.final_risk_score is not None:
            zones_map[zname]["risk_scores"].append(v.final_risk_score)

    zones_breakdown = []
    all_scores = []
    high_risk_zones = 0

    for zname, zdata in zones_map.items():
        scores = zdata["risk_scores"]
        avg_score = round(sum(scores) / len(scores), 1) if scores else (zdata["risk_multiplier"] * 30.0)
        zdata["avg_risk_score"] = avg_score
        all_scores.extend(scores)

        if avg_score >= 60.0 or zdata["risk_multiplier"] >= 1.4:
            high_risk_zones += 1

        del zdata["risk_scores"]
        zones_breakdown.append(zdata)

    overall_site_risk_score = round(sum(all_scores) / len(all_scores), 1) if all_scores else None

    return {
        "project_id": project_id,
        "project_name": project_name,
        "from_date": from_date,
        "to_date": to_date,
        "has_data": True,
        "records_count": len(violations),
        "generated_at": datetime.datetime.utcnow(),
        "data_sources": ["[DATABASE]", "[SPATIAL MODEL]"],
        "disclaimers": STANDARD_DISCLAIMERS,
        "metrics": {
            "overall_site_risk_score": overall_site_risk_score,
            "high_risk_zone_count": high_risk_zones,
            "total_monitored_zones": len(zones_breakdown),
            "zones_risk_breakdown": zones_breakdown,
            "recent_spatial_events": [
                {
                    "violation_id": v.violation_id,
                    "zone_name": v.zone_name,
                    "violation_type": v.violation_type,
                    "final_risk_score": v.final_risk_score,
                    "detected_at": v.detected_at
                } for v in violations[:10]
            ]
        }
    }


def get_ppe_safety_report(
    db: Session,
    project_id: str,
    from_date: Optional[datetime.datetime] = None,
    to_date: Optional[datetime.datetime] = None,
    user_role: str = "Executive"
) -> Dict[str, Any]:
    log_report_generation(db, project_id, "ppe_safety", user_role, from_date, to_date, "view")
    
    # Query PPEViolations (detected_at)
    v_query = db.query(models.PPEViolation).filter(models.PPEViolation.project_id == project_id)
    if from_date:
        v_query = v_query.filter(models.PPEViolation.detected_at >= from_date)
    if to_date:
        v_query = v_query.filter(models.PPEViolation.detected_at <= to_date)
    violations = v_query.all()

    # Query SafetyAlerts (created_at)
    a_query = db.query(models.SafetyAlert).filter(models.SafetyAlert.project_id == project_id)
    if from_date:
        a_query = a_query.filter(models.SafetyAlert.created_at >= from_date)
    if to_date:
        a_query = a_query.filter(models.SafetyAlert.created_at <= to_date)
    alerts = a_query.all()

    has_data = len(violations) > 0
    project_name = PROJECT_NAMES.get(project_id, f"Project {project_id}")

    if not has_data:
        return {
            "project_id": project_id,
            "project_name": project_name,
            "from_date": from_date,
            "to_date": to_date,
            "has_data": False,
            "records_count": 0,
            "generated_at": datetime.datetime.utcnow(),
            "data_sources": ["[DATABASE]", "[YOLO MODEL]"],
            "disclaimers": STANDARD_DISCLAIMERS,
            "metrics": {
                "message": "No records available for selected project and period.",
                "evaluated_workers_count": 0,
                "helmet_assessment_count": 0,
                "helmet_compliance_rate": None,
                "vest_assessment_count": 0,
                "vest_compliance_rate": None,
                "overall_ppe_compliant_worker_count": 0,
                "overall_ppe_compliance_rate": None,
                "mtta_minutes": None,
                "mtta_message": "No acknowledged alerts in selected period.",
                "mttr_minutes": None,
                "mttr_message": "No resolved alerts in selected period.",
                "violation_type_counts": {},
                "recent_scans": []
            }
        }

    # Denominators:
    evaluated_workers_count = len(violations)
    
    # Helmet & Vest counts
    # missing_helmet: helmet missing
    # missing_safety_vest: vest missing
    # missing_helmet_and_vest: both missing
    # compliant: both OK
    helmet_ok = 0
    vest_ok = 0
    overall_compliant = 0

    type_counts = {
        "missing_helmet": 0,
        "missing_safety_vest": 0,
        "missing_helmet_and_vest": 0,
        "compliant": 0,
        "needs_human_review": 0
    }

    for v in violations:
        vtype = v.violation_type or "needs_human_review"
        type_counts[vtype] = type_counts.get(vtype, 0) + 1

        has_helmet = (vtype not in ["missing_helmet", "missing_helmet_and_vest"])
        has_vest = (vtype not in ["missing_safety_vest", "missing_helmet_and_vest"])

        if has_helmet: helmet_ok += 1
        if has_vest: vest_ok += 1
        if v.decision_status == "compliant" or vtype == "compliant":
            overall_compliant += 1

    helmet_assessment_count = evaluated_workers_count
    helmet_compliance_rate = round((helmet_ok / helmet_assessment_count) * 100.0, 1) if helmet_assessment_count > 0 else None

    vest_assessment_count = evaluated_workers_count
    vest_compliance_rate = round((vest_ok / vest_assessment_count) * 100.0, 1) if vest_assessment_count > 0 else None

    overall_ppe_compliant_worker_count = overall_compliant
    overall_ppe_compliance_rate = round((overall_compliant / evaluated_workers_count) * 100.0, 1) if evaluated_workers_count > 0 else None

    # MTTA / MTTR calculation (Strictly null if 0)
    acknowledged_delays = []
    resolved_delays = []

    for v in violations:
        if v.acknowledged_at and v.detected_at:
            delta = (v.acknowledged_at - v.detected_at).total_seconds() / 60.0
            if delta >= 0: acknowledged_delays.append(delta)
        if v.resolved_at and v.detected_at:
            delta = (v.resolved_at - v.detected_at).total_seconds() / 60.0
            if delta >= 0: resolved_delays.append(delta)

    if len(acknowledged_delays) > 0:
        mtta_minutes = round(sum(acknowledged_delays) / len(acknowledged_delays), 1)
        mtta_message = f"Calculated from {len(acknowledged_delays)} acknowledged alerts."
    else:
        mtta_minutes = None
        mtta_message = "No acknowledged alerts in selected period."

    if len(resolved_delays) > 0:
        mttr_minutes = round(sum(resolved_delays) / len(resolved_delays), 1)
        mttr_message = f"Calculated from {len(resolved_delays)} resolved alerts."
    else:
        mttr_minutes = None
        mttr_message = "No resolved alerts in selected period."

    return {
        "project_id": project_id,
        "project_name": project_name,
        "from_date": from_date,
        "to_date": to_date,
        "has_data": True,
        "records_count": len(violations),
        "generated_at": datetime.datetime.utcnow(),
        "data_sources": ["[DATABASE]", "[YOLO MODEL]"],
        "disclaimers": STANDARD_DISCLAIMERS,
        "metrics": {
            "evaluated_workers_count": evaluated_workers_count,
            "helmet_assessment_count": helmet_assessment_count,
            "helmet_compliance_rate": helmet_compliance_rate,
            "vest_assessment_count": vest_assessment_count,
            "vest_compliance_rate": vest_compliance_rate,
            "overall_ppe_compliant_worker_count": overall_ppe_compliant_worker_count,
            "overall_ppe_compliance_rate": overall_ppe_compliance_rate,
            "mtta_minutes": mtta_minutes,
            "mtta_message": mtta_message,
            "mttr_minutes": mttr_minutes,
            "mttr_message": mttr_message,
            "violation_type_counts": type_counts,
            "recent_scans": [
                {
                    "violation_id": v.violation_id,
                    "worker_id": v.anonymous_worker_id,
                    "zone_name": v.zone_name,
                    "violation_type": v.violation_type,
                    "confidence_score": v.confidence_score,
                    "detected_at": v.detected_at
                } for v in violations[:10]
            ]
        }
    }


def get_compliance_report(
    db: Session,
    project_id: str,
    from_date: Optional[datetime.datetime] = None,
    to_date: Optional[datetime.datetime] = None,
    user_role: str = "Executive"
) -> Dict[str, Any]:
    log_report_generation(db, project_id, "compliance", user_role, from_date, to_date, "view")
    
    # Query ComplianceDocument (uploaded_at) & ComplianceEvaluation (evaluated_at)
    d_query = db.query(models.ComplianceDocument).filter(models.ComplianceDocument.project_id == project_id)
    if from_date:
        d_query = d_query.filter(models.ComplianceDocument.uploaded_at >= from_date)
    if to_date:
        d_query = d_query.filter(models.ComplianceDocument.uploaded_at <= to_date)
    docs = d_query.all()

    e_query = db.query(models.ComplianceEvaluation).filter(models.ComplianceEvaluation.project_id == project_id)
    if from_date:
        e_query = e_query.filter(models.ComplianceEvaluation.evaluated_at >= from_date)
    if to_date:
        e_query = e_query.filter(models.ComplianceEvaluation.evaluated_at <= to_date)
    evals = e_query.all()

    s_query = db.query(models.InspectionSchedule).filter(models.InspectionSchedule.project_id == project_id)
    if from_date:
        s_query = s_query.filter(models.InspectionSchedule.due_date >= from_date)
    if to_date:
        s_query = s_query.filter(models.InspectionSchedule.due_date <= to_date)
    schedules = s_query.all()

    total_records = len(docs) + len(evals) + len(schedules)
    has_data = total_records > 0
    project_name = PROJECT_NAMES.get(project_id, f"Project {project_id}")

    if not has_data:
        return {
            "project_id": project_id,
            "project_name": project_name,
            "from_date": from_date,
            "to_date": to_date,
            "has_data": False,
            "records_count": 0,
            "generated_at": datetime.datetime.utcnow(),
            "data_sources": ["[DATABASE]", "[IMPORTED PDF]"],
            "disclaimers": STANDARD_DISCLAIMERS,
            "metrics": {
                "message": "No records available for selected project and period.",
                "regulatory_compliance_rate": None,
                "human_verified_count": 0,
                "status_breakdown": {},
                "ingested_documents_count": 0,
                "overdue_inspections_count": 0,
                "inspection_schedules": [],
                "evaluations": []
            }
        }

    status_counts = {}
    human_verified = 0
    compliant_evals = 0

    for ev in evals:
        st = ev.status or "needs_human_review"
        status_counts[st] = status_counts.get(st, 0) + 1
        if ev.human_reviewed:
            human_verified += 1
        if st == "compliant" or ev.human_reviewed:
            compliant_evals += 1

    regulatory_compliance_rate = round((compliant_evals / len(evals)) * 100.0, 1) if evals else None
    overdue_inspections = sum(1 for s in schedules if s.status == "OVERDUE")

    return {
        "project_id": project_id,
        "project_name": project_name,
        "from_date": from_date,
        "to_date": to_date,
        "has_data": True,
        "records_count": total_records,
        "generated_at": datetime.datetime.utcnow(),
        "data_sources": ["[DATABASE]", "[IMPORTED PDF]"],
        "disclaimers": STANDARD_DISCLAIMERS,
        "metrics": {
            "regulatory_compliance_rate": regulatory_compliance_rate,
            "human_verified_count": human_verified,
            "status_breakdown": status_counts,
            "ingested_documents_count": len(docs),
            "overdue_inspections_count": overdue_inspections,
            "inspection_schedules": [
                {
                    "schedule_id": s.schedule_id,
                    "item_title": s.item_title,
                    "category": s.category,
                    "due_date": s.due_date,
                    "status": s.status
                } for s in schedules
            ],
            "evaluations": [
                {
                    "evaluation_id": ev.evaluation_id,
                    "doc_id": ev.doc_id,
                    "rule_id": ev.rule_id,
                    "status": ev.status,
                    "evidence_snippet": ev.evidence_snippet,
                    "evidence_page": ev.evidence_page,
                    "human_reviewed": ev.human_reviewed,
                    "reviewed_by": ev.reviewed_by,
                    "evaluated_at": ev.evaluated_at
                } for ev in evals[:15]
            ]
        }
    }


def get_incidents_alerts_report(
    db: Session,
    project_id: str,
    from_date: Optional[datetime.datetime] = None,
    to_date: Optional[datetime.datetime] = None,
    user_role: str = "Executive"
) -> Dict[str, Any]:
    log_report_generation(db, project_id, "incidents_alerts", user_role, from_date, to_date, "view")
    
    # Query SafetyAlert (created_at)
    a_query = db.query(models.SafetyAlert).filter(models.SafetyAlert.project_id == project_id)
    if from_date:
        a_query = a_query.filter(models.SafetyAlert.created_at >= from_date)
    if to_date:
        a_query = a_query.filter(models.SafetyAlert.created_at <= to_date)
    alerts = a_query.all()

    has_data = len(alerts) > 0
    project_name = PROJECT_NAMES.get(project_id, f"Project {project_id}")

    if not has_data:
        return {
            "project_id": project_id,
            "project_name": project_name,
            "from_date": from_date,
            "to_date": to_date,
            "has_data": False,
            "records_count": 0,
            "generated_at": datetime.datetime.utcnow(),
            "data_sources": ["[DATABASE]", "[DISPATCH HOOK]"],
            "disclaimers": STANDARD_DISCLAIMERS,
            "metrics": {
                "message": "No records available for selected project and period.",
                "total_alerts": 0,
                "severity_counts": {},
                "status_counts": {},
                "automation_status_counts": {},
                "recent_alerts": []
            }
        }

    sev_counts = {}
    st_counts = {}
    auto_counts = {}

    for a in alerts:
        s = a.severity or "MEDIUM"
        st = a.status or "OPEN"
        auto = a.automation_status or "Not Configured"
        sev_counts[s] = sev_counts.get(s, 0) + 1
        st_counts[st] = st_counts.get(st, 0) + 1
        auto_counts[auto] = auto_counts.get(auto, 0) + 1

    return {
        "project_id": project_id,
        "project_name": project_name,
        "from_date": from_date,
        "to_date": to_date,
        "has_data": True,
        "records_count": len(alerts),
        "generated_at": datetime.datetime.utcnow(),
        "data_sources": ["[DATABASE]", "[DISPATCH HOOK]"],
        "disclaimers": STANDARD_DISCLAIMERS,
        "metrics": {
            "total_alerts": len(alerts),
            "severity_counts": sev_counts,
            "status_counts": st_counts,
            "automation_status_counts": auto_counts,
            "recent_alerts": [
                {
                    "alert_id": a.alert_id,
                    "severity": a.severity,
                    "title": a.title,
                    "status": a.status,
                    "automation_status": a.automation_status,
                    "created_at": a.created_at
                } for a in alerts[:15]
            ]
        }
    }


def get_insurance_report(
    db: Session,
    project_id: str,
    from_date: Optional[datetime.datetime] = None,
    to_date: Optional[datetime.datetime] = None,
    user_role: str = "Executive"
) -> Dict[str, Any]:
    log_report_generation(db, project_id, "insurance", user_role, from_date, to_date, "view")
    
    # Query InsuranceAssessment (created_at)
    i_query = db.query(models.InsuranceAssessment).filter(models.InsuranceAssessment.project_id == project_id)
    if from_date:
        i_query = i_query.filter(models.InsuranceAssessment.created_at >= from_date)
    if to_date:
        i_query = i_query.filter(models.InsuranceAssessment.created_at <= to_date)
    assessments = i_query.all()

    has_data = len(assessments) > 0
    project_name = PROJECT_NAMES.get(project_id, f"Project {project_id}")

    if not has_data:
        return {
            "project_id": project_id,
            "project_name": project_name,
            "from_date": from_date,
            "to_date": to_date,
            "has_data": False,
            "records_count": 0,
            "generated_at": datetime.datetime.utcnow(),
            "data_sources": ["[DATABASE]", "[ACTUARIAL ESTIMATE]"],
            "disclaimers": STANDARD_DISCLAIMERS,
            "metrics": {
                "message": "No records available for selected project and period.",
                "insurance_exposure_score": None,
                "exposure_tier": None,
                "evidence_completeness_rate": None,
                "decision_status_counts": {},
                "assessments": []
            }
        }

    exp_scores = [ia.exposure_score for ia in assessments if ia.exposure_score is not None]
    avg_exp = round(sum(exp_scores) / len(exp_scores), 1) if exp_scores else None

    ev_rates = [ia.evidence_completeness for ia in assessments if ia.evidence_completeness is not None]
    avg_ev = round(sum(ev_rates) / len(ev_rates), 1) if ev_rates else None

    st_counts = {}
    for ia in assessments:
        st = ia.decision_status or "PENDING_HUMAN_REVIEW"
        st_counts[st] = st_counts.get(st, 0) + 1

    tier = "LOW"
    if avg_exp is not None:
        if avg_exp >= 75.0: tier = "CATASTROPHIC"
        elif avg_exp >= 60.0: tier = "HIGH"
        elif avg_exp >= 40.0: tier = "MODERATE"

    return {
        "project_id": project_id,
        "project_name": project_name,
        "from_date": from_date,
        "to_date": to_date,
        "has_data": True,
        "records_count": len(assessments),
        "generated_at": datetime.datetime.utcnow(),
        "data_sources": ["[DATABASE]", "[ACTUARIAL ESTIMATE]"],
        "disclaimers": STANDARD_DISCLAIMERS,
        "metrics": {
            "insurance_exposure_score": avg_exp,
            "exposure_tier": tier,
            "evidence_completeness_rate": avg_ev,
            "decision_status_counts": st_counts,
            "assessments": [
                {
                    "assessment_id": ia.assessment_id,
                    "incident_severity": ia.incident_severity,
                    "exposure_score": ia.exposure_score,
                    "claim_risk_tier": ia.claim_risk_tier,
                    "decision_status": ia.decision_status,
                    "evidence_completeness": ia.evidence_completeness,
                    "reviewed_by": ia.reviewed_by,
                    "created_at": ia.created_at
                } for ia in assessments[:15]
            ]
        }
    }


# =====================================================================
# Export Generators (CSV & Standalone Printable HTML)
# =====================================================================

def generate_csv_export(report_data: Dict[str, Any]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["=== BUILDSURE AI ENTERPRISE REPORTING INTELLIGENCE PROTOTYPE ==="])
    writer.writerow(["Project ID", report_data.get("project_id")])
    writer.writerow(["Project Name", report_data.get("project_name")])
    writer.writerow(["From Date", report_data.get("from_date") or "All Time"])
    writer.writerow(["To Date", report_data.get("to_date") or "Present"])
    writer.writerow(["Has Data", report_data.get("has_data")])
    writer.writerow(["Records Count", report_data.get("records_count")])
    writer.writerow(["Generated At", report_data.get("generated_at")])
    writer.writerow([])
    
    writer.writerow(["=== METRICS ==="])
    metrics = report_data.get("metrics", {})
    for k, v in metrics.items():
        if not isinstance(v, (list, dict)):
            writer.writerow([k, v if v is not None else "N/A"])

    writer.writerow([])
    writer.writerow(["=== DISCLAIMERS ==="])
    for d in report_data.get("disclaimers", []):
        writer.writerow([d])

    return output.getvalue()


def generate_html_export(report_data: Dict[str, Any]) -> str:
    metrics = report_data.get("metrics", {})
    has_data = report_data.get("has_data")

    metrics_html = ""
    for k, v in metrics.items():
        if not isinstance(v, (list, dict)):
            metrics_html += f"<tr><td style='padding:8px;border:1px solid #334155;'><strong>{k}</strong></td><td style='padding:8px;border:1px solid #334155;'>{v if v is not None else 'N/A'}</td></tr>"

    disclaimers_html = "".join([f"<li>{d}</li>" for d in report_data.get("disclaimers", [])])

    return f"""<!DOCTYPE html>
<html>
<head>
    <title>BuildSure AI Report - {report_data.get('project_id')}</title>
    <style>
        body {{ font-family: monospace, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; }}
        h1 {{ color: #38bdf8; border-bottom: 2px solid #0284c7; padding-bottom: 8px; }}
        .badge {{ background: #1e293b; border: 1px solid #0284c7; padding: 4px 8px; border-radius: 4px; color: #38bdf8; font-size: 12px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 16px; background: #1e293b; }}
        .disclaimer-box {{ background: #451a03; border: 1px solid #b45309; padding: 12px; border-radius: 6px; margin-top: 24px; font-size: 11px; color: #fde68a; }}
        @media print {{ body {{ background: #ffffff; color: #000000; }} table {{ background: #ffffff; color: #000000; }} .disclaimer-box {{ background: #fffbe6; color: #92400e; }} }}
    </style>
</head>
<body>
    <h1>BuildSure AI — Enterprise Reporting Intelligence Prototype</h1>
    <p><strong>Project:</strong> {report_data.get('project_name')} ({report_data.get('project_id')})</p>
    <p><strong>Period:</strong> {report_data.get('from_date') or 'All Time'} to {report_data.get('to_date') or 'Present'}</p>
    <p><strong>Generated At:</strong> {report_data.get('generated_at')}</p>
    <p><strong>Data Status:</strong> <span class="badge">{'HAS DATA (' + str(report_data.get('records_count')) + ' records)' if has_data else 'NO RECORDS AVAILABLE'}</span></p>

    <h2>Report Metrics Overview</h2>
    <table>
        <thead>
            <tr style="background:#0f172a;">
                <th style="padding:8px;border:1px solid #334155;text-align:left;">Metric Key</th>
                <th style="padding:8px;border:1px solid #334155;text-align:left;">Value</th>
            </tr>
        </thead>
        <tbody>
            {metrics_html if has_data else "<tr><td colspan='2' style='padding:16px;text-align:center;'>No records available for selected project and period.</td></tr>"}
        </tbody>
    </table>

    <div class="disclaimer-box">
        <strong>Mandatory Regulatory & Underwriting Disclaimers:</strong>
        <ul>{disclaimers_html}</ul>
    </div>
</body>
</html>
"""


# =====================================================================
# Milestone 4 Enhancement: Risk Decision Timeline
# =====================================================================

def get_risk_decision_timeline(
    db: Session,
    project_id: str,
    from_date: Optional[datetime.datetime] = None,
    to_date: Optional[datetime.datetime] = None,
    limit: int = 50
) -> List[Dict[str, Any]]:
    """
    Consolidates real chronological decision events across all existing agents & modules:
    - SafetyAgent (PPE Violations & Alerts)
    - ComplianceEngine (Evaluations & Inspection Schedules)
    - InsuranceEngine (Exposure Assessments & Claim Adjudications)
    - ReportingAgent (Audit Logs)
    Sorts events newest first. Returns empty list [] if no records exist.
    """
    events: List[Dict[str, Any]] = []

    # 1. PPE Violations from SafetyAgent
    try:
        v_query = db.query(models.PPEViolation).filter(models.PPEViolation.project_id == project_id)
        if from_date:
            v_query = v_query.filter(models.PPEViolation.detected_at >= from_date)
        if to_date:
            v_query = v_query.filter(models.PPEViolation.detected_at <= to_date)
        violations = v_query.all()
        for v in violations:
            is_compliant = v.violation_type == "compliant" or v.decision_status == "compliant"
            events.append({
                "event_id": f"EV-PPE-{v.violation_id[:8]}",
                "event_type": "PPE_COMPLIANCE_CHECK" if is_compliant else "PPE_VIOLATION",
                "timestamp": v.detected_at or datetime.datetime.utcnow(),
                "severity": "LOW" if is_compliant else (v.risk_category or "HIGH"),
                "title": "Worker PPE Verification: Compliant" if is_compliant else f"PPE Violation: {v.violation_type.replace('_', ' ').title()}",
                "description": f"Zone: {v.zone_name} • Risk Score: {v.final_risk_score} • Worker: {v.anonymous_worker_id}",
                "source_agent": "SafetyAgent (YOLO Vision)",
                "status": v.status or "OPEN",
                "reference_id": v.violation_id
            })
    except Exception as e:
        print(f"[Timeline] PPE violations extraction error: {e}")

    # 2. Safety Alerts from SafetyAgent
    try:
        a_query = db.query(models.SafetyAlert).filter(models.SafetyAlert.project_id == project_id)
        if from_date:
            a_query = a_query.filter(models.SafetyAlert.created_at >= from_date)
        if to_date:
            a_query = a_query.filter(models.SafetyAlert.created_at <= to_date)
        alerts = a_query.all()
        for a in alerts:
            events.append({
                "event_id": f"EV-ALT-{a.alert_id[:8]}",
                "event_type": "SAFETY_ALERT",
                "timestamp": a.created_at or datetime.datetime.utcnow(),
                "severity": a.severity or "HIGH",
                "title": f"Safety Alert: {a.title}",
                "description": a.message[:140] if a.message else "Automated safety threshold alert dispatched.",
                "source_agent": "SafetyAgent (Alert Dispatcher)",
                "status": a.status or "OPEN",
                "reference_id": a.alert_id
            })
    except Exception as e:
        print(f"[Timeline] Safety alerts extraction error: {e}")

    # 3. Compliance Evaluations from ComplianceEngine
    try:
        e_query = db.query(models.ComplianceEvaluation).filter(models.ComplianceEvaluation.project_id == project_id)
        if from_date:
            e_query = e_query.filter(models.ComplianceEvaluation.evaluated_at >= from_date)
        if to_date:
            e_query = e_query.filter(models.ComplianceEvaluation.evaluated_at <= to_date)
        evals = e_query.all()
        for ev in evals:
            sev = "HIGH" if ev.status in ["non_compliant", "missing_evidence"] else ("LOW" if ev.status == "compliant" else "MEDIUM")
            events.append({
                "event_id": f"EV-CMP-{ev.evaluation_id[:8]}",
                "event_type": "COMPLIANCE_EVALUATION",
                "timestamp": ev.evaluated_at or datetime.datetime.utcnow(),
                "severity": sev,
                "title": f"Regulatory Audit: {ev.status.replace('_', ' ').title()}",
                "description": f"{ev.status_label or 'Regulatory clause evaluated'} (Citation: Page {ev.evidence_page or 1})",
                "source_agent": "ComplianceEngine (OSHA/BOCW)",
                "status": ev.status,
                "reference_id": ev.evaluation_id
            })
    except Exception as e:
        print(f"[Timeline] Compliance evaluations extraction error: {e}")

    # 4. Inspection Schedules from ComplianceEngine
    try:
        s_query = db.query(models.InspectionSchedule).filter(models.InspectionSchedule.project_id == project_id)
        if from_date:
            s_query = s_query.filter(models.InspectionSchedule.due_date >= from_date)
        if to_date:
            s_query = s_query.filter(models.InspectionSchedule.due_date <= to_date)
        schedules = s_query.all()
        for s in schedules:
            sev = "CRITICAL" if s.status == "OVERDUE" else ("HIGH" if s.status == "DUE_SOON" else "LOW")
            events.append({
                "event_id": f"EV-SCH-{s.schedule_id[:8]}",
                "event_type": "INSPECTION_SCHEDULE",
                "timestamp": s.due_date or datetime.datetime.utcnow(),
                "severity": sev,
                "title": f"Inspection Milestone: {s.item_title}",
                "description": f"Category: {s.category} • Inspector: {s.assigned_inspector} • Status: {s.status}",
                "source_agent": "ComplianceEngine (Scheduler)",
                "status": s.status,
                "reference_id": s.schedule_id
            })
    except Exception as e:
        print(f"[Timeline] Inspection schedules extraction error: {e}")

    # 5. Insurance Assessments from InsuranceEngine
    try:
        i_query = db.query(models.InsuranceAssessment).filter(models.InsuranceAssessment.project_id == project_id)
        if from_date:
            i_query = i_query.filter(models.InsuranceAssessment.created_at >= from_date)
        if to_date:
            i_query = i_query.filter(models.InsuranceAssessment.created_at <= to_date)
        assessments = i_query.all()
        for ia in assessments:
            sev = ia.incident_severity or ("CRITICAL" if ia.claim_risk_tier == "CATASTROPHIC" else ("HIGH" if ia.claim_risk_tier == "HIGH" else "MEDIUM"))
            events.append({
                "event_id": f"EV-INS-{ia.assessment_id[:8]}",
                "event_type": "INSURANCE_ASSESSMENT",
                "timestamp": ia.created_at or datetime.datetime.utcnow(),
                "severity": sev,
                "title": f"Insurance Exposure: {ia.claim_risk_tier} Tier",
                "description": f"Exposure Score: {ia.exposure_score}/100 • Completeness: {ia.evidence_completeness}% • Decision: {ia.decision_status}",
                "source_agent": "InsuranceEngine (Actuarial)",
                "status": ia.decision_status,
                "reference_id": ia.assessment_id
            })
    except Exception as e:
        print(f"[Timeline] Insurance assessments extraction error: {e}")

    # 6. Report Audit Logs from ReportingAgent
    try:
        r_query = db.query(models.ReportAuditLog).filter(models.ReportAuditLog.project_id == project_id)
        if from_date:
            r_query = r_query.filter(models.ReportAuditLog.generated_at >= from_date)
        if to_date:
            r_query = r_query.filter(models.ReportAuditLog.generated_at <= to_date)
        audit_logs = r_query.all()
        for log in audit_logs:
            events.append({
                "event_id": f"EV-AUD-{log.log_id[:8]}",
                "event_type": "REPORT_AUDIT",
                "timestamp": log.generated_at or datetime.datetime.utcnow(),
                "severity": "INFO",
                "title": f"Report Audit: {log.report_type.replace('_', ' ').title()} ({log.export_format.upper()})",
                "description": f"Generated for {log.user_role} role",
                "source_agent": "ReportingAgent",
                "status": "LOGGED",
                "reference_id": log.log_id
            })
    except Exception as e:
        print(f"[Timeline] Report audit extraction error: {e}")

    # Sort newest first
    events.sort(key=lambda x: x["timestamp"], reverse=True)
    return events[:limit]

