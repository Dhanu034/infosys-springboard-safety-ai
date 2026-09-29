# BuildSure AI — Unified Application Architecture

## 🏛️ Executive Statement
**BuildSure AI is consolidated into ONE single unified application.**

There are **no separate college, Infosys, or hackathon repository forks or backup apps**. The active application in this workspace is the definitive single source of truth for:
1. **College Capstone & Faculty Presentations**
2. **Infosys Springboard Internship Evaluations & Mentorship Reviews**
3. **Hackathon Demonstrations**
4. **Daily Ongoing Production Engineering**

---

## 🧭 Complete Unified Navigation System

All 10 modules and dashboards across all milestones are fully active and accessible directly from the left sidebar:

| Nav ID | Module Name | Milestone | Functional Description |
| :--- | :--- | :---: | :--- |
| `COMMAND_CENTER` | **Command Center** | Core | Tactical operational dashboard, real-time safety pulse, environmental feeds, quick simulations. |
| `SITE_RISK` | **Site Risk Monitoring** | M1 | 2D spatial site map grid, 5x5 Probability $\times$ Impact risk heatmap matrix, active hazard register. |
| `PPE_DETECTION` | **PPE Safety Detection** | M2 | YOLOv8n vision telemetry, worker/helmet/vest detection, zone rules, side-by-side visual annotations. |
| `SAFETY_DASHBOARD` | **Safety Dashboard** | M2 | Real-time safety KPIs, PPE compliance rates, zone violation distributions, database tables. |
| `SAFETY_ALERTS` | **Alert Center** | M2 | Critical alert queue, supervisor acknowledge/resolve workflow, audit logs, n8n webhook triggers. |
| `AGENT_NETWORK` | **Agent Network** | Arch | Interactive multi-agent topology showing autonomous agent interactions, triggers, and data flows. |
| `COMPLIANCE` | **Compliance Hub** | M3 | Multi-tier document ingestion (pypdf + OCR), OSHA/BOCW/Factories Act rule matching, inspection scheduler. |
| `INSURANCE` | **Insurance Intelligence** | M3 | Actuarial exposure score meter, 5-item claim audit dossiers, supervisor adjudication with legal disclaimers. |
| `REPORTS` | **Executive Reports** | M4 | Cross-agent reporting agent, unified project risk scorecard, high-risk zones, operational recommendations, JSON/CSV/PDF export. |
| `SETTINGS` | **System Info** | Config | Backend telemetry status, database connection, model inference engine versions. |

---

## 🔄 Cross-Module Agent Pipeline

```mermaid
flowchart TD
    subgraph UI["Single Unified Frontend (React 18 + Vite 5 + Tailwind CSS)"]
        CC["Command Center"]
        SR["Site Risk (M1)"]
        PPE["PPE Detection (M2)"]
        SD["Safety Dashboard (M2)"]
        AL["Alert Center (M2)"]
        AN["Agent Network"]
        CH["Compliance Hub (M3)"]
        II["Insurance Intel (M3)"]
        ER["Executive Reports (M4)"]
    end

    subgraph API["FastAPI Gateway (http://127.0.0.1:8000)"]
        S_API["/api/safety/*"]
        C_API["/api/compliance/*"]
        I_API["/api/insurance/*"]
        R_API["/api/reports/*"]
    end

    subgraph AGENTS["Deterministic AI Engines"]
        S_AGENT["SafetyAgent (YOLO + Zone Multipliers)"]
        C_ENGINE["ComplianceEngine (OSHA / BOCW / ISO)"]
        I_ENGINE["InsuranceEngine (Exposure Scoring & Dossiers)"]
        R_AGENT["ReportingAgent (Consolidated Project Risk)"]
    end

    subgraph DB[("SQLite Database (safety_intelligence.db)")]
        T_V["ppe_violations"]
        T_A["safety_alerts & safety_audit_logs"]
        T_D["compliance_documents"]
        T_E["compliance_evaluations"]
        T_S["inspection_schedules"]
        T_I["insurance_assessments"]
        T_R["report_audit_logs"]
    end

    UI <--> API
    S_API --> S_AGENT --> T_V & T_A
    C_API --> C_ENGINE --> T_D & T_E & T_S
    I_API --> I_ENGINE --> T_I
    R_API --> R_AGENT --> DB
```
