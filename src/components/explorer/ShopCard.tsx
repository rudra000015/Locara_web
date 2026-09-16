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
        className="group relative flex gap-4 p-4 rounded-2xl bg-bg-card hover:bg-bg-cardHover border border-border hover:border-border-active transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
      >
        {/* Photo preview */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-bg-subtle border border-border shrink-0 relative">
          {s.photos?.[0] ? (
            <img
              src={s.photos[0]}
              alt={s.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-bg-card2">
              <Store className="w-8 h-8 text-fg-muted/40" />
            </div>
          )}

          {s.openNow != null && (
            <span
              className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 ${
                s.openNow
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full ${
                  s.openNow ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
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
              <h3 className="font-serif font-bold text-base text-fg-heading group-hover:text-primary transition-colors truncate">
                {s.name}
              </h3>
              {s.rating > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-bg-pill border border-border shrink-0">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-fg">{s.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-fg-muted truncate mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary shrink-0" />
              {s.addr.split(',')[0]}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                {s.age} Yrs Legacy
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bg-pill text-fg-secondary border border-border capitalize">
                {s.cat}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-fg-muted pt-2 border-t border-border">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" /> {estimateTravelMinutes(s.distanceMeters)}
            </span>
            <span>•</span>
            <span className="font-semibold text-fg">{formatDistanceMeters(s.distanceMeters)}</span>
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
      className="group relative rounded-2xl bg-bg-card hover:bg-bg-cardHover border border-border hover:border-border-active overflow-hidden transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1"
    >
      {/* Cover Media */}
      <div className="h-40 sm:h-44 relative overflow-hidden bg-bg-subtle">
        {s.photos?.[0] ? (
          <img
            src={s.photos[0]}
            alt={s.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-bg-card2">
            <Store className="w-10 h-10 text-fg-muted/30" />
          </div>
        )}

        {/* Ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-bg-card/85 backdrop-blur-md text-primary border border-primary/30">
            {s.age} Yrs
          </span>
        </div>

        {s.openNow != null && (
          <div className="absolute top-2.5 right-2.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 backdrop-blur-md ${
                s.openNow
                  ? 'bg-bg-card/85 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-bg-card/85 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full ${
                  s.openNow ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
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
            className="w-8 h-8 rounded-xl border border-border bg-bg-card object-cover shadow-sm"
          />
          {s.rating > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-bg-card/85 backdrop-blur-md border border-border text-xs font-bold text-fg">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              {s.rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif font-bold text-sm text-fg-heading group-hover:text-primary transition-colors truncate mb-1">
          {s.name}
        </h3>
        <p className="text-[11px] text-fg-muted truncate mb-3 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-primary shrink-0" />
          {s.addr.split(',')[0]}
        </p>

        <div className="flex items-center justify-between text-[11px] text-fg-muted pt-2.5 border-t border-border">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary" /> {estimateTravelMinutes(s.distanceMeters)}
          </span>
          <span className="font-semibold text-fg-secondary">{formatDistanceMeters(s.distanceMeters)}</span>
        </div>
      </div>
    </motion.div>
  );
}