"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import DailyVerse from '@/components/home/DailyVerse';

export default function Home() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Simulate API call for lead capture
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail('');
    }
  };

  const examples = [
    { en: t('home.example_1'), hi: t('home.example_1') },
    { en: t('home.example_2'), hi: t('home.example_2') },
    { en: t('home.example_3'), hi: t('home.example_3') },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-10 sm:space-y-12 animate-in fade-in duration-1000 py-6 sm:py-0">
      
      {/* Hero Header */}
      <div className="flex flex-col items-center space-y-6 sm:space-y-8 max-w-4xl px-4">
        {/* Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4 bg-saffron/10 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full border border-saffron/30 mb-2 shadow-[0_0_30px_rgba(229,115,0,0.2)] backdrop-blur-md hover:bg-saffron/15 transition-all">
           <span className="text-2xl sm:text-3xl text-saffron drop-shadow-md animate-pulse-slow">🪷</span>
           <span className="text-2xl sm:text-3xl font-extrabold text-saffron tracking-widest">{t('home.badge_title')}</span>
           <span className="text-cream/30 text-xl sm:text-2xl font-light hidden sm:inline-block">|</span>
           <span className="text-xl sm:text-2xl font-bold text-cream tracking-widest uppercase">{t('home.badge_sub')}</span>
        </div>
        
        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-cream leading-[1.15] sm:leading-[1.1]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron to-gold drop-shadow-sm">{t('home.hero_ask')}</span> {t('home.hero_any_question')}<br className="hidden sm:block" />
          {' '}{t('home.hero_receive')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-saffron drop-shadow-sm">{t('home.hero_wisdom')}</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-cream/70 max-w-2xl mx-auto px-2 leading-relaxed font-medium">
          {t('home.hero_desc')}
        </p>
      </div>

      {/* Primary Call To Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-md sm:max-w-none px-4 sm:px-0">
        <Link 
          href="/chat"
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-saffron to-gold text-navy rounded-full font-black text-lg shadow-[0_0_20px_rgba(229,115,0,0.4)] hover:shadow-[0_0_30px_rgba(229,115,0,0.6)] hover:scale-105 transition-all duration-300 active:scale-95 text-center"
        >
          {t('home.cta_chat')}
        </Link>
        <Link 
          href="/gita"
          className="w-full sm:w-auto px-8 py-4 glass-panel border border-saffron/30 text-cream rounded-full font-bold text-lg hover:bg-saffron/10 hover:border-saffron/60 transition-all duration-300 active:scale-95 text-center shadow-lg"
        >
          {t('home.cta_browse')}
        </Link>
      </div>

      {/* Daily Verse Section */}
      <div className="w-full max-w-2xl px-2">
        <DailyVerse />
      </div>

      {/* Quick Prompt Chips */}
      <div className="pt-4 sm:pt-8 w-full max-w-lg px-4">
        <p className="text-xs sm:text-sm font-semibold text-cream/50 mb-3 sm:mb-4 uppercase tracking-wider">{t('home.example_title')}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {examples.map((prompt) => (
            <Link 
              key={prompt.en}
              href={`/chat?q=${encodeURIComponent(prompt.en)}`}
              className="px-3 sm:px-4 py-2 glass-panel border border-saffron/20 shadow-sm rounded-full text-xs sm:text-sm text-cream hover:border-gold hover:text-saffron transition-colors"
            >
               &quot;{prompt.en}&quot;
            </Link>
          ))}
        </div>
      </div>

      {/* Lead Generation / Subscription Notification Bar */}
      <div className="w-full max-w-5xl px-4 pt-4 sm:pt-8 pb-6">
        <div className="glass-panel px-4 sm:px-6 py-3 sm:py-4 rounded-3xl sm:rounded-full border border-saffron/30 shadow-[0_0_15px_rgba(229,115,0,0.15)] bg-navy/60 backdrop-blur-md flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 w-full lg:w-auto justify-center lg:justify-start">
            <span className="text-xl sm:text-2xl animate-pulse-slow">🪷</span>
            <span className="text-sm sm:text-base font-medium text-cream text-center lg:text-left">
              <strong className="text-saffron">Daily Wisdom:</strong> Get a curated Geeta verse in your inbox.
            </span>
          </div>
          
          <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto items-center gap-1 sm:gap-2 bg-navy/80 border border-saffron/20 rounded-full p-1 focus-within:border-saffron focus-within:ring-1 focus-within:ring-saffron/30 transition-all shadow-inner">
            <input 
              type="email" 
              placeholder="Your email address..." 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 lg:w-64 bg-transparent text-cream px-4 py-2 text-sm sm:text-base outline-none placeholder:text-cream/50"
            />
            <button 
              type="submit" 
              className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${subscribed ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-saffron to-gold hover:from-gold hover:to-saffron text-navy shadow-sm hover:shadow-md active:scale-95'}`}
            >
              {subscribed ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      {/* FAQ Schema for AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is Shriji AI?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Shriji is a Geeta AI chatbot that provides spiritual guidance and answers to your modern-day problems using the timeless wisdom of the Bhagavad Gita."
                }
              },
              {
                "@type": "Question",
                "name": "How does Shreeji Online work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simply type your question, anxiety, or dilemma into the chat, and Shriji uses advanced semantic search to find the most relevant Sanskrit shlokas and explain their meaning in your context."
                }
              }
            ]
          })
        }}
      />
    </div>
  );
}
