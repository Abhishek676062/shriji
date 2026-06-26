"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-saffron/10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* AbhiAI Branding */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span className="text-cream/50 text-sm">{t('footer.built_by')}</span>
            <a
              href="https://abhiai.in"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-saffron/10 to-gold/10 border border-saffron/20 rounded-xl hover:border-saffron/50 hover:shadow-lg hover:shadow-saffron/10 transition-all duration-300"
            >
              <span className="font-extrabold text-lg tracking-tight">
                <span className="text-saffron">Abhi</span>
                <span className="text-gold">AI</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-saffron/60 group-hover:text-saffron transition-colors" />
            </a>
          </div>

          <p className="text-cream/40 text-xs sm:text-sm text-center sm:text-right max-w-xs">
            {t('footer.tagline')}
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-4 pt-4 border-t border-cream/5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-cream/30 text-xs">
            © {new Date().getFullYear()} Shriji AI — All rights reserved
          </p>
          <div className="flex items-center gap-4 text-cream/30 text-xs">
            <Link href="/about" className="hover:text-saffron transition-colors">Support</Link>
            <Link href="/donate" className="hover:text-saffron transition-colors">Donate</Link>
            <a href="https://abhiai.in" target="_blank" rel="noopener noreferrer" className="hover:text-saffron transition-colors">
              {t('footer.visit')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
