'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tag, Flame, Gift, ArrowRight, Store, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props {
  offer: {
    id: string;
    shopId: string;
    shopName: string;
    title: string;
    description: string;
    discountType: string;
    discountValue: number;
    badgeText: string;
    flashSale?: boolean;
  };
  index: number;
}

export default function OfferCard({ offer, index }: Props) {
  const router = useRouter();
  const { openShop } = useStore();

  const isFlash = Boolean(offer.flashSale);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      onClick={() => {
        openShop(offer.shopId);
        router.push(`/explorer/shop/${offer.shopId}`);
      }}
      className={`group shrink-0 w-64 sm:w-72 rounded-3xl border p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl ${
        isFlash
          ? 'bg-gradient-to-br from-[#26160F] to-[#17120E] border-[#C8893F]/40 hover:border-[#C8893F]/80 hover:shadow-glow'
          : 'bg-[#1B140F] border-[#F6EAD7]/10 hover:border-[#1E5544]/60'
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center gap-1 ${
              isFlash
                ? 'bg-[#C8893F]/20 text-[#E0AF62] border border-[#C8893F]/40'
                : 'bg-[#1E5544]/20 text-[#2D7D64] border border-[#1E5544]/40'
            }`}
          >
            {isFlash ? <Flame className="w-3 h-3 text-[#E0AF62]" /> : <Gift className="w-3 h-3 text-[#2D7D64]" />}
            {offer.badgeText}
          </span>
        </div>

        <p className="text-[10px] font-mono uppercase tracking-wider text-[#9E8B75] flex items-center gap-1">
          <Store className="w-3 h-3 text-[#C8893F]" />
          {offer.shopName}
        </p>

        <h3 className="font-serif text-lg font-bold text-[#F6EAD7] group-hover:text-[#E0AF62] transition-colors leading-tight mt-1">
          {offer.title}
        </h3>

        <p className="text-[11px] text-[#9E8B75] line-clamp-2 mt-2 leading-relaxed">
          {offer.description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-[#F6EAD7]/10 flex items-center justify-between">
        <span className="text-xs font-bold text-[#E0AF62] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Claim in Store <ArrowRight className="w-3.5 h-3.5" />
        </span>
        <span className="text-[10px] font-mono text-[#D8C4A7] font-bold">10% ADVANCE</span>
      </div>
    </motion.div>
  );
}
