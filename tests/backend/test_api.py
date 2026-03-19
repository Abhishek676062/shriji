"""
tests/backend/test_api.py
━━━━━━━━━━━━━━━━━━━━━━━━━
Automated integration testing for Shriji FastAPI endpoints.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

# Mock Upstash Redis for reliable cache tests
import json
class MockRedis:
    def __init__(self):
        self.store = {}
    def get(self, key):
        return self.store.get(key)
    def set(self, key, value, ex=None):
        self.store[key] = value

# Patch Redis getter before we load main module
import api.gita
import api.chat
mock_redis_instance = MockRedis()
api.gita._get_redis = lambda: mock_redis_instance
api.chat._get_redis = lambda: mock_redis_instance

# Load main application routing
from main import app

# Create static test client spanning memory
client = TestClient(app)


# ── System Endpoints ─────────────────────────────────────────────────────────

def test_health_check():
    """1. test_health_check() — GET /api/health returns 200"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["bm25_loaded"] == True


# ── Gita Endpoints ───────────────────────────────────────────────────────────

def test_gita_chapters():
    """5. test_gita_chapters() — GET /api/gita/chapters returns 18 items"""
    response = client.get("/api/gita/chapters")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 18
    assert data[0]["chapter"] == 1
    assert data[17]["chapter"] == 18


def test_verse_detail():
    """6. test_verse_detail() — GET /api/gita/verse/BG_02_47 returns all fields"""
    response = client.get("/api/gita/verse/BG_02_47")
    assert response.status_code == 200
    data = response.json()
    assert data["chunk_id"] == "BG_02_47"
    assert data["chapter"] == 2
    assert "sanskrit_devanagari" in data
    assert "english" in data
    assert "problem_domains" in data


def test_daily_verse():
    """7. test_daily_verse() — GET /api/daily-verse returns a valid verse"""
    response = client.get("/api/daily-verse")
    assert response.status_code == 200
    data = response.json()
    assert "chunk_id" in data
    assert "verse_range" in data


# ── Chat Pipeline Integration Endpoints ──────────────────────────────────────

# Note: Integration testing Chat hits external Groq/Gemini/Pinecone APIs 
# so they are slightly slower and assume network is up.

@pytest.mark.asyncio
def test_chat_english():
    """2. test_chat_english() — English anger query returns shlokas"""
    payload = {"message": "I feel very angry and lost.", "session_id": "test_en"}
    response = client.post("/api/chat", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "answer" in data
    assert len(data["shlokas"]) > 0
    assert data["emotion_detected"] in ["anger", "confusion"]
    assert data["cached"] == False


@pytest.mark.asyncio
def test_chat_hindi():
    """3. test_chat_hindi() — Hindi query returns Hindi answer"""
    # A distinct query to avoid caching issues with the english test loosely identical
    payload = {"message": "मेरा मन बहुत अशांत है", "session_id": "test_hi"}
    response = client.post("/api/chat", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "answer" in data
    # Langdetect handles it internally or translation retains it
    assert data["language"] in ["hi", "mr", "ne"] # Devanagari based detections
    assert "shlokas" in data


@pytest.mark.asyncio
def test_chat_cache():
    """4. test_chat_cache() — Same query twice: second has cached=true"""
    payload = {"message": "What is Karma Yoga?", "session_id": "test_cache"}
    
    # First request
    response1 = client.post("/api/chat", json=payload)
    assert response1.status_code == 200
    data1 = response1.json()
    assert data1["cached"] == False
    
    # Second identical request (hit our mock redis memory cache)
    response2 = client.post("/api/chat", json=payload)
    assert response2.status_code == 200
    data2 = response2.json()
    
    # Needs to match exactly and be explicitly cached true
    assert data2["cached"] == True
    assert data2["answer"] == data1["answer"]
