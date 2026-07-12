"""
EcoSphere AI - Recommendation Engine (Module 10 / Step 11)
Generates structured, explainable ESG recommendations with:
title, description, business impact, environmental impact,
ESG score improvement, priority, cost saving, carbon reduction,
evidence, and confidence. Persists to AIRecommendation collection.
"""
import logging
import json
import re
from datetime import datetime

from config import get_settings
from ai.prompts.prompt_templates import RECOMMENDATION_PROMPT
from ai.utils.fallbacks import fallback_recommendations

logger = logging.getLogger(__name__)
settings = get_settings()

_gemini_model = None


def _get_gemini():
    global _gemini_model
    if _gemini_model is None:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            _gemini_model = genai.GenerativeModel(settings.GEMINI_PRO_MODEL)
        except Exception as e:
            logger.error(f"Gemini init failed in recommendation engine: {e}")
    return _gemini_model


def _clean_json(text: str) -> dict:
    cleaned = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r'\s*```$', '', cleaned, flags=re.MULTILINE)
    try:
        return json.loads(cleaned)
    except Exception:
        return {}


def _fetch_org(organization_id: str) -> dict:
    try:
        from database import get_collection
        from bson import ObjectId
        col = get_collection("organizations")
        return col.find_one({"_id": ObjectId(organization_id)}) or {} if col else {}
    except Exception:
        return {}


def _persist_recommendations(organization_id: str, recommendations: list):
    """Save each recommendation to the AIRecommendation MongoDB collection."""
    try:
        from database import save_ai_recommendation
        for rec in recommendations:
            rec_type = rec.get("recommendation_type", "carbon")
            save_ai_recommendation(
                organization_id=organization_id,
                rec_type=rec_type,
                title=rec.get("title", "ESG Recommendation"),
                description=rec.get("description", ""),
                co2_savings=rec.get("estimated_carbon_reduction", 0),
                financial_savings=rec.get("estimated_cost_saving", 0),
                confidence=rec.get("confidence", 0.7) * 100,
                priority=rec.get("priority", "medium"),
                department=rec.get("affected_department"),
                evidence=rec.get("evidence_used")
            )
        logger.info(f"Persisted {len(recommendations)} recommendations to MongoDB")
    except Exception as e:
        logger.error(f"Failed to persist recommendations: {e}")


def generate_recommendations(
    organization_id: str,
    carbon_analysis: dict = None,
    governance_findings: dict = None,
    csr_result: dict = None,
    validation_result: dict = None,
    confidence_score: float = 50.0
) -> dict:
    """
    Main recommendation generation entry point.
    Uses all agent outputs as context for targeted, evidence-based recommendations.
    Persists results to MongoDB.
    """
    logger.info(f"Running Recommendation Engine for org: {organization_id}")

    org = _fetch_org(organization_id)
    org_name = org.get("name", "Organization")
    industry = org.get("industry", "Unknown")

    # Summarize inputs for the prompt
    carbon_summary = json.dumps({
        "total_emissions": carbon_analysis.get("current_emissions", {}).get("total", 0) if carbon_analysis else 0,
        "on_track": carbon_analysis.get("vs_target", {}).get("on_track", False) if carbon_analysis else False,
        "top_strategies": [s.get("strategy") for s in (carbon_analysis.get("reduction_strategies", [])[:3] if carbon_analysis else [])],
    }, default=str)

    gov_summary = json.dumps({
        "compliance_score": governance_findings.get("compliance_score", 0) if governance_findings else 0,
        "risk_level": governance_findings.get("risk_level", "unknown") if governance_findings else "unknown",
        "missing_policies": len(governance_findings.get("missing_policies", [])) if governance_findings else 0,
    }, default=str)

    csr_score = csr_result.get("csr_score", 0) if csr_result else 0

    val_issues = json.dumps({
        "is_valid": validation_result.get("is_valid", True) if validation_result else True,
        "errors": len(validation_result.get("errors", [])) if validation_result else 0,
        "warnings": len(validation_result.get("warnings", [])) if validation_result else 0,
    }, default=str)

    model = _get_gemini()
    if model is None or not settings.GEMINI_API_KEY:
        result = fallback_recommendations(org_name, carbon_analysis, confidence_score)
        _persist_recommendations(organization_id, result.get("recommendations", []))
        return result

    try:
        prompt = RECOMMENDATION_PROMPT.format(
            org_name=org_name,
            industry=industry,
            carbon_analysis=carbon_summary,
            governance_findings=gov_summary,
            csr_score=csr_score,
            validation_issues=val_issues,
            confidence_score=confidence_score
        )
        response = model.generate_content(prompt)
        result = _clean_json(response.text)

        if not result or "recommendations" not in result:
            raise ValueError("Invalid recommendation result structure")

        # Persist to MongoDB
        _persist_recommendations(organization_id, result.get("recommendations", []))

        logger.info(f"Generated {len(result.get('recommendations', []))} recommendations")
        return result

    except Exception as e:
        logger.error(f"Gemini recommendation failed: {e}")
        result = fallback_recommendations(org_name, carbon_analysis, confidence_score)
        _persist_recommendations(organization_id, result.get("recommendations", []))
        return result
