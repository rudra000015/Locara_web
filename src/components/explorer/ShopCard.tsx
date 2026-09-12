'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shop } from '@/types/shop';
import { useStore } from '@/store/useStore';
import { estimateTravelMinutes, formatDistanceMeters } from '@/lib/geo';
import { Star, Clock, MapPin, Store } from 'lucide-react';

interface ShopCardProps {
  shop: Shop;
  index?: number;
  layout?: 'grid' | 'list';
}

export default function ShopCard({ shop: s, index = 0, layout = 'grid' }: ShopCardProps) {
  const router = useRouter();
  const { openShop } = useStore();

  const handleCardClick = () => {
    openShop(s.id);
    router.push(`/explorer/shop/${s.id}`);
  };

  if (layout === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={handleCardClick}
        className="group relative flex gap-4 p-4 rounded-2xl bg-[#121212] hover:bg-[#161616] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
      >
        {/* Photo preview */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#181818] border border-white/5 shrink-0 relative">
          {s.photos?.[0] ? (
            <img
              src={s.photos[0]}
              alt={s.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1C1C1C] to-[#121212]">
              <Store className="w-8 h-8 text-white/20" />
            </div>
          )}

          {s.openNow != null && (
            <span
              className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 ${
                s.openNow
                  ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                  : 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30'
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full ${
                  s.openNow ? 'bg-[#22c55e] animate-pulse' : 'bg-[#ef4444]'
                }`}
              />
              {s.openNow ? 'OPEN' : 'CLOSED'}
            </span>
          )}
        </div>

        {/* Content details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-serif font-bold text-base text-[#F5F5F5] group-hover:text-[#C9A96E] transition-colors truncate">
                {s.name}
              </h3>
              {s.rating > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#1E1E1E] border border-white/10 shrink-0">
                  <Star className="w-3 h-3 text-[#C9A96E] fill-[#C9A96E]" />
                  <span className="text-xs font-bold text-[#F5F5F5]">{s.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-[#71717A] truncate mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#C9A96E] shrink-0" />
              {s.addr.split(',')[0]}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A96E]/10 text-[#C9A96E] border border-[#C9A96E]/20">
                {s.age} Yrs Legacy
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-[#A1A1AA] border border-white/5 capitalize">
                {s.cat}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#71717A] pt-2 border-t border-white/5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#C9A96E]" /> {estimateTravelMinutes(s.distanceMeters)}
            </span>
            <span>•</span>
            <span className="font-semibold text-[#F5F5F5]">{formatDistanceMeters(s.distanceMeters)}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid layout
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleCardClick}
      className="group relative rounded-2xl bg-[#121212] hover:bg-[#161616] border border-white/[0.08] hover:border-white/[0.18] overflow-hidden transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1"
    >
      {/* Cover Media */}
      <div className="h-40 sm:h-44 relative overflow-hidden bg-[#181818]">
        {s.photos?.[0] ? (
          <img
            src={s.photos[0]}
            alt={s.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1C1C1C] to-[#121212]">
            <Store className="w-10 h-10 text-white/20" />
          </div>
        )}

        {/* Ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-[#C9A96E] border border-[#C9A96E]/30">
            {s.age} Yrs
          </span>
        </div>

        {s.openNow != null && (
          <div className="absolute top-2.5 right-2.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 backdrop-blur-md ${
                s.openNow
                  ? 'bg-black/60 text-[#22c55e] border border-[#22c55e]/40'
                  : 'bg-black/60 text-[#ef4444] border border-[#ef4444]/40'
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full ${
                  s.openNow ? 'bg-[#22c55e] animate-pulse' : 'bg-[#ef4444]'
                }`}
              />
              {s.openNow ? 'Open' : 'Closed'}
            </span>
          </div>
        )}

        {/* Bottom Avatar & Rating */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
          <img
            src={s.ownerImg}
            alt=""
            className="w-8 h-8 rounded-xl border border-white/20 bg-[#181818] object-cover shadow-sm"
          />
          {s.rating > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-xs font-bold text-[#F5F5F5]">
              <Star className="w-3 h-3 text-[#C9A96E] fill-[#C9A96E]" />
              {s.rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif font-bold text-sm text-[#F5F5F5] group-hover:text-[#C9A96E] transition-colors truncate mb-1">
          {s.name}
        </h3>
        <p className="text-[11px] text-[#71717A] truncate mb-3 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#C9A96E] shrink-0" />
          {s.addr.split(',')[0]}
        </p>

        <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-2.5 border-t border-white/5">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#C9A96E]" /> {estimateTravelMinutes(s.distanceMeters)}
          </span>
          <span className="font-semibold text-[#A1A1AA]">{formatDistanceMeters(s.distanceMeters)}</span>
        </div>
      </div>
    </motion.div>
  );
}