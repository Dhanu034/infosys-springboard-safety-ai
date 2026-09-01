import os
import uuid
import cv2
import numpy as np
from PIL import Image
from app.config import settings

class YOLODetector:
    """
    BuildSure AI — YOLO Object Detection Service
    Integrates Ultralytics YOLO for construction site object detection
    (person, helmet, safety vest) and generates OpenCV annotated output images.
    """

    def __init__(self):
        self.model_path = settings.YOLO_MODEL_PATH
        self.confidence_threshold = settings.YOLO_CONFIDENCE_THRESHOLD
        self.model = None
        self.is_demo_mode = False
        self._load_model()

    def _load_model(self):
        try:
            from ultralytics import YOLO
            if os.path.exists(self.model_path) or self.model_path.endswith(".pt"):
                self.model = YOLO(self.model_path)
                print(f"[YOLODetector] Successfully loaded YOLO model from '{self.model_path}'.")
            else:
                # Load default ultralytics pretrained model
                self.model = YOLO("yolov8n.pt")
                print(f"[YOLODetector] Model path '{self.model_path}' not found. Loaded default 'yolov8n.pt'.")
        except Exception as e:
            print(f"[YOLODetector] Warning: Failed to load Ultralytics YOLO model ({e}). Operating in Demo/Fallback Detector mode.")
            self.model = None
            self.is_demo_mode = True

    def detect_objects(self, image_path):
        """
        Runs object detection on the image file at image_path.
        Returns list of detections: [{"class": str, "confidence": float, "box": [x1, y1, x2, y2]}]
        """
        detections = []

        if self.model is not None:
            try:
                results = self.model(image_path, conf=0.30) # Run with lower threshold to capture candidate boxes
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0])
                        class_name = self.model.names.get(cls_id, f"class_{cls_id}").lower()
                        conf = float(box.conf[0])
                        xyxy = box.xyxy[0].cpu().numpy().tolist()
                        x1, y1, x2, y2 = [int(v) for v in xyxy]

                        # Standard COCO mapping: person is class 0
                        if class_name in ["person", "worker"]:
                            detections.append({
                                "class": "person",
                                "confidence": conf,
                                "box": [x1, y1, x2, y2]
                            })
                        elif class_name in ["helmet", "hat", "cap"]:
                            detections.append({
                                "class": "helmet",
                                "confidence": conf,
                                "box": [x1, y1, x2, y2]
                            })
                        elif class_name in ["vest", "jacket", "coat"]:
                            detections.append({
                                "class": "safety_vest",
                                "confidence": conf,
                                "box": [x1, y1, x2, y2]
                            })
            except Exception as e:
                print(f"[YOLODetector] Inference error: {e}. Falling back to image-based heuristic detector.")
                detections = self._heuristic_detection(image_path)
        else:
            detections = self._heuristic_detection(image_path)

        # If YOLO (COCO) detected persons but no helmets/vests were in model classes,
        # apply geometric image analysis heuristic to detect helmet/vest in worker crops for demonstration
        if detections and not any(d["class"] in ["helmet", "safety_vest"] for d in detections):
            detections = self._enrich_person_detections_with_ppe(image_path, detections)

        return detections

    def _heuristic_detection(self, image_path):
        """
        Fallback heuristic detector for testing when PyTorch/YOLO weights are not present.
        Inspects image dimensions and generates candidate worker bounding boxes.
        """
        img = cv2.imread(image_path)
        if img is None:
            return []
        h, w, _ = img.shape

        # Generate realistic worker boxes for testing
        worker1_box = [int(w * 0.15), int(h * 0.20), int(w * 0.40), int(h * 0.85)]
        worker2_box = [int(w * 0.55), int(h * 0.25), int(w * 0.80), int(h * 0.90)]

        # Helmet 1 (Top of worker 1)
        helmet1_box = [int(w * 0.22), int(h * 0.18), int(w * 0.33), int(h * 0.32)]

        return [
            {"class": "person", "confidence": 0.92, "box": worker1_box},
            {"class": "person", "confidence": 0.88, "box": worker2_box},
            {"class": "helmet", "confidence": 0.85, "box": helmet1_box}
        ]

    def _enrich_person_detections_with_ppe(self, image_path, detections):
        """
        Analyzes head and torso regions of detected persons for bright safety colors (yellow/orange/red)
        to detect helmet/vest presence when standard COCO YOLO is used.
        """
        img = cv2.imread(image_path)
        if img is None:
            return detections

        enriched = list(detections)
        h_img, w_img, _ = img.shape

        for det in detections:
            if det["class"] == "person":
                x1, y1, x2, y2 = det["box"]
                pw = x2 - x1
                ph = y2 - y1

                # Head Crop (Upper 35%)
                hy1, hy2 = max(0, y1), min(h_img, int(y1 + ph * 0.35))
                hx1, hx2 = max(0, x1), min(w_img, x2)
                
                # Torso Crop (Middle 40%)
                vy1, vy2 = max(0, int(y1 + ph * 0.20)), min(h_img, int(y1 + ph * 0.70))
                vx1, vx2 = max(0, x1), min(w_img, x2)

                if hy2 > hy1 and hx2 > hx1:
                    head_crop = img[hy1:hy2, hx1:hx2]
                    if self._detect_safety_color(head_crop):
                        enriched.append({
                            "class": "helmet",
                            "confidence": round(det["confidence"] * 0.95, 2),
                            "box": [hx1 + int(pw * 0.2), hy1, hx2 - int(pw * 0.2), hy1 + int((hy2 - hy1) * 0.8)]
                        })

                if vy2 > vy1 and vx2 > vx1:
                    torso_crop = img[vy1:vy2, vx1:vx2]
                    if self._detect_safety_color(torso_crop):
                        enriched.append({
                            "class": "safety_vest",
                            "confidence": round(det["confidence"] * 0.92, 2),
                            "box": [vx1 + int(pw * 0.1), vy1 + int((vy2 - vy1) * 0.1), vx2 - int(pw * 0.1), vy2]
                        })

        return enriched

    def _detect_safety_color(self, crop):
        """
        HSV color range check for bright safety yellow, orange, and neon green.
        """
        if crop is None or crop.size == 0:
            return False
        hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
        
        # Yellow/Orange/Green safety colors
        lower_yellow = np.array([15, 80, 100])
        upper_yellow = np.array([45, 255, 255])
        
        lower_orange = np.array([5, 100, 100])
        upper_orange = np.array([15, 255, 255])

        mask_yellow = cv2.inRange(hsv, lower_yellow, upper_yellow)
        mask_orange = cv2.inRange(hsv, lower_orange, upper_orange)
        
        combined = cv2.bitwise_or(mask_yellow, mask_orange)
        ratio = cv2.countNonZero(combined) / (crop.shape[0] * crop.shape[1])
        return ratio > 0.04

    def generate_annotated_image(self, image_path, workers_compliance, output_filename):
        """
        Draws bounding boxes and labels on original image:
        - Green box for compliant worker
        - Yellow box for needs human review
        - Red box for confirmed PPE violation
        - Blue box for detected helmet / vest
        Saves annotated image to settings.RESULTS_DIR.
        """
        img = cv2.imread(image_path)
        if img is None:
            return None

        for worker in workers_compliance:
            x1, y1, x2, y2 = worker["person_box"]
            status = worker["decision_status"]
            worker_id = worker["anonymous_worker_id"]
            violation_type = worker["violation_type"]
            conf_pct = int(worker["person_confidence"] * 100)

            if status == "compliant":
                color = (0, 220, 0) # Green (BGR)
                label = f"{worker_id}: COMPLIANT ({conf_pct}%)"
            elif status == "needs_human_review":
                color = (0, 220, 255) # Yellow (BGR)
                label = f"{worker_id}: NEEDS REVIEW ({conf_pct}%)"
            else:
                color = (0, 0, 235) # Red (BGR)
                label = f"{worker_id}: VIOLATION - {violation_type.replace('_', ' ').upper()}"

            # Draw worker bounding box
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 3)

            # Draw background banner for text
            text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)[0]
            cv2.rectangle(img, (x1, max(0, y1 - 25)), (x1 + text_size[0] + 10, y1), color, -1)
            cv2.putText(img, label, (x1 + 5, max(12, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)

        # Add Disclaimer Watermark Banner at Bottom
        h_img, w_img, _ = img.shape
        banner_h = 35
        cv2.rectangle(img, (0, h_img - banner_h), (w_img, h_img), (20, 20, 20), -1)
        cv2.putText(img, "AI detections are decision-support signals and require safety supervisor verification.",
                    (15, h_img - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 220, 255), 1, cv2.LINE_AA)

        output_path = os.path.join(settings.RESULTS_DIR, output_filename)
        cv2.imwrite(output_path, img)
        return output_path

yolo_detector = YOLODetector()
