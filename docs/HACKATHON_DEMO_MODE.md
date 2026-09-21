# BuildSure AI — Hackathon Presentation Mode & Restoration Guide

**Target Event**: DNN & Modern Web Programming (MWP) Hackathon  
**Target Scope**: Operational Milestones 1, 2, and 3  
**Status**: Active Temporary Feature Flag Configuration

---

## ⚡ Overview

To provide a distraction-free, presentation-grade experience for hackathon evaluators, BuildSure AI includes a non-destructive **Hackathon Presentation Mode**.

This mode:
* Displays strictly the 7 fully implemented, database-backed, and vision-powered pages across Milestones 1, 2, and 3.
* Hides unfinished, decorative, or planned Milestone 4 sections without deleting any code, routes, or database schemas.
* Automatically handles state and direct routing fallbacks safely.
* Is fully reversible with a single configuration variable.

---

## 🔘 How to Toggle Demo Mode (Environment Configuration)

> [!IMPORTANT]
> `VITE_HACKATHON_DEMO_MODE` is an **environment variable in your `.env` file**, **NOT a terminal/PowerShell command**. Do not type `VITE_HACKATHON_DEMO_MODE=false` directly into your terminal.

### 1. Enable Presentation Demo Mode (7 Core Pages)
1. Open `.env` in the root folder of the project (`infosys-springboard-safety-ai/.env`).
2. Add or change:
   ```env
   VITE_HACKATHON_DEMO_MODE=true
   ```
3. Restart or run the frontend:
   ```bash
   npm run dev
   ```

### 2. Disable Demo Mode (Restore 100% Full Dashboard & All Items)
1. Open `.env` in the root folder (`infosys-springboard-safety-ai/.env`).
2. Set:
   ```env
   VITE_HACKATHON_DEMO_MODE=false
   ```
3. Save the file and restart/refresh the frontend. Every original sidebar item (Agent Network, Reports, Settings, Support) will immediately be visible again.

---

## ⚠️ Important Note on Git Branches vs Feature Flag

> [!WARNING]
> **Switching Git branches is NOT the same as disabling demo mode:**
> - `git checkout backup/buildsure-before-hackathon-demo-mode` switches the entire Git branch.
> - To simply show or hide dashboard features while remaining on your active working branch (`development`), use the `.env` flag `VITE_HACKATHON_DEMO_MODE=false`.

---

## 📦 How to Fully Revert Files to the Pre-Demo State

If you want to discard all demo-mode changes and completely return code files to the exact snapshot taken before hackathon configuration:

1. **Step 1: Backup Any Recent Work (Recommended)**
   ```bash
   git add -A
   git commit -m "chore: backup work before reverting to pre-demo tag"
   ```

2. **Step 2: Revert to Pre-Demo Tag or Commit Intentionally**
   ```bash
   # Option A: Switch to the pre-demo tag
   git checkout pre-hackathon-demo-mode

   # Option B: Hard reset current branch to the exact pre-demo commit
   git reset --hard pre-hackathon-demo-mode
   ```

* **Pre-Demo Backup Branch**: `backup/buildsure-before-hackathon-demo-mode`
* **Pre-Demo Backup Tag**: `pre-hackathon-demo-mode`
* **Pre-Demo Base Commit**: `aad037b` (*"chore: checkpoint all current work before hackathon demo mode"*)

---

## 📋 Scope Summary

### ✅ Visible & Operational Pages in Demo Mode (7 Core)
1. **Command Center** (`COMMAND_CENTER`): Project switcher, System Safety Pulse gauge, live project summary.
2. **Site Risk Monitoring** (`SITE_RISK`): `SiteRiskAgent`, 2D interactive spatial grid map, 5x5 probability vs severity matrix, XAI reasoning trace drawer.
3. **PPE Safety Detection** (`PPE_DETECTION`): Real YOLOv8 PPE model inference, image upload, spatial bounding box overlays, `SafetyAgent` evaluation, zone multipliers, violation logging.
4. **Safety Dashboard** (`SAFETY_DASHBOARD`): Database-backed project KPIs, concentric PPE compliance rates, zone violation breakdown, live violation history.
5. **Alert Center** (`SAFETY_ALERTS`): Critical & High severity triage kanban, acknowledge/resolve workflows with supervisor audit logs, n8n webhook automation badges.
6. **Compliance Hub** (`COMPLIANCE`): Real PDF upload via `pypdf` + Tesseract OCR fallback, deterministic regulatory rule evaluation (OSHA, BOCW, Factories Act, ISO), page citations, evidence snippets, inspection due-date scheduler.
7. **Insurance Intelligence** (`INSURANCE`): Read-only safety record exposure scoring (0–100, 5 tiers), 5-item claim dossier checklists, supervisor adjudication modal.

### 🙈 Hidden in Demo Mode (Preserved in Codebase)
* **Agent Network** (`AGENT_NETWORK`): Conceptual topology SVG graph.
* **Reports** (`REPORTS`): Milestone 4 planned enterprise reporting analytics.
* **Settings & Support** (`SETTINGS`, `SUPPORT`): Static placeholder configuration views.

---

## 🔒 Protected Files (Strictly Untouched)

The following core AI, ML, vision, and extraction engines have zero modifications:
- `models/ppe_model.pt` (and `yolov8n.pt`)
- `backend/app/services/yolo_detector.py`
- `backend/app/services/safety_agent.py`
- `backend/app/services/n8n_dispatcher.py`
- `backend/app/services/document_extractor.py`
- `backend/app/services/compliance_engine.py`
- `backend/app/services/insurance_engine.py`

---

## 🧪 Verification & Test Commands

To verify all system tiers and test suites:

### 1. Backend Milestone 1 & 2 Tests
```bash
./venv/Scripts/python.exe backend/test_phase1.py
./venv/Scripts/python.exe backend/test_phase2_endpoints.py
./venv/Scripts/python.exe backend/test_n8n_integration.py
./venv/Scripts/python.exe backend/test_ppe_model_integration.py
```

### 2. Backend Milestone 3 Compliance & Document Tests
```bash
./venv/Scripts/python.exe backend/test_document_checklists.py
./venv/Scripts/python.exe backend/test_pdf_compliance_full.py
```

### 3. Frontend Production Build
```bash
npm run build
```
