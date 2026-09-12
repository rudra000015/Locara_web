'use client';

import Link from 'next/link';
import { Compass, Store, Home } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0E0B08] text-[#F6EAD7] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#17120E] border border-[#F6EAD7]/10 rounded-3xl p-8 text-center shadow-2xl space-y-6 animate-scale-in">
        <div className="w-16 h-16 rounded-3xl bg-[#211A14] border border-[#C8893F]/30 flex items-center justify-center mx-auto text-[#E0AF62] shadow-glow-sm">
          <Compass className="w-8 h-8 text-[#C8893F]" />
        </div>

        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
            404 • UNCHARTED TERRITORY
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#F6EAD7] mt-1">
            Page Not Found
          </h1>
          <p className="text-xs text-[#9E8B75] mt-2 leading-relaxed">
            The heritage shop, collection, or route you are searching for is not charted on the map.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/explorer" className="flex-1">
            <PremiumButton variant="gold" size="md" icon={Compass} className="w-full">
              Explore Shops
            </PremiumButton>
          </Link>
          <Link href="/" className="flex-1">
            <button className="w-full py-3 rounded-2xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-xs font-bold text-[#D8C4A7] hover:text-[#F6EAD7] transition-all cursor-pointer flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
