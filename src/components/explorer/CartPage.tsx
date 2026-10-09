'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  ShoppingBag,
  Store,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronRight,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    getCartByShop,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    clearShopCart,
    createReservation,
    navTo,
    showToast,
    user,
  } = useStore();

  const [isProcessing, setIsProcessing] = useState(false);

  const grouped = getCartByShop();
  const shopIds = Object.keys(grouped);

  // Overall totals across all shops
  let grandTotal = 0;
  let grandReserveOnline = 0;
  let grandPayAtShop = 0;

  shopIds.forEach((sId) => {
    grandTotal += grouped[sId].total;
    grandReserveOnline += grouped[sId].advance;
    grandPayAtShop += grouped[sId].balance;
  });

  const handleCheckoutAll = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    // Create reservation passes for each shop in the cart
    shopIds.forEach((sId) => {
      const g = grouped[sId];
      g.items.forEach((item) => {
        createReservation({
          productId: item.productId,
          productName: item.name,
          productImage: item.image || '',
          price: item.price * item.quantity,
          shopId: item.shopId,
          shopName: item.shopName,
          shopAddress: item.shopAddress || 'Meerut, Uttar Pradesh',
          customerName: user?.name || 'Rahul Sharma',
          customerPhone: user?.phone || '+91 98370 55555',
        });
      });
      clearShopCart(sId);
    });

    setTimeout(() => {
      setIsProcessing(false);
      showToast('Reservation confirmed! View your Pickup Passes.');
      navTo('reservations');
      router.push('/explorer/reservations');
    }, 600);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-12 max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#F5F4F0] text-[#8A8A8A] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#171717]">Your Cart is Empty</h2>
          <p className="text-xs text-[#666666] max-w-xs mx-auto">
            Discover unique local shops and reserve artisanal products with just a 10% deposit.
          </p>
          <button
            type="button"
            onClick={() => {
              navTo('home');
              router.push('/');
            }}
            className="px-6 py-2.5 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <span>Explore Marketplace</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      {/* ── 1. Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171717]">Your Cart</h1>
          <p className="text-xs text-[#666666] mt-0.5">
            {shopIds.length} {shopIds.length === 1 ? 'Shop' : 'Shops'} • {cart.reduce((s, i) => s + i.quantity, 0)} Items
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-[#DC2626] hover:underline"
        >
          Clear Cart
        </button>
      </div>

      {/* ── 2. Main Cart Layout ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Items Grouped by Shop */}
        <div className="lg:col-span-2 space-y-6">
          {shopIds.map((shopId) => {
            const group = grouped[shopId];
            return (
              <div
                key={shopId}
                className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-sm"
              >
                {/* Shop Group Header */}
                <div className="bg-[#F5F4F0] px-5 py-3 border-b border-[#E5E5E5] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#A85420]" />
                    <span className="font-bold text-sm text-[#171717]">{group.shopName}</span>
                  </div>
                  <span className="text-xs text-[#666666]">In-Store Pickup</span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-[#E5E5E5] px-5">
                  {group.items.map((item) => (
                    <div key={item.id} className="py-4 flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg bg-[#F5F4F0] overflow-hidden shrink-0 border border-[#E5E5E5]">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-[#171717] truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs font-bold text-[#171717] mt-0.5">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#E5E5E5] rounded-lg bg-[#FAFAF8]">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-[#666666] hover:text-[#171717]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-[#171717]">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-[#666666] hover:text-[#171717]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right min-w-[70px]">
                        <span className="font-bold text-sm text-[#171717]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-[#8A8A8A] hover:text-[#DC2626] transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Per-Shop Subtotal Box */}
                <div className="bg-[#FAFAF8] px-5 py-3 border-t border-[#E5E5E5] text-xs space-y-1">
                  <div className="flex justify-between text-[#666666]">
                    <span>Subtotal ({group.items.reduce((s, i) => s + i.quantity, 0)} items):</span>
                    <span className="font-bold text-[#171717]">₹{group.total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#16803C] font-semibold">
                    <span>Reserve Deposit (10%):</span>
                    <span>₹{group.advance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#666666]">
                    <span>Pay at Shop (90%):</span>
                    <span className="font-semibold text-[#171717]">₹{group.balance.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 1 Column: Order Summary & Checkout */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-4 shadow-sm sticky top-24">
            <h3 className="font-bold text-base text-[#171717] border-b border-[#E5E5E5] pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-[#666666]">
                <span>Total Item Value:</span>
                <span className="font-bold text-[#171717]">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-[#16803C] font-semibold bg-[#EBF8F0] p-2.5 rounded-lg border border-[#A7F3D0]">
                <span>Total Reserve Deposit (Pay Online 10%):</span>
                <span className="font-bold">₹{grandReserveOnline.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-[#171717] font-semibold pt-1">
                <span className="text-[#666666]">Total Pay at Shop (90%):</span>
                <span>₹{grandPayAtShop.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* In-Store Pickup Details Note */}
            <div className="bg-[#F5F4F0] p-3 rounded-lg text-[11px] text-[#666666] space-y-1">
              <p className="font-bold text-[#171717] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16803C]" />
                <span>100% Verified Pickup Guarantee</span>
              </p>
              <p>
                Pay 10% now to reserve. Inspect and collect your items in-store, and pay the remaining 90% balance directly at the counter.
              </p>
            </div>

            {/* Continue to Payment Button */}
            <button
              type="button"
              onClick={handleCheckoutAll}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-[#A85420] hover:bg-[#873F17] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Lock className="w-4 h-4" />
              <span>{isProcessing ? 'Confirming...' : 'Continue to Payment'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
