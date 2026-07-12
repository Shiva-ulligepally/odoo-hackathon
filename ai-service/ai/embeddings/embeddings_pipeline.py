"""
EcoSphere AI - Embedding Pipeline (Module 8 / Step 5)
Chunks ESG documents, generates Gemini embeddings, and stores them in ChromaDB.
Supports deduplication and incremental updates.
"""
import logging
import hashlib
from typing import List, Optional
from datetime import datetime

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_chroma_client = None
_collection = None


def _get_chroma_collection():
    """Lazy-load ChromaDB client and collection."""
    global _chroma_client, _collection
    if _collection is not None:
        return _collection
    try:
        import chromadb
        from chromadb.config import Settings as ChromaSettings
        _chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        _collection = _chroma_client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION,
            metadata={"hnsw:space": "cosine"}
        )
        logger.info(f"ChromaDB collection ready: {settings.CHROMA_COLLECTION}")
        return _collection
    except Exception as e:
        logger.error(f"ChromaDB init failed: {e}")
        return None


def _chunk_text(text: str, chunk_size: int = None, overlap: int = None) -> List[str]:
    """Split text into overlapping chunks for embedding."""
    chunk_size = chunk_size or settings.MAX_CHUNK_SIZE
    overlap = overlap or settings.CHUNK_OVERLAP

    if not text or len(text.strip()) == 0:
        return []

    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk)
        if end >= len(words):
            break
        start += chunk_size - overlap
    return chunks


def _get_gemini_embedding(text: str) -> Optional[List[float]]:
    """Generate embedding using Gemini embedding model."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        result = genai.embed_content(
            model=settings.GEMINI_EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_document"
        )
        return result["embedding"]
    except Exception as e:
        logger.warning(f"Gemini embedding failed: {e}")
        return None


def _compute_chunk_id(document_id: str, chunk_index: int, text: str) -> str:
    """Compute a stable, unique ID for a chunk to enable deduplication."""
    content_hash = hashlib.md5(text.encode()).hexdigest()[:8]
    return f"{document_id}_chunk_{chunk_index}_{content_hash}"


def embed_document(
    document_id: str,
    organization_id: str,
    text: str,
    metadata: dict = None
) -> dict:
    """
    Chunk a document, generate embeddings, and store in ChromaDB.
    Skips chunks already stored (deduplication by ID).
    Returns embedding summary.
    """
    logger.info(f"Embedding document: {document_id}")

    if not text or not text.strip():
        return {"status": "skipped", "reason": "Empty document text", "chunks": 0}

    collection = _get_chroma_collection()
    if collection is None:
        return {"status": "failed", "reason": "ChromaDB unavailable", "chunks": 0}

    chunks = _chunk_text(text)
    if not chunks:
        return {"status": "skipped", "reason": "No chunks generated", "chunks": 0}

    base_metadata = {
        "document_id": document_id,
        "organization_id": organization_id,
        "embedded_at": datetime.utcnow().isoformat(),
        **(metadata or {})
    }

    stored = 0
    skipped = 0

    for i, chunk in enumerate(chunks):
        chunk_id = _compute_chunk_id(document_id, i, chunk)

        # Check for existing chunk (deduplication)
        try:
            existing = collection.get(ids=[chunk_id])
            if existing and existing.get("ids") and len(existing["ids"]) > 0:
                skipped += 1
                continue
        except Exception:
            pass

        # Generate embedding
        embedding = _get_gemini_embedding(chunk)

        chunk_meta = {**base_metadata, "chunk_index": i, "chunk_length": len(chunk)}

        try:
            if embedding:
                collection.add(
                    ids=[chunk_id],
                    embeddings=[embedding],
                    documents=[chunk],
                    metadatas=[chunk_meta]
                )
            else:
                # Store without embedding (text-only, will use ChromaDB's built-in)
                collection.add(
                    ids=[chunk_id],
                    documents=[chunk],
                    metadatas=[chunk_meta]
                )
            stored += 1
        except Exception as e:
            logger.warning(f"Failed to store chunk {chunk_id}: {e}")

    logger.info(f"Embedding complete: {stored} stored, {skipped} skipped (duplicates)")
    return {
        "status": "success",
        "document_id": document_id,
        "total_chunks": len(chunks),
        "stored": stored,
        "skipped_duplicates": skipped,
        "collection": settings.CHROMA_COLLECTION
    }


def delete_document_embeddings(document_id: str) -> bool:
    """Remove all embeddings for a document from ChromaDB."""
    collection = _get_chroma_collection()
    if collection is None:
        return False
    try:
        collection.delete(where={"document_id": document_id})
        logger.info(f"Deleted embeddings for document: {document_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to delete embeddings: {e}")
        return False


def get_collection_stats() -> dict:
    """Return ChromaDB collection statistics."""
    collection = _get_chroma_collection()
    if collection is None:
        return {"status": "unavailable", "count": 0}
    try:
        count = collection.count()
        return {"status": "healthy", "collection": settings.CHROMA_COLLECTION, "total_chunks": count}
    except Exception as e:
        return {"status": "error", "error": str(e), "count": 0}
