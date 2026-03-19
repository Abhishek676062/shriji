import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-in fade-in duration-1000">
      
      {/* Hero Header */}
      <div className="space-y-6 max-w-3xl">
        <div className="inline-flex items-center justify-center space-x-4 bg-saffron/10 px-7 py-3 rounded-full border border-saffron/20 mb-2 shadow-[0_0_20px_rgba(229,115,0,0.15)] backdrop-blur-sm animate-pulse-slow">
           <span className="text-3xl md:text-4xl text-saffron drop-shadow-md">🪷</span>
           <span className="text-3xl md:text-4xl font-extrabold text-saffron tracking-widest">श्रीजी</span>
           <span className="text-cream/30 text-2xl font-light">|</span>
           <span className="text-2xl md:text-3xl font-bold text-cream tracking-widest uppercase">Shriji</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-cream leading-tight">
          <span className="text-saffron">Ask</span> any question.<br/>
          Receive Gita&apos;s <span className="text-gold">wisdom.</span>
        </h1>
        <p className="text-lg md:text-xl text-cream/70 max-w-2xl mx-auto">
          Shriji acts as a compassionate philosophical guide mapping timeless Sanskrit shlokas to your exact modern-day problems using advanced Reciprocal Rank Fusion.
        </p>
      </div>

      {/* Primary Call To Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/chat"
          className="px-8 py-4 bg-saffron text-navy rounded-full font-semibold shadow-lg shadow-saffron/30 hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95"
        >
          Begin Conversation
        </Link>
        <Link 
          href="/gita"
          className="px-8 py-4 glass-panel border border-saffron/20 text-cream rounded-full font-semibold hover:bg-saffron/5 hover:border-saffron/50 transition-all duration-300 active:scale-95"
        >
          Browse the Gita
        </Link>
      </div>

      {/* Quick Prompt Chips */}
      <div className="pt-8 w-full max-w-lg">
        <p className="text-sm font-semibold text-cream/50 mb-4 uppercase tracking-wider">Example Inquiries</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Why do good people suffer?", "How do I control my anger?", "I feel lost securely"].map((prompt) => (
            <Link 
              key={prompt}
              href={`/chat?q=${encodeURIComponent(prompt)}`}
              className="px-4 py-2 glass-panel border border-saffron/20 shadow-sm rounded-full text-sm text-cream hover:border-gold hover:text-saffron transition-colors"
            >
               &quot;{prompt}&quot;
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
