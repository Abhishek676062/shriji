"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { api, ShlokaCard as ShlokaCardData, StreamEvent } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import EmotionBadge from './EmotionBadge';
import ShlokaCard from './ShlokaCard';
import VoiceInput from './VoiceInput';
import { Send, Loader2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
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
  streaming?: boolean;
  response?: {
    emotion_detected?: string;
    domain_detected?: string;
    shlokas?: ShlokaCardData[];
    language?: string;
    session_id?: string;
  };
}

export default function ChatWindow() {
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedVerses, setExpandedVerses] = useState<Record<number, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const q = searchParams?.get('q');
  const [initialRun, setInitialRun] = useState(false);
  
  // Local language override for chat specifically
  const [chatLang, setChatLang] = useState<string>(lang);

  // Sync with global language change if user hasn't manually overridden it recently, but for now just init with global lang
  useEffect(() => {
    setChatLang(lang);
  }, [lang]);

  // Initialize greeting based on language
  useEffect(() => {
    setMessages([
      { role: 'assistant', content: t('chat.greeting') }
    ]);
  }, [lang, t]);

  // Session ID
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') return "";
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
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
    if (q && !initialRun && !loading && messages.length === 1) {
       setInitialRun(true);
       fireSend(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, initialRun, loading, messages.length]); 

  // Build conversation history for context
  const getHistory = useCallback(() => {
    return messages
      .reduce((acc: Array<{user: string; assistant: string}>, msg, idx) => {
        if (msg.role === 'user') {
          const next = messages[idx + 1];
          if (next && next.role === 'assistant') {
            acc.push({ user: msg.content, assistant: next.content });
          }
        }
        return acc;
      }, [])
      .slice(-4);
  }, [messages]);

  const fireSend = async (customInput: string) => {
    const userMsg = customInput.trim();
    if (!userMsg || loading) return;
    
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    // Add placeholder assistant message for streaming
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);

    const history = getHistory();

    try {
      await api.sendQueryStream(
        userMsg,
        sessionId,
        chatLang, // Use the selected chat language
        history,
        (event: StreamEvent) => {
          switch (event.type) {
            case 'token':
              setMessages(prev => {
                const updated = [...prev];
                // CRITICAL FIX: Deep copy the last message object to prevent React StrictMode double-mutation
                const last = updated.length > 0 ? { ...updated[updated.length - 1] } : null;
                if (last && last.role === 'assistant') {
                  last.content += event.content;
                  updated[updated.length - 1] = last;
                }
                return updated;
              });
              break;
            
            case 'translated':
              // Replace the entire content with translated version
              setMessages(prev => {
                const updated = [...prev];
                const last = updated.length > 0 ? { ...updated[updated.length - 1] } : null;
                if (last && last.role === 'assistant') {
                  last.content = event.content;
                  updated[updated.length - 1] = last;
                }
                return updated;
              });
              break;

            case 'metadata':
              setMessages(prev => {
                const updated = [...prev];
                const last = updated.length > 0 ? { ...updated[updated.length - 1] } : null;
                if (last && last.role === 'assistant') {
                  last.streaming = false;
                  last.response = {
                    emotion_detected: event.emotion_detected,
                    domain_detected: event.domain_detected,
                    shlokas: event.shlokas,
                    language: event.language,
                    session_id: event.session_id,
                  };
                  updated[updated.length - 1] = last;
                }
                return updated;
              });
              break;

            case 'done':
              setMessages(prev => {
                const updated = [...prev];
                const last = updated.length > 0 ? { ...updated[updated.length - 1] } : null;
                if (last) {
                  last.streaming = false;
                  updated[updated.length - 1] = last;
                }
                return updated;
              });
              setLoading(false);
              break;

            case 'error':
              setMessages(prev => {
                const updated = [...prev];
                const last = updated.length > 0 ? { ...updated[updated.length - 1] } : null;
                if (last && last.role === 'assistant') {
                  last.content = `${t('chat.error_prefix')}: ${event.content}`;
                  last.streaming = false;
                  updated[updated.length - 1] = last;
                }
                return updated;
              });
              setLoading(false);
              break;
          }
        }
      );
    } catch (err) {
      const e = err as Error;
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant') {
          last.content = `${t('chat.error_prefix')}: ${e.message || "Failed to reach server."}`;
          last.streaming = false;
        }
        return updated;
      });
      setLoading(false);
    }
  };

  const handleSend = () => fireSend(input);

  const toggleVerses = (idx: number) => {
    setExpandedVerses(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] sm:h-[calc(100vh-6rem)] w-full max-w-4xl mx-auto rounded-2xl sm:rounded-3xl border border-saffron/20 shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm">
      
      {/* Header */}
      <div className="glass-panel border-b border-saffron/20 px-4 sm:px-5 py-3 flex justify-between items-center shadow-sm">
        <h2 className="text-cream font-bold flex items-center gap-2 text-base sm:text-lg">
          <span className="text-xl sm:text-2xl">🪷</span> {t('chat.title')}
        </h2>
        <select 
          value={chatLang}
          onChange={(e) => setChatLang(e.target.value)}
          className="bg-navy/50 border border-saffron/30 text-cream text-xs sm:text-sm rounded-lg focus:ring-1 focus:ring-saffron focus:border-saffron p-1.5 shadow-sm outline-none font-bold"
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code} className="bg-navy text-cream font-medium">{l.label}</option>
          ))}
        </select>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6 scroll-smooth">
        {messages.map((m, idx) => {
          if (m.role === 'assistant' && !m.content) return null;
          
          return (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-sm ${
              m.role === 'user' 
                ? 'bg-saffron text-white rounded-br-none' 
                : 'glass-panel text-cream rounded-bl-none border border-saffron/10'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed opacity-95 text-[14px] sm:text-[15px]">
                {m.content}
                {m.streaming && <span className="inline-block w-2 h-4 bg-saffron/60 animate-pulse ml-0.5 rounded-sm" />}
              </div>
              
              {/* Metadata & Collapsible Cited Verses */}
              {m.role === 'assistant' && m.response && !m.streaming && (
                <div className="mt-3 pt-3 border-t border-cream/10 flex flex-col gap-2">
                  <EmotionBadge 
                    emotion={m.response.emotion_detected} 
                    domain={m.response.domain_detected} 
                  />
                  
                  {/* Collapsible Cited Verses */}
                  {m.response.shlokas && m.response.shlokas.length > 0 && (
                    <div className="mt-2">
                      <button
                        onClick={() => toggleVerses(idx)}
                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-saffron opacity-80 hover:opacity-100 transition-opacity w-full py-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{t('chat.cited_verses')} ({m.response.shlokas.length})</span>
                        {expandedVerses[idx] 
                          ? <ChevronUp className="w-3.5 h-3.5 ml-auto" />
                          : <ChevronDown className="w-3.5 h-3.5 ml-auto" />
                        }
                      </button>
                      
                      {expandedVerses[idx] && (
                        <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-300">
                          {m.response.shlokas.map((s: ShlokaCardData, sIdx: number) => (
                            <div key={sIdx} className="w-full">
                              <ShlokaCard shloka={s} compact />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          );
        })}
        
        {/* Loading state only if no streaming content yet */}
        {loading && (!messages.length || messages[messages.length - 1]?.role === 'user' || (messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content)) && (
          <div className="flex justify-start">
            <div className="glass-panel rounded-2xl rounded-bl-none border border-saffron/10 px-4 sm:px-5 py-3 sm:py-4 shadow-sm flex items-center gap-3 animate-pulse">
              <span className="text-xl sm:text-2xl animate-bounce">🪷</span>
              <span className="text-cream/60 font-medium text-xs sm:text-sm">{t('chat.thinking')}</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-1 text-transparent">-</div>
      </div>

      {/* Input Module */}
      <div className="glass-panel border-t border-saffron/20 p-3 sm:p-4">
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
            placeholder={t('chat.placeholder')}
            className="w-full bg-navy/50 border border-saffron/30 rounded-2xl pl-4 pr-20 sm:pr-24 py-3 focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron text-cream resize-none shadow-sm placeholder:text-cream/40 text-sm sm:text-base"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <div className="absolute right-2 bottom-1.5 sm:bottom-2 flex items-center gap-1">
            <VoiceInput 
              onTranscript={(text) => setInput(prev => prev ? prev + " " + text : text)} 
              lang={chatLang} 
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2 bg-saffron text-white rounded-xl hover:bg-gold transition-colors disabled:opacity-50 disabled:hover:bg-saffron shadow-sm flex items-center justify-center w-[34px] h-[34px] sm:w-[36px] sm:h-[36px]"
            >
              {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
