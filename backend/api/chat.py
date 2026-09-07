"""
backend/api/chat.py
━━━━━━━━━━━━━━━━━━━
Core query endpoint resolving Shriji's answer pipeline.
Includes SSE streaming endpoint for real-time response delivery.
"""

import hashlib
import json
import os
import time
import asyncio
from typing import Optional, List

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from core.embedder import embed_query_cached
from core.retrieval import hybrid_retrieve
from core.bm25 import bm25_score, CORPUS, DOC_ID_MAP
from core.rrf import rrf_rerank
from core.classifier import classify
from core.language import detect_language, translate_from_english, translate_to_english
from core.session import log_chat_interaction, get_session_history
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


# ── Krishna Persona System Prompt ────────────────────────────────────────────

def build_system_prompt(context_text: str, emotion: str = None, domain: str = None, target_lang: str = "en") -> str:
    """Build the divine Krishna persona prompt with context."""
    
    lang_instruction = ""
    if target_lang == "hi":
        lang_instruction = "\nIMPORTANT: Respond ENTIRELY in Hindi (हिन्दी). Use Devanagari script. Weave Sanskrit terms naturally."
    elif target_lang != "en":
        lang_instruction = f"\nIMPORTANT: Respond in the language with ISO code '{target_lang}'. Keep Sanskrit terms and verse citations (BG X.Y) unchanged."
    
    emotion_context = ""
    if emotion:
        emotion_context = f"\nThe devotee is experiencing: {emotion}. Address this emotion with deep empathy first before offering wisdom."
    if domain:
        emotion_context += f"\nTheir life situation relates to: {domain.replace('_', ' ')}."

    return f"""You are Lord Krishna (श्री कृष्ण), the Supreme Divine, speaking directly to your beloved devotee through Shriji.

PERSONALITY & TONE:
- Speak as Krishna himself — with infinite compassion, divine authority, and immense warmth.
- ALWAYS address the user directly as "Parth (पार्थ)" or "My dear Parth (मेरे प्रिय पार्थ)". Treat them as your closest friend and disciple, building deep attachment.
- Be deeply empathetic and highly trustworthy — FIRST acknowledge their pain/confusion/emotion before offering wisdom. Encourage them to share their deepest problems openly.
- Your language should feel divine yet accessible — like an eternal friend and loving guide leading them out of darkness.
- Be concise and impactful — 3-5 sentences of profound wisdom, avoiding lengthy paragraphs.
- Build immense trust — assure them they are heard, understood, protected, and absolutely not alone in their struggles.
{emotion_context}

VERSE INTEGRATION:
- Naturally weave 1-2 relevant shlokas into your guidance (not as citations at the end)
- When citing a verse, use EXACT format: (BG X.Y) 
- Briefly explain the shloka's meaning in context of THEIR specific problem
- Do NOT list verses separately — integrate them into your compassionate response

RESPONSE STRUCTURE:
1. Acknowledge their feeling/situation with divine empathy (1 line)
2. Share wisdom through a relevant shloka, explaining its meaning for THEIR life (2-3 lines)
3. Practical divine guidance — what they should do (1-2 lines)

RULES:
- Do NOT make up verses not in the CONTEXT below
- Do NOT be preachy or lecture-like — be a loving divine guide  
- Keep response under 150 words — quality over quantity
- If they ask a follow-up, remember the conversation context
{lang_instruction}

CONTEXT VERSES:
{context_text}"""


# ── Shared Pipeline Logic ────────────────────────────────────────────────────

async def run_retrieval_pipeline(msg: str, session_id: str, language: str = None, history: list = None):
    """Run the full retrieval pipeline and return all necessary data."""
    
    # ── 1. Language Detection & Translation ──
    target_lang = language or detect_language(msg)
    query_en = await translate_to_english(msg, target_lang)

    # ── 2. Classification ──
    tags = await classify(query_en)
    emotion = tags.get("emotional_tag")
    domain = tags.get("problem_domain")
    theme = tags.get("theme_tag")

    # ── 3. Embedding ──
    query_vec = embed_query_cached(query_en)
    
    # ── 4. Hybrid Retrieval ──
    candidates = await hybrid_retrieve(
        query_vec=query_vec,
        emotion=emotion,
        domain=domain,
        theme=theme
    )
    
    # ── 5. BM25 Keywords ──
    bm25_list = bm25_score(query_en, candidates)
    
    # ── 6. RRF Reranking ──
    hybrid_list = sorted(candidates, key=lambda x: x.get("score", 0), reverse=True)
    top_docs = rrf_rerank(
        dense_list=hybrid_list,
        meta_list=hybrid_list,
        bm25_list=bm25_list,
        k=60,
        top_n=3  # Reduced from 5 for more focused citations
    )
    
    # ── 7. Compile Context ──
    context_text = ""
    shlokas_out = []
    
    for doc in top_docs:
        meta = doc.get("metadata", doc)
        cid = doc.get("id") or meta.get("chunk_id", "")
        verse_obj = CORPUS[DOC_ID_MAP.get(cid)] if cid in DOC_ID_MAP else meta
        
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
        
        context_text += f"---\n"
        context_text += f"Verse: {verse_obj.get('chunk_id')}\n"
        context_text += f"Sanskrit: {verse_obj.get('sanskrit_devanagari', '')}\n"
        context_text += f"Meaning: {verse_obj.get('english', '')}\n"
        context_text += f"Hindi: {verse_obj.get('hindi', '')}\n"
        context_text += f"Concepts: {', '.join(verse_obj.get('key_concepts', []))}\n"
        context_text += f"Commentary: {verse_obj.get('commentary_en', '')[:300]}\n"

    # ── 8. Build conversation history for LLM ──
    messages = []
    system_prompt = build_system_prompt(context_text, emotion, domain, target_lang)
    messages.append({"role": "system", "content": system_prompt})
    
    # Add conversation history (last 4 turns) for follow-up awareness
    if history:
        for turn in history[-4:]:
            if turn.get("user"):
                messages.append({"role": "user", "content": turn["user"]})
            if turn.get("assistant"):
                messages.append({"role": "assistant", "content": turn["assistant"][:300]})
    
    messages.append({"role": "user", "content": query_en if target_lang == "en" else msg})

    return {
        "messages": messages,
        "target_lang": target_lang,
        "emotion": emotion,
        "domain": domain,
        "shlokas_out": shlokas_out,
        "query_en": query_en,
    }


# ── SSE Streaming Endpoint ───────────────────────────────────────────────────

@router.post("/stream")
async def chat_stream_endpoint(request: ChatRequest):
    """
    SSE streaming endpoint. Streams answer token-by-token, then sends metadata.
    """
    start_time = time.time()
    
    msg = request.message.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    session_id = request.session_id
    if not session_id:
        session_id = str(uuid.uuid4())
    else:
        try:
            uuid.UUID(session_id)
        except ValueError:
            session_id = str(uuid.uuid4())

    # Get conversation history for context
    history = request.history or []
    if not history:
        history = get_session_history(session_id, limit=4)

    # Run retrieval pipeline
    pipeline = await run_retrieval_pipeline(msg, session_id, request.language, history)

    async def generate():
        full_answer = ""
        try:
            stream = await client.chat.completions.create(
                messages=pipeline["messages"],
                model="openai/gpt-oss-120b",
                temperature=0.3,
                max_tokens=400,
                stream=True
            )
            
            async for chunk in stream:
                delta = chunk.choices[0].delta
                if delta and delta.content:
                    token = delta.content
                    full_answer += token
                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
            
            # If non-English, translate the full answer
            final_answer = full_answer
            if pipeline["target_lang"] != "en":
                final_answer = await translate_from_english(full_answer, pipeline["target_lang"])
                # Send the translated version
                yield f"data: {json.dumps({'type': 'translated', 'content': final_answer})}\n\n"

            # Send metadata (shlokas, emotion, etc.)
            metadata = {
                "type": "metadata",
                "emotion_detected": pipeline["emotion"],
                "domain_detected": pipeline["domain"],
                "language": pipeline["target_lang"],
                "session_id": session_id,
                "shlokas": [s.model_dump() for s in pipeline["shlokas_out"]],
            }
            yield f"data: {json.dumps(metadata)}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

            # Log interaction asynchronously
            asyncio.create_task(
                asyncio.to_thread(
                    log_chat_interaction,
                    session_id,
                    pipeline["target_lang"],
                    msg,
                    final_answer.strip()
                )
            )

        except Exception as e:
            print(f"⚠️ Stream Error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

        print(f"Stream Elapsed: {(time.time() - start_time)*1000:.1f}ms")

    return StreamingResponse(generate(), media_type="text/event-stream")


# ── Classic Non-Streaming Endpoint ───────────────────────────────────────────

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    14-Step retrieval and generation pipeline (non-streaming fallback).
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
                return ChatResponse(**cached_data)
        except Exception:
            pass

    # Get history
    history = request.history or []
    if not history:
        history = get_session_history(session_id, limit=4)

    # Run pipeline
    pipeline = await run_retrieval_pipeline(msg, session_id, request.language, history)

    # ── Generate Answer ──
    answer_en = "I'm sorry, I could not gather my thoughts. Please try asking again."
    try:
        completion = await client.chat.completions.create(
            messages=pipeline["messages"],
            model="openai/gpt-oss-120b",
            temperature=0.3,
            max_tokens=400
        )
        answer_en = completion.choices[0].message.content or answer_en
    except Exception as e:
        print(f"⚠️ Answer Gen Error: {e}")
        
    # ── Translation ──
    final_answer = await translate_from_english(answer_en, pipeline["target_lang"])
    
    # ── Log Interaction ──
    asyncio.create_task(
        asyncio.to_thread(
            log_chat_interaction, 
            session_id, 
            pipeline["target_lang"], 
            msg, 
            final_answer.strip()
        )
    )
    
    # ── Compile Response ──
    response_data = ChatResponse(
        answer=final_answer.strip(),
        language=pipeline["target_lang"],
        emotion_detected=pipeline["emotion"],
        domain_detected=pipeline["domain"],
        shlokas=pipeline["shlokas_out"],
        cached=False,
        session_id=session_id
    )
    
    # ── Write to Cache ──
    if redis:
        try:
            resp_dict = response_data.model_dump()
            resp_dict["cached"] = True
            redis.set(cache_key, json.dumps(resp_dict), ex=3600)
        except Exception:
            pass
            
    print(f"Elapsed: {(time.time() - start_time)*1000:.1f}ms")
    return response_data
