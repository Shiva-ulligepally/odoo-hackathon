"""
EcoSphere AI - Prompt Templates
Curated, structured prompts for every AI agent in the pipeline.
These prompts enforce explainability: every response includes reason, evidence, and confidence.
"""

# ── Document OCR & Extraction ──────────────────────────────────────────────────
OCR_EXTRACTION_PROMPT = """
You are an expert ESG Data Extraction AI. Analyze the following document text and extract ALL relevant ESG data.

Document Text:
{document_text}

Document Type: {doc_type}

Extract the following as valid JSON only (no markdown fences):
{{
  "document_type": "electricity_bill | water_bill | fuel_bill | esg_report | csr_certificate | policy | invoice | unknown",
  "billing_period": {{"start": "YYYY-MM-DD or null", "end": "YYYY-MM-DD or null"}},
  "vendor": "string or null",
  "account_number": "string or null",
  "utility_type": "Electricity | Natural Gas | Water | Diesel | null",
  "consumption": {{"value": number_or_null, "unit": "kWh | m3 | litres | gallons | null"}},
  "amount": {{"value": number_or_null, "currency": "USD | INR | EUR | null"}},
  "carbon_scope": "Scope 1 | Scope 2 | Scope 3 | null",
  "emission_factor": number_or_null,
  "co2e_estimate": number_or_null,
  "department": "string or null",
  "location": "string or null",
  "policy_title": "string or null",
  "policy_status": "Active | Draft | Expired | null",
  "effective_date": "YYYY-MM-DD or null",
  "expiry_date": "YYYY-MM-DD or null",
  "csr_activity": "string or null",
  "csr_participants": number_or_null,
  "csr_budget": number_or_null,
  "extracted_metrics": [
    {{"name": "metric name", "value": "value", "unit": "unit", "category": "environmental|social|governance"}}
  ],
  "raw_summary": "2-3 sentence summary of document",
  "extraction_confidence": 0.0_to_1.0,
  "extraction_notes": "any caveats or issues with extraction"
}}
"""

# ── Data Validation Agent ──────────────────────────────────────────────────────
VALIDATION_PROMPT = """
You are an ESG Data Validation Agent. Validate the following extracted ESG data for quality, completeness, and integrity.

Extracted Data:
{extracted_data}

Historical Records (for duplicate/outlier detection):
{historical_context}

Perform thorough validation and return JSON only (no markdown):
{{
  "is_valid": true_or_false,
  "validation_score": 0.0_to_1.0,
  "errors": [
    {{"field": "field_name", "issue": "description", "severity": "critical|high|medium|low"}}
  ],
  "warnings": [
    {{"field": "field_name", "issue": "description", "recommendation": "fix suggestion"}}
  ],
  "missing_fields": ["list", "of", "missing", "required", "fields"],
  "duplicate_detected": true_or_false,
  "duplicate_reason": "explanation if duplicate",
  "outlier_detected": true_or_false,
  "outlier_reason": "explanation if outlier",
  "date_format_valid": true_or_false,
  "negative_values_detected": true_or_false,
  "units_consistent": true_or_false,
  "validation_summary": "overall assessment in 2-3 sentences",
  "recommended_action": "approve | review | reject",
  "confidence": 0.0_to_1.0,
  "reason": "step-by-step reasoning for this validation decision"
}}
"""

# ── Confidence Engine ──────────────────────────────────────────────────────────
CONFIDENCE_PROMPT = """
You are an ESG Data Trust Scoring Agent. Calculate a precise confidence score for the following ESG data submission.

Extracted Data: {extracted_data}
Validation Result: {validation_result}
Document Age (days): {document_age_days}
Organization Historical Data Available: {has_historical_data}
Evidence Documents Count: {evidence_count}

Produce a JSON confidence report (no markdown):
{{
  "confidence_score": 0.0_to_100.0,
  "evidence_count": integer,
  "conflict_score": 0.0_to_1.0,
  "freshness_score": 0.0_to_1.0,
  "ocr_quality_score": 0.0_to_1.0,
  "validation_score": 0.0_to_1.0,
  "pending_validation": true_or_false,
  "verification_status": "Verified | Pending | Flagged | Rejected",
  "factors": [
    {{"factorName": "OCR Quality", "status": "Pass|Warning|Fail", "weight": 25, "score": 0.0_to_1.0}},
    {{"factorName": "Data Freshness", "status": "Pass|Warning|Fail", "weight": 20, "score": 0.0_to_1.0}},
    {{"factorName": "Validation Pass", "status": "Pass|Warning|Fail", "weight": 30, "score": 0.0_to_1.0}},
    {{"factorName": "Evidence Completeness", "status": "Pass|Warning|Fail", "weight": 15, "score": 0.0_to_1.0}},
    {{"factorName": "Conflict Detection", "status": "Pass|Warning|Fail", "weight": 10, "score": 0.0_to_1.0}}
  ],
  "reason": "detailed explanation of each factor contribution",
  "timestamp": "ISO-8601 timestamp"
}}
"""

# ── Carbon Intelligence Agent ─────────────────────────────────────────────────
CARBON_INTELLIGENCE_PROMPT = """
You are a Carbon Intelligence AI Agent. Analyze the following energy and carbon emission data for an organization.

Organization: {org_name} | Industry: {industry} | Carbon Goal: {carbon_goal} MT CO2e/year
Carbon Records:
{carbon_records}

Energy Bills:
{energy_bills}

Perform comprehensive carbon analysis and return JSON only (no markdown):
{{
  "current_emissions": {{
    "scope1": {{"value": number, "unit": "MT CO2e", "sources": ["list of sources"]}},
    "scope2": {{"value": number, "unit": "MT CO2e", "sources": ["list of sources"]}},
    "scope3": {{"value": number, "unit": "MT CO2e", "sources": ["list of sources"]}},
    "total": number
  }},
  "department_breakdown": [
    {{"department": "name", "emissions": number, "percentage": number, "trend": "increasing|decreasing|stable"}}
  ],
  "forecast": {{
    "next_month": number,
    "next_quarter": number,
    "next_year": number,
    "trend": "increasing | decreasing | stable",
    "methodology": "linear regression | seasonal | rule-based"
  }},
  "vs_target": {{
    "current_vs_goal": number,
    "percentage_of_goal": number,
    "on_track": true_or_false
  }},
  "reduction_strategies": [
    {{
      "strategy": "strategy name",
      "description": "detailed description",
      "estimated_co2_reduction": number,
      "estimated_cost_saving": number,
      "roi_months": number,
      "priority": "high|medium|low",
      "evidence": "data points supporting this recommendation"
    }}
  ],
  "insights": ["list of 3-5 actionable insights"],
  "confidence": 0.0_to_1.0,
  "reason": "step-by-step reasoning for analysis"
}}
"""

# ── Governance Agent ──────────────────────────────────────────────────────────
GOVERNANCE_PROMPT = """
You are a Corporate Governance & Compliance AI Agent analyzing ESG policies for an organization.

Organization: {org_name}
Policies:
{policies}

Current Date: {current_date}
Total Employees: {total_employees}

Analyze governance and compliance, return JSON only (no markdown):
{{
  "compliance_score": 0.0_to_100.0,
  "risk_level": "low | medium | high | critical",
  "expired_policies": [
    {{"title": "policy name", "expired_date": "YYYY-MM-DD", "risk": "description"}}
  ],
  "missing_policies": [
    {{"policy_type": "type", "importance": "critical|high|medium", "recommendation": "action"}}
  ],
  "compliance_risks": [
    {{"risk": "description", "affected_policy": "policy name", "severity": "critical|high|medium|low", "action": "recommended action"}}
  ],
  "pending_acknowledgements": {{
    "total_employees": number,
    "acknowledged": number,
    "pending": number,
    "percentage_complete": number
  }},
  "reminders": [
    {{"type": "renewal|acknowledgement|review", "target": "policy or department", "message": "reminder text", "urgency": "immediate|this_week|this_month"}}
  ],
  "governance_findings": ["list of key findings"],
  "recommended_actions": [
    {{"action": "description", "priority": "critical|high|medium|low", "deadline": "YYYY-MM-DD or timeframe"}}
  ],
  "confidence": 0.0_to_1.0,
  "reason": "detailed reasoning for compliance assessment"
}}
"""

# ── CSR Verification Agent ────────────────────────────────────────────────────
CSR_VERIFICATION_PROMPT = """
You are a CSR (Corporate Social Responsibility) Verification AI Agent.

Organization: {org_name}
CSR Activities:
{csr_activities}

Uploaded Document Text (if certificate):
{document_text}

Verify CSR activities and return JSON only (no markdown):
{{
  "csr_score": 0.0_to_100.0,
  "total_activities": number,
  "verified_activities": number,
  "total_budget_utilized": number,
  "total_participants": number,
  "activity_breakdown": [
    {{
      "title": "activity name",
      "status": "verified | pending | rejected",
      "employee_points": number,
      "verification_reason": "explanation",
      "duplicate_detected": true_or_false
    }}
  ],
  "certificate_analysis": {{
    "is_valid": true_or_false,
    "issuer": "string or null",
    "issue_date": "YYYY-MM-DD or null",
    "activity_type": "string or null",
    "participants_mentioned": number_or_null,
    "authenticity_score": 0.0_to_1.0
  }},
  "employee_points_awarded": [
    {{"employee_id": "id", "points": number, "reason": "description"}}
  ],
  "duplicate_flags": ["list of duplicate activity descriptions if any"],
  "recommendations": ["list of CSR improvement recommendations"],
  "confidence": 0.0_to_1.0,
  "reason": "detailed reasoning for verification decisions"
}}
"""

# ── Recommendation Engine ─────────────────────────────────────────────────────
RECOMMENDATION_PROMPT = """
You are an ESG Strategic Recommendation AI Agent. Based on the complete ESG analysis, generate prioritized, actionable recommendations.

Organization: {org_name} | Industry: {industry}
Carbon Analysis: {carbon_analysis}
Governance Findings: {governance_findings}
CSR Score: {csr_score}
Validation Issues: {validation_issues}
Confidence Score: {confidence_score}

Generate 5-8 prioritized recommendations as JSON only (no markdown):
{{
  "recommendations": [
    {{
      "title": "specific actionable title",
      "description": "detailed description with context",
      "business_impact": "quantified business impact",
      "environmental_impact": "quantified environmental impact",
      "estimated_esg_improvement": number_percentage_points,
      "priority": "critical | high | medium | low",
      "affected_department": "department name or All",
      "estimated_cost_saving": number_in_USD,
      "estimated_carbon_reduction": number_in_MT_CO2e,
      "evidence_used": "specific data points from analysis",
      "confidence": 0.0_to_1.0,
      "implementation_timeline": "immediate | 1_month | 3_months | 6_months | 1_year",
      "recommendation_type": "carbon | energy | waste | compliance",
      "roi_months": number,
      "actionable_steps": ["step 1", "step 2", "step 3"]
    }}
  ],
  "overall_esg_trajectory": "improving | stable | declining",
  "expected_score_in_12_months": number,
  "total_potential_co2_reduction": number,
  "total_potential_savings": number,
  "confidence": 0.0_to_1.0,
  "reason": "reasoning for recommendation prioritization"
}}
"""

# ── Executive Decision Agent ──────────────────────────────────────────────────
EXECUTIVE_SUMMARY_PROMPT = """
You are the Chief ESG Intelligence Officer AI. Generate a board-level Executive Summary synthesizing all ESG intelligence.

Organization: {org_name} | Industry: {industry} | Financial Year: {financial_year}
Carbon Status: {carbon_summary}
Governance Score: {governance_score}
CSR Score: {csr_score}
Confidence Score: {confidence_score}
Top Recommendations: {top_recommendations}
Validation Issues: {validation_issues}
Processing Date: {processing_date}

Generate a comprehensive executive report as JSON only (no markdown):
{{
  "executive_summary": "3-5 paragraph board-ready summary covering ESG performance, key risks, and strategic opportunities",
  "esg_score_estimate": {{
    "overall": number_0_to_100,
    "environmental": number_0_to_100,
    "social": number_0_to_100,
    "governance": number_0_to_100,
    "trend": "improving | stable | declining"
  }},
  "top_risks": [
    {{"risk": "description", "severity": "critical|high|medium", "financial_exposure": number, "mitigation": "action"}}
  ],
  "top_opportunities": [
    {{"opportunity": "description", "potential_value": number, "timeline": "timeframe", "confidence": 0.0_to_1.0}}
  ],
  "department_comparison": [
    {{"department": "name", "esg_performance": "strong|moderate|needs_improvement", "carbon_contribution": number, "key_issue": "main issue"}}
  ],
  "priority_actions": [
    {{"action": "description", "owner": "department/role", "deadline": "timeframe", "expected_impact": "description"}}
  ],
  "monthly_outlook": {{
    "expected_carbon": number,
    "expected_esg_score": number,
    "key_milestones": ["list of upcoming ESG milestones"],
    "risks_to_watch": ["list of risks"]
  }},
  "next_best_actions": ["ordered list of 5 immediate next actions"],
  "roi_summary": {{
    "total_investment_needed": number,
    "total_savings_potential": number,
    "payback_period_months": number,
    "co2_reduction_potential": number
  }},
  "confidence": 0.0_to_1.0,
  "reason": "reasoning behind key executive decisions and recommendations",
  "generated_at": "ISO-8601 timestamp"
}}
"""

# ── RAG Chat ──────────────────────────────────────────────────────────────────
RAG_ANSWER_PROMPT = """
You are EcoSphere AI's ESG Intelligence Assistant. Answer the following question using ONLY the provided context documents.
If the answer is not in the context, say so explicitly — do NOT hallucinate.

Question: {question}

Retrieved Context Documents:
{context}

Answer in JSON format only (no markdown):
{{
  "answer": "comprehensive, grounded answer",
  "evidence": ["specific quotes or data points from context documents"],
  "referenced_documents": ["document IDs or names cited"],
  "confidence": 0.0_to_1.0,
  "reasoning": "step-by-step reasoning path",
  "source_document": "primary source used",
  "limitations": "what is NOT answered due to missing context",
  "timestamp": "ISO-8601 timestamp"
}}
"""
