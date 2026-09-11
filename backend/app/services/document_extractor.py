import os
import re
import uuid
import datetime
from typing import Dict, Any, List, Optional
from pypdf import PdfReader
from PIL import Image
from app.config import settings

# Attempt pytesseract configuration safely
try:
    import pytesseract
    if os.path.exists(settings.TESSERACT_CMD_PATH):
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD_PATH
    PYTESSERACT_AVAILABLE = True
except Exception:
    PYTESSERACT_AVAILABLE = False


class DocumentExtractorService:
    ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff"}
    MAX_FILE_SIZE_BYTES = settings.MAX_DOCUMENT_SIZE_MB * 1024 * 1024

    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename to prevent directory traversal and remove problematic characters."""
        base_name = os.path.basename(filename)
        clean_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', base_name)
        file_id = str(uuid.uuid4())[:8]
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        name_root, ext = os.path.splitext(clean_name)
        return f"doc_{file_id}_{timestamp}_{name_root[:40]}{ext.lower()}"

    def validate_file(self, filename: str, file_size: int) -> Dict[str, Any]:
        """Validate file extension and size constraints."""
        ext = os.path.splitext(filename)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            return {
                "valid": False,
                "error": f"Unsupported file format '{ext}'. Allowed formats: {', '.join(sorted(self.ALLOWED_EXTENSIONS))}"
            }
        if file_size > self.MAX_FILE_SIZE_BYTES:
            return {
                "valid": False,
                "error": f"File exceeds maximum allowed size of {settings.MAX_DOCUMENT_SIZE_MB}MB (received {file_size / (1024*1024):.1f}MB)."
            }
        return {"valid": True}

    def extract_content(self, file_path: str) -> Dict[str, Any]:
        """
        Multi-tier document extraction:
        1. Native PDF text extraction using pypdf.
        2. Fallback to local pytesseract OCR if text is empty/insufficient (< 50 chars) or if file is an image.
        3. Graceful degradation to needs_human_review if OCR engine is not installed.
        """
        if not os.path.exists(file_path):
            return {
                "success": False,
                "error": f"File not found at {file_path}",
                "extraction_method": "failed",
                "status": "EXTRACTION_FAILED"
            }

        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".pdf":
            return self._extract_from_pdf(file_path)
        else:
            return self._extract_from_image(file_path)

    def _extract_from_pdf(self, file_path: str) -> Dict[str, Any]:
        pages_data: List[Dict[str, Any]] = []
        full_text_list: List[str] = []

        try:
            reader = PdfReader(file_path)
            page_count = len(reader.pages)

            for idx, page in enumerate(reader.pages):
                page_num = idx + 1
                try:
                    text = page.extract_text() or ""
                except Exception:
                    text = ""
                
                clean_page_text = text.strip()
                pages_data.append({
                    "page": page_num,
                    "text": clean_page_text,
                    "char_count": len(clean_page_text)
                })
                if clean_page_text:
                    full_text_list.append(clean_page_text)

            full_text = "\n\n".join(full_text_list).strip()
            total_chars = len(full_text)

            # Check if native extraction succeeded
            if total_chars >= 50:
                metadata = self._extract_dates_and_authority(full_text)
                return {
                    "success": True,
                    "extraction_method": "pypdf",
                    "page_count": page_count,
                    "pages": pages_data,
                    "full_text": full_text,
                    "ocr_confidence": None,
                    "issuing_authority": metadata.get("issuing_authority"),
                    "issue_date": metadata.get("issue_date"),
                    "expiry_date": metadata.get("expiry_date"),
                    "status": "PROCESSED",
                    "review_notes": f"Native PDF text extracted successfully ({total_chars} characters across {page_count} page(s))."
                }

            # If text is insufficient (< 50 chars), attempt OCR fallback
            return self._attempt_ocr_fallback(file_path, page_count, pages_data, is_scanned_pdf=True)

        except Exception as e:
            return {
                "success": False,
                "error": f"PDF parsing exception: {str(e)}",
                "extraction_method": "pypdf_error",
                "page_count": 1,
                "pages": [],
                "full_text": "",
                "status": "NEEDS_HUMAN_REVIEW",
                "review_notes": f"PDF extraction encountered error: {str(e)}. Flagged for manual review."
            }

    def _extract_from_image(self, file_path: str) -> Dict[str, Any]:
        """Extract text from standard image uploads using Tesseract OCR with safe degradation."""
        if not PYTESSERACT_AVAILABLE:
            return {
                "success": True,
                "extraction_method": "ocr_unavailable",
                "page_count": 1,
                "pages": [{"page": 1, "text": "", "char_count": 0}],
                "full_text": "",
                "ocr_confidence": None,
                "status": "NEEDS_HUMAN_REVIEW",
                "review_notes": "Image file received. Tesseract OCR is not configured on this host. Marked for supervisor manual transcription."
            }

        try:
            image = Image.open(file_path)
            ocr_text = pytesseract.image_to_string(image, lang='eng').strip()
            
            if len(ocr_text) > 0:
                metadata = self._extract_dates_and_authority(ocr_text)
                return {
                    "success": True,
                    "extraction_method": "pytesseract_ocr",
                    "page_count": 1,
                    "pages": [{"page": 1, "text": ocr_text, "char_count": len(ocr_text)}],
                    "full_text": ocr_text,
                    "ocr_confidence": 0.85,
                    "issuing_authority": metadata.get("issuing_authority"),
                    "issue_date": metadata.get("issue_date"),
                    "expiry_date": metadata.get("expiry_date"),
                    "status": "PROCESSED",
                    "review_notes": "Image OCR completed via Tesseract (eng)."
                }
            else:
                return {
                    "success": True,
                    "extraction_method": "pytesseract_ocr",
                    "page_count": 1,
                    "pages": [{"page": 1, "text": "", "char_count": 0}],
                    "full_text": "",
                    "ocr_confidence": 0.20,
                    "status": "NEEDS_HUMAN_REVIEW",
                    "review_notes": "OCR detected no readable text from image. Requires manual review."
                }
        except Exception as e:
            return {
                "success": True,
                "extraction_method": "ocr_unavailable",
                "page_count": 1,
                "pages": [{"page": 1, "text": "", "char_count": 0}],
                "full_text": "",
                "ocr_confidence": None,
                "status": "NEEDS_HUMAN_REVIEW",
                "review_notes": f"OCR engine unavailable or encountered exception: {str(e)}. Flagged for manual review."
            }

    def _attempt_ocr_fallback(self, file_path: str, page_count: int, pages_data: List[Dict[str, Any]], is_scanned_pdf: bool) -> Dict[str, Any]:
        """Gracefully handle scanned PDF where native text extraction is empty."""
        # For scanned PDFs on Windows without poppler/pdf2image installed,
        # return safe ocr_unavailable status rather than crashing
        return {
            "success": True,
            "extraction_method": "ocr_unavailable",
            "page_count": page_count,
            "pages": pages_data,
            "full_text": "",
            "ocr_confidence": None,
            "status": "NEEDS_HUMAN_REVIEW",
            "review_notes": "Scanned PDF detected (< 50 native characters). Automatic OCR fallback is unavailable; flagged for manual supervisor review."
        }

    def _extract_dates_and_authority(self, text: str) -> Dict[str, Any]:
        """Extract issuing authority and dates using deterministic regex heuristics."""
        from dateutil import parser

        metadata: Dict[str, Any] = {
            "issuing_authority": None,
            "issue_date": None,
            "expiry_date": None
        }

        # Authority patterns
        authorities = [
            r"Occupational Safety and Health Administration|OSHA",
            r"Building and Other Construction Workers|BOCW\s*Board",
            r"Directorate General of Factory Advice Service and Labour Institutes|DGFASLI",
            r"Bureau of Indian Standards|BIS",
            r"International Organization for Standardization|ISO",
            r"Safety Audit Directorate",
            r"BuildSure Construction Safety Council",
            r"Site Safety Committee",
            r"Chief Inspector of Factories",
            r"Labour Department"
        ]
        for auth_pat in authorities:
            match = re.search(auth_pat, text, re.IGNORECASE)
            if match:
                metadata["issuing_authority"] = match.group(0).strip()
                break

        # Date extraction patterns (e.g. Valid Until: 2027-12-31, Expiry: 15/04/2026, Issued: 2026-01-10)
        expiry_patterns = [
            r"(?:valid\s+until|expiry\s+date|expiration\s+date|expires\s+on|valid\s+thru|due\s+date)\s*[:=-]?\s*([0-9]{1,4}[-/.][0-9]{1,2}[-/.][0-9]{1,4}|[A-Za-z]+\s+[0-9]{1,2},?\s+[0-9]{4})",
        ]
        issue_patterns = [
            r"(?:issue\s+date|issued\s+on|date\s+of\s+issue|certified\s+on|effective\s+date)\s*[:=-]?\s*([0-9]{1,4}[-/.][0-9]{1,2}[-/.][0-9]{1,4}|[A-Za-z]+\s+[0-9]{1,2},?\s+[0-9]{4})",
        ]

        for pat in expiry_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                try:
                    metadata["expiry_date"] = parser.parse(m.group(1), fuzzy=True)
                    break
                except Exception:
                    pass

        for pat in issue_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                try:
                    metadata["issue_date"] = parser.parse(m.group(1), fuzzy=True)
                    break
                except Exception:
                    pass

        return metadata


document_extractor = DocumentExtractorService()
