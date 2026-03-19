import React from 'react';
import { gitaData } from '@/lib/gita-data';
import VerseDetail from '@/components/gita/VerseDetail';
import { notFound } from 'next/navigation';

export default function VersePage({ params }: { params: { chapter: string, verse: string } }) {
  const chapterNumber = parseInt(params.chapter, 10);
  
  // verse_range is correctly passed encoded. We extract via the chapter array matching exact strings
  const verse = gitaData.getChapter(chapterNumber).find(v => v.verse_range === decodeURIComponent(params.verse));

  if (!verse) {
    return notFound();
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <VerseDetail verse={verse} />
    </div>
  );
}
