# Milestone 2 Evaluation Documentation — Safety Intelligence & Worker Protection

> **BuildSure AI – Agentic Construction Risk Intelligence Platform**  
> *Infosys Springboard Internship Project*

---

## 📊 1. Model Status & Benchmark Target Metrics

- **Current Operating Mode**: `YOLOv8n person detection + OpenCV PPE heuristic fallback`
- **Validation Status**: `Not yet measured on a held-out labelled PPE test set.`
- **Target Classes**: `0: person`, `1: hard_hat`, `2: safety_vest`

### Proposed Target Benchmarks vs. Status

> **Note:** The values below represent proposed target benchmarks for a future fine-tuned PPE detector, not measured results on a held-out test split.

| Evaluation Metric | Proposed Target Benchmark | Current Status |
| :--- | :---: | :---: |
| **Precision (P)** | $\ge 85.0\%$ | ⏳ Target (Pending held-out test evaluation) |
| **Recall (R)** | $\ge 80.0\%$ | ⏳ Target (Pending held-out test evaluation) |
| **mAP@50** | $\ge 80.0\%$ | ⏳ Target (Pending held-out test evaluation) |
| **mAP@50-95** | $\ge 55.0\%$ | ⏳ Target (Pending held-out test evaluation) |
| **F1-Score** | $\ge 0.820$ | ⏳ Target (Pending held-out test evaluation) |
| **Inference Latency (GPU)** | $< 50\text{ ms / frame}$ | ⏳ Target |
| **Inference Latency (CPU)** | $< 300\text{ ms / frame}$ | ⏳ Target |

*For procedures to fine-tune and benchmark a dedicated PPE model, refer to [docs/ppe-model-training.md](file:///c:/Users/Dhanusri/Downloads/Infosys/infosys-springboard-safety-ai/docs/ppe-model-training.md) and [docs/ppe-model-validation.md](file:///c:/Users/Dhanusri/Downloads/Infosys/infosys-springboard-safety-ai/docs/ppe-model-validation.md).*

---

## 🎯 2. Spatial Spatial PPE Association Heuristic

Rather than assuming all workers are compliant if a helmet or vest exists anywhere in the image frame, `SafetyAgent` applies **spatial geometric region matching**:

1. **Head Region Matching**:
   - Computes the upper $35\%$ of each detected worker's bounding box:
     $$\text{Head Box} = [x_1, y_1, x_2, y_1 + 0.35 \times \text{height}]$$
   - A detected helmet is associated **only** if its center coordinate $(h_{cx}, h_{cy})$ falls inside or within a $15\%$ tolerance of this head region.

2. **Torso Region Matching**:
   - Computes the middle $40\%$ of each detected worker's bounding box:
     $$\text{Torso Box} = [x_1, y_1 + 0.20 \times \text{height}, x_2, y_1 + 0.70 \times \text{height}]$$
   - A detected safety vest is associated **only** if its center coordinate $(v_{cx}, v_{cy})$ falls inside this torso region.

3. **Low-Confidence Filter**:
   - Detections with confidence $< 0.70$ (configurable via `YOLO_CONFIDENCE_THRESHOLD`) are categorized as `needs_human_review` rather than confirmed violations.

---

## ⚠️ 3. Known Operational Limitations & Edge Cases

1. **Low Lighting & Night Work**:
   - Heavy shadows or night infrared feeds degrade yellow/orange vest saturation. Low-confidence flag triggers `Needs Human Review`.
2. **Extreme Distant Workers**:
   - Workers located beyond $45\text{ meters}$ from camera hook elevation produce bounding boxes $< 20\times 20\text{ pixels}$, lowering PPE detection accuracy.
3. **Severe Occlusion**:
   - Workers partially blocked by scaffolding structural bars or excavator buckets may obscure the head or torso regions.
4. **Non-Standard PPE Colors**:
   - Blue, white, or black safety vests (outside neon yellow/orange spectrum) require fine-tuned custom weights.

---

## 🔒 4. Privacy & Ethical AI Disclaimer

- **Zero Personally Identifiable Information (PII)**: No facial recognition, facial landmarking, or worker identification is performed.
- **Anonymous Tracking**: All workers are assigned randomized spatial tags (e.g. `Worker-01`, `Worker-02`).
- **Mandatory Decision-Support Notice**:
  > *"AI detections are decision-support signals and require safety supervisor verification."*
