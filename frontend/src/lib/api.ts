/**
 * frontend/lib/api.ts
 * Type-safe Axios bindings fetching 7 routes against the Next backend domain.
 */
import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://shriji.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export interface ShlokaCard {
  chunk_id: string;
  chapter: number;
  verse_range: string;
  sanskrit_devanagari: string;
  sanskrit_transliterated: string;
  english: string;
  hindi: string;
  theme_tags: string[];
  emotional_tags: string[];
  key_concepts: string[];
  related_verses: string[];
  rrf_score?: number;
  speaker_tag?: string;
  chapter_title?: string;
  english_commentary?: string;
  hindi_commentary?: string;
  problem_domains?: string[];
}

export interface ChatResponse {
  answer: string;
  shlokas: ShlokaCard[];
  emotion_detected?: string;
  domain_detected?: string;
  language?: string;
  cached: boolean;
  session_id: string;
}

export interface ChapterSummary {
  chapter: number;
  chapter_title: string;
  verse_count: number;
}

export const api = {
  /** 1. Send Query directly resolving LLM payload */
  sendQuery: async (message: string, session_id?: string, language?: string): Promise<ChatResponse> => {
    try {
      const resp = await API.post<ChatResponse>("/chat", { message, session_id, language });
      return resp.data;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        throw new Error(e.response?.data?.detail || "Failed to complete chat query.");
      }
      throw new Error("Failed to complete chat query.");
    }
  },

  /** 2. GET Daily Verse from cache */
  getDailyVerse: async () => {
    try {
      const resp = await API.get("/daily-verse");
      return resp.data;
    } catch (e) {
      console.error(e); return null;
    }
  },

  /** 3. Fetch base chapter architecture map */
  getChapters: async (): Promise<ChapterSummary[]> => {
    const resp = await API.get<ChapterSummary[]>("/gita/chapters");
    return resp.data;
  },

  /** 4. Get isolated chapter arrays */
  getChapter: async (n: number) => {
    const resp = await API.get(`/gita/chapter/${n}`);
    return resp.data;
  },

  /** 5. Get complete verse detail directly */
  getVerse: async (chunkId: string) => {
    const resp = await API.get(`/gita/verse/${chunkId}`);
    return resp.data;
  },

  /** 6. Get mapped vectors resolving generic thematic concepts */
  getVersesByTheme: async (tag: string) => {
    const resp = await API.get(`/gita/theme/${tag}`);
    return resp.data;
  },

  /** 7. Return Audio Buffer URL (TTS Stub) */
  getTTS: (text: string) => {
    // Generate valid endpoint URL string for the native audio element to consume directly
    return `${API.defaults.baseURL}/tts?text=${encodeURIComponent(text)}`;
  }
};
