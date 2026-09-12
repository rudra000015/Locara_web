'use client';

import { useRouter } from 'next/navigation';
import { FESTIVALS, getActiveFestivals } from '@/data/festivals';
import { Sparkles, Calendar, ArrowRight, Store } from 'lucide-react';
import FadeIn from '@/components/motion/FadeIn';

interface FestivalHubProps {
  onNavigate?: (slug: string) => void;
}

export default function FestivalHub({ onNavigate }: FestivalHubProps) {
  const router = useRouter();
  const activeList = getActiveFestivals();

  const handleSelect = (slug: string) => {
    if (onNavigate) {
      onNavigate(slug);
    } else {
      router.push(`/festival/${slug}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <FadeIn delay={0.1}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-[#C9A96E]/30 mb-3">
            <Calendar className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
              CULTURAL DISCOVERY & FESTIVALS
            </span>
          </div>
        </FadeIn>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#F5F5F5] mb-3">
          Traditional Bazaars & Festive Heritage
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
          Explore iconic regional festivals, authentic preparations, and curated heritage workshops keeping Indian cultural heritage alive.
        </p>
      </div>

      {/* Grid of Festivals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FESTIVALS.map((fest, idx) => (
          <FadeIn key={fest.id} delay={idx * 0.08}>
            <div
              onClick={() => handleSelect(fest.slug)}
              className="group relative rounded-3xl bg-[#121212] hover:bg-[#161616] border border-white/[0.08] hover:border-[#C9A96E]/40 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-full hover:-translate-y-1.5"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl filter drop-shadow-md">{fest.emoji}</span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30">
                    {fest.date}
                  </span>
                </div>

                <p className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-1 font-bold">
                  {fest.nameHindi}
                </p>
                <h3 className="font-serif text-2xl font-bold text-[#F5F5F5] group-hover:text-[#C9A96E] transition-colors mb-2">
                  {fest.name}
                </h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-3 mb-6">
                  {fest.tagline || fest.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
                  <Store className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>{fest.offers.length} Featured Stores</span>
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-[#F5F5F5] group-hover:text-[#C9A96E] transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
