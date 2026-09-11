# BuildSure AI — Milestone 3 Test & Verification Checklist

## 1. Automated Test Execution Summary

| Test Suite | Command | Result | Verified Capabilities |
|---|---|---|---|
| **Database Schema Verification** | `python backend/test_phase1.py` | **PASS** | Additive creation of 5 tables, preservation of 4 M1/M2 tables with all rows intact. |
| **Safety API Smoke Tests** | `python backend/test_safety_endpoints_smoke.py` | **PASS** | Zero regression on `/health`, `/api/safety/summary`, `/api/safety/violations`, `/api/safety/alerts`. |
| **Phase 2 Compliance & Insurance Suite** | `python backend/test_phase2_endpoints.py` | **PASS** | Document upload, rule extraction, citations, supervisor reviews, schedules, reports, exposure scores, claim checklists. |
| **Full-Text Evaluation & Citation Test** | `python backend/test_pdf_compliance_full.py` | **PASS** | Multi-page text parsing, regex date/authority extraction, exact page numbering (`Page 1`, `Page 2`, `Page 3`). |
| **Frontend Production Build** | `npm run build` | **PASS** | Zero compilation/bundling errors across 1,491 React modules in ~8s. |

---

## 2. Manual Browser Verification Checklist

### A. Navigation & Shell Layout
- [x] Click **Compliance** in the sidebar $\rightarrow$ Opens `CompliancePage.jsx` with active metrics, matrix, and scheduler.
- [x] Click **Insurance** in the sidebar $\rightarrow$ Opens `InsurancePage.jsx` with exposure index, incident feed, and checklist.
- [x] Click existing tabs (**Command Center**, **Site Risk**, **PPE Safety**, **Safety Dashboard**, **Alert Center**, **Agent Network**, **Reports**) $\rightarrow$ All load smoothly without state conflicts.

### B. Compliance Intelligence
- [x] Click **+ UPLOAD DOCUMENT** $\rightarrow$ `DocumentUploadModal` opens with drag-and-drop zone.
- [x] Select valid PDF $\rightarrow$ File name and size preview correctly.
- [x] Select non-supported file (e.g. `.txt`) $\rightarrow$ Format error message is displayed and upload is blocked.
- [x] Drop file exceeding 15MB $\rightarrow$ Size error message is displayed.
- [x] Submit upload $\rightarrow$ Progress spinner displays, disables duplicate clicks, saves document, evaluates rules, and refreshes matrix.
- [x] Click any rule evaluation card $\rightarrow$ `EvidenceViewerModal` opens with exact page number and text snippet citation.
- [x] Click **RECORD SUPERVISOR REVIEW** $\rightarrow$ Review form opens; entering name + notes records decision in database audit trail.
- [x] Click **EXPORT AUDIT JSON** $\rightarrow$ Downloads formatted JSON audit report containing actual backend records.

### C. Insurance Intelligence
- [x] Inspect exposure summary card $\rightarrow$ Displays calculated score (0–100) and risk tier (`LOW` / `MODERATE` / `HIGH`).
- [x] Inspect incident feed $\rightarrow$ Filter between `ALL`, `PENDING REVIEW`, and `SUPERVISOR APPROVED`.
- [x] Select an incident $\rightarrow$ Right column renders the 5-item claim dossier checklist with attached/missing checks.
- [x] Click **ADJUDICATE** $\rightarrow$ `ClaimReviewModal` opens.
- [x] Submit with empty name or notes $\rightarrow$ Form rejects submission with validation message.
- [x] Check/uncheck legal counsel sign-off $\rightarrow$ Updates notice: *"Legal counsel sign-off: Not provided"* vs *"Provided & Attached"*.
- [x] Submit review $\rightarrow$ Updates decision status to `APPROVED_FOR_FILING` with banner: *"Internal supervisor workflow — not legal approval"*.

---

## 3. Privacy, Security, and Configuration Checks

- [x] `.gitignore` updated to exclude all `.db`, `.env`, `uploads/`, `documents/`, and `results/` directories.
- [x] Uploaded documents are saved under sanitized filenames (`doc_{uuid8}_{timestamp}_{name}`) to prevent directory traversal.
- [x] No API keys, webhook secrets, or raw host system paths are exposed in frontend bundles or exported audit reports.
