"use client";

import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function FreeGeetaPage() {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-2 md:px-4 animate-in fade-in duration-500 flex flex-col items-center">
      
      <div className="text-center mb-6 sm:mb-8 space-y-3 sm:space-y-4 max-w-3xl px-2">
         <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-cream tracking-tight flex items-center justify-center gap-2 sm:gap-3">
           <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-saffron" />
           <span className="text-saffron">{t('freebook.title_order')}</span> {t('freebook.title_free')}
         </h1>
         <p className="text-base sm:text-lg text-cream/70 leading-relaxed">
           {t('freebook.description')}
         </p>
         <a 
           href="https://yatharthgeeta.com/country-language/order-free-book/" 
           target="_blank" 
           rel="noopener noreferrer"
           className="inline-flex items-center gap-2 text-sm font-bold text-saffron hover:text-gold transition-colors"
         >
           {t('freebook.fallback')} <ExternalLink className="w-4 h-4" />
         </a>
      </div>

      <div className="w-full glass-panel rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-saffron/20 relative" style={{ height: '70vh' }}>
         <iframe 
           src="https://yatharthgeeta.com/country-language/order-free-book/" 
           className="w-full h-full border-none absolute inset-0 bg-white"
           title="Order Free Yatharth Geeta Form"
         />
      </div>
    </div>
  );
}
