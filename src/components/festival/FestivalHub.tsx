'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FESTIVALS } from '@/data/festivals';
import { Sparkles, Calendar, ArrowRight, Store, Gift, Flame, Heart } from 'lucide-react';
import FadeIn from '@/components/motion/FadeIn';

interface FestivalHubProps {
  onNavigate?: (slug: string) => void;
}

export default function FestivalHub({ onNavigate }: FestivalHubProps = {}) {
  const router = useRouter();
  const [selectedFestival, setSelectedFestival] = useState(FESTIVALS[0]?.slug || 'diwali');

  const activeFest = FESTIVALS.find((f) => f.slug === selectedFestival) || FESTIVALS[0];

  const festivalTabs = [
    { id: 'diwali', label: 'Diwali', icon: '🪔' },
    { id: 'eid', label: 'Eid', icon: '🌙' },
    { id: 'holi', label: 'Holi', icon: '🎨' },
    { id: 'navratri', label: 'Navratri', icon: '🌸' },
    { id: 'raksha-bandhan', label: 'Raksha Bandhan', icon: '🧵' },
  ];

  const handleSelectFestival = (slug: string) => {
    if (onNavigate) {
      onNavigate(slug);
    } else {
      router.push(`/festivals/${slug}`);
    }
  };

  return (
    <div className="py-4 pb-20 space-y-10">
      {/* Hero Banner matching Mockup Screen 12 */}
      <div className="relative rounded-3xl bg-[#14100C] border border-[#C8893F]/30 p-8 sm:p-12 shadow-2xl overflow-hidden min-h-[420px] flex flex-col justify-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1600&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0806] via-[#0A0806]/80 to-black/40" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18130E]/80 border border-[#C8893F]/40 backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#E0AF62]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#E0AF62]">
              CULTURAL HERITAGE CALENDAR
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-black text-[#FAF4EB] mb-3 leading-tight">
            Festivals Bring Us Closer
          </h1>
          <p className="text-xs sm:text-base text-[#D8C4A7] leading-relaxed mb-6 font-serif italic">
            Celebrate traditions. Support local artisans. Discover traditional festive delicacies, bespoke ethnic wear, and handcrafted home decor near you.
          </p>

          <button
            type="button"
            onClick={() => handleSelectFestival(activeFest.slug)}
            className="btn-gold"
          >
            <span>Explore {activeFest.name} Festive Specials</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Festival Navigation Tabs matching Mockup Screen 12 */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {festivalTabs.map((tab) => {
          const isSelected = selectedFestival === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedFestival(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${isSelected
                  ? 'bg-[#C8893F] text-[#0E0B08] shadow-md shadow-[#C8893F]/20'
                  : 'bg-bg-pill text-fg-secondary hover:text-fg hover:bg-bg-pillHover border border-border'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Festival Spotlight */}
      <div className="p-6 sm:p-10 rounded-3xl bg-bg-card border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{activeFest.emoji}</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-fg-heading">
                {activeFest.name} Celebrations
              </h2>
            </div>
            <p className="text-xs text-fg-muted font-mono">{activeFest.date}</p>
          </div>

          <button
            type="button"
            onClick={() => handleSelectFestival(activeFest.slug)}
            className="px-4 py-2 rounded-full bg-[#54512d] text-[#ffffff] text-xs font-bold self-start sm:self-auto hover:bg-[#3f3d22] transition-colors"
          >
            View Festival Guide →
          </button>
        </div>

        <p className="text-xs sm:text-sm text-fg-secondary leading-relaxed">
          {activeFest.description}
        </p>

        {/* Festive Collections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border">
          {activeFest.offers.map((off, i) => (
            <div
              key={i}
              onClick={() => handleSelectFestival(activeFest.slug)}
              className="p-4 rounded-2xl bg-bg-subtle border border-border hover:border-[#C8893F] transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div>
                <p className="text-[10px] font-mono uppercase text-[#C8893F] font-bold">
                  {off.shopName}
                </p>
                <h4 className="font-serif text-sm font-bold text-fg-heading mt-0.5 group-hover:text-[#54512d] transition-colors">
                  {off.offerText}
                </h4>
                <p className="text-xs text-[#54512d] font-bold mt-1 font-mono">{off.discount}% OFF</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#C8893F] shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
