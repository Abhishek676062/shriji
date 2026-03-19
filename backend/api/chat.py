"""
backend/api/chat.py
━━━━━━━━━━━━━━━━━━━
Core query endpoint resolving Shriji's answer pipeline.
"""

import hashlib
import json
import os
import time
import asyncio
from typing import Optional

from fastapi import APIRouter, HTTPException

from core.embedder import embed_query_cached
from core.retrieval import hybrid_retrieve
from core.bm25 import bm25_score, CORPUS, DOC_ID_MAP
from core.rrf import rrf_rerank
from core.classifier import classify
from core.language import detect_language, translate_from_english, translate_to_english
from core.session import log_chat_interaction
from models.schemas import ChatRequest, ChatResponse, ShlokaCard

from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", ""))
router = APIRouter(prefix="/api/chat", tags=["Chat"])

# ── Redis Setup ──
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

import uuid

# ── Controller ───────────────────────────────────────────────────────────────

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    14-Step retrieval and generation pipeline.
    """
    start_time = time.time()
    redis = _get_redis()
    
    msg = request.message.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    session_id = request.session_id
    if not session_id:
        session_id = str(uuid.uuid4())
    else:
        try:
            # Validate it's a true UUID (catches Swagger's "string" default filler)
            uuid.UUID(session_id)
        except ValueError:
            session_id = str(uuid.uuid4())
            
    # ── 1. Check Redis Cache ──
    cache_key = f"chat:{hashlib.md5(msg.encode()).hexdigest()}"
    if redis:
        try:
            cached = redis.get(cache_key)
            if cached:
                cached_data = json.loads(cached)
                # Return wrapped in Pydantic schema
                return ChatResponse(**cached_data)
        except Exception:
            pass

    # ── 2. Language Detection & Translation ──
    # If standard language code provided, use it, else detect.
    target_lang = request.language or detect_language(msg)
    query_en = await translate_to_english(msg, target_lang)

    # ── 3. Classification ──
    tags = await classify(query_en)
    emotion = tags.get("emotional_tag")
    domain = tags.get("problem_domain")
    theme = tags.get("theme_tag")

    # ── 4. Embedding ──
    query_vec = embed_query_cached(query_en)
    
    # ── 5. Hybrid Retrieval ──
    candidates = await hybrid_retrieve(
        query_vec=query_vec,
        emotion=emotion,
        domain=domain,
        theme=theme
    )
    
    # ── 6. BM25 Keywords ──
    bm25_list = bm25_score(query_en, candidates)
    
    # ── 7. RRF Reranking ──
    # Map candidates explicitly to dict format for RRF
    hybrid_list = sorted(candidates, key=lambda x: x.get("score", 0), reverse=True)
    top_docs = rrf_rerank(
        dense_list=hybrid_list,
        meta_list=hybrid_list,
        bm25_list=bm25_list,
        k=60,
        top_n=5
    )
    
    # ── 8. Compile Context ──
    context_text = ""
    shlokas_out = []
    
    for doc in top_docs:
        meta = doc.get("metadata", doc)
        cid = doc.get("id") or meta.get("chunk_id", "")
        verse_obj = CORPUS[DOC_ID_MAP.get(cid)] if cid in DOC_ID_MAP else meta
        
        # Build ShlokaCard output
        shlokas_out.append(ShlokaCard(
            chunk_id=verse_obj.get("chunk_id", ""),
            chapter=verse_obj.get("chapter", 0),
            verse_range=verse_obj.get("verse_range", ""),
            sanskrit_devanagari=verse_obj.get("sanskrit_devanagari", ""),
            sanskrit_transliterated=verse_obj.get("sanskrit_transliterated", ""),
            english=verse_obj.get("english", ""),
            hindi=verse_obj.get("hindi", ""),
            theme_tags=verse_obj.get("theme_tags", []),
            emotional_tags=verse_obj.get("emotional_tags", []),
            key_concepts=verse_obj.get("key_concepts", []),
            related_verses=verse_obj.get("related_verses", []),
            rrf_score=doc.get("rrf_score", 0.0)
        ))
        
        # Build prompt context string
        context_text += f"---\n"
        context_text += f"Verse: {verse_obj.get('chunk_id')}\n"
        context_text += f"Meaning: {verse_obj.get('english', '')}\n"
        context_text += f"Concepts: {', '.join(verse_obj.get('key_concepts', []))}\n"
        context_text += f"Commentary: {verse_obj.get('commentary_en', '')[:300]}\n"
        
    # ── 9. Groq Answer Generation ──
    system_prompt = f"""You are Shriji, a compassionate, profoundly wise Bhagavad Gita AI assistant.
Speak gracefully. Respond directly to the user's emotion and query using the provided verses as philosophical backing.
If you cite a verse, you MUST use the exact format '(BG X.Y)'.
Do NOT make up verses not provided in the context below.

CONTEXT VERSES:
{context_text}"""

    answer_en = "I'm sorry, I could not gather my thoughts. Please try asking again."
    try:
        completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query_en}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.25,
            max_tokens=600
        )
        answer_en = completion.choices[0].message.content or answer_en
    except Exception as e:
        print(f"⚠️ Answer Gen Error: {e}")
        
    # ── 10. Final Translation ──
    final_answer = await translate_from_english(answer_en, target_lang)
    
    # ── 11. Log Interaction to DB ──
    # Offload the session logging (will skip silently if keys are empty/invalid)
    asyncio.create_task(
        asyncio.to_thread(
            log_chat_interaction, 
            session_id, 
            target_lang, 
            msg, 
            final_answer.strip()
        )
    )
    
    # ── 12. Compile Response ──
    response_data = ChatResponse(
        answer=final_answer.strip(),
        language=target_lang,
        emotion_detected=emotion,
        domain_detected=domain,
        shlokas=shlokas_out,
        cached=False,
        session_id=session_id
    )
    
    # ── 12. Write to Cache ──
    if redis:
        try:
            # TTL: 1 Hour
            resp_dict = response_data.model_dump()
            resp_dict["cached"] = True
            redis.set(cache_key, json.dumps(resp_dict), ex=3600)
        except Exception:
            pass
            
    print(f"Elapsed: {(time.time() - start_time)*1000:.1f}ms")
    return response_data
