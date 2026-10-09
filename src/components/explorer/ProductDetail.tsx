'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShopDetail } from '@/hooks/useShops';
import { useStore } from '@/store/useStore';
import { SHOPS } from '@/data/shops';
import ReservationDepositModal from './ReservationDepositModal';
import {
  Star,
  CheckCircle2,
  Heart,
  Share2,
  ShoppingBag,
  ShieldCheck,
  Store,
  RotateCcw,
  Minus,
  Plus,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react';

interface Props {
  shopId?: string;
  productId?: string;
}

export default function ProductDetail({ shopId: propShopId, productId: propProdId }: Props) {
  const router = useRouter();
  const {
    currentShopId,
    currentProdId,
    openShop,
    toggleWish,
    isWished,
    addToCart,
    createReservation,
    navTo,
    showToast,
  } = useStore();

  const activeShopId = propShopId || currentShopId || 'sharma-handicrafts';
  const activeProdId = propProdId || currentProdId || 'prod_lamp_1';

  const { shop: fetchedShop } = useShopDetail(activeShopId);
  const fallbackShop = SHOPS.find((s) => s.id === activeShopId) || SHOPS[0];
  const s = fetchedShop || fallbackShop;

  const product =
    s.products.find((p) => p.id === activeProdId) ||
    s.products[0] || {
      id: 'prod_lamp_1',
      name: 'Decorative Lamp',
      price: 1200,
      unit: 'piece',
      inStock: true,
      isNew: true,
      discountPct: 20,
      description:
        'Beautiful handmade decorative lamp for home decor. Adds a traditional touch to your space with ambient warm lighting.',
      category: 'Handicrafts',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    };

  const [selectedImage, setSelectedImage] = useState(
    product.image || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'
  );
  const [selectedColor, setSelectedColor] = useState('Brown');
  const [selectedSize, setSelectedSize] = useState('Standard');
  const [quantity, setQuantity] = useState(1);
  const [isReserving, setIsReserving] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const wished = isWished(s.id, product.id);
  const discount = product.discountPct || 20;
  const mrp = Math.round(product.price / (1 - discount / 100));

  // Calculations
  const itemTotalPrice = product.price * quantity;
  const reserveDeposit10 = Math.round(itemTotalPrice * 0.1);
  const payAtShop90 = itemTotalPrice - reserveDeposit10;

  const galleryImages = [
    product.image || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&q=80',
  ];

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit || 'piece',
      size: selectedSize,
      color: selectedColor,
      quantity,
      shopId: s.id,
      shopName: s.name,
      shopAddress: s.addr,
      image: selectedImage,
    });
  };

  const handleReserveDirectly = () => {
    setIsReserving(true);
    const pass = createReservation({
      productId: product.id,
      productName: product.name,
      productImage: selectedImage,
      price: itemTotalPrice,
      shopId: s.id,
      shopName: s.name,
      shopAddress: s.addr,
      shopPhone: s.phone || '+91 98370 12345',
      shopLocation: s.loc || [28.9845, 77.7064],
    });

    setTimeout(() => {
      setIsReserving(false);
      navTo('reservations');
      router.push('/explorer/reservations');
    }, 400);
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
              openShop(s.id);
              router.push(`/explorer/shop/${s.id}`);
            }}
            className="hover:text-[#A85420]"
          >
            {s.name}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#8A8A8A]" />
          <span className="text-[#171717] font-semibold truncate">{product.name}</span>
        </nav>
      </div>

      {/* ── 2. Product Detail Main Container ───────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#F5F4F0] border border-[#E5E5E5]">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() =>
                  toggleWish(
                    s.id,
                    product.id,
                    {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      unit: product.unit || 'piece',
                      inStock: true,
                      isNew: Boolean(product.isNew),
                      image: selectedImage,
                    },
                    s.name
                  )
                }
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center transition-all"
              >
                <Heart
                  className={`w-4 h-4 ${
                    wished ? 'fill-[#DC2626] text-[#DC2626]' : 'text-[#666666]'
                  }`}
                />
              </button>

              {discount > 0 && (
                <div className="absolute top-3 left-3 bg-[#D92D20] text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            <div className="flex items-center gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all bg-[#F5F4F0] ${
                    selectedImage === img
                      ? 'border-[#A85420] shadow-sm'
                      : 'border-[#E5E5E5] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info & Actions */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Shop Link */}
              <button
                type="button"
                onClick={() => {
                  openShop(s.id);
                  router.push(`/explorer/shop/${s.id}`);
                }}
                className="text-xs font-semibold text-[#A85420] hover:underline flex items-center gap-1"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{s.name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] fill-[#2563EB]/10" />
              </button>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-[#171717] font-bold">
                  <Star className="w-4 h-4 fill-[#D97706] text-[#D97706]" />
                  <span>4.7</span>
                  <span className="text-[#8A8A8A] font-normal">(45 reviews)</span>
                </div>
                <span>•</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#EBF8F0] text-[#16803C]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16803C]" />
                  In Stock
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl font-black text-[#171717]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-base text-[#8A8A8A] line-through">
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-[#16803C] bg-[#EBF8F0] px-2 py-0.5 rounded">
                  {discount}% off
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                {product.description ||
                  'Beautiful handmade decorative lamp for home decor. Adds a traditional touch to your space with ambient warm lighting.'}
              </p>

              {/* Color Variants */}
              <div>
                <span className="text-xs font-bold text-[#171717] block mb-2">Color</span>
                <div className="flex items-center gap-2">
                  {['Brown', 'Black', 'White'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedColor === col
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : 'bg-white text-[#171717] border-[#E5E5E5] hover:bg-[#F5F4F0]'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <span className="text-xs font-bold text-[#171717] block mb-2">Quantity</span>
                <div className="inline-flex items-center border border-[#E5E5E5] rounded-lg bg-[#FAFAF8]">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-[#666666] hover:text-[#171717]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold text-[#171717]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-[#666666] hover:text-[#171717]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Price Details Breakdown Box */}
              <div className="bg-[#F5F4F0] border border-[#E5E5E5] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#171717]">
                  <span className="text-[#666666]">Total Price:</span>
                  <span className="font-bold">₹{itemTotalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#16803C] font-semibold">
                  <span>Reserve Online (10%):</span>
                  <span>₹{reserveDeposit10.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#171717] font-semibold pt-1 border-t border-[#E5E5E5]">
                  <span className="text-[#666666]">Pay at Shop (90%):</span>
                  <span>₹{payAtShop90.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3 px-4 bg-white border border-[#A85420] text-[#A85420] hover:bg-[#FBF3EE] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDepositModal(true)}
                  disabled={isReserving}
                  className="w-full py-3 px-4 bg-[#A85420] hover:bg-[#873F17] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Reserve for Pickup</span>
                </button>
              </div>

              {/* Trust Features */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E5E5E5] text-center text-[11px] text-[#666666]">
                <div className="flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#16803C]" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Store className="w-3.5 h-3.5 text-[#A85420]" />
                  <span>In-Store Pickup</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Easy Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Deposit Modal */}
      {showDepositModal && (
        <ReservationDepositModal
          item={{
            id: product.id,
            name: product.name,
            image: selectedImage,
            price: itemTotalPrice,
            shopId: s.id,
            shopName: s.name,
            address: s.addr || 'Sadar Bazaar, Meerut',
            phone: s.phone || '+91 98370 12345',
            location: s.loc,
          }}
          onClose={() => setShowDepositModal(false)}
          onSuccess={() => {
            setShowDepositModal(false);
            navTo('reservations');
            router.push('/explorer/reservations');
          }}
        />
      )}
    </div>
  );
}
