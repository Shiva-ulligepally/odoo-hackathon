"""
EcoSphere AI - ESG Confidence Engine (Module 3 / Step 7)
Calculates a data-driven confidence score from multiple evidence signals.
Stores results in the ConfidenceScore MongoDB collection.
Never generates random values — every number is derived from evidence.
"""
import logging
import json
import re
from datetime import datetime, timezone
from typing import Optional

from config import get_settings
from ai.prompts.prompt_templates import CONFIDENCE_PROMPT
from ai.utils.fallbacks import fallback_confidence

logger = logging.getLogger(__name__)
settings = get_settings()

_gemini_model = None


def _get_gemini():
    global _gemini_model
    if _gemini_model is None:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            _gemini_model = genai.GenerativeModel(settings.GEMINI_MODEL)
        except Exception as e:
            logger.error(f"Gemini init failed in confidence engine: {e}")
    return _gemini_model


def _clean_json(text: str) -> dict:
    cleaned = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r'\s*```$', '', cleaned, flags=re.MULTILINE)
    try:
        return json.loads(cleaned)
    except Exception:
        return {}


def _compute_freshness(uploaded_date: Optional[str]) -> float:
    """Compute freshness score — newer = higher score."""
    if not uploaded_date:
        return 0.5
    try:
        if isinstance(uploaded_date, str):
            dt = datetime.fromisoformat(uploaded_date.replace("Z", "+00:00"))
        else:
            dt = uploaded_date
        now = datetime.now(timezone.utc)
        age_days = (now - dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else now - dt).days
        if age_days <= 30:
            return 1.0
        elif age_days <= 90:
            return 0.8
        elif age_days <= 180:
            return 0.6
        elif age_days <= 365:
            return 0.4
        else:
            return 0.2
    except Exception:
        return 0.5


def _count_evidence(organization_id: str) -> int:
    """Count supporting documents in the database."""
    try:
        from database import get_collection
        col = get_collection("uploadeddocuments")
        if col is None:
            return 1
        from bson import ObjectId
        count = col.count_documents({"organization": ObjectId(organization_id)})
        return max(count, 1)
    except Exception:
        return 1


def calculate_confidence(
    extracted_data: dict,
    validation_result: dict,
    organization_id: str,
    document_id: str,
    uploaded_date: Optional[str] = None
) -> dict:
    """
    Calculate comprehensive confidence score for an ESG data submission.
    Saves result to MongoDB ConfidenceScore collection.
    Returns full confidence report with explainability.
    """
    logger.info("Running Confidence Engine...")

    # Pre-compute deterministic signals
    age_days = 0
    freshness = _compute_freshness(uploaded_date)
    if uploaded_date:
        try:
            dt = datetime.fromisoformat(str(uploaded_date).replace("Z", "+00:00"))
            age_days = (datetime.now(timezone.utc) - dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else datetime.now(timezone.utc) - dt).days
        except Exception:
            age_days = 0

    evidence_count = _count_evidence(organization_id)
    has_historical = evidence_count > 1

    model = _get_gemini()
    if model is None or not settings.GEMINI_API_KEY:
        result = fallback_confidence(validation_result, extracted_data)
    else:
        try:
            prompt = CONFIDENCE_PROMPT.format(
                extracted_data=json.dumps(extracted_data, default=str, indent=2)[:3000],
                validation_result=json.dumps(validation_result, default=str, indent=2)[:2000],
                document_age_days=age_days,
                has_historical_data=has_historical,
                evidence_count=evidence_count
            )
            response = model.generate_content(prompt)
            result = _clean_json(response.text)
            if not result:
                raise ValueError("Empty confidence result")
            logger.info(f"Confidence score: {result.get('confidence_score')}")
        except Exception as e:
            logger.error(f"Gemini confidence failed: {e}")
            result = fallback_confidence(validation_result, extracted_data)

    # Override freshness with computed value
    result["freshness_score"] = freshness
    result["evidence_count"] = evidence_count
    result.setdefault("timestamp", datetime.utcnow().isoformat())

    # Persist to MongoDB
    try:
        from database import save_confidence_score
        factors = result.get("factors", [])
        save_confidence_score(
            organization_id=organization_id,
            target_id=document_id,
            target_model="UploadedDocument",
            score=result.get("confidence_score", 50),
            factors=factors,
            reasoning=result.get("reason", "")
        )
        logger.info("Confidence score saved to MongoDB")
    except Exception as e:
        logger.error(f"Failed to persist confidence score: {e}")

    return result
