"""
backend/core/retrieval.py
━━━━━━━━━━━━━━━━━━━━━━━━━
Shriji's hybrid Pinecone retrieval module.
"""

import asyncio
import os
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX", "shriji-gita")

# Initialize Pinecone client
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX_NAME)


async def hybrid_retrieve(
    query_vec: List[float],
    emotion: Optional[str] = None,
    domain: Optional[str] = None,
    theme: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Run TWO Pinecone queries concurrently using asyncio.gather:
      (A) Dense search: vector=query_vec, top_k=20, no filters.
      (B) Metadata search: top_k=10, filtered by emotion or domain or theme.

    Returns deduplicated list of candidate dictionaries containing:
      {
         "id": str,
         "score": float,
         "metadata": dict
      }
    """
    
    # ── Dense search task ─────────────────────────────────────────────────────
    # We use asyncio.to_thread because the Pinecone Python client's query
    # method is synchronous.
    dense_task = asyncio.to_thread(
        index.query,
        vector=query_vec,
        top_k=20,
        include_metadata=True
    )

    # ── Metadata search task ──────────────────────────────────────────────────
    # Build a metadata filter ($or to broaden the candidate pool)
    filter_conditions = []
    if emotion:
        filter_conditions.append({"emotional_tags": {"$in": [emotion]}})
    if domain:
        filter_conditions.append({"problem_domains": {"$in": [domain]}})
    if theme:
        filter_conditions.append({"theme_tags": {"$in": [theme]}})

    meta_filter = None
    if filter_conditions:
        if len(filter_conditions) == 1:
            meta_filter = filter_conditions[0]
        else:
            meta_filter = {"$or": filter_conditions}

    if meta_filter:
        # Instead of dummy vectors which Pinecone doesn't always support cleanly
        # for standard dense endpoints, we use the actual query vector with the filter.
        meta_task = asyncio.to_thread(
            index.query,
            vector=query_vec,
            filter=meta_filter,
            top_k=10,
            include_metadata=True
        )
    else:
        # If no filters provided, we just don't run a second query.
        async def _empty():
            return {"matches": []}
        meta_task = _empty()

    # Run both queries concurrently
    dense_resp, meta_resp = await asyncio.gather(dense_task, meta_task)

    # ── Merge and deduplicate ─────────────────────────────────────────────────
    candidates = {}
    
    # Add dense matches
    for match in dense_resp.get("matches", []):
        doc_id = match.get("id")
        candidates[doc_id] = {
            "id": doc_id,
            "score": match.get("score", 0.0),
            "metadata": match.get("metadata", {})
        }

    # Add meta matches
    for match in meta_resp.get("matches", []):
        doc_id = match.get("id")
        if doc_id not in candidates:
            candidates[doc_id] = {
                "id": doc_id,
                "score": match.get("score", 0.0),
                "metadata": match.get("metadata", {})
            }
        else:
            # If it exists in both, we can optionally boost the score or just 
            # keep the max score. We'll keep max.
            current_score = candidates[doc_id]["score"]
            new_score = match.get("score", 0.0)
            candidates[doc_id]["score"] = max(current_score, new_score)

    return list(candidates.values())
