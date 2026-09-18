import os
import sys
from app.services.yolo_detector import yolo_detector
from app.services.safety_agent import safety_agent

def main():
    print("=== PPE MODEL INTEGRATION TEST ===")
    print(f"Model Path Configured: {yolo_detector.model_path}")
    print(f"Model Mode: {yolo_detector.model_mode}")
    print(f"Model Mode Description: {yolo_detector.model_mode_description}")
    
    test_img = os.path.join(os.path.dirname(__file__), "uploads", "upload_34ff41de_20260911_211529.jpg")
    if not os.path.exists(test_img):
        print(f"Image not found at {test_img}")
        return

    detections = yolo_detector.detect_objects(test_img)
    print(f"\n[1] Total Raw Detections Found: {len(detections)}")
    for i, d in enumerate(detections, 1):
        print(f"  {i}. Class: {d['class']} (raw: {d.get('raw_class')}) | Conf: {d['confidence']} | Box: {d['box']}")

    analysis = safety_agent.analyze_detections(
        detections=detections,
        zone_name="Excavation Zone",
        project_id="PRJ-101"
    )

    print(f"\n[2] SafetyAgent Analysis:")
    print(f"  - Total Workers: {analysis['total_workers']}")
    print(f"  - Compliant Workers: {analysis['compliant_workers']}")
    print(f"  - Violations Count: {analysis['violations_count']}")
    print(f"  - Overall Safety Score: {analysis['overall_safety_score']}%")

    print(f"\n[3] Worker Compliance Breakdown:")
    for w in analysis["workers_compliance"]:
        print(
            f"  - {w['anonymous_worker_id']}: Box={w['person_box']} | "
            f"Helmet={w['has_helmet']} (conf: {w['helmet_confidence']}) | "
            f"Vest={w['has_vest']} (conf: {w['vest_confidence']}) | "
            f"Status={w['decision_status']} | Risk={w['risk_score']} ({w['risk_category']})"
        )

    out_annotated = yolo_detector.generate_annotated_image(
        test_img,
        analysis["workers_compliance"],
        "test_annotated_output.jpg"
    )
    print(f"\n[4] Generated Annotated Image: {out_annotated}")
    assert os.path.exists(out_annotated), "Annotated image was not created!"
    print("=== TEST PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()
