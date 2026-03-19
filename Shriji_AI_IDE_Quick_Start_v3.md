# 🕉️ SHRIJI — AI IDE QUICK START GUIDE
## Build Shriji in 21 Days with AI-Assisted Development

**For:** Cursor · Windsurf · Bolt.new · Replit Agent · Cline  
**Goal:** Complete working application in 3 weeks  
**Stack:** Gemini Embedding · Pinecone · RRF · Groq (Llama 3.3 70B) · FastAPI · Next.js 14  
**Version:** 3.0 | Infrastructure Cost: $0/month  

---

## 📋 PREREQUISITES

Before starting, ensure you have:

- [ ] Python 3.11+
- [ ] Node.js 18+
- [ ] Git installed
- [ ] **Groq API key** — free at [console.groq.com](https://console.groq.com)
- [ ] **Google AI API key** — free at [aistudio.google.com](https://aistudio.google.com) (for Gemini text-embedding-004)
- [ ] **Pinecone API key** — free Starter at [pinecone.io](https://pinecone.io)
- [ ] **Supabase project** — free at [supabase.com](https://supabase.com)
- [ ] **Upstash Redis** — free at [upstash.com](https://upstash.com)

> ⚠️ **No local PostgreSQL or Redis needed.** Everything runs on free cloud services — $0/month.

---

## 🚀 QUICK START (5 MINUTES)

### Step 1: Create Project Structure

```bash
# Create project root
mkdir shriji && cd shriji
git init

# Backend structure
mkdir -p backend/api backend/core backend/models backend/scripts backend/data

# Frontend structure
mkdir -p frontend/app/gita frontend/components/chat frontend/components/gita \
         frontend/components/common frontend/lib frontend/public

# Shared
mkdir -p tests/backend tests/e2e docs
```

### Step 2: Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

cat > requirements.txt << 'EOF'
fastapi==0.111.0
uvicorn[standard]==0.30.0
groq==0.11.0
google-generativeai==0.8.0
pinecone-client==4.1.0
rank-bm25==0.2.2
langdetect==1.0.9
upstash-redis==1.1.0
supabase==2.5.0
gTTS==2.5.1
pydantic==2.7.0
httpx==0.27.0
python-dotenv==1.0.1
python-multipart==0.0.9
EOF

pip install -r requirements.txt
```

### Step 3: Environment Variables

```bash
cat > .env << 'EOF'
# LLM
GROQ_API_KEY=gsk_your_key_here

# Embeddings
GEMINI_API_KEY=AI_your_key_here

# Vector DB
PINECONE_API_KEY=your_key_here
PINECONE_INDEX=shriji-gita

# Database (Supabase)
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_KEY=your_anon_key_here

# Cache (Upstash)
UPSTASH_REDIS_URL=https://your_endpoint.upstash.io
UPSTASH_REDIS_TOKEN=your_token_here

# App
APP_ENV=development
APP_PORT=8000
EOF
```

### Step 4: Frontend Setup

```bash
cd ../frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

npm install axios fuse.js html2canvas lucide-react framer-motion react-markdown
```

### Step 5: Copy Gita JSON

```bash
# Copy your verse corpus to both locations
cp path/to/gita_verses_enhanced.json backend/data/
cp path/to/gita_verses_enhanced.json frontend/public/
```

---

## 📝 AI IDE PROMPTS (Copy & Use)

### For Cursor / Windsurf / Cline

> 💡 **Always reference `Shriji_TechStack_v3.md` and `Shriji_PRD_v3.md`** in your prompts so the AI IDE has full context.

---

#### Prompt 1: Create Backend Entry Point

```
Create backend/main.py for the Shriji Bhagavad Gita AI assistant.

Requirements:
1. FastAPI app with CORS enabled for localhost:3000 and production Vercel URL
2. Routers: /api/chat, /api/gita, /api/daily-verse, /api/search, /api/tts, /api/health
3. On startup: initialize Pinecone client, build BM25 index from data/gita_verses_enhanced.json,
   configure Gemini API with GEMINI_API_KEY
4. Logging with timestamps
5. Load all env vars from .env using python-dotenv

Reference: Shriji_TechStack_v3.md section "FastAPI Application Structure"
```

---

#### Prompt 2: Create Gemini Embedder Module

```
Create backend/core/embedder.py for the Shriji application.

Requirements:
1. Function embed_query(text: str) -> list[float] using Gemini text-embedding-004
   with task_type='retrieval_query', returns 768-dim vector
2. Function embed_document(text: str) -> list[float] with task_type='retrieval_document'
3. Function embed_query_cached(text: str) -> list[float] that:
   - Computes MD5 hash of text as Redis key prefix 'emb:'
   - Returns cached vector from Upstash Redis if present (24h TTL)
   - Calls Gemini API on cache miss, stores result
4. Function build_verse_text(verse: dict) -> str that concatenates:
   english | hindi | theme_tags (joined) | problem_domains (joined) |
   emotional_tags (joined) | commentary_en (first 400 chars)

Reference: Shriji_TechStack_v3.md section "Gemini Embedding Implementation"
```

---

#### Prompt 3: Create Hybrid Retrieval Module

```
Create backend/core/retrieval.py for Shriji's hybrid Pinecone retrieval.

Requirements:
1. Initialize Pinecone client and connect to index named from PINECONE_INDEX env var
2. Async function hybrid_retrieve(query_vec, emotion, domain, theme) -> list
   - Run TWO Pinecone queries concurrently using asyncio.gather:
     (A) Dense: vector=query_vec, top_k=20, no filter
     (B) Metadata filter: top_k=10, filter by emotional_tags $in [emotion]
         OR problem_domains $in [domain]
   - Deduplicate results by 'id' field (chunk_id)
   - Return merged list of ~25 candidates with metadata
3. Each result must include: id (chunk_id), metadata dict with
   text_en, text_hi, emotional_tags, theme_tags, problem_domains,
   key_concepts, related_verses, chapter, verse, speaker

Reference: Shriji_TechStack_v3.md section "Hybrid Pinecone Retrieval"
```

---

#### Prompt 4: Create RRF Reranking Module

```
Create backend/core/rrf.py and backend/core/bm25.py for Shriji.

rrf.py requirements:
1. Function rrf_rerank(dense_list, meta_list, bm25_list, k=60, top_n=5) -> list
   - RRF formula: score(doc) = sum over lists of 1/(k + rank_in_list)
   - Sort by RRF score descending, return top_n doc objects
   - No API calls, no models — pure Python dict math, ~1ms

bm25.py requirements:
1. On module load: read data/gita_verses_enhanced.json, build BM25Okapi index
   on tokenised english field (lowercase split)
2. Function bm25_score(query: str, candidates: list) -> list
   - Score all 700 verses with BM25_INDEX.get_scores()
   - Filter to candidate chunk_ids only
   - Return sorted by BM25 score descending

Reference: Shriji_TechStack_v3.md section "RRF Reranking Implementation"
```

---

#### Prompt 5: Create Emotion Classifier

```
Create backend/core/classifier.py for Shriji emotion and domain classification.

Requirements:
1. Async function classify(query_en: str) -> dict using Groq llama-3.3-70b-versatile,
   temperature=0.0
2. Returns dict with keys: emotional_tag, problem_domain, theme_tag
3. emotional_tag values (exactly): anger | fear | grief | confusion |
   loneliness | anxiety | purpose | guilt | jealousy | determination
4. problem_domain values (exactly): career_anxiety | relationship_conflict |
   self_doubt | grief_loss | anger_management | fear_of_failure |
   leadership_pressure | family_conflict | spiritual_seeking |
   work_stress | uncertainty
5. theme_tag values (exactly): karma_yoga | bhakti_yoga | jnana_yoga |
   detachment | dharma | self_knowledge | renunciation | devotion | action
6. Values must EXACTLY match field values in gita_verses_enhanced.json
   (used directly as Pinecone metadata filter)
7. Error fallback: return default dict if Groq call fails

Reference: Shriji_TechStack_v3.md section "Classification Prompt"
```

---

#### Prompt 6: Create Main Chat API Endpoint

```
Create backend/api/chat.py — the core query endpoint for Shriji.

Full pipeline (10 steps):
1. POST /api/chat accepts ChatRequest(message: str, session_id: Optional[str])
2. Check Upstash Redis cache — return cached response if exact match (1h TTL)
3. Detect language with langdetect
4. Translate to English with Groq if not English (temp=0.1)
5. Call classifier.classify() to get emotion, domain, theme
6. Call embedder.embed_query_cached() to get 768-dim Gemini vector
7. Call retrieval.hybrid_retrieve() — parallel dense + metadata Pinecone queries
8. Call bm25.bm25_score() on candidates for keyword ranking
9. Call rrf.rrf_rerank(dense_list, meta_list, bm25_list) → top 5 verses
10. For each top-5 verse: load related_verses from JSON, add 1-2 summaries
11. Call Groq (temp=0.25) with top-5 + related context → streaming answer
12. Translate answer back to user language (Groq, temp=0.1)
13. Cache full response in Redis, save session to Supabase
14. Return ChatResponse with answer, shlokas[], emotion_detected, domain_detected

Reference: Shriji_TechStack_v3.md section "End-to-End Query Flow" and Pydantic Schemas
```

---

#### Prompt 7: Create Gita API Endpoints

```
Create backend/api/gita.py with Gita Reader endpoints for Shriji.

All endpoints read from data/gita_verses_enhanced.json (loaded in memory at startup).

1. GET /api/gita/chapters
   Returns list of 18 chapters: {chapter, chapter_title, verse_count}

2. GET /api/gita/chapter/{n}
   Returns all verses in chapter n with fields:
   chunk_id, verse_range, sanskrit_devanagari, english, hindi, theme_tags, emotional_tags

3. GET /api/gita/verse/{chunk_id}
   Returns complete verse — all 15 JSON fields including commentaries, related_verses

4. GET /api/gita/theme/{tag}
   Returns all verses where theme_tags or problem_domains contains tag

5. GET /api/gita/search?q={query}
   Simple text search over english + hindi + theme_tags fields (case-insensitive)

6. GET /api/daily-verse
   Returns today's verse using (day_of_year % 700) index, cached in Redis 24h TTL

Reference: Shriji_TechStack_v3.md section "Key API Endpoints"
```

---

#### Prompt 8: Create Pydantic Schemas

```
Create backend/models/schemas.py for Shriji with all Pydantic v2 models.

Models needed:
1. ChatRequest: message: str, session_id: Optional[str] = None, language: Optional[str] = None
2. ShlokaCard: chunk_id, chapter, verse_range, sanskrit_devanagari,
   sanskrit_transliterated, english, hindi, theme_tags: List[str],
   emotional_tags: List[str], key_concepts: List[str],
   related_verses: List[str], rrf_score: float
3. ChatResponse: answer, language, emotion_detected, domain_detected,
   shlokas: List[ShlokaCard], cached: bool, session_id: str
4. VerseDetail: all 15 fields from gita_verses_enhanced.json
5. ChapterSummary: chapter, chapter_title, verse_count
6. HealthResponse: status, pinecone_connected, redis_connected, bm25_loaded

Reference: Shriji_TechStack_v3.md section "Pydantic Schemas"
```

---

#### Prompt 9: Create Pinecone Ingestion Script

```
Create backend/scripts/ingest.py — one-time script to embed all 700 Gita verses
and upload to Pinecone.

Requirements:
1. Load all verses from data/gita_verses_enhanced.json
2. For each verse, build embed text:
   english | hindi | theme_tags | problem_domains | emotional_tags | commentary_en[:400]
3. Call Gemini text-embedding-004 API with task_type='retrieval_document'
4. Upsert to Pinecone in batches of 50
5. Store ALL metadata fields: chunk_id, chapter, verse_start, chapter_title,
   text_en, text_hi, speaker, emotional_tags, theme_tags, problem_domains,
   key_concepts, related_verses
6. Add time.sleep(0.04) between batches to respect 1500 RPM Gemini limit
7. Print progress: "Ingested chunk X/700"
8. Verify at end: print(index.describe_index_stats())

⚠️ Pinecone index must be created with dimension=768 BEFORE running this script.

Reference: Shriji_TechStack_v3.md section "Ingestion Script"
```

---

#### Prompt 10: Create Next.js Chat Interface

```
Create frontend/components/chat/ChatWindow.tsx for Shriji.

Requirements:
1. Full-height chat interface with message thread and input area
2. Messages alternate: user (right, saffron #C0570A bg) | AI (left, cream #FFF8F0 bg)
3. Below each AI message: render ShlokaCard for each shloka in response.shlokas[]
4. Show EmotionBadge for emotion_detected and domain_detected tags
5. Send button + Enter key submission
6. Loading state: pulsing lotus animation while waiting
7. Auto-scroll to bottom on new message
8. Language dropdown selector (12 Indian languages)
9. Call POST /api/chat via lib/api.ts sendQuery function
10. Tailwind styling — saffron (#C0570A), gold (#C9933A), cream (#FFF8F0), deep navy (#1A1A2E)

Reference: Shriji_PRD_v3.md section "AI Chat Module" functional requirements
```

---

#### Prompt 11: Create ShlokaCard Component

```
Create frontend/components/chat/ShlokaCard.tsx for Shriji.

Displays a single retrieved shloka with all metadata from the ShlokaCard response model.

Sections to display:
1. Header: chapter badge (e.g. "BG 2.47") + chapter_title + speaker tag if Krishna
2. Sanskrit (Devanagari) in large Noto Sans Devanagari font, centered
3. Transliteration in italic, muted color
4. English translation
5. Expandable section: show theme_tags and emotional_tags as chips
6. Expandable section: key_concepts with tooltip descriptions
7. Related verses as small linked chips (navigate to /gita/verse/[id])
8. Action buttons: Copy Sanskrit | Listen (TTS via /api/tts) | Ask Shriji | Bookmark (localStorage)
9. Share button: generates shloka card image using html2canvas
10. Card design: gold left border, cream background, elegant typography

Reference: Shriji_PRD_v3.md section "Gita Reader — UX Features"
```

---

#### Prompt 12: Create Gita Reader Pages

```
Create the complete Gita Reader in frontend/app/gita/ for Shriji.

Files to create:

1. app/gita/page.tsx — Chapter Browser
   - 18 chapter cards in responsive grid (3 col desktop, 2 tablet, 1 mobile)
   - Each card: chapter number, chapter_title, verse count, first theme tag
   - Click → navigate to /gita/chapter/[n]

2. app/gita/chapter/[n]/page.tsx — Chapter View
   - Chapter heading + description
   - List of all verses as collapsible VerseCard components
   - Each VerseCard shows: verse_range, first 80 chars of english, Sanskrit preview

3. app/gita/verse/[chapter]/[verse]/page.tsx — Verse Detail
   - Display ALL 15 fields from gita_verses_enhanced.json using VerseDetail component
   - Prev/Next navigation buttons
   - "Ask Shriji" button pre-fills chat with this verse

4. app/gita/search/page.tsx — Search
   - Search input using Fuse.js over bundled JSON (lib/gita-data.js)
   - Show results as VerseCards

5. app/gita/bookmarks/page.tsx — Bookmarks
   - Load chunk_ids from localStorage
   - Display as VerseCards

All data loaded from lib/gita-data.js (static JSON — no backend calls).

Reference: Shriji_PRD_v3.md section "Gita Reader Pages & Routes"
```

---

#### Prompt 13: Create Gita Data Utilities

```
Create frontend/lib/gita-data.js for Shriji Gita Reader.

Requirements:
1. Import gita_verses_enhanced.json from public folder
2. Build Fuse.js index on load with keys:
   english, hindi, theme_tags, problem_domains, key_concepts, chapter_title
   threshold: 0.3, includeScore: true
3. Export functions:
   - searchGita(query: string) → top 20 Fuse results
   - getChapter(n: number) → all verses with chapter === n
   - getVerse(chunk_id: string) → single verse object or undefined
   - getByTheme(tag: string) → verses where theme_tags or problem_domains includes tag
   - getAllThemes() → deduplicated flat array of all theme_tags + problem_domains
   - getChapterList() → array of {chapter, chapter_title, verse_count} for 18 chapters

Reference: Shriji_TechStack_v3.md section "Gita Reader Data Strategy"
```

---

## 📦 IMPLEMENTATION ROADMAP (21 Days)

---

### WEEK 1: Backend Core (Days 1–7)

---

**Day 1: Project Setup + Pinecone Index**
```
AI IDE Prompt:
"Run the complete project setup from Shriji_AI_IDE_Quick_Start_v3.md Step 1-4.
Create all folders with __init__.py in Python packages.
Create placeholder files for: main.py, all api/ modules, all core/ modules.

Then write a one-time setup script backend/scripts/create_index.py that:
1. Creates a Pinecone index named 'shriji-gita' with dimension=768, metric='cosine'
2. Prints confirmation when index is ready

Run it once now."
```

**Day 2: Gemini Embedder + Ingestion**
```
AI IDE Prompt:
"Create backend/core/embedder.py using Prompt 2 from Shriji_AI_IDE_Quick_Start_v3.md.
Then create backend/scripts/ingest.py using Prompt 9.
Run ingest.py to embed all 700 verses and upsert to Pinecone.
Verify with: index.describe_index_stats() — should show ~700 vectors, dimension=768."
```

**Day 3: Hybrid Retrieval + RRF**
```
AI IDE Prompt:
"Create backend/core/retrieval.py using Prompt 3 from Shriji_AI_IDE_Quick_Start_v3.md.
Create backend/core/rrf.py and backend/core/bm25.py using Prompt 4.
Then write a quick test script backend/scripts/test_retrieval.py that:
1. Embeds query 'I am very angry what should I do'
2. Runs hybrid_retrieve with emotion='anger', domain='anger_management'
3. Runs bm25_score on the candidates
4. Runs rrf_rerank and prints top-5 chunk_ids with scores
Expected top results: BG_16_21, BG_05_23, BG_03_37"
```

**Day 4: Classifier + Language Module**
```
AI IDE Prompt:
"Create backend/core/classifier.py using Prompt 5 from Shriji_AI_IDE_Quick_Start_v3.md.
Create backend/core/language.py with:
1. detect_language(text: str) -> str using langdetect
2. translate_to_english(text: str, source_lang: str) -> str using Groq temp=0.1
3. translate_from_english(text: str, target_lang: str) -> str using Groq temp=0.1
4. Preserve Sanskrit citations unchanged: do not translate 'BG X.Y' patterns
Test with: 'मुझे बहुत गुस्सा आता है क्या करूँ' → should classify anger + anger_management"
```

**Day 5: Pydantic Schemas + Main App**
```
AI IDE Prompt:
"Create backend/models/schemas.py using Prompt 8 from Shriji_AI_IDE_Quick_Start_v3.md.
Create backend/main.py using Prompt 1.
Start the server: uvicorn main:app --reload
Test: curl http://localhost:8000/api/health
Expected: {status: 'healthy', pinecone_connected: true, redis_connected: true, bm25_loaded: true}"
```

**Day 6: Chat + Gita API Endpoints**
```
AI IDE Prompt:
"Create backend/api/chat.py using Prompt 6 from Shriji_AI_IDE_Quick_Start_v3.md
— the full 10-step pipeline.
Create backend/api/gita.py using Prompt 7.
Test the chat endpoint:
curl -X POST http://localhost:8000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{\"message\": \"How do I control my anger?\", \"session_id\": \"test\"}'
Verify response has: answer, shlokas[], emotion_detected='anger', cached=false"
```

**Day 7: Testing + Bug Fixes**
```
AI IDE Prompt:
"Create tests/backend/test_api.py with pytest tests:
1. test_health_check() — GET /api/health returns 200
2. test_chat_english() — English anger query returns shlokas
3. test_chat_hindi() — Hindi query returns Hindi answer
4. test_chat_cache() — Same query twice: second has cached=true
5. test_gita_chapters() — GET /api/gita/chapters returns 18 items
6. test_verse_detail() — GET /api/gita/verse/BG_02_47 returns all fields
7. test_daily_verse() — GET /api/daily-verse returns a valid verse
Run: pytest tests/backend/ -v and fix all failures."
```

---

### WEEK 2: Frontend (Days 8–14)

---

**Day 8: Next.js App Shell + Theme**
```
AI IDE Prompt:
"Set up the Next.js frontend shell for Shriji in frontend/.
Create:
1. app/layout.tsx — root layout with:
   - Navbar with: 🕉️ Shriji logo, links to /chat and /gita, language picker
   - Saffron/gold/cream theme using Tailwind config
   - Google Fonts: Noto Sans Devanagari for Sanskrit text
2. app/page.tsx — landing page with:
   - Hero: '🕉️ Ask any question. Receive Gita's wisdom.' CTA → /chat
   - Daily verse widget (fetches from /api/daily-verse)
   - 3 example queries as clickable chips
   - 'Browse the Gita' CTA → /gita
Colors: saffron #C0570A, gold #C9933A, cream #FFF8F0, dark navy #1A1A2E"
```

**Day 9: API Client + Hooks**
```
AI IDE Prompt:
"Create frontend/lib/api.ts with:
1. sendQuery(message, sessionId, language) → POST /api/chat → ChatResponse
2. getDailyVerse(language?) → GET /api/daily-verse
3. getChapters() → GET /api/gita/chapters
4. getChapter(n) → GET /api/gita/chapter/[n]
5. getVerse(chunkId) → GET /api/gita/verse/[chunk_id]
6. getVersesByTheme(tag) → GET /api/gita/theme/[tag]
7. getTTS(text) → GET /api/tts?text=[text] (returns audio blob URL)
Use axios with NEXT_PUBLIC_API_URL base URL. Add error handling with typed errors."
```

**Day 10: Chat Interface**
```
AI IDE Prompt:
"Create frontend/components/chat/ChatWindow.tsx using Prompt 10
from Shriji_AI_IDE_Quick_Start_v3.md.
Create frontend/components/chat/EmotionBadge.tsx:
- Displays emotion_detected and domain_detected as colored chips
- Anger: red, Fear: blue, Grief: gray, Confusion: amber, etc.
Create app/chat/page.tsx that renders ChatWindow full height."
```

**Day 11: ShlokaCard Component**
```
AI IDE Prompt:
"Create frontend/components/chat/ShlokaCard.tsx using Prompt 11
from Shriji_AI_IDE_Quick_Start_v3.md.
Create frontend/components/chat/VoiceInput.tsx:
- Mic button using Web Speech API
- On result: populate chat input with transcript
- Visual pulse animation while listening
Test ShlokaCard by rendering BG_02_47 manually with dummy data."
```

**Day 12: Gita Reader — Data + Search**
```
AI IDE Prompt:
"Create frontend/lib/gita-data.js using Prompt 13
from Shriji_AI_IDE_Quick_Start_v3.md.
Create app/gita/search/page.tsx:
- Search input with debounce 300ms
- Results list using Fuse.js searchGita()
- Each result: verse_range, english preview, chapter_title, theme chips
- Empty state: 'Search by verse, topic, emotion, or key concept'
Test: searching 'karma' should return BG 2.47, 3.19, 18.66 etc."
```

**Day 13: Gita Reader — Browse + Verse Detail**
```
AI IDE Prompt:
"Create the Gita Reader pages using Prompt 12 from Shriji_AI_IDE_Quick_Start_v3.md:
1. app/gita/page.tsx — chapter grid
2. app/gita/chapter/[n]/page.tsx — chapter view
3. app/gita/verse/[chapter]/[verse]/page.tsx — verse detail with ALL 15 fields
4. app/gita/bookmarks/page.tsx

Create frontend/components/gita/VerseDetail.tsx that renders:
- Sanskrit in large Devanagari font
- Transliteration italic
- EN/HI translation toggle
- Expandable EN/HI commentary
- Theme, emotion, domain, key concept chips
- Related verse links"
```

**Day 14: Mobile Responsiveness + PWA**
```
AI IDE Prompt:
"Make entire frontend mobile responsive for Shriji:
1. Responsive navbar (hamburger menu on mobile)
2. Chat: full-screen on mobile, no sidebar
3. Gita chapter grid: 1 col on mobile, 2 on tablet, 3 on desktop
4. ShlokaCard: stacked layout on mobile, comfortable touch targets (min 44px)
5. Add frontend/public/manifest.json for PWA support with Shriji icon
6. Add meta viewport and theme-color tags
Test on: iPhone SE (375px), iPad (768px), Desktop (1280px) viewports."
```

---

### WEEK 3: Integration, Deploy & Polish (Days 15–21)

---

**Day 15: TTS Endpoint + Voice Integration**
```
AI IDE Prompt:
"Create backend/api/tts.py:
GET /api/tts?text={text}&lang={lang}
1. Generate audio using gTTS for the given text + language
2. Return audio file as StreamingResponse with audio/mpeg content-type
3. Cache generated audio in Upstash Redis for 24h (key: md5 of text+lang)

Wire up frontend:
1. ShlokaCard Listen button calls /api/tts with sanskrit_devanagari
2. Chat response area: play answer audio automatically if voice mode on
3. VoiceInput.tsx: Web Speech API for microphone input"
```

**Day 16: End-to-End Testing**
```
AI IDE Prompt:
"Create tests/e2e/test_full_pipeline.py with pytest tests:
1. test_hindi_anger() — 'मुझे बहुत गुस्सा आता है' → answer in Hindi,
   emotion=anger, top shloka contains BG_16 or BG_05
2. test_english_grief() — 'I lost someone I love, I am grieving' →
   emotion=grief, domain=grief_loss
3. test_career_anxiety() — 'I don't know what career path to choose' →
   domain=career_anxiety, cites BG 3.35 or BG 18.47
4. test_cache_hit() — same query twice, second response has cached=true
5. test_gita_reader_chain() — get chapters → get chapter 2 → get BG_02_47
   → verify all 15 fields present
6. test_rrf_diversity() — top-5 results should have at least 3 different chapters
Run all: pytest tests/e2e/ -v --timeout=30"
```

**Day 17: Performance + Rate Limiting**
```
AI IDE Prompt:
"Optimize Shriji performance:
1. Add slowapi rate limiter to backend/main.py: 10 requests/minute per IP
2. Add startup pre-warming: embed a dummy query on startup to prime Gemini connection
3. Add Groq retry logic in all Groq calls: max 3 retries,
   delays 2s/4s/8s (exponential backoff)
4. Add /api/warmup endpoint that pings Pinecone + Gemini + Groq for health check
5. Add a Render keep-alive: create a cron script that pings /api/health every 10min
   (document this in README for Render deployment)
6. Add Redis embedding cache hit/miss logging for monitoring"
```

**Day 18: Deployment — Backend on Render**
```
AI IDE Prompt:
"Prepare backend for Render free tier deployment:
1. Create backend/render.yaml with Python env, uvicorn start command,
   GEMINI_API_KEY + GROQ_API_KEY + PINECONE_API_KEY + SUPABASE_* + UPSTASH_* env vars
2. Create backend/Procfile: web: uvicorn main:app --host 0.0.0.0 --port $PORT
3. Update CORS in main.py to allow production Vercel URL
4. Create docs/RENDER_DEPLOY.md with step-by-step:
   - Push to GitHub
   - Create Render Web Service from repo
   - Set all env vars
   - Run ingest.py from Render Shell (one-time)
   - Test: curl https://your-app.onrender.com/api/health"
```

**Day 19: Deployment — Frontend on Vercel**
```
AI IDE Prompt:
"Prepare frontend for Vercel deployment:
1. Create frontend/vercel.json with build settings and rewrites
2. Add frontend/.env.production with NEXT_PUBLIC_API_URL pointing to Render URL
3. Create docs/VERCEL_DEPLOY.md with step-by-step:
   - Push to GitHub
   - Import project on Vercel
   - Set NEXT_PUBLIC_API_URL env var
   - Deploy and test
4. Update Render CORS to allow the Vercel production URL
5. Test complete flow: Vercel frontend → Render backend → Pinecone → Groq"
```

**Day 20: Final Integration Testing**
```
AI IDE Prompt:
"Run complete production smoke test for Shriji:
1. Test 5 queries in different languages:
   - English: 'How do I find purpose in life?'
   - Hindi: 'मुझे डर लग रहा है'
   - Bengali: 'আমি খুব চিন্তিত'
   - Tamil: 'என் வாழ்க்கை என்ன?'
   - Gujarati: 'મારે શું કરવું?'
2. Verify: each returns answer in correct language, shlokas cited, no hallucination
3. Test Gita Reader: browse chapter 2, open BG 2.47, check all 15 fields display
4. Test voice: microphone input + TTS playback
5. Test shloka share: verify canvas card generation
Fix any remaining bugs."
```

**Day 21: Docs, README, Launch**
```
AI IDE Prompt:
"Create final documentation for Shriji:
1. README.md with:
   - Project description and screenshot
   - Setup instructions (5-minute quick start)
   - Architecture overview (Gemini embed → Pinecone → RRF → Groq)
   - Environment variables reference
   - Contributing guide
2. docs/API.md — document all endpoints with request/response examples
3. Add Swagger UI via FastAPI's built-in /docs endpoint
4. Update privacy policy disclaimer in frontend footer
5. Run final deployment checklist (see bottom of this document)
Jai Shri Krishna! 🕉️ Shriji is live!"
```

---

## 🎯 CHECKPOINT VALIDATIONS

### Week 1 Checkpoint — Backend

```bash
# Verify Pinecone ingestion
python scripts/test_retrieval.py
# Expected: top-5 chunk_ids for 'anger' query includes BG_16_21

# Verify full chat pipeline
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "मुझे बहुत गुस्सा आता है", "session_id": "test"}'
# Expected: Hindi answer, emotion_detected: "anger", shlokas with BG chapter 16 or 5

# Verify daily verse
curl http://localhost:8000/api/daily-verse
# Expected: valid verse JSON with sanskrit_devanagari field

# Run backend tests
pytest tests/backend/ -v
# Expected: all 7 tests pass
```

### Week 2 Checkpoint — Frontend

```bash
cd frontend && npm run dev
# Visit http://localhost:3000

# Verify:
# ✓ Landing page shows daily verse
# ✓ /chat — type query, see shloka cards in response
# ✓ /gita — chapter grid shows 18 chapters
# ✓ /gita/chapter/2 — shows all Sankhya Yoga verses
# ✓ /gita/verse/2/47 — BG 2.47 full detail with all fields
# ✓ /gita/search — Fuse.js search works offline
# ✓ Mobile responsive at 375px width
```

### Week 3 Checkpoint — Production

```bash
# Backend health
curl https://your-app.onrender.com/api/health
# Expected: {"status": "healthy", "pinecone_connected": true, ...}

# Production chat test
curl -X POST https://your-app.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I control anger?", "session_id": "prod-test"}'
# Expected: < 2s response, cited shlokas include BG 16.21

# Run e2e tests against production
SHRIJI_API_URL=https://your-app.onrender.com pytest tests/e2e/ -v
# Expected: all 6 tests pass

# Visit https://your-app.vercel.app
# Complete 5 queries in 5 languages
```

---

## 🔧 COMMON AI IDE COMMANDS

### Create a File:
```
"Create [filepath] following [Prompt N] from Shriji_AI_IDE_Quick_Start_v3.md"
```

### Add a Feature:
```
"Update backend/core/rrf.py to add diversity injection:
after RRF reranking top-10, if more than 2 results share the same chapter,
keep only the top 1 from that chapter and fill with next-ranked results"
```

### Debug an Error:
```
"Fix error in backend/core/retrieval.py:
PineconeException: Dimension mismatch — index expects 768, got 384.
This means the Pinecone index was created with old dimension.
Help me: 1) delete old index, 2) create new one with dimension=768,
3) re-run ingest.py"
```

### Write Tests:
```
"Create pytest tests for backend/core/rrf.py with 4 test cases:
1. test_rrf_top_result — verse in all 3 lists should score highest
2. test_rrf_unique_ids — no duplicate chunk_ids in output
3. test_rrf_respects_top_n — returns exactly top_n results
4. test_rrf_empty_list — handles one empty ranked list gracefully"
```

---

## 🐛 TROUBLESHOOTING

### Issue: Pinecone Dimension Mismatch (384 vs 768)

```
AI IDE Prompt:
"Pinecone query fails with dimension mismatch. My index was created for 384-dim
(allMiniLM) but I need 768-dim (Gemini text-embedding-004).
Fix:
1. Delete old index in Pinecone console
2. Update create_index.py to use dimension=768
3. Re-run ingest.py to re-embed all 700 verses
Note: this is a one-time migration — takes ~5 min to ingest 700 verses
at batch size 50 with Gemini API."
```

### Issue: Gemini Embedding Rate Limit

```
AI IDE Prompt:
"Gemini API returns 429 Too Many Requests during ingestion.
Fix backend/scripts/ingest.py:
1. Reduce batch size from 50 to 20
2. Add time.sleep(0.1) between each individual embed call
3. Add exponential backoff: on 429, wait 5s, retry up to 3 times
4. Add progress checkpoint: save last ingested chunk_id to a file
   so script can resume from where it stopped"
```

### Issue: Groq Rate Limit (30 RPM)

```
AI IDE Prompt:
"Shriji returns 429 errors after a few queries — Groq rate limit hit.
Fix:
1. Add slowapi rate limiter: 8 requests per minute per IP (leave buffer)
2. Add Redis cache check at the VERY FIRST step in chat.py
   before any API calls
3. Combine translation + classification into ONE Groq call
   instead of two separate calls (saves 1 RPM per query)
4. Use llama-3.1-8b-instant (faster, cheaper RPM) for
   translation-only calls, keep 70B only for final answer generation"
```

### Issue: BM25 Index Empty or Stale

```
AI IDE Prompt:
"BM25 scoring returns all-zero scores.
Debug backend/core/bm25.py:
1. Verify gita_verses_enhanced.json loads correctly at module import
2. Print len(CORPUS) — should be ~700
3. Print CORPUS[0]['english'] — should have text
4. Test BM25_INDEX.get_scores('anger'.split()) — should return non-zero for some docs
5. Check that bm25.py module is imported in main.py startup
6. The BM25 index must be rebuilt from the JSON on every Render cold start —
   confirm this happens in main.py startup event"
```

### Issue: RRF Returns Less Than 5 Results

```
AI IDE Prompt:
"rrf_rerank returns only 2-3 results instead of 5.
Debug backend/core/rrf.py:
1. Print len(dense_list), len(meta_list), len(bm25_list) before merging
2. Check doc_map construction — ensure all 3 lists contribute to it
3. If dense_list has <5 items, increase top_k in Pinecone query to 25
4. If meta_list is empty (emotion not matching any tag), add fallback:
   if meta_list is empty, use dense_list as both dense and meta signals"
```

### Issue: Hindi Answer Contains English Words

```
AI IDE Prompt:
"Shriji answers Hindi questions with mixed Hindi/English text.
Fix backend/core/language.py translate_from_english():
1. Strengthen prompt: 'Translate ENTIRELY to Hindi/[lang]. Do not mix languages.
   Keep only Sanskrit terms and BG X.Y citations in their original form.'
2. Add post-processing: check if response has more than 20% ASCII characters
   — if so, re-translate with stricter prompt
3. Test with: 'You should do your duty without attachment to results (BG 2.47)'"
```

### Issue: Render App Sleeps (Free Tier Spin-Down)

```
AI IDE Prompt:
"Render free tier spins down after 15 min inactivity — first request takes 30s.
Fix:
1. Create scripts/keepalive.py:
   import requests, time
   while True:
       requests.get('https://your-app.onrender.com/api/health')
       time.sleep(600)  # ping every 10 minutes
2. Run keepalive.py as a background job on any always-on machine
   OR use a free cron service like cron-job.org to ping /api/health every 10min
3. Alternatively: add /api/warmup endpoint that does a dummy embed + Pinecone ping
   to fully warm the app in one call"
```

---

## 📚 REFERENCE DOCUMENTS

When prompting your AI IDE, reference these sections:

| Task | Document | Section |
|---|---|---|
| Full pipeline flow | Shriji_TechStack_v3.md | End-to-End Query Flow |
| Gemini embedding code | Shriji_TechStack_v3.md | Gemini Embedding Implementation |
| RRF reranking code | Shriji_TechStack_v3.md | RRF Reranking Implementation |
| Pinecone ingestion | Shriji_TechStack_v3.md | Ingestion Script |
| API endpoints | Shriji_TechStack_v3.md | Key API Endpoints |
| Pydantic schemas | Shriji_TechStack_v3.md | (Part 2 → schemas) |
| Groq prompts | Shriji_TechStack_v3.md | Groq Integration & Prompts |
| Gita Reader routes | Shriji_PRD_v3.md | Gita Reader Pages & Routes |
| Gita Reader UX | Shriji_PRD_v3.md | Gita Reader UX Features |
| Chat requirements | Shriji_PRD_v3.md | AI Chat Module |
| User stories | Shriji_PRD_v3.md | Key User Stories |
| Deployment config | Shriji_TechStack_v3.md | Deployment & Infrastructure |

---

## ✅ FINAL DEPLOYMENT CHECKLIST

Before going live, verify every item:

**Data & Backend**
- [ ] All 700 verses ingested — Pinecone shows ~750 vectors at dimension=768
- [ ] BM25 index builds on startup (verify in Render logs)
- [ ] Daily verse rotating correctly (test on 3 different days)
- [ ] All 12 language translations working
- [ ] Response time < 1.5s on production (p95)
- [ ] Redis cache working — second identical query has `cached: true`
- [ ] Groq retry logic tested (simulate 429 response)
- [ ] Rate limiting active (10 req/min per IP)

**Frontend**
- [ ] Chat UI functional on production URL
- [ ] Gita Reader — all 18 chapters browseable
- [ ] Verse detail shows all 15 fields including commentary
- [ ] Fuse.js search returns relevant results
- [ ] Bookmarks persist in localStorage across page refresh
- [ ] ShlokaCard share generates shloka image correctly
- [ ] Voice input (Web Speech API) works on Chrome
- [ ] TTS audio plays for Sanskrit verse
- [ ] Mobile responsive — tested at 375px, 768px, 1280px

**Infrastructure & Security**
- [ ] All API keys in environment variables — none hardcoded
- [ ] CORS restricted to production Vercel URL
- [ ] HTTPS enabled (automatic on Render + Vercel)
- [ ] Render keep-alive cron set up (cron-job.org ping every 10min)
- [ ] Supabase conversation history storing correctly
- [ ] Swagger docs accessible at /docs

**Quality & Ethics**
- [ ] 5 queries tested in English, Hindi, Bengali, Tamil, Gujarati
- [ ] Answers are shloka-grounded — no hallucination
- [ ] Crisis keyword detection working (test: "I want to end my life")
- [ ] Disclaimer shown on every AI response
- [ ] API documentation published at /docs

---

## 💡 PRO TIPS FOR AI IDEs

1. **Always give full context in Prompt 1:**
   ```
   "I'm building Shriji — a Bhagavad Gita AI assistant.
   Stack: Gemini text-embedding-004 + Pinecone + RRF + Groq.
   Reference: Shriji_TechStack_v3.md and Shriji_PRD_v3.md.
   Start with [specific task]."
   ```

2. **Reference exact sections, not whole docs:**
   > ✅ `"Following Shriji_TechStack_v3.md section 'RRF Reranking Implementation', create..."`
   > ❌ `"Following the tech stack doc, create a reranker"`

3. **One file at a time + test before proceeding:**
   Build `embedder.py` → test embed one verse → then build `retrieval.py`. Don't batch Day 1–3 into one prompt.

4. **Paste error messages verbatim:**
   ```
   "Fix this error in backend/core/rrf.py:
   KeyError: 'chunk_id' at line 18
   [paste full traceback]"
   ```

5. **Ask for types explicitly:**
   > `"Use Pydantic v2 models. All async functions. Type-hint every parameter and return value."`

6. **Validate the RRF output manually:**
   After Day 3, run `test_retrieval.py` yourself with real queries:
   - `"I am angry"` → should return BG_16_21 in top-3
   - `"career confusion"` → should return BG_03_35 or BG_18_47 in top-3
   - `"fear of failure"` → should return BG_02_14 in top-3

---

## 🚀 YOUR FIRST PROMPT

Copy this exactly into your AI IDE to begin:

```
I want to build Shriji — a free Bhagavad Gita AI assistant.

My reference documents:
1. Shriji_PRD_v3.md — product requirements
2. Shriji_TechStack_v3.md — full technical architecture
3. Shriji_AI_IDE_Quick_Start_v3.md — this guide

Tech stack:
- Embedding: Gemini text-embedding-004 API (768-dim, 0MB RAM on server)
- Vector DB: Pinecone Starter (free, 2GB)
- Reranking: RRF algorithm — pure Python, no model, ~1ms
- LLM: Groq Llama 3.3 70B (free tier)
- Backend: FastAPI + Python 3.11
- Frontend: Next.js 14 App Router + Tailwind
- Cache: Upstash Redis | DB: Supabase | Deploy: Render + Vercel

Start with Day 1 of the 21-day roadmap:
1. Create the complete folder structure
2. Add __init__.py to all Python packages
3. Create placeholder files for all modules
4. Create backend/scripts/create_index.py to create
   Pinecone index with dimension=768

Let's go. 🕉️
```

---

**Jai Shri Krishna! 🙏 Let's build something that helps millions.**

---

**Document Version:** 3.0  
**Stack:** Gemini Embedding · Pinecone · RRF · Groq · FastAPI · Next.js  
**Last Updated:** March 2026  
**Status:** READY FOR AI-ASSISTED DEVELOPMENT  
