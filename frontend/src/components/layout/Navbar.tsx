"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Languages, Menu, X, Calendar, Heart } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-navy/90 backdrop-blur-md border-b border-saffron/20 shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">

        {/* Brand Logo */}
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-1.5 sm:gap-2 transition-transform hover:scale-105 active:scale-95 z-50 group border border-transparent hover:border-saffron/20 px-2 sm:px-3 py-1.5 rounded-xl hover:bg-saffron/5"
        >
          <span className="text-xl sm:text-2xl group-hover:rotate-12 transition-transform duration-500">🪷</span>
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-saffron">श्रीजी</span>
          <span className="font-bold text-base sm:text-lg tracking-wider text-cream/90 uppercase ml-0.5 sm:ml-1 relative top-[1px] sm:top-[2px]">Shriji</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 font-medium text-sm">
          <Link prefetch={true} href="/chat" className="hover:text-saffron transition-colors">{t('nav.chat')}</Link>
          <Link prefetch={true} href="/gita" className="hover:text-saffron transition-colors">{t('nav.browse_gita')}</Link>
          <Link prefetch={true} href="/panchang" className="hover:text-saffron transition-colors flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {t('nav.panchang')}
          </Link>
          <Link prefetch={true} href="/free-geeta" className="hover:text-saffron transition-colors text-gold">{t('nav.free_book')}</Link>
          <Link prefetch={true} href="/donate" className="hover:text-saffron transition-colors flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" /> {t('nav.donate')}
          </Link>
          <Link prefetch={true} href="/about" className="hover:text-saffron transition-colors">{t('nav.support')}</Link>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-saffron/10 text-saffron hover:bg-saffron/20 transition-colors"
            title="Change language"
          >
            <Languages className="w-4 h-4" />
            <span>{t('nav.switch_lang')}</span>
          </button>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          className="md:hidden p-2 -mr-1 text-saffron active:scale-95 transition-transform z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu — Full-screen overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-[#0A0F17] overflow-y-auto h-[100dvh] w-screen flex flex-col">
          {/* Menu Header (Logo + Close) */}
          <div className="flex justify-between items-center px-3 sm:px-4 h-14 sm:h-16 border-b border-saffron/20 shrink-0">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1.5 sm:gap-2 z-50 group px-2 sm:px-3 py-1.5"
            >
              <span className="text-xl sm:text-2xl">🪷</span>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-saffron">श्रीजी</span>
              <span className="font-bold text-base sm:text-lg tracking-wider text-cream/90 uppercase ml-0.5 sm:ml-1 relative top-[1px] sm:top-[2px]">Shriji</span>
            </Link>
            <button
              className="p-2 -mr-1 text-saffron active:scale-95 transition-transform z-50"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Links */}
          <div className="flex flex-col items-center justify-start flex-1 gap-4 px-6 pt-10 pb-20">
            {[
              { href: '/chat', label: t('nav.ask_shriji'), accent: false },
              { href: '/gita', label: t('nav.read_gita'), accent: false },
              { href: '/panchang', label: t('nav.panchang'), accent: false },
              { href: '/free-geeta', label: t('nav.free_book'), accent: true },
              { href: '/donate', label: t('nav.donate'), accent: false },
              { href: '/about', label: t('nav.support'), accent: false },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`text-2xl font-bold py-3 w-full text-center rounded-xl transition-all active:scale-95 ${
                  item.accent ? 'text-saffron' : 'text-cream hover:text-saffron'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            <button
              onClick={() => { toggleLang(); setIsOpen(false); }}
              className="flex items-center justify-center gap-2 mt-4 px-6 py-4 bg-saffron text-white rounded-2xl shadow-md font-bold text-lg w-full max-w-xs active:scale-95 transition-transform"
            >
              <Languages className="w-5 h-5" />
              {t('nav.switch_lang')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
