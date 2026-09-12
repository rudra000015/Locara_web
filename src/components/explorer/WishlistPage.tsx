'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useT } from '@/i18n/useT';
import { SHOPS } from '@/data/shops';
import { prodImg } from '@/utils/prodImg';
import { Heart, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, toggleWish, viewProduct } = useStore();
  const t = useT();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-28">
        <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-center text-[#71717A] mx-auto mb-4">
          <Heart className="w-7 h-7" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-[#F5F5F5] mb-2">
          {t('wishlist_empty_title')}
        </h3>
        <p className="text-xs text-[#71717A] mb-6 leading-relaxed">
          {t('wishlist_empty_sub')}
        </p>
        <PremiumButton
          variant="gold"
          size="md"
          onClick={() => router.push('/explorer')}
          showArrow
          magnetic
        >
          {t('wishlist_explore')}
        </PremiumButton>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-[#ef4444] fill-[#ef4444]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
              SAVED TREASURES
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F5F5]">
            My Heritage Wishlist
          </h1>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#181818] border border-white/10 text-[#C9A96E]">
          {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {wishlist.map((w, i) => {
          const shop = SHOPS.find((s) => s.id === w.shopId);
          const product = shop?.products.find((p) => p.id === w.prodId);

          return (
            <div
              key={`${w.shopId}-${w.prodId}`}
              onClick={() => {
                viewProduct(w.shopId, w.prodId);
                router.push(`/explorer/product/${w.shopId}/${w.prodId}`);
              }}
              className="group relative rounded-2xl bg-[#121212] hover:bg-[#161616] border border-white/[0.08] hover:border-white/[0.18] overflow-hidden transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
            >
              {/* Image */}
              <div className="aspect-square bg-[#181818] relative overflow-hidden">
                <img
                  src={prodImg(w.name, i)}
                  alt={w.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product) toggleWish(w.shopId, w.prodId, product, w.shopName);
                  }}
                  title="Remove from saved"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-all shadow-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Info */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase text-[#71717A] tracking-wider truncate mb-1">
                    {w.shopName}
                  </p>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[#F5F5F5] group-hover:text-[#C9A96E] transition-colors line-clamp-1 mb-2">
                    {w.name}
                  </h4>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-white/5 font-mono">
                  <span className="text-sm font-bold text-[#C9A96E]">
                    ₹{w.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-[#71717A]">/{w.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
