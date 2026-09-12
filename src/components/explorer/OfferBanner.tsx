'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, ArrowRight, Tag } from 'lucide-react';
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
    badge: 'HERITAGE FLASH SALE',
    shopName: 'Agarwal Sweets',
    description: 'Kaju Katli & Royal Gulab Jamun Box',
    icon: '🍬',
    mrp: 489,
    price: 360,
    discountLabel: '25% OFF',
    tags: ['Pure Desi Ghee', 'Limited Batch'],
  },
  {
    id: 'd2',
    badge: 'CRAFTSMAN SPECIAL',
    shopName: 'Ram Lal Halwai',
    description: 'Special Gur Gajak & Til Rewri Combo',
    icon: '🥜',
    mrp: 240,
    price: 169,
    discountLabel: '30% OFF',
    tags: ['Winter Heritage', 'Organic Jaggery'],
  },
  {
    id: 'd3',
    badge: 'ARTISANAL WEAVE',
    shopName: 'Kashi Silk House',
    description: 'Handcrafted Banarasi Silk Dupatta',
    icon: '🥻',
    mrp: 1850,
    price: 1399,
    discountLabel: '24% OFF',
    tags: ['Zari Work', 'Certified Heritage'],
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
          <div className="w-6 h-6 rounded-lg bg-[#C9A96E]/15 border border-[#C9A96E]/30 flex items-center justify-center">
            <Tag className="w-3.5 h-3.5 text-[#C9A96E]" />
          </div>
          <h2 className="font-serif font-bold text-base sm:text-lg text-[#F5F5F5]">
            Curated Heritage Deals
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161616] border border-white/10 text-xs font-mono text-[#C9A96E]">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span>Ends in {formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Cards Scroll */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {DEALS.map((deal, idx) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            className="w-72 sm:w-80 shrink-0 p-4 rounded-2xl bg-[#121212] hover:bg-[#161616] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/20">
                  {deal.badge}
                </span>
                <span className="text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full border border-[#22c55e]/20">
                  {deal.discountLabel}
                </span>
              </div>

              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#1C1C1C] border border-white/5 flex items-center justify-center text-xl shrink-0">
                  {deal.icon}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#F5F5F5] group-hover:text-[#C9A96E] transition-colors leading-tight">
                    {deal.shopName}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] line-clamp-1 mt-0.5">{deal.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {deal.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-[#71717A] border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-base font-bold text-[#C9A96E]">
                  ₹{deal.price.toLocaleString('en-IN')}
                </span>
                {deal.mrp && (
                  <span className="text-xs text-[#71717A] line-through">₹{deal.mrp}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => router.push('/explorer')}
                className="flex items-center gap-1 text-xs font-bold text-[#F5F5F5] group-hover:text-[#C9A96E] transition-colors"
              >
                Claim Deal <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}