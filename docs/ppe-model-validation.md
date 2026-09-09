# BuildSure AI — Construction PPE Model Validation & Benchmarking Guide

> **BuildSure AI – Autonomous Construction Safety & Risk Intelligence Platform**  
> *Milestone 2 Model Validation Protocols*

---

## 🎯 1. Validation Philosophy & Requirements

To claim high accuracy in an industrial safety compliance system, models must be evaluated against a **held-out labeled test split** that was **never seen during training**.

### Target Benchmark Thresholds:
- **Precision (P):** $\ge 85.0\%$
- **Recall (R):** $\ge 80.0\%$
- **mAP@50 (Mean Average Precision @ IoU 0.50):** $\ge 80.0\%$
- **mAP@50-95:** $\ge 55.0\%$
- **F1-Score:** $\ge 0.820$
- **Inference Speed:** $< 100\text{ ms / frame}$ on GPU

---

## 🧪 2. Running Independent Validation

Use the standalone validation script:

```bash
python backend/training/validate_ppe.py \
  --model backend/models/best.pt \
  --data backend/training/data.yaml \
  --split test \
  --imgsz 640 \
  --conf 0.25 \
  --iou 0.60 \
  --project runs/val_ppe \
  --name evaluation_benchmark
```

---

## 📈 3. Generated Validation Artifacts

The script automatically generates and saves the following analytical assets to `runs/val_ppe/evaluation_benchmark/`:

1. **`results.csv`**: Tabular raw numbers for loss, precision, recall, and mAP across epochs.
2. **`confusion_matrix.png`**: Normalized matrix illustrating True Positives vs. False Positives (e.g. background misclassified as hardhat, or vest missed).
3. **`PR_curve.png`**: Precision vs. Recall curve for all three classes (`person`, `hard_hat`, `safety_vest`).
4. **`F1_curve.png`**: F1-score vs. Confidence threshold curve (determines optimal operational confidence, e.g., 0.65–0.75).
5. **`P_curve.png` & `R_curve.png`**: Individual Precision and Recall curves across confidence sweeps.
6. **`validation_summary.md`**: Clean markdown report summarizing overall and class-by-class performance metrics.

---

## 🔍 4. Understanding the Metrics

### Precision
$$\text{Precision} = \frac{\text{True Positives}}{\text{True Positives} + \text{False Positives}}$$
*High precision ensures that the system does not falsely penalize workers who are wearing compliant PPE.*

### Recall
$$\text{Recall} = \frac{\text{True Positives}}{\text{True Positives} + \text{False Negatives}}$$
*High recall ensures that no unequipped worker without a hardhat or vest goes undetected.*

### mAP@50
Area under the Precision-Recall curve evaluated at an Intersection over Union (IoU) threshold of $0.50$. Standard computer vision benchmark.

---

## 🔄 5. Verifying Integration with BuildSure AI Backend

Once `best.pt` is validated:
1. Place it in `backend/models/best.pt`.
2. Ensure `YOLO_MODEL_PATH=backend/models/best.pt` in `.env`.
3. Test backend health:
   ```bash
   curl http://127.0.0.1:8000/health
   ```
4. Verify detection output via `/api/safety/analyze-image` with a test image.
