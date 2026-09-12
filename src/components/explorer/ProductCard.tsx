'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Heart, Sparkles, Store } from 'lucide-react';
import { prodImg } from '@/utils/prodImg';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    mrp?: number;
    unit?: string;
    images?: string[];
    image?: string;
    isNew?: boolean;
    isFeatured?: boolean;
    isPopular?: boolean;
    cat?: string;
    shopId?: string;
  };
  shopId?: string;
  shopName?: string;
  imgIndex?: number;
  showNew?: boolean;
}

export default function ProductCard({
  product: p,
  shopId,
  shopName = 'Heritage Shop',
  imgIndex = 0,
  showNew = true,
}: ProductCardProps) {
  const router = useRouter();
  const { toggleWish, isWished, viewProduct } = useStore();
  const activeShopId = shopId || p.shopId || 'unknown';
  const wished = isWished(activeShopId, p.id);

  const imgSrc =
    p.images?.[0] ||
    p.image ||
    prodImg(p.cat || 'sweets', imgIndex);

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
        category: p.cat,
      },
      shopName
    );
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleCardClick}
      className="group relative rounded-2xl bg-[#121212] hover:bg-[#161616] border border-white/[0.08] hover:border-white/[0.18] overflow-hidden transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
    >
      {/* Product Image */}
      <div className="h-32 sm:h-36 relative overflow-hidden bg-[#181818]">
        <img
          src={imgSrc}
          alt={p.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-80" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {(p.isNew || showNew) && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C9A96E] text-[#080808] flex items-center gap-1 shadow-glow-sm">
              <Sparkles className="w-2.5 h-2.5" /> NEW
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlist}
          title={wished ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:scale-110 transition-all"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              wished ? 'text-[#ef4444] fill-[#ef4444]' : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <p className="text-[10px] font-mono text-[#71717A] uppercase truncate tracking-wider mb-0.5">
            {shopName}
          </p>
          <h4 className="font-serif font-bold text-xs sm:text-sm text-[#F5F5F5] group-hover:text-[#C9A96E] transition-colors line-clamp-1 mb-2">
            {p.name}
          </h4>
        </div>

        <div className="flex items-baseline justify-between pt-2 border-t border-white/5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-sm font-bold text-[#C9A96E]">
              ₹{p.price.toLocaleString('en-IN')}
            </span>
            {p.mrp && p.mrp > p.price && (
              <span className="text-[10px] text-[#71717A] line-through font-mono">
                ₹{p.mrp}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#71717A]">{p.unit || 'unit'}</span>
        </div>
      </div>
    </motion.div>
  );
}