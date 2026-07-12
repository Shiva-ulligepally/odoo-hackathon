"""
EcoSphere AI - Governance Agent (Module 5 / Step 9)
Reads ESG policies from MongoDB, detects compliance gaps, expired policies,
missing acknowledgements, and generates compliance risk reports.
"""
import logging
import json
import re
from datetime import datetime, timezone
from typing import List

from config import get_settings
from ai.prompts.prompt_templates import GOVERNANCE_PROMPT
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
            _gemini_model = genai.GenerativeModel(settings.GEMINI_MODEL)
        except Exception as e:
            logger.error(f"Gemini init failed in governance agent: {e}")
    return _gemini_model


def _clean_json(text: str) -> dict:
    cleaned = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r'\s*```$', '', cleaned, flags=re.MULTILINE)
    try:
        return json.loads(cleaned)
    except Exception:
        return {}


def _fetch_governance_data(organization_id: str) -> tuple:
    """Fetch policies, employees, and org data for governance analysis."""
    try:
        from database import get_collection
        from bson import ObjectId
        org_oid = ObjectId(organization_id)

        org_col = get_collection("organizations")
        org = org_col.find_one({"_id": org_oid}) if org_col else {}

        policy_col = get_collection("policies")
        policies = list(policy_col.find({"organization": org_oid})) if policy_col else []

        emp_col = get_collection("employees")
        total_employees = emp_col.count_documents({"organization": org_oid}) if emp_col else 0

        return org or {}, policies, total_employees
    except Exception as e:
        logger.error(f"Failed to fetch governance data: {e}")
        return {}, [], 0


def _serialize_policies(policies: list) -> list:
    """Convert policy docs to serializable format."""
    result = []
    for p in policies:
        clean = {
            "title": p.get("title", ""),
            "description": p.get("description", "")[:300],
            "status": p.get("status", "Draft"),
            "effectiveDate": str(p.get("effectiveDate", "")),
            "createdAt": str(p.get("createdAt", ""))
        }
        result.append(clean)
    return result


def _quick_expiry_check(policies: list) -> List[dict]:
    """Check for policies that are in Draft status (may be expired/inactive)."""
    expired = []
    now = datetime.now(timezone.utc)
    for p in policies:
        if p.get("status") == "Draft":
            expired.append({
                "title": p.get("title", "Unknown"),
                "expired_date": str(p.get("effectiveDate", "Unknown")),
                "risk": "Policy still in Draft status — not yet active"
            })
        if p.get("status") == "Archived":
            expired.append({
                "title": p.get("title", "Unknown"),
                "expired_date": str(p.get("createdAt", "Unknown")),
                "risk": "Policy archived — ensure replacement policy is active"
            })
    return expired


def analyze_governance(organization_id: str) -> dict:
    """
    Main governance analysis entry point.
    Detects expired policies, compliance risks, and missing policies.
    Returns comprehensive governance report with explainability.
    """
    logger.info(f"Running Governance Agent for org: {organization_id}")

    org, policies, total_employees = _fetch_governance_data(organization_id)

    # Quick deterministic checks
    expired_policies = _quick_expiry_check(policies)

    # Determine missing policy types
    policy_titles_lower = [p.get("title", "").lower() for p in policies]
    required_policies = ["environmental", "data privacy", "health and safety", "anti-corruption", "carbon", "csr"]
    missing_types = [pt for pt in required_policies if not any(pt in title for title in policy_titles_lower)]

    model = _get_gemini()
    org_name = org.get("name", "Organization")

    if model is None or not settings.GEMINI_API_KEY or not policies:
        # Build fallback governance report
        return {
            "compliance_score": max(30, 100 - len(missing_types) * 10 - len(expired_policies) * 5),
            "risk_level": "high" if len(missing_types) > 3 else "medium" if missing_types else "low",
            "expired_policies": expired_policies,
            "missing_policies": [{"policy_type": pt, "importance": "high", "recommendation": f"Create a {pt} policy document"} for pt in missing_types],
            "compliance_risks": [{"risk": f"Missing {pt} policy", "affected_policy": pt, "severity": "high", "action": f"Draft and publish a {pt} policy"} for pt in missing_types[:3]],
            "pending_acknowledgements": {"total_employees": total_employees, "acknowledged": 0, "pending": total_employees, "percentage_complete": 0},
            "reminders": [{"type": "review", "target": "All Policies", "message": "Conduct quarterly policy review", "urgency": "this_month"}],
            "governance_findings": [f"{len(policies)} policies found, {len(missing_types)} required policy types missing"],
            "recommended_actions": [{"action": f"Create {pt} policy", "priority": "high", "deadline": "30 days"} for pt in missing_types[:3]],
            "confidence": 0.55,
            "reason": f"Deterministic governance check. Found {len(policies)} policies, {len(expired_policies)} expired/draft, {len(missing_types)} missing types."
        }

    try:
        prompt = GOVERNANCE_PROMPT.format(
            org_name=org_name,
            policies=json.dumps(_serialize_policies(policies), indent=2)[:4000],
            current_date=datetime.utcnow().strftime("%Y-%m-%d"),
            total_employees=total_employees
        )
        response = model.generate_content(prompt)
        result = _clean_json(response.text)

        if not result:
            raise ValueError("Empty governance result")

        # Merge deterministic findings
        if expired_policies:
            result.setdefault("expired_policies", [])
            result["expired_policies"].extend(expired_policies)
        result.setdefault("missing_policies", [{"policy_type": pt, "importance": "high", "recommendation": f"Create a {pt} policy"} for pt in missing_types])

        logger.info(f"Governance analysis complete. Score: {result.get('compliance_score')}")
        return result

    except Exception as e:
        logger.error(f"Gemini governance analysis failed: {e}")
        return {
            "compliance_score": 50,
            "risk_level": "medium",
            "expired_policies": expired_policies,
            "missing_policies": [{"policy_type": pt, "importance": "high", "recommendation": f"Create {pt} policy"} for pt in missing_types],
            "compliance_risks": [],
            "pending_acknowledgements": {"total_employees": total_employees, "acknowledged": 0, "pending": total_employees, "percentage_complete": 0},
            "reminders": [],
            "governance_findings": ["AI governance analysis encountered an error — using deterministic fallback"],
            "recommended_actions": [],
            "confidence": 0.4,
            "reason": f"Gemini governance failed: {str(e)}"
        }
