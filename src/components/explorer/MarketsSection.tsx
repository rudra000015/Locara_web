'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, ArrowRight, Sparkles } from 'lucide-react';
import { MARKETS_DATA, MarketItem } from '@/data/markets';
import MarketCard from './MarketCard';

export default function MarketsSection({ city }: { city?: string }) {
  const router = useRouter();
  const [markets, setMarkets] = useState<MarketItem[]>(MARKETS_DATA);

  useEffect(() => {
    async function loadMarkets() {
      try {
        const res = await fetch(`/api/markets${city ? `?city=${encodeURIComponent(city)}` : ''}`);
        if (res.ok) {
          const data = await res.json();
          if (data.markets?.length) setMarkets(data.markets);
        }
      } catch {}
    }
    void loadMarkets();
  }, [city]);

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-4 h-4 text-[#C8893F]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
              PHYSICAL BAZAARS & QUARTERS
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7]">
            Iconic Markets Around You
          </h2>
        </div>
      </div>

      {/* Horizontal Scroll of Markets */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
        {markets.map((m, i) => (
          <MarketCard key={m.slug || i} market={m} index={i} />
        ))}
      </div>
    </div>
  );
}
