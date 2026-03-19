"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Languages, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [globalLang, setGlobalLang] = useState('en');

  React.useEffect(() => {
    setGlobalLang(localStorage.getItem('shriji_global_lang') || 'en');
  }, []);

  const toggleLanguage = () => {
    const newLang = globalLang === 'en' ? 'hi' : 'en';
    setGlobalLang(newLang);
    localStorage.setItem('shriji_global_lang', newLang);
    window.dispatchEvent(new Event('languageChange'));
  };

  return (
    <header className="sticky top-0 z-50 bg-navy/90 backdrop-blur-md border-b border-saffron/20 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Brand Logo */}
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 z-50 group border border-transparent hover:border-saffron/20 px-3 py-1.5 rounded-xl hover:bg-saffron/5"
        >
          <span className="text-2xl group-hover:rotate-12 transition-transform duration-500">🪷</span>
          <span className="font-extrabold text-2xl tracking-tight text-saffron">श्रीजी</span>
          <span className="font-bold text-lg tracking-wider text-cream/90 uppercase ml-1 relative top-[2px]">Shriji</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 font-medium text-sm">
          <Link prefetch={true} href="/chat" className="hover:text-saffron transition-colors">Chat</Link>
          <Link prefetch={true} href="/gita" className="hover:text-saffron transition-colors">Browse Gita</Link>
          <Link prefetch={true} href="/free-geeta" className="hover:text-saffron transition-colors text-gold">Order Free Book</Link>
          <Link prefetch={true} href="/about" className="hover:text-saffron transition-colors">Support & Feedback</Link>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-saffron/10 text-saffron hover:bg-saffron/20 transition-colors"
            title="Change language"
          >
            <Languages className="w-4 h-4" />
            <span>Switch to {globalLang === 'en' ? 'Hindi' : 'English'}</span>
          </button>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          className="md:hidden p-2 -mr-2 text-saffron active:scale-95 transition-transform z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full glass-panel border-b border-saffron/10 shadow-lg py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <Link
            href="/chat"
            onClick={() => setIsOpen(false)}
            className="text-lg font-bold text-cream py-2 border-b border-cream/5"
          >
            Ask Shriji
          </Link>
          <Link
            href="/gita"
            onClick={() => setIsOpen(false)}
            className="text-lg font-bold text-cream py-2 border-b border-cream/5"
          >
            Read The Gita
          </Link>
          <Link
            prefetch={true}
            href="/gita/search"
            onClick={() => setIsOpen(false)}
            className="text-lg font-bold text-cream py-2 border-b border-cream/5"
          >
            Search Verses
          </Link>
          <Link
            prefetch={true}
            href="/free-geeta"
            onClick={() => setIsOpen(false)}
            className="text-lg font-bold text-saffron py-2 border-b border-cream/5"
          >
            Order Free Book
          </Link>
          <Link
            prefetch={true}
            href="/about"
            onClick={() => setIsOpen(false)}
            className="text-lg font-bold text-cream py-2 border-b border-cream/5"
          >
            Support & Feedback
          </Link>
          <button onClick={toggleLanguage} className="flex items-center justify-center gap-2 mt-4 px-4 py-3 bg-saffron text-white rounded-xl shadow-md font-bold">
            <Languages className="w-5 h-5" /> Switch to {globalLang === 'en' ? 'Hindi' : 'English'}
          </button>
        </div>
      )}
    </header>
  );
}
