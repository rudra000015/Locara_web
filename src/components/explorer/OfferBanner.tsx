'use client';

import React, { useEffect, useState } from 'react';
import { Clock, ArrowRight, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DealCard {
  id: string;
  badge: string;
  shopName: string;
  description: string;
  icon: string;
  mrp?: number;
  price: number;
  discountLabel?: string;
  tags?: string[];
}

const DEALS: DealCard[] = [
  {
    id: 'd1',
    badge: 'FLASH SALE',
    shopName: 'Sharma Handicrafts',
    description: 'Decorative Brass Table Lamp',
    icon: '🪔',
    mrp: 1500,
    price: 1200,
    discountLabel: '20% OFF',
    tags: ['Handcrafted', 'Brassware'],
  },
  {
    id: 'd2',
    badge: 'TOP OFFER',
    shopName: 'Taste of India',
    description: 'Special Pure Desi Ghee Sweets Box',
    icon: '🍬',
    mrp: 450,
    price: 360,
    discountLabel: '20% OFF',
    tags: ['Pure Ghee', 'Fresh Daily'],
  },
  {
    id: 'd3',
    badge: 'WEEKEND SPECIAL',
    shopName: 'Style Hub',
    description: 'Pure Cotton Embroidered Kurta',
    icon: '👕',
    mrp: 1299,
    price: 899,
    discountLabel: '30% OFF',
    tags: ['Ethnic Wear', 'Pure Cotton'],
  },
];

export default function OfferBanner() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(3 * 3600 + 42 * 60 + 15);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#A85420]/10 border border-[#A85420]/20 flex items-center justify-center">
            <Tag className="w-3.5 h-3.5 text-[#A85420]" />
          </div>
          <h2 className="font-bold text-base sm:text-lg text-[#171717]">
            Special Local Deals & Offers
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F4F0] border border-[#E5E5E5] text-xs font-bold text-[#A85420]">
          <Clock className="w-3.5 h-3.5" />
          <span>Ends in {formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Cards Scroll */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEALS.map((deal) => (
          <div
            key={deal.id}
            className="p-4 rounded-xl bg-white border border-[#E5E5E5] hover:border-[#A85420]/40 transition-all duration-200 shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#A85420]/10 text-[#A85420]">
                  {deal.badge}
                </span>
                <span className="text-[10px] font-bold text-[#16803C] bg-[#16803C]/10 px-2 py-0.5 rounded">
                  {deal.discountLabel}
                </span>
              </div>

              <div className="flex items-start gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] flex items-center justify-center text-xl shrink-0">
                  {deal.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#171717] group-hover:text-[#A85420] transition-colors leading-tight">
                    {deal.shopName}
                  </h3>
                  <p className="text-xs text-[#666666] line-clamp-1 mt-0.5">{deal.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {deal.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-[#F5F4F0] text-[10px] font-medium text-[#666666] border border-[#E5E5E5]"
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5]">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold text-[#171717]">
                  ₹{deal.price.toLocaleString('en-IN')}
                </span>
                {deal.mrp && (
                  <span className="text-xs text-[#8A8A8A] line-through">₹{deal.mrp}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => router.push('/shops')}
                className="flex items-center gap-1 text-xs font-bold text-[#A85420] hover:text-[#873F17] transition-colors cursor-pointer"
              >
                View Offer <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}