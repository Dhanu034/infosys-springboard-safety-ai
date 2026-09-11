import json
import re
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app import models

class ComplianceEngineService:
    DISCLAIMER_TEXT = "Reference Rule Match — Human Verification Required. Not a legal or regulatory certification."

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

        # Parse document into pages if structured
        pages_dict = {}
        if full_text:
            page_matches = list(re.finditer(r'(?:---|\[)\s*(?:PAGE|Page)\s*([0-9]+)\s*(?:---|\])', full_text))
            if page_matches:
                for idx, match in enumerate(page_matches):
                    page_num = int(match.group(1))
                    start_pos = match.end()
                    end_pos = page_matches[idx + 1].start() if idx + 1 < len(page_matches) else len(full_text)
                    pages_dict[page_num] = full_text[start_pos:end_pos].strip()
            else:
                pages_dict[1] = full_text


        for rule in rules:
            keywords: List[str] = []
            if rule.mandatory_keywords:
                try:
                    keywords = json.loads(rule.mandatory_keywords)
                except Exception:
                    keywords = [k.strip() for k in rule.mandatory_keywords.split(",") if k.strip()]

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

        for page_num, page_content in pages_dict.items():
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', page_content, re.IGNORECASE):
                    found_keywords.append(kw)
                    matched_page = page_num
                    # Extract snippet sentence
                    sentences = re.split(r'(?<=[.!?])\s+', page_content)
                    for sent in sentences:
                        if re.search(r'\b' + re.escape(kw) + r'\b', sent, re.IGNORECASE):
                            matched_sentence = sent.strip()
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

        # Detect section header
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
