"""
EcoSphere AI - Master AI Orchestrator (Step 1 & 2)
Controls sequential agent execution with shared memory (pipeline context).
Each agent's output is stored and reused by subsequent agents.
If any agent fails, the pipeline continues with graceful fallback.

Pipeline order:
  1. OCR / Document Extraction
  2. Data Validation Agent
  3. Knowledge Graph Update
  4. Embedding Generator → ChromaDB
  5. Confidence Engine
  6. Carbon Intelligence Agent
  7. Governance Agent
  8. CSR Verification Agent
  9. Recommendation Engine
  10. Executive Decision Agent
  11. Persist everything → MongoDB
"""
import logging
import asyncio
from datetime import datetime
from typing import Optional

from database import (
    save_ai_reasoning, update_document_status,
    log_activity, get_db
)

logger = logging.getLogger(__name__)

# ── In-memory pipeline status store (per document_id) ─────────────────────────
# In production this would be Redis; for hackathon demo an in-process dict is fine.
_pipeline_status: dict[str, dict] = {}


def _init_status(document_id: str) -> dict:
    status = {
        "document_id": document_id,
        "started_at": datetime.utcnow().isoformat(),
        "completed_at": None,
        "overall_progress": 0,
        "stages": {
            "ocr":             {"status": "pending", "progress": 0, "result": None, "error": None},
            "validation":      {"status": "pending", "progress": 0, "result": None, "error": None},
            "knowledge_graph": {"status": "pending", "progress": 0, "result": None, "error": None},
            "embedding":       {"status": "pending", "progress": 0, "result": None, "error": None},
            "confidence":      {"status": "pending", "progress": 0, "result": None, "error": None},
            "carbon":          {"status": "pending", "progress": 0, "result": None, "error": None},
            "governance":      {"status": "pending", "progress": 0, "result": None, "error": None},
            "csr":             {"status": "pending", "progress": 0, "result": None, "error": None},
            "recommendations": {"status": "pending", "progress": 0, "result": None, "error": None},
            "executive":       {"status": "pending", "progress": 0, "result": None, "error": None},
        }
    }
    _pipeline_status[document_id] = status
    return status


def _update_stage(document_id: str, stage: str, status: str, progress: int,
                  result=None, error: str = None):
    if document_id not in _pipeline_status:
        _init_status(document_id)
    s = _pipeline_status[document_id]
    s["stages"][stage]["status"] = status
    s["stages"][stage]["progress"] = progress
    if result is not None:
        s["stages"][stage]["result"] = result
    if error:
        s["stages"][stage]["error"] = error
    # Recompute overall progress
    stages = s["stages"]
    completed = sum(1 for v in stages.values() if v["status"] == "completed")
    s["overall_progress"] = round((completed / len(stages)) * 100)


def _log_reasoning(agent: str, input_summary: str, decision: str,
                   reason: str, confidence: float, document_id: str):
    """Persist AI reasoning to AIReasoning MongoDB collection (Step 15)."""
    try:
        save_ai_reasoning(
            agent=agent,
            input_summary=input_summary,
            decision=decision,
            reason=reason,
            confidence=confidence,
            document_id=document_id
        )
    except Exception as e:
        logger.warning(f"Reasoning log failed for {agent}: {e}")


def get_pipeline_status(document_id: str) -> dict:
    """Return current pipeline status for a document (Step 14)."""
    return _pipeline_status.get(document_id, {"error": "No pipeline found for this document_id"})


def run_full_pipeline(
    document_id: str,
    organization_id: str,
    user_id: str,
    file_url: str,
    file_type: str,
    file_name: str
) -> dict:
    """
    Execute the full AI pipeline synchronously.
    Called via background task from the upload trigger.
    Returns the complete pipeline result (shared memory context).
    """
    logger.info(f"=== AI PIPELINE START: doc={document_id} org={organization_id} ===")
    status = _init_status(document_id)

    # Shared memory context — passed between agents
    ctx = {
        "document_id": document_id,
        "organization_id": organization_id,
        "user_id": user_id,
        "file_url": file_url,
        "file_type": file_type,
        "file_name": file_name,
        "extracted_data": None,
        "validation_result": None,
        "graph_result": None,
        "embedding_result": None,
        "confidence_result": None,
        "carbon_analysis": None,
        "governance_findings": None,
        "csr_result": None,
        "recommendations": None,
        "executive_summary": None,
        "pipeline_errors": []
    }

    # ── STAGE 1: OCR ───────────────────────────────────────────────────────────
    _update_stage(document_id, "ocr", "running", 10)
    try:
        from ai.ocr.ocr_engine import process_document
        ctx["extracted_data"] = process_document(file_url, file_name, file_type)
        raw_text = ctx["extracted_data"].pop("_raw_text", "")
        _update_stage(document_id, "ocr", "completed", 100, {
            "doc_type": ctx["extracted_data"].get("document_type"),
            "confidence": ctx["extracted_data"].get("extraction_confidence")
        })
        _log_reasoning("OCR Engine", f"file={file_name}", "Extracted structured data",
                       ctx["extracted_data"].get("extraction_notes", "OK"),
                       ctx["extracted_data"].get("extraction_confidence", 0.5), document_id)
        logger.info(f"[OCR] ✓ doc_type={ctx['extracted_data'].get('document_type')}")
    except Exception as e:
        raw_text = ""
        logger.error(f"[OCR] ✗ {e}")
        ctx["pipeline_errors"].append(f"OCR: {e}")
        from ai.utils.fallbacks import fallback_extraction
        ctx["extracted_data"] = fallback_extraction("", file_type)
        _update_stage(document_id, "ocr", "fallback", 100, error=str(e))

    # ── STAGE 2: Validation ────────────────────────────────────────────────────
    _update_stage(document_id, "validation", "running", 10)
    try:
        from ai.validation.validator import validate_extracted_data
        ctx["validation_result"] = validate_extracted_data(ctx["extracted_data"], organization_id)
        _update_stage(document_id, "validation", "completed", 100, {
            "is_valid": ctx["validation_result"].get("is_valid"),
            "score": ctx["validation_result"].get("validation_score"),
            "errors": len(ctx["validation_result"].get("errors", [])),
            "warnings": len(ctx["validation_result"].get("warnings", []))
        })
        _log_reasoning("Validation Agent",
                       f"doc_type={ctx['extracted_data'].get('document_type')}",
                       ctx["validation_result"].get("recommended_action", "review"),
                       ctx["validation_result"].get("reason", ""),
                       ctx["validation_result"].get("confidence", 0.5), document_id)
        logger.info(f"[Validation] ✓ valid={ctx['validation_result'].get('is_valid')}")
    except Exception as e:
        logger.error(f"[Validation] ✗ {e}")
        ctx["pipeline_errors"].append(f"Validation: {e}")
        from ai.utils.fallbacks import fallback_validation
        ctx["validation_result"] = fallback_validation(ctx["extracted_data"])
        _update_stage(document_id, "validation", "fallback", 100, error=str(e))

    # ── STAGE 3: Knowledge Graph ───────────────────────────────────────────────
    _update_stage(document_id, "knowledge_graph", "running", 10)
    try:
        from ai.graph.knowledge_graph import build_graph_for_organization
        ctx["graph_result"] = build_graph_for_organization(organization_id)
        _update_stage(document_id, "knowledge_graph", "completed", 100, {
            "nodes": ctx["graph_result"].get("nodes"),
            "edges": ctx["graph_result"].get("edges")
        })
        _log_reasoning("Knowledge Graph", f"org={organization_id}",
                       f"Built graph: {ctx['graph_result'].get('nodes')} nodes",
                       "Mapped entity relationships from MongoDB collections",
                       0.9, document_id)
        logger.info(f"[KGraph] ✓ nodes={ctx['graph_result'].get('nodes')} edges={ctx['graph_result'].get('edges')}")
    except Exception as e:
        logger.error(f"[KGraph] ✗ {e}")
        ctx["pipeline_errors"].append(f"KnowledgeGraph: {e}")
        ctx["graph_result"] = {"nodes": 0, "edges": 0, "error": str(e)}
        _update_stage(document_id, "knowledge_graph", "fallback", 100, error=str(e))

    # ── STAGE 4: Embeddings ────────────────────────────────────────────────────
    _update_stage(document_id, "embedding", "running", 10)
    try:
        from ai.embeddings.embeddings_pipeline import embed_document
        embed_text = raw_text or ctx["extracted_data"].get("raw_summary", "")
        if not embed_text:
            embed_text = f"Document: {file_name}. Type: {ctx['extracted_data'].get('document_type')}."
        ctx["embedding_result"] = embed_document(
            document_id=document_id,
            organization_id=organization_id,
            text=embed_text,
            metadata={
                "file_name": file_name,
                "doc_type": ctx["extracted_data"].get("document_type", "unknown"),
                "organization_id": organization_id
            }
        )
        _update_stage(document_id, "embedding", "completed", 100, {
            "chunks_stored": ctx["embedding_result"].get("stored"),
            "chunks_skipped": ctx["embedding_result"].get("skipped_duplicates")
        })
        _log_reasoning("Embedding Pipeline", f"doc={document_id}",
                       f"Stored {ctx['embedding_result'].get('stored')} chunks",
                       "Document chunked and embedded into ChromaDB",
                       0.9, document_id)
        logger.info(f"[Embed] ✓ stored={ctx['embedding_result'].get('stored')} chunks")
    except Exception as e:
        logger.error(f"[Embed] ✗ {e}")
        ctx["pipeline_errors"].append(f"Embedding: {e}")
        ctx["embedding_result"] = {"status": "failed", "error": str(e)}
        _update_stage(document_id, "embedding", "fallback", 100, error=str(e))

    # ── STAGE 5: Confidence Engine ─────────────────────────────────────────────
    _update_stage(document_id, "confidence", "running", 10)
    try:
        from ai.utils.confidence_engine import calculate_confidence
        ctx["confidence_result"] = calculate_confidence(
            extracted_data=ctx["extracted_data"],
            validation_result=ctx["validation_result"],
            organization_id=organization_id,
            document_id=document_id,
            uploaded_date=datetime.utcnow().isoformat()
        )
        _update_stage(document_id, "confidence", "completed", 100, {
            "score": ctx["confidence_result"].get("confidence_score"),
            "status": ctx["confidence_result"].get("verification_status")
        })
        _log_reasoning("Confidence Engine", f"doc={document_id}",
                       f"Score={ctx['confidence_result'].get('confidence_score')}%",
                       ctx["confidence_result"].get("reason", ""),
                       ctx["confidence_result"].get("confidence_score", 50) / 100, document_id)
        logger.info(f"[Confidence] ✓ score={ctx['confidence_result'].get('confidence_score')}%")
    except Exception as e:
        logger.error(f"[Confidence] ✗ {e}")
        ctx["pipeline_errors"].append(f"Confidence: {e}")
        from ai.utils.fallbacks import fallback_confidence
        ctx["confidence_result"] = fallback_confidence(ctx["validation_result"], ctx["extracted_data"])
        _update_stage(document_id, "confidence", "fallback", 100, error=str(e))

    # ── STAGE 6: Carbon Intelligence ───────────────────────────────────────────
    _update_stage(document_id, "carbon", "running", 10)
    try:
        from ai.agents.carbon_intelligence import analyze_carbon
        ctx["carbon_analysis"] = analyze_carbon(organization_id, ctx["extracted_data"])
        total_co2 = ctx["carbon_analysis"].get("current_emissions", {}).get("total", 0)
        _update_stage(document_id, "carbon", "completed", 100, {
            "total_co2e": total_co2,
            "on_track": ctx["carbon_analysis"].get("vs_target", {}).get("on_track")
        })
        _log_reasoning("Carbon Intelligence", f"org={organization_id}",
                       f"Total CO2e={total_co2} MT",
                       ctx["carbon_analysis"].get("reason", ""),
                       ctx["carbon_analysis"].get("confidence", 0.5), document_id)
        logger.info(f"[Carbon] ✓ total_co2e={total_co2} MT CO2e")
    except Exception as e:
        logger.error(f"[Carbon] ✗ {e}")
        ctx["pipeline_errors"].append(f"Carbon: {e}")
        from ai.utils.fallbacks import fallback_carbon_analysis
        ctx["carbon_analysis"] = fallback_carbon_analysis([], [], {})
        _update_stage(document_id, "carbon", "fallback", 100, error=str(e))

    # ── STAGE 7: Governance ────────────────────────────────────────────────────
    _update_stage(document_id, "governance", "running", 10)
    try:
        from ai.agents.governance import analyze_governance
        ctx["governance_findings"] = analyze_governance(organization_id)
        _update_stage(document_id, "governance", "completed", 100, {
            "compliance_score": ctx["governance_findings"].get("compliance_score"),
            "risk_level": ctx["governance_findings"].get("risk_level")
        })
        _log_reasoning("Governance Agent", f"org={organization_id}",
                       f"Compliance={ctx['governance_findings'].get('compliance_score')}%",
                       ctx["governance_findings"].get("reason", ""),
                       ctx["governance_findings"].get("confidence", 0.5), document_id)
        logger.info(f"[Governance] ✓ compliance={ctx['governance_findings'].get('compliance_score')}%")
    except Exception as e:
        logger.error(f"[Governance] ✗ {e}")
        ctx["pipeline_errors"].append(f"Governance: {e}")
        ctx["governance_findings"] = {"compliance_score": 50, "risk_level": "unknown", "error": str(e)}
        _update_stage(document_id, "governance", "fallback", 100, error=str(e))

    # ── STAGE 8: CSR Verification ──────────────────────────────────────────────
    _update_stage(document_id, "csr", "running", 10)
    try:
        from ai.agents.csr_verification import verify_csr
        doc_text = ctx["extracted_data"].get("raw_summary", "")
        ctx["csr_result"] = verify_csr(organization_id, doc_text, ctx["extracted_data"])
        _update_stage(document_id, "csr", "completed", 100, {
            "csr_score": ctx["csr_result"].get("csr_score"),
            "verified_activities": ctx["csr_result"].get("verified_activities")
        })
        _log_reasoning("CSR Verification", f"org={organization_id}",
                       f"CSR Score={ctx['csr_result'].get('csr_score')}",
                       ctx["csr_result"].get("reason", ""),
                       ctx["csr_result"].get("confidence", 0.5), document_id)
        logger.info(f"[CSR] ✓ score={ctx['csr_result'].get('csr_score')}")
    except Exception as e:
        logger.error(f"[CSR] ✗ {e}")
        ctx["pipeline_errors"].append(f"CSR: {e}")
        ctx["csr_result"] = {"csr_score": 0, "error": str(e)}
        _update_stage(document_id, "csr", "fallback", 100, error=str(e))

    # ── STAGE 9: Recommendations ───────────────────────────────────────────────
    _update_stage(document_id, "recommendations", "running", 10)
    try:
        from ai.recommendations.recommendation_engine import generate_recommendations
        confidence_score = ctx["confidence_result"].get("confidence_score", 50) if ctx["confidence_result"] else 50
        ctx["recommendations"] = generate_recommendations(
            organization_id=organization_id,
            carbon_analysis=ctx["carbon_analysis"],
            governance_findings=ctx["governance_findings"],
            csr_result=ctx["csr_result"],
            validation_result=ctx["validation_result"],
            confidence_score=confidence_score
        )
        rec_count = len(ctx["recommendations"].get("recommendations", []))
        _update_stage(document_id, "recommendations", "completed", 100, {
            "count": rec_count,
            "trajectory": ctx["recommendations"].get("overall_esg_trajectory")
        })
        _log_reasoning("Recommendation Engine", f"org={organization_id}",
                       f"Generated {rec_count} recommendations",
                       ctx["recommendations"].get("reason", ""),
                       ctx["recommendations"].get("confidence", 0.5), document_id)
        logger.info(f"[Recs] ✓ generated {rec_count} recommendations")
    except Exception as e:
        logger.error(f"[Recs] ✗ {e}")
        ctx["pipeline_errors"].append(f"Recommendations: {e}")
        from ai.utils.fallbacks import fallback_recommendations
        ctx["recommendations"] = fallback_recommendations("Organization", ctx["carbon_analysis"], 50)
        _update_stage(document_id, "recommendations", "fallback", 100, error=str(e))

    # ── STAGE 10: Executive Summary ────────────────────────────────────────────
    _update_stage(document_id, "executive", "running", 10)
    try:
        from ai.agents.executive_decision import generate_executive_summary
        ctx["executive_summary"] = generate_executive_summary(
            organization_id=organization_id,
            carbon_analysis=ctx["carbon_analysis"],
            governance_findings=ctx["governance_findings"],
            csr_result=ctx["csr_result"],
            confidence_result=ctx["confidence_result"],
            recommendations=ctx["recommendations"],
            validation_result=ctx["validation_result"]
        )
        esg_est = ctx["executive_summary"].get("esg_score_estimate", {}).get("overall", "N/A")
        _update_stage(document_id, "executive", "completed", 100, {
            "esg_score_estimate": esg_est,
            "top_risks_count": len(ctx["executive_summary"].get("top_risks", []))
        })
        _log_reasoning("Executive Decision Agent", f"org={organization_id}",
                       f"ESG Score Estimate={esg_est}",
                       ctx["executive_summary"].get("reason", ""),
                       ctx["executive_summary"].get("confidence", 0.5), document_id)
        logger.info(f"[Executive] ✓ ESG estimate={esg_est}")
    except Exception as e:
        logger.error(f"[Executive] ✗ {e}")
        ctx["pipeline_errors"].append(f"Executive: {e}")
        from ai.utils.fallbacks import fallback_executive_summary
        confidence_score = ctx["confidence_result"].get("confidence_score", 50) if ctx["confidence_result"] else 50
        ctx["executive_summary"] = fallback_executive_summary("Organization", confidence_score, ctx["carbon_analysis"] or {})
        _update_stage(document_id, "executive", "fallback", 100, error=str(e))

    # ── FINALIZE ───────────────────────────────────────────────────────────────
    doc_status = "Verified" if not ctx["pipeline_errors"] else "Pending"
    try:
        update_document_status(document_id, doc_status)
    except Exception as e:
        logger.warning(f"Could not update document status: {e}")

    try:
        log_activity(
            user_id=user_id,
            org_id=organization_id,
            action="AI Pipeline Completed",
            details=f"Document {file_name} processed. Errors: {len(ctx['pipeline_errors'])}"
        )
    except Exception as e:
        logger.warning(f"Activity log failed: {e}")

    # Final status update
    _pipeline_status[document_id]["completed_at"] = datetime.utcnow().isoformat()
    _pipeline_status[document_id]["overall_progress"] = 100

    logger.info(f"=== AI PIPELINE COMPLETE: doc={document_id} errors={ctx['pipeline_errors']} ===")
    return ctx
