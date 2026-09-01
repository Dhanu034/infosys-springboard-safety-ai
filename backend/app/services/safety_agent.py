import math

class SafetyAgent:
    """
    BuildSure AI — Safety Agent Core Module (Milestone 2)
    Autonomous AI Safety Agent that analyzes raw YOLO object detections,
    maps PPE items (helmets, vests) to individual worker bounding boxes via spatial geometry,
    evaluates construction zone rules, computes explainable risk scores, and generates actionable safety recommendations.
    """

    ZONE_RULES_MAP = {
        "General Work Zone": {"helmet": True, "vest": False, "harness": False, "multiplier": 1.0},
        "Excavation Zone": {"helmet": True, "vest": True, "harness": False, "multiplier": 1.2},
        "Vehicle Movement Zone": {"helmet": True, "vest": True, "harness": False, "multiplier": 1.3},
        "Electrical Work Zone": {"helmet": True, "vest": True, "harness": False, "multiplier": 1.3},
        "Work-at-Height Zone": {"helmet": True, "vest": True, "harness": True, "multiplier": 1.5},
    }

    BASE_RISK_SCORES = {
        "missing_helmet": 60,
        "missing_safety_vest": 50,
        "missing_helmet_and_vest": 85,
        "needs_human_review": 30,
        "compliant": 0
    }

    def __init__(self, confidence_threshold=0.70):
        this_conf = confidence_threshold
        self.confidence_threshold = confidence_threshold

    def get_zone_rule(self, zone_name):
        return self.ZONE_RULES_MAP.get(zone_name, self.ZONE_RULES_MAP["General Work Zone"])

    def point_in_box(self, px, py, box, tolerance=0.15):
        """
        Check if point (px, py) is inside or sufficiently near box [x1, y1, x2, y2].
        """
        x1, y1, x2, y2 = box
        bw = x2 - x1
        bh = y2 - y1
        
        tol_x = bw * tolerance
        tol_y = bh * tolerance

        return (x1 - tol_x) <= px <= (x2 + tol_x) and (y1 - tol_y) <= py <= (y2 + tol_y)

    def analyze_detections(self, detections, zone_name="General Work Zone", project_id="PRJ-101"):
        """
        Process raw YOLO detections list:
        Detections format: [{"class": str, "confidence": float, "box": [x1, y1, x2, y2]}]
        """
        zone_info = self.get_zone_rule(zone_name)
        requires_helmet = zone_info["helmet"]
        requires_vest = zone_info["vest"]
        requires_harness = zone_info["harness"]
        zone_multiplier = zone_info["multiplier"]

        persons = [d for d in detections if d["class"].lower() in ["person", "worker"]]
        helmets = [d for d in detections if d["class"].lower() in ["helmet", "safety_helmet", "hat"]]
        vests = [d for d in detections if d["class"].lower() in ["vest", "safety_vest", "high_vis_vest"]]

        workers_compliance = []
        violations = []
        recommendations_set = set()

        worker_counter = 1

        for person in persons:
            worker_id = f"Worker-{worker_counter:02d}"
            worker_counter += 1

            px1, py1, px2, py2 = person["box"]
            person_height = py2 - py1

            # Head area: Upper 35% of person bounding box
            head_box = [px1, py1, px2, py1 + (person_height * 0.35)]

            # Torso area: Middle 40% of person bounding box
            torso_box = [px1, py1 + (person_height * 0.20), px2, py1 + (person_height * 0.70)]

            # Match Helmet
            has_helmet = False
            matched_helmet_conf = 0.0
            for h in helmets:
                hx1, hy1, hx2, hy2 = h["box"]
                h_cx = (hx1 + hx2) / 2.0
                h_cy = (hy1 + hy2) / 2.0
                if self.point_in_box(h_cx, h_cy, head_box):
                    has_helmet = True
                    matched_helmet_conf = h["confidence"]
                    break

            # Match Vest
            has_vest = False
            matched_vest_conf = 0.0
            for v in vests:
                vx1, vy1, vx2, vy2 = v["box"]
                v_cx = (vx1 + vx2) / 2.0
                v_cy = (vy1 + vy2) / 2.0
                if self.point_in_box(v_cx, v_cy, torso_box):
                    has_vest = True
                    matched_vest_conf = v["confidence"]
                    break

            # Low confidence check for worker or matched PPE
            is_low_confidence = person["confidence"] < self.confidence_threshold

            # Evaluate Compliance Status
            missing_items = []
            if requires_helmet and not has_helmet:
                missing_items.append("Helmet")
            if requires_vest and not has_vest:
                missing_items.append("Safety Vest")

            # Determine Violation Type
            if is_low_confidence:
                violation_type = "needs_human_review"
                decision_status = "needs_human_review"
            elif "Helmet" in missing_items and "Safety Vest" in missing_items:
                violation_type = "missing_helmet_and_vest"
                decision_status = "confirmed_violation"
            elif "Helmet" in missing_items:
                violation_type = "missing_helmet"
                decision_status = "confirmed_violation"
            elif "Safety Vest" in missing_items:
                violation_type = "missing_safety_vest"
                decision_status = "confirmed_violation"
            else:
                violation_type = "compliant"
                decision_status = "compliant"

            # Calculate Risk Score
            base_score = self.BASE_RISK_SCORES.get(violation_type, 0)
            final_risk_score = min(100.0, round(base_score * zone_multiplier, 1))

            # Categorize Risk Rating
            if final_risk_score >= 81:
                risk_category = "Critical"
            elif final_risk_score >= 61:
                risk_category = "High"
            elif final_risk_score >= 31:
                risk_category = "Medium"
            else:
                risk_category = "Low"

            # Recommendations
            recommendation = self.generate_recommendation(violation_type, zone_name)
            if violation_type != "compliant":
                recommendations_set.add(recommendation)

            # Store Worker Compliance Record
            worker_record = {
                "anonymous_worker_id": worker_id,
                "person_box": person["box"],
                "person_confidence": person["confidence"],
                "has_helmet": has_helmet,
                "has_vest": has_vest,
                "requires_helmet": requires_helmet,
                "requires_vest": requires_vest,
                "requires_harness": requires_harness,
                "violation_type": violation_type,
                "decision_status": decision_status,
                "final_risk_score": final_risk_score,
                "risk_category": risk_category,
                "recommendation": recommendation
            }
            workers_compliance.append(worker_record)

            # Store Violation Record if non-compliant
            if violation_type != "compliant":
                violations.append({
                    "anonymous_worker_id": worker_id,
                    "project_id": project_id,
                    "zone_name": zone_name,
                    "violation_type": violation_type,
                    "required_ppe": ", ".join(missing_items + (["Harness"] if requires_harness else [])),
                    "detected_ppe": ", ".join(([ "Helmet" ] if has_helmet else []) + ([ "Safety Vest" ] if has_vest else [])),
                    "missing_ppe": ", ".join(missing_items),
                    "confidence_score": person["confidence"],
                    "base_risk_score": float(base_score),
                    "zone_multiplier": zone_multiplier,
                    "final_risk_score": final_risk_score,
                    "risk_category": risk_category,
                    "decision_status": decision_status,
                    "recommendation": recommendation,
                    "bounding_box": person["box"]
                })

        # Add harness disclaimer for Work-at-Height Zone
        if requires_harness:
            recommendations_set.add("Work-at-Height Zone: Safety harness verification requires manual supervisor review.")

        total_workers = len(workers_compliance)
        compliant_count = sum(1 for w in workers_compliance if w["decision_status"] == "compliant")
        overall_safety_score = round((compliant_count / total_workers * 100), 1) if total_workers > 0 else 100.0

        return {
            "total_workers": total_workers,
            "compliant_workers": compliant_count,
            "violations_count": len(violations),
            "overall_safety_score": overall_safety_score,
            "zone_multiplier": zone_multiplier,
            "workers_compliance": workers_compliance,
            "violations": violations,
            "recommendations": list(recommendations_set)
        }

    def generate_recommendation(self, violation_type, zone_name):
        if violation_type == "missing_helmet":
            return f"Ensure worker wears an approved safety helmet before continuing work in {zone_name}."
        elif violation_type == "missing_safety_vest":
            return f"Ensure worker wears a high-visibility safety vest before continuing work in {zone_name}."
        elif violation_type == "missing_helmet_and_vest":
            return f"Temporarily pause worker's activity in {zone_name} and ensure required PPE is worn before work resumes."
        elif violation_type == "needs_human_review":
            return f"The AI detection confidence is low. A safety supervisor should verify this observation in {zone_name}."
        return "Worker is compliant with safety PPE rules."

safety_agent = SafetyAgent()
