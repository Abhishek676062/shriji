"use client";

import React, { useState } from 'react';
import { gitaData } from '@/lib/gita-data';
import { Search, Loader2 } from 'lucide-react';
import VerseCard from '@/components/gita/VerseCard';

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Apply debounce so standard typed keypresses map effectively against big offline array without jitter
  React.useEffect(() => {
    setIsTyping(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setIsTyping(false);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const results = gitaData.searchGita(debouncedQuery, 30); // Limiting results payload rendering vectors max 30

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      
      <div className="flex flex-col gap-2 mb-8 items-center text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-cream mt-4 mb-2">Search The Gita</h1>
        <p className="text-cream/60 text-sm">
          Semantically explore 701 verses querying across offline Sanskrit vectors, emotions, tags, or concepts exactly.
        </p>
      </div>

      <div className="relative mb-10 group max-w-2xl mx-auto shadow-sm">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
           {isTyping ? <Loader2 className="w-6 h-6 text-saffron/40 animate-spin" /> : <Search className="w-6 h-6 text-saffron/40 group-focus-within:text-saffron transition-colors" />}
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try testing 'karma', 'anxiety', 'death', 'BG 2.47'..."
          className="w-full h-16 bg-white border border-saffron/20 rounded-2xl pl-14 pr-6 text-cream placeholder:text-cream/30 focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron text-lg shadow-[0_4px_14px_rgba(0,0,0,0.03)] transition-all"
        />
      </div>

      {debouncedQuery.trim() === "" ? (
        <div className="flex flex-col items-center justify-center p-12 text-center opacity-70">
          <span className="text-6xl mb-4 grayscale opacity-20 relative top-1">🪷</span>
          <p className="text-cream font-semibold text-lg max-w-xs leading-relaxed">Seek knowledge via verses, psychological domains, or literal tags.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-sm font-bold text-cream/50 border-b border-cream/5 pb-2">
            <span>Querying Offline Vectors...</span>
            <span className="text-saffron">{results.length} Matches Found</span>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center text-cream/60">
              No shlokas directly matched your constraints. Try a broader emotional state.
            </div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {results.map(r => (
                  <VerseCard 
                    key={r.chunk_id}
                    chunk_id={r.chunk_id}
                    chapter={r.chapter}
                    verse_range={r.verse_range}
                    english={r.english}
                    sanskrit_devanagari={r.sanskrit_devanagari}
                    theme_tags={r.theme_tags}
                  />
               ))}
             </div>
          )}
        </div>
      )}
    </div>
  );
}
