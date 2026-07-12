"""
EcoSphere AI - Graceful Fallback Module
Rule-based fallbacks for every agent when Gemini / ChromaDB / MongoDB are unavailable.
Never crashes. Always returns a structured, explainable response.
"""
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def fallback_extraction(doc_text: str, doc_type: str = "unknown") -> dict:
    """Rule-based extraction when Gemini OCR fails."""
    logger.warning("Using rule-based OCR fallback")
    import re

    result = {
        "document_type": doc_type,
        "billing_period": {"start": None, "end": None},
        "vendor": None,
        "account_number": None,
        "utility_type": None,
        "consumption": {"value": None, "unit": None},
        "amount": {"value": None, "currency": None},
        "carbon_scope": None,
        "emission_factor": None,
        "co2e_estimate": None,
        "department": None,
        "location": None,
        "policy_title": None,
        "policy_status": None,
        "effective_date": None,
        "expiry_date": None,
        "csr_activity": None,
        "csr_participants": None,
        "csr_budget": None,
        "extracted_metrics": [],
        "raw_summary": doc_text[:500] if doc_text else "No text extracted",
        "extraction_confidence": 0.3,
        "extraction_notes": "Gemini OCR unavailable — rule-based extraction applied. Manual review required."
    }

    text_lower = doc_text.lower() if doc_text else ""

    # Detect document type
    if any(k in text_lower for k in ["electricity", "kwh", "kilowatt"]):
        result["document_type"] = "electricity_bill"
        result["utility_type"] = "Electricity"
        result["carbon_scope"] = "Scope 2"
    elif any(k in text_lower for k in ["water", "litre", "gallon", "m3"]):
        result["document_type"] = "water_bill"
        result["utility_type"] = "Water"
        result["carbon_scope"] = "Scope 3"
    elif any(k in text_lower for k in ["fuel", "diesel", "petrol", "gasoline", "natural gas"]):
        result["document_type"] = "fuel_bill"
        result["utility_type"] = "Diesel"
        result["carbon_scope"] = "Scope 1"
    elif any(k in text_lower for k in ["policy", "governance", "compliance", "procedure"]):
        result["document_type"] = "policy"
    elif any(k in text_lower for k in ["csr", "social responsibility", "community", "volunteer"]):
        result["document_type"] = "csr_certificate"

    # Extract amounts with regex
    amount_match = re.search(r"(?:total|amount|bill|due)[:\s]*[$₹€]?\s*([\d,]+\.?\d*)", text_lower)
    if amount_match:
        try:
            result["amount"]["value"] = float(amount_match.group(1).replace(",", ""))
        except ValueError:
            pass

    # Extract consumption
    kwh_match = re.search(r"([\d,]+\.?\d*)\s*kwh", text_lower)
    if kwh_match:
        try:
            result["consumption"]["value"] = float(kwh_match.group(1).replace(",", ""))
            result["consumption"]["unit"] = "kWh"
            # Estimate CO2e: 0.82 kg CO2/kWh average emission factor
            result["co2e_estimate"] = round(result["consumption"]["value"] * 0.82 / 1000, 4)
            result["emission_factor"] = 0.82
        except ValueError:
            pass

    return result


def fallback_validation(extracted_data: dict) -> dict:
    """Rule-based validation when Gemini validation fails."""
    logger.warning("Using rule-based validation fallback")
    errors = []
    warnings = []
    missing = []

    if not extracted_data.get("billing_period", {}).get("start"):
        missing.append("billing_period.start")
    if not extracted_data.get("amount", {}).get("value"):
        warnings.append({"field": "amount.value", "issue": "Amount not detected", "recommendation": "Verify manually"})
    if not extracted_data.get("consumption", {}).get("value"):
        warnings.append({"field": "consumption.value", "issue": "Consumption not detected", "recommendation": "Check meter reading"})
    if extracted_data.get("co2e_estimate") and extracted_data["co2e_estimate"] < 0:
        errors.append({"field": "co2e_estimate", "issue": "Negative CO2 value", "severity": "critical"})

    return {
        "is_valid": len(errors) == 0,
        "validation_score": 0.5 if not errors else 0.2,
        "errors": errors,
        "warnings": warnings,
        "missing_fields": missing,
        "duplicate_detected": False,
        "duplicate_reason": None,
        "outlier_detected": False,
        "outlier_reason": None,
        "date_format_valid": True,
        "negative_values_detected": any(e["field"] == "co2e_estimate" for e in errors),
        "units_consistent": True,
        "validation_summary": "Rule-based fallback validation applied. Gemini validation unavailable.",
        "recommended_action": "review" if warnings else "approve",
        "confidence": 0.4,
        "reason": "Gemini LLM unavailable. Applied deterministic rule-based checks only. Manual review strongly recommended."
    }


def fallback_confidence(validation_result: dict, extracted_data: dict) -> dict:
    """Rule-based confidence when Gemini confidence engine fails."""
    logger.warning("Using rule-based confidence fallback")
    validation_score = validation_result.get("validation_score", 0.5)
    extraction_confidence = extracted_data.get("extraction_confidence", 0.3)
    base_score = (validation_score * 0.5 + extraction_confidence * 0.5) * 100

    return {
        "confidence_score": round(base_score, 1),
        "evidence_count": 1,
        "conflict_score": 0.2,
        "freshness_score": 0.8,
        "ocr_quality_score": extraction_confidence,
        "validation_score": validation_score,
        "pending_validation": True,
        "verification_status": "Pending",
        "factors": [
            {"factorName": "OCR Quality", "status": "Warning", "weight": 25, "score": extraction_confidence},
            {"factorName": "Data Freshness", "status": "Pass", "weight": 20, "score": 0.8},
            {"factorName": "Validation Pass", "status": "Warning" if validation_result.get("is_valid") else "Fail", "weight": 30, "score": validation_score},
            {"factorName": "Evidence Completeness", "status": "Warning", "weight": 15, "score": 0.4},
            {"factorName": "Conflict Detection", "status": "Pass", "weight": 10, "score": 0.8}
        ],
        "reason": "Gemini confidence engine unavailable. Calculated from rule-based OCR quality and validation scores.",
        "timestamp": datetime.utcnow().isoformat()
    }


def fallback_carbon_analysis(carbon_records: list, energy_bills: list, org: dict) -> dict:
    """Rule-based carbon analysis when Gemini carbon agent fails."""
    logger.warning("Using rule-based carbon fallback")
    total_emissions = sum(r.get("value", 0) for r in carbon_records)
    scope1 = sum(r.get("value", 0) for r in carbon_records if r.get("scope") == "Scope 1")
    scope2 = sum(r.get("value", 0) for r in carbon_records if r.get("scope") == "Scope 2")
    scope3 = sum(r.get("value", 0) for r in carbon_records if r.get("scope") == "Scope 3")

    # Estimate from energy bills
    for bill in energy_bills:
        kwh = bill.get("consumption", 0)
        if bill.get("utilityType") == "Electricity":
            scope2 += round(kwh * 0.82 / 1000, 3)
        elif bill.get("utilityType") in ["Diesel", "Natural Gas"]:
            scope1 += round(kwh * 2.68 / 1000, 3)

    total = round(scope1 + scope2 + scope3, 3)
    carbon_goal = org.get("carbonGoal", 1000)

    return {
        "current_emissions": {
            "scope1": {"value": round(scope1, 3), "unit": "MT CO2e", "sources": ["Fuel Combustion"]},
            "scope2": {"value": round(scope2, 3), "unit": "MT CO2e", "sources": ["Electricity"]},
            "scope3": {"value": round(scope3, 3), "unit": "MT CO2e", "sources": ["Business Travel", "Employee Commute"]},
            "total": total
        },
        "department_breakdown": [],
        "forecast": {
            "next_month": round(total / 12, 3),
            "next_quarter": round(total / 4, 3),
            "next_year": round(total * 1.05, 3),
            "trend": "stable",
            "methodology": "rule-based average"
        },
        "vs_target": {
            "current_vs_goal": round(total - carbon_goal, 3),
            "percentage_of_goal": round((total / carbon_goal) * 100, 1) if carbon_goal else 0,
            "on_track": total <= carbon_goal
        },
        "reduction_strategies": [
            {
                "strategy": "Switch to Renewable Energy",
                "description": "Transition electricity procurement to certified renewable sources.",
                "estimated_co2_reduction": round(scope2 * 0.7, 3),
                "estimated_cost_saving": 5000,
                "roi_months": 24,
                "priority": "high",
                "evidence": f"Scope 2 emissions: {scope2} MT CO2e"
            }
        ],
        "insights": [
            f"Total emissions: {total} MT CO2e vs target {carbon_goal} MT CO2e",
            f"Scope 2 (electricity) represents the largest reduction opportunity",
            "Rule-based analysis — connect Gemini AI for deeper insights"
        ],
        "confidence": 0.45,
        "reason": "Gemini Carbon Agent unavailable. Applied emission factor calculations using standard IPCC factors."
    }


def fallback_recommendations(org_name: str, carbon_data: dict, confidence_score: float) -> dict:
    """Rule-based recommendations when Gemini recommendation engine fails."""
    logger.warning("Using rule-based recommendations fallback")
    total_co2 = carbon_data.get("current_emissions", {}).get("total", 0) if carbon_data else 0
    return {
        "recommendations": [
            {
                "title": "Install Solar Panels for On-Site Energy Generation",
                "description": "Deploy rooftop solar panels to reduce grid electricity dependency and cut Scope 2 emissions.",
                "business_impact": "Reduce energy costs by up to 40% over 10 years",
                "environmental_impact": f"Estimated {round(total_co2 * 0.3, 1)} MT CO2e reduction annually",
                "estimated_esg_improvement": 8,
                "priority": "high",
                "affected_department": "Facilities",
                "estimated_cost_saving": 12000,
                "estimated_carbon_reduction": round(total_co2 * 0.3, 1),
                "evidence_used": f"Current Scope 2 emissions from energy bills",
                "confidence": 0.65,
                "implementation_timeline": "6_months",
                "recommendation_type": "energy",
                "roi_months": 36,
                "actionable_steps": ["Conduct solar feasibility study", "Get 3 vendor quotes", "Apply for green energy subsidies"]
            },
            {
                "title": "Implement Energy Monitoring System",
                "description": "Deploy real-time energy meters at department level to identify waste patterns.",
                "business_impact": "Identify 15-25% energy waste reduction opportunities",
                "environmental_impact": "Scope 2 emissions reduction through usage optimization",
                "estimated_esg_improvement": 5,
                "priority": "medium",
                "affected_department": "All",
                "estimated_cost_saving": 6000,
                "estimated_carbon_reduction": round(total_co2 * 0.1, 1),
                "evidence_used": "Energy bill analysis",
                "confidence": 0.55,
                "implementation_timeline": "3_months",
                "recommendation_type": "energy",
                "roi_months": 12,
                "actionable_steps": ["Select IoT meters", "Install per floor", "Setup dashboard alerts"]
            }
        ],
        "overall_esg_trajectory": "stable",
        "expected_score_in_12_months": round(confidence_score + 5, 1),
        "total_potential_co2_reduction": round(total_co2 * 0.4, 1),
        "total_potential_savings": 18000,
        "confidence": 0.5,
        "reason": "Gemini Recommendation Engine unavailable. Applied industry-standard ESG improvement strategies."
    }


def fallback_executive_summary(org_name: str, confidence_score: float, carbon_data: dict) -> dict:
    """Rule-based executive summary when Gemini executive agent fails."""
    logger.warning("Using rule-based executive summary fallback")
    total_co2 = carbon_data.get("current_emissions", {}).get("total", 0) if carbon_data else 0
    return {
        "executive_summary": (
            f"{org_name} has completed its ESG data submission review. "
            f"Current carbon footprint stands at approximately {total_co2} MT CO2e. "
            f"The AI confidence score is {confidence_score:.0f}%, indicating data is available for basic analysis. "
            "Immediate priorities include renewable energy transition and enhanced data collection practices. "
            "Full AI-powered analysis will be available once the Gemini service reconnects."
        ),
        "esg_score_estimate": {
            "overall": round(confidence_score * 0.7, 1),
            "environmental": round(confidence_score * 0.65, 1),
            "social": round(confidence_score * 0.72, 1),
            "governance": round(confidence_score * 0.75, 1),
            "trend": "stable"
        },
        "top_risks": [
            {"risk": "Incomplete ESG data submission", "severity": "high", "financial_exposure": 0, "mitigation": "Complete all document uploads"},
            {"risk": "Carbon target compliance uncertainty", "severity": "medium", "financial_exposure": 0, "mitigation": "Enable continuous monitoring"}
        ],
        "top_opportunities": [
            {"opportunity": "Renewable energy transition", "potential_value": 50000, "timeline": "12 months", "confidence": 0.6}
        ],
        "department_comparison": [],
        "priority_actions": [
            {"action": "Upload all energy bills for accurate carbon calculation", "owner": "Finance", "deadline": "This week", "expected_impact": "Improved data accuracy"},
            {"action": "Review and renew expired ESG policies", "owner": "Governance", "deadline": "This month", "expected_impact": "Compliance risk reduction"}
        ],
        "monthly_outlook": {
            "expected_carbon": round(total_co2 / 12, 3),
            "expected_esg_score": round(confidence_score * 0.7, 1),
            "key_milestones": ["Complete Q1 ESG data collection", "Policy renewal"],
            "risks_to_watch": ["Energy cost increases", "Regulatory changes"]
        },
        "next_best_actions": [
            "Upload all outstanding utility bills",
            "Review governance policy compliance",
            "Engage renewable energy vendors",
            "Train employees on ESG reporting",
            "Schedule quarterly ESG review"
        ],
        "roi_summary": {
            "total_investment_needed": 25000,
            "total_savings_potential": 50000,
            "payback_period_months": 18,
            "co2_reduction_potential": round(total_co2 * 0.35, 1)
        },
        "confidence": 0.4,
        "reason": "Gemini Executive Agent unavailable. Applied rule-based ESG assessment framework.",
        "generated_at": datetime.utcnow().isoformat()
    }


def fallback_rag_answer(question: str) -> dict:
    """Fallback when ChromaDB or Gemini RAG is unavailable."""
    logger.warning("Using RAG fallback — vector DB or LLM unavailable")
    return {
        "answer": f"I cannot retrieve a grounded answer for '{question}' at this moment because the document retrieval system is temporarily unavailable. Please try again shortly or check the system health endpoint.",
        "evidence": [],
        "referenced_documents": [],
        "confidence": 0.0,
        "reasoning": "ChromaDB vector store or Gemini LLM is currently unavailable.",
        "source_document": None,
        "limitations": "No context retrieved. Answer is not grounded in uploaded documents.",
        "timestamp": datetime.utcnow().isoformat()
    }
