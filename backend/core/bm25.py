"""
backend/core/bm25.py
━━━━━━━━━━━━━━━━━━━━
BM25 Keyword Retrieval over the Gita Verses dataset.
Read JSON on module load, build BM25Okapi index.
"""

import json
import os
from rank_bm25 import BM25Okapi

# Module-level variables
CORPUS = []
BM25_INDEX = None
DOC_ID_MAP = {}

def load_index():
    """Load JSON and build the BM25 index."""
    global CORPUS, BM25_INDEX, DOC_ID_MAP
    
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "gita_verses_enhanced.json")
    try:
        with open(data_path, "r", encoding="utf-8") as f:
            CORPUS = json.load(f)
    except FileNotFoundError:
        print(f"⚠️ BM25 Data file not found: {data_path}")
        CORPUS = []
        return
        
    tokenized_corpus = []
    for i, verse in enumerate(CORPUS):
        # Tokenize english field by lowercase split
        text_en = verse.get("english", "").lower()
        tokens = text_en.split()
        tokenized_corpus.append(tokens)
        
        chunk_id = verse.get("chunk_id", f"verse_{i}")
        DOC_ID_MAP[chunk_id] = i
        
    BM25_INDEX = BM25Okapi(tokenized_corpus)
    print(f"✅ BM25 index built with {len(CORPUS)} verses.")

# Attempt to load immediately when module is imported
load_index()

def bm25_score(query: str, candidates: list) -> list:
    """
    Score the 700 verses against the query using BM25.
    Filter down to `candidates` chunk_ids only if candidates list provided.
    
    query: str e.g. "I am very angry what should I do"
    candidates: list of dicts with 'id' or 'chunk_id' fields
    
    Return sorted by BM25 score descending.
    """
    if BM25_INDEX is None or not CORPUS:
        return []
        
    # Tokenize query
    tokenized_query = query.lower().split()
    
    # Get all scores (fast operation since dataset is only 700 docs)
    doc_scores = BM25_INDEX.get_scores(tokenized_query)
    
    # Collect candidate IDs to filter
    candidate_ids = set()
    for c in candidates:
        c_id = c.get("id") or c.get("chunk_id")
        if c_id:
            candidate_ids.add(c_id)
            
    # Map back to objects
    scored_results = []
    for chunk_id in candidate_ids:
        idx = DOC_ID_MAP.get(chunk_id)
        if idx is not None:
            score = doc_scores[idx]
            if score > 0:
                # Build dict compatible with RRF
                scored_results.append({
                    "id": chunk_id,
                    "score": score,
                    "metadata": CORPUS[idx]
                })
                
    # Sort descending by score
    scored_results.sort(key=lambda x: x["score"], reverse=True)
    return scored_results
