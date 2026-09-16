'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, type OwnerPage } from '@/store/useStore';
import OwnerHeader from '@/components/owner/OwnerHeader';
import OwnerBottomNav from '@/components/owner/OwnerBottomNav';
import ShowcasePage from '@/components/owner/ShowcasePage';
import CollectionsPage from '@/components/owner/CollectionsPage';
import AddProductPage from '@/components/owner/AddProductPage';
import ShopProfilePage from '@/components/owner/ShopProfilePage';
import AnalyticsPage from '@/components/owner/AnalyticsPage';
import SellerReservationsPage from '@/components/owner/SellerReservationsPage';
import Toast from '@/components/ui/Toast';
import { Store, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';
import PageTransition from '@/components/motion/PageTransition';

export default function OwnerApp({ routePage }: { routePage: OwnerPage }) {
  const router = useRouter();
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
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [shopMissing, setShopMissing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const hydrateOwnerShop = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
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
      setOwnerShopName(shop.name || 'Your Heritage Shop');
      if (data.ownerProfile) {
        setShopProfile(shop.id, data.ownerProfile);
      }
      if (Array.isArray(shop.products)) {
        setShopProducts(shop.id, shop.products);
      }

      setShopMissing(false);
      setLoadError('');
    } catch (err: any) {
      setLoadError(err?.message || 'Unable to load owner dashboard');
    } finally {
      setLoading(false);
    }
  }, [setOwnerShopId, setOwnerShopName, setShopProducts, setShopProfile]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth?role=owner');
      }
    }
  }, [router]);

  useEffect(() => {
    void hydrateOwnerShop();
  }, [hydrateOwnerShop]);

  useEffect(() => {
    if (ownerPage !== routePage) ownerNavTo(routePage);
  }, [ownerPage, ownerNavTo, routePage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-xs font-mono text-[#71717A] tracking-wider uppercase">
            Loading Merchant Console...
          </p>
        </div>
      </div>
    );
  }

  if (shopMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808] p-4">
        <div className="w-full max-w-md bg-[#121212] rounded-3xl border border-white/10 p-8 shadow-2xl text-center animate-scale-in">
          <div className="w-14 h-14 rounded-2xl bg-[#181818] border border-white/10 flex items-center justify-center text-2xl mx-auto mb-4">
            🏛️
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#F5F5F5] mb-2">No Shop Found</h1>
          <p className="text-xs text-[#71717A] mb-6 leading-relaxed">
            Your owner account is ready, but no shop is linked yet. Register your heritage shop profile to unlock the merchant workspace.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <PremiumButton
              variant="gold"
              size="md"
              onClick={() => router.push('/register-shop')}
              className="flex-1"
            >
              Register Shop Profile
            </PremiumButton>
            <button
              onClick={() => void hydrateOwnerShop()}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-[#A1A1AA] hover:bg-white/5"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayShopName = ownerShopName || 'Your Heritage Shop';

  return (
    <div className="min-h-screen bg-[#0E0B08] text-[#F6EAD7] flex flex-col font-sans selection:bg-[#C8893F]/30 selection:text-[#F6EAD7]">
      <OwnerHeader shopName={displayShopName} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-28">
        <PageTransition pageKey={ownerPage}>
          {ownerPage === 'showcase' && <ShowcasePage />}
          {ownerPage === 'reservations' && <SellerReservationsPage />}
          {ownerPage === 'collections' && <CollectionsPage />}
          {ownerPage === 'addproduct' && <AddProductPage />}
          {ownerPage === 'profile' && <ShopProfilePage />}
          {ownerPage === 'analytics' && <AnalyticsPage />}
        </PageTransition>
      </main>

      <OwnerBottomNav />
      <Toast />
    </div>
  );
}
