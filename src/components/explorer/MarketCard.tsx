'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Store, ArrowRight, Sparkles } from 'lucide-react';
import { MarketItem } from '@/data/markets';
import { useStore } from '@/store/useStore';

export default function MarketCard({ market, index }: { market: MarketItem; index: number }) {
  const router = useRouter();
  const { openMarket } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={() => {
        openMarket(market.slug);
        router.push(`/explorer/market/${market.slug}`);
      }}
      className="group relative shrink-0 w-72 sm:w-80 h-96 rounded-3xl overflow-hidden bg-[#1B140F] border border-[#F6EAD7]/10 hover:border-[#C8893F]/40 transition-all duration-400 cursor-pointer shadow-lg hover:shadow-2xl flex flex-col justify-between p-5"
    >
      {/* Background Image with Deep Overlay */}
      <img
        src={market.coverImage}
        alt={market.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0B08] via-[#0E0B08]/60 to-black/30" />

      {/* Top Badges */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#0E0B08]/80 backdrop-blur-md text-[#E0AF62] border border-[#C8893F]/30">
          {market.historicalEra}
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#0E0B08]/80 backdrop-blur-md text-[#F6EAD7] border border-[#F6EAD7]/10">
          <Store className="w-3 h-3 text-[#C8893F]" />
          {market.shopCount}+ Shops
        </span>
      </div>

      {/* Bottom Content */}
      <div className="relative z-10">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {market.categories.slice(0, 3).map((cat, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-[#211A14]/80 text-[#D8C4A7] border border-[#F6EAD7]/10"
            >
              {cat}
            </span>
          ))}
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F6EAD7] group-hover:text-[#E0AF62] transition-colors leading-tight">
          {market.name}
        </h3>

        <p className="text-[11px] text-[#9E8B75] line-clamp-2 mt-1.5 leading-relaxed">
          {market.tagline}
        </p>

        <div className="mt-4 pt-3 border-t border-[#F6EAD7]/10 flex items-center justify-between">
          <span className="text-xs font-bold text-[#E0AF62] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Explore Market Map <ArrowRight className="w-3.5 h-3.5" />
          </span>
          <span className="text-[10px] font-mono text-[#9E8B75] flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#C8893F]" /> {market.city}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
