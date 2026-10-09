'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRef } from 'react';
import { useStore, type OwnerPage } from '@/store/useStore';
import OwnerHeader from '@/components/owner/OwnerHeader';
import OwnerBottomNav from '@/components/owner/OwnerBottomNav';
import ShowcasePage from '@/components/owner/ShowcasePage';
import CollectionsPage from '@/components/owner/CollectionsPage';
import AddProductPage from '@/components/owner/AddProductPage';
import ShopProfilePage from '@/components/owner/ShopProfilePage';
import AnalyticsPage from '@/components/owner/AnalyticsPage';
import SellerReservationsPage from '@/components/owner/SellerReservationsPage';
import OffersPage from '@/components/owner/OffersPage';
import ProductsPage from '@/components/owner/ProductsPage';
import { Store, Plus, ArrowRight } from 'lucide-react';

export default function OwnerApp({ routePage }: { routePage: OwnerPage }) {
  const router = useRouter();
  const pathname = usePathname();
  const lastRoutePage = useRef<OwnerPage | null>(null);
  const {
    user,
    ownerPage,
    ownerShopId,
    ownerShopName,
    ownerNavTo,
    setOwnerShopId,
    setOwnerShopName,
    setShopProfile,
    setShopProducts,
    setReservations,
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [shopMissing, setShopMissing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const hydrateOwnerShop = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setShopMissing(false);
      setOwnerShopId('sharma-handicrafts');
      setOwnerShopName('Sharma Handicrafts');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/owner/shop', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 404) {
        setShopMissing(true);
        setLoading(false);
        return;
      }

      if (!res.ok || !data?.shop) {
        throw new Error(data?.error || 'Unable to load owner shop');
      }

      const shop = data.shop as { id: string; name: string; products?: any[] };
      setOwnerShopId(shop.id);
      setOwnerShopName(shop.name || 'Sharma Handicrafts');
      if (data.ownerProfile) {
        setShopProfile(shop.id, data.ownerProfile);
      }
      if (Array.isArray(shop.products)) {
        setShopProducts(shop.id, shop.products);
      }

      const reservationsRes = await fetch('/api/reservations', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (reservationsRes.ok) {
        const reservationData = await reservationsRes.json().catch(() => ({}));
        if (Array.isArray(reservationData.reservations)) {
          setReservations(reservationData.reservations.map((reservation: any) => {
            const firstItem = reservation.items?.[0] ?? {};
            const status = ['COMPLETED', 'CANCELLED'].includes(reservation.status)
              ? reservation.status as 'COMPLETED' | 'CANCELLED'
              : 'CONFIRMED' as const;
            return {
              id: String(reservation.id ?? reservation._id ?? reservation.reservationNumber),
              otp: String(reservation.pickupOtp ?? reservation.reservationNumber ?? ''),
              productId: String(firstItem.productId ?? ''),
              productName: String(firstItem.name ?? 'Reserved items'),
              productImage: String(firstItem.image ?? ''),
              price: Number(reservation.totalAmount ?? 0),
              advancePaid: Number(reservation.advanceAmount ?? 0),
              balanceDue: Number(reservation.remainingAmount ?? 0),
              shopId: String(reservation.shopId ?? shop.id),
              shopName: String(reservation.shopName ?? shop.name),
              shopAddress: String(reservation.shopAddress ?? ''),
              shopPhone: '',
              customerName: String(reservation.userName ?? 'Customer'),
              customerPhone: String(reservation.userPhone ?? ''),
              pickupDate: reservation.expiryTime ? new Date(reservation.expiryTime).toLocaleDateString() : '',
              timeSlot: 'Store pickup',
              status,
              createdAt: reservation.createdAt ?? new Date().toISOString(),
              expiresAt: reservation.expiryTime ?? new Date().toISOString(),
            };
          }));
        }
      }

      setShopMissing(false);
      setLoadError('');
    } catch (err: any) {
      setLoadError(err?.message || 'Unable to load owner dashboard');
    } finally {
      setLoading(false);
    }
  }, [setOwnerShopId, setOwnerShopName, setShopProducts, setShopProfile, setReservations]);

  useEffect(() => {
    void hydrateOwnerShop();
  }, [hydrateOwnerShop]);

  useEffect(() => {
    if (lastRoutePage.current !== routePage) {
      lastRoutePage.current = routePage;
      if (ownerPage !== routePage) ownerNavTo(routePage);
      return;
    }
    if (ownerPage !== routePage) {
      const paths: Record<OwnerPage, string> = {
        showcase: '/owner', products: '/owner/products', collections: '/owner/collections',
        addproduct: '/owner/products/new', profile: '/owner/profile', analytics: '/owner/analytics',
        reservations: '/owner/reservations', offers: '/owner/offers',
      };
      const target = paths[ownerPage];
      if (pathname !== target) router.push(target);
    }
  }, [ownerPage, ownerNavTo, pathname, routePage, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-[#A85420] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#666666]">
            Loading Merchant Portal...
          </p>
        </div>
      </div>
    );
  }

  if (shopMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E5E5] p-8 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F5F4F0] text-[#A85420] flex items-center justify-center mx-auto">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[#171717]">Setup Your Shop Profile</h1>
          <p className="text-xs text-[#666666] leading-relaxed">
            Your merchant account is ready. Register your local storefront to start accepting in-store pickup reservations.
          </p>
          <button
            onClick={() => router.push('/register-shop')}
            className="w-full py-2.5 px-4 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Register Storefront</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#171717]">
      <OwnerHeader shopName={ownerShopName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {ownerPage === 'showcase' && <ShowcasePage />}
        {ownerPage === 'products' && <ProductsPage />}
        {ownerPage === 'addproduct' && <AddProductPage />}
        {ownerPage === 'reservations' && <SellerReservationsPage />}
        {ownerPage === 'analytics' && <AnalyticsPage />}
        {ownerPage === 'collections' && <CollectionsPage />}
        {ownerPage === 'offers' && <OffersPage />}
        {ownerPage === 'profile' && <ShopProfilePage />}
      </main>

      <OwnerBottomNav />
    </div>
  );
}
