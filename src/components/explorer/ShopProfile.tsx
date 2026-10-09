'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShopDetail } from '@/hooks/useShops';
import { useStore } from '@/store/useStore';
import { SHOPS, isOpenNow, todayHours, whatsappUrl, gmapsUrl } from '@/data/shops';
import dynamic from 'next/dynamic';
import { formatDistance, getDistanceMeters, getGoogleDirectionsUrl } from '@/lib/geo';
import ProductCard from './ProductCard';
import ReviewsSection from './ReviewsSection';
import {
  Star,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  Share2,
  Heart,
  ChevronRight,
  Store,
  Calendar,
  ShieldCheck,
  Building2,
  LocateFixed,
} from 'lucide-react';

const LeafletShopMap = dynamic(() => import('@/components/map/LeafletShopMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-xl bg-[#F5F4F0] flex items-center justify-center text-xs text-[#666666]">
      Loading map preview...
    </div>
  ),
});

interface Props {
  shopId?: string;
}

export default function ShopProfile({ shopId }: Props) {
  const router = useRouter();
  const { currentShopId, navTo, followShop, unfollowShop, isFollowing, showToast, userLocation, requestUserLocation } = useStore();
  const activeId = shopId || currentShopId || 'sharma-handicrafts';

  const { shop: fetchedShop, loading } = useShopDetail(activeId);
  const fallbackShop = SHOPS.find((s) => s.id === activeId) || SHOPS[0];
  const shop = fetchedShop || fallbackShop;

  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'reviews' | 'location'>('products');
  const following = isFollowing(shop.id);

  const openStatus = shop.openNow ?? isOpenNow(shop.hours);
  const closingTime = todayHours(shop.hours).split('-')[1]?.trim() || '9:00 PM';

  const shopLat = shop.loc?.[0] || 28.9845;
  const shopLng = shop.loc?.[1] || 77.7064;

  const calculatedDist =
    userLocation.latitude !== null && userLocation.longitude !== null
      ? getDistanceMeters(userLocation.latitude, userLocation.longitude, shopLat, shopLng)
      : shop.distanceMeters;

  const distanceStr = calculatedDist ? formatDistance(calculatedDist) : '1.2 km';
  const ratingVal = (shop.rating || 4.6).toFixed(1);
  const reviewCount = shop.totalRatings || (shop.reviews?.length ? shop.reviews.length * 20 : 120);

  const coverImg =
    shop.photos?.[0] ||
    shop.images?.[0] ||
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80';

  const avatarImg =
    shop.ownerImg ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80';

  const handleFollowToggle = () => {
    if (following) {
      unfollowShop(shop.id);
    } else {
      followShop(shop.id, shop.name);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: `${shop.name} on Locara`,
        text: `Check out ${shop.name} on Locara Marketplace`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        showToast('Shop link copied to clipboard!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-16">
      {/* ── 1. Breadcrumbs ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="flex items-center gap-2 text-xs text-[#666666]">
          <button
            onClick={() => {
              navTo('home');
              router.push('/');
            }}
            className="hover:text-[#A85420]"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#8A8A8A]" />
          <button
            onClick={() => {
              navTo('shops');
              router.push('/explorer/shops');
            }}
            className="hover:text-[#A85420]"
          >
            Shops
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#8A8A8A]" />
          <span className="text-[#171717] font-semibold truncate">{shop.name}</span>
        </nav>
      </div>

      {/* ── 2. Shop Hero Header ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
          {/* Cover Photo */}
          <div className="h-44 sm:h-60 w-full relative bg-[#F5F4F0] overflow-hidden">
            <img
              src={coverImg}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Profile Details Bar */}
          <div className="p-4 sm:p-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
              {/* Left: Avatar + Title */}
              <div className="flex items-end gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 border-2 border-white shadow-md overflow-hidden shrink-0">
                  <img
                    src={avatarImg}
                    alt={shop.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#171717]">
                      {shop.name}
                    </h1>
                    <span title="Verified Shop" className="inline-flex">
                      <CheckCircle2
                        className="w-5 h-5 text-[#2563EB] fill-[#2563EB]/10 shrink-0"
                      />
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#666666] font-medium flex flex-wrap items-center gap-2">
                    <span className="capitalize">{shop.subcategory || shop.cat}</span>
                    <span>•</span>
                    <span>{distanceStr}</span>
                    <span>•</span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        openStatus ? 'text-[#16803C]' : 'text-[#DC2626]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          openStatus ? 'bg-[#16803C]' : 'bg-[#DC2626]'
                        }`}
                      />
                      {openStatus ? 'Open' : 'Closed'}
                    </span>
                    <span>·</span>
                    <span>Closes {closingTime}</span>
                  </p>

                  <div className="flex items-center gap-1 text-xs font-semibold text-[#171717] pt-0.5">
                    <Star className="w-4 h-4 fill-[#D97706] text-[#D97706]" />
                    <span>{ratingVal}</span>
                    <span className="text-[#8A8A8A] font-normal">({reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions (Follow, Share, Contact) */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    following
                      ? 'bg-[#F5F4F0] text-[#171717] border border-[#E5E5E5]'
                      : 'bg-[#A85420] text-white hover:bg-[#873F17]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${following ? 'fill-[#DC2626] text-[#DC2626]' : ''}`} />
                  <span>{following ? 'Following' : 'Follow'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="px-3 py-2 bg-white border border-[#E5E5E5] text-[#171717] hover:bg-[#F5F4F0] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Share Shop"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                {shop.whatsapp && (
                  <button
                    type="button"
                    onClick={() => window.open(whatsappUrl(shop.whatsapp!, shop.name), '_blank')}
                    className="p-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-lg transition-colors"
                    title="WhatsApp Shop"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                )}

                {shop.phone && (
                  <button
                    type="button"
                    onClick={() => (window.location.href = `tel:${shop.phone}`)}
                    className="p-2 bg-[#F5F4F0] text-[#171717] hover:bg-[#EAE8E2] border border-[#E5E5E5] rounded-lg transition-colors"
                    title="Call Shop"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-6 border-t border-[#E5E5E5] mt-6 pt-1">
              {(['products', 'about', 'reviews', 'location'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 text-xs font-bold capitalize transition-colors relative ${
                    activeTab === tab
                      ? 'text-[#A85420]'
                      : 'text-[#666666] hover:text-[#171717]'
                  }`}
                >
                  {tab === 'products'
                    ? `Products (${shop.products?.length || 0})`
                    : tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A85420] rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Tab Contents ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#171717]">Our Products</h2>
                <p className="text-xs text-[#666666]">
                  Reserve online with 10% advance deposit for guaranteed store pickup
                </p>
              </div>
            </div>

            {shop.products && shop.products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {shop.products.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    shopId={shop.id}
                    shopName={shop.name}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center text-[#666666] text-xs">
                No products listed yet for this shop.
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-base text-[#171717]">About Us</h3>
              <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-line">
                {shop.story ||
                  'Traditional handicrafts items crafted by local artisans. From home decor to traditional gifts, we bring you authentic handmade products with modern touch.'}
              </p>

              {shop.age && (
                <div className="pt-4 border-t border-[#E5E5E5] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FBF3EE] text-[#A85420] flex items-center justify-center font-bold text-xs">
                    {shop.age}y
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#171717]">
                      Established in {shop.est || new Date().getFullYear() - shop.age}
                    </h4>
                    <p className="text-[11px] text-[#666666]">
                      Owned & Managed by {shop.owner || 'Founder Family'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-sm text-[#171717]">Operating Hours</h3>
              <table className="w-full text-xs text-[#171717]">
                <tbody>
                  <tr className="border-b border-[#F0F0F0] py-1.5 flex justify-between">
                    <td className="text-[#666666]">Monday - Friday</td>
                    <td className="font-semibold">09:00 AM - 09:00 PM</td>
                  </tr>
                  <tr className="border-b border-[#F0F0F0] py-1.5 flex justify-between">
                    <td className="text-[#666666]">Saturday</td>
                    <td className="font-semibold">09:00 AM - 09:30 PM</td>
                  </tr>
                  <tr className="py-1.5 flex justify-between">
                    <td className="text-[#666666]">Sunday</td>
                    <td className="font-semibold">10:00 AM - 08:00 PM</td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => window.open(gmapsUrl(shop.loc, shop.name), '_blank')}
                  className="w-full py-2 px-3 bg-[#A85420] hover:bg-[#873F17] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
            <ReviewsSection shopId={shop.id} shopName={shop.name} />
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-5 shadow-sm">
            <div>
              <h3 className="font-bold text-base text-[#171717]">Store Location</h3>
              <p className="text-sm font-semibold text-[#171717] mt-1">{shop.name}</p>
              <p className="text-xs text-[#666666] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#A85420] shrink-0" />
                <span>{shop.addr}</span>
              </p>
              <p className="text-xs font-semibold text-[#A85420] mt-1.5 flex items-center gap-1">
                <span>{distanceStr} from you</span>
              </p>
            </div>

            {/* Small Map Preview */}
            <div className="h-56 w-full rounded-xl overflow-hidden border border-[#E5E5E5]">
              <LeafletShopMap
                shops={[shop]}
                selectedShop={shop}
                onSelectShop={() => {}}
                onNavigateToShop={() => {
                  window.open(getGoogleDirectionsUrl(shopLat, shopLng, shop.name), '_blank', 'noopener,noreferrer');
                }}
                userLocation={
                  userLocation.latitude !== null && userLocation.longitude !== null
                    ? { lat: userLocation.latitude, lng: userLocation.longitude }
                    : null
                }
                centerLocation={{ lat: shopLat, lng: shopLng }}
                className="w-full h-full"
              />
            </div>

            {/* Actions */}
            <div className="pt-1 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  window.open(getGoogleDirectionsUrl(shopLat, shopLng, shop.name), '_blank', 'noopener,noreferrer')
                }
                className="px-5 py-2.5 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
              </button>

              {shop.phone && (
                <button
                  type="button"
                  onClick={() => (window.location.href = `tel:${shop.phone}`)}
                  className="px-4 py-2.5 bg-[#F5F4F0] hover:bg-[#EAE8E2] text-[#171717] text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-[#E5E5E5] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {shop.phone}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
