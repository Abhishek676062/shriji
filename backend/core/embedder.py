"""
backend/core/embedder.py
━━━━━━━━━━━━━━━━━━━━━━━
Gemini embedding module for Shriji.

Uses gemini-embedding-001 (768-dim) for all vector operations.
Includes Upstash Redis caching for query embeddings (24h TTL).
"""

import hashlib
import json
import os
import time
from typing import Optional

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# ── Gemini setup ──────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
genai.configure(api_key=GEMINI_API_KEY)

EMBEDDING_MODEL = "models/gemini-embedding-001"  # 3072-dim

# ── Upstash Redis (optional cache) ────────────────────────────────────────────
_redis_client = None


def _get_redis():
    """Lazy-init Upstash Redis client."""
    global _redis_client
    if _redis_client is None:
        url = os.getenv("UPSTASH_REDIS_URL", "")
        token = os.getenv("UPSTASH_REDIS_TOKEN", "")
        if url and token:
            try:
                from upstash_redis import Redis
                _redis_client = Redis(url=url, token=token)
            except Exception:
                _redis_client = None  # Cache disabled gracefully
    return _redis_client


# ── Core embedding functions ──────────────────────────────────────────────────

def embed_query(text: str) -> list[float]:
    """
    Embed a user query for retrieval.
    task_type='retrieval_query' — optimised for question/query text.
    Returns a 768-dimensional float vector.
    """
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_query",
    )
    return result["embedding"]


def embed_document(text: str) -> list[float]:
    """
    Embed a document (verse) for indexing.
    task_type='retrieval_document' — optimised for passage/document text.
    Returns a 768-dimensional float vector.
    """
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_document",
    )
    return result["embedding"]


def embed_query_cached(text: str) -> list[float]:
    """
    Embed a query with Redis caching.

    Cache key: 'emb:<md5_of_text>'
    TTL: 86400 seconds (24 hours)

    Falls back to direct Gemini call if Redis is unavailable.
    """
    # Compute cache key
    key = "emb:" + hashlib.md5(text.encode()).hexdigest()

    redis = _get_redis()
    if redis:
        try:
            cached = redis.get(key)
            if cached:
                return json.loads(cached)
        except Exception:
            pass  # Cache miss — proceed to API call

    # Call Gemini
    vector = embed_query(text)

    # Store in cache
    if redis:
        try:
            redis.set(key, json.dumps(vector), ex=86400)
        except Exception:
            pass  # Non-fatal — cache write failure is OK

    return vector


# ── Verse text builder ────────────────────────────────────────────────────────

def build_verse_text(verse: dict) -> str:
    """
    Build the rich text string to embed for a Gita verse.

    Concatenates all semantically important fields so the embedding captures
    the verse's meaning, emotional tone, themes, and domains.

    Format:
        <english> | <hindi> | <theme_tags> | <problem_domains> |
        <emotional_tags> | <commentary_en[:400]>
    """
    english = verse.get("english", "")
    hindi = verse.get("hindi", "")
    theme_tags = " ".join(verse.get("theme_tags", []))
    problem_domains = " ".join(verse.get("problem_domains", []))
    emotional_tags = " ".join(verse.get("emotional_tags", []))
    commentary_en = verse.get("commentary_en", "")[:400]

    parts = [english, hindi, theme_tags, problem_domains, emotional_tags, commentary_en]
    return " | ".join(p for p in parts if p.strip())
