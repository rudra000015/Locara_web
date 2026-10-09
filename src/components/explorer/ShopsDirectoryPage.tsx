'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useShops } from '@/hooks/useShops';
import { useStore } from '@/store/useStore';
import { SHOPS } from '@/data/shops';
import ShopCard from './ShopCard';
import {
  SlidersHorizontal,
  X,
  Star,
  ChevronDown,
  RotateCcw,
  Check,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { id: 'fashion', label: 'Fashion' },
  { id: 'jewellery', label: 'Jewellery' },
  { id: 'handicrafts', label: 'Handicrafts' },
  { id: 'home-decor', label: 'Home Decor' },
  { id: 'food', label: 'Food' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'others', label: 'Others' },
];

export default function ShopsDirectoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';
  const { userLocation, requestUserLocation } = useStore();

  const { shops: liveShops } = useShops({
    radius: 10000,
    lat: userLocation.latitude ?? undefined,
    lng: userLocation.longitude ?? undefined,
  });
  const allShops = liveShops && liveShops.length > 0 ? liveShops : SHOPS;

  const [search, setSearch] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [distanceMax, setDistanceMax] = useState(10);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [openOnly, setOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState('nearest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleSortChange = async (newSort: string) => {
    setSortBy(newSort);
    if (newSort === 'nearest' && userLocation.latitude === null) {
      await requestUserLocation();
    }
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setDistanceMax(10);
    setMinRating(null);
    setOpenOnly(false);
    setSearch('');
  };

  const filteredShops = useMemo(() => {
    return allShops
      .filter((s) => {
        const matchQuery =
          !search ||
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.addr.toLowerCase().includes(search.toLowerCase()) ||
          (s.cat ?? '').toLowerCase().includes(search.toLowerCase());

        const matchCat =
          selectedCategories.length === 0 ||
          selectedCategories.includes(s.cat?.toLowerCase() || '') ||
          selectedCategories.includes(s.subcategory?.toLowerCase() || '');

        const matchRating = !minRating || (s.rating || 0) >= minRating;
        const matchOpen = !openOnly || s.openNow !== false;

        return matchQuery && matchCat && matchRating && matchOpen;
      })
      .sort((a, b) => {
        if (sortBy === 'highest-rated') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'newest') return (b.est || 0) - (a.est || 0);
        if (sortBy === 'most-popular') return (b.totalRatings || 0) - (a.totalRatings || 0);
        return (a.distanceMeters || 1000) - (b.distanceMeters || 1000);
      });
  }, [allShops, search, selectedCategories, minRating, openOnly, sortBy]);

  const filterSidebar = (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-6 shadow-sm">
      {/* Filter Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
        <h3 className="font-bold text-sm text-[#171717]">Filters</h3>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-xs font-semibold text-[#A85420] hover:text-[#873F17]"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider mb-3">
          Categories
        </h4>
        <div className="space-y-2">
          {CATEGORY_OPTIONS.map((cat) => {
            const isChecked = selectedCategories.includes(cat.id);
            return (
              <label
                key={cat.id}
                className="flex items-center gap-2 text-xs text-[#171717] cursor-pointer hover:text-[#A85420]"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCategory(cat.id)}
                  className="w-4 h-4 rounded border-[#E5E5E5] text-[#A85420] focus:ring-[#A85420] accent-[#A85420]"
                />
                <span>{cat.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Distance */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
            Distance
          </h4>
          <span className="text-xs font-medium text-[#666666]">{distanceMax} km</span>
        </div>
        <input
          type="range"
          min="1"
          max="25"
          value={distanceMax}
          onChange={(e) => setDistanceMax(Number(e.target.value))}
          className="w-full h-1.5 bg-[#E5E5E5] rounded-lg appearance-none cursor-pointer accent-[#A85420]"
        />
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider mb-3">
          Rating
        </h4>
        <div className="space-y-2">
          {[4, 3].map((stars) => (
            <label
              key={stars}
              className="flex items-center gap-2 text-xs text-[#171717] cursor-pointer hover:text-[#A85420]"
            >
              <input
                type="radio"
                name="rating"
                checked={minRating === stars}
                onChange={() => setMinRating(minRating === stars ? null : stars)}
                className="w-4 h-4 text-[#A85420] focus:ring-[#A85420] accent-[#A85420]"
              />
              <div className="flex items-center gap-1">
                <div className="flex text-[#D97706]">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span>{stars} & above</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Open Now Toggle */}
      <div className="pt-2 border-t border-[#E5E5E5]">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold text-[#171717]">Open Now Only</span>
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(e) => setOpenOnly(e.target.checked)}
            className="w-4 h-4 rounded text-[#A85420] focus:ring-[#A85420] accent-[#A85420]"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Mobile Filter & Sort Bar */}
      <div className="md:hidden flex items-center justify-between gap-3 mb-4">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="flex-1 py-2 px-3 bg-white border border-[#E5E5E5] rounded-lg text-xs font-bold text-[#171717] flex items-center justify-center gap-2 shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#A85420]" />
          <span>Filters</span>
          {selectedCategories.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#A85420] text-white text-[10px] flex items-center justify-center">
              {selectedCategories.length}
            </span>
          )}
        </button>

        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="py-2 px-3 bg-white border border-[#E5E5E5] rounded-lg text-xs font-semibold text-[#171717] outline-none shadow-sm cursor-pointer"
        >
          <option value="nearest">Sort: Nearest</option>
          <option value="highest-rated">Highest Rated</option>
          <option value="most-popular">Most Popular</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Desktop Left Sidebar */}
        <aside className="hidden md:block md:col-span-1">
          {filterSidebar}
        </aside>

        {/* Right Shop Results Column */}
        <main className="md:col-span-3 space-y-4">
          {/* Header Bar */}
          <div className="hidden md:flex items-center justify-between bg-white border border-[#E5E5E5] rounded-xl px-5 py-3 shadow-sm">
            <span className="text-sm font-bold text-[#171717]">
              {filteredShops.length} shops found
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#666666]">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="py-1 px-3 bg-[#F5F4F0] border border-[#E5E5E5] rounded-lg text-xs font-semibold text-[#171717] outline-none cursor-pointer"
              >
                <option value="nearest">Nearest</option>
                <option value="highest-rated">Highest Rated</option>
                <option value="most-popular">Most Popular</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Results List */}
          {filteredShops.length > 0 ? (
            <div className="space-y-4">
              {filteredShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} layout="list" />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F5F4F0] text-[#666666] flex items-center justify-center mx-auto">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#171717]">No shops match your criteria</h3>
              <p className="text-xs text-[#666666] max-w-sm mx-auto">
                Try clearing some filters or searching for another category.
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 bg-[#A85420] text-white text-xs font-semibold rounded-lg hover:bg-[#873F17] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <h3 className="font-bold text-base text-[#171717]">Filters</h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-[#666666] hover:text-[#171717]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {filterSidebar}

            <div className="pt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleClearAll();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-2.5 bg-[#F5F4F0] text-[#171717] font-semibold text-xs rounded-lg"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-[#A85420] text-white font-bold text-xs rounded-lg"
              >
                Apply Filters ({filteredShops.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
