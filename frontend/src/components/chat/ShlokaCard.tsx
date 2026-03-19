import React, { useState } from 'react';
import { ShlokaCard as ShlokaCardData } from '@/lib/api';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  shloka: ShlokaCardData;
}

export default function ShlokaCard({ shloka }: Props) {
  const [showHindi, setShowHindi] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full bg-white rounded-2xl p-5 border border-saffron/10 shadow-sm hover:border-saffron/40 hover:shadow-md transition-all group overflow-hidden">
      
      {/* Header Badges */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream/5">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-saffron text-white font-bold text-sm rounded-lg shadow-sm">
            BG {shloka.chapter}:{shloka.verse_range}
          </span>
          {shloka.speaker_tag && <span className="text-xs font-semibold text-gold tracking-wide">{shloka.speaker_tag}</span>}
        </div>
      </div>

      {/* Sanskrit Centerpiece */}
      <div className="text-center my-6 space-y-4">
        <p className="font-sanskrit text-2xl md:text-3xl text-saffron leading-relaxed font-semibold">
          {shloka.sanskrit_devanagari}
        </p>
        <p className="text-cream/60 italic text-sm tracking-wide px-4">
          {shloka.sanskrit_transliterated}
        </p>
      </div>

      {/* Translations */}
      <div className="bg-navy/50 rounded-xl p-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-cream/50 uppercase tracking-widest">Translation</span>
          <button 
            onClick={() => setShowHindi(!showHindi)}
            className="text-xs font-semibold text-saffron hover:underline"
          >
            Switch to {showHindi ? "English" : "Hindi"}
          </button>
        </div>
        <p className="text-cream leading-relaxed text-[15px]">
          {showHindi ? shloka.hindi : shloka.english}
        </p>
      </div>

      {/* Meta Labels & Arrays */}
      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {shloka.theme_tags?.map(t => (
             <span key={t} className="px-2 py-0.5 bg-cream/5 text-cream/70 text-[11px] font-bold rounded-md capitalize">{t.replace("_", " ")}</span>
          ))}
          {shloka.key_concepts?.map(c => (
             <span key={c} className="px-2 py-0.5 bg-gold/10 text-gold text-[11px] font-bold rounded-md capitalize">{c}</span>
          ))}
        </div>
      </div>

      {/* Accordion: Related */}
      {shloka.related_verses?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-cream/5">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-xs font-semibold text-cream/60 hover:text-saffron transition-colors"
          >
            <span>Related Verses</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expanded && (
            <div className="mt-3 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-300">
              {shloka.related_verses.map(v => (
                 <span key={v} className="text-xs px-2 py-1 border border-cream/10 rounded-md text-cream/70 cursor-pointer hover:bg-saffron hover:text-white hover:border-saffron transition-colors">{v}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
