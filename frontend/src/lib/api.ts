/**
 * frontend/lib/api.ts
 * Type-safe API bindings with SSE streaming support.
 */
import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
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

// SSE stream event types
export interface StreamToken { type: 'token'; content: string; }
export interface StreamTranslated { type: 'translated'; content: string; }
export interface StreamMetadata {
  type: 'metadata';
  emotion_detected?: string;
  domain_detected?: string;
  language: string;
  session_id: string;
  shlokas: ShlokaCard[];
}
export interface StreamDone { type: 'done'; }
export interface StreamError { type: 'error'; content: string; }

export type StreamEvent = StreamToken | StreamTranslated | StreamMetadata | StreamDone | StreamError;

export const api = {
  /** 1. Send Query (non-streaming fallback) */
  sendQuery: async (message: string, session_id?: string, language?: string, history?: Array<{user: string; assistant: string}>): Promise<ChatResponse> => {
    try {
      const resp = await API.post<ChatResponse>("/chat", { message, session_id, language, history });
      return resp.data;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        throw new Error(e.response?.data?.detail || "Failed to complete chat query.");
      }
      throw new Error("Failed to complete chat query.");
    }
  },

  /** 1b. Send Query with SSE Streaming */
  sendQueryStream: async (
    message: string,
    session_id: string,
    language: string,
    history: Array<{user: string; assistant: string}>,
    onEvent: (event: StreamEvent) => void
  ): Promise<void> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const response = await fetch(`${baseUrl}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_id, language, history }),
    });

    if (!response.ok) {
      throw new Error(`Stream failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            onEvent(data as StreamEvent);
          } catch {
            // Skip malformed JSON
          }
        }
      }
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
    return `${API.defaults.baseURL}/tts?text=${encodeURIComponent(text)}`;
  }
};
