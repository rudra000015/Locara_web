'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Store, Clock, Sparkles, Navigation, ArrowRight, ChevronLeft, Award, Tag } from 'lucide-react';
import { MARKETS_DATA, MarketItem } from '@/data/markets';
import { useStore } from '@/store/useStore';
import ShopCard from './ShopCard';
import ProductCard from './ProductCard';
import OfferCard from './OfferCard';
import PremiumButton from '@/components/ui/PremiumButton';

export default function MarketDetailPage({ slug }: { slug: string }) {
  const router = useRouter();
  const { currentMarketSlug, openShop, navTo } = useStore();
  const activeSlug = slug || currentMarketSlug || 'karol-bagh';

  const [market, setMarket] = useState<MarketItem | null>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/markets/${activeSlug}`);
        if (res.ok) {
          const data = await res.json();
          setMarket(data.market);
          setShops(data.shops || []);
        } else {
          const fallback = MARKETS_DATA.find((m) => m.slug === activeSlug) || MARKETS_DATA[0];
          setMarket(fallback);
        }
      } catch {
        const fallback = MARKETS_DATA.find((m) => m.slug === activeSlug) || MARKETS_DATA[0];
        setMarket(fallback);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [activeSlug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 space-y-6">
        <div className="h-80 rounded-3xl bg-[#17120E] skeleton-shimmer" />
        <div className="h-10 w-1/2 rounded-xl bg-[#17120E] skeleton-shimmer" />
      </div>
    );
  }

  const m = market || MARKETS_DATA[0];

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Back Button */}
      <button
        onClick={() => navTo('home')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#17120E] border border-[#F6EAD7]/10 text-xs font-bold text-[#9E8B75] hover:text-[#F6EAD7] transition-all mb-4 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Discover
      </button>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 min-h-[360px] flex flex-col justify-end p-6 sm:p-10 mb-8 shadow-2xl">
        <img
          src={m.coverImage}
          alt={m.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0B08] via-[#0E0B08]/75 to-transparent" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#0E0B08]/80 backdrop-blur-md text-[#E0AF62] border border-[#C8893F]/30">
              {m.historicalEra}
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#0E0B08]/80 backdrop-blur-md text-[#F6EAD7] border border-[#F6EAD7]/10">
              {m.shopCount}+ Active Heritage Shops
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono text-[#D8C4A7] bg-[#0E0B08]/80 backdrop-blur-md border border-[#F6EAD7]/10 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#C8893F]" /> {m.popularTimings}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#F6EAD7] leading-tight mb-2">
            {m.name}
          </h1>

          <p className="text-xs sm:text-sm text-[#D8C4A7] leading-relaxed max-w-2xl">
            {m.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {m.categories.map((cat, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-[#211A14]/90 backdrop-blur-md text-[#F6EAD7] border border-[#F6EAD7]/15"
              >
                ✦ {cat}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <PremiumButton
              variant="gold"
              size="md"
              onClick={() => navTo('map')}
              showArrow
              magnetic
            >
              Explore Market on Live Map
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Specialties & Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="p-6 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-md">
          <h3 className="font-serif font-bold text-base text-[#F6EAD7] mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C8893F]" /> Famed Specialties
          </h3>
          <div className="flex flex-wrap gap-2">
            {m.specialties.map((spec, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-xl text-xs font-medium bg-[#211A14] text-[#D8C4A7] border border-[#F6EAD7]/10"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-md">
          <h3 className="font-serif font-bold text-base text-[#F6EAD7] mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C8893F]" /> Market Quarters & Lanes
          </h3>
          <div className="flex flex-wrap gap-2">
            {(m.highlights || ['Main High Street', 'Heritage Alley', 'Artisan Arcade']).map((h, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-xl text-xs font-medium bg-[#211A14] text-[#D8C4A7] border border-[#F6EAD7]/10"
              >
                📍 {h}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Offers in this Market */}
      {m.popularOffers && m.popularOffers.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-[#C8893F]" />
            <h2 className="font-serif font-bold text-xl text-[#F6EAD7]">
              Today&apos;s Active In-Store Offers
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {m.popularOffers.map((off, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#1B140F] border border-[#C8893F]/20 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-[#C8893F] uppercase font-bold">{off.shopName}</span>
                  <h4 className="font-serif font-bold text-sm text-[#F6EAD7] mt-0.5">{off.title}</h4>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C8893F]/15 text-[#E0AF62] border border-[#C8893F]/30 font-mono">
                  {off.discount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Shops in this Market */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#C8893F]" />
            <h2 className="font-serif font-bold text-xl text-[#F6EAD7]">
              Featured Shops in {m.name}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {shops.slice(0, 8).map((s, i) => (
            <ShopCard key={s.id || i} shop={s} index={i} layout="grid" />
          ))}
        </div>
      </div>
    </div>
  );
}
