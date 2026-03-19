import React from 'react';
import Link from 'next/link';

interface Props {
  chunk_id: string;
  chapter: number;
  verse_range: string;
  english: string;
  sanskrit_devanagari: string;
  theme_tags?: string[];
}

export default function VerseCard({ chunk_id, chapter, verse_range, english, sanskrit_devanagari, theme_tags }: Props) {
  // Take first 80 characters of english preview securely stripping overflow
  const preview = english.length > 85 ? english.substring(0, 85) + "..." : english;

  return (
    <div id={`verse-${chunk_id}`} className="bg-white rounded-xl p-5 border border-saffron/10 hover:border-saffron/30 hover:shadow-md transition-all group flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between border-b border-cream/5 pb-3">
          <span className="font-bold text-cream">Verse {chapter}:{verse_range}</span>
          <div className="flex gap-1">
            {theme_tags?.slice(0, 1).map(t => (
               <span key={t} className="px-2 py-[2px] bg-gold/10 text-gold text-[10px] uppercase tracking-wider font-extrabold rounded-md shadow-[0_1px_1px_rgba(0,0,0,0.02)] truncate max-w-[80px]">
                 {t.replace(/_/g, " ")}
               </span>
            ))}
          </div>
        </div>

        <div className="mt-4 mb-3">
          <p className="font-sanskrit text-lg text-saffron opacity-80 mb-2 truncate group-hover:opacity-100 transition-opacity">
            {sanskrit_devanagari}
          </p>
          <p className="text-cream/70 text-sm leading-relaxed">
            &quot;{preview}&quot;
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 w-full border-t border-cream/5">
        <Link 
          href={`/gita/verse/${chapter}/${verse_range}`} 
          className="text-saffron font-semibold text-xs flex items-center gap-1 hover:underline"
        >
          Read Full Verse →
        </Link>
      </div>
    </div>
  );
}
