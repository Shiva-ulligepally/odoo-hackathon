"""
EcoSphere AI - RAG Pipeline (Module 9 / Step 6)
Retrieves relevant ESG document chunks from ChromaDB using Gemini embeddings
and generates grounded, explainable answers via Gemini 1.5 Flash/Pro.
Never answers directly from LLM — always retrieves context first.
"""
import logging
import json
import re
from datetime import datetime
from typing import List, Optional

from config import get_settings
from ai.prompts.prompt_templates import RAG_ANSWER_PROMPT
from ai.utils.fallbacks import fallback_rag_answer

logger = logging.getLogger(__name__)
settings = get_settings()

_chroma_client = None
_collection = None
_gemini_model = None


def _get_collection():
    global _chroma_client, _collection
    if _collection is not None:
        return _collection
    try:
        import chromadb
        _chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        _collection = _chroma_client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION,
            metadata={"hnsw:space": "cosine"}
        )
        return _collection
    except Exception as e:
        logger.error(f"ChromaDB unavailable in RAG: {e}")
        return None


def _get_gemini():
    global _gemini_model
    if _gemini_model is None:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            _gemini_model = genai.GenerativeModel(settings.GEMINI_MODEL)
        except Exception as e:
            logger.error(f"Gemini init failed in RAG: {e}")
    return _gemini_model


def _get_query_embedding(query: str) -> Optional[List[float]]:
    """Generate query embedding for similarity search."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        result = genai.embed_content(
            model=settings.GEMINI_EMBEDDING_MODEL,
            content=query,
            task_type="retrieval_query"
        )
        return result["embedding"]
    except Exception as e:
        logger.warning(f"Query embedding failed: {e}")
        return None


def _clean_json(text: str) -> dict:
    cleaned = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r'\s*```$', '', cleaned, flags=re.MULTILINE)
    try:
        return json.loads(cleaned)
    except Exception:
        return {}


def retrieve_context(
    query: str,
    organization_id: str = None,
    n_results: int = None
) -> List[dict]:
    """
    Retrieve the most relevant document chunks from ChromaDB for a query.
    Filters by organization if provided.
    """
    collection = _get_collection()
    if collection is None:
        return []

    n_results = n_results or settings.MAX_RETRIEVAL_DOCS

    try:
        query_embedding = _get_query_embedding(query)

        where_filter = None
        if organization_id:
            where_filter = {"organization_id": organization_id}

        if query_embedding:
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(n_results, max(collection.count(), 1)),
                where=where_filter,
                include=["documents", "metadatas", "distances"]
            )
        else:
            # Fallback: text-based query
            results = collection.query(
                query_texts=[query],
                n_results=min(n_results, max(collection.count(), 1)),
                where=where_filter,
                include=["documents", "metadatas", "distances"]
            )

        if not results or not results.get("documents"):
            return []

        chunks = []
        docs = results["documents"][0] if results["documents"] else []
        metas = results["metadatas"][0] if results["metadatas"] else []
        dists = results["distances"][0] if results.get("distances") else []

        for i, (doc, meta) in enumerate(zip(docs, metas)):
            relevance = 1 - (dists[i] if dists else 0.5)  # Convert distance to similarity
            chunks.append({
                "text": doc,
                "document_id": meta.get("document_id", "unknown"),
                "organization_id": meta.get("organization_id", ""),
                "chunk_index": meta.get("chunk_index", i),
                "relevance_score": round(relevance, 4),
                "embedded_at": meta.get("embedded_at", "")
            })

        logger.info(f"Retrieved {len(chunks)} relevant chunks for query: '{query[:60]}...'")
        return chunks

    except Exception as e:
        logger.error(f"ChromaDB retrieval failed: {e}")
        return []


def answer_question(
    question: str,
    organization_id: str = None,
    n_context_docs: int = None
) -> dict:
    """
    Main RAG entry point: retrieve context → generate grounded answer via Gemini.
    Every answer includes: answer, evidence, confidence, referenced_documents, reasoning.
    """
    logger.info(f"RAG query: '{question[:80]}'")

    # Step 1: Retrieve context
    context_chunks = retrieve_context(question, organization_id, n_context_docs)

    if not context_chunks:
        logger.warning("No context chunks found in ChromaDB")
        if not settings.GEMINI_API_KEY:
            return fallback_rag_answer(question)
        # Still try Gemini with empty context
        context_text = "No documents have been uploaded yet for this organization."
    else:
        context_text = "\n\n".join([
            f"[Doc {c['document_id']}, chunk {c['chunk_index']}, relevance: {c['relevance_score']}]:\n{c['text']}"
            for c in context_chunks
        ])

    model = _get_gemini()
    if model is None:
        return fallback_rag_answer(question)

    try:
        prompt = RAG_ANSWER_PROMPT.format(
            question=question,
            context=context_text[:6000]
        )
        response = model.generate_content(prompt)
        result = _clean_json(response.text)

        if not result:
            raise ValueError("Empty RAG response from Gemini")

        # Enrich with retrieval metadata
        result["retrieved_chunks"] = len(context_chunks)
        result.setdefault("timestamp", datetime.utcnow().isoformat())
        result.setdefault("referenced_documents", [c["document_id"] for c in context_chunks])

        logger.info(f"RAG answer generated. Confidence: {result.get('confidence')}")
        return result

    except Exception as e:
        logger.error(f"RAG generation failed: {e}")
        return fallback_rag_answer(question)
