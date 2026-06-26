"use client";

import React from 'react';
import { Mail, Phone, User, Quote } from 'lucide-react';
import FeedbackForm from './FeedbackForm';
import { useLanguage } from '@/lib/i18n';

const TESTIMONIALS = [
  {
    quote: "I was battling severe burnout and couldn't process the anxiety. Shriji mapped my psychological state perfectly to Chapter 2, Verse 47. Being told I only have the right to act—not to the fruits of my actions—completely shattered my stress loop.",
    quote_hi: "मैं गंभीर बर्नआउट से जूझ रहा था। श्रीजी ने मेरी मनोवैज्ञानिक स्थिति को अध्याय 2, श्लोक 47 से पूरी तरह जोड़ा। 'कर्मण्येवाधिकारस्ते' ने मेरे तनाव के चक्र को पूरी तरह तोड़ दिया।",
    author: "Arjun K.",
    role: "Software Architect",
    verse: "BG 2:47"
  },
  {
    quote: "The Devanagari transliteration combined with the deep philosophical commentary is better than any book I've purchased. The ability to instantly ask clarifying questions about a specific Shloka is revolutionary.",
    quote_hi: "देवनागरी लिप्यंतरण के साथ गहन दार्शनिक टीका किसी भी पुस्तक से बेहतर है। किसी विशिष्ट श्लोक पर तुरंत स्पष्टीकरण पूछने की क्षमता क्रांतिकारी है।",
    author: "Priya S.",
    role: "Yoga Instructor",
    verse: "BG 6:5"
  },
  {
    quote: "When grief hit my family, I felt entirely lost. Asking Shriji 'Why do good people suffer?' provided a level of compassionate, non-judgmental metaphysical clarity that brought me genuine peace.",
    quote_hi: "जब मेरे परिवार पर दुख आया, तो मैं पूरी तरह खो गया। श्रीजी से 'अच्छे लोग क्यों दुख भोगते हैं?' पूछने से मुझे गहन शांति मिली।",
    author: "David R.",
    role: "Teacher",
    verse: "BG 2:27"
  }
];

export default function AboutPage() {
  const { lang, t } = useLanguage();

  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-2 sm:px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-14 sm:space-y-20">
      
      <div className="text-center space-y-3 sm:space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black text-cream tracking-tight">
          <span className="text-saffron">{t('about.title_connect')}</span> {t('about.title_with_us')}
        </h1>
        <p className="text-base sm:text-lg text-cream/60 max-w-2xl mx-auto">
          {t('about.description')}
        </p>
      </div>

      {/* Contact & Feedback Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        
        {/* Contact Information */}
        <div className="glass-panel p-6 sm:p-8 md:p-10 rounded-3xl space-y-6 sm:space-y-8 h-full">
          <div>
             <h2 className="text-2xl sm:text-3xl font-bold text-cream mb-4 sm:mb-6 flex items-center gap-3">
               <User className="w-7 h-7 sm:w-8 sm:h-8 text-saffron" /> {t('about.direct_contact')}
             </h2>
             <div className="space-y-4 sm:space-y-6 text-base sm:text-lg">
               <div className="flex items-center gap-3 sm:gap-4 text-cream/80 font-medium">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-saffron/10 flex items-center justify-center shrink-0">
                   <User className="w-5 h-5 sm:w-6 sm:h-6 text-saffron" />
                 </div>
                 Abhishek Sharma
               </div>
               <div className="flex items-center gap-3 sm:gap-4 text-cream/80 font-medium">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-saffron/10 flex items-center justify-center shrink-0">
                   <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-saffron" />
                 </div>
                 <a href="tel:9575676062" className="hover:text-saffron transition-colors">9575676062</a>
               </div>
               <div className="flex items-center gap-3 sm:gap-4 text-cream/80 font-medium">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-saffron/10 flex items-center justify-center shrink-0">
                   <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-saffron" />
                 </div>
                 <a href="mailto:shabhishek055@gmail.com" className="hover:text-saffron transition-colors text-sm sm:text-base break-all">shabhishek055@gmail.com</a>
               </div>
             </div>
          </div>
        </div>

        {/* Feedback Form */}
        <FeedbackForm />
      </div>

      {/* Testimonials Section */}
      <div className="pt-8 sm:pt-10 border-t border-saffron/10">
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
           <h2 className="text-3xl sm:text-4xl font-black text-cream tracking-tight">
             <span className="text-saffron">{t('about.transformed')}</span> {t('about.lives')}
           </h2>
           <p className="text-base sm:text-lg text-cream/60 max-w-2xl mx-auto">
             {t('about.testimonial_desc')}
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((item, idx) => (
            <div key={idx} className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <Quote className="absolute top-6 right-6 w-12 h-12 sm:w-16 sm:h-16 text-saffron/5 -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <p className="text-cream text-sm sm:text-md leading-relaxed font-medium italic mb-6 sm:mb-8">
                  &quot;{lang === 'hi' ? item.quote_hi : item.quote}&quot;
                </p>
                <div className="flex items-center justify-between border-t border-saffron/10 pt-3 sm:pt-4">
                  <div>
                    <h4 className="font-bold text-cream text-sm">{item.author}</h4>
                    <p className="text-saffron text-xs font-semibold">{item.role}</p>
                  </div>
                  <div className="px-2 py-1 bg-gold/10 border border-gold/20 text-gold rounded-full text-[10px] font-black tracking-widest">
                    {item.verse}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
