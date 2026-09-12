'use client';

import { Sparkles, Flame, Gift, Tag, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function FlashSaleTicker() {
  const router = useRouter();
  const { navTo } = useStore();

  const tickerItems = [
    { icon: Flame, text: '🔥 Flash Sale — Up to 40% Off on Selected Heritage Mithai', tag: 'Flash' },
    { icon: Sparkles, text: '✦ Wedding Edit 2026 — Bespoke Zari Silk & Sherwani Collections', tag: 'New' },
    { icon: Gift, text: '🎁 Opening Offers — Flat ₹250 Reservation Bonus at New Boutiques', tag: 'Special' },
    { icon: Tag, text: '⭐ Verified Store Footfall — Reserve Online for Instant In-Store Pickup', tag: 'Reserve' },
  ];

  return (
    <div className="relative overflow-hidden bg-[#1B140F] border-y border-[#F6EAD7]/10 py-2.5 my-6">
      <div className="flex w-max animate-ticker items-center gap-12 whitespace-nowrap">
        {[...tickerItems, ...tickerItems].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 text-xs font-semibold text-[#D8C4A7] hover:text-[#F6EAD7] cursor-pointer transition-colors"
              onClick={() => {
                const el = document.getElementById('offers-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else navTo('home');
              }}
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#C8893F]/15 text-[#E0AF62]">
                <Icon className="w-3 h-3" />
              </span>
              <span>{item.text}</span>
              <span className="text-[10px] font-mono text-[#C8893F] font-bold">✦ EXPLORE</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
