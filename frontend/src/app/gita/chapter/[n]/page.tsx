import React from 'react';
import { gitaData } from '@/lib/gita-data';
import VerseCard from '@/components/gita/VerseCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function ChapterPage({ params }: { params: { n: string } }) {
  const chapterNumber = parseInt(params.n, 10);
  if (isNaN(chapterNumber) || chapterNumber < 1 || chapterNumber > 18) {
    return notFound();
  }

  const verses = gitaData.getChapter(chapterNumber);
  if (verses.length === 0) return notFound();

  const chapterTitle = verses[0].chapter_title || `Chapter ${chapterNumber}`;

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8 flex flex-col items-start border-b border-saffron/20 pb-6">
        <Link href="/gita" className="flex items-center gap-1 text-sm font-semibold text-cream/50 hover:text-saffron transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Chapters
        </Link>
        <div className="flex items-baseline gap-4">
          <span className="text-4xl md:text-5xl font-extrabold text-saffron opacity-80">
            {String(chapterNumber).padStart(2, '0')}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-cream capitalize">
            {chapterTitle}
          </h1>
        </div>
        <p className="text-cream/60 font-medium mt-3 tracking-wide flex items-center gap-2">
          <span>{verses.length} Verses mapped.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {verses.map(v => (
          <VerseCard 
            key={v.chunk_id}
            chunk_id={v.chunk_id}
            chapter={v.chapter}
            verse_range={v.verse_range}
            english={v.english}
            sanskrit_devanagari={v.sanskrit_devanagari}
            theme_tags={v.theme_tags}
          />
        ))}
      </div>
    </div>
  );
}
