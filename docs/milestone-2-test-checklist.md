# Milestone 2 Test Checklist — Safety Intelligence & Worker Protection

Use this checklist to verify that all **Milestone 2** features, Python FastAPI backend endpoints, and React frontend workflows function as expected.

---

## 📋 Test Execution Matrix

| Test ID | Test Scenario | Manual Action Steps | Expected Outcome | Verification Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | **Backend Health Check** | Navigate to `http://127.0.0.1:8000/health` | Returns HTTP 200 OK with `database_status: "healthy"`, `yolo_model_status: "loaded"`, and `configured_confidence_threshold: 0.7` | ✅ Passed |
| **TC-02** | **Milestone 1 Regression** | Open React UI at `http://localhost:5173`, click tab **Site Risk Command Center** | Milestone 1 5x5 heatmap matrix, spatial map grid, and live simulator function without any errors | ✅ Passed |
| **TC-03** | **Fully Compliant Worker** | Select **General Work Zone**, upload photo of worker wearing hard hat | Backend returns `compliant_workers_count: 1`, `violations_detected_count: 0`, and green bounding box in annotated image | ✅ Passed |
| **TC-04** | **Missing Helmet Violation** | Select **Excavation Zone**, upload photo of worker without helmet | Backend detects `missing_helmet`, calculates Risk Score = $60 \times 1.2 = 72$, creates red annotated box, stores violation and alert in DB | ✅ Passed |
| **TC-05** | **Missing Helmet & Vest** | Select **Work-at-Height Zone**, upload photo of worker with no PPE | Backend detects `missing_helmet_and_vest`, calculates Risk Score = $\min(100, 85 \times 1.5) = 100$, flags Critical severity, and prompts harness manual review | ✅ Passed |
| **TC-06** | **Low Confidence Review** | Upload blurred or distant worker image | System assigns `decision_status: "needs_human_review"`, yellow bounding box, and displays review warning badge | ✅ Passed |
| **TC-07** | **Safety Dashboard Analytics** | Click **Safety Intelligence Dashboard** tab | Displays live KPI cards, PPE compliance progress bars, distribution charts, and stored violation records from SQLite database | ✅ Passed |
| **TC-08** | **Alert Acknowledge Action** | Navigate to **Safety Alerts & Audits** tab, click **Acknowledge** on an Open alert | Alert status changes to `ACKNOWLEDGED` and audit trail records action timestamp | ✅ Passed |
| **TC-09** | **Alert Resolve Action** | Click **Resolve**, enter resolution note *"Hard hat provided to worker"*, submit | Alert status changes to `RESOLVED`, audit log records resolution note, and violation record is updated | ✅ Passed |
| **TC-10** | **Unsupported File Format** | Attempt uploading `.pdf` or `.txt` file | Frontend/Backend displays error notice: *"Unsupported file type. Allowed types: .jpg, .jpeg, .png, .webp"* | ✅ Passed |
