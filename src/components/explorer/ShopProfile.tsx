'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useShopDetail } from '@/hooks/useShops';
import { useStore } from '@/store/useStore';
import { prodImg } from '@/utils/prodImg';
import ReviewsSection from './ReviewsSection';
import FollowShopButton from './FollowShopButton';
import ProductCard from './ProductCard';
import CollectionCard from './CollectionCard';
import OfferCard from './OfferCard';
import {
  Phone,
  MessageCircle,
  Navigation,
  Share2,
  Clock,
  Star,
  MapPin,
  Sparkles,
  BookOpen,
  ShoppingBag,
  Info,
  ChevronLeft,
  Store,
  Flame,
  Tag,
  Gift,
  Heart,
} from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

// ── Action Buttons ────────────────────────────────────────────
function ActionButtons({ profile }: { profile: any }) {
  if (!profile) return null;

  const handleCall = () => {
    if (profile.ownerPhone) window.location.href = `tel:${profile.ownerPhone}`;
  };

  const handleWhatsApp = () => {
    const num = profile.whatsapp || profile.ownerPhone?.replace(/\D/g, '');
    if (!num) return;
    const msg = encodeURIComponent(
      `Hi! I discovered ${profile.ownerName || 'your shop'} on Locara and would like to reserve products for store pickup.`
    );
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  const handleDirections = () => {
    if (profile.googleMapsUrl) {
      window.open(profile.googleMapsUrl, '_blank');
    } else if (profile.lat && profile.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${profile.lat},${profile.lng}`,
        '_blank'
      );
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.ownerName || 'Heritage Shop'} — Locara`,
        text: `Explore ${profile.ownerName}'s digital storefront on Locara`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2.5 mb-8">
      {profile.ownerPhone && (
        <button
          onClick={handleCall}
          className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#17120E] hover:bg-[#211A14] border border-[#F6EAD7]/10 text-[#F6EAD7] hover:border-[#F6EAD7]/20 transition-all cursor-pointer group shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-[#211A14] flex items-center justify-center text-[#2D7D64] group-hover:scale-110 transition-transform">
            <Phone className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold">Call</span>
        </button>
      )}

      {(profile.whatsapp || profile.ownerPhone) && (
        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#17120E] hover:bg-[#211A14] border border-[#F6EAD7]/10 text-[#F6EAD7] hover:border-[#F6EAD7]/20 transition-all cursor-pointer group shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-[#211A14] flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
            <MessageCircle className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold">WhatsApp</span>
        </button>
      )}

      <button
        onClick={handleDirections}
        className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#17120E] hover:bg-[#211A14] border border-[#F6EAD7]/10 text-[#F6EAD7] hover:border-[#F6EAD7]/20 transition-all cursor-pointer group shadow-sm"
      >
        <div className="w-9 h-9 rounded-xl bg-[#211A14] flex items-center justify-center text-[#3b82f6] group-hover:scale-110 transition-transform">
          <Navigation className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-bold">Navigate</span>
      </button>

      <button
        onClick={handleShare}
        className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#17120E] hover:bg-[#211A14] border border-[#F6EAD7]/10 text-[#F6EAD7] hover:border-[#F6EAD7]/20 transition-all cursor-pointer group shadow-sm"
      >
        <div className="w-9 h-9 rounded-xl bg-[#211A14] flex items-center justify-center text-[#C8893F] group-hover:scale-110 transition-transform">
          <Share2 className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-bold">Share</span>
      </button>
    </div>
  );
}

// ── Photo Gallery ─────────────────────────────────────────────
function PhotoGallery({ photos, name }: { photos: string[]; name: string }) {
  const [active, setActive] = useState(0);
  if (!photos.length) return null;

  return (
    <div className="mb-6">
      <div className="relative h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden bg-[#17120E] border border-[#F6EAD7]/10 mb-3 shadow-xl">
        <img
          src={photos[active]}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0B08]/70 via-transparent to-black/20" />
        <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md text-[#F6EAD7] text-xs px-3 py-1 rounded-full font-mono font-bold border border-[#F6EAD7]/10">
          {active + 1} / {photos.length}
        </div>
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${
                active === i
                  ? 'border-[#C8893F] scale-105 shadow-glow-sm'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={p} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ShopProfile Component ────────────────────────────────
export default function ShopProfile({ shopId: propShopId }: { shopId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentShopId, shopProducts, navTo } = useStore();
  const shopId = propShopId || currentShopId || 'hira';

  const { shop, loading, error } = useShopDetail(shopId);
  const [activeTab, setActiveTab] = useState<'home' | 'collections' | 'products' | 'offers' | 'reviews' | 'about'>('home');
  const [collections, setCollections] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    async function loadShopExtras() {
      try {
        const [cRes, oRes] = await Promise.all([
          fetch(`/api/collections?shopId=${shopId}`),
          fetch(`/api/offers?shopId=${shopId}`),
        ]);
        if (cRes.ok) {
          const cData = await cRes.json();
          setCollections(cData.collections || []);
        }
        if (oRes.ok) {
          const oData = await oRes.json();
          setOffers(oData.offers || []);
        }
      } catch {}
    }
    void loadShopExtras();
  }, [shopId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6">
        <div className="h-72 rounded-3xl bg-[#17120E] skeleton-shimmer" />
        <div className="h-10 w-1/2 rounded-xl bg-[#17120E] skeleton-shimmer" />
        <div className="h-32 rounded-2xl bg-[#17120E] skeleton-shimmer" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#17120E] border border-[#F6EAD7]/10 flex items-center justify-center text-2xl mx-auto mb-4">
          🏛️
        </div>
        <h2 className="font-serif text-xl font-bold text-[#F6EAD7] mb-2">Shop Not Found</h2>
        <p className="text-xs text-[#9E8B75] mb-6">
          The requested storefront profile is currently unavailable.
        </p>
        <button onClick={() => navTo('home')} className="btn-gold text-xs">
          Return to Explorer
        </button>
      </div>
    );
  }

  const customProducts = shopProducts[shop.id] || shop.products || [];

  return (
    <div className="max-w-4xl mx-auto pb-32">
      {/* Back Navigation */}
      <button
        onClick={() => navTo('home')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#17120E] border border-[#F6EAD7]/10 text-xs font-bold text-[#9E8B75] hover:text-[#F6EAD7] hover:bg-[#211A14] transition-all mb-4 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Stores</span>
      </button>

      {/* Gallery / Hero */}
      <PhotoGallery photos={shop.photos || []} name={shop.name} />

      {/* Storefront Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C8893F]/15 text-[#E0AF62] border border-[#C8893F]/30">
              Est. {shop.est} • {shop.age} Yrs Heritage
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-0.5 rounded-full ${
                shop.openNow !== false
                  ? 'bg-[#1E5544]/20 text-[#2D7D64] border border-[#1E5544]/35'
                  : 'bg-[#C24136]/20 text-[#C24136] border border-[#C24136]/35'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${shop.openNow !== false ? 'bg-[#2D7D64] animate-pulse' : 'bg-[#C24136]'}`} />
              {shop.openNow !== false ? 'Open Now Until 9:00 PM' : 'Closed Now'}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#F6EAD7] mb-2">
            {shop.name}
          </h1>

          <p className="text-xs sm:text-sm text-[#9E8B75] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#C8893F] shrink-0" />
            {shop.addr}
          </p>
        </div>

        {/* Rating & Follow Action */}
        <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
          {shop.rating > 0 && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-sm">
              <Star className="w-4 h-4 text-[#C8893F] fill-[#C8893F]" />
              <span className="text-sm font-bold text-[#F6EAD7]">{shop.rating.toFixed(1)}</span>
              <span className="text-xs text-[#9E8B75]">({shop.totalRatings || 142})</span>
            </div>
          )}
          <FollowShopButton shopId={shop.id} shopName={shop.name} />
        </div>
      </div>

      {/* Quick Actions (Call, WhatsApp, Directions, Share) */}
      <ActionButtons
        profile={{
          ownerName: shop.ownerProfile?.ownerName || shop.owner,
          ownerPhone: shop.ownerProfile?.ownerPhone || shop.phone,
          whatsapp: shop.ownerProfile?.whatsapp || shop.whatsapp,
          lat: shop.loc?.[0],
          lng: shop.loc?.[1],
          googleMapsUrl: shop.ownerProfile?.googleMapsUrl,
        }}
      />

      {/* 6 Tabs: Home, Collections, Products, Offers, Reviews, About */}
      <div className="flex border-b border-[#F6EAD7]/10 mb-6 gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'home', label: 'Store Home', icon: Store },
          { id: 'collections', label: 'Collections', icon: Sparkles },
          { id: 'products', label: `Products (${customProducts.length})`, icon: ShoppingBag },
          { id: 'offers', label: `Offers (${offers.length})`, icon: Tag },
          { id: 'reviews', label: 'Reviews', icon: Star },
          { id: 'about', label: 'About & Hours', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#C8893F] text-[#E0AF62]'
                  : 'border-transparent text-[#9E8B75] hover:text-[#F6EAD7]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div>
        {/* TAB 1: STORE HOME */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Story Teaser */}
            <div className="p-6 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10">
              <h3 className="font-serif font-bold text-lg text-[#F6EAD7] mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C8893F]" /> Heritage Story
              </h3>
              <p className="text-xs sm:text-sm text-[#D8C4A7] leading-relaxed">
                {shop.story || `${shop.name} has been an iconic local artisan storefront since ${shop.est}, celebrated for traditional recipes and master craftsmanship.`}
              </p>
            </div>

            {/* Featured Products */}
            {customProducts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-bold text-lg text-[#F6EAD7]">
                    Signature Products Available for In-Store Reservation
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {customProducts.slice(0, 4).map((prod, i) => (
                    <ProductCard
                      key={prod.id || i}
                      product={prod}
                      shopId={shop.id}
                      shopName={shop.name}
                      imgIndex={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Reviews Highlight */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-lg text-[#F6EAD7]">Customer Reviews</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="text-xs font-bold text-[#E0AF62] hover:underline"
                >
                  View All Reviews →
                </button>
              </div>
              <ReviewsSection shopId={shop.id} shopName={shop.name} />
            </div>
          </div>
        )}

        {/* TAB 2: COLLECTIONS */}
        {activeTab === 'collections' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-[#F6EAD7]">
                Curated Storefront Collections
              </h3>
            </div>
            {collections.length === 0 ? (
              <div className="p-12 text-center bg-[#17120E] rounded-3xl border border-[#F6EAD7]/10">
                <Sparkles className="w-8 h-8 text-[#9E8B75] mx-auto mb-2" />
                <p className="text-xs text-[#9E8B75]">No seasonal collections published yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((c, i) => (
                  <CollectionCard key={c.id || i} collection={c} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRODUCTS */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-[#F6EAD7]">
                All Artisanal Products ({customProducts.length})
              </h3>
            </div>
            {customProducts.length === 0 ? (
              <div className="p-12 text-center bg-[#17120E] rounded-3xl border border-[#F6EAD7]/10">
                <ShoppingBag className="w-8 h-8 text-[#9E8B75] mx-auto mb-2" />
                <p className="text-xs text-[#9E8B75]">No products currently listed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {customProducts.map((prod, i) => (
                  <ProductCard
                    key={prod.id || i}
                    product={prod}
                    shopId={shop.id}
                    shopName={shop.name}
                    imgIndex={i}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: OFFERS */}
        {activeTab === 'offers' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-[#F6EAD7]">
                Active Offers & Flash Sales
              </h3>
            </div>
            {offers.length === 0 ? (
              <div className="p-12 text-center bg-[#17120E] rounded-3xl border border-[#F6EAD7]/10">
                <Tag className="w-8 h-8 text-[#9E8B75] mx-auto mb-2" />
                <p className="text-xs text-[#9E8B75]">No active discount offers right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {offers.map((o, i) => (
                  <OfferCard key={o.id || i} offer={o} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: REVIEWS */}
        {activeTab === 'reviews' && (
          <div>
            <ReviewsSection shopId={shop.id} shopName={shop.name} />
          </div>
        )}

        {/* TAB 6: ABOUT & HOURS */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10">
              <h3 className="font-serif font-bold text-lg text-[#F6EAD7] mb-4">Operating Hours</h3>
              <div className="space-y-2 text-xs">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                  (day) => (
                    <div
                      key={day}
                      className="flex items-center justify-between py-1.5 border-b border-[#F6EAD7]/5 last:border-0"
                    >
                      <span className="font-semibold text-[#D8C4A7]">{day}</span>
                      <span className="font-mono text-[#F6EAD7]">
                        {shop.hours?.[day.toLowerCase()]?.open
                          ? `${shop.hours[day.toLowerCase()].open} - ${shop.hours[day.toLowerCase()].close}`
                          : shop.ownerProfile?.openingHoursText || '10:00 AM - 09:30 PM'}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#F6EAD7] mb-2">Location & Landmark</h3>
                <p className="text-xs text-[#D8C4A7] mb-4">{shop.addr}</p>
              </div>

              <PremiumButton
                variant="gold"
                size="md"
                onClick={() => {
                  if (shop.loc && shop.loc.length === 2) {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${shop.loc[0]},${shop.loc[1]}`,
                      '_blank'
                    );
                  }
                }}
                className="w-full"
                showArrow
                magnetic
              >
                Open Turn-by-Turn Navigation
              </PremiumButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
