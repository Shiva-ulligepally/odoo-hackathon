"""
EcoSphere AI - Executive Decision Agent (Module 11 / Step 12)
Synthesizes all agent outputs into a board-ready Executive Summary with:
ESG score projection, top risks, opportunities, department comparison,
priority actions, monthly outlook, next best actions, and ROI.
"""
import logging
import json
import re
from datetime import datetime

from config import get_settings
from ai.prompts.prompt_templates import EXECUTIVE_SUMMARY_PROMPT
from ai.utils.fallbacks import fallback_executive_summary

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
            logger.error(f"Gemini init failed in executive agent: {e}")
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


def _build_carbon_summary(carbon_analysis: dict) -> str:
    if not carbon_analysis:
        return "No carbon data available"
    emissions = carbon_analysis.get("current_emissions", {})
    target = carbon_analysis.get("vs_target", {})
    return (
        f"Total: {emissions.get('total', 0)} MT CO2e | "
        f"Scope1: {emissions.get('scope1', {}).get('value', 0)} | "
        f"Scope2: {emissions.get('scope2', {}).get('value', 0)} | "
        f"Scope3: {emissions.get('scope3', {}).get('value', 0)} | "
        f"On track: {target.get('on_track', False)}"
    )


def _get_top_recs(recommendations: dict) -> str:
    recs = recommendations.get("recommendations", []) if recommendations else []
    top = recs[:3]
    return json.dumps([{"title": r.get("title"), "priority": r.get("priority"), "co2_reduction": r.get("estimated_carbon_reduction")} for r in top])


def generate_executive_summary(
    organization_id: str,
    carbon_analysis: dict = None,
    governance_findings: dict = None,
    csr_result: dict = None,
    confidence_result: dict = None,
    recommendations: dict = None,
    validation_result: dict = None
) -> dict:
    """
    Main executive decision generation entry point.
    Aggregates all agent outputs into a comprehensive board report.
    """
    logger.info(f"Running Executive Decision Agent for org: {organization_id}")

    org = _fetch_org(organization_id)
    org_name = org.get("name", "Organization")
    industry = org.get("industry", "Unknown")
    financial_year = org.get("financialYear", "FY2026")

    confidence_score = confidence_result.get("confidence_score", 50) if confidence_result else 50
    governance_score = governance_findings.get("compliance_score", 50) if governance_findings else 50
    csr_score = csr_result.get("csr_score", 0) if csr_result else 0
    carbon_summary = _build_carbon_summary(carbon_analysis)
    top_recs = _get_top_recs(recommendations)
    val_issues = f"Errors: {len(validation_result.get('errors', []))} | Warnings: {len(validation_result.get('warnings', []))}" if validation_result else "No validation data"

    model = _get_gemini()
    if model is None or not settings.GEMINI_API_KEY:
        return fallback_executive_summary(org_name, confidence_score, carbon_analysis or {})

    try:
        prompt = EXECUTIVE_SUMMARY_PROMPT.format(
            org_name=org_name,
            industry=industry,
            financial_year=financial_year,
            carbon_summary=carbon_summary,
            governance_score=governance_score,
            csr_score=csr_score,
            confidence_score=confidence_score,
            top_recommendations=top_recs,
            validation_issues=val_issues,
            processing_date=datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
        )
        response = model.generate_content(prompt)
        result = _clean_json(response.text)

        if not result:
            raise ValueError("Empty executive summary result")

        result.setdefault("generated_at", datetime.utcnow().isoformat())
        logger.info(f"Executive Summary generated. ESG score estimate: {result.get('esg_score_estimate', {}).get('overall', 'N/A')}")
        return result

    except Exception as e:
        logger.error(f"Gemini executive summary failed: {e}")
        return fallback_executive_summary(org_name, confidence_score, carbon_analysis or {})
