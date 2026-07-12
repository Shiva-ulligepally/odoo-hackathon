"""
EcoSphere AI - Integration Test Suite
Tests all AI pipeline stages with mock data.
Run: python -m pytest tests/ -v
Or:  python tests/test_ai_pipeline.py
"""
import sys
import os
import json
import time
import requests
from datetime import datetime

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BASE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8000")
TEST_ORG_ID = os.getenv("TEST_ORG_ID", "000000000000000000000001")
TEST_DOC_ID = os.getenv("TEST_DOC_ID", "doc_test_001")

PASS = "✅ PASS"
FAIL = "❌ FAIL"
SKIP = "⏭️  SKIP"

results = []


def test(name: str, fn):
    try:
        fn()
        results.append((PASS, name))
        print(f"  {PASS} {name}")
    except AssertionError as e:
        results.append((FAIL, f"{name}: {e}"))
        print(f"  {FAIL} {name}: {e}")
    except Exception as e:
        results.append((FAIL, f"{name}: {e}"))
        print(f"  {FAIL} {name}: {e}")


# ══════════════════════════════════════════════════════════════
# MOCK ESG DATA
# ══════════════════════════════════════════════════════════════
MOCK_EXTRACTED_DATA = {
    "document_type": "electricity_bill",
    "billing_period": {"start": "2024-01-01", "end": "2024-01-31"},
    "vendor": "City Power Co.",
    "account_number": "ACC-2024-001",
    "utility_type": "Electricity",
    "consumption": {"value": 12500, "unit": "kWh"},
    "amount": {"value": 1875.50, "currency": "USD"},
    "carbon_scope": "Scope 2",
    "emission_factor": 0.82,
    "co2e_estimate": 10.25,
    "department": "Manufacturing",
    "location": "Plant A",
    "extracted_metrics": [
        {"name": "Electricity Consumption", "value": 12500, "unit": "kWh", "category": "environmental"}
    ],
    "raw_summary": "January 2024 electricity bill for Manufacturing Plant A. 12,500 kWh consumed.",
    "extraction_confidence": 0.92,
    "extraction_notes": "High quality scan, all fields extracted successfully"
}

MOCK_VALIDATION_RESULT = {
    "is_valid": True,
    "validation_score": 0.91,
    "errors": [],
    "warnings": [{"field": "emission_factor", "issue": "Using default factor", "recommendation": "Use region-specific factor"}],
    "missing_fields": [],
    "duplicate_detected": False,
    "outlier_detected": False,
    "date_format_valid": True,
    "negative_values_detected": False,
    "units_consistent": True,
    "validation_summary": "Data is valid with minor warnings",
    "recommended_action": "approve",
    "confidence": 0.91,
    "reason": "All required fields present, values within expected ranges"
}


# ══════════════════════════════════════════════════════════════
# TESTS
# ══════════════════════════════════════════════════════════════

def test_health():
    r = requests.get(f"{BASE_URL}/health", timeout=5)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data.get("success") is True, "Health check not successful"
    assert data["data"]["service"] == "EcoSphere AI Intelligence Service"


def test_validate_with_mock_data():
    payload = {
        "organizationId": TEST_ORG_ID,
        "extractedData": MOCK_EXTRACTED_DATA
    }
    r = requests.post(f"{BASE_URL}/api/ai/validate", json=payload, timeout=30)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data.get("success") is True, f"Validate failed: {data.get('message')}"
    assert "validation" in data["data"], "No validation result in response"
    val = data["data"]["validation"]
    assert "is_valid" in val, "Missing is_valid field"
    assert "confidence" in val, "Missing confidence field"
    assert isinstance(val.get("errors"), list), "errors should be a list"


def test_confidence_calculation():
    payload = {
        "documentId": TEST_DOC_ID,
        "organizationId": TEST_ORG_ID,
        "extractedData": MOCK_EXTRACTED_DATA,
        "validationResult": MOCK_VALIDATION_RESULT
    }
    r = requests.post(f"{BASE_URL}/api/ai/confidence", json=payload, timeout=30)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data.get("success") is True, f"Confidence failed: {data.get('message')}"
    conf = data["data"]
    assert "confidence_score" in conf, "Missing confidence_score"
    assert 0 <= conf["confidence_score"] <= 100, "confidence_score out of range [0,100]"
    assert "factors" in conf, "Missing factors array"
    assert isinstance(conf["factors"], list), "factors should be a list"
    assert "reason" in conf, "Missing reason (explainability)"


def test_carbon_prediction():
    payload = {
        "organizationId": TEST_ORG_ID,
        "extractedData": MOCK_EXTRACTED_DATA
    }
    r = requests.post(f"{BASE_URL}/api/ai/predict", json=payload, timeout=45)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data.get("success") is True, f"Predict failed: {data.get('message')}"
    carbon = data["data"]
    assert "current_emissions" in carbon, "Missing current_emissions"
    assert "scope1" in carbon["current_emissions"], "Missing scope1"
    assert "scope2" in carbon["current_emissions"], "Missing scope2"
    assert "scope3" in carbon["current_emissions"], "Missing scope3"
    assert "forecast" in carbon, "Missing forecast"
    assert "reduction_strategies" in carbon, "Missing reduction_strategies"
    assert "confidence" in carbon, "Missing confidence (explainability)"


def test_recommendations_generation():
    payload = {
        "organizationId": TEST_ORG_ID,
        "confidenceScore": 78.5,
        "carbonAnalysis": {
            "current_emissions": {"total": 45.2, "scope1": {"value": 10}, "scope2": {"value": 25}, "scope3": {"value": 10.2}},
            "vs_target": {"on_track": False},
            "reduction_strategies": []
        }
    }
    r = requests.post(f"{BASE_URL}/api/ai/recommend", json=payload, timeout=60)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data.get("success") is True, f"Recommend failed: {data.get('message')}"
    recs = data["data"]
    assert "recommendations" in recs, "Missing recommendations"
    assert isinstance(recs["recommendations"], list), "recommendations should be a list"
    assert len(recs["recommendations"]) > 0, "No recommendations generated"
    first_rec = recs["recommendations"][0]
    required_fields = ["title", "description", "priority", "confidence"]
    for f in required_fields:
        assert f in first_rec, f"Missing required field '{f}' in recommendation"


def test_governance_analysis():
    payload = {"organizationId": TEST_ORG_ID}
    r = requests.post(f"{BASE_URL}/api/ai/governance", json=payload, timeout=45)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data.get("success") is True, f"Governance failed: {data.get('message')}"
    gov = data["data"]
    assert "compliance_score" in gov, "Missing compliance_score"
    assert "risk_level" in gov, "Missing risk_level"
    assert "confidence" in gov, "Missing confidence (explainability)"


def test_csr_verification():
    payload = {
        "organizationId": TEST_ORG_ID,
        "documentText": "Certificate of CSR Excellence — Employee tree planting drive Jan 2024. 50 employees planted 200 trees in partnership with Green Earth Foundation.",
        "extractedData": {"document_type": "csr_certificate", "csr_activity": "Tree Planting Drive"}
    }
    r = requests.post(f"{BASE_URL}/api/ai/csr", json=payload, timeout=45)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data.get("success") is True, f"CSR failed: {data.get('message')}"
    csr = data["data"]
    assert "csr_score" in csr, "Missing csr_score"
    assert "confidence" in csr, "Missing confidence (explainability)"


def test_chat_rag():
    payload = {
        "question": "What is our current Scope 2 electricity consumption?",
        "organizationId": TEST_ORG_ID,
        "nContextDocs": 3
    }
    r = requests.post(f"{BASE_URL}/api/ai/chat", json=payload, timeout=45)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data.get("success") is True, f"Chat failed: {data.get('message')}"
    chat = data["data"]
    assert "answer" in chat, "Missing answer"
    assert "confidence" in chat, "Missing confidence (explainability)"
    assert "reasoning" in chat, "Missing reasoning (explainability)"


def test_status_endpoint():
    r = requests.get(f"{BASE_URL}/api/ai/status", timeout=5)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data.get("success") is True, f"Status check failed"


def test_process_document_trigger():
    payload = {
        "documentId": f"test_doc_{int(time.time())}",
        "organizationId": TEST_ORG_ID,
        "userId": "test_user_001",
        "fileUrl": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf",
        "fileType": "application/pdf",
        "fileName": "test_electricity_bill.pdf"
    }
    r = requests.post(f"{BASE_URL}/api/ai/process-document", json=payload, timeout=10)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data.get("success") is True
    assert data["data"]["status"] == "pipeline_started"


def test_validate_missing_file_graceful():
    """Ensure system handles missing fileUrl gracefully without crash."""
    payload = {
        "organizationId": TEST_ORG_ID,
        "fileUrl": "http://nonexistent.invalid/missing.pdf",
        "fileType": "application/pdf",
        "fileName": "missing.pdf"
    }
    r = requests.post(f"{BASE_URL}/api/ai/validate", json=payload, timeout=30)
    assert r.status_code == 200, "Should return 200 with graceful fallback"
    data = r.json()
    assert "data" in data, "Should have data key even on fallback"


def test_invalid_org_id_graceful():
    """Ensure invalid org ID doesn't crash the service."""
    payload = {
        "organizationId": "invalid_org_id",
        "extractedData": MOCK_EXTRACTED_DATA,
        "confidenceScore": 50
    }
    r = requests.post(f"{BASE_URL}/api/ai/recommend", json=payload, timeout=30)
    # Should return 200 with fallback, not 500
    assert r.status_code == 200, f"Should not crash on invalid org_id, got {r.status_code}"


# ══════════════════════════════════════════════════════════════
# RUN ALL TESTS
# ══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("\n" + "═" * 60)
    print("  EcoSphere AI Intelligence Layer — Integration Tests")
    print(f"  Target: {BASE_URL}")
    print("═" * 60 + "\n")

    print("📡 Connectivity & Health")
    test("Health endpoint responds", test_health)

    print("\n🔍 Document Processing")
    test("Validate with mock extracted data", test_validate_with_mock_data)
    test("Validate missing file (graceful fallback)", test_validate_missing_file_graceful)

    print("\n📊 Confidence Engine")
    test("Confidence score calculation", test_confidence_calculation)

    print("\n🌱 Carbon Intelligence")
    test("Carbon prediction (Scope 1/2/3)", test_carbon_prediction)

    print("\n💡 Recommendation Engine")
    test("Generate ESG recommendations", test_recommendations_generation)
    test("Invalid org ID graceful fallback", test_invalid_org_id_graceful)

    print("\n🏛️  Governance Agent")
    test("Governance compliance analysis", test_governance_analysis)

    print("\n🤝 CSR Verification")
    test("CSR activity verification", test_csr_verification)

    print("\n🧠 RAG / Chat")
    test("RAG chat answer generation", test_chat_rag)

    print("\n📈 Pipeline Status")
    test("Status endpoint", test_status_endpoint)
    test("Process document trigger", test_process_document_trigger)

    print("\n" + "═" * 60)
    passed = sum(1 for r, _ in results if r == PASS)
    failed = sum(1 for r, _ in results if r == FAIL)
    total = len(results)
    print(f"  Results: {passed}/{total} passed  |  {failed} failed")
    print("═" * 60 + "\n")

    if failed > 0:
        print("Failed tests:")
        for r, name in results:
            if r == FAIL:
                print(f"  {r} {name}")
        sys.exit(1)
    else:
        print("  🎉 All tests passed!\n")
        sys.exit(0)
