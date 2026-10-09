'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { prodImg } from '@/utils/prodImg';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    mrp?: number;
    discountPct?: number;
    unit?: string;
    images?: string[];
    image?: string;
    isNew?: boolean;
    isFeatured?: boolean;
    isPopular?: boolean;
    cat?: string;
    category?: string;
    shopId?: string;
    description?: string;
    rating?: number;
  };
  shopId?: string;
  shopName?: string;
  imgIndex?: number;
  showNew?: boolean;
}

export default function ProductCard({
  product: p,
  shopId,
  shopName = 'Sharma Handicrafts',
  imgIndex = 0,
}: ProductCardProps) {
  const router = useRouter();
  const { toggleWish, isWished, viewProduct, addToCart } = useStore();
  const activeShopId = shopId || p.shopId || 'sharma-handicrafts';
  const wished = isWished(activeShopId, p.id);

  const imgSrc =
    p.image ||
    p.images?.[0] ||
    prodImg(p.cat || p.category || 'handicrafts', imgIndex);

  const discount = p.discountPct || (p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 20);
  const mrp = p.mrp || Math.round(p.price / (1 - (discount / 100)));
  const ratingVal = p.rating || 4.7;

  const handleCardClick = () => {
    viewProduct(activeShopId, p.id);
    router.push(`/explorer/product/${activeShopId}/${p.id}`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWish(
      activeShopId,
      p.id,
      {
        id: p.id,
        name: p.name,
        price: p.price,
        unit: p.unit || 'piece',
        inStock: true,
        isNew: Boolean(p.isNew),
        image: imgSrc,
        category: p.cat || p.category,
      },
      shopName
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit || 'piece',
      quantity: 1,
      shopId: activeShopId,
      shopName,
      image: imgSrc,
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white border border-[#E5E5E5] rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F5F4F0]">
        <img
          src={imgSrc}
          alt={p.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center transition-all z-10"
          title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wished ? 'fill-[#DC2626] text-[#DC2626]' : 'text-[#666666] hover:text-[#171717]'
            }`}
          />
        </button>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-[#D92D20] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Shop Name & Rating */}
          <div className="flex items-center justify-between gap-2 text-xs text-[#666666] mb-1">
            <span className="truncate max-w-[130px] font-medium">{shopName}</span>
            <div className="flex items-center gap-0.5 text-[#171717] font-semibold text-[11px]">
              <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
              <span>{ratingVal}</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-[#171717] line-clamp-1 group-hover:text-[#A85420] transition-colors">
            {p.name}
          </h3>

          {/* Price & MRP */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-[#171717]">₹{p.price.toLocaleString('en-IN')}</span>
            {mrp > p.price && (
              <span className="text-xs text-[#8A8A8A] line-through">₹{mrp.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>

        {/* Add to Cart CTA Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-3 w-full py-2 px-3 bg-[#FAFAF8] hover:bg-[#A85420] hover:text-white text-[#171717] border border-[#E5E5E5] hover:border-[#A85420] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}