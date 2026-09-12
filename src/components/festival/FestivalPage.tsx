'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Festival, FestivalOffer, getTimeUntilFestival } from '@/data/festivals';
import { useStore } from '@/store/useStore';
import {
  ChevronLeft,
  Sparkles,
  Clock,
  Store,
  Calendar,
  Share2,
  Tag,
  ArrowRight,
} from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

// ── Countdown Timer Component ───────────────────────────────────
function Countdown({ festival }: { festival: Festival }) {
  const [time, setTime] = useState(getTimeUntilFestival(festival));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeUntilFestival(festival)), 1000);
    return () => clearInterval(id);
  }, [festival]);

  if (time.expired) {
    return (
      <div className="text-center py-4">
        <p className="font-serif text-2xl font-bold text-[#C9A96E]">
          🎉 Festive Greetings for {festival.name}! 🎉
        </p>
      </div>
    );
  }

  const boxes = [
    { val: time.days, label: 'DAYS' },
    { val: time.hours, label: 'HOURS' },
    { val: time.minutes, label: 'MINS' },
    { val: time.seconds, label: 'SECS' },
  ];

  return (
    <div>
      <p className="text-center text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C9A96E] mb-3">
        FESTIVE COUNTDOWN
      </p>
      <div className="flex gap-2.5 justify-center">
        {boxes.map((b) => (
          <div
            key={b.label}
            className="p-3 sm:p-4 rounded-2xl bg-[#141414]/90 border border-[#C9A96E]/30 min-w-[64px] sm:min-w-[76px] text-center shadow-lg"
          >
            <p className="font-mono text-xl sm:text-2xl font-bold text-[#F5F5F5]">{b.val}</p>
            <p className="text-[9px] font-mono uppercase tracking-wider text-[#71717A] mt-0.5">
              {b.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FestivalPage({ festival }: { festival: Festival }) {
  const router = useRouter();
  const { openShop } = useStore();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${festival.name} Heritage Guide — Locara`,
        text: `Discover traditional preparations and verified heritage stores for ${festival.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Back Button */}
      <button
        onClick={() => router.push('/festival')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141414] border border-white/10 text-xs font-bold text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#1E1E1E] transition-all mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> All Cultural Festivals
      </button>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1C1C] via-[#121212] to-[#0A0A0A] border border-[#C9A96E]/30 p-8 sm:p-12 mb-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-4xl filter drop-shadow-md">{festival.emoji}</span>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/30">
              {festival.date}
            </span>
          </div>

          <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#C9A96E] mb-1">
            {festival.nameHindi}
          </p>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#F5F5F5] mb-3">
            {festival.name}
          </h1>

          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mb-8">
            {festival.tagline || festival.description}
          </p>

          <Countdown festival={festival} />
        </div>
      </div>

      {/* Cultural Traditions & Heritage Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 rounded-3xl bg-[#121212] border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#C9A96E]" />
            <h3 className="font-serif font-bold text-lg text-[#F5F5F5]">Traditional Significance</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
            {festival.description ||
              `A revered traditional occasion celebrated across generations. Local heritage sweet makers, fabric weavers, and craftsmen prepare exclusive seasonal items honoring age-old ancestral customs.`}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#121212] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="w-4 h-4 text-[#C9A96E]" />
              <h3 className="font-serif font-bold text-lg text-[#F5F5F5]">Share Cultural Guide</h3>
            </div>
            <p className="text-xs text-[#71717A] mb-4">
              Invite friends and family to explore Meerut&apos;s verified heritage stores for {festival.name}.
            </p>
          </div>

          <PremiumButton variant="secondary" size="md" onClick={handleShare}>
            Share Festival Guide
          </PremiumButton>
        </div>
      </div>

      {/* Verified Offers & Participating Stores */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#C9A96E]" />
            <h2 className="font-serif font-bold text-xl text-[#F5F5F5]">
              Featured Heritage Stores & Seasonal Specials ({festival.offers.length})
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {festival.offers.map((offer, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (offer.shopId) {
                  openShop(offer.shopId);
                  router.push(`/explorer/shop/${offer.shopId}`);
                }
              }}
              className="p-5 rounded-2xl bg-[#121212] hover:bg-[#161616] border border-white/[0.08] hover:border-[#C9A96E]/40 transition-all cursor-pointer shadow-sm group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-[#C9A96E] uppercase">
                    {offer.shopName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30">
                    {offer.discount}% OFF
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base text-[#F5F5F5] group-hover:text-[#C9A96E] transition-colors mb-1">
                  {offer.offerText}
                </h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">{offer.offerDetail}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-[#71717A]">
                <span>Valid during {festival.name} season</span>
                <span className="inline-flex items-center gap-1 font-bold text-[#F5F5F5] group-hover:text-[#C9A96E] transition-colors">
                  Visit Store <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
