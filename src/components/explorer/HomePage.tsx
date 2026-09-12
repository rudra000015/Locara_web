'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shop } from '@/types/shop';
import { useStore } from '@/store/useStore';
import { FilterState, CATEGORIES } from '@/data/categories';
import ShopCard from './ShopCard';
import ProductCard from './ProductCard';
import MarketsSection from './MarketsSection';
import FlashSaleTicker from './FlashSaleTicker';
import OfferCard from './OfferCard';
import VisualSearchModal from './VisualSearchModal';
import FestivalBanner from '@/components/festival/FestivalBanner';
import FadeIn from '@/components/motion/FadeIn';

import { OrbGallery } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

import PremiumButton from '@/components/ui/PremiumButton';
import {
  LayoutGrid,
  List,
  Map as MapIcon,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Search,
  Store,
  Compass,
  Flame,
  Gift,
  Heart,
  Tag,
  Camera,
} from 'lucide-react';

interface Props {
  query: string;
  filters: FilterState;
  shops: Shop[];
  loading: boolean;
  error: string | null;
  refetch: (q?: string) => void;
  onListShop: () => void;
}

// ── Leaflet Dark Map View Component ─────────────────────────────
function MapView({ shops }: { shops: Shop[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const router = useRouter();
  const { openShop } = useStore();

  const openShopAndNavigate = useCallback(
    (shopId: string) => {
      openShop(shopId);
      router.push(`/explorer/shop/${shopId}`);
    },
    [openShop, router]
  );

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' });
      if (cancelled) return;

      const map = L.map(mapRef.current!).setView([28.6517, 77.1906], 13);
      mapInstance.current = map;

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; CartoDB & OpenStreetMap',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      L.circle([28.6517, 77.1906], {
        color: '#C8893F',
        fillColor: '#C8893F',
        fillOpacity: 0.08,
        radius: 3500,
        weight: 1,
      }).addTo(map);
    })();

    return () => {
      cancelled = true;
      try {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        mapInstance.current?.remove?.();
      } catch {}
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!shops.length || !mapInstance.current) return;

    (async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstance.current;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      shops.forEach((s) => {
        if (!s.loc || s.loc.length !== 2) return;

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width: 34px;
            height: 34px;
            border-radius: 99px;
            background: #17120E;
            border: 2px solid #C8893F;
            color: #E0AF62;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: bold;
            box-shadow: 0 0 14px rgba(200,137,63,0.4);
            cursor: pointer;
          ">🏛️</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker(s.loc, { icon }).addTo(map).bindPopup(`
          <div style="min-width:200px;padding:4px;font-family:inherit;background:#1B140F;color:#F6EAD7">
            <h4 style="font-weight:800;font-size:14px;color:#F6EAD7;margin:0 0 4px">${s.name}</h4>
            <p style="font-size:11px;color:#E0AF62;font-weight:600;margin:0 0 2px">⭐ ${s.rating.toFixed(1)} (${s.totalRatings} ratings)</p>
            <p style="font-size:11px;color:#9E8B75;margin:0 0 8px">${s.addr.split(',')[0]}</p>
            <button onclick="window.__openShop('${s.id}')" style="background:#C8893F;color:#0E0B08;border:none;padding:7px 12px;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;width:100%">Explore Storefront</button>
          </div>
        `);
        markersRef.current.push(marker);
      });
    })();
  }, [shops]);

  useEffect(() => {
    if (typeof window !== 'undefined') (window as any).__openShop = openShopAndNavigate;
  }, [openShopAndNavigate]);

  return (
    <div className="mb-6">
      <div
        ref={mapRef}
        className="w-full h-[440px] rounded-3xl overflow-hidden border border-[#F6EAD7]/10 shadow-lg"
      />
    </div>
  );
}

export function Scene() {
  return (
    <div className="shader-frame relative w-full h-[460px] sm:h-[580px] rounded-3xl overflow-hidden border border-[#F6EAD7]/10 bg-[#1f1f21] shadow-2xl">
      <OrbGallery style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// ── Editorial Hero Section ──────────────────────────────────────
function HeroBanner({
  onListShop,
  onOpenVisualSearch,
}: {
  onListShop: () => void;
  onOpenVisualSearch?: () => void;
}) {
  const { navTo } = useStore();

  return (
    <div className="space-y-6 mb-8">
      {/* 3D Orb Gallery Showcase of Area Shops & Interfaces */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#17120E]/80 backdrop-blur-md border border-[#C8893F]/40 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#C8893F]" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[#E0AF62]">
              3D STORE & INTERFACE SPHERE • DRAG TO SPIN
            </span>
          </div>
        </div>
        <Scene />
      </div>

      {/* Hero Content & CTA Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#F6EAD7]/10 bg-gradient-to-br from-[#1B140F] to-[#140F0B] p-6 sm:p-10 flex flex-col justify-between shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <FadeIn delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#211A14] border border-[#C8893F]/30 mb-4">
              <Store className="w-3.5 h-3.5 text-[#C8893F]" />
              <span className="text-[10px] font-mono font-bold tracking-[0.25em] uppercase text-[#E0AF62]">
                LOCARA MARKET • VERIFIED PHYSICAL STORES
              </span>
            </div>
          </FadeIn>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#F6EAD7] tracking-tight leading-[1.12] mb-4">
            Discover Heritage Shops <br />
            <span className="italic font-normal text-[#E0AF62] relative inline-block">
              Across Your City
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8893F]/60 to-transparent" />
            </span>
            .
          </h1>

          <FadeIn delay={0.25}>
            <p className="text-sm sm:text-base text-[#D8C4A7] leading-relaxed mb-6 max-w-xl">
              Digitally explore your city&apos;s physical boutiques, reserve artisanal crafts with 10% advance, and pick up in store.
            </p>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={0.35} className="flex flex-wrap items-center gap-3">
            <PremiumButton
              variant="gold"
              size="md"
              onClick={() => navTo('map')}
              showArrow
              magnetic
            >
              Explore Nearby Markets
            </PremiumButton>

            <button
              type="button"
              onClick={() => onOpenVisualSearch && onOpenVisualSearch()}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#211A14] hover:bg-[#2A2119] border border-[#C8893F]/40 text-xs font-bold text-[#E0AF62] transition-all cursor-pointer shadow-glow-sm"
            >
              <Camera className="w-4 h-4 text-[#C8893F]" />
              <span>Visual Search by Photo</span>
            </button>

            <PremiumButton
              variant="secondary"
              size="md"
              onClick={onListShop}
            >
              List Your Shop
            </PremiumButton>
          </FadeIn>
        </div>

        {/* Trust Indicator Footer */}
        <div className="relative z-10 mt-8 pt-4 border-t border-[#F6EAD7]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#9E8B75] font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#2A7256] animate-pulse" />
            <span>AUTHENTIC PHYSICAL COMMERCE LAYER</span>
          </div>
          <div className="font-mono text-xs font-bold text-[#F6EAD7]">
            <span className="text-[#E0AF62]">₹24,000+</span> saved exploring directly before visiting
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main HomePage Component ─────────────────────────────────────
export default function HomePage({
  query,
  filters,
  shops,
  loading,
  error,
  refetch,
  onListShop,
}: Props) {
  const router = useRouter();
  const { followingShops, openShop } = useStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [offers, setOffers] = useState<any[]>([]);
  const [showVisualModal, setShowVisualModal] = useState(false);

  useEffect(() => {
    async function loadFeedData() {
      try {
        const offRes = await fetch('/api/offers?flashSale=true');
        if (offRes.ok) {
          const oData = await offRes.json();
          if (oData.offers?.length) setOffers(oData.offers);
        }
      } catch {}
    }
    void loadFeedData();
  }, []);

  const filtered = useMemo(() => {
    let list = [...shops];
    if (filters.category !== 'all') {
      const cat = CATEGORIES.find((c) => c.id === filters.category);
      if (cat) {
        list = list.filter(
          (s) =>
            cat.shopCats.includes(s.cat) ||
            cat.keywords.some(
              (kw) =>
                s.name.toLowerCase().includes(kw) ||
                (s.story ?? '').toLowerCase().includes(kw)
            )
        );
      }
    }
    if (query.length >= 2) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.addr.toLowerCase().includes(q) ||
          s.products?.some((p) => p.name.toLowerCase().includes(q))
      );
    }
    if (filters.openNow) list = list.filter((s) => s.openNow === true);
    if (filters.minRating > 0) list = list.filter((s) => s.rating >= filters.minRating);
    switch (filters.sort) {
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'legacy':
        list.sort((a, b) => a.est - b.est);
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return list;
  }, [shops, filters, query]);

  const newProducts = useMemo(
    () =>
      shops
        .flatMap((s, si) =>
          (s.products ?? []).map((p, pi) => ({
            ...p,
            shopId: s.id,
            shopName: s.name,
            imgIndex: si * 10 + pi,
          }))
        )
        .filter((p) => p.isNew)
        .slice(0, 10),
    [shops]
  );

  const popularProducts = useMemo(
    () =>
      shops
        .flatMap((s, si) =>
          (s.products ?? []).map((p, pi) => ({
            ...p,
            shopId: s.id,
            shopName: s.name,
            imgIndex: si * 10 + pi,
          }))
        )
        .slice(0, 10),
    [shops]
  );

  const topRated = useMemo(
    () => [...shops].sort((a, b) => b.rating - a.rating).slice(0, 8),
    [shops]
  );

  const followedShopsList = useMemo(
    () => shops.filter((s) => followingShops.includes(s.id)),
    [shops, followingShops]
  );

  const isSearching =
    query.length > 0 ||
    filters.category !== 'all' ||
    filters.sort !== 'relevance' ||
    filters.openNow ||
    filters.minRating > 0;

  if (error) {
    return (
      <div className="text-center py-24 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[#17120E] border border-[#F6EAD7]/10 flex items-center justify-center text-3xl mx-auto mb-4">
          🔍
        </div>
        <h2 className="font-serif text-xl font-bold text-[#F6EAD7] mb-2">Unable to Load Stores</h2>
        <p className="text-xs text-[#9E8B75] mb-6">{error}</p>
        <button
          onClick={() => refetch()}
          className="btn-gold text-xs uppercase tracking-wider"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="pt-2">
      {/* ── HOME HERO & CURATED SECTIONS (when not searching) ── */}
      {!isSearching && (
        <>
          <HeroBanner
            onListShop={onListShop}
            onOpenVisualSearch={() => setShowVisualModal(true)}
          />

          {/* Subtle Flash Sale Ticker Strip */}
          <FlashSaleTicker />

          {/* 1. Markets Near You Section */}
          <MarketsSection />

          {/* 3. Flash Sales & Promotional Offers */}
          {offers.length > 0 && (
            <div id="offers-section" className="mb-12">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-[#C8893F]" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
                      LIMITED-TIME LOCAL OFFERS
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7]">
                    Today&apos;s Flash Sales & Discounts
                  </h2>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
                {offers.map((off, i) => (
                  <OfferCard key={off.id || i} offer={off} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* 4. Shops You Follow (if any) */}
          {followedShopsList.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-4 h-4 text-[#C24136] fill-[#C24136]" />
                <h2 className="font-serif font-bold text-xl text-[#F6EAD7]">
                  Updates From Shops You Follow
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {followedShopsList.map((s, i) => (
                  <ShopCard key={s.id} shop={s} index={i} layout="grid" />
                ))}
              </div>
            </div>
          )}

          {/* Cultural Festival Banner */}
          <FestivalBanner />

          {/* 5. Trending Crafts & Treats */}
          {popularProducts.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#C8893F]" />
                  <h2 className="font-serif font-bold text-xl text-[#F6EAD7]">
                    Trending Near You
                  </h2>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {popularProducts.map((p, i) => (
                  <div key={p.id} className="w-44 sm:w-48 shrink-0">
                    <ProductCard
                      product={p}
                      shopId={p.shopId}
                      shopName={p.shopName}
                      imgIndex={i}
                      showNew={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Divider */}
          <div id="all-shops-section" className="flex items-center gap-4 my-10">
            <div className="flex-1 h-px bg-[#F6EAD7]/10" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#C8893F]">
              ALL LOCAL HERITAGE STORES
            </span>
            <div className="flex-1 h-px bg-[#F6EAD7]/10" />
          </div>
        </>
      )}

      {/* ── RESULTS HEADER & VIEW SWITCHER ── */}
      <div className="flex items-center justify-between mb-5">
        <p className="font-serif font-bold text-sm sm:text-base text-[#F6EAD7]">
          {loading
            ? 'Discovering physical stores in this region...'
            : `${filtered.length} ${isSearching ? 'stores matching criteria' : 'verified physical shops'}`}
        </p>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#17120E] border border-[#F6EAD7]/10">
          {[
            { mode: 'grid', icon: LayoutGrid, label: 'Grid' },
            { mode: 'list', icon: List, label: 'List' },
            { mode: 'map', icon: MapIcon, label: 'Map' },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              title={`${label} View`}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === mode
                  ? 'bg-[#C8893F] text-[#0E0B08] font-bold shadow-glow-sm'
                  : 'text-[#9E8B75] hover:text-[#F6EAD7]'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT GRID / LIST / MAP ── */}
      {loading ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-3'
          }
        >
          {Array.from({ length: 8 }).map((_, i) =>
            viewMode === 'grid' ? (
              <div
                key={i}
                className="h-64 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/5 overflow-hidden skeleton-shimmer"
              />
            ) : (
              <div
                key={i}
                className="h-28 rounded-2xl bg-[#17120E] border border-[#F6EAD7]/5 skeleton-shimmer"
              />
            )
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#17120E] border border-[#F6EAD7]/10 flex items-center justify-center text-2xl mx-auto mb-3">
            🔎
          </div>
          <h3 className="font-serif text-lg font-bold text-[#F6EAD7] mb-1">No Shops Found</h3>
          <p className="text-xs text-[#9E8B75]">
            Try adjusting your search keywords or resetting active filters.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((s, i) => (
            <ShopCard key={s.id} shop={s} index={i} layout="grid" />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3 max-w-3xl mx-auto">
          {filtered.map((s, i) => (
            <ShopCard key={s.id} shop={s} index={i} layout="list" />
          ))}
        </div>
      ) : (
        <MapView shops={filtered} />
      )}

      <VisualSearchModal
        open={showVisualModal}
        onOpenChange={setShowVisualModal}
      />
    </div>
  );
}
