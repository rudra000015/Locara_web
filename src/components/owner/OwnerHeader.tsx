'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Store, Compass, LogOut, Sparkles } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

export default function OwnerHeader({ shopName }: { shopName: string }) {
  const router = useRouter();
  const { user, logout, navTo, ownerPage, ownerNavTo } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-[#0E0B08]/92 backdrop-blur-2xl border-b border-[#F6EAD7]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Store Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-[#1E5544]/30 border border-[#1E5544]/60 flex items-center justify-center text-[#2D7D64] shrink-0 shadow-glow-emerald">
            <Store className="w-5 h-5 text-[#2D7D64]" />
          </div>
          <div className="min-w-0">
            <p className="font-serif text-base font-bold text-[#F6EAD7] truncate leading-tight">
              {shopName}
            </p>
            <p className="text-[9px] font-mono uppercase tracking-widest text-[#E0AF62]">
              MERCHANT CONSOLE • LOCARA
            </p>
          </div>
        </div>

        {/* Desktop Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#17120E] p-1 rounded-2xl border border-[#F6EAD7]/10">
          {(
            [
              { id: 'showcase', label: 'Dashboard' },
              { id: 'reservations', label: 'Reservations' },
              { id: 'addproduct', label: 'Products' },
              { id: 'collections', label: 'Collections' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'profile', label: 'Profile' },
            ] as const
          ).map((tab) => {
            const isActive = ownerPage === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => ownerNavTo(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#211A14] text-[#E0AF62] shadow-sm'
                    : 'text-[#9E8B75] hover:text-[#F6EAD7]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              navTo('home');
              router.push('/explorer');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#17120E] hover:bg-[#211A14] border border-[#F6EAD7]/10 text-xs font-bold text-[#D8C4A7] hover:text-[#F6EAD7] transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#C8893F]" />
            <span className="hidden lg:inline">Explorer View</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/');
            }}
            title="Sign Out"
            className="px-3 py-2 rounded-xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-xs font-bold text-[#C24136] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
