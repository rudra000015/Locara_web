'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useExplorerRuntimeStore } from '@/store/useExplorerRuntimeStore';
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
import ShopsDirectoryPage from '@/components/explorer/ShopsDirectoryPage';
import NotificationsPage from '@/components/explorer/NotificationsPage';
import InAppNotificationStack from '@/components/explorer/InAppNotificationStack';
import Toast from '@/components/ui/Toast';
import { type FilterState, DEFAULT_FILTERS } from '@/data/categories';
import { useShops } from '@/hooks/useShops';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import { getDefaultCity } from '@/lib/cities';
import { getDistanceMeters } from '@/lib/geo';
import type { Shop } from '@/types/shop';
import type { AppNotification } from '@/types/notification';
import {
  Calendar,
  Heart,
  Store,
  LogOut,
  ShieldCheck,
  MapPin,
  ShoppingBag,
  Ticket,
} from 'lucide-react';

export type ExplorerRoutePage =
  | 'home'
  | 'shops'
  | 'directory'
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

const PROTECTED_EXPLORER_PAGES: ExplorerRoutePage[] = [
  'cart',
  'reservations',
  'wishlist',
  'profile',
  'notifications',
];

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
    cart,
    reservations,
  } = useStore();
  const { activeTrip, startTrip, markTripArrived, clearTrip, completeTrip } =
    useExplorerRuntimeStore();

  const guestUser = {
    id: 'guest',
    name: 'Locara Explorer',
    email: 'explorer@locara.app',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    role: 'explorer' as const,
  };
  const effectiveUser = user ?? guestUser;

  const [bootstrapped, setBootstrapped] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedCity, setSelectedCity] = useState(getDefaultCity().name);
  const [useGps, setUseGps] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState<{ label: string; lat: number; lng: number } | null>(null);

  const { shops, loading, error, locationError, refetch, userLocation, centerLocation } = useShops({
    radius: 5000,
    lat: searchedLocation?.lat,
    lng: searchedLocation?.lng,
    city: searchedLocation ? undefined : selectedCity,
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
    if (useGps && locationError) showToast(locationError);
  }, [locationError, showToast, useGps]);

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
    if (routePage) {
      navTo(routePage);
    }
  }, [navTo, routePage]);

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
    setSearchedLocation(null);
    setSelectedCity(city);
    setUseGps(false);
  };

  const handleLocationSearch = (label: string, lat: number, lng: number) => {
    setSearchedLocation({ label, lat, lng });
    setSelectedCity(label);
    setUseGps(false);
  };

  const handleUseGps = () => {
    setSearchedLocation(null);
    setUseGps(true);
  };

  const handleListYourShop = () => {
    if (effectiveUser.role === 'owner') {
      router.push('/register-shop');
      return;
    }
    router.push('/owner');
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

  // ── Account & Profile View ──────────────────────────────────────────
  const profileCard = (
    <div className="mx-auto max-w-2xl space-y-6 pb-12 pt-4">
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <img
            src={effectiveUser.img}
            alt={effectiveUser.name}
            className="h-20 w-20 rounded-2xl border border-[#E5E5E5] bg-[#F5F4F0] object-cover shrink-0"
          />
          <div className="text-center sm:text-left min-w-0 flex-1">
            <h2 className="text-2xl font-extrabold text-[#171717]">{effectiveUser.name}</h2>
            <p className="text-xs text-[#666666] mt-0.5">{effectiveUser.email || 'Verified Explorer Account'}</p>
            <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FBF3EE] text-[#A85420] border border-[#F5DECD]">
              Local Marketplace Member
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <button
            onClick={() => {
              navTo('wishlist');
              router.push('/explorer/wishlist');
            }}
            className="p-3 rounded-xl bg-[#F5F4F0] border border-[#E5E5E5] hover:bg-[#EAE8E2] transition-colors"
          >
            <p className="text-xl font-bold text-[#171717]">{wishlist.length}</p>
            <p className="text-[11px] text-[#666666] mt-0.5">Saved Items</p>
          </button>
          <button
            onClick={() => {
              navTo('reservations');
              router.push('/explorer/reservations');
            }}
            className="p-3 rounded-xl bg-[#F5F4F0] border border-[#E5E5E5] hover:bg-[#EAE8E2] transition-colors"
          >
            <p className="text-xl font-bold text-[#A85420]">{reservations.length}</p>
            <p className="text-[11px] text-[#666666] mt-0.5">Pickup Passes</p>
          </button>
          <button
            onClick={() => {
              navTo('cart');
              router.push('/explorer/cart');
            }}
            className="p-3 rounded-xl bg-[#F5F4F0] border border-[#E5E5E5] hover:bg-[#EAE8E2] transition-colors"
          >
            <p className="text-xl font-bold text-[#16803C]">{cart.length}</p>
            <p className="text-[11px] text-[#666666] mt-0.5">In Cart</p>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-[#E5E5E5]">
          <button
            type="button"
            onClick={() => {
              navTo('reservations');
              router.push('/explorer/reservations');
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#FAFAF8] hover:bg-[#F5F4F0] border border-[#E5E5E5] text-xs font-bold text-[#171717] transition-all"
          >
            <span className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#A85420]" /> View My In-Store Pickup Passes
            </span>
            <span className="text-[#A85420]">→</span>
          </button>

          <button
            type="button"
            onClick={handleListYourShop}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#A85420] hover:bg-[#873F17] py-3 text-xs font-bold text-white transition-all shadow-sm"
          >
            <Store className="w-4 h-4" /> Switch to Store Owner Console
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F5F4F0] hover:bg-[#FEE2E2]/60 border border-[#E5E5E5] py-3 text-xs font-bold text-[#DC2626] transition-all"
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
      case 'shops':
      case 'directory':
        return <ShopsDirectoryPage />;
      case 'shop':
        return <ShopProfile />;
      case 'product':
        return <ProductDetail />;
      case 'market':
        return <MarketDetailPage slug={currentMarketSlug || 'sadar-bazaar'} />;
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
            locationError={locationError}
            userLocation={userLocation}
            centerLocation={centerLocation}
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
    <div className="min-h-screen bg-[#FAFAF8] text-[#171717]">
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
        onLocationSearch={handleLocationSearch}
      />

      <main>{renderPage()}</main>

      <InAppNotificationStack
        notifications={popups}
        onDismiss={dismissPopup}
        onRead={markRead}
      />

      {/* Arrival Detected Modal */}
      {arrivalPromptVisible && activeTrip && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-2xl animate-fade-up text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#FBF3EE] text-[#A85420] flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-7 h-7" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A85420]">
              STORE ARRIVAL DETECTED
            </span>
            <h3 className="text-xl font-bold text-[#171717]">
              You&apos;ve arrived at {activeTrip.shopName}
            </h3>
            <p className="text-xs text-[#666666]">
              Show your reservation QR pass or 6-digit OTP at the billing counter to collect your order.
            </p>

            <div className="mt-4 flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => clearTrip()}
                className="flex-1 rounded-lg border border-[#E5E5E5] px-4 py-2.5 text-xs font-bold text-[#666666] hover:bg-[#F5F4F0]"
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
                className="flex-1 rounded-lg bg-[#A85420] hover:bg-[#873F17] px-4 py-2.5 text-xs font-bold text-white shadow-sm"
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
