"""
EcoSphere AI Service - Main FastAPI Application
Port: 8000
All AI endpoints for EcoSphere ESG Intelligence Platform.
Integrates with Node.js backend via HTTP proxy gateway.
"""
import logging
import threading
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Any

from config import get_settings

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)
settings = get_settings()


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("EcoSphere AI Service starting...")
    try:
        from database import get_db
        db = get_db()
        if db is not None:
            logger.info("MongoDB connected successfully")
        else:
            logger.warning("MongoDB unavailable — running in offline mode")
    except Exception as e:
        logger.warning(f"DB init warning: {e}")
    yield
    logger.info("EcoSphere AI Service shutting down...")


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="EcoSphere AI Intelligence Service",
    description="Autonomous ESG AI Pipeline — OCR, Validation, Carbon Intelligence, RAG, Knowledge Graph, Governance, CSR, Recommendations, Executive Summary",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ──────────────────────────────────────────────────
class ProcessDocumentRequest(BaseModel):
    documentId: str
    organizationId: str
    userId: str
    fileUrl: str
    fileType: str
    fileName: str


class ValidateRequest(BaseModel):
    documentId: Optional[str] = None
    organizationId: str
    extractedData: Optional[dict] = None
    fileUrl: Optional[str] = None
    fileType: Optional[str] = "unknown"
    fileName: Optional[str] = "document"


class ConfidenceRequest(BaseModel):
    documentId: str
    organizationId: str
    extractedData: Optional[dict] = None
    validationResult: Optional[dict] = None


class PredictRequest(BaseModel):
    organizationId: str
    extractedData: Optional[dict] = None


class RecommendRequest(BaseModel):
    organizationId: str
    carbonAnalysis: Optional[dict] = None
    governanceFindings: Optional[dict] = None
    csrResult: Optional[dict] = None
    validationResult: Optional[dict] = None
    confidenceScore: Optional[float] = 50.0


class GovernanceRequest(BaseModel):
    organizationId: str


class CSRRequest(BaseModel):
    organizationId: str
    documentText: Optional[str] = ""
    extractedData: Optional[dict] = None


class ChatRequest(BaseModel):
    question: str
    organizationId: Optional[str] = None
    nContextDocs: Optional[int] = 5


class AIResponse(BaseModel):
    success: bool
    data: Any
    message: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


def _ok(data: Any, message: str = "Success") -> dict:
    return {"success": True, "data": data, "message": message, "timestamp": datetime.utcnow().isoformat()}


def _err(message: str, data: Any = None) -> dict:
    return {"success": False, "data": data or {}, "message": message, "timestamp": datetime.utcnow().isoformat()}


# ── Health ─────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    from database import get_db
    from ai.embeddings.embeddings_pipeline import get_collection_stats
    db = get_db()
    chroma = get_collection_stats()
    return _ok({
        "service": "EcoSphere AI Intelligence Service",
        "version": "1.0.0",
        "gemini": "configured" if settings.GEMINI_API_KEY else "missing_api_key",
        "mongodb": "connected" if db is not None else "disconnected",
        "chromadb": chroma.get("status", "unknown"),
        "chroma_chunks": chroma.get("total_chunks", 0),
        "environment": settings.ENVIRONMENT
    }, "EcoSphere AI Service is healthy")


# ── POST /api/ai/process-document ─────────────────────────────────────────────
@app.post("/api/ai/process-document")
def process_document(req: ProcessDocumentRequest, background_tasks: BackgroundTasks):
    """
    Triggered automatically by Node.js upload service.
    Runs the full AI pipeline in a background thread.
    """
    from ai.agents.orchestrator import _init_status

    _init_status(req.documentId)
    logger.info(f"Received process-document trigger for {req.documentId}")

    def run_pipeline():
        from ai.agents.orchestrator import run_full_pipeline
        try:
            run_full_pipeline(
                document_id=req.documentId,
                organization_id=req.organizationId,
                user_id=req.userId,
                file_url=req.fileUrl,
                file_type=req.fileType,
                file_name=req.fileName
            )
        except Exception as e:
            logger.error(f"Pipeline thread error: {e}")

    thread = threading.Thread(target=run_pipeline, daemon=True)
    thread.start()

    return _ok(
        {"documentId": req.documentId, "status": "pipeline_started"},
        "AI pipeline started in background. Use GET /api/ai/status?documentId=... to track progress."
    )


# ── GET /api/ai/status ─────────────────────────────────────────────────────────
@app.get("/api/ai/status")
def get_status(documentId: Optional[str] = None):
    """Return pipeline processing status (Step 14)."""
    from ai.agents.orchestrator import get_pipeline_status, _pipeline_status

    if documentId:
        status = get_pipeline_status(documentId)
    else:
        # Return all active pipelines summary
        status = {
            "active_pipelines": len(_pipeline_status),
            "pipelines": [
                {
                    "document_id": did,
                    "overall_progress": s.get("overall_progress"),
                    "started_at": s.get("started_at"),
                    "completed_at": s.get("completed_at")
                }
                for did, s in list(_pipeline_status.items())[-5:]
            ]
        }
    return _ok(status, "Pipeline status retrieved")


# ── POST /api/ai/validate ──────────────────────────────────────────────────────
@app.post("/api/ai/validate")
def validate(req: ValidateRequest):
    """Run OCR extraction + Data Validation on a document."""
    try:
        extracted = req.extractedData
        if not extracted and req.fileUrl:
            from ai.ocr.ocr_engine import process_document
            extracted = process_document(req.fileUrl, req.fileName or "document", req.fileType or "unknown")
            extracted.pop("_raw_text", None)

        if not extracted:
            extracted = {"document_type": "unknown", "extraction_confidence": 0}

        from ai.validation.validator import validate_extracted_data
        result = validate_extracted_data(extracted, req.organizationId)
        return _ok({
            "extracted_data": extracted,
            "validation": result,
            "document_id": req.documentId,
            "organization_id": req.organizationId,
            "timestamp": datetime.utcnow().isoformat()
        }, "Validation complete")
    except Exception as e:
        logger.error(f"/validate error: {e}")
        return _err(f"Validation failed: {str(e)}")


# ── POST /api/ai/confidence ────────────────────────────────────────────────────
@app.post("/api/ai/confidence")
def confidence(req: ConfidenceRequest):
    """Calculate confidence score for a submitted document."""
    try:
        from ai.utils.confidence_engine import calculate_confidence
        result = calculate_confidence(
            extracted_data=req.extractedData or {},
            validation_result=req.validationResult or {},
            organization_id=req.organizationId,
            document_id=req.documentId,
            uploaded_date=datetime.utcnow().isoformat()
        )
        return _ok(result, "Confidence score calculated")
    except Exception as e:
        logger.error(f"/confidence error: {e}")
        return _err(f"Confidence calculation failed: {str(e)}")


# ── POST /api/ai/predict ───────────────────────────────────────────────────────
@app.post("/api/ai/predict")
def predict(req: PredictRequest):
    """Carbon Intelligence: Scope 1/2/3 + forecast + strategies."""
    try:
        from ai.agents.carbon_intelligence import analyze_carbon
        result = analyze_carbon(req.organizationId, req.extractedData)
        return _ok(result, "Carbon prediction complete")
    except Exception as e:
        logger.error(f"/predict error: {e}")
        return _err(f"Carbon prediction failed: {str(e)}")


# ── POST /api/ai/recommend ─────────────────────────────────────────────────────
@app.post("/api/ai/recommend")
def recommend(req: RecommendRequest):
    """Generate and persist ESG recommendations."""
    try:
        from ai.recommendations.recommendation_engine import generate_recommendations
        result = generate_recommendations(
            organization_id=req.organizationId,
            carbon_analysis=req.carbonAnalysis,
            governance_findings=req.governanceFindings,
            csr_result=req.csrResult,
            validation_result=req.validationResult,
            confidence_score=req.confidenceScore or 50.0
        )
        return _ok(result, "Recommendations generated")
    except Exception as e:
        logger.error(f"/recommend error: {e}")
        return _err(f"Recommendation generation failed: {str(e)}")


# ── POST /api/ai/governance ────────────────────────────────────────────────────
@app.post("/api/ai/governance")
def governance(req: GovernanceRequest):
    """Governance & compliance analysis."""
    try:
        from ai.agents.governance import analyze_governance
        result = analyze_governance(req.organizationId)
        return _ok(result, "Governance analysis complete")
    except Exception as e:
        logger.error(f"/governance error: {e}")
        return _err(f"Governance analysis failed: {str(e)}")


# ── POST /api/ai/csr ───────────────────────────────────────────────────────────
@app.post("/api/ai/csr")
def csr(req: CSRRequest):
    """CSR verification and scoring."""
    try:
        from ai.agents.csr_verification import verify_csr
        result = verify_csr(req.organizationId, req.documentText or "", req.extractedData)
        return _ok(result, "CSR verification complete")
    except Exception as e:
        logger.error(f"/csr error: {e}")
        return _err(f"CSR verification failed: {str(e)}")


# ── POST /api/ai/chat ──────────────────────────────────────────────────────────
@app.post("/api/ai/chat")
def chat(req: ChatRequest):
    """RAG-powered ESG Q&A with ChromaDB context retrieval."""
    try:
        from ai.rag.rag_pipeline import answer_question
        result = answer_question(
            question=req.question,
            organization_id=req.organizationId,
            n_context_docs=req.nContextDocs
        )
        return _ok(result, "RAG answer generated")
    except Exception as e:
        logger.error(f"/chat error: {e}")
        return _err(f"Chat failed: {str(e)}")


# ── Run directly ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
