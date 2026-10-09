'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Heart, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { SHOPS } from '@/data/shops';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, toggleWish, viewProduct, addToCart, navTo } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-10 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#F5F4F0] text-[#8A8A8A] flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#171717]">Your Wishlist is Empty</h2>
          <p className="text-xs text-[#666666] max-w-xs mx-auto">
            Explore local shops and save your favorite handicrafts, jewellery, and fashion pieces here.
          </p>
          <button
            type="button"
            onClick={() => {
              navTo('home');
              router.push('/');
            }}
            className="px-6 py-2.5 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <span>Start Exploring</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 space-y-6">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171717]">Saved Items & Wishlist</h1>
          <p className="text-xs text-[#666666] mt-0.5">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlist.map((w) => {
          const shop = SHOPS.find((s) => s.id === w.shopId);
          const product = shop?.products.find((p) => p.id === w.prodId);

          return (
            <div
              key={`${w.shopId}-${w.prodId}`}
              onClick={() => {
                viewProduct(w.shopId, w.prodId);
                router.push(`/explorer/product/${w.shopId}/${w.prodId}`);
              }}
              className="group relative bg-white border border-[#E5E5E5] rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full bg-[#F5F4F0] overflow-hidden">
                <img
                  src={w.image || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'}
                  alt={w.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product) toggleWish(w.shopId, w.prodId, product, w.shopName);
                  }}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center text-[#DC2626]"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-xs text-[#666666] block truncate font-medium">{w.shopName}</span>
                  <h3 className="text-sm font-bold text-[#171717] line-clamp-1 group-hover:text-[#A85420] transition-colors mt-0.5">
                    {w.name}
                  </h3>
                  <p className="text-sm font-bold text-[#171717] mt-1.5">
                    ₹{w.price.toLocaleString('en-IN')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({
                      productId: w.prodId,
                      name: w.name,
                      price: w.price,
                      unit: w.unit || 'piece',
                      quantity: 1,
                      shopId: w.shopId,
                      shopName: w.shopName,
                      image: w.image,
                    });
                  }}
                  className="mt-3 w-full py-2 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
