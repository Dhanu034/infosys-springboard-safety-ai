# BuildSure AI — Compliance & Insurance Intelligence API Specification (Milestone 3)

## Overview
This document specifies the isolated REST API contracts for **BuildSure AI Milestone 3: Compliance & Insurance Intelligence**.

> [!IMPORTANT]
> **Regulatory & Legal Safeguards**:
> - All compliance evaluations represent **"Rule-based compliance indications"** and **"Needs Human Review"**. They do not constitute official OSHA, ISO, or statutory legal certifications.
> - Insurance exposure calculations are **internal decision-support estimates** and do not represent insurance policies, premiums, or claim settlements.
> - `APPROVED_FOR_FILING` is an **internal supervisor workflow status only** and does not constitute legal approval.

---

## 1. Compliance Intelligence Endpoints (`/api/compliance/*`)

### `POST /api/compliance/documents/upload`
Uploads a compliance document (PDF or scanned image) and performs multi-tier text extraction and rule evaluation.

- **Request**: `multipart/form-data`
  - `file`: Binary file (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`, `.tiff` - max 15MB)
  - `project_id`: string (default `"PRJ-101"`)
  - `document_category`: string (`site_safety_plan`, `equipment_cert`, `inspection_log`, `permit_to_work`, `training_cert`, `insurance_policy`)

- **Response (200 OK)**:
```json
{
  "doc_id": "88e48f36-62dc-41bf-a2a0-2e29e8fb2ffa",
  "project_id": "PRJ-101",
  "filename": "site_safety_plan_2026.pdf",
  "file_type": "pdf",
  "document_category": "site_safety_plan",
  "page_count": 2,
  "extraction_method": "pypdf",
  "ocr_confidence": null,
  "issuing_authority": "Building and Other Construction Workers Board",
  "issue_date": "2026-01-15T00:00:00Z",
  "expiry_date": "2027-12-31T00:00:00Z",
  "uploaded_at": "2026-09-11T13:45:00Z",
  "status": "PROCESSED",
  "extracted_text_preview": "BUILDSURE SITE SAFETY PLAN..."
}
```

---

### `GET /api/compliance/documents`
Lists all uploaded compliance documents for a project.

- **Query Parameters**:
  - `project_id`: string (default `"PRJ-101"`)
  - `category`: optional string filter

- **Response (200 OK)**: Array of `ComplianceDocumentResponse`.

---

### `GET /api/compliance/regulations`
Retrieves regulatory reference standards from the knowledge base (OSHA 1926, BOCW 1998, Factories Act 1948, ISO 45001).

- **Response (200 OK)**:
```json
[
  {
    "rule_id": "rule-01",
    "source_name": "Building and Other Construction Workers (BOCW) Central Rules 1998",
    "standard_code": "BOCW-R231",
    "jurisdiction": "India — Central (BOCW)",
    "version_or_reference_date": "BOCW Act 1996 / Rules 1998",
    "category": "Head Protection",
    "title": "Safety Helmets Conforming to IS 2925",
    "requirement_summary": "Every building worker at a construction site shall be provided with and shall wear an approved safety helmet conforming to Bureau of Indian Standards specification IS 2925.",
    "penalty_severity": "HIGH",
    "human_review_required": true,
    "is_active": true
  }
]
```

---

### `GET /api/compliance/evaluations`
Retrieves rule-based evaluations with exact page citations and evidence snippets.

- **Query Parameters**: `project_id`, `status` (`compliant`, `non_compliant`, `missing_evidence`, `needs_human_review`), `doc_id`.

- **Response (200 OK)**:
```json
[
  {
    "evaluation_id": "eval-837192",
    "project_id": "PRJ-101",
    "doc_id": "88e48f36-62dc-41bf-a2a0-2e29e8fb2ffa",
    "document_filename": "site_safety_plan_2026.pdf",
    "standard_code": "BOCW-R231",
    "source_name": "Building and Other Construction Workers (BOCW) Central Rules 1998",
    "jurisdiction": "India — Central (BOCW)",
    "category": "Head Protection",
    "status": "compliant",
    "status_label": "Rule-based compliance indication",
    "confidence": 0.94,
    "matched_clause": "Every building worker at a construction site shall be provided with and shall wear an approved safety helmet conforming to IS 2925.",
    "evidence_page": 1,
    "evidence_section": "SECTION 1: GENERAL SITE PPE RULES",
    "evidence_snippet": "All workers shall wear safety helmet conforming to IS 2925 and ANSI Z89 hard hat standard.",
    "human_reviewed": false,
    "reviewed_by": null,
    "review_notes": null,
    "disclaimer": "Reference Rule Match — Human Verification Required. Not a legal or regulatory certification."
  }
]
```

---

### `POST /api/compliance/evaluations/{eval_id}/review`
Records a supervisor audit override on an evaluation item.

- **Request Body**:
```json
{
  "reviewed_by": "Senior Safety Auditor — S. Raman",
  "status_override": "compliant",
  "review_notes": "Supervisor verified IS 2925 certification clause on page 1."
}
```

---

### `GET /api/compliance/schedules` & `POST /api/compliance/schedules`
Manages inspection and certification renewal schedules with dynamic `UPCOMING`, `DUE_SOON`, and `OVERDUE` due-date calculations.

---

### `GET /api/compliance/report`
Generates a structured compliance audit summary.

- **Response (200 OK)**:
```json
{
  "project_id": "PRJ-101",
  "generated_at": "2026-09-11T13:47:00Z",
  "total_documents_analyzed": 2,
  "total_rules_evaluated": 6,
  "compliance_rate": 66.7,
  "status_breakdown": {
    "compliant": 4,
    "non_compliant": 0,
    "missing_evidence": 2,
    "needs_human_review": 0
  },
  "evaluations": [...],
  "upcoming_inspections": [...],
  "disclaimer": "Automated AI Assessment & Rule-Based Compliance Indication — Requires Qualified Safety Supervisor Review Before Legal Filing."
}
```

---

## 2. Insurance Intelligence Endpoints (`/api/insurance/*`)

### `GET /api/insurance/exposure-summary`
Aggregates safety violations and compute the exposure risk score (0–100) and claim risk tier.

- **Response (200 OK)**:
```json
{
  "project_id": "PRJ-101",
  "exposure_score": 34.3,
  "exposure_tier": "LOW",
  "total_safety_events": 27,
  "critical_events": 3,
  "high_severity_events": 8,
  "evidence_completeness_rate": 100.0,
  "pending_human_reviews": 0,
  "illustrative_liability_range": "Illustrative internal estimate ($15,000 - $35,000) — not an insurance quotation or claim value.",
  "disclaimer": "Internal safety decision-support estimate only. Does not represent actual insurance policy terms, premiums, or claim settlements."
}
```

---

### `GET /api/insurance/claims`
Lists incident claim assessments with the 5-item claim dossier checklist.

- **Checklist Structure**:
  1. `CHK-01`: Visual Evidence Frame & Telemetry Bounding Box
  2. `CHK-02`: Safety Supervisor Audit Trail & Action Log
  3. `CHK-03`: Zone Safety Rule Authorization & Multiplier Reference
  4. `CHK-04`: Worker Safety Induction & PPE Training Certification
  5. `CHK-05`: Incident Mitigation & Resolution Sign-Off

---

### `POST /api/insurance/claims/{assessment_id}/human-review`
Submits supervisor adjudication and records internal workflow status.

- **Request Body**:
```json
{
  "reviewed_by": "Senior Risk Engineer — M. Johnson",
  "decision_status": "APPROVED_FOR_FILING",
  "supervisor_notes": "All visual evidence, telemetry frames, and worker zone records verified.",
  "legal_counsel_sign_off": false
}
```

- **Response (200 OK)**:
```json
{
  "assessment_id": "bd589429-93bb-48f9-9d28-b3afa0c3ccbb",
  "incident_type": "missing_helmet",
  "zone_name": "Excavation Zone",
  "incident_severity": "HIGH",
  "exposure_score": 65.0,
  "claim_risk_tier": "HIGH",
  "decision_status": "APPROVED_FOR_FILING",
  "supervisor_notes": "All visual evidence, telemetry frames, and worker zone records verified.",
  "reviewed_by": "Senior Risk Engineer — M. Johnson",
  "reviewed_at": "2026-09-11T13:45:00Z",
  "disclaimer": "Internal safety decision-support estimate only. Does not represent actual insurance policy terms, premiums, or claim settlements."
}
```
