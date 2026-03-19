"use client";

import React, { useState, useEffect } from 'react';
import { ShlokaCard as ShlokaCardData } from '@/lib/api';
import { Bookmark, BookmarkCheck, ArrowLeft, Volume2 } from 'lucide-react';
import Link from 'next/link';
import EmotionBadge from '../chat/EmotionBadge';
import { useRouter } from 'next/navigation';
import { gitaData } from '@/lib/gita-data';

interface Props {
  verse: ShlokaCardData;
}

export default function VerseDetail({ verse }: Props) {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [showCommentary, setShowCommentary] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [prevVerse, setPrevVerse] = useState<{c: number, v: string} | null>(null);
  const [nextVerse, setNextVerse] = useState<{c: number, v: string} | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('shriji_bookmarks') || '[]');
    setIsBookmarked(saved.includes(verse.chunk_id));
    
    // Sync language from global selection
    setLang((localStorage.getItem('shriji_global_lang') as 'en'|'hi') || 'en');
    const handleLang = () => {
      setLang((localStorage.getItem('shriji_global_lang') as 'en'|'hi') || 'en');
    };
    window.addEventListener('languageChange', handleLang);
    return () => window.removeEventListener('languageChange', handleLang);
  }, [verse.chunk_id]);

  useEffect(() => {
    const chapterVerses = gitaData.getChapter(verse.chapter);
    const currIdx = chapterVerses.findIndex(v => v.chunk_id === verse.chunk_id);
    
    // Find Previous
    if (currIdx > 0) {
      setPrevVerse({c: chapterVerses[currIdx-1].chapter, v: chapterVerses[currIdx-1].verse_range});
    } else if (verse.chapter > 1) {
      const prevChap = gitaData.getChapter(verse.chapter - 1);
      if (prevChap.length > 0) {
        setPrevVerse({c: prevChap[prevChap.length-1].chapter, v: prevChap[prevChap.length-1].verse_range});
      }
    } else {
      setPrevVerse(null);
    }

    // Find Next
    if (currIdx < chapterVerses.length - 1) {
       setNextVerse({c: chapterVerses[currIdx+1].chapter, v: chapterVerses[currIdx+1].verse_range});
    } else if (verse.chapter < 18) {
       const nextChap = gitaData.getChapter(verse.chapter + 1);
       if (nextChap.length > 0) {
         setNextVerse({c: nextChap[0].chapter, v: nextChap[0].verse_range});
       }
    } else {
       setNextVerse(null);
    }
  }, [verse.chunk_id, verse.chapter]);

  const toggleBookmark = () => {
    const saved = JSON.parse(localStorage.getItem('shriji_bookmarks') || '[]');
    let updated;
    if (isBookmarked) {
      updated = saved.filter((id: string) => id !== verse.chunk_id);
    } else {
      updated = [...saved, verse.chunk_id];
    }
    localStorage.setItem('shriji_bookmarks', JSON.stringify(updated));
    setIsBookmarked(!isBookmarked);
  };

  const handleAskShriji = () => {
    // Navigate pre-filling the chat routing query params
    router.push(`/chat?q=${encodeURIComponent(`Explain BG ${verse.chapter}:${verse.verse_range} to me.`)}`);
  };

  const translation = lang === 'en' ? verse.english : verse.hindi;
  const commentary = lang === 'en' ? verse.english_commentary : verse.hindi_commentary;
  const speaker = verse.speaker_tag || "Sanjaya";

  return (
    <div className="w-full glass-panel rounded-3xl p-6 md:p-10 border border-saffron/20 shadow-xl shadow-saffron/5 animate-in fade-in zoom-in-95 duration-700">
      
      {/* Top Nav */}
      <div className="flex justify-between items-center mb-10 pb-4 border-b border-cream/10">
        <Link href={`/gita/chapter/${verse.chapter}`} className="flex items-center gap-1.5 text-cream/50 hover:text-saffron transition-colors font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Chapter {verse.chapter}
        </Link>
        <button 
          onClick={toggleBookmark} 
          className="flex items-center gap-1.5 px-4 py-2 bg-navy text-saffron rounded-full font-bold text-sm shadow-sm hover:bg-gold/20 transition-all border border-saffron/10 active:scale-95"
        >
          {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {isBookmarked ? "Saved" : "Save"}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center text-center space-y-8">
        <div className="px-6 py-2 bg-saffron text-white font-black text-xl tracking-widest rounded-2xl shadow-md border-b-4 border-gold">
          {verse.chunk_id.replace("_", " ")}
        </div>

        <div>
           <p className="text-saffron font-bold text-sm uppercase tracking-widest border border-saffron/20 px-3 py-1 rounded-full w-max mx-auto mb-4 bg-saffron/5">
              Speaker: {speaker}
           </p>
           <h2 className="font-sanskrit text-4xl md:text-5xl text-saffron font-bold leading-[1.4] max-w-4xl tracking-tight">
             {verse.sanskrit_devanagari}
           </h2>
        </div>

        <div className="flex items-center gap-2 text-cream/40 font-bold bg-cream/5 px-4 py-2 rounded-full cursor-not-allowed hidden">
           <Volume2 className="w-4 h-4" /> Listen to Audio
        </div>

        <p className="text-cream/60 text-lg md:text-xl italic max-w-3xl tracking-wide px-4 font-serif">
          {verse.sanskrit_transliterated}
        </p>

        {/* Translation Block */}
        <div className="w-full max-w-4xl text-left bg-navy/60 rounded-2xl p-6 md:p-8 border border-saffron/10 shadow-inner">
           <div className="flex items-center justify-between border-b border-cream/10 pb-4 mb-6">
             <h3 className="font-extrabold text-cream uppercase tracking-wider text-sm flex items-center gap-2">
               Translation 
               <span className="text-xs px-2 py-0.5 bg-saffron/10 text-saffron rounded-full">{lang.toUpperCase()}</span>
             </h3>
             <div className="flex border border-saffron/30 rounded-lg overflow-hidden font-bold text-xs">
                <button onClick={()=>setLang('en')} className={`px-4 py-1.5 ${lang==='en'?'bg-saffron text-white':'bg-white text-saffron hover:bg-navy'}`}>EN</button>
                <button onClick={()=>setLang('hi')} className={`px-4 py-1.5 ${lang==='hi'?'bg-saffron text-white':'bg-white text-saffron hover:bg-navy'}`}>HI</button>
             </div>
           </div>
           
           <p className="text-cream text-lg md:text-xl leading-relaxed font-medium">
             {translation}
           </p>

           {commentary && (
             <div className="mt-8">
                <button onClick={() => setShowCommentary(!showCommentary)} className="text-saffron font-bold text-sm hover:underline flex flex-col gap-1">
                  <span>{showCommentary ? "Hide Philosophical Commentary" : "Read Philosophical Commentary"}</span>
                  <div className="w-full h-px bg-saffron/20 mt-1"></div>
                </button>
                {showCommentary && (
                  <div className="mt-5 p-5 glass-panel border-l-4 border-gold rounded-r-xl shadow-sm animate-in slide-in-from-top-2">
                    <p className="text-cream/80 leading-relaxed text-[15px] whitespace-pre-wrap">{commentary}</p>
                  </div>
                )}
             </div>
           )}
        </div>

        {/* 15 Parameter Ontology Tags */}
        <div className="w-full max-w-4xl text-left bg-white rounded-2xl p-6 md:p-8 border border-saffron/10 mb-8 space-y-6">
           <h3 className="font-extrabold text-cream/50 uppercase tracking-widest text-xs">Semantic Analysis</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <span className="block text-[10px] font-bold text-cream/40 uppercase mb-2">Psychological Domains</span>
                <EmotionBadge emotion={verse.emotional_tags?.[0]} domain={verse.problem_domains?.[0]} />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-cream/40 uppercase mb-2">Core Concepts</span>
                <div className="flex flex-wrap gap-1.5">
                  {verse.key_concepts?.map(c => (
                    <span key={c} className="px-2 py-1 bg-gold/10 border border-gold/20 text-gold font-bold text-xs rounded-lg capitalize">{c}</span>
                  ))}
                  {verse.theme_tags?.map(t => (
                    <span key={t} className="px-2 py-1 bg-cream/5 border border-cream/10 text-cream font-bold text-xs rounded-lg capitalize">{t.replace(/_/g," ")}</span>
                  ))}
                </div>
              </div>
           </div>
        </div>

        {/* Navigation Buttons */}
        <div className="w-full max-w-4xl flex justify-between items-center mb-4 gap-4">
          {prevVerse ? (
             <Link prefetch={true} href={`/gita/verse/${prevVerse.c}/${prevVerse.v}`} className="px-6 py-3 glass-panel border border-saffron/20 text-cream font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all active:translate-y-0 text-sm md:text-base">
               &larr; Previous Verse
             </Link>
          ) : <div></div>}
          
          {nextVerse ? (
             <Link prefetch={true} href={`/gita/verse/${nextVerse.c}/${nextVerse.v}`} className="px-6 py-3 glass-panel border border-saffron/20 text-cream font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all active:translate-y-0 text-sm md:text-base">
               Next Verse &rarr;
             </Link>
          ) : <div></div>}
        </div>

        <button onClick={handleAskShriji} className="w-full max-w-sm mt-4 py-4 bg-saffron text-white font-bold rounded-2xl shadow-[0_8px_30px_rgba(192,87,10,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(192,87,10,0.4)] active:translate-y-1 transition-all text-lg tracking-wide border-b-4 border-gold group">
          Ask Shriji About This Verse
        </button>
      </div>
    </div>
  );
}
