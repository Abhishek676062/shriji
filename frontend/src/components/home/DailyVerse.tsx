"use client";

import React, { useEffect, useState } from 'react';
import { api, ShlokaCard } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { Share2, Bell, BellRing, Copy, Check, ExternalLink } from 'lucide-react';

export default function DailyVerse() {
  const { lang, t } = useLanguage();
  const [verse, setVerse] = useState<ShlokaCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    api.getDailyVerse().then((v) => {
      setVerse(v);
      setLoading(false);
    }).catch(() => setLoading(false));

    // Check notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifEnabled(Notification.permission === 'granted');
    }
  }, []);

  const requestNotification = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotifEnabled(true);
        // Register service worker if not already
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/sw.js');
        }
      }
    }
  };

  const getShareText = () => {
    if (!verse) return '';
    const translation = lang === 'hi' ? verse.hindi : verse.english;
    return `🪷 ${t('home.daily_verse_title')}\n\nBG ${verse.chapter}:${verse.verse_range}\n\n${verse.sanskrit_devanagari}\n\n${translation}\n\n— Shared via Shriji AI ✨\nhttps://www.shriji.online/`;
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(getShareText())}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(getShareText())}`, '_blank');
  };

  const shareInstagram = async () => {
    await copyToClipboard();
    window.open('https://instagram.com', '_blank');
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(getShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('home.daily_verse_title'),
          text: getShareText(),
          url: 'https://www.shriji.online/',
        });
      } catch {
        setShareOpen(!shareOpen);
      }
    } else {
      setShareOpen(!shareOpen);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="glass-panel rounded-3xl p-8 animate-pulse">
          <div className="h-6 bg-saffron/20 rounded-full w-40 mx-auto mb-6" />
          <div className="h-10 bg-saffron/10 rounded-xl w-3/4 mx-auto mb-4" />
          <div className="h-4 bg-cream/5 rounded w-full mb-2" />
          <div className="h-4 bg-cream/5 rounded w-2/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (!verse) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative glass-panel rounded-3xl p-6 sm:p-8 overflow-hidden group hover:border-saffron/40 transition-all duration-500">
        {/* Background ornament */}
        <div className="absolute -right-10 -top-10 text-[12rem] opacity-[0.02] group-hover:opacity-[0.04] transition-opacity pointer-events-none select-none rotate-12">
          🪷
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">✨</span>
            <h3 className="text-lg sm:text-xl font-bold text-saffron">{t('home.daily_verse_title')}</h3>
          </div>
          <div className="flex items-center gap-2 relative">
            <button
              onClick={requestNotification}
              className={`p-2 rounded-xl transition-all ${notifEnabled ? 'bg-green-500/20 text-green-400' : 'bg-saffron/10 text-saffron hover:bg-saffron/20'}`}
              title={t('home.daily_verse_notify')}
            >
              {notifEnabled ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </button>
            <div className="relative">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-saffron/10 text-saffron hover:bg-saffron/20 transition-all"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              
              {/* Share Dropdown */}
              {shareOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-navy/95 backdrop-blur-xl border border-saffron/20 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={() => { shareWhatsApp(); setShareOpen(false); }} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600/20 text-green-400 transition-colors w-full text-left">
                    <ExternalLink className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                  <button onClick={() => { shareTwitter(); setShareOpen(false); }} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-500/20 text-blue-400 transition-colors w-full text-left">
                    <ExternalLink className="w-3.5 h-3.5" /> X / Twitter
                  </button>
                  <button onClick={() => { shareFacebook(); setShareOpen(false); }} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700/20 text-blue-400 transition-colors w-full text-left">
                    <ExternalLink className="w-3.5 h-3.5" /> Facebook
                  </button>
                  <button onClick={() => { shareInstagram(); setShareOpen(false); }} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-pink-600/20 text-pink-400 transition-colors w-full text-left">
                    <ExternalLink className="w-3.5 h-3.5" /> Instagram
                  </button>
                  <button onClick={copyToClipboard} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-cream/10 text-cream transition-colors w-full text-left">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? t('share.copied') : t('share.copy')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verse Reference */}
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1.5 bg-saffron text-white font-bold text-sm rounded-full shadow-lg shadow-saffron/20">
            BG {verse.chapter}:{verse.verse_range}
          </span>
        </div>

        {/* Sanskrit */}
        <div className="text-center my-5">
          <p className="font-sanskrit text-xl sm:text-2xl text-saffron leading-relaxed font-semibold">
            {verse.sanskrit_devanagari}
          </p>
          <p className="text-cream/40 italic text-xs sm:text-sm mt-2 tracking-wide">
            {verse.sanskrit_transliterated}
          </p>
        </div>

        {/* Translation */}
        <div className="bg-navy/50 rounded-xl p-4 mt-4">
          <p className="text-cream leading-relaxed text-sm sm:text-[15px]">
            {lang === 'hi' ? verse.hindi : verse.english}
          </p>
        </div>

        {/* Theme Tags */}
        {verse.theme_tags && verse.theme_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 justify-center relative z-0">
            {verse.theme_tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 bg-gold/10 text-gold text-[10px] font-bold rounded-md capitalize">
                {tag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
