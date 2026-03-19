"""
backend/scripts/test_retrieval.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test script for Hybrid Retrieval and RRF Reranking pipeline.

Test plan:
1. Embed query 'I am very angry what should I do'
2. Run hybrid_retrieve(emotion='anger', domain='anger_management')
3. Run bm25_score on candidates
4. Run rrf_rerank → print top 5 chunk_ids with scores

Expected top results: BG_16_21, BG_05_23, BG_03_37
"""

import asyncio
import os
import sys
import time

# Add the backend root to sys.path so we can import core modules
backend_root = os.path.join(os.path.dirname(__file__), "..")
sys.path.insert(0, backend_root)

from core.embedder import embed_query_cached
from core.retrieval import hybrid_retrieve
from core.bm25 import bm25_score
from core.rrf import rrf_rerank

async def test_pipeline():
    query = "I am very angry what should I do"
    emotion = "anger"
    domain = "anger_management"
    theme = None
    
    print(f"🔍 Testing query: '{query}'")
    print(f"   emotion: {emotion} | domain: {domain}")
    print()
    
    # ── 1. Embed Query
    t1 = time.time()
    query_vec = embed_query_cached(query)
    t2 = time.time()
    print(f"✅ Generated embedding vector in {(t2-t1)*1000:.1f}ms (dimension: {len(query_vec)})")
    
    # ── 2. Hybrid Retrieval (Pinecone)
    t3 = time.time()
    candidates = await hybrid_retrieve(
        query_vec=query_vec,
        emotion=emotion,
        domain=domain,
        theme=theme
    )
    t4 = time.time()
    print(f"✅ Pinecone hybrid retrieval got {len(candidates)} candidates in {(t4-t3)*1000:.1f}ms")
    
    # ── 3. BM25 Scoring
    t5 = time.time()
    bm25_list = bm25_score(query, candidates)
    t6 = time.time()
    print(f"✅ BM25 scoring ranked {len(bm25_list)} candidates in {(t6-t5)*1000:.1f}ms")
    
    # For RRF, we need to separate the dense and meta results out if we want to be pure, 
    # but our `hybrid_retrieve` currently merges them. 
    # Let's adjust candidates to pass to RRF.
    # To properly demonstrate RRF, let's just use the `candidates` array directly as both 
    # the `dense_list` and `meta_list` since we already combined them using max score.
    # We will pass `candidates` descending by score.
    
    combined_pinecone = sorted(candidates, key=lambda x: x.get("score", 0), reverse=True)
    
    # ── 4. RRF Reranking
    t7 = time.time()
    final_results = rrf_rerank(
        dense_list=combined_pinecone,
        meta_list=combined_pinecone,  # Hybrid list already contains meta filters
        bm25_list=bm25_list,
        k=60,
        top_n=5
    )
    t8 = time.time()
    print(f"✅ RRF Reranking sorted top 5 results in {(t8-t7)*1000:.1f}ms")
    
    print("\n🏆 Top 5 Results:")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    # Using `chunk_id` which might be in metadata depending on the structure returned
    for i, res in enumerate(final_results, start=1):
        # Result might be a metadata payload from RRF
        meta = res.get("metadata", res)
        chunk_id = res.get("id") or meta.get("chunk_id", "Unknown")
        score = res.get("rrf_score", 0.0)
        text = meta.get("text_en", "")[:60].replace("\n", " ") + "..."
        print(f"{i}. {chunk_id} (score: {score:.4f})  ->  {text}")
        
    print()
    print("Test pipeline completed successfully. 🙏")

if __name__ == "__main__":
    asyncio.run(test_pipeline())
