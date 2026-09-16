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
      className="group relative rounded-2xl bg-bg-card hover:bg-bg-cardHover border border-border hover:border-border-active overflow-hidden transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
    >
      {/* Product Image */}
      <div className="h-32 sm:h-36 relative overflow-hidden bg-bg-subtle">
        <img
          src={imgSrc}
          alt={p.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent opacity-80" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {(p.isNew || showNew) && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary text-white flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5" /> NEW
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlist}
          title={wished ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-bg-card/85 backdrop-blur-md border border-border flex items-center justify-center text-fg hover:scale-110 transition-all"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              wished ? 'text-rose-500 fill-rose-500' : 'text-fg-muted'
            }`}
          />
        </button>
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <p className="text-[10px] font-mono text-fg-muted uppercase truncate tracking-wider mb-0.5">
            {shopName}
          </p>
          <h4 className="font-serif font-bold text-xs sm:text-sm text-fg-heading group-hover:text-primary transition-colors line-clamp-1 mb-2">
            {p.name}
          </h4>
        </div>

        <div className="flex items-baseline justify-between pt-2 border-t border-border">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-sm font-bold text-primary">
              ₹{p.price.toLocaleString('en-IN')}
            </span>
            {p.mrp && p.mrp > p.price && (
              <span className="text-[10px] text-fg-muted line-through font-mono">
                ₹{p.mrp}
              </span>
            )}
          </div>
          <span className="text-[10px] text-fg-muted">{p.unit || 'unit'}</span>
        </div>
      </div>
    </motion.div>
  );
}