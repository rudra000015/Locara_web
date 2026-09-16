'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useExplorerRuntimeStore } from '@/store/useExplorerRuntimeStore';
import { useT } from '@/i18n/useT';
import ExplorerHeader from '@/components/explorer/ExplorerHeader';
import ExplorerNav from '@/components/explorer/ExplorerNav';
import HomePage from '@/components/explorer/HomePage';
import ShopProfile from '@/components/explorer/ShopProfile';
import ProductDetail from '@/components/explorer/ProductDetail';
import MarketDetailPage from '@/components/explorer/MarketDetailPage';
import CartPage from '@/components/explorer/CartPage';
import ReservationsPage from '@/components/explorer/ReservationsPage';
import WishlistPage from '@/components/explorer/WishlistPage';
import MapPage from '@/components/explorer/MapPage';
import NotificationsPage from '@/components/explorer/NotificationsPage';
import InAppNotificationStack from '@/components/explorer/InAppNotificationStack';
import Toast from '@/components/ui/Toast';
import { type FilterState, DEFAULT_FILTERS } from '@/data/categories';
import { useShops } from '@/hooks/useShops';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import IntroBanner from '@/components/ui/IntroBanner';
import { getDefaultCity } from '@/lib/cities';
import { getDistanceMeters } from '@/lib/geo';
import type { Shop } from '@/types/shop';
import type { AppNotification } from '@/types/notification';
import PageTransition from '@/components/motion/PageTransition';
import { Sparkles, Calendar, Compass, ShoppingBag, Heart, Store, Bookmark, LogOut, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

export type ExplorerRoutePage =
  | 'home'
  | 'map'
  | 'market'
  | 'cart'
  | 'reservations'
  | 'wishlist'
  | 'shop'
  | 'product'
  | 'profile'
  | 'notifications';

type SavedUser = {
  id?: string;
  name?: string;
  email?: string;
  img?: string;
  role?: 'explorer' | 'owner';
};

export default function ExplorerApp({ routePage }: { routePage: ExplorerRoutePage }) {
  const router = useRouter();
  const {
    user,
    currentPage,
    currentMarketSlug,
    navTo,
    setUser,
    logout,
    showToast,
    wishlist,
    savedCollections,
    savedMarkets,
    cart,
  } = useStore();
  const { activeTrip, startTrip, markTripArrived, clearTrip, completeTrip } =
    useExplorerRuntimeStore();
  const t = useT();

  const guestUser = {
    id: 'guest',
    name: 'Locara Explorer',
    email: 'explorer@locara.app',
    img: 'https://api.dicebear.com/7.x/notionists/svg?seed=explorer',
    role: 'explorer' as const,
  };
  const effectiveUser = user ?? guestUser;

  const [bootstrapped, setBootstrapped] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedCity, setSelectedCity] = useState(getDefaultCity().name);
  const [useGps, setUseGps] = useState(false);
  const [profileTab, setProfileTab] = useState<'saved' | 'history' | 'settings'>('saved');

  const { shops, loading, error, refetch, userLocation } = useShops({
    radius: 5000,
    city: selectedCity,
    autoGps: useGps,
  });

  const {
    notifications,
    popups,
    unreadCount,
    liveStatus,
    markRead,
    markAllRead,
    dismissPopup,
  } = useNotificationCenter();

  useEffect(() => {
    if (user) {
      setBootstrapped(true);
      return;
    }

    try {
      const raw = localStorage.getItem('user_data');
      if (raw) {
        const parsed = JSON.parse(raw) as SavedUser;
        if (parsed?.name) {
          const role: 'owner' | 'explorer' = parsed.role === 'owner' ? 'owner' : 'explorer';
          setUser(
            {
              id: parsed.id,
              name: parsed.name,
              email: parsed.email,
              img:
                parsed.img ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(parsed.name)}`,
              role,
            },
            role
          );
        }
      }
    } catch {
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_token');
    } finally {
      setBootstrapped(true);
    }
  }, [setUser, user]);

  useEffect(() => {
    if (currentPage !== routePage && !['market', 'cart', 'reservations'].includes(currentPage)) {
      navTo(routePage);
    }
  }, [currentPage, navTo, routePage]);

  // Proximity & Geofence detection for active trip
  useEffect(() => {
    if (!activeTrip || !userLocation || activeTrip.arrivedAt) return;

    const distance = getDistanceMeters(
      userLocation.lat,
      userLocation.lng,
      activeTrip.destination.lat,
      activeTrip.destination.lng
    );

    if (distance <= 100) {
      markTripArrived();
      showToast(`Arrived at ${activeTrip.shopName}! Check in at counter.`);
    }
  }, [activeTrip, markTripArrived, showToast, userLocation]);

  const arrivalPromptVisible = Boolean(activeTrip?.arrivedAt && !activeTrip?.completedAt);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setUseGps(false);
  };

  const handleUseGps = () => {
    setUseGps(true);
  };

  const handleListYourShop = () => {
    if (effectiveUser.role === 'owner') {
      router.push('/register-shop');
      return;
    }
    logout();
    router.push('/?role=owner&mode=login&next=/register-shop');
  };

  const handleStartNavigation = (shop: Shop) => {
    if (!shop.loc || shop.loc.length !== 2) return;

    setUseGps(true);
    startTrip({
      shopId: shop.id,
      shopName: shop.name,
      destination: {
        lat: shop.loc[0],
        lng: shop.loc[1],
      },
    });
    showToast(`Turn-by-turn navigation started for ${shop.name}`);
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${shop.loc[0]},${shop.loc[1]}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleOpenNotification = (notification: AppNotification) => {
    markRead(notification.id);
    const target =
      notification.url ||
      (notification.shopId ? `/explorer/shop/${notification.shopId}` : '/explorer/notifications');
    router.push(target);
  };

  // ── Explorer Profile & Account View ──────────────────────────────
  const profileCard = (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* User Overview */}
      <div className="rounded-2xl border border-[rgba(72,55,47,0.12)] bg-[#ffffff] p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(72,55,47,0.06)]">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#54512d]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#54512d] font-bold">
            EXPLORER PROFILE & SAVED GEMS
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 my-4">
          <img
            src={effectiveUser.img}
            alt={effectiveUser.name}
            className="h-20 w-20 rounded-2xl border border-[rgba(72,55,47,0.15)] bg-[#f5f4ef] object-cover shrink-0"
          />
          <div className="text-center sm:text-left min-w-0 flex-1">
            <h2 className="font-serif text-2xl font-bold text-[#1b1c19]">{effectiveUser.name}</h2>
            <p className="text-xs text-[#49473c] mt-0.5">{effectiveUser.email || 'Verified Explorer Account'}</p>
            <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#efeee9] text-[#54512d] border border-[#cbc6b8]">
              {effectiveUser.role} Member • Level 3 Explorer
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 my-6 text-center">
          <div className="p-3 rounded-xl bg-[#f5f4ef] border border-[rgba(72,55,47,0.08)]">
            <p className="font-serif text-xl font-bold text-[#1b1c19]">{wishlist.length}</p>
            <p className="text-[10px] text-[#7a776b] mt-0.5">Saved Gems</p>
          </div>
          <div className="p-3 rounded-xl bg-[#f5f4ef] border border-[rgba(72,55,47,0.08)]">
            <p className="font-serif text-xl font-bold text-[#54512d]">{cart.length}</p>
            <p className="text-[10px] text-[#7a776b] mt-0.5">Active Passes</p>
          </div>
          <div className="p-3 rounded-xl bg-[#f5f4ef] border border-[rgba(72,55,47,0.08)]">
            <p className="font-serif text-xl font-bold text-[#6d6943]">350</p>
            <p className="text-[10px] text-[#7a776b] mt-0.5">Explorer Pts</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-[#cbc6b8]/40">
          <button
            type="button"
            onClick={() => navTo('reservations')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#f5f4ef] hover:bg-[#efeee9] border border-[#cbc6b8]/60 text-xs font-bold text-[#1b1c19] transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#54512d]" /> View My In-Store Offline Passes
            </span>
            <span className="text-[#54512d]">→</span>
          </button>

          <button
            type="button"
            onClick={handleListYourShop}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#54512d] hover:bg-[#3f3d22] py-3.5 text-xs font-bold text-[#ffffff] transition-all shadow-md cursor-pointer"
          >
            <Store className="w-4 h-4" /> Switch to Store Owner Console
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#f5f4ef] hover:bg-[#efeee9] border border-[#cbc6b8] py-3 text-xs font-bold text-[#ba1a1a] transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            query={query}
            filters={filters}
            shops={shops}
            loading={loading}
            error={error}
            refetch={refetch}
            onListShop={handleListYourShop}
          />
        );
      case 'shop':
        return <ShopProfile />;
      case 'product':
        return <ProductDetail />;
      case 'market':
        return <MarketDetailPage slug={currentMarketSlug || 'indiranagar-100ft'} />;
      case 'cart':
        return <CartPage />;
      case 'reservations':
        return <ReservationsPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'map':
        return (
          <MapPage
            city={selectedCity}
            query={query}
            shops={shops}
            loading={loading}
            error={error}
            userLocation={userLocation}
            onRefetch={refetch}
            onStartNavigation={handleStartNavigation}
          />
        );
      case 'notifications':
        return (
          <NotificationsPage
            notifications={notifications}
            unreadCount={unreadCount}
            liveStatus={liveStatus}
            onOpen={handleOpenNotification}
            onMarkAllRead={markAllRead}
          />
        );
      case 'profile':
        return profileCard;
      default:
        return (
          <HomePage
            query={query}
            filters={filters}
            shops={shops}
            loading={loading}
            error={error}
            refetch={refetch}
            onListShop={handleListYourShop}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f4] text-[#1b1c19]">
      <IntroBanner city={useGps ? 'Your Area' : selectedCity} />
      <ExplorerHeader
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={setFilters}
        totalResults={shops.length}
        onRefetch={refetch}
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
        onUseGps={handleUseGps}
      />

      <main className="max-w-7xl mx-auto px-4 pt-4 pb-28">
        <PageTransition pageKey={currentPage}>{renderPage()}</PageTransition>
      </main>

      <InAppNotificationStack
        notifications={popups}
        onDismiss={dismissPopup}
        onRead={markRead}
      />

      {/* Arrival Detected Modal */}
      {arrivalPromptVisible && activeTrip && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#1b1c19]/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[rgba(72,55,47,0.15)] bg-[#ffffff] p-6 shadow-2xl animate-scale-in text-center">
            <div className="w-14 h-14 rounded-full bg-[#f0e9ba] border border-[#54512d]/30 flex items-center justify-center text-[#54512d] mx-auto mb-3">
              <MapPin className="w-7 h-7 text-[#54512d]" />
            </div>

            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#54512d]">
              STORE ARRIVAL DETECTED
            </p>
            <h3 className="mt-1 font-serif text-2xl font-bold text-[#1b1c19]">
              You&apos;ve arrived at {activeTrip.shopName}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#49473c]">
              Show your reservation QR pass or 6-digit OTP at the billing counter to verify pickup.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => clearTrip()}
                className="flex-1 rounded-full border border-[#cbc6b8] px-4 py-3 text-xs font-bold text-[#49473c] hover:bg-[#f5f4ef] cursor-pointer"
              >
                Not Yet
              </button>
              <button
                type="button"
                onClick={() => {
                  completeTrip();
                  clearTrip();
                  navTo('reservations');
                }}
                className="flex-1 rounded-full bg-[#48372f] hover:bg-[#3d2d26] px-4 py-3 text-xs font-bold text-[#faf9f4] shadow-md cursor-pointer"
              >
                Open Pickup Pass
              </button>
            </div>
          </div>
        </div>
      )}

      <ExplorerNav />
      <Toast />
    </div>
  );
}
