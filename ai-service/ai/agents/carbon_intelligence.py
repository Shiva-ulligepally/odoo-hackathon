"""
EcoSphere AI - Carbon Intelligence Agent (Module 4 / Step 8)
Calculates Scope 1/2/3 emissions, forecasts future trends,
generates reduction strategies, and estimates cost/CO₂ savings.
"""
import logging
import json
import re
from datetime import datetime
from typing import Optional

from config import get_settings
from ai.prompts.prompt_templates import CARBON_INTELLIGENCE_PROMPT
from ai.utils.fallbacks import fallback_carbon_analysis

logger = logging.getLogger(__name__)
settings = get_settings()

_gemini_model = None

# Standard IPCC emission factors (kg CO2e per unit)
EMISSION_FACTORS = {
    "Electricity": 0.82,      # kg CO2e per kWh (global avg)
    "Natural Gas": 2.04,      # kg CO2e per kWh
    "Diesel": 2.68,           # kg CO2e per litre
    "Water": 0.00344,         # kg CO2e per litre
    "Business Travel": 0.255, # kg CO2e per km (average flight)
    "Employee Commute": 0.21, # kg CO2e per km (average car)
}

SCOPE_MAP = {
    "Electricity": "Scope 2",
    "Natural Gas": "Scope 1",
    "Diesel": "Scope 1",
    "Water": "Scope 3",
    "Business Travel": "Scope 3",
    "Employee Commute": "Scope 3",
    "Waste Disposal": "Scope 3",
    "Fuel Combustion": "Scope 1",
}


def _get_gemini():
    global _gemini_model
    if _gemini_model is None:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            _gemini_model = genai.GenerativeModel(settings.GEMINI_PRO_MODEL)
        except Exception as e:
            logger.error(f"Gemini init failed in carbon agent: {e}")
    return _gemini_model


def _clean_json(text: str) -> dict:
    cleaned = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r'\s*```$', '', cleaned, flags=re.MULTILINE)
    try:
        return json.loads(cleaned)
    except Exception:
        return {}


def _fetch_org_data(organization_id: str) -> tuple:
    """Fetch carbon records, energy bills, and org data from MongoDB."""
    try:
        from database import get_collection
        from bson import ObjectId
        org_oid = ObjectId(organization_id)

        org_col = get_collection("organizations")
        org = org_col.find_one({"_id": org_oid}) if org_col else {}

        carbon_col = get_collection("carbonrecords")
        carbon_records = list(carbon_col.find({"organization": org_oid})) if carbon_col else []

        bill_col = get_collection("energybills")
        energy_bills = list(bill_col.find({"organization": org_oid})) if bill_col else []

        return org or {}, carbon_records, energy_bills
    except Exception as e:
        logger.error(f"Failed to fetch org data for carbon analysis: {e}")
        return {}, [], []


def _serialize_records(records: list) -> list:
    """Convert MongoDB docs to JSON-serializable format."""
    result = []
    for r in records:
        clean = {k: str(v) if hasattr(v, '__class__') and v.__class__.__name__ in ['ObjectId', 'datetime'] else v
                 for k, v in r.items() if k != '_id'}
        result.append(clean)
    return result


def analyze_carbon(organization_id: str, extracted_data: dict = None) -> dict:
    """
    Main carbon intelligence entry point.
    Fetches org data, calculates Scope 1/2/3, forecasts emissions,
    and generates reduction strategies.
    """
    logger.info(f"Running Carbon Intelligence Agent for org: {organization_id}")

    org, carbon_records, energy_bills = _fetch_org_data(organization_id)

    # If new document extracted data, simulate adding it to analysis
    if extracted_data:
        consumption = extracted_data.get("consumption", {}).get("value")
        utility = extracted_data.get("utility_type")
        if consumption and utility:
            ef = EMISSION_FACTORS.get(utility, 1.0)
            estimated_co2e = round(consumption * ef / 1000, 4)
            energy_bills.append({
                "utilityType": utility,
                "consumption": consumption,
                "unit": extracted_data.get("consumption", {}).get("unit", ""),
                "estimatedCo2e": estimated_co2e,
                "_from_current_doc": True
            })

    model = _get_gemini()
    if model is None or not settings.GEMINI_API_KEY:
        return fallback_carbon_analysis(carbon_records, energy_bills, org)

    try:
        carbon_serialized = json.dumps(_serialize_records(carbon_records[:20]), indent=2)
        bill_serialized = json.dumps(_serialize_records(energy_bills[:20]), indent=2)

        prompt = CARBON_INTELLIGENCE_PROMPT.format(
            org_name=org.get("name", "Organization"),
            industry=org.get("industry", "Unknown"),
            carbon_goal=org.get("carbonGoal", 1000),
            carbon_records=carbon_serialized[:3000],
            energy_bills=bill_serialized[:2000]
        )
        response = model.generate_content(prompt)
        result = _clean_json(response.text)

        if not result:
            raise ValueError("Empty carbon analysis result")

        logger.info(f"Carbon analysis complete. Total: {result.get('current_emissions', {}).get('total', 0)} MT CO2e")
        return result

    except Exception as e:
        logger.error(f"Gemini carbon analysis failed: {e}")
        return fallback_carbon_analysis(carbon_records, energy_bills, org)
