"use client";

import React, { useState, useRef, useEffect } from 'react';
import { api, ChatResponse, ShlokaCard as ShlokaCardData } from '@/lib/api';
import EmotionBadge from './EmotionBadge';
import ShlokaCard from './ShlokaCard';
import VoiceInput from './VoiceInput';
import { Send, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'sa', label: 'Sanskrit' },
  { code: 'bn', label: 'Bengali' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mr', label: 'Marathi' },
  { code: 'or', label: 'Odia' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'ur', label: 'Urdu' }
];

interface MessageRow {
  role: 'user' | 'assistant';
  content: string;
  response?: ChatResponse;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<MessageRow[]>([
    { role: 'assistant', content: "Namaste. I am Shriji, your guide through the Bhagavad Gita. How may I help clear your mind today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const bottomRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const q = searchParams?.get('q');
  const [initialRun, setInitialRun] = useState(false);

  // Sync global navbar language change events instantly via identical window hooks
  useEffect(() => {
    // On mount grab any existing global sync state
    const current = localStorage.getItem('shriji_global_lang') || 'en';
    if (current !== language) setLanguage(current);

    const handleLangChange = () => {
      setLanguage(localStorage.getItem('shriji_global_lang') || 'en');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  // Persist session locally to pass to backend so UUID works seamlessly
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') return "";
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    // Fallback for non-secure HTTP local mobile testing
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    // Only fire off the automatic query resolution loop once upon load if query exists
    if (q && !initialRun && !loading && messages.length === 1) {
       setInitialRun(true);
       fireSend(q);
    }
  }, [q, initialRun, loading, messages.length]);

  const fireSend = async (customInput: string) => {
    const userMsg = customInput.trim();
    if (!userMsg || loading) return;
    
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const resp = await api.sendQuery(userMsg, sessionId, language);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: resp.answer,
        response: resp
      }]);
    } catch (err) {
      const e = err as Error;
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${e.message || "Failed to reach server. Try again fast."}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => fireSend(input);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full max-w-4xl mx-auto rounded-3xl border border-saffron/20 shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm">
      
      {/* Header Context Controls */}
      <div className="glass-panel border-b border-saffron/20 px-4 py-3 flex justify-between items-center shadow-sm">
        <h2 className="text-cream font-bold flex items-center gap-2">
          <span className="text-xl">🪷</span> Chat with Shriji
        </h2>
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-transparent border-saffron/30 text-cream text-sm rounded-lg focus:ring-saffron focus:border-saffron p-1.5 shadow-sm outline-none font-bold"
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code} className="bg-navy text-cream font-medium">{l.label}</option>
          ))}
        </select>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
              m.role === 'user' 
                ? 'bg-saffron text-white rounded-br-none' 
                : 'glass-panel text-cream rounded-bl-none border border-saffron/10'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed opacity-95 text-[15px]">
                {m.content}
              </div>
              
              {/* If it's the AI and it triggered metadata/shlokas, append badges and cards */}
              {m.role === 'assistant' && m.response && (
                <div className="mt-4 pt-3 border-t border-cream/10 flex flex-col gap-3">
                  <EmotionBadge 
                    emotion={m.response.emotion_detected} 
                    domain={m.response.domain_detected} 
                  />
                  {/* Dummy Shloka Cards for Day 10 (Will be built fully Day 11) */}
                  {m.response.shlokas?.length > 0 && (
                    <div className="text-xs font-semibold uppercase tracking-wide text-saffron opacity-80 mt-2">
                      Cited Verses:
                    </div>
                  )}
                  {m.response.shlokas?.map((s: ShlokaCardData, sIdx: number) => (
                    <div key={sIdx} className="w-full mt-2">
                      <ShlokaCard shloka={s} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading Pulsating Lotus State */}
        {loading && (
          <div className="flex justify-start">
            <div className="glass-panel rounded-2xl rounded-bl-none border border-saffron/10 px-5 py-4 shadow-sm flex items-center gap-3 animate-pulse">
              <span className="text-2xl animate-bounce">🪷</span>
              <span className="text-cream/60 font-medium text-sm">Shriji is contemplating your karma...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-1 text-transparent">-</div>
      </div>

      {/* Input Module */}
      <div className="glass-panel border-t border-saffron/20 p-4">
        <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Shriji anything..."
            className="w-full bg-navy/50 border border-saffron/30 rounded-2xl pl-4 pr-14 py-3 focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron text-cream resize-none shadow-sm placeholder:text-cream/40"
            rows={1}
            style={{ minHeight: '52px', maxHeight: '120px' }}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <VoiceInput 
              onTranscript={(text) => setInput(prev => prev ? prev + " " + text : text)} 
              lang={language} 
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2 bg-saffron text-white rounded-xl hover:bg-gold transition-colors disabled:opacity-50 disabled:hover:bg-saffron shadow-sm flex items-center justify-center w-[36px] h-[36px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
