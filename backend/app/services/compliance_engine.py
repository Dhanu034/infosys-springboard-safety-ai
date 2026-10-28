import json
import re
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app import models

class ComplianceEngineService:
    DISCLAIMER_TEXT = "Reference Rule Match — Human Verification Required. Not a legal or regulatory certification."

    def parse_document_pages(self, full_text: str, expected_pages: int = 1) -> Dict[int, str]:
        """Split extracted text into individual pages using multiple common delimiters."""
        if not full_text:
            return {1: ""}
            
        pages_dict: Dict[int, str] = {}
        
        # 1. Check for standard delimiter: --- PAGE 1 --- or [PAGE 1]
        page_matches = list(re.finditer(r'(?:---|\[)\s*(?:PAGE|Page)\s*([0-9]+)\s*(?:---|\])', full_text))
        if page_matches:
            for idx, match in enumerate(page_matches):
                page_num = int(match.group(1))
                start_pos = match.end()
                end_pos = page_matches[idx + 1].start() if idx + 1 < len(page_matches) else len(full_text)
                pages_dict[page_num] = full_text[start_pos:end_pos].strip()
            return pages_dict

        # 2. Check for footer/header pattern: Page X of Y or Page X
        page_of_matches = list(re.finditer(r'(?:Page|PAGE)\s+([0-9]+)\s+(?:of|OF)\s+[0-9]+', full_text))
        if len(page_of_matches) > 1:
            for idx, match in enumerate(page_of_matches):
                page_num = int(match.group(1))
                start_pos = match.end()
                end_pos = page_of_matches[idx + 1].start() if idx + 1 < len(page_of_matches) else len(full_text)
                pages_dict[page_num] = full_text[start_pos:end_pos].strip()
            return pages_dict

        # 3. Check for form feed character '\f' (standard PDF page break)
        if '\f' in full_text:
            parts = [p.strip() for p in full_text.split('\f') if p.strip()]
            if parts:
                for idx, part in enumerate(parts):
                    pages_dict[idx + 1] = part
                return pages_dict

        # Default fallback to single page with full text
        pages_dict[1] = full_text.strip()
        return pages_dict

    def evaluate_document_against_rules(
        self,
        db: Session,
        document: models.ComplianceDocument,
        rules: Optional[List[models.RegulatoryRule]] = None
    ) -> List[models.ComplianceEvaluation]:
        """
        Deterministic rule-based compliance validation of an ingested document
        against reference regulatory standards (OSHA 1926, BOCW Act, Factories Act, ISO 45001).
        """
        if not rules:
            rules = db.query(models.RegulatoryRule).filter(models.RegulatoryRule.is_active == True).all()

        full_text = document.extracted_text or ""
        evaluations: List[models.ComplianceEvaluation] = []
        pages_dict = self.parse_document_pages(full_text, expected_pages=document.page_count or 1)

        for rule in rules:
            # Perform deterministic clause and keyword matching
            eval_result = self._match_rule_against_text(rule, full_text, pages_dict)

            # Create or update evaluation record
            evaluation = models.ComplianceEvaluation(
                project_id=document.project_id,
                doc_id=document.doc_id,
                rule_id=rule.rule_id,
                status=eval_result["status"],
                status_label=eval_result["status_label"],
                confidence=eval_result["confidence"],
                matched_clause=eval_result.get("matched_clause"),
                evidence_snippet=eval_result.get("evidence_snippet"),
                evidence_page=eval_result.get("evidence_page", 1),
                evidence_section=eval_result.get("evidence_section"),
                extraction_method=document.extraction_method or "pypdf",
                human_reviewed=False,
                reviewed_by=None,
                review_notes=eval_result.get("review_notes"),
                disclaimer=self.DISCLAIMER_TEXT
            )
            evaluations.append(evaluation)

        return evaluations

    def _match_rule_against_text(
        self,
        rule: models.RegulatoryRule,
        full_text: str,
        pages_dict: Dict[int, str]
    ) -> Dict[str, Any]:
        """Match rule keywords and clauses against text and extract page citations."""
        if not full_text or len(full_text.strip()) < 20:
            return {
                "status": "missing_evidence",
                "status_label": "Missing Evidence",
                "confidence": 0.50,
                "matched_clause": None,
                "evidence_snippet": "No text content was found in the ingested document for this standard.",
                "evidence_page": None,
                "evidence_section": None,
                "review_notes": "Document text extraction was empty or insufficient. Requires human supervisor review."
            }

        keywords: List[str] = []
        if rule.mandatory_keywords:
            try:
                keywords = json.loads(rule.mandatory_keywords)
            except Exception:
                keywords = [k.strip() for k in rule.mandatory_keywords.split(",") if k.strip()]

        # Search for keyword matches across pages
        matched_page = 1
        matched_sentence = ""
        found_keywords = []

        for page_num, page_content in sorted(pages_dict.items()):
            page_lower = page_content.lower()
            sentences = None
            for kw in keywords:
                if kw.lower() in page_lower:
                    if re.search(r'\b' + re.escape(kw) + r'\b', page_content, re.IGNORECASE):
                        found_keywords.append(kw)
                        matched_page = page_num
                        if sentences is None:
                            sentences = [s.strip().replace('\n', ' ') for s in re.split(r'(?<=[.!?])\s+|\n{2,}', page_content) if s.strip()]
                        for sent in sentences:
                            if re.search(r'\b' + re.escape(kw) + r'\b', sent, re.IGNORECASE):
                                matched_sentence = sent
                                break
                        if matched_sentence:
                            break
            if matched_sentence:
                break

        unique_found = list(set(found_keywords))

        if not unique_found:
            return {
                "status": "missing_evidence",
                "status_label": "Missing Evidence",
                "confidence": 0.60,
                "matched_clause": None,
                "evidence_snippet": f"Document does not mention mandatory requirements for {rule.category}.",
                "evidence_page": 1,
                "evidence_section": "General Content",
                "review_notes": f"No keywords matching {rule.standard_code} were found in the document."
            }

        # Check for positive vs negative compliance terminology
        lower_snippet = matched_sentence.lower()
        non_compliant_markers = ["not provided", "expired", "failed inspection", "prohibited", "non-compliant", "exemption denied", "unsafe"]
        has_negative = any(neg in lower_snippet for neg in non_compliant_markers)

        # Calculate rule match confidence based on keyword coverage
        coverage_ratio = len(unique_found) / max(1, len(keywords))
        confidence = round(min(0.98, max(0.70, 0.70 + (coverage_ratio * 0.28))), 2)

        # Detect section header in the matched page or full text
        target_page_text = pages_dict.get(matched_page, full_text)
        section_match = re.search(r'(?:SECTION|CHAPTER|CLAUSE|PART|ARTICLE)\s+[0-9A-Za-z.:-]+[^\n]{0,50}', target_page_text, re.IGNORECASE)
        if not section_match:
            section_match = re.search(r'(?:SECTION|CHAPTER|CLAUSE|PART|ARTICLE)\s+[0-9A-Za-z.:-]+[^\n]{0,50}', full_text, re.IGNORECASE)
        section_name = section_match.group(0).strip() if section_match else f"{rule.category} Section"

        if has_negative:
            return {
                "status": "non_compliant",
                "status_label": "Non-compliant indication",
                "confidence": confidence,
                "matched_clause": rule.requirement_summary,
                "evidence_snippet": matched_sentence[:300],
                "evidence_page": matched_page,
                "evidence_section": section_name,
                "review_notes": "Text indicates a potential deficiency or negative condition against the standard."
            }

        if confidence >= 0.80:
            return {
                "status": "compliant",
                "status_label": "Rule-based compliance indication",
                "confidence": confidence,
                "matched_clause": rule.requirement_summary,
                "evidence_snippet": matched_sentence[:300],
                "evidence_page": matched_page,
                "evidence_section": section_name,
                "review_notes": f"Positive clause match found on Page {matched_page} with {len(unique_found)} verified keyword(s)."
            }
        else:
            return {
                "status": "needs_human_review",
                "status_label": "Needs Human Review",
                "confidence": confidence,
                "matched_clause": rule.requirement_summary,
                "evidence_snippet": matched_sentence[:300],
                "evidence_page": matched_page,
                "evidence_section": section_name,
                "review_notes": "Partial match detected. Supervisor confirmation required to verify technical compliance."
            }

    def generate_document_checklist(
        self,
        db: Session,
        document: models.ComplianceDocument
    ) -> Dict[str, Any]:
        """
        Generate document-specific inspection checklist directly from extracted document content.
        Adapts requirements and labels dynamically to the document category and matched text.
        """
        category = document.document_category or "site_safety_plan"
        full_text = document.extracted_text or ""
        pages_dict = self.parse_document_pages(full_text, expected_pages=document.page_count or 1)

        # Define template requirements based on category
        if category in ["site_safety_plan", "safety_manual", "general"]:
            templates = [
                {
                    "code": "DOC-PPE-001",
                    "title": "Head Protection Requirement",
                    "requirement": "Safety helmet & industrial hard hat requirement is documented (conforming to IS 2925 / ANSI Z89).",
                    "keywords": ["helmet", "hard hat", "head protection", "is 2925", "ansi z89", "protective helmets", "headgear"]
                },
                {
                    "code": "DOC-VEST-002",
                    "title": "Safety Vest & High-Visibility PPE",
                    "requirement": "High-visibility reflective safety apparel and body protection mandated for all personnel.",
                    "keywords": ["vest", "safety vest", "reflective", "high-visibility", "hi-vis", "protective equipment", "ppe register"]
                },
                {
                    "code": "DOC-FALL-003",
                    "title": "Fall Protection & Harness Requirement",
                    "requirement": "Full body safety harness conforming to IS 3521 and 100% tie-off mandatory for work at height.",
                    "keywords": ["fall protection", "safety harness", "is 3521", "life line", "lanyard", "anchor point", "fall arrest", "6 feet", "work at height"]
                },
                {
                    "code": "DOC-SCAF-004",
                    "title": "Scaffolding & Guardrail Requirement",
                    "requirement": "Perimeter scaffolding rigidity, top rails, mid rails, and toe boards specified.",
                    "keywords": ["scaffolding", "scaffold", "guardrail", "toe board", "handrail", "gangway", "working platform"]
                },
                {
                    "code": "DOC-ELEC-005",
                    "title": "Temporary Electrical Protection & Earthing",
                    "requirement": "GFCI breakers and verified equipment earthing required for temporary power distribution.",
                    "keywords": ["gfci", "earthing", "grounding", "electrical", "distribution board", "breaker", "breaker protection"]
                },
                {
                    "code": "DOC-CRANE-006",
                    "title": "Crane & Hoist Inspection Certificate",
                    "requirement": "30-day periodic load-test, structural cable inspection, and operational clearance documented.",
                    "keywords": ["crane", "hoist", "lifting equipment", "load test", "cable", "rigging", "structural inspection"]
                },
                {
                    "code": "DOC-TRN-007",
                    "title": "Training, Induction & Supervisor Sign-Off",
                    "requirement": "Mandatory worker safety induction, task training certification, and supervisor authorization.",
                    "keywords": ["training", "induction", "supervisor", "sign-off", "hse officer", "authorized", "safety committee", "permit"]
                }
            ]
        elif category in ["equipment_cert", "inspection_log"]:
            templates = [
                {
                    "code": "EQP-ID-001",
                    "title": "Equipment Identity & Asset Tag",
                    "requirement": "Equipment identification, serial number, model designation, and manufacturer specification documented.",
                    "keywords": ["equipment", "serial", "asset id", "tag number", "model", "crane", "hoist", "scaffold", "plant"]
                },
                {
                    "code": "EQP-DATE-002",
                    "title": "Inspection Date & Calibration Frequency",
                    "requirement": "Date of physical inspection, test cycle, and periodic re-calibration frequency recorded.",
                    "keywords": ["inspection date", "inspected on", "date of issue", "frequency", "tested on", "calibration"]
                },
                {
                    "code": "EQP-DUE-003",
                    "title": "Next Inspection Due Date & Expiry",
                    "requirement": "Next mandatory re-inspection due date and certificate expiration clearly specified.",
                    "keywords": ["valid until", "expiry", "due date", "expiration", "valid thru", "next inspection"]
                },
                {
                    "code": "EQP-LOAD-004",
                    "title": "Load-Test Evidence & Safe Working Load (SWL)",
                    "requirement": "Safe Working Load (SWL) rating, structural load-testing records, and stress tolerance verified.",
                    "keywords": ["load test", "swl", "safe working load", "capacity", "tonnes", "proof load", "structural test"]
                },
                {
                    "code": "EQP-CERT-005",
                    "title": "Competent-Person Certificate & Authority",
                    "requirement": "Certification issued by certified competent person, inspection agency, or government labor authority.",
                    "keywords": ["competent person", "inspector", "certified by", "authority", "engineer", "dgfasli", "bis", "officer"]
                },
                {
                    "code": "EQP-ACT-006",
                    "title": "Corrective-Action Closure & Sign-Off",
                    "requirement": "Defect remediation log, maintenance sign-off, and operational authorization recorded.",
                    "keywords": ["corrective action", "clearance", "sign-off", "satisfactory", "passed", "operational", "approved", "authorized"]
                }
            ]
        elif category in ["training_cert"]:
            templates = [
                {
                    "code": "TRN-WRK-001",
                    "title": "Worker Identity & Reference",
                    "requirement": "Worker full name, employee reference, or badge identifier documented.",
                    "keywords": ["worker", "employee", "trainee", "badge", "id number", "worker-", "name", "candidate"]
                },
                {
                    "code": "TRN-TOP-002",
                    "title": "Training Topic & Module Curriculum",
                    "requirement": "Specific safety course curriculum (PPE usage, height safety, electrical hazard) identified.",
                    "keywords": ["topic", "module", "ppe", "safety induction", "fall protection", "hazard", "curriculum", "course"]
                },
                {
                    "code": "TRN-DATE-003",
                    "title": "Training Completion Date",
                    "requirement": "Date of training delivery and formal safety evaluation logged.",
                    "keywords": ["training date", "completed on", "issued on", "date", "attended", "conducted on"]
                },
                {
                    "code": "TRN-EXP-004",
                    "title": "Expiry & Refresher Due Date",
                    "requirement": "Training certification validity term and mandatory refresher timeline recorded.",
                    "keywords": ["valid until", "expiry", "renewal", "refresher due", "validity", "expires on"]
                },
                {
                    "code": "TRN-SIGN-005",
                    "title": "Trainer & Supervisor Sign-Off",
                    "requirement": "Certified HSE instructor signature, supervisor endorsement, and training department seal.",
                    "keywords": ["trainer", "instructor", "supervisor", "sign-off", "signature", "authorized", "hse lead"]
                }
            ]
        else: # Generic Fallback for Insurance policy / Permit to Work
            templates = [
                {
                    "code": "DOC-AUTH-001",
                    "title": "Issuing Authority & Document Identity",
                    "requirement": "Issuing agency, certificate/policy number, and organizational scope specified.",
                    "keywords": ["authority", "policy", "permit", "document no", "reference", "issued by"]
                },
                {
                    "code": "DOC-DATE-002",
                    "title": "Effective Date & Expiration Schedule",
                    "requirement": "Effective term, issue timestamp, and renewal cutoff documented.",
                    "keywords": ["valid until", "effective date", "expiry", "issue date", "due date"]
                },
                {
                    "code": "DOC-PPE-003",
                    "title": "Safety & PPE Compliance Provisions",
                    "requirement": "Mandatory PPE and risk control stipulations verified.",
                    "keywords": ["ppe", "helmet", "harness", "safety", "protection", "protective"]
                },
                {
                    "code": "DOC-SIGN-004",
                    "title": "Authorized Signatory & Seal",
                    "requirement": "Authorized technical reviewer or committee sign-off recorded.",
                    "keywords": ["sign-off", "signature", "authorized", "supervisor", "officer", "manager"]
                }
            ]

        checklist_items = []
        for t in templates:
            matched_page = None
            matched_snippet = None
            matched_section = None
            found_count_kw = 0
            
            if full_text and len(full_text.strip()) >= 20:
                for page_num, page_content in sorted(pages_dict.items()):
                    for kw in t["keywords"]:
                        if re.search(r'\b' + re.escape(kw) + r'\b', page_content, re.IGNORECASE):
                            found_count_kw += 1
                            if not matched_page:
                                matched_page = page_num
                                # Extract sentence
                                sentences = re.split(r'(?<=[.!?])\s+|\n{2,}', page_content)
                                for sent in sentences:
                                    if re.search(r'\b' + re.escape(kw) + r'\b', sent, re.IGNORECASE):
                                        matched_snippet = sent.strip().replace('\n', ' ')
                                        break
                                if not matched_snippet and sentences:
                                    matched_snippet = sentences[0].strip().replace('\n', ' ')
                                
                                # Detect section header
                                sec_match = re.search(r'(?:SECTION|CHAPTER|CLAUSE|PART|ARTICLE)\s+[0-9A-Za-z.:-]+[^\n]{0,50}', page_content, re.IGNORECASE)
                                if sec_match:
                                    matched_section = sec_match.group(0).strip()
                                else:
                                    matched_section = f"{t['title']} Section"

            if matched_snippet:
                # Check for negative terms
                lower_snip = matched_snippet.lower()
                neg_terms = ["not provided", "expired", "failed inspection", "prohibited", "missing", "unsafe"]
                has_neg = any(nt in lower_snip for nt in neg_terms)
                
                status = "NEEDS_REVIEW" if has_neg else "FOUND"
                confidence = round(min(0.98, max(0.85, 0.85 + (found_count_kw * 0.03))), 2)
                snippet_text = matched_snippet[:300]
            else:
                status = "MISSING"
                confidence = 0.50
                matched_page = None
                matched_section = None
                snippet_text = None

            checklist_items.append({
                "checklist_id": f"CHK-DOC-{document.doc_id[:8]}-{t['code']}",
                "document_id": document.doc_id,
                "code": t["code"],
                "title": t["title"],
                "requirement": t["requirement"],
                "source": document.filename,
                "source_table": "compliance_documents",
                "linked_record_id": document.doc_id,
                "status": status,
                "evidence_page": matched_page,
                "evidence_section": matched_section,
                "evidence_snippet": snippet_text,
                "confidence": confidence,
                "review_required": True
            })

        found_count = sum(1 for item in checklist_items if item["status"] == "FOUND")
        missing_count = sum(1 for item in checklist_items if item["status"] == "MISSING")
        needs_review_count = sum(1 for item in checklist_items if item["status"] == "NEEDS_REVIEW")
        completeness = round((found_count / max(1, len(checklist_items))) * 100.0, 1)

        return {
            "document_id": document.doc_id,
            "filename": document.filename,
            "category": category,
            "checklist_items": checklist_items,
            "found_count": found_count,
            "missing_count": missing_count,
            "needs_review_count": needs_review_count,
            "completeness_percentage": completeness
        }

    def compute_schedule_status(self, due_date: datetime.datetime) -> Dict[str, Any]:
        """Compute status (UPCOMING, DUE_SOON, OVERDUE) and days remaining."""
        now = datetime.datetime.utcnow()
        days_diff = (due_date - now).days
        
        if days_diff < 0:
            status = "OVERDUE"
        elif 0 <= days_diff <= 7:
            status = "DUE_SOON"
        else:
            status = "UPCOMING"
            
        return {
            "status": status,
            "days_until_due": days_diff
        }


compliance_engine = ComplianceEngineService()

