"""
EcoSphere AI - Data Validation Agent (Module 2 / Step 3)
Validates extracted ESG data: units, duplicates, missing fields, outliers,
date formats, negative values, and conflicting records.
"""
import logging
import json
import re
from datetime import datetime
from typing import Optional

from config import get_settings
from ai.prompts.prompt_templates import VALIDATION_PROMPT
from ai.utils.fallbacks import fallback_validation

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
            logger.error(f"Gemini init failed in validator: {e}")
    return _gemini_model


def _clean_json(text: str) -> dict:
    cleaned = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r'\s*```$', '', cleaned, flags=re.MULTILINE)
    try:
        return json.loads(cleaned)
    except Exception:
        return {}


def _get_historical_context(organization_id: str, doc_type: str) -> str:
    """Fetch recent similar documents from MongoDB for outlier/duplicate detection."""
    try:
        from database import get_collection
        col = get_collection("uploadeddocuments")
        if col is None:
            return "No historical records available."
        recent = list(col.find(
            {"organization": {"$exists": True}},
            {"name": 1, "fileType": 1, "uploadedAt": 1}
        ).sort("uploadedAt", -1).limit(5))
        if not recent:
            return "No previous uploads found for this organization."
        summary = [f"- {r.get('name', 'unknown')} ({r.get('fileType', 'unknown')}) uploaded on {r.get('uploadedAt', 'unknown')}" for r in recent]
        return "\n".join(summary)
    except Exception as e:
        logger.warning(f"Could not fetch historical context: {e}")
        return "Historical context unavailable."


def _rule_based_checks(data: dict) -> dict:
    """Fast deterministic pre-checks before sending to Gemini."""
    issues = {"errors": [], "warnings": [], "missing_fields": []}

    # Negative value check
    consumption_val = data.get("consumption", {}).get("value")
    if consumption_val is not None and consumption_val < 0:
        issues["errors"].append({"field": "consumption.value", "issue": "Negative consumption value detected", "severity": "critical"})

    amount_val = data.get("amount", {}).get("value")
    if amount_val is not None and amount_val < 0:
        issues["errors"].append({"field": "amount.value", "issue": "Negative amount value detected", "severity": "high"})

    co2e = data.get("co2e_estimate")
    if co2e is not None and co2e < 0:
        issues["errors"].append({"field": "co2e_estimate", "issue": "Negative CO2e estimate", "severity": "critical"})

    # Outlier detection (simple threshold)
    if consumption_val and consumption_val > 1_000_000:
        issues["warnings"].append({"field": "consumption.value", "issue": f"Unusually high consumption: {consumption_val}", "recommendation": "Verify meter reading"})

    # Date validation
    for date_field in ["billing_period.start", "billing_period.end", "effective_date", "expiry_date"]:
        keys = date_field.split(".")
        val = data
        for k in keys:
            val = val.get(k) if isinstance(val, dict) else None
        if val and val != "null":
            try:
                datetime.strptime(str(val), "%Y-%m-%d")
            except ValueError:
                issues["warnings"].append({"field": date_field, "issue": f"Invalid date format: {val}", "recommendation": "Use YYYY-MM-DD"})

    # Missing required fields
    if not data.get("document_type") or data.get("document_type") == "unknown":
        issues["missing_fields"].append("document_type")
    if not data.get("billing_period", {}).get("start"):
        issues["missing_fields"].append("billing_period.start")

    return issues


def validate_extracted_data(extracted_data: dict, organization_id: str = None) -> dict:
    """
    Main validation entry point.
    Combines rule-based checks with Gemini AI validation.
    Returns a full validation report with explainability.
    """
    logger.info("Running Data Validation Agent...")

    # Run deterministic checks first
    rule_issues = _rule_based_checks(extracted_data)

    # If critical errors detected in rules, skip Gemini
    has_critical = any(e.get("severity") == "critical" for e in rule_issues["errors"])

    # Fetch historical context
    doc_type = extracted_data.get("document_type", "unknown")
    historical = _get_historical_context(organization_id, doc_type)

    model = _get_gemini()
    if model is None or not settings.GEMINI_API_KEY:
        result = fallback_validation(extracted_data)
        # Merge rule-based findings
        result["errors"].extend(rule_issues["errors"])
        result["warnings"].extend(rule_issues["warnings"])
        result["missing_fields"].extend(rule_issues["missing_fields"])
        return result

    try:
        prompt = VALIDATION_PROMPT.format(
            extracted_data=json.dumps(extracted_data, default=str, indent=2)[:4000],
            historical_context=historical
        )
        response = model.generate_content(prompt)
        result = _clean_json(response.text)

        if not result:
            raise ValueError("Empty validation result from Gemini")

        # Merge deterministic checks with Gemini result
        result.setdefault("errors", [])
        result.setdefault("warnings", [])
        result.setdefault("missing_fields", [])
        result["errors"].extend(rule_issues["errors"])
        result["warnings"].extend(rule_issues["warnings"])
        for mf in rule_issues["missing_fields"]:
            if mf not in result["missing_fields"]:
                result["missing_fields"].append(mf)

        logger.info(f"Validation complete. Valid: {result.get('is_valid')}, Score: {result.get('validation_score')}")
        return result

    except Exception as e:
        logger.error(f"Gemini validation failed: {e}")
        result = fallback_validation(extracted_data)
        result["errors"].extend(rule_issues["errors"])
        result["warnings"].extend(rule_issues["warnings"])
        return result
