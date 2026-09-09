# BuildSure AI — Construction PPE Detection Model Training Guide

> **BuildSure AI – Autonomous Construction Safety & Risk Intelligence Platform**  
> *Milestone 2 Advanced Training Infrastructure*

---

## 🎯 1. Overview & Objective

BuildSure AI is engineered to protect construction personnel by identifying workers and evaluating personal protective equipment (PPE) compliance in real time.

This guide outlines the procedure for training a specialized **YOLOv8** object detection model targeting three primary classes:
1. **`person`** (Class `0`) — All visible construction workers (standing, kneeling, upper-body, distant).
2. **`hard_hat`** (Class `1`) — Construction safety helmets (yellow, white, orange, blue, red).
3. **`safety_vest`** (Class `2`) — High-visibility safety vests (neon lime, yellow, orange with reflective bands).

---

## 📦 2. Dataset Preparation & Formatting

The dataset must follow standard **YOLO bounding-box annotation format**:

```
<dataset-root>/
├── images/
│   ├── train/     # 70% of total images
│   ├── val/       # 20% of total images
│   └── test/      # 10% of total images (held-out)
└── labels/
    ├── train/     # Corresponding .txt label files
    ├── val/
    └── test/
```

### Label File Format (.txt):
Each line represents one object bounding box normalized to $[0.0, 1.0]$:
```
<class_id> <x_center> <y_center> <width> <height>
```
Example:
```
0 0.4512 0.5230 0.1840 0.6200
1 0.4520 0.2810 0.0820 0.0950
2 0.4510 0.4420 0.1650 0.2500
```

---

## ☁️ 3. Google Colab Training Workflow (Recommended)

Google Colab provides free/affordable NVIDIA T4/A100 GPUs for rapid model convergence (typically 25–45 minutes for 50 epochs).

### Step 1: Open New Colab Notebook
1. Go to [colab.research.google.com](https://colab.research.google.com).
2. Change runtime to GPU: **Runtime $\rightarrow$ Change runtime type $\rightarrow$ T4 GPU**.

### Step 2: Install Ultralytics
```python
!pip install ultralytics roboflow
```

### Step 3: Mount Google Drive or Download Labeled Dataset
```python
from google.colab import drive
drive.mount('/content/drive')
```
*(Or use Roboflow / Kaggle API to download an annotated construction PPE dataset directly into `/content/dataset`).*

### Step 4: Define `data.yaml`
```python
yaml_content = """
path: /content/dataset
train: images/train
val: images/val
test: images/test

names:
  0: person
  1: hard_hat
  2: safety_vest
"""
with open("/content/data.yaml", "w") as f:
    f.write(yaml_content)
```

### Step 5: Execute Training
```python
from ultralytics import YOLO

# Load pretrained base model
model = YOLO('yolov8n.pt')

# Train on PPE dataset
results = model.train(
    data='/content/data.yaml',
    epochs=50,
    imgsz=640,
    batch=16,
    patience=15,
    optimizer='AdamW',
    lr0=0.001,
    project='/content/runs',
    name='ppe_yolov8n_exp',
    save=True,
    plots=True
)
```

### Step 6: Validate on Test Split
```python
metrics = model.val(data='/content/data.yaml', split='test', plots=True)
print("Precision:", metrics.box.mp)
print("Recall:", metrics.box.mr)
print("mAP@50:", metrics.box.map50)
print("mAP@50-95:", metrics.box.map)
```

### Step 7: Download `best.pt`
```python
from google.colab import files
files.download('/content/runs/ppe_yolov8n_exp/weights/best.pt')
```

---

## 💻 4. Local Training Execution

To train directly on a local workstation with an NVIDIA GPU:

```bash
# 1. Install dependencies
pip install -r backend/training/requirements-training.txt

# 2. Run CLI training script
python backend/training/train_ppe.py \
  --data backend/training/data.example.yaml \
  --model yolov8n.pt \
  --epochs 50 \
  --batch 16 \
  --imgsz 640 \
  --device 0 \
  --project runs/train_ppe \
  --name yolov8_ppe_exp
```

---

## 🛠️ 5. Hyperparameter Recommendations

| Parameter | Recommended Value | Description |
| :--- | :---: | :--- |
| `epochs` | `50–100` | Number of training iterations over the dataset |
| `batch` | `16` or `32` | Batch size (reduce if GPU out of memory) |
| `imgsz` | `640` | Resolution for training (supports up to 1024) |
| `lr0` | `0.001` (AdamW) / `0.01` (SGD) | Initial learning rate |
| `patience` | `15` | Early stopping if validation loss stops improving |
| `augment` | `True` | Random flips, scale, color jitter for robustness |

---

## 🚀 6. Deploying Exported Weights to BuildSure AI

1. Place `best.pt` in `backend/models/`:
   ```bash
   mkdir -p backend/models
   cp best.pt backend/models/best.pt
   ```
2. Update your `.env` file:
   ```ini
   YOLO_MODEL_PATH=backend/models/best.pt
   ```
3. Restart the FastAPI server:
   ```bash
   python backend/run_server.py
   ```
4. BuildSure AI will automatically recognize the PPE classes and activate **Native PPE Mode** (`ppe_fine_tuned`), bypassing the fallback heuristics.
