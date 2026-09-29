# Milestone 4: Construction Risk Intelligence Engine & Enterprise Reporting

## 📌 Executive Summary
**Milestone 4** establishes the executive intelligence and cross-agent aggregation tier of BuildSure AI. It autonomously consolidates real-time telemetry from **Site Risk Agents (M1)**, **Safety Agents (M2)**, **Compliance Engines (M3)**, and **Insurance Actuarial Engines (M3)** to produce explainable, audit-ready project risk evaluations, identify top hazards and repeated violations, generate actionable operational recommendations, and support multi-format reporting (JSON, CSV, Printable PDF).

---

## 📐 Deterministic Unified Project Risk Formula

To prevent arbitrary or ungrounded risk claims, Milestone 4 implements an explainable, deterministic mathematical model:

$$\text{Unified Project Risk} = \text{round}(0.35 \times \text{SafetyRisk} + 0.35 \times \text{ComplianceRisk} + 0.30 \times \text{InsuranceRisk})$$

### 📏 Dimension Definitions:
1. **Safety Risk (35% Weight)**:
   $$\text{SafetyRisk} = \frac{1}{N} \sum_{i=1}^N \text{ViolationRiskScore}_i$$
   Derived directly from YOLO vision detections, worker PPE status, and construction zone risk multipliers.
2. **Compliance Risk (35% Weight)**:
   $$\text{ComplianceRisk} = \left( \frac{\text{NonCompliantEvaluations} + \text{MissingEvidenceEvaluations}}{\text{TotalEvaluations}} \right) \times 100$$
   Derived from deterministic rule matching against OSHA 1926, BOCW 1998, Factories Act 1948, and ISO 45001.
3. **Insurance Risk (30% Weight)**:
   $$\text{InsuranceRisk} = \frac{1}{M} \sum_{j=1}^M \text{ExposureScore}_j$$
   Derived from site incident exposure assessments and claim adjudication checklists.

### 🛡️ Source Dimension Completeness Rule:
* **All Dimensions Required**: Unified Project Risk is only calculated when all 3 source dimensions (`SafetyRisk`, `ComplianceRisk`, `InsuranceRisk`) are present.
* **Missing Data Is Never Treated As Zero**: If any dimension is unavailable, the engine returns:
  * `overall_risk_score`: `null`
  * `risk_tier`: `null`
  * `score_status`: `"INSUFFICIENT_DATA"`
  * `score_explanation`: Human-readable statement identifying missing sources.

---

## 📊 Risk Tiers & Normalization

| Unified Score Range | Risk Tier | Operational Meaning | Action Trigger |
| :---: | :---: | :--- | :--- |
| **0 – 24** | `LOW` | Nominal site safety, high PPE adherence, valid regulatory certs | Standard monitoring |
| **25 – 49** | `MODERATE` | Minor PPE gaps or upcoming inspection deadlines | Routine supervisor follow-up |
| **50 – 74** | `HIGH` | Repeated violations or overdue compliance checks | Targeted zone inspections |
| **75 – 100** | `CRITICAL` | Unresolved critical alerts, severe exposure, non-compliance | Immediate site supervisor intervention |

---

## 📑 Export Capabilities & Report Auditing

1. **JSON Export (`GET /api/reports/export?format=json`)**:
   Full machine-readable envelope containing project metrics, timestamps, and data sources.
2. **CSV Export (`GET /api/reports/export?format=csv`)**:
   Standardized tabular schema with `Content-Disposition: attachment; filename=...` headers.
3. **Print / Save as PDF**:
   Native printable HTML view styled with `@media print` CSS for immediate one-click browser printing or PDF saving.
4. **Report Audit Trail (`GET /api/reports/audit-logs`)**:
   Every report generation and export action is automatically logged in SQLite table `report_audit_logs`.

---

## ⏱️ Milestone 4 Enhancement: Risk Decision Timeline

The **Risk Decision Timeline** (`GET /api/reports/timeline`) consolidates real-time, chronological decision events across all autonomous agents into an explainable vertical activity stream:
* **SafetyAgent**: PPE violation detections and automated high-risk alerts.
* **ComplianceEngine**: Regulatory standard evaluations and dynamic inspection due-date milestones.
* **InsuranceEngine**: Underwriting exposure assessments and claim adjudication updates.
* **ReportingAgent**: Report generation, viewing, and multi-format export audit logs.

### Key Characteristics:
* **Newest-First Ordering**: Chronologically sorted with ISO timestamps.
* **Source Grounding**: 100% grounded in SQLite database telemetry (`safety_intelligence.db`) with direct drill-down links to source modules.
* **Zero Fake Activity**: Clean empty state (`[]`) returned when no records exist for a project or period.

