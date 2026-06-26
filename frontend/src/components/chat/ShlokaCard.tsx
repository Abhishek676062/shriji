import React, { useState } from 'react';
import { ShlokaCard as ShlokaCardData } from '@/lib/api';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface Props {
  shloka: ShlokaCardData;
  compact?: boolean;
}

export default function ShlokaCard({ shloka, compact = false }: Props) {
  const [showHindi, setShowHindi] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyVerse = async () => {
    const text = `BG ${shloka.chapter}:${shloka.verse_range}\n\n${shloka.sanskrit_devanagari}\n\n${shloka.english}\n\n${shloka.hindi}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div className="w-full bg-navy/30 rounded-xl p-3 sm:p-4 border border-saffron/10 hover:border-saffron/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-0.5 bg-saffron text-white font-bold text-xs rounded-lg shadow-sm">
            BG {shloka.chapter}:{shloka.verse_range}
          </span>
          <button onClick={copyVerse} className="p-1 text-cream/40 hover:text-saffron transition-colors" title="Copy verse">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="font-sanskrit text-base sm:text-lg text-saffron/80 leading-relaxed mb-2">
          {shloka.sanskrit_devanagari}
        </p>
        <p className="text-cream/70 text-xs sm:text-sm leading-relaxed">
          {showHindi ? shloka.hindi : shloka.english}
        </p>
        <button 
          onClick={() => setShowHindi(!showHindi)}
          className="text-[10px] font-semibold text-saffron/60 hover:text-saffron mt-2 transition-colors"
        >
          {showHindi ? "English" : "हिन्दी"}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-saffron/10 shadow-sm hover:border-saffron/40 hover:shadow-md transition-all group overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-cream/5">
        <div className="flex items-center gap-2">
          <span className="px-2 sm:px-3 py-1 bg-saffron text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm">
            BG {shloka.chapter}:{shloka.verse_range}
          </span>
          {shloka.speaker_tag && <span className="text-xs font-semibold text-gold tracking-wide">{shloka.speaker_tag}</span>}
        </div>
        <button onClick={copyVerse} className="p-1.5 text-cream/30 hover:text-saffron transition-colors" title="Copy verse">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Sanskrit */}
      <div className="text-center my-4 sm:my-6 space-y-3 sm:space-y-4">
        <p className="font-sanskrit text-xl sm:text-2xl md:text-3xl text-saffron leading-relaxed font-semibold">
          {shloka.sanskrit_devanagari}
        </p>
        <p className="text-cream/60 italic text-xs sm:text-sm tracking-wide px-2 sm:px-4">
          {shloka.sanskrit_transliterated}
        </p>
      </div>

      {/* Translations */}
      <div className="bg-navy/50 rounded-xl p-3 sm:p-4 mt-4 sm:mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-cream/50 uppercase tracking-widest">Translation</span>
          <button 
            onClick={() => setShowHindi(!showHindi)}
            className="text-xs font-semibold text-saffron hover:underline"
          >
            Switch to {showHindi ? "English" : "Hindi"}
          </button>
        </div>
        <p className="text-cream leading-relaxed text-sm sm:text-[15px]">
          {showHindi ? shloka.hindi : shloka.english}
        </p>
      </div>

      {/* Tags */}
      <div className="mt-4 sm:mt-5 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {shloka.theme_tags?.map(t => (
             <span key={t} className="px-2 py-0.5 bg-cream/5 text-cream/70 text-[10px] sm:text-[11px] font-bold rounded-md capitalize">{t.replace("_", " ")}</span>
          ))}
          {shloka.key_concepts?.map(c => (
             <span key={c} className="px-2 py-0.5 bg-gold/10 text-gold text-[10px] sm:text-[11px] font-bold rounded-md capitalize">{c}</span>
          ))}
        </div>
      </div>

      {/* Related Verses Accordion */}
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
