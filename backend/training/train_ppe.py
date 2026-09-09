#!/usr/bin/env python3
"""
BuildSure AI — Standalone PPE YOLO Model Training Script
Trains or fine-tunes a YOLOv8 object detector for construction PPE compliance.

Classes:
  0: person
  1: hard_hat
  2: safety_vest

Usage:
  python train_ppe.py --data data.yaml --model yolov8n.pt --epochs 50 --imgsz 640
"""

import os
import sys
import argparse
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(description="Train YOLOv8 on Construction PPE Dataset")
    parser.add_argument(
        "--data",
        type=str,
        default="backend/training/data.example.yaml",
        help="Path to dataset YAML configuration file"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="yolov8n.pt",
        help="Initial model weights (yolov8n.pt, yolov8s.pt, yolov8m.pt, etc.)"
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=50,
        help="Number of training epochs"
    )
    parser.add_argument(
        "--batch",
        type=int,
        default=16,
        help="Batch size (-1 for auto-batch)"
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help="Input image resolution"
    )
    parser.add_argument(
        "--device",
        type=str,
        default="",
        help="CUDA device (e.g. 0, 0,1, cpu)"
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=4,
        help="Number of dataloader workers"
    )
    parser.add_argument(
        "--project",
        type=str,
        default="runs/train_ppe",
        help="Output project directory for training runs"
    )
    parser.add_argument(
        "--name",
        type=str,
        default="yolov8_ppe_exp",
        help="Experiment name"
    )
    parser.add_argument(
        "--patience",
        type=int,
        default=15,
        help="Early stopping patience epochs"
    )
    parser.add_argument(
        "--lr0",
        type=float,
        default=0.01,
        help="Initial learning rate"
    )
    parser.add_argument(
        "--optimizer",
        type=str,
        default="auto",
        choices=["SGD", "Adam", "AdamW", "NAdam", "RAdam", "RMSProp", "auto"],
        help="Optimizer"
    )
    return parser.parse_args()


def train_model(args):
    data_path = os.path.abspath(args.data)
    if not os.path.exists(data_path):
        print(f"[ERROR] Dataset configuration file not found at: {data_path}")
        print("Please create your data.yaml file following 'backend/training/data.example.yaml'.")
        sys.exit(1)

    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] Ultralytics package is required for training.")
        print("Install via: pip install -r backend/training/requirements-training.txt")
        sys.exit(1)

    print("=" * 70)
    print("BuildSure AI — YOLO PPE Detector Fine-Tuning Pipeline")
    print("=" * 70)
    print(f" Dataset YAML   : {data_path}")
    print(f" Base Weights   : {args.model}")
    print(f" Epochs         : {args.epochs}")
    print(f" Batch Size     : {args.batch}")
    print(f" Image Size     : {args.imgsz}")
    print(f" Device         : {args.device or 'auto'}")
    print(f" Output Project : {args.project}/{args.name}")
    print("=" * 70)

    # Initialize model
    model = YOLO(args.model)

    # Execute training
    results = model.train(
        data=data_path,
        epochs=args.epochs,
        batch=args.batch,
        imgsz=args.imgsz,
        device=args.device if args.device else None,
        workers=args.workers,
        project=args.project,
        name=args.name,
        patience=args.patience,
        lr0=args.lr0,
        optimizer=args.optimizer,
        save=True,
        save_period=10,
        plots=True,
        verbose=True
    )

    best_weights = os.path.join(args.project, args.name, "weights", "best.pt")
    print("\n" + "=" * 70)
    print("Training Completed Successfully!")
    print(f"Best Weights Saved At: {best_weights}")
    print("=" * 70)
    print("\nNext Steps to Deploy to BuildSure AI:")
    print("1. Validate the model:")
    print(f"   python backend/training/validate_ppe.py --model {best_weights} --data {args.data}")
    print("2. Copy best.pt into backend/models/ or set the environment variable:")
    print(f"   YOLO_MODEL_PATH={best_weights}")
    print("3. Restart the FastAPI backend server to load the fine-tuned PPE detector.")
    print("=" * 70)


if __name__ == "__main__":
    cli_args = parse_args()
    train_model(cli_args)
