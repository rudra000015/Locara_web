'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShopDetail } from '@/hooks/useShops';
import { useStore } from '@/store/useStore';
import { prodImg } from '@/utils/prodImg';
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
  Camera,
} from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';
import ReservationModal from './ReservationModal';
import ReservationConfirmationModal from './ReservationConfirmationModal';
import VisualSearchModal from './VisualSearchModal';

export default function ProductDetail() {
  const router = useRouter();
  const { currentShopId, currentProdId, openShop, viewProduct, toggleWish, isWished, addToCart, navTo, showToast } = useStore();
  const { shop, loading, error } = useShopDetail(currentShopId);

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [quantity, setQuantity] = useState(1);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<any | null>(null);
  const [showSimilarModal, setShowSimilarModal] = useState(false);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="w-10 h-10 mx-auto border-2 border-[#C8893F] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#9E8B75] mt-4 font-mono tracking-wider uppercase">Loading product showcase...</p>
      </div>
    );
  }

  const s = shop;
  const p = s?.products.find((x) => x.id === currentProdId);
  const prodIndex = s?.products.findIndex((x) => x.id === currentProdId) ?? 0;
  const others = s?.products.filter((x) => x.id !== currentProdId).slice(0, 4) ?? [];

  if (error || !s || !p) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#17120E] border border-[#F6EAD7]/10 flex items-center justify-center text-2xl mx-auto mb-3">
          🔍
        </div>
        <h3 className="font-serif text-lg font-bold text-[#F6EAD7] mb-1">Product Not Found</h3>
        <p className="text-xs text-[#9E8B75] mb-6">This item could not be retrieved.</p>
        <button onClick={() => navTo('home')} className="btn-gold text-xs">
          Return to Explorer
        </button>
      </div>
    );
  }

  const wished = isWished(s.id, p.id);
  const imgSrc = p.image || prodImg(p.name, prodIndex);
  const advanceAmount = Math.round(p.price * 0.1);
  const balanceAmount = p.price - advanceAmount;

  const handleAddToCart = () => {
    addToCart({
      productId: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit || 'unit',
      size: selectedSize,
      color: selectedColor,
      quantity,
      shopId: s.id,
      shopName: s.name,
      shopAddress: s.addr,
      image: imgSrc,
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Back Button */}
      <button
        onClick={() => {
          openShop(s.id);
          router.push(`/explorer/shop/${s.id}`);
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#17120E] border border-[#F6EAD7]/10 text-xs font-bold text-[#9E8B75] hover:text-[#F6EAD7] hover:bg-[#211A14] transition-all mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> Back to {s.name}
      </button>

      {/* Main Showcase Card */}
      <div className="bg-[#17120E] border border-[#F6EAD7]/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Media Image Gallery */}
          <div className="w-full md:w-96 aspect-square bg-[#211A14] rounded-3xl overflow-hidden relative border border-[#F6EAD7]/10 shrink-0">
            <img
              src={imgSrc}
              alt={p.name}
              className="w-full h-full object-cover"
            />
            {p.isNew && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#C8893F] text-[#0E0B08] flex items-center gap-1 shadow-glow-sm">
                <Sparkles className="w-3 h-3" /> NEW ARRIVAL
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
                    unit: p.unit || 'unit',
                    inStock: true,
                    isNew: Boolean(p.isNew),
                    image: imgSrc,
                    category: p.category || s.cat,
                  },
                  s.name
                )
              }
              title={wished ? 'Remove from Wishlist' : 'Save to Wishlist'}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center hover:scale-110 transition-all text-white cursor-pointer"
            >
              <Heart
                className={`w-5 h-5 ${wished ? 'text-[#C24136] fill-[#C24136]' : 'text-white'}`}
              />
            </button>
          </div>

          {/* Details & Selectors */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Origin Shop Link */}
              <p
                onClick={() => {
                  openShop(s.id);
                  router.push(`/explorer/shop/${s.id}`);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#E0AF62] uppercase tracking-wider mb-2 cursor-pointer hover:underline"
              >
                <Store className="w-3.5 h-3.5 text-[#C8893F]" />
                {s.name} • Est. {s.est}
              </p>

              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#F6EAD7] mb-2">
                {p.name}
              </h1>

              {/* Pricing & 10% Advance Breakdown */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-mono text-3xl font-bold text-[#E0AF62]">
                  ₹{p.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#9E8B75]">per {p.unit || 'piece'}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1E5544]/25 text-[#2D7D64] border border-[#1E5544]/40">
                  Reserve for ₹{advanceAmount} (10%)
                </span>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1E5544]/15 text-[#2D7D64] border border-[#1E5544]/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock at Shop
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#211A14] text-[#F6EAD7] border border-[#F6EAD7]/10 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-[#C8893F] fill-[#C8893F]" /> {s.rating} Rating
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C8893F]/10 text-[#E0AF62] border border-[#C8893F]/20 font-mono">
                  {s.age} Yrs Heritage
                </span>
              </div>

              {/* Variant Selectors */}
              <div className="space-y-3 mb-6 p-4 rounded-2xl bg-[#211A14] border border-[#F6EAD7]/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono uppercase text-[#9E8B75] font-bold">Size / Format:</span>
                  <div className="flex gap-1.5">
                    {['S', 'M', 'L', 'XL'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          selectedSize === sz
                            ? 'bg-[#C8893F] text-[#0E0B08]'
                            : 'bg-[#17120E] text-[#D8C4A7] hover:bg-white/5'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono uppercase text-[#9E8B75] font-bold">Color:</span>
                  <div className="flex gap-1.5">
                    {['Black', 'Cream', 'Emerald', 'Gold'].map((clr) => (
                      <button
                        key={clr}
                        type="button"
                        onClick={() => setSelectedColor(clr)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          selectedColor === clr
                            ? 'bg-[#E0AF62] text-[#0E0B08]'
                            : 'bg-[#17120E] text-[#D8C4A7] hover:bg-white/5'
                        }`}
                      >
                        {clr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Physical Shop Information */}
              <div className="p-3.5 rounded-2xl bg-[#1B140F] border border-[#F6EAD7]/10 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#F6EAD7]">{s.name}</p>
                  <p className="text-[11px] text-[#9E8B75] truncate max-w-xs">{s.addr}</p>
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
                  className="px-3 py-1.5 rounded-xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-xs font-bold text-[#E0AF62] flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" /> Navigate
                </button>
              </div>
            </div>

            {/* Primary Actions: Cart & 10% Reservation */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#F6EAD7]/10">
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-3 px-5 rounded-2xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/15 text-xs font-bold text-[#F6EAD7] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#C8893F]" /> Add to Cart
              </button>

              <PremiumButton
                variant="gold"
                size="lg"
                onClick={() => setIsReserveModalOpen(true)}
                className="flex-1"
                magnetic
              >
                Reserve Now for ₹{advanceAmount}
              </PremiumButton>
            </div>

            <button
              type="button"
              onClick={() => setShowSimilarModal(true)}
              className="w-full mt-3 py-2.5 rounded-2xl bg-[#17120E] hover:bg-[#211A14] border border-[#C8893F]/30 text-xs font-bold text-[#E0AF62] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#C8893F]" />
              <span>Find Similar Styles in Nearby Shops</span>
            </button>
          </div>
        </div>

        {/* More creations from this shop */}
        {others.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[#F6EAD7]/10">
            <h3 className="font-serif font-bold text-lg text-[#F6EAD7] mb-4">
              More Creations from {s.name}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {others.map((o, oi) => (
                <div
                  key={o.id}
                  onClick={() => {
                    viewProduct(s.id, o.id);
                    router.push(`/explorer/product/${s.id}/${o.id}`);
                  }}
                  className="rounded-2xl bg-[#211A14] border border-[#F6EAD7]/10 overflow-hidden hover:border-[#C8893F]/40 transition-all cursor-pointer group"
                >
                  <div className="aspect-square bg-[#1B140F] overflow-hidden">
                    <img
                      src={o.image || prodImg(o.name, oi + 10)}
                      alt={o.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-serif font-bold text-xs text-[#F6EAD7] group-hover:text-[#E0AF62] truncate">
                      {o.name}
                    </p>
                    <p className="font-mono text-xs font-bold text-[#E0AF62] mt-1">
                      ₹{o.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reservation Checkout Modal */}
      {isReserveModalOpen && (
        <ReservationModal
          isOpen={isReserveModalOpen}
          onClose={() => setIsReserveModalOpen(false)}
          product={{
            id: p.id,
            name: p.name,
            price: p.price,
            unit: p.unit,
            image: imgSrc,
            category: p.category,
          }}
          shop={{
            id: s.id,
            name: s.name,
            addr: s.addr,
            loc: s.loc,
          }}
          onSuccess={(res) => {
            setIsReserveModalOpen(false);
            setConfirmedReservation(res);
          }}
        />
      )}

      {/* Confirmation Success Modal */}
      {confirmedReservation && (
        <ReservationConfirmationModal
          isOpen={Boolean(confirmedReservation)}
          onClose={() => setConfirmedReservation(null)}
          reservation={confirmedReservation}
        />
      )}

      {/* Visual Search Modal */}
      <VisualSearchModal
        open={showSimilarModal}
        onOpenChange={setShowSimilarModal}
      />
    </div>
  );
}
