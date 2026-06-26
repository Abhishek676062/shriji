"use client";

import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Heart, Server, Sparkles, BookOpen, Copy, Check } from 'lucide-react';

export default function DonatePage() {
  const { t } = useLanguage();
  const [copied, setCopied] = React.useState(false);

  const copyUPI = async () => {
    await navigator.clipboard.writeText('9575676062@ptsbi');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-saffron/10 border border-saffron/20 rounded-full text-saffron font-bold animate-pulse">
          <Heart className="w-5 h-5 fill-saffron" />
          <span className="text-lg">{t('donate.title')}</span>
          <span className="text-sm text-cream/50">{t('donate.subtitle')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-cream tracking-tight">{t('donate.heading')}</h1>
        <p className="text-base sm:text-lg text-cream/60 max-w-2xl mx-auto">{t('donate.description')}</p>
      </div>

      {/* Donation Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* UPI */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <h2 className="text-2xl font-bold text-cream flex items-center gap-3">
            <span className="text-xl">📱</span> {t('donate.upi_title')}
          </h2>
          <p className="text-cream/60 text-sm">{t('donate.upi_scan')}</p>
          <div className="bg-white rounded-2xl p-6 mx-auto w-fit">
            <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="text-center">
                <div className="text-5xl mb-2">🙏</div>
                <p className="text-navy font-bold text-sm">UPI QR Code</p>
                <p className="text-gray-500 text-xs mt-1">9575676062@ptsbi</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-navy/50 rounded-xl p-4">
            <div className="flex-1">
              <p className="text-xs text-cream/40 font-bold uppercase tracking-wider mb-1">UPI ID</p>
              <p className="text-cream font-mono font-bold text-lg">9575676062@ptsbi</p>
            </div>
            <button onClick={copyUPI} className="p-3 bg-saffron/10 text-saffron rounded-xl hover:bg-saffron/20 transition-all">
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Bank Transfer */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <h2 className="text-2xl font-bold text-cream flex items-center gap-3">
            <span className="text-xl">🏦</span> {t('donate.bank_title')}
          </h2>
          {[
            { label: 'Account Name', value: 'Abhishek Sharma' },
            { label: 'Bank', value: 'State Bank of India (SBI)' },
            { label: 'Account No.', value: 'Contact us' },
            { label: 'IFSC', value: 'Contact us' },
          ].map((item) => (
            <div key={item.label} className="bg-navy/50 rounded-xl p-4">
              <p className="text-xs text-cream/40 font-bold uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-cream font-semibold">{item.value}</p>
            </div>
          ))}
          <div className="bg-saffron/5 border border-saffron/20 rounded-xl p-4 text-center">
            <p className="text-cream/70 text-sm">
              Contact{' '}
              <a href="mailto:shabhishek055@gmail.com" className="text-saffron font-semibold hover:underline">shabhishek055@gmail.com</a>
              {' '}for bank details
            </p>
          </div>
        </div>
      </div>

      {/* Why Donate */}
      <div className="space-y-8">
        <h2 className="text-3xl font-black text-center"><span className="text-saffron">{t('donate.why_title')}</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Server className="w-8 h-8" />, title: t('donate.why_1_title'), desc: t('donate.why_1_desc') },
            { icon: <Sparkles className="w-8 h-8" />, title: t('donate.why_2_title'), desc: t('donate.why_2_desc') },
            { icon: <BookOpen className="w-8 h-8" />, title: t('donate.why_3_title'), desc: t('donate.why_3_desc') },
          ].map((card, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="text-saffron mb-4 group-hover:scale-110 transition-transform">{card.icon}</div>
              <h3 className="text-lg font-bold text-cream mb-2">{card.title}</h3>
              <p className="text-cream/60 text-sm">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Blessing Quote */}
      <div className="text-center py-8 border-t border-saffron/10">
        <p className="font-sanskrit text-xl sm:text-2xl text-saffron/80 mb-3">परित्राणाय साधूनां विनाशाय च दुष्कृताम्</p>
        <p className="text-cream/50 text-sm italic">&quot;For the protection of the good&quot; — BG 4.8</p>
      </div>
    </div>
  );
}
