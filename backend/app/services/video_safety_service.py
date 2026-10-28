import os
import time
import uuid
import json
import datetime
from typing import List, Dict, Any, Optional, Tuple
import cv2
import numpy as np
from sqlalchemy.orm import Session

from app.config import settings
from app import models
from app.services.yolo_detector import yolo_detector
from app.services.safety_agent import safety_agent
from app.services.n8n_dispatcher import n8n_dispatcher


class VideoSafetyService:
    """
    BuildSure AI — Additive Video Safety Analysis Service (Offline Footage Analysis)
    
    IMPORTANT SCOPE:
    - Offline uploaded video analysis ONLY.
    - NOT live CCTV, RTSP streaming, webcam, or multi-camera monitoring.
    - Enforces strict validation (types, size limit 100MB, server-side unique filenames).
    - Frame sampling (1 FPS, 2 FPS, every Nth frame) with OpenCV VideoCapture.
    - YOLOv8 inference + SafetyAgent spatial association & risk scoring per sampled frame.
    - Deterministic temporal de-duplication: groups repeated detections within cooldown interval (10s).
    - Produces consolidated SQLite violations & alerts (tagged as VIDEO_ANALYSIS).
    - Non-blocking n8n webhook dispatch for qualifying High/Critical grouped incidents.
    - Generates annotated video / keyframe evidence fallback.
    """

    ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov"}
    ALLOWED_MIME_TYPES = {
        "video/mp4",
        "video/x-msvideo",
        "video/quicktime",
        "video/avi",
        "application/octet-stream"
    }
    DEFAULT_COOLDOWN_SECONDS = 10.0

    def validate_file(self, filename: str, content_type: Optional[str], file_size: int) -> Tuple[bool, Optional[str]]:
        """Validates video extension, MIME type, and size limit."""
        ext = os.path.splitext(filename)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            return False, f"Unsupported video format '{ext}'. Allowed formats: MP4, AVI, MOV."

        if content_type and content_type.lower() not in self.ALLOWED_MIME_TYPES:
            # Allow fallback if extension is explicitly valid but MIME type is generic
            if ext not in self.ALLOWED_EXTENSIONS:
                return False, f"Unsupported MIME type '{content_type}'. Allowed types: MP4, AVI, MOV."

        max_bytes = getattr(settings, "MAX_VIDEO_SIZE_MB", 100) * 1024 * 1024
        if file_size > max_bytes:
            return False, f"Video file size exceeds maximum limit of {getattr(settings, 'MAX_VIDEO_SIZE_MB', 100)} MB."

        return True, None

    def analyze_video(
        self,
        video_bytes: bytes,
        filename: str,
        content_type: Optional[str],
        project_id: str = "PRJ-101",
        zone_name: str = "General Work Zone",
        sampling_mode: str = "1fps",
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Executes full offline video analysis pipeline:
        1. Validates and saves video locally with sanitized server-side filename.
        2. Extracts metadata via OpenCV VideoCapture.
        3. Samples frames according to sampling_mode.
        4. Runs YOLO detection and SafetyAgent on sampled frames.
        5. Groups repeated detections into consolidated incidents (10s cooldown).
        6. Generates annotated video and/or keyframe evidence.
        7. Persists consolidated DB records and dispatches alerts for High/Critical incidents.
        """
        file_size = len(video_bytes)
        is_valid, err_msg = self.validate_file(filename, content_type, file_size)
        if not is_valid:
            raise ValueError(err_msg)

        file_id = str(uuid.uuid4())[:8]
        timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        ext = os.path.splitext(filename)[1].lower()
        saved_video_name = f"video_{file_id}_{timestamp_str}{ext}"
        saved_video_path = os.path.join(settings.UPLOAD_DIR, saved_video_name)

        # Write uploaded file safely to disk
        try:
            with open(saved_video_path, "wb") as f:
                f.write(video_bytes)
        except Exception as write_err:
            raise RuntimeError(f"Failed to save video file: {write_err}")

        # Open video with OpenCV VideoCapture
        cap = cv2.VideoCapture(saved_video_path)
        if not cap.isOpened():
            if os.path.exists(saved_video_path):
                try:
                    os.remove(saved_video_path)
                except Exception:
                    pass
            raise ValueError("Unable to decode uploaded video file. The file may be corrupted or use an unsupported codec.")

        fps = cap.get(cv2.CAP_PROP_FPS)
        if not fps or fps <= 0 or np.isnan(fps):
            fps = 30.0
        else:
            fps = round(float(fps), 2)

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames < 0:
            total_frames = 0

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration_seconds = round(total_frames / fps, 2) if total_frames > 0 and fps > 0 else 0.0

        # Determine frame step based on sampling_mode
        mode_lower = (sampling_mode or "1fps").strip().lower()
        if mode_lower in ["2fps", "2_fps"]:
            step = max(1, int(round(fps / 2.0)))
        elif mode_lower in ["every_10_frames", "every10frames", "10frames", "every_10"]:
            step = 10
        elif mode_lower in ["every_5_frames", "5frames"]:
            step = 5
        else:
            # Default to 1 FPS
            step = max(1, int(round(fps)))

        # Temporal Tracking & Incident Grouping Structures
        # Key: (project_id, zone_name, violation_type)
        active_incident_groups: Dict[Tuple[str, str, str], Dict[str, Any]] = {}
        completed_grouped_incidents: List[Dict[str, Any]] = []
        keyframe_evidence: List[Dict[str, Any]] = []

        peak_persons_in_frame = 0
        total_sampled_frames = 0
        annotated_frames_for_video: List[np.ndarray] = []

        temp_frame_paths_to_clean: List[str] = []

        # Adaptive frame budget: sample up to 6 key representative frames across video duration for 2-3s response
        MAX_SAMPLE_FRAMES = 6
        if total_frames > MAX_SAMPLE_FRAMES:
            sample_frame_indices = [int(i * (total_frames - 1) / (MAX_SAMPLE_FRAMES - 1)) for i in range(MAX_SAMPLE_FRAMES)]
        else:
            sample_frame_indices = list(range(0, max(1, total_frames), max(1, step)))

        try:
            for frame_idx in sample_frame_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                if not ret or frame is None:
                    continue

                total_sampled_frames += 1
                current_time_sec = round(frame_idx / fps, 2)

                # Save temporary frame image for YOLO detection
                temp_frame_name = f"temp_{file_id}_f{frame_idx}_{timestamp_str}.jpg"
                temp_frame_path = os.path.join(settings.UPLOAD_DIR, temp_frame_name)
                cv2.imwrite(temp_frame_path, frame)
                temp_frame_paths_to_clean.append(temp_frame_path)

                # 1. Run YOLO inference on sampled frame
                detections = yolo_detector.detect_objects(temp_frame_path)

                # 2. Run SafetyAgent rule & PPE association
                agent_result = safety_agent.analyze_detections(
                    detections=detections,
                    zone_name=zone_name,
                    project_id=project_id
                )

                workers = agent_result.get("workers_compliance", [])
                violations = agent_result.get("violations", [])
                total_workers = agent_result.get("total_workers", 0)
                peak_persons_in_frame = max(peak_persons_in_frame, total_workers)

                # 3. Generate annotated keyframe image
                keyframe_filename = f"keyframe_{file_id}_f{frame_idx}.jpg"
                keyframe_saved_path = yolo_detector.generate_annotated_image(
                    temp_frame_path,
                    workers,
                    keyframe_filename
                )
                keyframe_url = f"/results/{keyframe_filename}" if keyframe_saved_path else None

                # If annotated image exists, load back for video builder
                if keyframe_saved_path and os.path.exists(keyframe_saved_path):
                    ann_img = cv2.imread(keyframe_saved_path)
                    if ann_img is not None:
                        annotated_frames_for_video.append(ann_img)
                else:
                    annotated_frames_for_video.append(frame)

                # Save representative keyframes (keyframes with violations, or periodically up to 12 frames)
                if keyframe_url and (len(violations) > 0 or len(keyframe_evidence) < 4 or frame_idx % (step * 5) == 0):
                    if len(keyframe_evidence) < 12:
                        keyframe_evidence.append({
                            "frame_number": frame_idx,
                            "timestamp_seconds": current_time_sec,
                            "image_url": keyframe_url,
                            "persons_detected": total_workers,
                            "violations_count": len(violations),
                            "decision_status": "violation" if len(violations) > 0 else ("needs_human_review" if agent_result.get("human_review_required") else "compliant")
                        })

                # 4. Group repeated detections within Cooldown Interval
                frame_violation_types = set()
                for v in violations:
                    v_type = v.get("violation_type", "unspecified_violation")
                    frame_violation_types.add(v_type)
                    group_key = (project_id, zone_name, v_type)

                    if group_key in active_incident_groups:
                        inc = active_incident_groups[group_key]
                        # Check cooldown
                        if (current_time_sec - inc["end_timestamp_seconds"]) <= self.DEFAULT_COOLDOWN_SECONDS:
                            # Extend existing grouped incident
                            inc["end_timestamp_seconds"] = current_time_sec
                            inc["end_frame"] = frame_idx
                            inc["occurrences_count"] += 1
                            inc["peak_risk_score"] = max(inc["peak_risk_score"], float(v.get("final_risk_score", 50.0)))
                            inc["max_confidence"] = max(inc["max_confidence"], float(v.get("confidence_score", 0.90)))
                            if v.get("decision_status") == "needs_human_review" or v.get("confidence_score", 1.0) < 0.45:
                                inc["needs_human_review"] = True
                            if float(v.get("final_risk_score", 0)) >= inc["peak_risk_score"] and keyframe_url:
                                inc["evidence_frame_reference"] = keyframe_url
                        else:
                            # Cooldown exceeded: close previous group and start new one
                            completed_grouped_incidents.append(inc)
                            active_incident_groups[group_key] = self._create_incident_dict(
                                len(completed_grouped_incidents) + 1,
                                v_type,
                                current_time_sec,
                                frame_idx,
                                v,
                                keyframe_url
                            )
                    else:
                        # Start new grouped incident
                        active_incident_groups[group_key] = self._create_incident_dict(
                            len(completed_grouped_incidents) + len(active_incident_groups) + 1,
                            v_type,
                            current_time_sec,
                            frame_idx,
                            v,
                            keyframe_url
                        )

                # Check for expired groups that were NOT observed in this frame
                expired_keys = []
                for g_key, inc in active_incident_groups.items():
                    if g_key[2] not in frame_violation_types:
                        if (current_time_sec - inc["end_timestamp_seconds"]) > self.DEFAULT_COOLDOWN_SECONDS:
                            completed_grouped_incidents.append(inc)
                            expired_keys.append(g_key)
                for k in expired_keys:
                    del active_incident_groups[k]

            # Flush remaining active incident groups
            for inc in active_incident_groups.values():
                completed_grouped_incidents.append(inc)

        finally:
            cap.release()
            # Clean up temporary sampled frame files
            for p in temp_frame_paths_to_clean:
                if os.path.exists(p):
                    try:
                        os.remove(p)
                    except Exception:
                        pass

        # 5. Build Annotated Video Output (if codecs available)
        annotated_video_url = None
        if annotated_frames_for_video and len(annotated_frames_for_video) > 0:
            ann_vid_filename = f"annotated_{file_id}_{timestamp_str}.mp4"
            ann_vid_path = os.path.join(settings.RESULTS_DIR, ann_vid_filename)
            encoded_ok = self._write_annotated_video(
                annotated_frames_for_video,
                ann_vid_path,
                fps=max(1.0, min(10.0, float(len(annotated_frames_for_video)) / max(1.0, duration_seconds)))
            )
            if encoded_ok and os.path.exists(ann_vid_path) and os.path.getsize(ann_vid_path) > 0:
                annotated_video_url = f"/results/{ann_vid_filename}"
            else:
                annotated_video_url = None

        # 6. Database Persistence & Consolidated Alerts
        if db is not None:
            self._persist_grouped_incidents(
                completed_grouped_incidents,
                project_id=project_id,
                zone_name=zone_name,
                orig_video_url=f"/uploads/{saved_video_name}",
                db=db
            )

        # 7. Format Final Response
        highest_risk = max([inc["peak_risk_score"] for inc in completed_grouped_incidents]) if completed_grouped_incidents else None
        critical_count = sum(1 for inc in completed_grouped_incidents if inc["risk_category"].upper() == "CRITICAL" or inc["peak_risk_score"] >= 75)
        review_count = sum(1 for inc in completed_grouped_incidents if inc["needs_human_review"])
        helmet_incidents = sum(1 for inc in completed_grouped_incidents if "helmet" in inc["violation_type"])
        vest_incidents = sum(1 for inc in completed_grouped_incidents if "vest" in inc["violation_type"])

        return {
            "analysis_id": f"VANL-{file_id}",
            "project_id": project_id,
            "zone": zone_name,
            "status": "COMPLETED",
            "mode": "OFFLINE_VIDEO_ANALYSIS",
            "metadata": {
                "fps": fps,
                "duration_seconds": duration_seconds,
                "total_frames": total_frames,
                "sampled_frames": total_sampled_frames,
                "resolution": f"{width}x{height}",
                "file_size_mb": round(file_size / (1024 * 1024), 2)
            },
            "summary": {
                "persons_detected": peak_persons_in_frame,
                "helmet_violation_incidents": helmet_incidents,
                "vest_violation_incidents": vest_incidents,
                "highest_risk_score": highest_risk,
                "critical_incidents": critical_count,
                "needs_human_review": review_count
            },
            "grouped_incidents": completed_grouped_incidents,
            "annotated_video_url": annotated_video_url,
            "keyframe_evidence": keyframe_evidence,
            "message": f"Offline video safety analysis completed for {total_sampled_frames} sampled frames across {duration_seconds}s footage.",
            "disclaimer": "Offline video analysis is advisory decision support. It is not live CCTV monitoring and requires supervisor review."
        }

    def _create_incident_dict(
        self,
        index: int,
        v_type: str,
        current_time_sec: float,
        frame_idx: int,
        v_dict: Dict[str, Any],
        keyframe_url: Optional[str]
    ) -> Dict[str, Any]:
        """Creates a standardized deterministic grouped incident record."""
        return {
            "incident_id": f"INC-V{index:03d}",
            "violation_type": v_type,
            "start_timestamp_seconds": current_time_sec,
            "end_timestamp_seconds": current_time_sec,
            "start_frame": frame_idx,
            "end_frame": frame_idx,
            "occurrences_count": 1,
            "peak_risk_score": float(v_dict.get("final_risk_score", 60.0)),
            "max_confidence": float(v_dict.get("confidence_score", 0.90)),
            "status": "OPEN",
            "risk_category": v_dict.get("risk_category", "Medium"),
            "evidence_frame_reference": keyframe_url or "",
            "needs_human_review": (v_dict.get("decision_status") == "needs_human_review" or v_dict.get("confidence_score", 1.0) < 0.45),
            "recommendation": v_dict.get("recommendation", ""),
            "required_ppe": v_dict.get("required_ppe", "Hard Hat, Safety Vest"),
            "missing_ppe": v_dict.get("missing_ppe", ""),
            "detected_ppe": v_dict.get("detected_ppe", ""),
            "bounding_box": v_dict.get("bounding_box", [])
        }

    def _write_annotated_video(
        self,
        frames: List[np.ndarray],
        output_path: str,
        fps: float = 2.0
    ) -> bool:
        """Safely encodes annotated frames into an MP4 video."""
        if not frames:
            return False

        h, w, _ = frames[0].shape
        codecs_to_try = [
            cv2.VideoWriter_fourcc(*'mp4v'),
            cv2.VideoWriter_fourcc(*'avc1'),
            cv2.VideoWriter_fourcc(*'H264'),
            cv2.VideoWriter_fourcc(*'XVID')
        ]

        for fourcc in codecs_to_try:
            try:
                out = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
                if out.isOpened():
                    for f in frames:
                        # Ensure frame size matches
                        if f.shape[0] != h or f.shape[1] != w:
                            resized = cv2.resize(f, (w, h))
                            out.write(resized)
                        else:
                            out.write(f)
                    out.release()
                    if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
                        return True
            except Exception as vid_err:
                print(f"[VideoSafetyService] Video encoding codec attempt note: {vid_err}")
                continue

        return False

    def _persist_grouped_incidents(
        self,
        incidents: List[Dict[str, Any]],
        project_id: str,
        zone_name: str,
        orig_video_url: str,
        db: Session
    ):
        """
        Stores consolidated grouped incidents into SQLite database tables (ppe_violations & safety_alerts)
        and dispatches n8n webhook only for qualifying High/Critical events.
        """
        zone_mult = safety_agent.get_zone_multiplier(zone_name)

        for inc in incidents:
            base_score = round(inc["peak_risk_score"] / zone_mult, 1) if zone_mult > 0 else inc["peak_risk_score"]
            dec_status = "needs_human_review" if inc["needs_human_review"] else "confirmed_violation"

            violation_entry = models.PPEViolation(
                project_id=project_id,
                zone_name=zone_name,
                camera_id="OFFLINE_VIDEO",
                anonymous_worker_id=f"Video-Incident-{inc['incident_id']}",
                violation_type=inc["violation_type"],
                required_ppe=inc["required_ppe"],
                detected_ppe=inc["detected_ppe"],
                missing_ppe=inc["missing_ppe"],
                confidence_score=inc["max_confidence"],
                base_risk_score=base_score,
                zone_multiplier=zone_mult,
                final_risk_score=inc["peak_risk_score"],
                risk_category=inc["risk_category"],
                decision_status=dec_status,
                original_image_path=orig_video_url,
                annotated_image_path=inc["evidence_frame_reference"] or orig_video_url,
                bounding_box_data=json.dumps(inc.get("bounding_box", [])),
                status="OPEN"
            )
            db.add(violation_entry)
            db.flush()

            # Create consolidated Safety Alert for non-compliant or high-risk incidents
            is_high_or_crit = (
                inc["peak_risk_score"] >= 61.0 or
                inc["risk_category"].upper() in ["HIGH", "CRITICAL"]
            )

            if is_high_or_crit or inc["needs_human_review"]:
                alert_entry = models.SafetyAlert(
                    violation_id=violation_entry.violation_id,
                    project_id=project_id,
                    severity=inc["risk_category"].upper(),
                    risk_score=inc["peak_risk_score"],
                    title=f"VIDEO_ANALYSIS Alert: {inc['violation_type'].replace('_', ' ').title()} ({inc['incident_id']})",
                    message=(
                        f"Consolidated offline video incident detected in {zone_name} between "
                        f"{inc['start_timestamp_seconds']}s–{inc['end_timestamp_seconds']}s "
                        f"({inc['occurrences_count']} frame occurrences). {inc['recommendation']}"
                    ),
                    status="OPEN",
                    automation_status="Not Configured"
                )
                db.add(alert_entry)
                db.flush()

                audit_entry = models.SafetyAuditLog(
                    alert_id=alert_entry.alert_id,
                    action="CREATE",
                    user_reference="VideoSafetyAgent-System",
                    note=(
                        f"Consolidated offline video alert generated in {zone_name} "
                        f"(Duration: {inc['start_timestamp_seconds']}s–{inc['end_timestamp_seconds']}s, "
                        f"Frames {inc['start_frame']}–{inc['end_frame']})."
                    )
                )
                db.add(audit_entry)

                # Optional non-blocking n8n webhook dispatch
                if is_high_or_crit:
                    try:
                        n8n_dispatcher.dispatch_alert(
                            alert_entry,
                            violation_entry,
                            db,
                            recommendation=inc["recommendation"]
                        )
                    except Exception as e:
                        print(f"[VideoSafetyService] Non-blocking n8n dispatch exception: {e}")

        db.commit()


# Singleton service instance
video_safety_service = VideoSafetyService()
