"""
backend/core/rrf.py
━━━━━━━━━━━━━━━━━━━
Reciprocal Rank Fusion (RRF) reranking module.
Pure Python dict math, no API calls, ~1ms.
"""

from typing import List, Dict, Any


def rrf_rerank(
    dense_list: List[Dict[str, Any]],
    meta_list: List[Dict[str, Any]],
    bm25_list: List[Dict[str, Any]],
    k: int = 60,
    top_n: int = 5
) -> List[Dict[str, Any]]:
    """
    Rerank candidate documents using Reciprocal Rank Fusion.
    
    Formula: score(doc) = sum over lists of 1 / (k + rank)
    
    If a list is empty or doesn't have the doc, it contributes 0 for that list.
    
    Returns exactly top_n sorted document objects.
    """
    
    doc_map = {}
    
    # Helper to add docs to the map and compute their rank score
    def _add_ranks(ranked_list: List[Dict[str, Any]], weight: float = 1.0):
        # ranked_list should already be sorted descending by its respective signal
        for rank, doc in enumerate(ranked_list, start=1):
            doc_id = doc.get("id") or doc.get("chunk_id")
            if not doc_id:
                continue
                
            if doc_id not in doc_map:
                # Store the full doc payload the first time we see it
                # We prioritize metadata from the retrieved payload
                doc_map[doc_id] = {"doc": doc, "rrf_score": 0.0}
                
            score_contribution = weight / (k + rank)
            doc_map[doc_id]["rrf_score"] += score_contribution

    # Process all three lists
    _add_ranks(dense_list)
    _add_ranks(meta_list)
    _add_ranks(bm25_list)
    
    # Optional fallback if meta_list is empty (e.g. classifier failed or no matching tags).
    # The requirement says "add fallback: if meta_list is empty, use dense_list as both"
    # To keep it balanced, if meta_list is perfectly empty, we can just boost dense
    if not meta_list:
        _add_ranks(dense_list)
        
    # Extract, sort, and slice
    ranked_docs = list(doc_map.values())
    ranked_docs.sort(key=lambda x: x["rrf_score"], reverse=True)
    
    # Return the doc objects, injecting the final rrf_score 
    results = []
    for item in ranked_docs[:top_n]:
        doc = item["doc"].copy()
        doc["rrf_score"] = item["rrf_score"]
        results.append(doc)
        
    return results
