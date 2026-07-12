"""
EcoSphere AI - OCR & Document Processing Engine (Module 1)
Extracts structured ESG data from PDFs, images, and text documents
using Gemini 1.5 Flash multimodal capabilities with pdfplumber fallback.
"""
import logging
import json
import re
import io
import base64
from pathlib import Path
from typing import Optional

import requests

from config import get_settings
from ai.prompts.prompt_templates import OCR_EXTRACTION_PROMPT
from ai.utils.fallbacks import fallback_extraction

logger = logging.getLogger(__name__)
settings = get_settings()

# Lazy-loaded Gemini client
_gemini_model = None


def _get_gemini():
    global _gemini_model
    if _gemini_model is None:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            _gemini_model = genai.GenerativeModel(settings.GEMINI_MODEL)
            logger.info(f"Gemini model loaded: {settings.GEMINI_MODEL}")
        except Exception as e:
            logger.error(f"Failed to load Gemini model: {e}")
    return _gemini_model


def _extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    """Extract raw text from PDF bytes using pdfplumber."""
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
        return "\n".join(text_parts)
    except Exception as e:
        logger.warning(f"pdfplumber extraction failed: {e}")
        return ""


def _extract_text_from_url(file_url: str) -> tuple[bytes, str]:
    """Download file from URL and return bytes + detected type."""
    try:
        response = requests.get(file_url, timeout=30)
        response.raise_for_status()
        content_type = response.headers.get("content-type", "application/octet-stream")
        return response.content, content_type
    except Exception as e:
        logger.warning(f"Failed to download file from {file_url}: {e}")
        return b"", "unknown"


def _detect_doc_type(file_name: str, content_type: str, text_preview: str) -> str:
    """Heuristically detect document type."""
    name_lower = file_name.lower()
    text_lower = text_preview.lower()

    if "electricity" in name_lower or "kwh" in text_lower:
        return "electricity_bill"
    if "water" in name_lower or "litre" in text_lower:
        return "water_bill"
    if "fuel" in name_lower or "diesel" in text_lower or "petrol" in text_lower:
        return "fuel_bill"
    if "policy" in name_lower or "governance" in text_lower:
        return "policy"
    if "csr" in name_lower or "certificate" in name_lower or "social responsibility" in text_lower:
        return "csr_certificate"
    if "esg" in name_lower or "sustainability" in name_lower or "report" in name_lower:
        return "esg_report"
    if "invoice" in name_lower:
        return "invoice"
    if "image" in content_type or any(ext in name_lower for ext in [".jpg", ".jpeg", ".png", ".webp"]):
        return "image_document"
    return "unknown"


def _clean_json_response(response_text: str) -> dict:
    """Parse JSON from Gemini response, stripping markdown fences if present."""
    cleaned = response_text.strip()
    # Remove ```json ... ``` fences
    cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r'\s*```$', '', cleaned, flags=re.MULTILINE)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}. Raw: {cleaned[:300]}")
        return {}


def process_document(file_url: str, file_name: str, file_type: str) -> dict:
    """
    Main entry point: download, OCR-extract, and return structured ESG data.
    Falls back to rule-based extraction if Gemini is unavailable.
    """
    logger.info(f"Processing document: {file_name} ({file_type})")

    # 1. Download file
    file_bytes, content_type = _extract_text_from_url(file_url)
    if not file_bytes:
        logger.warning(f"Could not download {file_url}, using empty fallback")
        return fallback_extraction("", file_type)

    # 2. Extract raw text
    raw_text = ""
    is_image = "image" in content_type or any(
        file_name.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]
    )

    if not is_image:
        raw_text = _extract_text_from_pdf_bytes(file_bytes)

    doc_type = _detect_doc_type(file_name, content_type, raw_text[:500])

    # 3. Try Gemini extraction
    model = _get_gemini()
    if model is None:
        logger.warning("Gemini unavailable, using rule-based fallback")
        return fallback_extraction(raw_text, doc_type)

    try:
        if is_image:
            # Multimodal image processing
            import google.generativeai as genai
            image_part = {"mime_type": content_type, "data": base64.b64encode(file_bytes).decode()}
            prompt = OCR_EXTRACTION_PROMPT.format(
                document_text="[Image document — analyze visually]",
                doc_type=doc_type
            )
            response = model.generate_content([prompt, image_part])
        else:
            # Text-based document
            if not raw_text.strip():
                raw_text = f"[Binary document: {file_name}. Limited text extractable.]"
            prompt = OCR_EXTRACTION_PROMPT.format(
                document_text=raw_text[:8000],
                doc_type=doc_type
            )
            response = model.generate_content(prompt)

        extracted = _clean_json_response(response.text)
        if not extracted:
            raise ValueError("Empty extraction result from Gemini")

        # Ensure required keys exist
        extracted.setdefault("document_type", doc_type)
        extracted.setdefault("extraction_confidence", 0.8)
        extracted.setdefault("raw_summary", raw_text[:300])
        extracted["_raw_text"] = raw_text  # Pass forward for embedding

        logger.info(f"Gemini extraction successful. Confidence: {extracted.get('extraction_confidence')}")
        return extracted

    except Exception as e:
        logger.error(f"Gemini extraction failed: {e}")
        return fallback_extraction(raw_text, doc_type)
