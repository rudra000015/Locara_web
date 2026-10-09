'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/store/useStore';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  MapPin,
  Heart,
  ShoppingBag,
  User,
  SlidersHorizontal,
  ChevronDown,
  LogOut,
  Store,
  Ticket,
  X,
  Camera,
  Home,
  Map,
  Landmark,
  Flame,
  Building2,
  Sparkles,
} from 'lucide-react';
import { FilterState } from '@/data/categories';
import FilterPanel from './FilterPanel';
import VisualSearchModal from './VisualSearchModal';

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  totalResults: number;
  onRefetch?: (q?: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  onUseGps?: () => void;
  onLocationSearch?: (label: string, lat: number, lng: number) => void;
}

const CITIES = ['Meerut', 'Delhi NCR', 'Jaipur', 'Varanasi', 'Agra', 'Lucknow'];

export default function ExplorerHeader({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  totalResults,
  selectedCity,
  onCityChange,
  onUseGps,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, cart, wishlist, logout, navTo, reservations, currentPage } = useStore();

  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showVisual, setShowVisual] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishCount = wishlist.length;
  const activeReservationsCount = reservations.filter((r) => r.status === 'CONFIRMED').length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setCityDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navTo('shops');
      router.push('/explorer/shops');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <button
              type="button"
              onClick={() => {
                navTo('home');
                router.push('/');
              }}
              className="flex items-center gap-2 text-left group"
            >
              <Image src="/locara-mark.svg" alt="" width={36} height={36} className="shrink-0" />
              <span className="font-extrabold text-xl tracking-tight text-[#32180D]">
                LOCARA
              </span>
            </button>

            {/* Location Selector (Desktop) */}
            <div className="relative hidden md:block" ref={cityDropdownRef}>
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#171717] bg-[#F5F4F0] hover:bg-[#EAE8E2] rounded-lg transition-colors border border-[#E5E5E5]"
              >
                <MapPin className="w-3.5 h-3.5 text-[#A85420]" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#666666]" />
              </button>

              {cityDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-44 bg-white rounded-lg border border-[#E5E5E5] shadow-lg py-1.5 z-50 animate-fade-in">
                  <div className="px-3 py-1 text-[11px] font-bold text-[#8A8A8A] uppercase tracking-wider">
                    Select City
                  </div>
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        onCityChange(city);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-[#F5F4F0] flex items-center justify-between ${
                        selectedCity === city ? 'text-[#A85420] font-bold bg-[#FBF3EE]' : 'text-[#171717]'
                      }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-[#A85420]" />}
                    </button>
                  ))}
                  {onUseGps && (
                    <div className="border-t border-[#E5E5E5] mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onUseGps();
                          setCityDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-[#A85420] hover:bg-[#FBF3EE] flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Use Current Location</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl items-center relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search shops, handicrafts, fashion, food..."
                className="w-full pl-10 pr-24 py-2 bg-[#F5F4F0] hover:bg-[#EFEFEA] focus:bg-white text-sm text-[#171717] rounded-lg border border-transparent focus:border-[#A85420] focus:ring-1 focus:ring-[#A85420] outline-none transition-all placeholder:text-[#8A8A8A]"
              />
              <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {query && (
                  <button
                    type="button"
                    onClick={() => onQueryChange('')}
                    className="p-1 text-[#8A8A8A] hover:text-[#171717]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowVisual(true)}
                  title="Search by image"
                  className="p-1.5 text-[#666666] hover:text-[#A85420] rounded transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Right Action Icons: Wishlist, Cart, Account */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Mobile Search Trigger */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 text-[#171717] hover:bg-[#F5F4F0] rounded-lg"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={() => {
                navTo('wishlist');
                router.push('/explorer/wishlist');
              }}
              className="relative p-2 text-[#171717] hover:bg-[#F5F4F0] rounded-lg transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </button>

            {/* Cart (Pickup Bag) */}
            <button
              type="button"
              onClick={() => {
                navTo('cart');
                router.push('/explorer/cart');
              }}
              className="relative p-2 text-[#171717] hover:bg-[#F5F4F0] rounded-lg transition-colors"
              title="Cart / Pickup Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#A85420] text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account / Profile Menu */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold text-[#171717] hover:bg-[#F5F4F0] rounded-lg transition-colors border border-transparent hover:border-[#E5E5E5]"
              >
                {user?.img ? (
                  <img
                    src={user.img}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#E5E5E5]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#F5F4F0] text-[#171717] flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="hidden sm:inline-block max-w-[90px] truncate">
                  {user ? user.name.split(' ')[0] : 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#666666] hidden sm:inline" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute top-full right-0 mt-1.5 w-56 bg-white rounded-xl border border-[#E5E5E5] shadow-lg py-1.5 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-[#E5E5E5]">
                    <p className="text-xs font-bold text-[#171717]">
                      {user ? user.name : 'Welcome to Locara'}
                    </p>
                    <p className="text-[11px] text-[#666666] truncate">
                      {user?.email || 'Local Marketplace'}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        navTo('reservations');
                        router.push('/explorer/reservations');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#171717] hover:bg-[#F5F4F0] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-[#A85420]" />
                        <span>Pickup Passes & Orders</span>
                      </div>
                      {activeReservationsCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-[#EBF8F0] text-[#16803C] text-[10px] font-bold rounded">
                          {activeReservationsCount} Active
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navTo('wishlist');
                        router.push('/explorer/wishlist');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#171717] hover:bg-[#F5F4F0] flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4 text-[#666666]" />
                      <span>Saved Gems & Wishlist</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        router.push('/owner');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#171717] hover:bg-[#F5F4F0] flex items-center gap-2 font-medium"
                    >
                      <Store className="w-4 h-4 text-[#A85420]" />
                      <span>Merchant Dashboard</span>
                    </button>
                  </div>

                  <div className="border-t border-[#E5E5E5] pt-1">
                    {user ? (
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#DC2626] hover:bg-[#FEE2E2]/40 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          router.push('/auth');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#A85420] hover:bg-[#FBF3EE] font-bold flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Sign In / Register</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* â”€â”€ Secondary Navigation Bar (Desktop & Mobile Quick Switcher) â”€â”€ */}
        <nav className="bg-[#FAFAF8] border-t border-[#E5E5E5] px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-1.5 gap-1">
            <div className="flex items-center gap-1 sm:gap-2">
              {[
                { id: 'home', label: 'Home', href: '/', page: 'home', icon: Home },
                { id: 'shops', label: 'Explore Shops', href: '/explorer/shops', page: 'shops', icon: Store },
                { id: 'map', label: 'Interactive Map', href: '/map', page: 'map', icon: Map, badge: 'Live ðŸ“' },
                { id: 'markets', label: 'Historic Markets', href: '/markets', page: 'markets', icon: Landmark },
                { id: 'festivals', label: 'Festivals & Offers', href: '/festivals', page: 'festivals', icon: Flame, badge: '20% Off' },
                { id: 'reservations', label: 'Pickup Passes', href: '/reservations', page: 'reservations', icon: Ticket },
                { id: 'owner', label: 'Merchant Dashboard', href: '/owner', page: 'owner', icon: Building2 },
              ].map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.id === 'home' && (pathname === '/' || currentPage === 'home')) ||
                  (link.id === 'shops' && (pathname?.startsWith('/explorer/shops') || pathname?.startsWith('/shops') || currentPage === 'shops')) ||
                  (link.id === 'map' && (pathname === '/map' || pathname === '/explorer/map' || currentPage === 'map')) ||
                  (link.id === 'markets' && (pathname?.startsWith('/markets') || pathname?.startsWith('/explorer/market') || currentPage === 'market-detail')) ||
                  (link.id === 'festivals' && (pathname?.startsWith('/festivals') || pathname?.startsWith('/festival') || currentPage === 'festival')) ||
                  (link.id === 'reservations' && (pathname?.startsWith('/reservations') || pathname?.startsWith('/explorer/reservations') || currentPage === 'reservations')) ||
                  (link.id === 'owner' && pathname?.startsWith('/owner'));

                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => {
                      navTo(link.page);
                      router.push(link.href);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? 'bg-[#FBF3EE] text-[#A85420] border border-[#F5DECD] font-bold shadow-xs'
                        : 'text-[#555555] hover:text-[#171717] hover:bg-[#F0EFEB]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#A85420]' : 'text-[#666666]'}`} />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#A85420] text-white">
                        {link.badge}
                      </span>
                    )}
                    {link.id === 'reservations' && activeReservationsCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#16803C] text-white">
                        {activeReservationsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Mobile Search Bar Expandable */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 pt-1 border-t border-[#E5E5E5] bg-white">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Search shops or products..."
                  autoFocus
                  className="w-full pl-9 pr-8 py-2 bg-[#F5F4F0] text-sm text-[#171717] rounded-lg border border-[#E5E5E5] focus:border-[#A85420] outline-none"
                />
                <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
                {query && (
                  <button
                    type="button"
                    onClick={() => onQueryChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowVisual(true)}
                className="p-2 border border-[#E5E5E5] rounded-lg text-[#666666]"
                title="Camera Search"
              >
                <Camera className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Filter modal / Visual Search if triggered */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={onFiltersChange}
          onClose={() => setShowFilters(false)}
          totalResults={totalResults}
        />
      )}

      {showVisual && (
        <VisualSearchModal
          open={showVisual}
          onOpenChange={setShowVisual}
        />
      )}
    </>
  );
}
