'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShopDetail } from '@/hooks/useShops';
import { useStore } from '@/store/useStore';
import { prodImg } from '@/utils/prodImg';
import ReservationDepositModal from './ReservationDepositModal';
import {
  ChevronLeft,
  Heart,
  Store,
  Star,
  Clock,
  Sparkles,
  Share2,
  CheckCircle2,
  Navigation,
  ShoppingBag,
  ShieldCheck,
  Tag,
  QrCode,
  Check,
  X,
  MapPin,
  ArrowRight,
} from 'lucide-react';

export default function ProductDetail() {
  const router = useRouter();
  const {
    currentShopId,
    currentProdId,
    openShop,
    viewProduct,
    toggleWish,
    isWished,
    addToCart,
    createReservation,
    navTo,
    showToast,
    user,
  } = useStore();
  const { shop, loading, error } = useShopDetail(currentShopId);

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Natural');
  const [quantity, setQuantity] = useState(1);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [confirmedPass, setConfirmedPass] = useState<any | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState(user?.name || 'Rohan Mehta');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+91 98450 99881');
  const [pickupWindow, setPickupWindow] = useState('Tomorrow (3 PM - 7 PM)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <div className="w-10 h-10 mx-auto border-2 border-[#54512d] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#7a776b] mt-4 font-mono tracking-wider uppercase">Loading atelier piece...</p>
      </div>
    );
  }

  const s = shop;
  const p = s?.products.find((x) => x.id === currentProdId) || s?.products[0];
  const prodIndex = s?.products.findIndex((x) => x.id === currentProdId) ?? 0;
  const others = s?.products.filter((x) => x.id !== currentProdId).slice(0, 3) ?? [];

  if (error || !s || !p) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#ffffff] border border-[#cbc6b8] flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm">
          🔍
        </div>
        <h3 className="font-serif text-lg font-bold text-[#1b1c19] mb-1">Item Not Found</h3>
        <p className="text-xs text-[#7a776b] mb-6">This atelier piece could not be retrieved.</p>
        <button onClick={() => router.push('/products')} className="btn-primary-irl text-xs">
          Browse Verified Drops →
        </button>
      </div>
    );
  }

  const wished = isWished(s.id, p.id);
  const imgSrc = p.image || prodImg(p.name, prodIndex);

  const handleAddToCart = () => {
    addToCart({
      productId: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit || 'piece',
      size: selectedSize,
      color: selectedColor,
      quantity,
      shopId: s.id,
      shopName: s.name,
      shopAddress: s.addr,
      image: imgSrc,
    });
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const newPass = createReservation({
        productId: p.id,
        productName: p.name,
        productImage: imgSrc,
        price: p.price,
        shopId: s.id,
        shopName: s.name,
        shopAddress: s.addr,
        shopPhone: s.phone || '+91 80 4123 9988',
        shopLocation: s.loc as [number, number],
        customerName,
        customerPhone,
        pickupDate: pickupWindow,
        timeSlot: '3:00 PM - 7:00 PM',
      });
      setConfirmedPass(newPass);
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto pb-32">
      {/* Back Button */}
      <button
        onClick={() => {
          openShop(s.id);
          router.push(`/shops/${s.id}`);
        }}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffffff] border border-[rgba(72,55,47,0.12)] text-xs font-bold text-[#49473c] hover:text-[#1b1c19] hover:border-[#54512d] transition-all mb-6 cursor-pointer shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Back to {s.name}
      </button>

      {/* Main Showcase Card */}
      <div className="bg-[#ffffff] border border-[rgba(72,55,47,0.12)] rounded-2xl p-6 sm:p-10 shadow-[0_12px_32px_-4px_rgba(72,55,47,0.06)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Media Image Gallery */}
          <div className="md:col-span-6 aspect-square bg-[#efeee9] rounded-2xl overflow-hidden relative border border-[#cbc6b8]/50 shrink-0">
            <img
              src={imgSrc}
              alt={p.name}
              className="w-full h-full object-cover"
            />
            {p.isNew && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#54512d] text-[#ffffff] flex items-center gap-1 shadow-sm uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#f0e9ba]" /> NEW OFFLINE DROP
              </span>
            )}
            <button
              onClick={() =>
                toggleWish(
                  s.id,
                  p.id,
                  {
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    unit: p.unit || 'piece',
                    inStock: true,
                    isNew: Boolean(p.isNew),
                    image: imgSrc,
                    category: p.category || s.cat,
                  },
                  s.name
                )
              }
              title={wished ? 'Remove from Wishlist' : 'Save to Wishlist'}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#ffffff]/90 backdrop-blur-md border border-[rgba(72,55,47,0.15)] flex items-center justify-center hover:scale-110 transition-all text-[#1b1c19] cursor-pointer shadow-sm"
            >
              <Heart
                className={`w-5 h-5 ${wished ? 'text-[#ba1a1a] fill-[#ba1a1a]' : 'text-[#49473c]'}`}
              />
            </button>
          </div>

          {/* Details & Selectors */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Origin Shop Link */}
              <p
                onClick={() => {
                  openShop(s.id);
                  router.push(`/shops/${s.id}`);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#54512d] uppercase tracking-wider mb-2 cursor-pointer hover:underline"
              >
                <Store className="w-3.5 h-3.5 text-[#54512d]" />
                {s.name} • {s.cat}
              </p>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b1c19] leading-tight mb-3">
                {p.name}
              </h1>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-serif text-3xl font-bold text-[#1b1c19]">
                  ₹{p.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#7a776b]">per {p.unit || 'piece'}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#efeee9] text-[#54512d] border border-[#cbc6b8]">
                  48H Counter Hold Free
                </span>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e8f5e9] text-[#2e7d32] border border-[#2e7d32]/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Physical Stock
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#f5f4ef] text-[#1b1c19] border border-[#cbc6b8]/50 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-[#54512d] fill-[#54512d]" /> {s.rating} Rating
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#f5f4ef] text-[#54512d] border border-[#cbc6b8]/50 font-mono">
                  {s.age} Yrs Heritage
                </span>
              </div>

              {/* Description & Authenticity */}
              <div className="p-4 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8]/50 space-y-2 mb-6">
                <div className="flex items-center gap-2 text-[11px] font-bold text-[#54512d] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Authenticity</span>
                </div>
                <p className="text-xs text-[#49473c] leading-relaxed">
                  Crafted by master artisans. Available exclusively for offline inspection and in-person pickup.
                </p>
              </div>

              {/* Physical Shop Information */}
              <div className="p-4 rounded-xl bg-[#faf9f4] border border-[#cbc6b8]/60 flex items-center justify-between gap-3 mb-6">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1b1c19]">{s.name}</p>
                  <p className="text-[11px] text-[#7a776b] truncate">{s.addr}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (s.loc && s.loc.length === 2) {
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${s.loc[0]},${s.loc[1]}`,
                        '_blank'
                      );
                    }
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#ffffff] hover:bg-[#efeee9] border border-[#cbc6b8] text-xs font-bold text-[#54512d] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3 h-3" /> Navigate
                </button>
              </div>
            </div>

            {/* Primary Actions: Cart & In-Store Pass Reservation */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#cbc6b8]/40">
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-3 px-5 rounded-full bg-[#f5f4ef] hover:bg-[#efeee9] border border-[#cbc6b8] text-xs font-bold text-[#1b1c19] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#54512d]" />
                <span>Add to Pickup Bag</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReserveModalOpen(true)}
                className="btn-primary-irl flex-1 text-xs py-3 shadow-md"
              >
                <QrCode className="w-4 h-4" />
                <span>Reserve In-Store Pass (10% Deposit) →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 10% Advance Payment & Reservation Modal */}
      {isReserveModalOpen && (
        <ReservationDepositModal
          item={{
            id: p.id,
            name: p.name,
            image: imgSrc,
            price: p.price,
            shopId: s.id,
            shopName: s.name,
            address: s.addr,
            phone: s.phone,
            location: s.loc as [number, number],
          }}
          onClose={() => setIsReserveModalOpen(false)}
        />
      )}
    </div>
  );
}
