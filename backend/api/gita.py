"""
backend/api/gita.py
━━━━━━━━━━━━━━━━━━━
FastAPI Router for Gita Reader endpoints.
Reads directly from the in-memory CORPUS loaded at startup.
"""

import json
import os
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException

from core.bm25 import CORPUS
from models.schemas import ChapterSummary, VerseDetail

router = APIRouter(prefix="/api", tags=["Gita Reader"])

# ── Optional Redis Cache Setup ──
_redis_client = None
def _get_redis():
    global _redis_client
    if _redis_client is None:
        url = os.getenv("UPSTASH_REDIS_URL", "")
        token = os.getenv("UPSTASH_REDIS_TOKEN", "")
        if url and token:
            try:
                from upstash_redis import Redis
                _redis_client = Redis(url=url, token=token)
            except Exception:
                pass
    return _redis_client

# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("/gita/chapters", response_model=List[ChapterSummary])
async def get_chapters():
    """Return a list of all 18 chapters and their verse counts."""
    if not CORPUS:
        raise HTTPException(status_code=500, detail="Gita corpus not loaded")
        
    counts = {}
    titles = {}
    
    for verse in CORPUS:
        ch = verse.get("chapter")
        if not ch: continue
        counts[ch] = counts.get(ch, 0) + 1
        if ch not in titles:
            titles[ch] = verse.get("chapter_title", f"Chapter {ch}")
            
    # Sort and format
    chapters = []
    for ch in sorted(counts.keys()):
        chapters.append(ChapterSummary(
            chapter=ch,
            chapter_title=titles[ch],
            verse_count=counts[ch]
        ))
    return chapters


@router.get("/gita/chapter/{n}", response_model=List[VerseDetail])
async def get_chapter_verses(n: int):
    """Return all verses in chapter n."""
    if not CORPUS:
        raise HTTPException(status_code=500, detail="Gita corpus not loaded")
        
    verses = [v for v in CORPUS if v.get("chapter") == n]
    if not verses:
        raise HTTPException(status_code=404, detail=f"Chapter {n} not found")
        
    # Sort by verse number
    verses.sort(key=lambda x: x.get("verse_start", 0))
    return verses


@router.get("/gita/verse/{chunk_id}", response_model=VerseDetail)
async def get_verse_detail(chunk_id: str):
    """Return complete verse detail by chunk_id (e.g., 'BG_02_47')."""
    if not CORPUS:
        raise HTTPException(status_code=500, detail="Gita corpus not loaded")
        
    for verse in CORPUS:
        if verse.get("chunk_id") == chunk_id:
            return verse
            
    raise HTTPException(status_code=404, detail=f"Verse {chunk_id} not found")


@router.get("/gita/theme/{tag}", response_model=List[VerseDetail])
async def get_verses_by_theme(tag: str):
    """Return verses where theme_tags or problem_domains contain the tag."""
    if not CORPUS:
        raise HTTPException(status_code=500, detail="Gita corpus not loaded")
        
    tag = tag.lower()
    matches = []
    
    for verse in CORPUS:
        themes = [t.lower() for t in verse.get("theme_tags", [])]
        domains = [d.lower() for d in verse.get("problem_domains", [])]
        if tag in themes or tag in domains:
            matches.append(verse)
            
    return matches


@router.get("/gita/search", response_model=List[VerseDetail])
async def search_verses(q: str):
    """Simple text search over english, hindi, and theme tags."""
    if not CORPUS:
        raise HTTPException(status_code=500, detail="Gita corpus not loaded")
        
    q = q.lower().strip()
    if not q:
        return []
        
    matches = []
    for verse in CORPUS:
        en = verse.get("english", "").lower()
        hi = verse.get("hindi", "").lower()
        tags = " ".join(verse.get("theme_tags", [])).lower()
        
        if q in en or q in hi or q in tags:
            matches.append(verse)
            
    # Simple limit to avoid massive payloads
    return matches[:50]


@router.get("/daily-verse", response_model=VerseDetail)
async def get_daily_verse():
    """Return today's verse (day_of_year % 700) using Redis caching."""
    if not CORPUS:
        raise HTTPException(status_code=500, detail="Gita corpus not loaded")
        
    # Attempt cache
    day_str = datetime.utcnow().strftime("%Y-%m-%d")
    cache_key = f"daily_verse:{day_str}"
    
    redis = _get_redis()
    if redis:
        try:
            cached = redis.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception:
            pass

    # Pick verse deterministically
    day_of_year = datetime.utcnow().timetuple().tm_yday
    verse_index = day_of_year % len(CORPUS)
    verse = CORPUS[verse_index]
    
    # Store cache
    if redis:
        try:
            # Expire in 24 hours
            redis.set(cache_key, json.dumps(verse), ex=86400)
        except Exception:
            pass
            
    return verse
