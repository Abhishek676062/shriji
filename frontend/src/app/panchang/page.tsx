"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { ChevronLeft, ChevronRight, Sun, Sunset, Star, Calendar } from 'lucide-react';
import { getPanchangForDate, getDaysInMonth, getFirstDayOfMonth, MONTH_NAMES, DAY_NAMES } from '@/lib/panchang-data';

export default function PanchangPage() {
  const { lang, t } = useLanguage();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const l = lang === 'hi' ? 'hi' : 'en';
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const selectedPanchang = getPanchangForDate(selectedDate, l);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(today);
  };

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const isSelected = (d: number) =>
    d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-10 px-3 sm:px-4 animate-in fade-in duration-500 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-saffron/10 border border-saffron/20 rounded-full">
          <Calendar className="w-5 h-5 text-saffron" />
          <span className="font-bold text-saffron">{t('panchang.subtitle')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-cream tracking-tight">
          <span className="text-saffron">{t('panchang.title')}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-4 sm:p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-xl bg-saffron/10 text-saffron hover:bg-saffron/20 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-cream">
                {MONTH_NAMES[l][month]} {year}
              </h2>
              <button onClick={goToday} className="text-xs text-saffron font-semibold hover:underline mt-1">
                {t('panchang.today')}
              </button>
            </div>
            <button onClick={nextMonth} className="p-2 rounded-xl bg-saffron/10 text-saffron hover:bg-saffron/20 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_NAMES[l].map((day) => (
              <div key={day} className="text-center text-xs font-bold text-cream/40 uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for first day offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const date = new Date(year, month, d);
              const panchang = getPanchangForDate(date, l);
              const hasFestival = panchang.festivals.length > 0;
              const todayClass = isToday(d);
              const selectedClass = isSelected(d);

              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-center gap-0.5 transition-all text-sm relative
                    ${selectedClass ? 'bg-saffron text-white shadow-lg shadow-saffron/30 scale-105' :
                      todayClass ? 'bg-gold/20 text-gold border border-gold/30' :
                      panchang.isAuspicious ? 'bg-green-500/5 text-cream hover:bg-saffron/10' :
                      'text-cream/70 hover:bg-cream/5'
                    }`}
                >
                  <span className={`font-bold text-xs sm:text-sm ${selectedClass ? 'text-white' : ''}`}>{d}</span>
                  {hasFestival && (
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedClass ? 'bg-white' : 'bg-saffron'} absolute bottom-1`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panchang Detail Panel */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-5 h-fit lg:sticky lg:top-24">
          <div className="text-center pb-4 border-b border-saffron/10">
            <p className="text-sm text-cream/40 font-bold uppercase tracking-wider">
              {selectedDate.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long' })}
            </p>
            <p className="text-3xl font-black text-saffron mt-1">{selectedDate.getDate()}</p>
            <p className="text-sm text-cream/60 mt-1">
              {MONTH_NAMES[l][selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </p>
          </div>

          {/* Panchang Details */}
          <div className="space-y-3">
            {[
              { label: t('panchang.tithi'), value: selectedPanchang.tithi, icon: '🌙' },
              { label: t('panchang.paksha'), value: selectedPanchang.paksha, icon: '☀️' },
              { label: t('panchang.nakshatra'), value: selectedPanchang.nakshatra, icon: '⭐' },
              { label: t('panchang.yoga'), value: selectedPanchang.yoga, icon: '🕉️' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-navy/50 rounded-xl p-3">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-cream/40 font-bold uppercase tracking-wider">{item.label}</p>
                  <p className="text-cream font-semibold text-sm truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Sunrise/Sunset */}
          <div className="flex gap-3">
            <div className="flex-1 bg-orange-500/5 rounded-xl p-3 flex items-center gap-2">
              <Sun className="w-4 h-4 text-orange-400" />
              <div>
                <p className="text-[10px] text-cream/40 font-bold">{t('panchang.sunrise')}</p>
                <p className="text-cream font-bold text-sm">{selectedPanchang.sunrise}</p>
              </div>
            </div>
            <div className="flex-1 bg-purple-500/5 rounded-xl p-3 flex items-center gap-2">
              <Sunset className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-[10px] text-cream/40 font-bold">{t('panchang.sunset')}</p>
                <p className="text-cream font-bold text-sm">{selectedPanchang.sunset}</p>
              </div>
            </div>
          </div>

          {/* Festivals */}
          {selectedPanchang.festivals.length > 0 && (
            <div className="bg-saffron/5 border border-saffron/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-saffron fill-saffron" />
                <p className="text-xs font-bold text-saffron uppercase tracking-wider">{t('panchang.festivals')}</p>
              </div>
              {selectedPanchang.festivals.map((f, i) => (
                <p key={i} className="text-cream font-semibold text-sm ml-6">{f}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
