# BuildSure AI — Agentic Construction Risk Intelligence Platform 🏗️🤖

> **Infosys Springboard Internship Project**  
> *Autonomous Multi-Agent AI Ecosystem for Real-Time Safety Monitoring, Worker PPE Intelligence, Site Hazard Detection, Regulatory Compliance, and Construction Risk Analytics.*

---

## 🚀 Overview & Uniqueness (Why BuildSure AI Stands Out)

Construction sites are high-risk, dynamic environments where traditional manual safety inspections, delayed incident reporting, and fragmented compliance audits fail to prevent catastrophic accidents. 

**BuildSure AI** redefines construction risk management by introducing an **Agentic Multi-AI Ecosystem** that operates as an autonomous risk intelligence layer across construction sites. Instead of static dashboards or basic rule engines, BuildSure AI deploys specialized, collaborating AI Agents that continuously ingest site data, compute multi-factor risk scores, predict hazard escalations, evaluate PPE compliance via YOLO vision, and orchestrate mitigation workflows.

### 🌟 Active Release Status
- ✅ **Milestone 1**: Site Risk Monitoring & Hazard Detection Core
- ✅ **Milestone 2**: Safety Intelligence & Worker Protection (Ultralytics YOLO + FastAPI + SafetyAgent + SQLite)

---

## 🏗️ Multi-Agent Ecosystem Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND (React + Vite + Tailwind CSS)                                                │
│ • Milestone 1: Site Risk Command Center                                               │
│ • Milestone 2: PPE Detection Page (Image Upload, Zone Selector, YOLO Visual Output)   │
│ • Milestone 2: Safety Intelligence Dashboard (KPI Cards, Recharts, Filters)           │
│ • Milestone 2: Safety Alerts & Audit History (Acknowledge & Resolve Actions)           │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │ REST API / CORS (http://localhost:8000)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ BACKEND (Python FastAPI + SQLAlchemy + SQLite)                                          │
│ • POST /api/safety/analyze-image : Runs YOLO inference & SafetyAgent logic             │
│ • GET  /api/safety/violations    : Returns stored PPE violations with filters         │
│ • GET  /api/safety/summary       : Returns aggregated safety analytics & KPI metrics   │
│ • GET  /api/safety/alerts        : Returns safety alerts & audit trail history         │
│ • POST /api/safety/alerts/{id}/ack & /resolve : Audited alert lifecycle actions        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Key Features Implemented

### Milestone 1: Site Risk Monitoring Core
1. **Autonomous Site Risk Agent (`SiteRiskAgent.js`)**: Multi-factor scoring ($P \times I \times E$ + Weighted formula).
2. **Interactive Spatial Site Map (`SiteMapGrid.jsx`)**: 2D zone risk status, worker count, sensor feeds.
3. **5x5 Risk Heatmap Matrix (`RiskHeatmapMatrix.jsx`)**: Probability vs Impact heatmap matrix.
4. **Live Hazard Detection Panel (`HazardDetectionPanel.jsx`)**: Hazard filtering & XAI decision traces.

### Milestone 2: Safety Intelligence & Worker Protection
1. **Python FastAPI Backend (`/backend`)**: OpenCV visualization, SQLite database via SQLAlchemy.
2. **Ultralytics YOLO Vision Detector (`yolo_detector.py`)**: Detects workers, helmets, vests with confidence scoring.
3. **Autonomous `SafetyAgent` Engine (`safety_agent.py`)**:
   - Head region matching (upper 35% bounding box) for helmets.
   - Torso region matching (middle 40% bounding box) for safety vests.
   - Construction zone rules (General, Excavation, Vehicle, Electrical, Work-at-Height) with risk multipliers ($1.0\times$ to $1.5\times$).
   - Safety risk score formula: $\text{risk\_score} = \min(100, \text{round}(\text{base\_score} \times \text{zone\_multiplier}))$.
   - Low-confidence detections flagged as `needs_human_review`.
4. **Interactive PPE Detection Page (`PPEDetectionPage.jsx`)**: Upload site photos, select work zones, view side-by-side YOLO annotated results.
5. **Safety Intelligence Dashboard (`SafetyDashboardPage.jsx`)**: Live KPI metrics, PPE compliance rates, distribution charts, stored database records.
6. **Safety Alerts & Audit History (`SafetyAlertsPage.jsx`)**: Supervisor alert acknowledge & resolve workflows with audit logs.
7. **n8n Workflow Automation Integration (`n8n_dispatcher.py`)**: Asynchronous, fail-safe webhook notifications for High/Critical risk alerts (`risk_score >= 61`), delivery channel audit logs, and retry endpoints ([Read Full Guide](file:///c:/Users/Dhanusri/Downloads/Infosys/infosys-springboard-safety-ai/docs/n8n-milestone-2-integration.md)).

---

## ⚡ FastAPI Backend API Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/health` | `GET` | System health check (DB status, YOLO model path & threshold) |
| `/api/safety/analyze-image` | `POST` | Upload image + zone -> YOLO inference + SafetyAgent evaluation + DB record + n8n dispatch |
| `/api/safety/violations` | `GET` | List stored PPE violations with zone/severity/status filters |
| `/api/safety/summary` | `GET` | Aggregate safety analytics (compliance rates, score, trend) |
| `/api/safety/alerts` | `GET` | List generated safety alerts with evidence URLs & audit logs |
| `/api/safety/alerts/{id}/acknowledge` | `POST` | Acknowledge alert with audit trail entry |
| `/api/safety/alerts/{id}/resolve` | `POST` | Resolve alert with resolution note & audit record |
| `/api/safety/alerts/{id}/automation-status` | `POST` | Update n8n automation delivery status (secured via `X-N8N-Secret`) |
| `/api/safety/alerts/{id}/retry-automation` | `POST` | Re-dispatch automation webhook for High/Critical alert |

---

## 💻 Quick Start & Running Locally

### 1. Start Python FastAPI Backend

```bash
# Navigate to project root
cd infosys-springboard-safety-ai

# Create and activate virtual environment (optional)
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Run FastAPI backend server
cd backend
python app/main.py
```
*Backend runs at `http://127.0.0.1:8000` (Swagger docs available at `http://127.0.0.1:8000/docs`).*

### 2. Start React Frontend

```bash
# Open a new terminal in project root
cd infosys-springboard-safety-ai

# Install node dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## ⚙️ Environment Configuration (`.env`)

```env
YOLO_MODEL_PATH=yolov8n.pt
YOLO_CONFIDENCE_THRESHOLD=0.70

DATABASE_URL=sqlite:///./safety_intelligence.db
BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000

FRONTEND_URL=http://localhost:5173
N8N_SAFETY_WEBHOOK_URL=
```

---

## 🔒 Privacy & AI Disclaimer

- **No Face Recognition or PII**: All worker tags use anonymous spatial labels (`Worker-01`, `Worker-02`).
- **Mandatory Decision-Support Notice**:
  > *"AI detections are decision-support signals and require safety supervisor verification."*

---

© 2026 BuildSure AI Team. Developed for Infosys Springboard Internship Program.
