"""
EcoSphere AI Service - Database Module
Handles MongoDB connection and collection references shared with the Node.js backend.
"""
import logging
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_client: MongoClient = None
_db = None


def get_db():
    """Get the MongoDB database instance (lazy singleton)."""
    global _client, _db
    if _db is None:
        try:
            _client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
            _client.admin.command("ping")
            _db = _client[settings.MONGODB_DB_NAME]
            logger.info(f"MongoDB connected: {settings.MONGODB_URI}")
        except ConnectionFailure as e:
            logger.error(f"MongoDB connection failed: {e}")
            _db = None
    return _db


def get_collection(name: str):
    """Get a MongoDB collection by name."""
    db = get_db()
    if db is None:
        return None
    return db[name]


def save_ai_reasoning(agent: str, input_summary: str, decision: str, reason: str, confidence: float, document_id: str = None):
    """Save AI reasoning log to the AIReasoning collection (Step 15)."""
    try:
        col = get_collection("aireasoning")
        if col is None:
            return None
        doc = {
            "agent": agent,
            "input": input_summary,
            "decision": decision,
            "reason": reason,
            "confidence": confidence,
            "documentId": document_id,
            "timestamp": datetime.utcnow()
        }
        result = col.insert_one(doc)
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"Failed to save AI reasoning log: {e}")
        return None


def save_confidence_score(organization_id: str, target_id: str, target_model: str, score: float, factors: list, reasoning: str):
    """Save calculated confidence score to the ConfidenceScore collection."""
    try:
        col = get_collection("confidencescores")
        if col is None:
            return None
        doc = {
            "organization": ObjectId(organization_id),
            "targetModel": target_model,
            "targetId": ObjectId(target_id),
            "score": score,
            "factors": factors,
            "verifiedByAI": True,
            "reasoning": reasoning,
            "lastCalculated": datetime.utcnow()
        }
        result = col.insert_one(doc)
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"Failed to save confidence score: {e}")
        return None


def save_ai_recommendation(organization_id: str, rec_type: str, title: str, description: str,
                           co2_savings: float, financial_savings: float, confidence: float,
                           priority: str = "medium", department: str = None, evidence: str = None):
    """Save AI recommendation to the AIRecommendation collection."""
    try:
        col = get_collection("airecommendations")
        if col is None:
            return None

        # Map priority to valid enum values
        rec_type_map = {
            "carbon": "Carbon Reduction",
            "energy": "Energy Efficiency",
            "waste": "Waste Optimization",
            "compliance": "Compliance Risk",
        }
        mapped_type = rec_type_map.get(rec_type.lower(), "Carbon Reduction")

        doc = {
            "organization": ObjectId(organization_id),
            "recommendationType": mapped_type,
            "title": title,
            "description": description,
            "potentialSavingsCo2e": co2_savings,
            "potentialFinancialSavings": financial_savings,
            "confidenceScore": confidence,
            "priority": priority,
            "affectedDepartment": department,
            "evidenceUsed": evidence,
            "status": "New",
            "createdAt": datetime.utcnow()
        }
        result = col.insert_one(doc)
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"Failed to save AI recommendation: {e}")
        return None


def update_document_status(document_id: str, status: str):
    """Update UploadedDocument verification status after AI processing."""
    try:
        col = get_collection("uploadeddocuments")
        if col is None:
            return
        col.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {"verificationStatus": status}}
        )
    except Exception as e:
        logger.error(f"Failed to update document status: {e}")


def log_activity(user_id: str, org_id: str, action: str, details: str):
    """Log an activity to the ActivityLog collection."""
    try:
        col = get_collection("activitylogs")
        if col is None:
            return
        col.insert_one({
            "user": ObjectId(user_id) if user_id else None,
            "organization": ObjectId(org_id) if org_id else None,
            "action": action,
            "details": details,
            "createdAt": datetime.utcnow()
        })
    except Exception as e:
        logger.error(f"Failed to log activity: {e}")
