'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useExplorerRuntimeStore } from '@/store/useExplorerRuntimeStore';
import { usePathname, useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { CATEGORIES, FilterState } from '@/data/categories';
import FilterPanel from './FilterPanel';
import VisualSearchModal from './VisualSearchModal';
import CommandPalette from '@/components/ui/CommandPalette';
import {
  Search,
  SlidersHorizontal,
  Heart,
  Bell,
  MapPin,
  Camera,
  ChevronDown,
  Store,
  Sparkles,
  Command,
  ShoppingBag,
  CalendarCheck,
} from 'lucide-react';

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  totalResults: number;
  onRefetch: (q?: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  onUseGps: () => void;
}

export default function ExplorerHeader({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  totalResults,
  onRefetch,
  selectedCity,
  onCityChange,
  onUseGps,
}: Props) {
  const { user, cart, wishlist, logout, searchHistory, addSearchHistory, navTo } = useStore();
  const { notifications, readIds } = useExplorerRuntimeStore();
  const router = useRouter();
  const pathname = usePathname();
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);

  const [locationOpen, setLocationOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showVisual, setShowVisual] = useState(false);
  const [showLens, setShowLens] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [focused, setFocused] = useState(false);

  const POPULAR = ['Karol Bagh Lehengas', 'Hira Sweets', 'Jalebi', 'Banarasi Silk', 'Chinar Crafts', 'Kundan Jewellery'];
  const unreadNotifications = notifications.filter((item) => !readIds.includes(item.id)).length;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const activeFilterCount = [
    filters.category !== 'all',
    filters.sort !== 'relevance',
    filters.openNow,
    filters.minRating > 0,
    filters.priceRange !== 'all',
  ].filter(Boolean).length;

  const handleSearch = (val: string) => {
    onQueryChange(val);
    if (val.length >= 3) {
      onRefetch(`${val} ${selectedCity}`);
      addSearchHistory(val);
    }
    if (val.length === 0) onRefetch();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0E0B08]/90 backdrop-blur-2xl border-b border-[#F6EAD7]/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Row 1: Logo, Location, Command Search, Actions */}
          <div className="flex items-center justify-between gap-3 h-16">
            {/* Logo */}
            <button
              onClick={() => {
                navTo('home');
                router.push('/explorer');
              }}
              className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer shrink-0 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#261D16] to-[#1B140F] border border-[#C8893F]/40 flex items-center justify-center shadow-sm group-hover:border-[#C8893F] transition-colors">
                <Store className="w-4 h-4 text-[#C8893F]" />
              </div>
              <div className="hidden sm:block">
                <p className="font-serif text-base font-bold text-[#F6EAD7] leading-tight tracking-wide group-hover:text-white transition-colors">
                  LOCARA
                </p>
                <p className="text-[9px] font-mono tracking-[0.18em] uppercase text-[#E0AF62]">
                  Hyperlocal Commerce
                </p>
              </div>
            </button>

            {/* Location Selector (Desktop/Tablet) */}
            <button
              onClick={() => setLocationOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#17120E] border border-[#F6EAD7]/10 hover:border-[#C8893F]/40 hover:bg-[#211A14] transition-all cursor-pointer shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C8893F]" />
              <div className="text-left">
                <p className="text-[9px] font-mono uppercase tracking-wider text-[#9E8B75] leading-none">
                  Location
                </p>
                <p className="text-xs font-bold text-[#F6EAD7] leading-tight">{selectedCity}, IN</p>
              </div>
              <ChevronDown className="w-3 h-3 text-[#9E8B75]" />
            </button>

            {/* Central Search Bar with Quick Trigger */}
            <div className="flex-1 max-w-xl relative mx-2 min-w-0">
              <div
                className={`flex items-center gap-2.5 px-3.5 h-10 rounded-xl bg-[#17120E] border transition-all duration-200 ${
                  focused
                    ? 'border-[#C8893F] ring-2 ring-[#C8893F]/20 bg-[#211A14]'
                    : 'border-[#F6EAD7]/10 hover:border-[#F6EAD7]/20'
                }`}
                onClick={() => inputRef.current?.focus()}
              >
                <Search
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    focused ? 'text-[#C8893F]' : 'text-[#9E8B75]'
                  }`}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 200)}
                  placeholder="Search products, shops, markets..."
                  className="flex-1 bg-transparent text-xs sm:text-sm text-[#F6EAD7] placeholder-[#9E8B75] outline-none font-medium min-w-0"
                />

                {query && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQueryChange('');
                      onRefetch();
                    }}
                    className="text-[#9E8B75] hover:text-[#F6EAD7] text-sm px-1"
                  >
                    ×
                  </button>
                )}

                {/* Command palette hint */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCommandPalette(true);
                  }}
                  className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#211A14] border border-[#F6EAD7]/10 text-[10px] font-mono text-[#9E8B75] hover:text-[#F6EAD7]"
                  title="Open Command Palette (Cmd+K)"
                >
                  <Command className="w-2.5 h-2.5" /> K
                </button>

                {/* Lens search camera icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLens(true);
                  }}
                  title="Search with Camera"
                  className="w-7 h-7 rounded-lg bg-[#211A14] hover:bg-[#2A2119] text-[#C8893F] flex items-center justify-center shrink-0 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Instant Search Dropdown */}
              {focused && !query && (
                <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#17120E] border border-[#F6EAD7]/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto no-scrollbar">
                  {searchHistory.length > 0 && (
                    <div className="p-2 border-b border-[#F6EAD7]/5">
                      <p className="px-2 py-1 text-[10px] font-mono uppercase text-[#9E8B75] tracking-wider">
                        Recent Searches
                      </p>
                      {searchHistory.slice(0, 3).map((h) => (
                        <button
                          key={h}
                          onClick={() => {
                            onQueryChange(h);
                            setFocused(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#D8C4A7] hover:text-[#F6EAD7] hover:bg-[#211A14] text-left transition-colors"
                        >
                          <span className="text-[#9E8B75]">↺</span> {h}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="p-2">
                    <p className="px-2 py-1 text-[10px] font-mono uppercase text-[#E0AF62] tracking-wider font-bold">
                      Trending Searches
                    </p>
                    <div className="flex flex-wrap gap-1.5 p-1">
                      {POPULAR.map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            onQueryChange(p);
                            setFocused(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#211A14] hover:bg-[#2A2119] text-xs text-[#F6EAD7] border border-[#F6EAD7]/10 transition-colors"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                title="Filters"
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                  activeFilterCount > 0
                    ? 'bg-[#C8893F]/20 border-[#C8893F] text-[#E0AF62]'
                    : 'bg-[#17120E] border-[#F6EAD7]/10 text-[#D8C4A7] hover:text-[#F6EAD7] hover:bg-[#211A14]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C8893F] text-[#0E0B08] font-bold text-[9px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button
                onClick={() => navTo('cart')}
                title="In-Store Pickup Cart"
                className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-[#17120E] border border-[#F6EAD7]/10 text-[#D8C4A7] hover:text-[#F6EAD7] hover:bg-[#211A14] transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#C8893F] text-[#0E0B08] font-black text-[9px] flex items-center justify-center leading-none">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* Reservations Button */}
              <button
                onClick={() => navTo('reservations')}
                title="Active Reservations"
                className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-[#17120E] border border-[#F6EAD7]/10 text-[#D8C4A7] hover:text-[#F6EAD7] hover:bg-[#211A14] transition-all cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => navTo('wishlist')}
                title="Saved Gems"
                className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-[#17120E] border border-[#F6EAD7]/10 text-[#D8C4A7] hover:text-[#F6EAD7] hover:bg-[#211A14] transition-all cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 ${
                    wishlist.length > 0 ? 'text-[#C24136] fill-[#C24136]' : ''
                  }`}
                />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#C24136] text-white font-black text-[9px] flex items-center justify-center leading-none">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Notifications Button */}
              <button
                onClick={() => navTo('notifications')}
                title="Notifications"
                className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-[#17120E] border border-[#F6EAD7]/10 text-[#D8C4A7] hover:text-[#F6EAD7] hover:bg-[#211A14] transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#E0AF62] shadow-glow" />
                )}
              </button>

              {/* Profile / Logout Avatar */}
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                title={user ? `${user.name} (Click to Logout / Switch Role)` : 'Sign In'}
                className="w-9 h-9 rounded-xl bg-[#211A14] border border-[#F6EAD7]/15 overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#C8893F] transition-colors"
              >
                {user?.img ? (
                  <img src={user.img} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-[#E0AF62]">U</span>
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Category Navigation Ribbon */}
          <div className="flex items-center gap-1.5 pb-2.5 overflow-x-auto no-scrollbar">
            {/* Desktop Quick Nav Links */}
            <div className="hidden lg:flex items-center gap-1 shrink-0 pr-2 border-r border-[#F6EAD7]/10 mr-1">
              {[
                { label: 'Markets', action: () => navTo('home') },
                { label: 'Map Discovery', action: () => navTo('map') },
                { label: 'Reservations', action: () => navTo('reservations') },
                { label: 'Cart', action: () => navTo('cart') },
                { label: 'Saved', action: () => navTo('wishlist') },
              ].map((nav, i) => (
                <button
                  key={i}
                  onClick={nav.action}
                  className="px-3 py-1 rounded-lg text-xs font-bold text-[#D8C4A7] hover:text-[#F6EAD7] hover:bg-[#211A14] transition-all"
                >
                  {nav.label}
                </button>
              ))}
            </div>

            {/* Category Ribbon */}
            {CATEGORIES.map((cat) => {
              const active = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onFiltersChange({ ...filters, category: cat.id })}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    active
                      ? 'bg-[#C8893F] text-[#0E0B08] font-bold shadow-glow-sm'
                      : 'bg-[#17120E] text-[#D8C4A7] hover:text-[#F6EAD7] hover:bg-[#211A14] border border-[#F6EAD7]/5'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Location Modal */}
      {locationOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => setLocationOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#17120E] border border-[#F6EAD7]/10 rounded-3xl p-5 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base font-bold text-[#F6EAD7]">Select City Region</h3>
              <button
                onClick={() => setLocationOpen(false)}
                className="text-[#9E8B75] hover:text-[#F6EAD7]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1">
              {[
                { name: 'Delhi', sub: 'Old Delhi & Chandni Chowk • New Delhi' },
                { name: 'Meerut', sub: 'Historical Hub • Sadar Bazaar' },
                { name: 'Noida', sub: 'Delhi NCR • Sector 18 Bazaars' },
                { name: 'Ghaziabad', sub: 'Traditional Local Markets' },
                { name: 'Lucknow', sub: 'Heritage Awadh • Hazratganj' },
              ].map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => {
                    onCityChange(loc.name);
                    setLocationOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                    selectedCity === loc.name
                      ? 'bg-[#C8893F]/15 border border-[#C8893F]/40 text-[#E0AF62]'
                      : 'hover:bg-[#211A14] text-[#F6EAD7]'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{loc.name}</p>
                    <p className="text-[10px] text-[#9E8B75]">{loc.sub}</p>
                  </div>
                  {selectedCity === loc.name && <Sparkles className="w-3.5 h-3.5 text-[#C8893F]" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                onUseGps();
                setLocationOpen(false);
              }}
              className="w-full mt-3 py-2.5 rounded-xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-xs font-bold text-[#F6EAD7] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C8893F]" />
              Detect My GPS Location
            </button>
          </div>
        </div>
      )}

      {/* Command Palette, Filters & Lens Modals */}
      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        onSelectShop={(shopId) => {
          navTo('shop');
          router.push(`/explorer/shop/${shopId}`);
        }}
      />
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={onFiltersChange}
          onClose={() => setShowFilters(false)}
          totalResults={totalResults}
        />
      )}
      <VisualSearchModal
        open={showVisual || showLens}
        onOpenChange={(open) => {
          setShowVisual(open);
          setShowLens(open);
        }}
      />
    </>
  );
}
