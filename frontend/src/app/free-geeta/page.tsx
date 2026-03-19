import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Order Free Gita | Shriji AI',
  description: 'Order your free physical copy of the Yatharth Geeta shipped directly to your door.',
};

export default function FreeGeetaPage() {
  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-2 md:px-4 animate-in fade-in duration-500 flex flex-col items-center">
      
      <div className="text-center mb-8 space-y-4 max-w-3xl">
         <h1 className="text-4xl md:text-5xl font-black text-cream tracking-tight flex items-center justify-center gap-3">
           <BookOpen className="w-10 h-10 text-saffron" />
           <span className="text-saffron">Order</span> Free Geeta
         </h1>
         <p className="text-lg text-cream/70 leading-relaxed">
           We have partnered with the <b>Yatharth Geeta Trust</b> to provide physical copies of the Geeta, completely free of charge, anywhere in the world. Fill out the form below to receive your book.
         </p>
         <a 
           href="https://yatharthgeeta.com/country-language/order-free-book/" 
           target="_blank" 
           rel="noopener noreferrer"
           className="inline-flex items-center gap-2 text-sm font-bold text-saffron hover:text-gold transition-colors"
         >
           If the form does not load, click here to open it directly <ExternalLink className="w-4 h-4" />
         </a>
      </div>

      <div className="w-full glass-panel rounded-3xl overflow-hidden shadow-2xl border border-saffron/20 relative" style={{ height: '75vh' }}>
         <iframe 
           src="https://yatharthgeeta.com/country-language/order-free-book/" 
           className="w-full h-full border-none absolute inset-0 bg-white"
           title="Order Free Yatharth Geeta Form"
         />
      </div>

    </div>
  );
}
