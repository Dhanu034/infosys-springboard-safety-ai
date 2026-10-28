import os
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional
import cv2
import numpy as np
from PIL import Image
from ultralytics import YOLO
from app.config import settings

# =====================================================================
# TASK 1: Resolve and Load Model Once at Application Startup
# =====================================================================
PROJECT_ROOT = Path(__file__).resolve().parents[3]
MODEL_PATH = PROJECT_ROOT / "models" / "ppe_model.pt"

if not MODEL_PATH.exists():
    # Robust fallback check in case process is launched inside backend/ or elsewhere
    alt_paths = [
        Path(__file__).resolve().parents[2] / "models" / "ppe_model.pt",
        Path("models/ppe_model.pt").resolve(),
        Path("backend/models/ppe_model.pt").resolve()
    ]
    for alt in alt_paths:
        if alt.exists():
            MODEL_PATH = alt
            break

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"PPE model not found at: {MODEL_PATH}"
    )

# Load the model once at application startup
model = YOLO(str(MODEL_PATH))

# Print once at startup
print(f"[YOLODetector] Loaded model path: {MODEL_PATH}")
print(f"[YOLODetector] model.names: {model.names}")


# =====================================================================
# TASK 4: Class Mapping & Normalization
# =====================================================================
def normalize_class_name(raw_name: str) -> str:
    """
    Robust case-insensitive class name normalizer for Hansung-Cho/yolov8-ppe-detection.
    Converts to lowercase, trims whitespace, and standardizes hyphens/spaces to underscores.
    Normalizes aliases:
      - Hardhat or helmet -> hard_hat
      - No-Hardhat or no-helmet -> no_hard_hat
      - Safety Vest or vest -> safety_vest
      - No-Safety Vest or no-vest -> no_safety_vest
      - Person -> person
      - Mask or face_mask -> mask
      - No-Mask -> no_mask
      - Safety Cone -> safety_cone
      - Machinery -> machinery
      - Vehicle -> vehicle
    """
    clean = str(raw_name).strip().lower().replace("-", "_").replace(" ", "_")

    # Direct No-PPE Violations
    if clean in ["no_hardhat", "no_hard_hat", "no_helmet", "no_helmets", "no_hard_hats", "nohardhat"]:
        return "no_hard_hat"
    if clean in ["no_safety_vest", "no_vest", "no_safetyvest", "no_reflective_vest", "no_safety_vests", "no_vests"]:
        return "no_safety_vest"
    if clean in ["no_mask", "no_face_mask", "nomask"]:
        return "no_mask"

    # Hard Hat Aliases
    if clean in ["helmet", "hardhat", "hard_hat", "safety_helmet", "hard_hats", "helmets"]:
        return "hard_hat"

    # Safety Vest Aliases
    if clean in [
        "vest", "safety_vest", "reflective_vest", "high_vis_vest",
        "hi_vis_vest", "safety_vests", "vests", "reflective_safety_vest", "safetyvest"
    ]:
        return "safety_vest"

    # Person Aliases
    if clean in ["person", "worker", "human", "people", "persons", "workers", "subject"]:
        return "person"

    # Mask Aliases
    if clean in ["mask", "face_mask", "protective_mask", "masks"]:
        return "mask"

    # Safety Cone
    if clean in ["safety_cone", "cone", "traffic_cone", "safety_cones"]:
        return "safety_cone"

    # Machinery & Vehicle
    if clean in ["machinery", "heavy_equipment", "excavator", "crane", "machine"]:
        return "machinery"
    if clean in ["vehicle", "truck", "car", "vehicles"]:
        return "vehicle"

    return clean


class YOLODetector:
    """
    BuildSure AI — Universal YOLO + OpenCV Computer Vision Detection Service
    Powered by Hansung-Cho/yolov8-ppe-detection local model with OpenCV heuristic fallback.
    """

    def __init__(self):
        self.model_path = str(MODEL_PATH)
        self.confidence_threshold = getattr(settings, "YOLO_CONFIDENCE_THRESHOLD", 0.25)
        self.ultralytics_model = model
        self.model_name = "Hansung-Cho/yolov8-ppe-detection"
        self.model_mode = "ppe_fine_tuned"
        self.model_mode_description = "Native PPE Fine-Tuned YOLO Model Active."
        self.hog = None
        self._load_hog()
        self._load_cascades()

    def get_model_info(self) -> Dict[str, Any]:
        """Returns safe model health metadata for GET /api/safety/model-info."""
        size_mb = "5.96"
        if MODEL_PATH.exists():
            size_mb = f"{MODEL_PATH.stat().st_size / (1024 * 1024):.2f}"

        raw_names = getattr(self.ultralytics_model, "names", {})
        if isinstance(raw_names, dict):
            classes_list = [raw_names[k] for k in sorted(raw_names.keys())]
        elif isinstance(raw_names, (list, tuple)):
            classes_list = list(raw_names)
        else:
            classes_list = []

        return {
            "model_name": self.model_name,
            "model_path": "models/ppe_model.pt",
            "model_size_mb": size_mb,
            "classes": classes_list,
            "inference_mode": "local",
            "fallback": "OpenCV heuristic"
        }

    def _load_hog(self):
        try:
            if hasattr(cv2, "HOGDescriptor") and hasattr(cv2, "HOGDescriptor_getDefaultPeopleDetector"):
                self.hog = cv2.HOGDescriptor()
                self.hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
        except Exception as e:
            print(f"[YOLODetector] HOG init note: {e}")
            self.hog = None

    def _load_cascades(self):
        self.face_cascade = None
        self.upper_cascade = None
        self.body_cascade = None
        try:
            cascade_dir = getattr(cv2, "data", None)
            if cascade_dir and hasattr(cascade_dir, "haarcascades"):
                p_face = os.path.join(cascade_dir.haarcascades, "haarcascade_frontalface_default.xml")
                p_upper = os.path.join(cascade_dir.haarcascades, "haarcascade_upperbody.xml")
                p_body = os.path.join(cascade_dir.haarcascades, "haarcascade_fullbody.xml")
                if os.path.exists(p_face):
                    self.face_cascade = cv2.CascadeClassifier(p_face)
                if os.path.exists(p_upper):
                    self.upper_cascade = cv2.CascadeClassifier(p_upper)
                if os.path.exists(p_body):
                    self.body_cascade = cv2.CascadeClassifier(p_body)
        except Exception as e:
            print(f"[YOLODetector] Cascade load note: {e}")

    @property
    def model(self):
        return self.ultralytics_model

    def detect_objects(self, image_path: str, conf_threshold: Optional[float] = None) -> List[Dict[str, Any]]:
        """
        Runs object detection on ANY uploaded image using local YOLOv8 PPE model.
        Returns standardized detections schema:
        [
            {
                "class_id": int,
                "label": str,
                "confidence": float,
                "bbox": {
                    "x1": float,
                    "y1": float,
                    "x2": float,
                    "y2": float
                },
                "class": str,          # normalized class name
                "box": [int, int, int, int]
            }
        ]
        """
        img = cv2.imread(image_path)
        if img is None:
            return []

        h0, w0, _ = img.shape
        conf_to_use = conf_threshold if conf_threshold is not None else 0.20

        # =====================================================================
        # TASK 3: Real Neural Model Inference
        # =====================================================================
        if self.ultralytics_model is not None:
            try:
                # Fast standard 640px inference for real-time < 1s response on CPU
                imgsz = 640
                results = self.ultralytics_model(
                    image_path,
                    conf=conf_to_use,
                    iou=0.45,
                    imgsz=imgsz,
                    verbose=False
                )

                valid_classes = {
                    "person", "hard_hat", "safety_vest",
                    "no_hard_hat", "no_safety_vest", "mask", "no_mask",
                    "safety_cone", "machinery", "vehicle"
                }

                class_detections: Dict[str, List[Dict[str, Any]]] = {}

                for r in results:
                    for box in r.boxes:
                        cls_id = int(box.cls[0])
                        raw_label = str(self.ultralytics_model.names.get(cls_id, f"class_{cls_id}"))
                        norm_class = normalize_class_name(raw_label)
                        conf = float(box.conf[0])

                        # Explicit map(float, box.xyxy[0]) as required by Task 3
                        x1, y1, x2, y2 = map(float, box.xyxy[0])

                        if norm_class in valid_classes:
                            item = {
                                "class_id": cls_id,
                                "label": raw_label,
                                "confidence": round(conf, 4),
                                "bbox": {
                                    "x1": round(x1, 1),
                                    "y1": round(y1, 1),
                                    "x2": round(x2, 1),
                                    "y2": round(y2, 1)
                                },
                                # Backward compatibility attributes
                                "class": norm_class,
                                "raw_class": raw_label,
                                "box": [max(0, int(x1)), max(0, int(y1)), min(w0, int(x2)), min(h0, int(y2))]
                            }

                            if norm_class not in class_detections:
                                class_detections[norm_class] = []
                            class_detections[norm_class].append(item)

                # Deduplicate overlapping detections per-class via NMS
                deduped_detections: List[Dict[str, Any]] = []
                for c_name, items in class_detections.items():
                    if len(items) > 1:
                        boxes = [it["box"] for it in items]
                        confs = [it["confidence"] for it in items]
                        indices = cv2.dnn.NMSBoxes(boxes, confs, conf_to_use, 0.45)
                        for idx in indices:
                            i = idx[0] if isinstance(idx, (list, np.ndarray)) else idx
                            deduped_detections.append(items[i])
                    elif len(items) == 1:
                        deduped_detections.append(items[0])

                if deduped_detections:
                    return deduped_detections
            except Exception as err:
                print(f"[YOLODetector] Native PPE inference exception: {err}")

        # =====================================================================
        # OpenCV Heuristic Fallback Mode (Only if neural model returns no detections)
        # =====================================================================
        raw_persons = []
        if self.hog is not None:
            try:
                scale = min(1.0, 1000.0 / max(w0, h0))
                small_img = cv2.resize(img, (int(w0 * scale), int(h0 * scale))) if scale < 1.0 else img
                gray = cv2.cvtColor(small_img, cv2.COLOR_BGR2GRAY)
                boxes_hog, weights = self.hog.detectMultiScale(
                    gray,
                    winStride=(8, 8),
                    padding=(16, 16),
                    scale=1.05,
                    hitThreshold=0.0
                )
                for (bx, by, bw, bh), wgt in zip(boxes_hog, weights):
                    conf = min(0.96, max(0.55, float(wgt) * 0.4 + 0.5))
                    inv_scale = 1.0 / scale
                    rx1, ry1 = int(bx * inv_scale), int(by * inv_scale)
                    rx2, ry2 = int((bx + bw) * inv_scale), int((by + bh) * inv_scale)
                    raw_persons.append({
                        "class_id": 5,
                        "label": "Person",
                        "confidence": round(conf, 4),
                        "bbox": {"x1": float(rx1), "y1": float(ry1), "x2": float(rx2), "y2": float(ry2)},
                        "class": "person",
                        "raw_class": "Person",
                        "box": [max(0, rx1), max(0, ry1), min(w0, rx2), min(h0, ry2)]
                    })
            except Exception as err:
                print(f"[YOLODetector] HOG exception: {err}")

        # Fallback Haar Cascades
        if len(raw_persons) == 0 and (self.upper_cascade or self.body_cascade):
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            if self.body_cascade:
                bodies = self.body_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(40, 80))
                for (bx, by, bw, bh) in bodies:
                    raw_persons.append({
                        "class_id": 5, "label": "Person", "confidence": 0.85,
                        "bbox": {"x1": float(bx), "y1": float(by), "x2": float(bx + bw), "y2": float(by + bh)},
                        "class": "person", "raw_class": "Person",
                        "box": [bx, by, bx + bw, by + bh]
                    })
            if self.upper_cascade and len(raw_persons) == 0:
                uppers = self.upper_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(40, 40))
                for (ux, uy, uw, uh) in uppers:
                    py2 = min(h0, uy + int(uh * 2.2))
                    raw_persons.append({
                        "class_id": 5, "label": "Person", "confidence": 0.82,
                        "bbox": {"x1": float(ux), "y1": float(uy), "x2": float(ux + uw), "y2": float(py2)},
                        "class": "person", "raw_class": "Person",
                        "box": [ux, uy, ux + uw, py2]
                    })

        # Non-Maximum Suppression for fallback persons
        unique_persons = []
        if raw_persons:
            boxes = [p["box"] for p in raw_persons]
            confs = [p["confidence"] for p in raw_persons]
            indices = cv2.dnn.NMSBoxes(boxes, confs, 0.10, 0.65)
            for idx in indices:
                i = idx[0] if isinstance(idx, (list, np.ndarray)) else idx
                unique_persons.append(raw_persons[i])

        unique_persons.sort(key=lambda p: p["box"][0])

        all_detections = list(unique_persons)
        for p in unique_persons:
            x1, y1, x2, y2 = p["box"]
            pw, ph = max(1, x2 - x1), max(1, y2 - y1)
            aspect_ratio = ph / float(pw)

            head_pct = 0.22 if aspect_ratio >= 1.8 else 0.32
            hy1, hy2 = max(0, y1), min(h0, int(y1 + ph * head_pct))
            hx1, hx2 = max(0, x1), min(w0, x2)

            if hy2 > hy1 and hx2 > hx1:
                head_crop = img[hy1:hy2, hx1:hx2]
                if self._detect_helmet_in_crop(head_crop):
                    all_detections.append({
                        "class_id": 0,
                        "label": "Hardhat",
                        "confidence": round(min(0.99, p["confidence"] * 0.98), 4),
                        "bbox": {"x1": float(hx1), "y1": float(hy1), "x2": float(hx2), "y2": float(hy2)},
                        "class": "hard_hat",
                        "raw_class": "Hardhat",
                        "box": [hx1 + int(pw * 0.08), hy1, hx2 - int(pw * 0.08), hy2]
                    })

            torso_start_pct = 0.20 if aspect_ratio >= 1.8 else 0.28
            torso_end_pct = 0.68 if aspect_ratio >= 1.8 else 0.90
            vy1, vy2 = max(0, int(y1 + ph * torso_start_pct)), min(h0, int(y1 + ph * torso_end_pct))
            vx1, vx2 = max(0, x1), min(w0, x2)

            if vy2 > vy1 and vx2 > vx1:
                torso_crop = img[vy1:vy2, vx1:vx2]
                if self._detect_vest_in_crop(torso_crop):
                    all_detections.append({
                        "class_id": 7,
                        "label": "Safety Vest",
                        "confidence": round(min(0.99, p["confidence"] * 0.96), 4),
                        "bbox": {"x1": float(vx1), "y1": float(vy1), "x2": float(vx2), "y2": float(vy2)},
                        "class": "safety_vest",
                        "raw_class": "Safety Vest",
                        "box": [vx1 + int(pw * 0.05), vy1, vx2 - int(pw * 0.05), vy2]
                    })

        return all_detections

    def _detect_helmet_in_crop(self, crop) -> bool:
        """Color heuristic for hardhats in fallback mode."""
        if crop is None or crop.size == 0 or crop.shape[0] < 8 or crop.shape[1] < 8:
            return False

        h_crop, w_crop, _ = crop.shape
        crown_h = int(h_crop * 0.75)
        cw_start, cw_end = int(w_crop * 0.10), int(w_crop * 0.90)
        crown = crop[0:crown_h, cw_start:cw_end] if cw_end > cw_start else crop[0:crown_h, :]
        hsv = cv2.cvtColor(crown, cv2.COLOR_BGR2HSV)
        total_pixels = float(crown.shape[0] * crown.shape[1])
        if total_pixels == 0:
            return False

        m_yellow = cv2.inRange(hsv, np.array([21, 90, 105]), np.array([42, 255, 255]))
        m_orange = cv2.inRange(hsv, np.array([8, 145, 135]), np.array([19, 255, 255]))
        center_w_start, center_w_end = int(crown.shape[1] * 0.15), int(crown.shape[1] * 0.85)
        center_hsv = hsv[:, center_w_start:center_w_end] if center_w_end > center_w_start else hsv
        center_pixels = float(max(1, center_hsv.shape[0] * center_hsv.shape[1]))
        m_white = cv2.inRange(center_hsv, np.array([0, 0, 220]), np.array([180, 25, 255]))

        yellow_cnt = cv2.countNonZero(m_yellow)
        orange_cnt = cv2.countNonZero(m_orange)
        white_cnt = cv2.countNonZero(m_white)

        if (yellow_cnt / total_pixels) >= 0.075 and yellow_cnt >= 80:
            return True
        if (orange_cnt / total_pixels) >= 0.085 and orange_cnt >= 90:
            return True
        if (white_cnt / center_pixels) >= 0.12 and white_cnt >= 120:
            return True

        return False

    def _detect_vest_in_crop(self, crop) -> bool:
        """Color heuristic for safety vests in fallback mode."""
        if crop is None or crop.size == 0 or crop.shape[0] < 12 or crop.shape[1] < 12:
            return False

        hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
        total_pixels = float(crop.shape[0] * crop.shape[1])
        if total_pixels == 0:
            return False

        m_neon = cv2.inRange(hsv, np.array([22, 85, 100]), np.array([45, 255, 255]))
        m_orange = cv2.inRange(hsv, np.array([7, 125, 115]), np.array([18, 255, 255]))

        neon_cnt = cv2.countNonZero(m_neon)
        orange_cnt = cv2.countNonZero(m_orange)
        return ((neon_cnt + orange_cnt) / total_pixels) >= 0.14

    def generate_annotated_image(self, image_path: str, workers_compliance: List[Dict[str, Any]], output_filename: str) -> Optional[str]:
        """Draws calibrated bounding boxes and tactical HUD overlays on the image."""
        img = cv2.imread(image_path)
        if img is None:
            return None

        h_img, w_img, _ = img.shape

        for worker in workers_compliance:
            x1, y1, x2, y2 = worker["person_box"]
            status = worker["decision_status"]
            worker_id = worker["anonymous_worker_id"]
            violation_type = worker.get("violation_type") or "PPE VIOLATION"
            conf_pct = int(worker.get("person_confidence", 0.95) * 100)
            has_helmet = worker.get("has_helmet", False)
            has_vest = worker.get("has_vest", False)

            if status == "compliant":
                color = (40, 210, 60)  # Green (BGR)
                label = f"{worker_id}: COMPLIANT ({conf_pct}%)"
            elif status == "needs_human_review":
                color = (0, 215, 255)  # Yellow (BGR)
                label = f"{worker_id}: REVIEW NEEDED ({conf_pct}%)"
            else:
                color = (30, 40, 235)  # Red (BGR)
                label = f"{worker_id}: {violation_type.replace('_', ' ').upper()}"

            # 1. Main Worker Bounding Box
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

            # 2. Header Text Badge
            font = cv2.FONT_HERSHEY_SIMPLEX
            text_size = cv2.getTextSize(label, font, 0.45, 1)[0]
            bg_y1 = max(0, y1 - 22)
            cv2.rectangle(img, (x1, bg_y1), (min(w_img, x1 + text_size[0] + 12), y1), color, -1)
            cv2.putText(
                img, label, (x1 + 6, max(12, y1 - 6)), font, 0.45,
                (0, 0, 0) if status == "compliant" else (255, 255, 255), 1, cv2.LINE_AA
            )

            # 3. Head & Torso Sub-Anchors
            pw, ph = max(1, x2 - x1), max(1, y2 - y1)

            # Head anchor
            hy1, hy2 = y1, int(y1 + ph * 0.28)
            hx1, hx2 = int(x1 + pw * 0.10), int(x2 - pw * 0.10)
            h_col = (40, 210, 60) if has_helmet else (30, 40, 235)
            cv2.rectangle(img, (hx1, hy1), (hx2, hy2), h_col, 1)
            h_txt = "HELMET: OK" if has_helmet else "NO HELMET"
            cv2.putText(img, h_txt, (hx1 + 2, min(h_img - 2, hy2 - 4)), font, 0.32, h_col, 1, cv2.LINE_AA)

            # Torso anchor
            vy1, vy2 = int(y1 + ph * 0.25), int(y1 + ph * 0.68)
            vx1, vx2 = int(x1 + pw * 0.06), int(x2 - pw * 0.06)
            v_col = (40, 210, 60) if has_vest else (30, 40, 235)
            cv2.rectangle(img, (vx1, vy1), (vx2, vy2), v_col, 1)
            v_txt = "VEST: OK" if has_vest else "NO VEST"
            cv2.putText(img, v_txt, (vx1 + 2, min(h_img - 2, vy2 - 4)), font, 0.32, v_col, 1, cv2.LINE_AA)

        # Bottom Safety Disclaimer Banner
        banner_h = 30
        cv2.rectangle(img, (0, h_img - banner_h), (w_img, h_img), (15, 20, 25), -1)
        mode_tag = "NATIVE YOLOv8 PPE" if self.model_mode == "ppe_fine_tuned" else "OPENCV FALLBACK"
        cv2.putText(
            img, f"BuildSure AI Vision Engine [{mode_tag}] | Hansung-Cho PPE Model",
            (15, h_img - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 220, 255), 1, cv2.LINE_AA
        )

        output_path = os.path.join(settings.RESULTS_DIR, output_filename)
        cv2.imwrite(output_path, img)
        return output_path


# Single instance for the application
yolo_detector = YOLODetector()
