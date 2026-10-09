'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Gift, ArrowRight, Store } from 'lucide-react';
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

export default function OfferCard({ offer }: Props) {
  const router = useRouter();
  const { openShop } = useStore();

  const isFlash = Boolean(offer.flashSale);

  return (
    <div
      onClick={() => {
        openShop(offer.shopId);
        router.push(`/explorer/shop/${offer.shopId}`);
      }}
      className={`group shrink-0 w-64 sm:w-72 rounded-xl border p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md bg-white ${
        isFlash
          ? 'border-[#A85420]/40 hover:border-[#A85420]'
          : 'border-[#E5E5E5] hover:border-[#A85420]/40'
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
              isFlash
                ? 'bg-[#A85420]/10 text-[#A85420]'
                : 'bg-[#16803C]/10 text-[#16803C]'
            }`}
          >
            {isFlash ? <Flame className="w-3 h-3 text-[#A85420]" /> : <Gift className="w-3 h-3 text-[#16803C]" />}
            {offer.badgeText}
          </span>
        </div>

        <p className="text-[11px] font-semibold text-[#666666] flex items-center gap-1">
          <Store className="w-3 h-3 text-[#A85420]" />
          {offer.shopName}
        </p>

        <h3 className="text-sm font-bold text-[#171717] group-hover:text-[#A85420] transition-colors leading-tight mt-1">
          {offer.title}
        </h3>

        <p className="text-xs text-[#666666] line-clamp-2 mt-1.5 leading-relaxed">
          {offer.description}
        </p>
      </div>

      <div className="mt-4 pt-2.5 border-t border-[#E5E5E5] flex items-center justify-between">
        <span className="text-xs font-bold text-[#A85420] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          Claim at Shop <ArrowRight className="w-3.5 h-3.5" />
        </span>
        <span className="text-[10px] font-bold text-[#666666]">10% Deposit</span>
      </div>
    </div>
  );
}
