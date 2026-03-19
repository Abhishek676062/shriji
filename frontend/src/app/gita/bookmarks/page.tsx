"use client";

import React, { useState, useEffect } from 'react';
import { gitaData } from '@/lib/gita-data';
import VerseCard from '@/components/gita/VerseCard';
import { BookmarkMinus } from 'lucide-react';
import Link from 'next/link';
import { ShlokaCard } from '@/lib/api';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<ShlokaCard[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = JSON.parse(localStorage.getItem('shriji_bookmarks') || '[]');
    const hydrated = saved.map((id: string) => gitaData.getVerse(id)).filter(Boolean);
    setBookmarks(hydrated);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 animate-in fade-in zoom-in-95 duration-500">
      
      <div className="mb-10 text-center">
         <h1 className="text-4xl font-extrabold text-cream tracking-tight mb-3">Saved Verses</h1>
         <p className="text-cream/60 font-medium">Your personal metaphysical sanctuary stored securely offline on your device.</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-navy/50 rounded-3xl border border-saffron/10 text-center shadow-inner">
          <BookmarkMinus className="w-16 h-16 text-saffron/20 mb-6" />
          <h2 className="text-2xl font-bold text-cream mb-2">Your library is empty.</h2>
          <p className="text-cream/60 mb-8 max-w-md">You haven&apos;t saved any verses yet. When exploring the Gita or asking Shriji questions, bookmark insights that resonate.</p>
          <Link href="/gita" className="px-6 py-3 bg-saffron text-white font-bold rounded-xl hover:bg-gold shadow-md active:scale-95 transition-all">
            Browse The Gita
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((b) => (
             <VerseCard 
               key={b.chunk_id}
               chunk_id={b.chunk_id}
               chapter={b.chapter}
               verse_range={b.verse_range}
               english={b.english}
               sanskrit_devanagari={b.sanskrit_devanagari}
               theme_tags={b.theme_tags}
             />
          ))}
        </div>
      )}

    </div>
  );
}
