'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MARKETS_DATA, MarketItem } from '@/data/markets';
import { useStore } from '@/store/useStore';
import {
  Compass,
  MapPin,
  Store,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  ChevronRight,
  Search,
} from 'lucide-react';
import FadeIn from '@/components/motion/FadeIn';

export default function MarketsPage() {
  const router = useRouter();
  const { setMarketSlug } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeMarket, setActiveMarket] = useState<MarketItem>(MARKETS_DATA[1] || MARKETS_DATA[0]); // Chandni Chowk default
  const [search, setSearch] = useState('');

  const categories = [
    'All',
    'Heritage',
    'Clothing',
    'Jewelry',
    'Handicrafts',
    'Spices',
    'Electronics',
    'Books',
    'Food',
  ];

  const filteredMarkets = MARKETS_DATA.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.city.toLowerCase().includes(search.toLowerCase()) ||
      m.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    if (selectedCategory === 'All') return matchesSearch;
    return matchesSearch && m.categories.includes(selectedCategory);
  });

  const handleOpenMarket = (slug: string) => {
    setMarketSlug(slug);
    router.push(`/markets/${slug}`);
  };

  return (
    <div className="py-4 pb-20 space-y-8">
      {/* Header matching Mockup Screen 05 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Compass className="w-4 h-4 text-[#C8893F]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
              CITY BAZAAR DIRECTORY
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-fg-heading">
            Explore Markets
          </h1>
          <p className="text-xs sm:text-sm text-fg-secondary mt-1">
            Iconic markets, unique finds, and timeless physical experiences across your city.
          </p>
        </div>

        {/* Search input */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bazaar names..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-bg-card border border-border text-xs text-fg placeholder-fg-muted outline-none focus:border-[#C8893F]"
          />
        </div>
      </div>

      {/* Category Pills matching Mockup Screen 05 */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#C8893F] text-[#0E0B08] shadow-md shadow-[#C8893F]/20'
                  : 'bg-bg-pill text-fg-secondary hover:text-fg hover:bg-bg-pillHover border border-border'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Split Layout: Left List vs Right Featured Showcase matching Mockup Screen 05 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Vertical Market List */}
        <div className="lg:col-span-5 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-fg-muted font-bold px-1">
            Markets in Delhi Region ({filteredMarkets.length})
          </p>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto no-scrollbar pr-1">
            {filteredMarkets.map((m) => {
              const isSelected = activeMarket.slug === m.slug;
              return (
                <div
                  key={m.slug}
                  onClick={() => setActiveMarket(m)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-bg-card border-[#C8893F] shadow-lg shadow-[#C8893F]/10 ring-1 ring-[#C8893F]'
                      : 'bg-bg-card/70 border-border hover:border-border-active/40 hover:bg-bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={m.coverImage}
                      alt={m.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border"
                    />
                    <div className="min-w-0">
                      <h3 className="font-serif text-base font-bold text-fg-heading truncate">
                        {m.name}
                      </h3>
                      <p className="text-xs text-fg-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#C8893F]" /> {m.city} • {m.shopCount}+ shops
                      </p>
                      <p className="text-[10px] font-mono text-[#E0AF62] mt-0.5 truncate">
                        {m.historicalEra}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-[#C8893F] translate-x-1' : 'text-fg-muted'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Featured Market Experience matching Mockup Screen 05 */}
        <div className="lg:col-span-7">
          <div className="relative rounded-3xl bg-bg-card border border-border p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[500px]">
            {/* Background cover image with heavy gradient */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700"
              style={{ backgroundImage: `url('${activeMarket.coverImage}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0806] via-[#0A0806]/85 to-black/50" />

            {/* Top info badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[#E0AF62] text-xs font-mono font-bold border border-white/10">
                {activeMarket.historicalEra}
              </span>
              <span className="px-3.5 py-1 rounded-full bg-[#E11D48]/20 border border-[#E11D48]/40 text-[#FAF4EB] text-xs font-mono font-bold">
                ● {activeMarket.shopCount}+ Active Boutiques
              </span>
            </div>

            {/* Bottom details */}
            <div className="relative z-10 pt-32">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#C8893F]">
                {activeMarket.city.toUpperCase()} • TRADITIONAL HUB
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-black text-[#FAF4EB] mt-1 mb-3 drop-shadow-md">
                {activeMarket.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#D8C4A7] leading-relaxed mb-6 max-w-xl">
                {activeMarket.description}
              </p>

              {/* Specialties Tag Cloud */}
              <div className="flex flex-wrap gap-2 mb-6">
                {activeMarket.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-[#18130E]/90 border border-white/10 text-xs text-[#FAF4EB]"
                  >
                    ✦ {spec}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenMarket(activeMarket.slug)}
                  className="btn-gold"
                >
                  <span>Explore Market</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${activeMarket.location.lat},${activeMarket.location.lng}`,
                      '_blank'
                    );
                  }}
                  className="btn-secondary backdrop-blur-md bg-black/60 border border-white/15 text-[#FAF4EB]"
                >
                  <MapPin className="w-4 h-4 text-[#C8893F]" />
                  <span>Get Directions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
