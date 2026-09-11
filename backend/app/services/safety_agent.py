import json
from typing import List, Dict, Any
from app.services.yolo_detector import normalize_class_name


class SafetyAgent:
    """
    BuildSure AI — Intelligent Safety Agent & PPE Association Engine
    Performs:
    1. Spatial association between detected persons and PPE objects (hard hats, safety vests)
    2. OSHA zone-weighted risk scoring
    3. Actionable remediation recommendations
    """

    ZONE_RISK_MULTIPLIERS = {
        "excavation": 1.5,
        "deep excavation": 1.5,
        "crane": 1.4,
        "tower crane": 1.4,
        "scaffolding": 1.4,
        "high-rise": 1.4,
        "electrical": 1.3,
        "substation": 1.3,
        "confined space": 1.5,
        "demolition": 1.5,
        "general work zone": 1.0,
        "general": 1.0
    }

    def get_zone_multiplier(self, zone_name: str) -> float:
        z = (zone_name or "").strip().lower()
        for k, v in self.ZONE_RISK_MULTIPLIERS.items():
            if k in z:
                return v
        return 1.0

    def generate_recommendation(self, violation_type: str, zone_name: str = "") -> str:
        vt = (violation_type or "").lower()
        zn = (zone_name or "Active Construction Site")

        if "missing_helmet_and_vest" in vt or ("helmet" in vt and "vest" in vt):
            return (
                f"CRITICAL: Worker missing both Hard Hat and High-Vis Vest in {zn}. "
                "Immediate site halt required. Issue mandatory Level-1 PPE before worker re-enters active zone."
            )
        elif "missing_helmet" in vt or "helmet" in vt:
            return (
                f"HIGH RISK: Missing Hard Hat detected in {zn}. "
                "Halt overhead activities nearby and ensure worker dons an OSHA-compliant Type I/II hard hat immediately."
            )
        elif "missing_vest" in vt or "vest" in vt:
            return (
                f"MEDIUM RISK: Missing High-Visibility Safety Vest in {zn}. "
                "Provide ANSI/ISEA 107 Class 2 reflective safety vest prior to mobile equipment interaction."
            )
        elif "review" in vt:
            return (
                f"REVIEW REQUIRED: Low-confidence detection in {zn}. "
                "Safety supervisor manual visual inspection recommended."
            )
        return f"Compliant: Worker adheres to all required PPE standards in {zn}."

    def _box_iou_or_containment(self, p_box: List[int], item_box: List[int]) -> float:
        """Calculates degree of containment/overlap of PPE item inside person box."""
        px1, py1, px2, py2 = p_box
        ix1, iy1, ix2, iy2 = item_box

        # Intersection
        xx1 = max(px1, ix1)
        yy1 = max(py1, iy1)
        xx2 = min(px2, ix2)
        yy2 = min(py2, iy2)

        w = max(0, xx2 - xx1)
        h = max(0, yy2 - yy1)
        inter_area = float(w * h)

        item_area = float(max(1, (ix2 - ix1) * (iy2 - iy1)))
        return inter_area / item_area

    def analyze_detections(
        self,
        detections: List[Dict[str, Any]],
        zone_name: str = "General Work Zone",
        project_id: str = "PRJ-101"
    ) -> Dict[str, Any]:
        """
        Takes raw detections from YOLODetector, associates PPE to each person,
        and produces OSHA compliance decisions and risk metrics.
        """
        zone_mult = self.get_zone_multiplier(zone_name)

        # 1. Separate normalized detections
        persons = []
        helmets = []
        vests = []

        for d in detections:
            c_name = normalize_class_name(d.get("class", ""))
            box = d.get("box", [0, 0, 0, 0])
            conf = float(d.get("confidence", 0.8))

            if c_name == "person":
                persons.append({"box": box, "confidence": conf})
            elif c_name == "hard_hat":
                helmets.append({"box": box, "confidence": conf})
            elif c_name == "safety_vest":
                vests.append({"box": box, "confidence": conf})

        # 2. For each person, check associated PPE
        workers_compliance = []
        violations = []
        recommendations = []

        for idx, p in enumerate(persons, start=1):
            worker_id = f"WRK-{idx:02d}"
            px1, py1, px2, py2 = p["box"]
            pw = px2 - px1
            ph = py2 - py1

            # Head & Torso anchors for person
            head_box = [px1, py1, px2, int(py1 + ph * 0.35)]
            torso_box = [px1, int(py1 + ph * 0.20), px2, int(py1 + ph * 0.75)]

            # Check hard hat association
            has_helmet = False
            helmet_conf = 0.0
            for h in helmets:
                # Check overlap with head region or overall person box
                if self._box_iou_or_containment(head_box, h["box"]) > 0.30 or self._box_iou_or_containment(p["box"], h["box"]) > 0.50:
                    has_helmet = True
                    helmet_conf = max(helmet_conf, h["confidence"])

            # Check vest association
            has_vest = False
            vest_conf = 0.0
            for v in vests:
                if self._box_iou_or_containment(torso_box, v["box"]) > 0.30 or self._box_iou_or_containment(p["box"], v["box"]) > 0.50:
                    has_vest = True
                    vest_conf = max(vest_conf, v["confidence"])

            # Determine compliance status
            detected_items = []
            missing_items = []

            if has_helmet:
                detected_items.append("Hard Hat")
            else:
                missing_items.append("Hard Hat")

            if has_vest:
                detected_items.append("Safety Vest")
            else:
                missing_items.append("Safety Vest")

            if has_helmet and has_vest:
                decision_status = "compliant"
                violation_type = "compliant"
                base_risk = 10.0
                risk_category = "Low"
            elif not has_helmet and not has_vest:
                decision_status = "violation"
                violation_type = "missing_helmet_and_vest"
                base_risk = 75.0
                risk_category = "Critical"
            elif not has_helmet:
                decision_status = "violation"
                violation_type = "missing_helmet"
                base_risk = 50.0
                risk_category = "High"
            else:
                decision_status = "violation"
                violation_type = "missing_vest"
                base_risk = 35.0
                risk_category = "Medium"

            final_risk = min(100.0, round(base_risk * zone_mult, 1))
            rec = self.generate_recommendation(violation_type, zone_name)

            worker_dict = {
                "anonymous_worker_id": worker_id,
                "person_box": p["box"],
                "person_confidence": p["confidence"],
                "has_helmet": has_helmet,
                "has_vest": has_vest,
                "helmet_confidence": round(helmet_conf, 2),
                "vest_confidence": round(vest_conf, 2),
                "decision_status": decision_status,
                "violation_type": violation_type,
                "risk_score": final_risk,
                "risk_category": risk_category,
                "recommendation": rec
            }
            workers_compliance.append(worker_dict)

            if decision_status != "compliant":
                violations.append({
                    "anonymous_worker_id": worker_id,
                    "violation_type": violation_type,
                    "required_ppe": "Hard Hat, Safety Vest",
                    "detected_ppe": ", ".join(detected_items) if detected_items else "None",
                    "missing_ppe": ", ".join(missing_items) if missing_items else "None",
                    "confidence_score": p["confidence"],
                    "base_risk_score": base_risk,
                    "zone_multiplier": zone_mult,
                    "final_risk_score": final_risk,
                    "risk_category": risk_category,
                    "decision_status": decision_status,
                    "bounding_box": p["box"],
                    "recommendation": rec
                })
                if rec not in recommendations:
                    recommendations.append(rec)

        total_workers = len(workers_compliance)
        compliant_count = sum(1 for w in workers_compliance if w["decision_status"] == "compliant")
        violations_count = len(violations)
        
        if total_workers > 0:
            overall_safety_score = round((compliant_count / total_workers) * 100.0, 1)
        else:
            overall_safety_score = 100.0

        if not recommendations:
            recommendations.append(f"All {total_workers} detected personnel in {zone_name} are fully compliant with PPE requirements.")

        return {
            "total_workers": total_workers,
            "compliant_workers": compliant_count,
            "violations_count": violations_count,
            "overall_safety_score": overall_safety_score,
            "workers_compliance": workers_compliance,
            "violations": violations,
            "recommendations": recommendations
        }


safety_agent = SafetyAgent()
