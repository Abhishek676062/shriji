"""
backend/scripts/ingest.py
━━━━━━━━━━━━━━━━━━━━━━━━
ONE-TIME script: embed all 701 Gita verses with Gemini and upsert to Pinecone.

Usage:
    cd backend
    source venv/bin/activate
    python scripts/ingest.py

Prerequisites:
    1. Run scripts/create_index.py first (Pinecone index must exist)
    2. GEMINI_API_KEY and PINECONE_API_KEY must be set in backend/.env

Rate limits:
    - Gemini text-embedding: 1500 RPM free tier → sleep 0.04s between batches
    - Pinecone upsert: batch size 50 is safe for Starter plan
"""

import json
import os
import sys
import time

from dotenv import load_dotenv

# ── Load env ──────────────────────────────────────────────────────────────────
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX   = os.getenv("PINECONE_INDEX", "shriji-gita")
GEMINI_API_KEY   = os.getenv("GEMINI_API_KEY", "")

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "gita_verses_enhanced.json")

BATCH_SIZE = 50          # Pinecone upsert batch size
SLEEP_BETWEEN_BATCHES = 0.04   # seconds — respect Gemini 1500 RPM limit


# ── Validate env ──────────────────────────────────────────────────────────────
def _check_env() -> None:
    missing = []
    if not PINECONE_API_KEY:
        missing.append("PINECONE_API_KEY")
    if not GEMINI_API_KEY:
        missing.append("GEMINI_API_KEY")
    if missing:
        print(f"❌ Missing env vars: {', '.join(missing)}")
        print("   Set them in backend/.env and try again.")
        sys.exit(1)


# ── Metadata builder ──────────────────────────────────────────────────────────
def _build_metadata(verse: dict) -> dict:
    """
    Build the Pinecone metadata dict from a verse.
    Stores all fields used for filtering, display, and reranking.
    Lists are stored as-is (Pinecone supports list<string> metadata).
    """
    return {
        "chunk_id":             verse.get("chunk_id", ""),
        "chapter":              verse.get("chapter", 0),
        "verse_start":          verse.get("verse_start", 0),
        "verse_range":          verse.get("verse_range", ""),
        "chapter_title":        verse.get("chapter_title", ""),
        "speaker":              verse.get("speaker", ""),
        "listener":             verse.get("listener", ""),
        # Text fields
        "text_en":              verse.get("english", ""),
        "text_hi":              verse.get("hindi", ""),
        "sanskrit_devanagari":  verse.get("sanskrit_devanagari", ""),
        "sanskrit_transliterated": verse.get("sanskrit_transliterated", ""),
        # Commentary (trimmed to stay within Pinecone metadata size limit)
        "commentary_en":        verse.get("commentary_en", "")[:500],
        "commentary_hi":        verse.get("commentary_hi", "")[:500],
        # Tag arrays — used for metadata filtering in Pinecone
        "emotional_tags":       verse.get("emotional_tags", []),
        "theme_tags":           verse.get("theme_tags", []),
        "problem_domains":      verse.get("problem_domains", []),
        "key_concepts":         verse.get("key_concepts", []),
        "related_verses":       verse.get("related_verses", []),
    }


# ── Main ingestion function ───────────────────────────────────────────────────
def ingest() -> None:
    _check_env()

    # ── Import after env check ─────────────────────────────────────────────
    import google.generativeai as genai
    from pinecone import Pinecone

    # Add the backend root to sys.path so we can import core.embedder
    backend_root = os.path.join(os.path.dirname(__file__), "..")
    sys.path.insert(0, backend_root)
    from core.embedder import build_verse_text, embed_document

    genai.configure(api_key=GEMINI_API_KEY)
    pc = Pinecone(api_key=PINECONE_API_KEY)

    # Verify index exists
    existing = [idx.name for idx in pc.list_indexes()]
    if PINECONE_INDEX not in existing:
        print(f"❌ Pinecone index '{PINECONE_INDEX}' not found.")
        print("   Run scripts/create_index.py first, then retry.")
        sys.exit(1)

    index = pc.Index(PINECONE_INDEX)

    # ── Load verses ────────────────────────────────────────────────────────
    print(f"📖 Loading verses from {DATA_PATH} ...")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        verses = json.load(f)

    total = len(verses)
    print(f"   Found {total} verses.")
    print()
    print("🕉️  Starting ingestion ...")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    ingested = 0
    errors   = 0
    batch    = []

    for i, verse in enumerate(verses):
        chunk_id = verse.get("chunk_id", f"verse_{i}")

        # Build the text to embed
        text = build_verse_text(verse)

        # Embed with retry on rate limit
        vector = None
        for attempt in range(3):
            try:
                vector = embed_document(text)
                break
            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "quota" in err_str.lower():
                    wait = 5 * (2 ** attempt)   # 5s, 10s, 20s
                    print(f"   ⚠️  Rate limit hit — waiting {wait}s (attempt {attempt + 1}/3) ...")
                    time.sleep(wait)
                else:
                    print(f"   ❌ Embed error for {chunk_id}: {e}")
                    errors += 1
                    break

        if vector is None:
            print(f"   ⛔ Skipping {chunk_id} after 3 failed attempts.")
            continue

        # Build Pinecone upsert record
        batch.append({
            "id":       chunk_id,
            "values":   vector,
            "metadata": _build_metadata(verse),
        })

        ingested += 1

        # Upsert in batches of BATCH_SIZE
        if len(batch) >= BATCH_SIZE:
            _upsert_batch(index, batch, ingested, total)
            batch = []
            time.sleep(SLEEP_BETWEEN_BATCHES)

    # Flush remaining
    if batch:
        _upsert_batch(index, batch, ingested, total)

    # ── Summary ────────────────────────────────────────────────────────────
    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"✅ Ingestion complete!")
    print(f"   Ingested : {ingested}/{total}")
    print(f"   Errors   : {errors}")
    print()

    # Verify with Pinecone stats
    print("📊 Pinecone index stats:")
    stats = index.describe_index_stats()
    print(f"   Total vectors : {stats.total_vector_count}")
    print(f"   Dimension     : {stats.dimension}")
    print()
    print("Next step → Day 3: Run scripts/test_retrieval.py")
    print("Jai Shri Krishna! 🙏")


def _upsert_batch(index, batch: list, curr: int, total: int) -> None:
    """Upsert a batch to Pinecone with a simple retry."""
    for attempt in range(3):
        try:
            index.upsert(vectors=batch)
            print(f"   Ingested chunk {curr}/{total}  ({len(batch)} vectors upserted)")
            return
        except Exception as e:
            if attempt < 2:
                print(f"   ⚠️  Upsert error, retrying ({attempt + 1}/3): {e}")
                time.sleep(2)
            else:
                print(f"   ❌ Upsert failed after 3 attempts: {e}")


if __name__ == "__main__":
    ingest()
