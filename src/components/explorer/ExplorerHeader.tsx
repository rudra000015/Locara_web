'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useExplorerRuntimeStore } from '@/store/useExplorerRuntimeStore';
import { usePathname, useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { CATEGORIES, FilterState } from '@/data/categories';
import FilterPanel from './FilterPanel';
import VisualSearchModal from './VisualSearchModal';
import CommandPalette from '@/components/ui/CommandPalette';
import ThemeToggle from '@/components/ui/ThemeToggle';
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
  User,
  LogOut,
  X,
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
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [focused, setFocused] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const POPULAR = ['Banarasi Silk', 'Hira Sweets', 'Chandni Chowk', 'Kundan Jewellery', 'Kaju Katli', 'Chinar Crafts'];
  const unreadNotifications = notifications.filter((item) => !readIds.includes(item.id)).length;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (val: string) => {
    onQueryChange(val);
    if (val.length >= 3) {
      onRefetch(`${val} ${selectedCity}`);
      addSearchHistory(val);
    }
    if (val.length === 0) onRefetch();
  };

  const navLinks = [
    { label: 'Discover', href: '/', id: 'home' },
    { label: 'Markets', href: '/markets', id: 'markets' },
    { label: 'Shops', href: '/shops', id: 'shops' },
    { label: 'Map', href: '/map', id: 'map' },
    { label: 'Stories', href: '/stories', id: 'stories' },
    { label: 'For Shops', href: '/owner', id: 'owner' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-bg-header backdrop-blur-2xl border-b border-border transition-all duration-300 ${scrolled ? 'py-1 shadow-xl' : 'py-1.5 sm:py-2'
          }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Main Top Row */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-13 sm:h-16">
            {/* Logo & Slogan */}
            <button
              onClick={() => {
                navTo('home');
                router.push('/');
              }}
              className="flex items-center gap-2 sm:gap-3 bg-transparent border-none cursor-pointer shrink-0 text-left group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-bg-card2 border border-[#C8893F]/40 flex items-center justify-center shadow-sm group-hover:border-[#C8893F] transition-all">
                <Store className="w-4 h-4 sm:w-5 sm:h-5 text-[#C8893F]" />
              </div>
              <div>
                <p className="font-serif text-base sm:text-lg font-black tracking-wider text-fg-heading leading-tight group-hover:text-[#C8893F] transition-colors">
                  LOCARA
                </p>
                <p className="text-[7.5px] sm:text-[9px] font-mono tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#C8893F] font-bold">
                  PLACES • PEOPLE • STORIES
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links (Hidden on Mobile) */}
            <nav className="hidden lg:flex items-center gap-1.5 shrink-0">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      if (link.id === 'owner') {
                        router.push('/owner');
                      } else {
                        navTo(link.id as any);
                        router.push(link.href);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${isActive
                        ? 'text-[#C8893F] bg-bg-pill shadow-sm'
                        : 'text-fg-secondary hover:text-fg hover:bg-bg-cardHover'
                      }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#C8893F]" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Desktop Central Search Bar (Hidden on Mobile) */}
            <div className="hidden md:flex flex-1 max-w-md relative mx-2 min-w-0">
              <div
                className={`flex items-center gap-2.5 px-3.5 h-10 w-full rounded-xl bg-bg-card border transition-all duration-200 ${focused
                    ? 'border-[#C8893F] ring-2 ring-[#C8893F]/20 bg-bg-cardHover'
                    : 'border-border hover:border-[#C8893F]/40'
                  }`}
                onClick={() => inputRef.current?.focus()}
              >
                <Search
                  className={`w-4 h-4 shrink-0 transition-colors ${focused ? 'text-[#C8893F]' : 'text-fg-muted'
                    }`}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 200)}
                  placeholder="Search markets, shops & products..."
                  className="flex-1 bg-transparent text-xs sm:text-sm text-fg placeholder-fg-muted outline-none font-medium min-w-0"
                />

                {query && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQueryChange('');
                      onRefetch();
                    }}
                    className="text-fg-muted hover:text-fg text-sm px-1"
                  >
                    ×
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCommandPalette(true);
                  }}
                  className="hidden xl:flex items-center gap-1 px-1.5 py-0.5 rounded bg-bg-pill border border-border text-[10px] font-mono text-fg-muted hover:text-fg"
                  title="Open Command Palette (Cmd+K)"
                >
                  <Command className="w-2.5 h-2.5" /> K
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/visual-search');
                  }}
                  title="Search with AI Camera"
                  className="w-7 h-7 rounded-lg bg-bg-pill hover:bg-bg-pillHover text-[#C8893F] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Instant Search Dropdown */}
              {focused && !query && (
                <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto no-scrollbar">
                  {searchHistory.length > 0 && (
                    <div className="p-2 border-b border-border/50">
                      <p className="px-2 py-1 text-[10px] font-mono uppercase text-fg-muted tracking-wider">
                        Recent Searches
                      </p>
                      {searchHistory.slice(0, 3).map((h) => (
                        <button
                          key={h}
                          onClick={() => {
                            onQueryChange(h);
                            setFocused(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-fg-secondary hover:text-fg hover:bg-bg-cardHover text-left transition-colors"
                        >
                          <span className="text-fg-muted">↺</span> {h}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="p-2">
                    <p className="px-2 py-1 text-[10px] font-mono uppercase text-[#C8893F] tracking-wider font-bold">
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
                          className="px-2.5 py-1 rounded-lg bg-bg-pill hover:bg-bg-pillHover text-xs text-fg border border-border transition-colors"
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
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mobile Search Icon Toggle */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center bg-bg-card border border-border text-fg-secondary hover:text-fg cursor-pointer"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Mobile AI Camera Trigger */}
              <button
                type="button"
                onClick={() => router.push('/visual-search')}
                className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center bg-bg-card border border-[#C8893F]/40 text-[#C8893F] cursor-pointer"
                title="AI Camera"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Location Selector Pill */}
              <button
                onClick={() => setLocationOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-bg-card border border-border hover:border-[#C8893F]/40 hover:bg-bg-cardHover transition-all cursor-pointer shrink-0"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C8893F]" />
                <span className="text-xs font-bold text-fg max-w-[65px] sm:max-w-none truncate">
                  {selectedCity}
                </span>
                <ChevronDown className="w-3 h-3 text-fg-muted" />
              </button>

              {/* Theme Toggle Button */}
              <ThemeToggle />

              {/* Desktop Only: Cart / Wishlist / Notification (On Mobile, these live in the bottom bar or profile) */}
              <button
                onClick={() => {
                  navTo('cart');
                  router.push('/cart');
                }}
                title="In-Store Pickup Cart"
                className="hidden md:flex relative w-9 h-9 rounded-xl items-center justify-center bg-bg-card border border-border text-fg-secondary hover:text-fg hover:bg-bg-cardHover transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#C8893F] text-[#0E0B08] font-black text-[9px] flex items-center justify-center leading-none shadow-sm">
                    {totalCartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  navTo('notifications');
                  router.push('/notifications');
                }}
                title="Notifications"
                className="hidden md:flex relative w-9 h-9 rounded-xl items-center justify-center bg-bg-card border border-border text-fg-secondary hover:text-fg hover:bg-bg-cardHover transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#E11D48] shadow-glow" />
                )}
              </button>

              {/* Profile / Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-bg-card border border-border overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#C8893F] transition-colors"
                  title="Profile & Settings"
                >
                  {user?.img ? (
                    <img src={user.img} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-[#C8893F]" />
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-10 sm:top-11 w-56 bg-bg-card border border-border rounded-2xl p-2 shadow-2xl z-50 animate-scale-in">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-bold text-fg-heading truncate">{user?.name || 'Locara Explorer'}</p>
                      <p className="text-[10px] text-fg-muted truncate">{user?.email || 'Verified Member'}</p>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navTo('profile');
                        router.push('/profile');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-fg hover:bg-bg-cardHover text-left"
                    >
                      <User className="w-3.5 h-3.5 text-[#C8893F]" />
                      Profile & Settings
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navTo('reservations');
                        router.push('/reservations');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-fg hover:bg-bg-cardHover text-left"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-[#C8893F]" />
                      My Reservations
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        router.push('/owner');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#54512d] hover:bg-bg-cardHover text-left"
                    >
                      <Store className="w-3.5 h-3.5" />
                      Shop Owner Workspace
                    </button>

                    <div className="my-1 border-t border-border" />

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        router.push('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#E11D48] hover:bg-bg-cardHover text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar Dropdown (when toggled on mobile) */}
          {mobileSearchOpen && (
            <div className="md:hidden py-2 border-t border-border/50 animate-scale-in">
              <div className="flex items-center gap-2 px-3 h-9 rounded-xl bg-bg-card border border-[#C8893F]/40">
                <Search className="w-3.5 h-3.5 text-[#C8893F] shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                  placeholder="Search shops, lehengas, sweets..."
                  className="flex-1 bg-transparent text-xs text-fg placeholder-fg-muted outline-none"
                />
                {query && (
                  <button
                    onClick={() => {
                      onQueryChange('');
                      onRefetch();
                    }}
                    className="text-fg-muted text-xs p-1"
                  >
                    ×
                  </button>
                )}
                <button
                  onClick={() => setMobileSearchOpen(false)}
                  className="text-fg-muted hover:text-fg text-xs p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Row 2: Category Ribbon with Clean Emojis & Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 overflow-x-auto no-scrollbar border-t border-border/50">
            {CATEGORIES.map((cat) => {
              const active = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onFiltersChange({ ...filters, category: cat.id })}
                  className={`flex items-center gap-1 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shrink-0 transition-all cursor-pointer ${active
                      ? 'bg-[#C8893F] text-[#0E0B08] shadow-md shadow-[#C8893F]/20'
                      : 'bg-bg-pill text-fg-secondary hover:text-fg hover:bg-bg-pillHover border border-border'
                    }`}
                >
                  <span className="text-xs">{cat.icon}</span>
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
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          onClick={() => setLocationOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-bg-card border border-border rounded-3xl p-5 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base font-bold text-fg-heading">Select City Region</h3>
              <button
                onClick={() => setLocationOpen(false)}
                className="text-fg-muted hover:text-fg cursor-pointer p-1"
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
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${selectedCity === loc.name
                      ? 'bg-[#C8893F]/15 border border-[#C8893F]/40 text-[#C8893F] font-bold'
                      : 'hover:bg-bg-cardHover text-fg'
                    }`}
                >
                  <div>
                    <p className="text-xs font-bold">{loc.name}</p>
                    <p className="text-[10px] text-fg-muted">{loc.sub}</p>
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
              className="w-full mt-3 py-2.5 rounded-xl bg-bg-pill hover:bg-bg-pillHover border border-border text-xs font-bold text-fg flex items-center justify-center gap-2 transition-all cursor-pointer"
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
          router.push(`/shops/${shopId}`);
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
        open={showVisual}
        onOpenChange={setShowVisual}
      />
    </>
  );
}
