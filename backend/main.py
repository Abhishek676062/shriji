"""
backend/main.py
━━━━━━━━━━━━━━━
Shriji FastAPI Application Entry Point.
"""

import logging
import os
import certifi

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Optional modules that resolve connection checks during startup
import google.generativeai as genai
from pinecone import Pinecone

# Internal module loading for state
from core.bm25 import load_index, CORPUS

# Load environment explicitly
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# ── Logging Setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("shriji")

# ── Application Init ─────────────────────────────────────────────────────────
app = FastAPI(
    title="Shriji Gita AI API",
    version="3.0.0",
    description="Backend API for the Shriji Bhagavad Gita Assistant"
)

# CORS setup for frontend URLs (Localhost and Vercel)
# Render requires ALLOW_ORIGINS definition for standard frontend communication.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://shriji.vercel.app",  # Production Vercel domain placeholder
        "*"  # To test via Postman/curl safely on day 5 (lock down in prod later)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Startup Logic ────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    logger.info("🕉️ Starting up Shriji Backend...")
    
    # 1. Init Gemini
    genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
    
    # 2. Build BM25 Index
    # If using render/vercel, cold starts require it be loaded freshly.
    if not CORPUS:
        logger.info("Building BM25 index from enhanced Gita JSON...")
        load_index()

    logger.info("✅ Startup sequence complete.")


# ── Health Endpoint ──────────────────────────────────────────────────────────
from models.schemas import HealthResponse

@app.get("/api/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """
    Validates backend microservice connections.
    Includes simple checks for Pinecone, Redis, and BM25 local corpus memory state.
    """
    pinecone_ok = False
    redis_ok = False
    bm25_ok = len(CORPUS) > 0
    
    # Check Pinecone
    try:
        pc_key = os.getenv("PINECONE_API_KEY", "")
        if pc_key:
            # Setting grpc certs internally to avoid MacOS/Ubuntu SSL resolution issues
            os.environ["GRPC_DEFAULT_SSL_ROOTS_FILE_PATH"] = certifi.where() 
            pc = Pinecone(api_key=pc_key)
            if pc.list_indexes():
                pinecone_ok = True
    except Exception as e:
        logger.error(f"Pinecone health-check failed: {e}")

    # Check Upstash Redis
    try:
        url = os.getenv("UPSTASH_REDIS_URL", "")
        token = os.getenv("UPSTASH_REDIS_TOKEN", "")
        if url and token:
            from upstash_redis import Redis
            r = Redis(url=url, token=token)
            # Send a simple ping-equivalent operation
            r.set("health", "ok", ex=10)
            if r.get("health") == "ok":
                redis_ok = True
    except Exception as e:
        logger.error(f"Redis health-check failed: {e}")

    return HealthResponse(
        status="healthy",
        pinecone_connected=pinecone_ok,
        redis_connected=redis_ok,
        bm25_loaded=bm25_ok
    )

    
# ── Router Attachment ────────────────────────────────────────────────────────
from api.chat import router as chat_router
from api.gita import router as gita_router

app.include_router(chat_router)
app.include_router(gita_router)
