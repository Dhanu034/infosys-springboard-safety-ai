import os
import sys
import unittest
import numpy as np
import cv2
import tempfile
import io

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.services.video_safety_service import video_safety_service
from app.config import settings

client = TestClient(app)


def create_synthetic_test_video(filename: str, duration_sec: int = 3, fps: int = 10, draw_shapes: bool = False) -> str:
    """Helper to generate a lightweight valid MP4 test video with OpenCV."""
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    w, h = 320, 240
    out = cv2.VideoWriter(filename, fourcc, float(fps), (w, h))

    total_frames = duration_sec * fps
    for i in range(total_frames):
        # Create a frame (dark blue / background)
        frame = np.full((h, w, 3), (40, 20, 15), dtype=np.uint8)
        if draw_shapes:
            # Draw synthetic object
            cv2.rectangle(frame, (50, 50), (120, 180), (200, 200, 200), -1)
            cv2.circle(frame, (85, 40), 20, (0, 255, 255), -1) # yellow circle
        cv2.putText(frame, f"Frame {i}/{total_frames}", (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        out.write(frame)

    out.release()
    return filename


class TestVideoSafetyAnalysis(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        # Clean up temp files
        for f in os.listdir(self.temp_dir):
            try:
                os.remove(os.path.join(self.temp_dir, f))
            except Exception:
                pass
        try:
            os.rmdir(self.temp_dir)
        except Exception:
            pass

    def test_01_health_check(self):
        """Verify health check endpoint is operational."""
        res = client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")

    def test_02_unsupported_file_extension(self):
        """Verify API rejects non-video files (.txt, .pdf, .png) with HTTP 400."""
        fake_txt = io.BytesIO(b"Not a video file content")
        res = client.post(
            "/api/safety/analyze-video",
            files={"file": ("malicious_script.txt", fake_txt, "text/plain")},
            data={"project_id": "PRJ-101", "zone_name": "General Work Zone"}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("Unsupported video format", res.json()["detail"])

    def test_03_oversized_file_validation(self):
        """Verify file size validation logic enforces limit."""
        dummy_name = "test_oversize.mp4"
        is_valid, err = video_safety_service.validate_file(dummy_name, "video/mp4", file_size=150 * 1024 * 1024)
        self.assertFalse(is_valid)
        self.assertIn("exceeds maximum limit", err)

    def test_04_small_valid_mp4_no_violations(self):
        """Verify clean video with zero workers/PPE violations returns no-data rule: zero violations, highest_risk_score null."""
        vid_path = os.path.join(self.temp_dir, "clean_site_sample.mp4")
        create_synthetic_test_video(vid_path, duration_sec=2, fps=10, draw_shapes=False)

        with open(vid_path, "rb") as f:
            res = client.post(
                "/api/safety/analyze-video",
                files={"file": ("clean_site_sample.mp4", f, "video/mp4")},
                data={
                    "project_id": "PRJ-101",
                    "zone_name": "Excavation Zone",
                    "sampling_mode": "1fps"
                }
            )

        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "COMPLETED")
        self.assertEqual(data["mode"], "OFFLINE_VIDEO_ANALYSIS")
        self.assertEqual(data["project_id"], "PRJ-101")
        self.assertEqual(data["zone"], "Excavation Zone")
        self.assertIn("metadata", data)
        self.assertGreater(data["metadata"]["total_frames"], 0)
        self.assertGreater(data["metadata"]["sampled_frames"], 0)
        # NO-DATA Rule check
        self.assertEqual(data["summary"]["helmet_violation_incidents"], 0)
        self.assertEqual(data["summary"]["vest_violation_incidents"], 0)
        self.assertIsNone(data["summary"]["highest_risk_score"])
        self.assertEqual(len(data["grouped_incidents"]), 0)
        self.assertIn("Offline video safety analysis completed", data["message"])
        self.assertIn("advisory decision support", data["disclaimer"])

    def test_05_corrupt_video_handling(self):
        """Verify corrupt video payload returns HTTP 400 with descriptive error."""
        corrupt_bytes = io.BytesIO(b"FAKE_CORRUPT_MP4_HEADER_DATA_1234567890")
        res = client.post(
            "/api/safety/analyze-video",
            files={"file": ("corrupted_footage.mp4", corrupt_bytes, "video/mp4")},
            data={"project_id": "PRJ-101", "zone_name": "General Work Zone"}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("Unable to decode uploaded video file", res.json()["detail"])

    def test_06_temporal_grouping_logic(self):
        """Verify that multiple consecutive frames with violations group into single consolidated incidents within cooldown."""
        incidents = []
        active_groups = {}
        cooldown = 10.0

        # Simulate 15 consecutive frames (at 1 sec intervals) detecting missing_helmet
        simulated_frames = [
            {"time": 1.0, "frame": 10, "violation": {"violation_type": "missing_helmet", "final_risk_score": 60.0, "confidence_score": 0.92, "risk_category": "High", "decision_status": "confirmed_violation"}},
            {"time": 2.0, "frame": 20, "violation": {"violation_type": "missing_helmet", "final_risk_score": 75.0, "confidence_score": 0.95, "risk_category": "High", "decision_status": "confirmed_violation"}},
            {"time": 3.0, "frame": 30, "violation": {"violation_type": "missing_helmet", "final_risk_score": 70.0, "confidence_score": 0.91, "risk_category": "High", "decision_status": "confirmed_violation"}},
            # Gap of 15 seconds (exceeds 10s cooldown) -> should start a second incident
            {"time": 20.0, "frame": 200, "violation": {"violation_type": "missing_helmet", "final_risk_score": 80.0, "confidence_score": 0.96, "risk_category": "High", "decision_status": "confirmed_violation"}},
            {"time": 21.0, "frame": 210, "violation": {"violation_type": "missing_helmet", "final_risk_score": 80.0, "confidence_score": 0.94, "risk_category": "High", "decision_status": "confirmed_violation"}},
        ]

        for s in simulated_frames:
            v = s["violation"]
            v_type = v["violation_type"]
            t = s["time"]
            f = s["frame"]
            g_key = ("PRJ-101", "General", v_type)

            if g_key in active_groups:
                inc = active_groups[g_key]
                if (t - inc["end_timestamp_seconds"]) <= cooldown:
                    inc["end_timestamp_seconds"] = t
                    inc["end_frame"] = f
                    inc["occurrences_count"] += 1
                    inc["peak_risk_score"] = max(inc["peak_risk_score"], v["final_risk_score"])
                else:
                    incidents.append(inc)
                    active_groups[g_key] = video_safety_service._create_incident_dict(len(incidents) + 1, v_type, t, f, v, None)
            else:
                active_groups[g_key] = video_safety_service._create_incident_dict(len(incidents) + 1, v_type, t, f, v, None)

        for inc in active_groups.values():
            incidents.append(inc)

        self.assertEqual(len(incidents), 2, "Expected 2 consolidated incidents separated by cooldown gap")
        self.assertEqual(incidents[0]["occurrences_count"], 3)
        self.assertEqual(incidents[0]["start_timestamp_seconds"], 1.0)
        self.assertEqual(incidents[0]["end_timestamp_seconds"], 3.0)
        self.assertEqual(incidents[0]["peak_risk_score"], 75.0)

        self.assertEqual(incidents[1]["occurrences_count"], 2)
        self.assertEqual(incidents[1]["start_timestamp_seconds"], 20.0)
        self.assertEqual(incidents[1]["end_timestamp_seconds"], 21.0)

    def test_07_existing_image_analysis_unaltered(self):
        """Verify existing image detection endpoint /api/safety/analyze-image functions normally without regressions."""
        img_path = os.path.join(self.temp_dir, "test_worker_photo.jpg")
        img = np.full((300, 300, 3), (120, 100, 80), dtype=np.uint8)
        cv2.imwrite(img_path, img)

        with open(img_path, "rb") as f:
            res = client.post(
                "/api/safety/analyze-image",
                files={"file": ("test_worker_photo.jpg", f, "image/jpeg")},
                data={"project_id": "PRJ-101", "zone_name": "General Work Zone"}
            )

        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("analysis_id", data)
        self.assertIn("overall_safety_score", data)
        self.assertIn("annotated_image_url", data)


if __name__ == "__main__":
    unittest.main()
