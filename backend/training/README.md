# BuildSure AI — PPE YOLO Model Training & Validation Guide

This directory contains standalone infrastructure to train, fine-tune, and validate custom YOLOv8 models for construction personal protective equipment (PPE) detection.

---

## 🎯 Target Standard Classes

| Class ID | Class Name | Aliases Handled by BuildSure AI |
| :---: | :--- | :--- |
| `0` | **`person`** | `worker`, `person` |
| `1` | **`hard_hat`** | `helmet`, `hardhat`, `hard_hat`, `hard-hat`, `safety_helmet` |
| `2` | **`safety_vest`** | `vest`, `safety vest`, `safety_vest`, `safety-vest`, `reflective_vest`, `high_vis_vest` |

---

## 📁 Directory Structure

```
backend/training/
├── data.example.yaml          # Template dataset configuration
├── requirements-training.txt  # Training-specific Python dependencies
├── train_ppe.py              # CLI training script
├── validate_ppe.py           # CLI validation & metric extraction script
└── README.md                 # This guide
```

---

## 🚀 Quickstart: Local Training

### 1. Install Training Dependencies
```bash
pip install -r backend/training/requirements-training.txt
```

### 2. Prepare Dataset YAML
Copy `data.example.yaml` to `data.yaml` and set the absolute path to your dataset:
```yaml
path: /path/to/construction-ppe-dataset
train: images/train
val: images/val
test: images/test

names:
  0: person
  1: hard_hat
  2: safety_vest
```

### 3. Run Training
```bash
python backend/training/train_ppe.py --data data.yaml --model yolov8n.pt --epochs 50 --imgsz 640 --batch 16
```

---

## 📊 Quickstart: Model Validation

Evaluate the exported weights on a held-out test split:
```bash
python backend/training/validate_ppe.py --model runs/train_ppe/yolov8_ppe_exp/weights/best.pt --data data.yaml --split test
```

This generates:
- `runs/val_ppe/yolov8_eval_report/validation_summary.md`
- `runs/val_ppe/yolov8_eval_report/confusion_matrix.png`
- `runs/val_ppe/yolov8_eval_report/PR_curve.png`
- `runs/val_ppe/yolov8_eval_report/F1_curve.png`
- `runs/val_ppe/yolov8_eval_report/results.csv`

---

## 🔌 Deploying to BuildSure AI

1. Copy the fine-tuned weights file:
   ```bash
   mkdir -p backend/models
   cp runs/train_ppe/yolov8_ppe_exp/weights/best.pt backend/models/best.pt
   ```
2. Set the environment variable in `.env`:
   ```ini
   YOLO_MODEL_PATH=backend/models/best.pt
   ```
3. Restart the FastAPI server:
   ```bash
   python backend/run_server.py
   ```
4. Check health endpoint `http://127.0.0.1:8000/health` — it will report `yolo_model_mode: "ppe_fine_tuned"`.
