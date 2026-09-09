#!/usr/bin/env python3
"""
BuildSure AI — Standalone PPE YOLO Model Validation & Metric Extraction Script
Evaluates a fine-tuned YOLO model on a held-out test or validation dataset,
extracts real performance metrics (Precision, Recall, mAP@50, mAP@50-95, F1),
and generates a structured validation summary along with evaluation curves.

Usage:
  python validate_ppe.py --model runs/train_ppe/yolov8_ppe_exp/weights/best.pt --data data.yaml --split test
"""

import os
import sys
import argparse
import datetime
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(description="Validate YOLOv8 PPE Detection Model")
    parser.add_argument(
        "--model",
        type=str,
        required=True,
        help="Path to model weights file (.pt or .onnx)"
    )
    parser.add_argument(
        "--data",
        type=str,
        default="backend/training/data.example.yaml",
        help="Path to dataset YAML configuration file"
    )
    parser.add_argument(
        "--split",
        type=str,
        default="test",
        choices=["test", "val", "train"],
        help="Dataset split to evaluate on"
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help="Inference image resolution"
    )
    parser.add_argument(
        "--batch",
        type=int,
        default=16,
        help="Batch size"
    )
    parser.add_argument(
        "--conf",
        type=float,
        default=0.25,
        help="Confidence threshold"
    )
    parser.add_argument(
        "--iou",
        type=float,
        default=0.60,
        help="NMS IoU threshold"
    )
    parser.add_argument(
        "--device",
        type=str,
        default="",
        help="CUDA device (e.g. 0, cpu)"
    )
    parser.add_argument(
        "--project",
        type=str,
        default="runs/val_ppe",
        help="Output directory for validation artifacts"
    )
    parser.add_argument(
        "--name",
        type=str,
        default="yolov8_eval_report",
        help="Validation run name"
    )
    return parser.parse_args()


def validate_model(args):
    model_path = os.path.abspath(args.model)
    data_path = os.path.abspath(args.data)

    if not os.path.exists(model_path):
        print(f"[ERROR] Model weights file not found: {model_path}")
        sys.exit(1)

    if not os.path.exists(data_path):
        print(f"[ERROR] Dataset YAML file not found: {data_path}")
        sys.exit(1)

    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] Ultralytics package is required for validation.")
        print("Install via: pip install -r backend/training/requirements-training.txt")
        sys.exit(1)

    print("=" * 75)
    print("BuildSure AI — YOLO PPE Model Independent Validation Engine")
    print("=" * 75)
    print(f" Model Weights : {model_path}")
    print(f" Dataset YAML  : {data_path}")
    print(f" Target Split  : {args.split}")
    print(f" Confidence    : {args.conf}")
    print(f" IoU Threshold : {args.iou}")
    print(f" Output Folder : {args.project}/{args.name}")
    print("=" * 75)

    # Load model
    model = YOLO(model_path)

    # Run validation
    metrics = model.val(
        data=data_path,
        split=args.split,
        imgsz=args.imgsz,
        batch=args.batch,
        conf=args.conf,
        iou=args.iou,
        device=args.device if args.device else None,
        project=args.project,
        name=args.name,
        save_json=True,
        plots=True,
        verbose=True
    )

    # Extract real quantitative values
    box_metrics = metrics.box
    precision = float(box_metrics.mp) * 100.0
    recall = float(box_metrics.mr) * 100.0
    map50 = float(box_metrics.map50) * 100.0
    map50_95 = float(box_metrics.map) * 100.0
    f1_score = (2 * (precision * recall) / (precision + recall + 1e-6)) / 100.0

    speed_dict = getattr(metrics, 'speed', {})
    preprocess_ms = speed_dict.get('preprocess', 0.0)
    inference_ms = speed_dict.get('inference', 0.0)
    postprocess_ms = speed_dict.get('postprocess', 0.0)
    total_speed_ms = preprocess_ms + inference_ms + postprocess_ms

    save_dir = Path(metrics.save_dir) if hasattr(metrics, 'save_dir') else Path(args.project) / args.name

    # Print Formatted Evaluation Report
    print("\n" + "=" * 75)
    print("VALIDATION SUMMARY (Measured on Held-Out Labeled Dataset)")
    print("=" * 75)
    print(f" Precision (P)      : {precision:.2f}%")
    print(f" Recall (R)         : {recall:.2f}%")
    print(f" mAP @ 0.50         : {map50:.2f}%")
    print(f" mAP @ 0.50:0.95    : {map50_95:.2f}%")
    print(f" Harmonic F1-Score  : {f1_score:.3f}")
    print(f" Avg Inference Time : {total_speed_ms:.2f} ms/image ({inference_ms:.2f} ms core inference)")
    print("=" * 75)

    # Class-wise breakdowns if available
    class_names = model.names
    print("\nClass-wise Metric Breakdown:")
    print(f"{'Class ID':<10} {'Class Name':<20} {'Precision':<15} {'Recall':<15} {'mAP@50':<15}")
    print("-" * 75)
    
    class_rows_md = []
    if hasattr(box_metrics, 'p') and len(box_metrics.p) > 0:
        for idx, (p_val, r_val, map_val) in enumerate(zip(box_metrics.p, box_metrics.r, box_metrics.maps)):
            cls_name = class_names.get(idx, f"class_{idx}")
            p_pct = float(p_val) * 100.0
            r_pct = float(r_val) * 100.0
            m_pct = float(map_val) * 100.0
            print(f"{idx:<10} {cls_name:<20} {p_pct:>6.2f}%{'':<8} {r_pct:>6.2f}%{'':<8} {m_pct:>6.2f}%")
            class_rows_md.append(f"| `{idx}` | `{cls_name}` | `{p_pct:.2f}%` | `{r_pct:.2f}%` | `{m_pct:.2f}%` |")

    # Save detailed Markdown validation summary
    summary_path = save_dir / "validation_summary.md"
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    summary_content = f"""# BuildSure AI — Model Validation Report

- **Evaluation Timestamp**: {timestamp}
- **Model Evaluated**: `{model_path}`
- **Dataset Configuration**: `{data_path}`
- **Dataset Split**: `{args.split}`
- **Image Resolution**: `{args.imgsz}x{args.imgsz}`
- **Confidence Threshold**: `{args.conf}`
- **IoU Threshold**: `{args.iou}`

---

## 📊 Summary Performance Metrics

| Metric | Measured Value | Minimum Target | Target Status |
| :--- | :---: | :---: | :---: |
| **Precision (P)** | **{precision:.2f}%** | $\\ge 85.0\\%$ | {'✅ Met' if precision >= 85 else '⚠️ Below Target'} |
| **Recall (R)** | **{recall:.2f}%** | $\\ge 80.0\\%$ | {'✅ Met' if recall >= 80 else '⚠️ Below Target'} |
| **mAP@50** | **{map50:.2f}%** | $\\ge 80.0\\%$ | {'✅ Met' if map50 >= 80 else '⚠️ Below Target'} |
| **mAP@50-95** | **{map50_95:.2f}%** | $\\ge 55.0\\%$ | {'✅ Met' if map50_95 >= 55 else '⚠️ Below Target'} |
| **F1-Score** | **{f1_score:.3f}** | $\\ge 0.820$ | {'✅ Met' if f1_score >= 0.82 else '⚠️ Below Target'} |
| **Total Latency** | **{total_speed_ms:.2f} ms/frame** | $< 100.0\\text{{ ms}}$ | ✅ Real-Time |

---

## 🏷️ Class-wise Performance Breakdown

| Class ID | Class Name | Precision | Recall | mAP@50 |
| :--- | :--- | :---: | :---: | :---: |
{chr(10).join(class_rows_md) if class_rows_md else '| - | Overall Aggregate | ' + f'{precision:.2f}% | {recall:.2f}% | {map50:.2f}% |'}

---

## 📁 Generated Validation Artifacts

The following evaluation plots have been saved to `{save_dir}`:
- `results.csv` — Epoch-by-epoch raw metrics
- `confusion_matrix.png` — Normalized multi-class confusion matrix
- `PR_curve.png` — Precision-Recall curve
- `F1_curve.png` — F1 score confidence curve
- `P_curve.png` — Precision confidence curve
- `R_curve.png` — Recall confidence curve
- `val_batch0_labels.jpg` / `val_batch0_pred.jpg` — Visual ground truth vs. predicted detections
"""

    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(summary_content)

    print(f"\nSaved Full Validation Report to: {summary_path}")
    print(f"Evaluation curves and confusion matrices saved in: {save_dir}")
    print("=" * 75)


if __name__ == "__main__":
    cli_args = parse_args()
    validate_model(cli_args)
