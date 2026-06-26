"""
backend/models/schemas.py
━━━━━━━━━━━━━━━━━━━━━━━━━
Pydantic v2 models for Shriji API requests and responses.
"""

from typing import List, Optional, Any
from pydantic import BaseModel, Field

# ── Chat API Models ──────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str = Field(..., description="The user's question or message")
    session_id: Optional[str] = Field(None, description="Optional unique ID for conversation tracking")
    language: Optional[str] = Field(None, description="Force a specific language code (e.g. 'en', 'hi')")
    history: Optional[List[dict]] = Field(None, description="Conversation history for follow-up context")

class ShlokaCard(BaseModel):
    chunk_id: str
    chapter: int
    verse_range: str
    sanskrit_devanagari: str
    sanskrit_transliterated: str
    english: str
    hindi: str
    theme_tags: List[str]
    emotional_tags: List[str]
    key_concepts: List[str]
    related_verses: List[str]
    rrf_score: float = Field(0.0)

class ChatResponse(BaseModel):
    answer: str
    language: str
    emotion_detected: Optional[str] = None
    domain_detected: Optional[str] = None
    shlokas: List[ShlokaCard]
    cached: bool = False
    session_id: str

# ── Gita Reader Models ───────────────────────────────────────────────────────

class VerseDetail(BaseModel):
    """Full detail representation mirroring all 15+ JSON fields practically."""
    chunk_id: str
    chapter: int
    verse_start: int
    verse_end: int
    verse_range: str
    sanskrit_devanagari: str
    sanskrit_transliterated: str
    english: str
    hindi: str
    commentary_en: str
    commentary_hi: str
    speaker: str
    listener: str
    chapter_title: str
    emotional_tags: List[str]
    theme_tags: List[str]
    problem_domains: List[str]
    key_concepts: List[str]
    related_verses: List[str]
    practical_applications: List[str] = []

class ChapterSummary(BaseModel):
    chapter: int
    chapter_title: str
    verse_count: int

# ── System Models ────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    pinecone_connected: bool
    redis_connected: bool
    bm25_loaded: bool
