"use client";

import React from 'react';
import Link from 'next/link';
import { gitaData } from '@/lib/gita-data';
import { useLanguage } from '@/lib/i18n';
import { Search, Bookmark } from 'lucide-react';

export default function GitaGridPage() {
  const { t } = useLanguage();
  const chapters = gitaData.getChapterList();

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-8 animate-in fade-in duration-500 px-1">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-cream tracking-tight mb-2">
            {t('gita.title_the')} <span className="text-saffron">{t('gita.title_name')}</span>
          </h1>
          <p className="text-cream/70 max-w-xl text-sm sm:text-base">
            {t('gita.description')}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/gita/search" className="flex items-center gap-2 px-4 sm:px-5 py-2.5 glass-panel border border-saffron/20 text-cream font-semibold rounded-xl hover:border-saffron hover:shadow-md transition-all active:scale-95 shadow-sm text-sm">
            <Search className="w-4 h-4 text-saffron" />
            {t('gita.search')}
          </Link>
          <Link href="/gita/bookmarks" className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-saffron text-white font-semibold rounded-xl hover:bg-gold transition-all active:scale-95 shadow-md shadow-saffron/20 text-sm">
            <Bookmark className="w-4 h-4" />
            {t('gita.saved')}
          </Link>
        </div>
      </div>

      {/* Chapter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {chapters.map((ch, idx) => (
          <Link 
            key={ch.chapter} 
            href={`/gita/chapter/${ch.chapter}`}
            className="group relative glass-panel border border-saffron/10 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-saffron/40 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col h-full"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <div className="absolute -right-6 -bottom-6 text-9xl opacity-[0.02] group-hover:opacity-[0.04] transition-opacity pointer-events-none select-none">
              🪷
            </div>

            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <span className="text-4xl sm:text-5xl font-extrabold text-saffron/20 group-hover:text-saffron/30 transition-colors">
                {String(ch.chapter).padStart(2, '0')}
              </span>
              <span className="px-2 sm:px-3 py-1 bg-saffron/10 text-saffron text-[10px] font-bold uppercase tracking-widest rounded-md border border-saffron/10">
                {ch.verse_count} {t('gita.verses')}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-cream mb-2 line-clamp-2">
              {ch.chapter_title}
            </h2>
            
            <div className="mt-auto pt-3 sm:pt-4 flex items-center gap-2 truncate">
              <span className="text-xs font-semibold text-cream/50">{t('gita.core_theme')}:</span>
              <span className="text-xs font-bold text-gold capitalize truncate">{ch.preview_theme.replace(/_/g, " ")}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
