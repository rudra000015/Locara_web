'use client';

import { useRouter } from 'next/navigation';
import { FESTIVALS } from '@/data/festivals';
import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FestivalBanner() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  const toShow = FESTIVALS.slice(0, 3);

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % toShow.length), 4000);
    return () => clearInterval(id);
  }, [toShow.length]);

  const f = toShow[current];

  return (
    <div className="mb-8">
      <button
        onClick={() => router.push(`/festival/${f.slug}`)}
        className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#181818] via-[#141414] to-[#1A1A1A] border border-white/[0.08] hover:border-[#C9A96E]/40 cursor-pointer relative overflow-hidden text-left shadow-md hover:shadow-lg transition-all group"
      >
        <div className="relative z-10 flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Cultural Heritage Hub
            </span>
          </div>

          <h3 className="font-serif font-bold text-lg sm:text-xl text-[#F5F5F5] group-hover:text-[#C9A96E] transition-colors mb-0.5">
            {f.nameHindi} • {f.name} Special
          </h3>
          <p className="text-xs text-[#A1A1AA]">
            Up to {Math.max(...f.offers.map((o) => o.discount))}% off curated traditional essentials — {f.offers.length} verified shops
          </p>
        </div>

        {/* Emoji & Arrow */}
        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <span className="text-3xl sm:text-4xl filter drop-shadow-md">{f.emoji}</span>
          <div className="w-8 h-8 rounded-full bg-[#202020] border border-white/10 flex items-center justify-center text-[#A1A1AA] group-hover:text-[#C9A96E] group-hover:border-[#C9A96E]/40 transition-all">
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2.5">
        {toShow.map((fest, i) => (
          <button
            key={fest.id}
            onClick={() => setCurrent(i)}
            aria-label={`Festival ${fest.name}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-[#C9A96E]' : 'w-1.5 bg-[#202020] hover:bg-[#333]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}