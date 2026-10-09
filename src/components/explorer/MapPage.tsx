'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { Shop } from '@/types/shop';
import { formatDistance, getGoogleDirectionsUrl } from '@/lib/geo';
import { useStore } from '@/store/useStore';
import {
  Search,
  MapPin,
  Star,
  CheckCircle2,
  Navigation,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
  Store,
  LocateFixed,
  Layers,
  List,
  Map as MapIcon,
  X,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

// Dynamically import LeafletShopMap with SSR disabled to prevent window is not defined
const LeafletShopMap = dynamic(() => import('@/components/map/LeafletShopMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#F5F4F0] text-[#666666] rounded-xl border border-[#E5E5E5]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-[#A85420] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-[#171717]">Loading interactive map...</span>
      </div>
    </div>
  ),
});

interface Props {
  city: string;
  query?: string;
  shops: Shop[];
  loading: boolean;
  error: string | null;
  locationError?: string | null;
  userLocation: { lat: number; lng: number } | null;
  centerLocation: { lat: number; lng: number } | null;
  onStartNavigation?: (shop: Shop) => void;
}

const DISTANCE_OPTIONS = [
  { label: '1 km', value: 1000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
  { label: '25 km', value: 25000 },
];

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All Shops' },
  { id: 'handicrafts', label: 'Handicrafts' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'jewellery', label: 'Jewellery' },
  { id: 'food', label: 'Food & Sweets' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'home-decor', label: 'Home Decor' },
  { id: 'beauty', label: 'Beauty' },
];

export default function MapPage({
  city,
  query: initialQuery = '',
  shops = [],
  loading,
  error,
  locationError,
  userLocation,
  centerLocation,
  onStartNavigation,
}: Props) {
  const router = useRouter();
  const { openShop, requestUserLocation, userLocation: storeLocation } = useStore();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistance, setSelectedDistance] = useState<number>(10000);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [openOnly, setOpenOnly] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [requestingLoc, setRequestingLoc] = useState(false);

  const shopItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Filter shops by search, category, distance, rating, and open status
  const filteredShops = useMemo(() => {
    return (shops || []).filter((shop) => {
      // 1. Search Query Match
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase().trim();
        const searchCorpus = [
          shop.name,
          shop.cat,
          shop.subcategory,
          shop.addr,
          shop.story,
          ...(shop.tags || []),
          ...(shop.keywords || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchCorpus.includes(queryLower)) {
          return false;
        }
      }

      // 2. Category Match
      if (selectedCategory !== 'all') {
        const catLower = selectedCategory.toLowerCase();
        const matchCat =
          shop.cat?.toLowerCase() === catLower ||
          shop.subcategory?.toLowerCase().includes(catLower) ||
          shop.tags?.some((t) => t.toLowerCase() === catLower);
        if (!matchCat) return false;
      }

      // 3. Distance Match
      if (shop.distanceMeters && shop.distanceMeters > selectedDistance) {
        return false;
      }

      // 4. Rating Match
      if (minRating && (shop.rating || 0) < minRating) {
        return false;
      }

      // 5. Open Now Match
      if (openOnly && shop.openNow === false) {
        return false;
      }

      return true;
    });
  }, [shops, searchQuery, selectedCategory, selectedDistance, minRating, openOnly]);

  // Handle marker selection -> scroll left list item into view
  const handleSelectShop = (shop: Shop) => {
    setSelectedShop(shop);
    const itemEl = shopItemRefs.current.get(shop.id);
    if (itemEl) {
      itemEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Open shop profile
  const handleViewShop = (shop: Shop) => {
    openShop(shop.id);
    router.push(`/explorer/shop/${shop.id}`);
  };

  // Handle navigation
  const handleDirections = (shop: Shop) => {
    if (onStartNavigation) {
      onStartNavigation(shop);
    } else {
      const lat = shop.loc?.[0] || 28.9845;
      const lng = shop.loc?.[1] || 77.7064;
      const url = getGoogleDirectionsUrl(lat, lng, shop.name);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRequestLocation = async () => {
    setRequestingLoc(true);
    await requestUserLocation();
    setRequestingLoc(false);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDistance(25000);
    setMinRating(null);
    setOpenOnly(false);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#FAFAF8] overflow-hidden">
      {/* ── Top Mobile Switcher (Visible on small screens) ── */}
      <div className="md:hidden flex items-center justify-between p-3 bg-white border-b border-[#E5E5E5] shrink-0">
        <div className="flex items-center gap-1.5 bg-[#F5F4F0] p-1 rounded-lg border border-[#E5E5E5]">
          <button
            type="button"
            onClick={() => setMobileView('map')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-colors ${
              mobileView === 'map'
                ? 'bg-[#A85420] text-white shadow-sm'
                : 'text-[#666666] hover:text-[#171717]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView('list')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-colors ${
              mobileView === 'list'
                ? 'bg-[#A85420] text-white shadow-sm'
                : 'text-[#666666] hover:text-[#171717]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List ({filteredShops.length})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleRequestLocation}
          disabled={requestingLoc}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#FBF3EE] hover:bg-[#F5DECD] text-[#A85420] text-xs font-bold rounded-lg border border-[#F5DECD] transition-colors"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          <span>{requestingLoc ? 'Locating...' : 'Near Me'}</span>
        </button>
      </div>

      {/* ── Main Layout: Sidebar (Left) + Map (Right) ── */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        {/* ── LEFT SIDEBAR: Search, Filters & Shop List ── */}
        <div
          className={`w-full md:w-[420px] lg:w-[460px] bg-white border-r border-[#E5E5E5] flex flex-col shrink-0 h-full overflow-hidden ${
            mobileView === 'map' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* 1. Header & Search Bar */}
          <div className="p-4 border-b border-[#E5E5E5] space-y-3 shrink-0 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold text-[#171717]">Discover Nearby Shops</h1>
                <p className="text-xs text-[#666666]">
                  {city ? `Exploring in ${city}` : 'Shops near your location'}
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#FBF3EE] text-[#A85420] rounded-full border border-[#F5DECD]">
                {filteredShops.length} stores
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shops, handicrafts, fashion, sweets..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-[#F5F4F0] border border-[#E5E5E5] rounded-lg text-[#171717] placeholder:text-gray-400 focus:outline-none focus:border-[#A85420] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#171717]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Distance Filter Pills */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#666666] font-medium">
                <span>Max Distance</span>
                <span className="font-bold text-[#A85420]">{selectedDistance / 1000} km</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {DISTANCE_OPTIONS.map((dist) => (
                  <button
                    key={dist.value}
                    type="button"
                    onClick={() => setSelectedDistance(dist.value)}
                    className={`py-1 text-xs font-semibold rounded-md border transition-colors text-center ${
                      selectedDistance === dist.value
                        ? 'bg-[#A85420] text-white border-[#A85420] shadow-sm'
                        : 'bg-white text-[#666666] border-[#E5E5E5] hover:bg-[#F5F4F0]'
                    }`}
                  >
                    {dist.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Horizontal Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-[#F5F4F0] text-[#666666] border-transparent hover:bg-[#EAE8E2] hover:text-[#171717]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Filter Badges: Rating & Open Now */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOpenOnly(!openOnly)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors flex items-center gap-1 ${
                  openOnly
                    ? 'bg-[#EBF8F0] text-[#16803C] border-[#A7F3D0]'
                    : 'bg-white text-[#666666] border-[#E5E5E5] hover:bg-[#F5F4F0]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#16803C]" />
                <span>Open Now</span>
              </button>

              <button
                type="button"
                onClick={() => setMinRating(minRating === 4 ? null : 4)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors flex items-center gap-1 ${
                  minRating === 4
                    ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                    : 'bg-white text-[#666666] border-[#E5E5E5] hover:bg-[#F5F4F0]'
                }`}
              >
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>4.0+ Stars</span>
              </button>

              {(searchQuery || selectedCategory !== 'all' || selectedDistance !== 10000 || minRating || openOnly) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  title="Reset all filters"
                  className="ml-auto p-1.5 text-gray-400 hover:text-[#A85420] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Permission Banner if Location is Denied */}
          {storeLocation.permission === 'denied' && (
            <div className="p-3 bg-[#FEF3C7]/40 border-b border-[#FDE68A] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                <span className="text-xs text-[#92400E]">Location access is off</span>
              </div>
              <button
                type="button"
                onClick={handleRequestLocation}
                className="px-2.5 py-1 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded shadow-sm transition-colors"
              >
                Enable Location
              </button>
            </div>
          )}

          {/* 3. Shop List Results */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="p-3 rounded-xl border border-[#E5E5E5] animate-pulse flex gap-3">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="p-8 text-center space-y-3 bg-[#FBF3EE]/30 rounded-xl border border-dashed border-[#E5E5E5] mt-4">
                <Store className="w-8 h-8 text-[#A85420] mx-auto opacity-70" />
                <div>
                  <h3 className="text-sm font-bold text-[#171717]">No shops found nearby</h3>
                  <p className="text-xs text-[#666666] mt-1 max-w-xs mx-auto">
                    Try expanding your distance radius or clearing your search filters to find more local stores.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-1.5 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredShops.map((shop) => {
                const isSelected = selectedShop?.id === shop.id;
                const distanceStr = shop.distanceMeters ? formatDistance(shop.distanceMeters) : 'Nearby';

                return (
                  <div
                    key={shop.id}
                    ref={(el) => {
                      if (el) shopItemRefs.current.set(shop.id, el);
                      else shopItemRefs.current.delete(shop.id);
                    }}
                    onClick={() => handleSelectShop(shop)}
                    className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                      isSelected
                        ? 'bg-[#FDF8F5] border-[#A85420] shadow-md ring-1 ring-[#A85420]/30'
                        : 'bg-white border-[#E5E5E5] hover:border-[#A85420]/50 hover:shadow-sm'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#F5F4F0] shrink-0 relative">
                      <img
                        src={
                          shop.photos?.[0] ||
                          shop.images?.[0] ||
                          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&q=80'
                        }
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white">
                        {distanceStr}
                      </span>
                    </div>

                    {/* Shop Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1 min-w-0">
                            <h3 className="font-bold text-sm text-[#171717] group-hover:text-[#A85420] transition-colors truncate">
                              {shop.name}
                            </h3>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          </div>
                        </div>

                        <p className="text-xs text-[#666666] capitalize truncate mt-0.5">
                          {shop.subcategory || shop.cat}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 text-xs text-[#666666]">
                          <div className="flex items-center gap-0.5 font-bold text-[#171717]">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{(shop.rating || 4.6).toFixed(1)}</span>
                            <span className="text-[#8A8A8A] font-normal text-[11px]">
                              ({shop.totalRatings || 120})
                            </span>
                          </div>
                          <span>•</span>
                          <span className="text-[#16803C] font-semibold text-[11px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16803C]" />
                            Open
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#F0F0F0]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewShop(shop);
                          }}
                          className="flex-1 py-1 px-2.5 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>View Shop</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirections(shop);
                          }}
                          title="Get Directions"
                          className="p-1 px-2 bg-[#F5F4F0] hover:bg-[#EAE8E2] text-[#171717] text-xs font-semibold rounded-md flex items-center justify-center gap-1 border border-[#E5E5E5] transition-colors"
                        >
                          <Navigation className="w-3 h-3 text-[#A85420]" />
                          <span>Directions</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT AREA: Leaflet Interactive Map ── */}
        <div
          className={`flex-1 h-full w-full relative ${
            mobileView === 'list' ? 'hidden md:block' : 'block'
          }`}
        >
          <LeafletShopMap
            shops={filteredShops}
            selectedShop={selectedShop}
            onSelectShop={handleSelectShop}
            onNavigateToShop={handleDirections}
            userLocation={userLocation}
            centerLocation={centerLocation}
            onRequestUserLocation={handleRequestLocation}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
