'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Sparkles,
  ShoppingBag,
  Store,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Shirt,
  Gem,
  Lamp,
  Palette,
  Utensils,
  Smile,
  Smartphone,
  MoreHorizontal,
  Flame,
  LocateFixed,
  Map as MapIcon,
  Navigation,
} from 'lucide-react';
import { getGoogleDirectionsUrl } from '@/lib/geo';

const LeafletShopMap = dynamic(() => import('@/components/map/LeafletShopMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[340px] rounded-2xl bg-[#242424] flex items-center justify-center text-gray-400 text-xs border border-white/10">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-[#A85420] border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-300 font-medium">Loading live discovery map...</span>
      </div>
    </div>
  ),
});
import { useStore } from '@/store/useStore';
import { Shop } from '@/types/shop';
import { FilterState } from '@/data/categories';
import { SHOPS } from '@/data/shops';
import ShopCard from './ShopCard';
import ProductCard from './ProductCard';

interface Props {
  query: string;
  filters: FilterState;
  shops: Shop[];
  loading: boolean;
  error: string | null;
  refetch: (q?: string) => void;
  onListShop?: () => void;
}

const CATEGORIES = [
  { id: 'fashion', label: 'Fashion', icon: Shirt, color: 'bg-rose-50 text-rose-600' },
  { id: 'jewellery', label: 'Jewellery', icon: Gem, color: 'bg-amber-50 text-amber-600' },
  { id: 'home-decor', label: 'Home Decor', icon: Lamp, color: 'bg-blue-50 text-blue-600' },
  { id: 'handicrafts', label: 'Handicrafts', icon: Palette, color: 'bg-orange-50 text-orange-600' },
  { id: 'food', label: 'Food', icon: Utensils, color: 'bg-emerald-50 text-emerald-600' },
  { id: 'beauty', label: 'Beauty', icon: Smile, color: 'bg-pink-50 text-pink-600' },
  { id: 'electronics', label: 'Electronics', icon: Smartphone, color: 'bg-purple-50 text-purple-600' },
  { id: 'more', label: 'More', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
];

export default function HomePage({ query, shops: liveShops }: Props) {
  const router = useRouter();
  const { navTo, openShop, userLocation, requestUserLocation } = useStore();
  const [heroSearch, setHeroSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('Meerut');
  const [locating, setLocating] = useState(false);
  const [heroSelectedShop, setHeroSelectedShop] = useState<Shop | null>(null);

  const allShops = liveShops && liveShops.length > 0 ? liveShops : SHOPS;

  // Flatten products from shops for popular products grid
  const popularProducts = allShops.flatMap((s) =>
    (s.products || []).map((p) => ({
      ...p,
      shopId: s.id,
      shopName: s.name,
    }))
  ).slice(0, 8);

  const featuredShops = allShops.slice(0, 4);
  const nearbyShops = allShops.slice(0, 6);

  const handleEnableLocation = async () => {
    setLocating(true);
    await requestUserLocation();
    setLocating(false);
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navTo('shops');
    router.push(`/explorer/shops?q=${encodeURIComponent(heroSearch)}`);
  };

  const handleCategoryClick = (catId: string) => {
    navTo('shops');
    router.push(`/explorer/shops?category=${catId}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-16">
      {/* ── 1. Hero Section with Embedded Live Discovery Map ──────────────── */}
      <section className="relative bg-[#171717] text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Texture Overlay */}
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1600&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/90" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Title, Subtitle, Search & Filter Tags */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#A85420]/30 text-[#F5DECD] border border-[#A85420]/40">
                <Sparkles className="w-3.5 h-3.5 text-[#A85420]" />
                Local Marketplace of Meerut & Heritage Bazaars
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Find shops & products <br /> near you
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
                Discover authentic heritage stores, artisanal workshops, and trusted local merchants across Meerut. Reserve products online with a 10% advance deposit.
              </p>

              {/* Search Form with City Selector */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-2 rounded-xl shadow-xl flex flex-col sm:flex-row items-center gap-2 max-w-xl"
              >
                <div className="flex items-center gap-2 px-3 py-2 text-gray-700 w-full sm:w-auto border-b sm:border-b-0 sm:border-r border-gray-200">
                  <MapPin className="w-4 h-4 text-[#A85420] shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="text-xs font-bold text-gray-800 bg-transparent outline-none cursor-pointer"
                  >
                    <option value="Meerut">Meerut</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Agra">Agra</option>
                  </select>
                </div>

                <div className="flex-1 flex items-center gap-2 px-3 w-full">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search shops, handicrafts, fashion..."
                    className="w-full text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Filter Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleEnableLocation}
                  disabled={locating}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1.5 transition-colors"
                >
                  <LocateFixed className="w-3.5 h-3.5 text-blue-400" />
                  <span>{locating ? 'Locating...' : 'Near Me'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('handicrafts')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
                >
                  🎨 Handicrafts
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('fashion')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
                >
                  👗 Fashion
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('food')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
                >
                  🍲 Sweets & Food
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('jewellery')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
                >
                  💎 Jewellery
                </button>
              </div>

              {/* Quick Action Links */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navTo('map');
                    router.push('/map');
                  }}
                  className="px-4 py-2 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Explore Full Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navTo('shops');
                    router.push('/explorer/shops');
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/20 transition-colors"
                >
                  Browse All Stores ({allShops.length})
                </button>
              </div>
            </div>

            {/* Right Column: Embedded Interactive Discovery Map */}
            <div className="lg:col-span-6 w-full">
              <div className="bg-black/50 p-2.5 sm:p-3 rounded-2xl border border-white/15 backdrop-blur-md shadow-2xl space-y-2">
                {/* Map Header Bar */}
                <div className="flex items-center justify-between px-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white">Live Discovery Map</span>
                    <span className="text-[11px] text-gray-300 bg-white/10 px-2 py-0.5 rounded-full">
                      {allShops.length} Shops in {selectedCity}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navTo('map');
                      router.push('/map');
                    }}
                    className="text-xs text-[#F5DECD] hover:text-white font-bold flex items-center gap-1"
                  >
                    <span>Full View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Leaflet Map Preview Container */}
                <div className="h-[340px] sm:h-[380px] w-full rounded-xl overflow-hidden border border-white/10">
                  <LeafletShopMap
                    shops={allShops}
                    selectedShop={heroSelectedShop}
                    onSelectShop={(s) => {
                      setHeroSelectedShop(s);
                    }}
                    onNavigateToShop={(s) => {
                      const lat = s.loc?.[0] || 28.9845;
                      const lng = s.loc?.[1] || 77.7064;
                      window.open(getGoogleDirectionsUrl(lat, lng, s.name), '_blank', 'noopener,noreferrer');
                    }}
                    userLocation={
                      userLocation.latitude !== null && userLocation.longitude !== null
                        ? { lat: userLocation.latitude, lng: userLocation.longitude }
                        : null
                    }
                    onRequestUserLocation={handleEnableLocation}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 mt-8">
        {/* ── 2. Categories Row ─────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-4 pb-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="flex flex-col items-center gap-2 group min-w-[72px] text-center"
                >
                  <div
                    className={`w-14 h-14 rounded-full ${cat.color} flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-sm border border-black/5`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-[#171717] group-hover:text-[#A85420]">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── 3. How Locara In-Store Pickup Works ───────────── */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E5E5]">
            <div className="flex items-start gap-3 pt-3 sm:pt-0 sm:pr-3">
              <div className="w-8 h-8 rounded-full bg-[#FBF3EE] text-[#A85420] font-bold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#171717]">Discover Local Shops</h4>
                <p className="text-[11px] text-[#666666] mt-0.5">Explore authentic heritage & artisanal shops in Meerut.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 sm:pt-0 sm:px-3">
              <div className="w-8 h-8 rounded-full bg-[#FBF3EE] text-[#A85420] font-bold text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#171717]">Reserve Online (10%)</h4>
                <p className="text-[11px] text-[#666666] mt-0.5">Hold exclusive products with a small 10% advance deposit.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 sm:pt-0 sm:px-3">
              <div className="w-8 h-8 rounded-full bg-[#FBF3EE] text-[#A85420] font-bold text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#171717]">Get Instant Pass</h4>
                <p className="text-[11px] text-[#666666] mt-0.5">Receive your verified 6-digit OTP & digital QR pass.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 sm:pt-0 sm:pl-3">
              <div className="w-8 h-8 rounded-full bg-[#FBF3EE] text-[#A85420] font-bold text-xs flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#171717]">Pickup & Pay Balance</h4>
                <p className="text-[11px] text-[#666666] mt-0.5">Visit the shop, inspect the product, and pay 90% balance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Featured Shops (Horizontal Cards) ─────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#171717]">Featured Shops</h2>
              <p className="text-xs text-[#666666]">Handpicked heritage institutions & iconic stores</p>
            </div>
            <button
              onClick={() => {
                navTo('shops');
                router.push('/explorer/shops');
              }}
              className="text-xs font-bold text-[#A85420] hover:text-[#873F17] flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} layout="grid" />
            ))}
          </div>
        </section>

        {/* ── 5. Popular Products (ProductCard Grid) ───────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#171717]">Popular Products</h2>
              <p className="text-xs text-[#666666]">Most loved traditional items & artisanal handicrafts</p>
            </div>
            <button
              onClick={() => {
                navTo('shops');
                router.push('/explorer/shops');
              }}
              className="text-xs font-bold text-[#A85420] hover:text-[#873F17] flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {popularProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                shopId={prod.shopId}
                shopName={prod.shopName}
              />
            ))}
          </div>
        </section>

        {/* ── 6. Flash Sale / Festive Banner ──────────────── */}
        <section className="bg-gradient-to-r from-[#A85420] to-[#6E3210] rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded">
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Festive Season Special</span>
            </div>
            <h3 className="text-2xl font-extrabold">Flat 20% OFF on Local Handicrafts</h3>
            <p className="text-xs text-orange-100 max-w-md">
              Reserve your festive brass idols, decorative lighting, and handwoven textiles before stock runs out.
            </p>
          </div>

          <button
            onClick={() => {
              navTo('shops');
              router.push('/explorer/shops?category=handicrafts');
            }}
            className="px-6 py-3 bg-white text-[#A85420] hover:bg-[#F5F4F0] font-bold text-xs rounded-lg transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
          >
            <span>Explore Offers</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>

        {/* ── 7. Shops Near You Section ─────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#171717]">Shops Near You</h2>
              <p className="text-xs text-[#666666]">
                {userLocation.latitude !== null
                  ? 'Real-time local stores ordered by distance from your location'
                  : 'Open heritage stores and artisan merchants in your area'}
              </p>
            </div>
            <button
              onClick={() => {
                navTo('map');
                router.push('/map');
              }}
              className="text-xs font-bold text-[#A85420] hover:text-[#873F17] flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Explore on Map</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* If location permission is not granted yet, show the friendly CTA banner */}
          {userLocation.latitude === null && (
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#FBF3EE] text-[#A85420] flex items-center justify-center mx-auto border border-[#F5DECD]">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-sm font-bold text-[#171717]">Allow location to find shops near you</h3>
                <p className="text-xs text-[#666666]">
                  Discover nearby heritage institutions, artisan workshops, and local markets sorted by exact distance.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleEnableLocation}
                  disabled={locating}
                  className="px-5 py-2.5 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <LocateFixed className="w-4 h-4" />
                  <span>{locating ? 'Detecting Location...' : 'Enable Location'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navTo('shops');
                    router.push('/explorer/shops');
                  }}
                  className="px-5 py-2.5 bg-[#F5F4F0] hover:bg-[#EAE8E2] text-[#171717] text-xs font-bold rounded-lg border border-[#E5E5E5] transition-colors"
                >
                  Browse All Shops
                </button>
              </div>
            </div>
          )}

          {/* Nearby Shop Cards */}
          <div className="space-y-3">
            {nearbyShops.slice(0, 4).map((shop) => (
              <ShopCard key={shop.id} shop={shop} layout="list" />
            ))}
          </div>
        </section>
      </div>

      {/* ── 8. Footer ────────────────────────────────────── */}
      <footer className="mt-16 bg-white border-t border-[#E5E5E5] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#A85420] flex items-center justify-center text-white font-bold text-sm">
                L
              </div>
              <span className="font-extrabold text-lg tracking-tight text-[#171717]">LOCARA</span>
            </div>
            <p className="text-xs text-[#666666] leading-relaxed">
              Your local marketplace for authentic heritage shops, traditional crafts, and trusted neighborhood merchants.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider mb-3">Shop Categories</h4>
            <ul className="space-y-2 text-xs text-[#666666]">
              <li><button onClick={() => handleCategoryClick('handicrafts')} className="hover:text-[#A85420]">Handicrafts & Decor</button></li>
              <li><button onClick={() => handleCategoryClick('fashion')} className="hover:text-[#A85420]">Fashion & Apparel</button></li>
              <li><button onClick={() => handleCategoryClick('jewellery')} className="hover:text-[#A85420]">Traditional Jewellery</button></li>
              <li><button onClick={() => handleCategoryClick('food')} className="hover:text-[#A85420]">Sweets & Local Food</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider mb-3">Customer Service</h4>
            <ul className="space-y-2 text-xs text-[#666666]">
              <li><button onClick={() => router.push('/reservations')} className="hover:text-[#A85420]">My Pickup Passes</button></li>
              <li><button onClick={() => router.push('/cart')} className="hover:text-[#A85420]">Pickup Bag</button></li>
              <li><button onClick={() => router.push('/map')} className="hover:text-[#A85420]">Marketplace Map</button></li>
              <li><span className="text-[#8A8A8A]">Help & Support: support@locara.app</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider mb-3">For Shop Owners</h4>
            <p className="text-xs text-[#666666] mb-3">
              Are you a heritage or local merchant? List your shop and accept in-store drop reservations.
            </p>
            <button
              onClick={() => router.push('/owner')}
              className="px-4 py-2 bg-[#F5F4F0] hover:bg-[#A85420] hover:text-white text-[#171717] text-xs font-bold rounded-lg border border-[#E5E5E5] transition-colors"
            >
              Merchant Dashboard →
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A8A8A] gap-2">
          <span>© {new Date().getFullYear()} LOCARA Technologies. All rights reserved.</span>
          <span>Made for local shop lovers in Meerut</span>
        </div>
      </footer>
    </div>
  );
}
