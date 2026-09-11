import os
import uuid
import cv2
import numpy as np
from PIL import Image
from app.config import settings

def normalize_class_name(raw_name: str) -> str:
    """
    Robust case-insensitive class name normalizer.
    Converts to lowercase, trims whitespace, and standardizes hyphens/spaces to underscores.
    Normalizes aliases:
      - helmet / hardhat / hard_hat / hard-hat -> hard_hat
      - vest / safety vest / safety_vest / safety-vest / reflective_vest -> safety_vest
      - person / worker -> person
    """
    clean = str(raw_name).strip().lower().replace("-", "_").replace(" ", "_")
    
    # Hard Hat Aliases
    if clean in ["helmet", "hardhat", "hard_hat", "safety_helmet", "hard_hats", "helmets"]:
        return "hard_hat"
    
    # Safety Vest Aliases
    if clean in [
        "vest", "safety_vest", "reflective_vest", "high_vis_vest",
        "hi_vis_vest", "safety_vests", "vests", "reflective_safety_vest"
    ]:
        return "safety_vest"
    
    # Person Aliases
    if clean in ["person", "worker", "human", "people", "persons", "workers", "subject"]:
        return "person"
    
    return clean


class YOLODetector:
    """
    BuildSure AI — Universal YOLO + OpenCV Computer Vision Detection Service
    Supports:
    - Mode 1: Native PPE Fine-Tuned YOLO Model (person, hard_hat, safety_vest directly from weights)
    - Mode 2: General COCO YOLOv8n + OpenCV Color/Spatial Heuristic Fallback
    - Mode 3: Model Unavailable Mode (Graceful OpenCV HOG/Cascade Fallback)
    """

    def __init__(self):
        self.model_path = settings.YOLO_MODEL_PATH
        self.confidence_threshold = settings.YOLO_CONFIDENCE_THRESHOLD
        self.ultralytics_model = None
        self.onnx_session = None
        self.hog = None
        self.model_mode = "model_unavailable"
        self.model_mode_description = "No neural model loaded. Using OpenCV fallback."
        self._load_model()
        self._load_hog()
        self._load_cascades()

    def _load_model(self):
        # Determine candidate model paths
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        candidate_paths = [
            self.model_path,
            os.path.join(base_dir, "models", "best.pt"),
            os.path.join(base_dir, "backend", "models", "best.pt"),
            os.path.join(base_dir, "yolov8n.pt"),
            os.path.join(base_dir, "backend", "yolov8n.pt"),
            "backend/models/best.pt",
            "backend/yolov8n.pt",
            "yolov8n.pt"
        ]

        # 1. Try loading Ultralytics YOLO PyTorch model
        try:
            from ultralytics import YOLO
            loaded = False
            for p in candidate_paths:
                if p and os.path.exists(p):
                    self.ultralytics_model = YOLO(p)
                    print(f"[YOLODetector] Successfully loaded YOLO model from '{p}'.")
                    loaded = True
                    break
            if not loaded:
                # Let ultralytics load or auto-download yolov8n.pt
                self.ultralytics_model = YOLO("yolov8n.pt")
                print("[YOLODetector] Successfully initialized default YOLO model 'yolov8n.pt'.")
                loaded = True

            if loaded and self.ultralytics_model is not None:
                self._classify_model_mode()
                return
        except Exception as e:
            print(f"[YOLODetector] Ultralytics load note: {e}")

        # 2. Try loading ONNX YOLO model via onnxruntime
        onnx_candidates = [
            os.path.join(base_dir, "yolov8n.onnx"),
            os.path.join(base_dir, "backend", "yolov8n.onnx"),
            os.path.join(base_dir, "yolo_coco.onnx"),
            os.path.join(base_dir, "backend", "yolo_coco.onnx"),
            "backend/yolov8n.onnx",
            "yolov8n.onnx"
        ]
        try:
            import onnxruntime as ort
            for candidate in onnx_candidates:
                if os.path.exists(candidate):
                    self.onnx_session = ort.InferenceSession(candidate, providers=['CPUExecutionProvider'])
                    self.onnx_input_name = self.onnx_session.get_inputs()[0].name
                    self.model_mode = "coco_heuristic_fallback"
                    self.model_mode_description = "Fallback heuristic mode — ONNX COCO YOLO model active."
                    print(f"[YOLODetector] Successfully loaded ONNX YOLO model from '{candidate}'.")
                    return
        except Exception as e:
            print(f"[YOLODetector] ONNX load note: {e}")

        self.model_mode = "model_unavailable"
        self.model_mode_description = "No neural model loaded. Using OpenCV fallback."
        print("[YOLODetector] Operating in OpenCV Computer Vision Fallback Mode.")

    def _classify_model_mode(self):
        """Inspects model class names to determine whether native PPE mode or fallback mode is active."""
        if self.ultralytics_model is None:
            self.model_mode = "model_unavailable"
            self.model_mode_description = "No neural model loaded. Using OpenCV fallback."
            return

        raw_names = getattr(self.ultralytics_model, 'names', {})
        if isinstance(raw_names, dict):
            norm_classes = {normalize_class_name(v) for v in raw_names.values()}
        elif isinstance(raw_names, (list, tuple)):
            norm_classes = {normalize_class_name(v) for v in raw_names}
        else:
            norm_classes = set()

        has_person = "person" in norm_classes
        has_hardhat = "hard_hat" in norm_classes
        has_vest = "safety_vest" in norm_classes

        if has_person and has_hardhat and has_vest:
            self.model_mode = "ppe_fine_tuned"
            self.model_mode_description = "Native PPE Fine-Tuned YOLO Model Active."
            print(f"[YOLODetector] Mode: {self.model_mode} — Full native PPE neural detection enabled.")
        else:
            self.model_mode = "coco_heuristic_fallback"
            self.model_mode_description = "Fallback heuristic mode — PPE-trained YOLO model not configured."
            print(f"[YOLODetector] Mode: {self.model_mode} — General person detection with OpenCV PPE heuristic fallback.")

    def _load_hog(self):
        try:
            if hasattr(cv2, 'HOGDescriptor') and hasattr(cv2, 'HOGDescriptor_getDefaultPeopleDetector'):
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
            cascade_dir = getattr(cv2, 'data', None)
            if cascade_dir and hasattr(cascade_dir, 'haarcascades'):
                p_face = os.path.join(cascade_dir.haarcascades, 'haarcascade_frontalface_default.xml')
                p_upper = os.path.join(cascade_dir.haarcascades, 'haarcascade_upperbody.xml')
                p_body = os.path.join(cascade_dir.haarcascades, 'haarcascade_fullbody.xml')
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
        return self.ultralytics_model if self.ultralytics_model is not None else self.onnx_session

    def detect_objects(self, image_path):
        """
        Runs object detection on ANY uploaded image.
        Returns exact backward-compatible schema:
        [
            {
                "class": str,          # "person", "hard_hat", or "safety_vest"
                "confidence": float,
                "box": [x1, y1, x2, y2]
            }
        ]
        """
        img = cv2.imread(image_path)
        if img is None:
            return []

        h0, w0, _ = img.shape

        # =====================================================================
        # MODE 1: NATIVE PPE FINE-TUNED YOLO MODEL MODE
        # =====================================================================
        if self.model_mode == "ppe_fine_tuned" and self.ultralytics_model is not None:
            try:
                imgsz = 1024 if max(w0, h0) >= 1000 else 640
                results = self.ultralytics_model(
                    image_path,
                    conf=0.15,
                    iou=0.60,
                    imgsz=imgsz,
                    verbose=False
                )
                native_detections = []
                for r in results:
                    for box in r.boxes:
                        cls_id = int(box.cls[0])
                        raw_class = self.ultralytics_model.names.get(cls_id, f"class_{cls_id}")
                        norm_class = normalize_class_name(raw_class)
                        conf = float(box.conf[0])
                        xyxy = box.xyxy[0].cpu().numpy().tolist()
                        x1, y1, x2, y2 = [int(v) for v in xyxy]

                        if norm_class in ["person", "hard_hat", "safety_vest"]:
                            native_detections.append({
                                "class": norm_class,
                                "confidence": round(conf, 2),
                                "box": [max(0, x1), max(0, y1), min(w0, x2), min(h0, y2)]
                            })

                if native_detections:
                    return native_detections
            except Exception as err:
                print(f"[YOLODetector] Native PPE inference exception: {err}")

        # =====================================================================
        # MODE 2: GENERAL COCO YOLO + OPENCV HEURISTIC FALLBACK MODE
        # =====================================================================
        raw_persons = []
        if self.ultralytics_model is not None:
            try:
                imgsz = 1024 if max(w0, h0) >= 1000 else 640
                results = self.ultralytics_model(
                    image_path,
                    conf=0.10,
                    iou=0.60,
                    imgsz=imgsz,
                    verbose=False
                )
                for r in results:
                    for box in r.boxes:
                        cls_id = int(box.cls[0])
                        raw_class = self.ultralytics_model.names.get(cls_id, f"class_{cls_id}")
                        norm_class = normalize_class_name(raw_class)
                        conf = float(box.conf[0])
                        xyxy = box.xyxy[0].cpu().numpy().tolist()
                        x1, y1, x2, y2 = [int(v) for v in xyxy]

                        if norm_class == "person":
                            bw = x2 - x1
                            bh = y2 - y1
                            if bw >= 12 and bh >= 18:
                                raw_persons.append({
                                    'box': [max(0, x1), max(0, y1), min(w0, x2), min(h0, y2)],
                                    'confidence': round(conf, 2)
                                })
            except Exception as err:
                print(f"[YOLODetector] Ultralytics inference exception: {err}")

        # Tier 2: OpenCV HOG Multi-Scale Pedestrian Detector (only used if neural model found 0 persons)
        if not raw_persons and self.hog is not None:
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
                        'box': [max(0, rx1), max(0, ry1), min(w0, rx2), min(h0, ry2)],
                        'confidence': round(conf, 2)
                    })
            except Exception as err:
                print(f"[YOLODetector] HOG exception: {err}")

        # Tier 3: Haar Cascades for closeups & occluded shots (only if still no persons found)
        if len(raw_persons) == 0 and (self.upper_cascade or self.body_cascade):
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            if self.body_cascade:
                bodies = self.body_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(40, 80))
                for (bx, by, bw, bh) in bodies:
                    raw_persons.append({'box': [bx, by, bx + bw, by + bh], 'confidence': 0.85})
            if self.upper_cascade and len(raw_persons) == 0:
                uppers = self.upper_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(40, 40))
                for (ux, uy, uw, uh) in uppers:
                    py2 = min(h0, uy + int(uh * 2.2))
                    raw_persons.append({'box': [ux, uy, ux + uw, py2], 'confidence': 0.82})

        # Deduplicate persons via Non-Maximum Suppression (NMS)
        unique_persons = []
        if raw_persons:
            boxes = [p['box'] for p in raw_persons]
            confs = [p['confidence'] for p in raw_persons]
            indices = cv2.dnn.NMSBoxes(boxes, confs, 0.10, 0.65)
            for idx in indices:
                i = idx[0] if isinstance(idx, (list, np.ndarray)) else idx
                unique_persons.append({
                    'class': 'person',
                    'confidence': round(confs[i], 2),
                    'box': boxes[i]
                })

        # Sort workers spatially from left to right (x1 ascending)
        unique_persons.sort(key=lambda p: p['box'][0])

        # Execute Calibrated Fallback OpenCV Spectroscopy on head and torso crops
        all_detections = list(unique_persons)
        for p in unique_persons:
            x1, y1, x2, y2 = p['box']
            pw, ph = max(1, x2 - x1), max(1, y2 - y1)
            aspect_ratio = ph / float(pw)

            # Adaptive head region height
            head_pct = 0.22 if aspect_ratio >= 1.8 else 0.32
            hy1, hy2 = max(0, y1), min(h0, int(y1 + ph * head_pct))
            hx1, hx2 = max(0, x1), min(w0, x2)

            if hy2 > hy1 and hx2 > hx1:
                head_crop = img[hy1:hy2, hx1:hx2]
                if self._detect_helmet_in_crop(head_crop):
                    all_detections.append({
                        'class': 'hard_hat',
                        'confidence': round(min(0.99, p['confidence'] * 0.98), 2),
                        'box': [hx1 + int(pw * 0.08), hy1, hx2 - int(pw * 0.08), hy2]
                    })

            # Adaptive torso region
            torso_start_pct = 0.20 if aspect_ratio >= 1.8 else 0.28
            torso_end_pct = 0.68 if aspect_ratio >= 1.8 else 0.90
            vy1, vy2 = max(0, int(y1 + ph * torso_start_pct)), min(h0, int(y1 + ph * torso_end_pct))
            vx1, vx2 = max(0, x1), min(w0, x2)

            if vy2 > vy1 and vx2 > vx1:
                torso_crop = img[vy1:vy2, vx1:vx2]
                if self._detect_vest_in_crop(torso_crop):
                    all_detections.append({
                        'class': 'safety_vest',
                        'confidence': round(min(0.99, p['confidence'] * 0.96), 2),
                        'box': [vx1 + int(pw * 0.05), vy1, vx2 - int(pw * 0.05), vy2]
                    })

        return all_detections

    def _detect_helmet_in_crop(self, crop):
        """
        Accurately detects safety hardhats (Yellow, Neon Lime, Orange, White).
        Rejects bare heads, hair, skin, and background scaffolding/sky.
        """
        if crop is None or crop.size == 0 or crop.shape[0] < 8 or crop.shape[1] < 8:
            return False

        h_crop, w_crop, _ = crop.shape
        # Focus strictly on the top crown region (top 75% of head crop, inner 80% width)
        crown_h = int(h_crop * 0.75)
        cw_start, cw_end = int(w_crop * 0.10), int(w_crop * 0.90)
        crown = crop[0:crown_h, cw_start:cw_end] if cw_end > cw_start else crop[0:crown_h, :]
        hsv = cv2.cvtColor(crown, cv2.COLOR_BGR2HSV)
        total_pixels = float(crown.shape[0] * crown.shape[1])
        if total_pixels == 0:
            return False

        # 1. Safety Yellow / Fluorescent Neon Lime Hardhat (Vibrant & Saturated)
        m_yellow = cv2.inRange(hsv, np.array([21, 90, 105]), np.array([42, 255, 255]))
        
        # 2. Safety Fluorescent Orange Hardhat (Deep orange, strictly above natural skin saturation)
        m_orange = cv2.inRange(hsv, np.array([8, 145, 135]), np.array([19, 255, 255]))
        
        # 3. Safety White Hardhat (Bright, concentrated dome in center crown)
        center_w_start, center_w_end = int(crown.shape[1] * 0.15), int(crown.shape[1] * 0.85)
        center_hsv = hsv[:, center_w_start:center_w_end] if center_w_end > center_w_start else hsv
        center_pixels = float(max(1, center_hsv.shape[0] * center_hsv.shape[1]))
        m_white = cv2.inRange(center_hsv, np.array([0, 0, 220]), np.array([180, 25, 255]))

        yellow_cnt = cv2.countNonZero(m_yellow)
        orange_cnt = cv2.countNonZero(m_orange)
        white_cnt = cv2.countNonZero(m_white)

        yellow_ratio = yellow_cnt / total_pixels
        orange_ratio = orange_cnt / total_pixels
        white_ratio = white_cnt / center_pixels

        # Strict checks: require significant solid crown coverage (at least 7.5% for yellow, 8.5% for orange, 12% for white)
        if yellow_ratio >= 0.075 and yellow_cnt >= 80:
            return True
        if orange_ratio >= 0.085 and orange_cnt >= 90:
            return True
        if white_ratio >= 0.12 and white_cnt >= 120:
            return True

        return False

    def _detect_vest_in_crop(self, crop):
        """
        Detects high-vis fluorescent safety vests (Neon Lime/Yellow and Safety Orange).
        Rejects ordinary clothing, background steel, and unvested shirts.
        """
        if crop is None or crop.size == 0 or crop.shape[0] < 12 or crop.shape[1] < 12:
            return False

        hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
        total_pixels = float(crop.shape[0] * crop.shape[1])
        if total_pixels == 0:
            return False

        # 1. Fluorescent Neon Lime / High-Vis Yellow Vest
        m_neon = cv2.inRange(hsv, np.array([22, 85, 100]), np.array([45, 255, 255]))
        
        # 2. High-Vis Fluorescent Orange Vest
        m_orange = cv2.inRange(hsv, np.array([7, 125, 115]), np.array([18, 255, 255]))

        neon_cnt = cv2.countNonZero(m_neon)
        orange_cnt = cv2.countNonZero(m_orange)
        
        combined_ratio = (neon_cnt + orange_cnt) / total_pixels

        # High-vis vest must occupy at least 14% of the torso bounding crop
        return combined_ratio >= 0.14

    def generate_annotated_image(self, image_path, workers_compliance, output_filename):
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
            pw, ph = x2 - x1, y2 - y1
            
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

        # Bottom Safety Disclaimer Banner with Mode Tag
        banner_h = 30
        cv2.rectangle(img, (0, h_img - banner_h), (w_img, h_img), (15, 20, 25), -1)
        mode_tag = "NATIVE PPE YOLO" if self.model_mode == "ppe_fine_tuned" else "YOLO + OPENCV FALLBACK"
        cv2.putText(
            img, f"BuildSure AI Vision Engine [{mode_tag}] | Automated OSHA PPE Verification",
            (15, h_img - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 220, 255), 1, cv2.LINE_AA
        )

        output_path = os.path.join(settings.RESULTS_DIR, output_filename)
        cv2.imwrite(output_path, img)
        return output_path


yolo_detector = YOLODetector()
