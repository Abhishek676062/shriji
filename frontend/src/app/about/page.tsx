import React from 'react';
import { Mail, Phone, User, Quote } from 'lucide-react';
import FeedbackForm from './FeedbackForm';

export const metadata = {
  title: 'Contact, Feedback & Testimonials | Shriji AI',
  description: 'Reach out to Abhishek Sharma, provide feedback, and read how the Gita has transformed lives.',
};

const TESTIMONIALS = [
  {
    quote: "I was battling severe burnout and couldn't process the anxiety. Shriji mapped my psychological state perfectly to Chapter 2, Verse 47. Being told I only have the right to act—not to the fruits of my actions—completely shattered my stress loop.",
    author: "Arjun K.",
    role: "Software Architect",
    verse: "BG 2:47"
  },
  {
    quote: "The Devanagari transliteration combined with the deep philosophical commentary inside the Reader is better than any book I've purchased. The ability to instantly ask clarifying questions about a specific Shloka is revolutionary.",
    author: "Priya S.",
    role: "Yoga Instructor",
    verse: "BG 6:5"
  },
  {
    quote: "When grief hit my family, I felt entirely lost. Asking Shriji 'Why do good people suffer?' provided a level of compassionate, non-judgmental metaphysical clarity that brought me genuine peace for the first time in months.",
    author: "David R.",
    role: "Teacher",
    verse: "BG 2:27"
  }
];

export default function AboutPage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-20">
      
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-cream tracking-tight">
          <span className="text-saffron">Connect</span> With Us
        </h1>
        <p className="text-lg text-cream/60 max-w-2xl mx-auto">
          We are constantly improving Shriji to serve as your spiritual guide. Reach out for support, provide feedback, or read how the Gita transforms lives.
        </p>
      </div>

      {/* Contact & Feedback Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Contact Information */}
        <div className="glass-panel p-8 md:p-10 rounded-3xl space-y-8 h-full">
          <div>
             <h2 className="text-3xl font-bold text-cream mb-6 flex items-center gap-3">
               <User className="w-8 h-8 text-saffron" /> Direct Contact
             </h2>
             <div className="space-y-6 text-lg">
               <div className="flex items-center gap-4 text-cream/80 font-medium">
                 <div className="w-12 h-12 rounded-full bg-saffron/10 flex items-center justify-center">
                   <User className="w-6 h-6 text-saffron" />
                 </div>
                 Abhishek Sharma
               </div>
               <div className="flex items-center gap-4 text-cream/80 font-medium">
                 <div className="w-12 h-12 rounded-full bg-saffron/10 flex items-center justify-center">
                   <Phone className="w-6 h-6 text-saffron" />
                 </div>
                 <a href="tel:9575676062" className="hover:text-saffron transition-colors">9575676062</a>
               </div>
               <div className="flex items-center gap-4 text-cream/80 font-medium">
                 <div className="w-12 h-12 rounded-full bg-saffron/10 flex items-center justify-center">
                   <Mail className="w-6 h-6 text-saffron" />
                 </div>
                 <a href="mailto:shabhishek055@gmail.com" className="hover:text-saffron transition-colors">shabhishek055@gmail.com</a>
               </div>
             </div>
          </div>
        </div>

        {/* Feedback Form */}
        <FeedbackForm />
      </div>

      {/* Testimonials Section */}
      <div className="pt-10 border-t border-saffron/10">
        <div className="text-center mb-12 space-y-4">
           <h2 className="text-4xl font-black text-cream tracking-tight">
             <span className="text-saffron">Transformed</span> Lives
           </h2>
           <p className="text-lg text-cream/60 max-w-2xl mx-auto">
             How the Bhagavad Gita&apos;s timeless wisdom is guiding our community.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <Quote className="absolute top-6 right-6 w-16 h-16 text-saffron/5 -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <p className="text-cream text-md leading-relaxed font-medium italic mb-8">
                  &quot;{t.quote}&quot;
                </p>
                <div className="flex items-center justify-between border-t border-saffron/10 pt-4">
                  <div>
                    <h4 className="font-bold text-cream text-sm">{t.author}</h4>
                    <p className="text-saffron text-xs font-semibold">{t.role}</p>
                  </div>
                  <div className="px-2 py-1 bg-gold/10 border border-gold/20 text-gold rounded-full text-[10px] font-black tracking-widest">
                    {t.verse}
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
