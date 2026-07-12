"""
EcoSphere AI - CSR Verification Agent (Module 6 / Step 10)
Verifies CSR activity certificates, detects duplicates, calculates
CSR scores and employee points using Gemini AI and rule-based checks.
"""
import logging
import json
import re
from datetime import datetime
from typing import Optional

from config import get_settings
from ai.prompts.prompt_templates import CSR_VERIFICATION_PROMPT

logger = logging.getLogger(__name__)
settings = get_settings()

_gemini_model = None

# CSR Point Allocation Rules
CSR_POINT_RULES = {
    "tree_planting": 10,
    "volunteer": 5,
    "donation": 8,
    "awareness": 4,
    "education": 7,
    "community": 6,
    "recycling": 5,
    "clean_up": 6,
    "default": 5
}


def _get_gemini():
    global _gemini_model
    if _gemini_model is None:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            _gemini_model = genai.GenerativeModel(settings.GEMINI_MODEL)
        except Exception as e:
            logger.error(f"Gemini init failed in CSR agent: {e}")
    return _gemini_model


def _clean_json(text: str) -> dict:
    cleaned = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r'\s*```$', '', cleaned, flags=re.MULTILINE)
    try:
        return json.loads(cleaned)
    except Exception:
        return {}


def _fetch_csr_data(organization_id: str) -> tuple:
    """Fetch CSR activities and org info from MongoDB."""
    try:
        from database import get_collection
        from bson import ObjectId
        org_oid = ObjectId(organization_id)

        org_col = get_collection("organizations")
        org = org_col.find_one({"_id": org_oid}) if org_col else {}

        csr_col = get_collection("csractivities")
        activities = list(csr_col.find({"organization": org_oid})) if csr_col else []

        return org or {}, activities
    except Exception as e:
        logger.error(f"Failed to fetch CSR data: {e}")
        return {}, []


def _compute_employee_points(activities: list) -> list:
    """Rule-based CSR point allocation per activity."""
    points = []
    for act in activities:
        title_lower = act.get("title", "").lower()
        base_points = CSR_POINT_RULES["default"]
        for keyword, pts in CSR_POINT_RULES.items():
            if keyword != "default" and keyword in title_lower:
                base_points = pts
                break
        participants = act.get("participants", [])
        n_participants = len(participants) if isinstance(participants, list) else 0
        if n_participants > 0:
            for emp_id in participants:
                points.append({
                    "employee_id": str(emp_id),
                    "points": base_points,
                    "reason": f"Participated in: {act.get('title', 'CSR Activity')}"
                })
    return points


def _detect_duplicates(activities: list) -> list:
    """Simple duplicate detection based on title similarity."""
    seen = {}
    duplicates = []
    for act in activities:
        title = act.get("title", "").lower().strip()
        date = str(act.get("date", ""))
        key = f"{title}_{date}"
        if key in seen:
            duplicates.append(f"Possible duplicate: '{act.get('title')}' on {date}")
        seen[key] = True
    return duplicates


def _serialize_activities(activities: list) -> list:
    return [{
        "title": a.get("title", ""),
        "description": a.get("description", "")[:200],
        "date": str(a.get("date", "")),
        "budget": a.get("budget", 0),
        "status": a.get("status", ""),
        "participants_count": len(a.get("participants", []))
    } for a in activities]


def verify_csr(
    organization_id: str,
    document_text: str = "",
    extracted_data: dict = None
) -> dict:
    """
    Main CSR verification entry point.
    Analyzes CSR activities and certificate data.
    Returns CSR score, employee points, and verification findings.
    """
    logger.info(f"Running CSR Verification Agent for org: {organization_id}")

    org, activities = _fetch_csr_data(organization_id)
    org_name = org.get("name", "Organization")

    # Deterministic checks
    duplicate_flags = _detect_duplicates(activities)
    employee_points = _compute_employee_points(activities)
    total_budget = sum(a.get("budget", 0) for a in activities)
    total_participants = sum(len(a.get("participants", [])) for a in activities)
    verified_count = sum(1 for a in activities if a.get("status") == "Completed")
    base_score = (verified_count / max(len(activities), 1)) * 100 if activities else 0

    # Certificate context from extracted data
    cert_text = document_text or (extracted_data.get("raw_summary", "") if extracted_data else "")
    is_csr_doc = bool(extracted_data and extracted_data.get("document_type") == "csr_certificate")

    model = _get_gemini()
    if model is None or not settings.GEMINI_API_KEY:
        return _build_fallback_csr(org_name, activities, base_score, employee_points,
                                   duplicate_flags, total_budget, total_participants, cert_text)

    try:
        prompt = CSR_VERIFICATION_PROMPT.format(
            org_name=org_name,
            csr_activities=json.dumps(_serialize_activities(activities), indent=2)[:3000],
            document_text=cert_text[:2000] if cert_text else "No certificate document provided"
        )
        response = model.generate_content(prompt)
        result = _clean_json(response.text)

        if not result:
            raise ValueError("Empty CSR verification result")

        # Supplement with deterministic results
        result.setdefault("employee_points_awarded", employee_points)
        result.setdefault("duplicate_flags", duplicate_flags)
        result.setdefault("total_budget_utilized", total_budget)
        result.setdefault("total_participants", total_participants)

        logger.info(f"CSR verification complete. Score: {result.get('csr_score')}")
        return result

    except Exception as e:
        logger.error(f"Gemini CSR verification failed: {e}")
        return _build_fallback_csr(org_name, activities, base_score, employee_points,
                                   duplicate_flags, total_budget, total_participants, cert_text)


def _build_fallback_csr(org_name, activities, base_score, employee_points,
                         duplicate_flags, total_budget, total_participants, cert_text) -> dict:
    """Construct rule-based CSR report."""
    return {
        "csr_score": round(base_score, 1),
        "total_activities": len(activities),
        "verified_activities": sum(1 for a in activities if a.get("status") == "Completed"),
        "total_budget_utilized": total_budget,
        "total_participants": total_participants,
        "activity_breakdown": [
            {
                "title": a.get("title", ""),
                "status": "verified" if a.get("status") == "Completed" else "pending",
                "employee_points": 5,
                "verification_reason": "Completed activities are auto-verified",
                "duplicate_detected": False
            }
            for a in activities[:10]
        ],
        "certificate_analysis": {
            "is_valid": bool(cert_text),
            "issuer": None,
            "issue_date": None,
            "activity_type": None,
            "participants_mentioned": None,
            "authenticity_score": 0.5 if cert_text else 0.0
        },
        "employee_points_awarded": employee_points[:20],
        "duplicate_flags": duplicate_flags,
        "recommendations": [
            "Complete all planned CSR activities to raise CSR score",
            "Upload activity certificates for AI-verified authenticity scoring",
            "Increase employee participation to maximize CSR points"
        ],
        "confidence": 0.5,
        "reason": "Rule-based CSR verification. Gemini AI unavailable. Based on MongoDB activity statuses."
    }
