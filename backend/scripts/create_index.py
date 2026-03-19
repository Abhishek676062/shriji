"""
backend/scripts/create_index.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ONE-TIME SETUP SCRIPT — Run this ONCE before running ingest.py.

Creates the Pinecone index 'shriji-gita' with:
  - dimension = 768   (Gemini gemini-embedding-001 output size)
  - metric    = cosine
  - cloud     = aws
  - region    = us-east-1 (Pinecone Starter default)

Usage:
    cd backend
    python scripts/create_index.py

Prerequisites:
    pip install pinecone-client python-dotenv
    PINECONE_API_KEY must be set in backend/.env
"""

import os
import time
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = os.getenv("PINECONE_INDEX", "shriji-gita")
DIMENSION = 3072         # gemini-embedding-001 vector size
METRIC = "cosine"
CLOUD = "aws"
REGION = "us-east-1"    # Pinecone Starter free-tier default region


def create_shriji_index() -> None:
    """Create the Pinecone vector index for Shriji."""

    if not PINECONE_API_KEY:
        raise EnvironmentError(
            "PINECONE_API_KEY not found. "
            "Please set it in backend/.env before running this script."
        )

    # Import here so the script fails fast if pinecone is not installed
    from pinecone import Pinecone, ServerlessSpec

    print(f"🕉️  Shriji — Pinecone Index Setup")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"Index name : {INDEX_NAME}")
    print(f"Dimension  : {DIMENSION}")
    print(f"Metric     : {METRIC}")
    print(f"Cloud      : {CLOUD} / {REGION}")
    print()

    pc = Pinecone(api_key=PINECONE_API_KEY)

    # Check if index already exists
    existing_indexes = [idx.name for idx in pc.list_indexes()]
    if INDEX_NAME in existing_indexes:
        print(f"✅ Index '{INDEX_NAME}' already exists — no action needed.")
        idx = pc.Index(INDEX_NAME)
        stats = idx.describe_index_stats()
        print(f"   Vectors : {stats.total_vector_count}")
        print(f"   Dimension: {stats.dimension}")
        return

    # Create the index
    print(f"⏳ Creating index '{INDEX_NAME}' ...")
    pc.create_index(
        name=INDEX_NAME,
        dimension=DIMENSION,
        metric=METRIC,
        spec=ServerlessSpec(cloud=CLOUD, region=REGION),
    )

    # Wait until the index is ready
    print("⏳ Waiting for index to become ready ...")
    while True:
        description = pc.describe_index(INDEX_NAME)
        status = description.status.get("ready", False)
        if status:
            break
        print("   Still initializing — waiting 5 seconds ...")
        time.sleep(5)

    print()
    print(f"✅ Index '{INDEX_NAME}' is ready!")
    print(f"   Dimension : {DIMENSION}")
    print(f"   Metric    : {METRIC}")
    print()
    print("Next step → Run backend/scripts/ingest.py to embed all 700 verses.")
    print("Jai Shri Krishna! 🙏")


if __name__ == "__main__":
    create_shriji_index()
