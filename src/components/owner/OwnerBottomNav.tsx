'use client';

import { useStore, OwnerPage } from '@/store/useStore';
import { LayoutDashboard, ShoppingBag, CalendarCheck, Sparkles, BarChart3, Settings } from 'lucide-react';

export default function OwnerBottomNav() {
  const { ownerPage, ownerNavTo } = useStore();

  const TABS: Array<{ id: OwnerPage; icon: any; label: string }> = [
    { id: 'showcase', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'addproduct', icon: ShoppingBag, label: 'Products' },
    { id: 'reservations', icon: CalendarCheck, label: 'Reservations' },
    { id: 'collections', icon: Sparkles, label: 'Collections' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'profile', icon: Settings, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden w-[calc(100%-2rem)] max-w-lg safe-area-bottom">
      <div className="bg-[#17120E]/94 backdrop-blur-2xl border border-[#F6EAD7]/10 rounded-3xl p-1.5 shadow-[0_14px_40px_rgba(0,0,0,0.85)] flex items-center justify-between">
        {TABS.map(({ id, icon: Icon, label }) => {
          const isActive = ownerPage === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => ownerNavTo(id)}
              aria-label={label}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive ? 'bg-[#211A14] text-[#E0AF62] shadow-sm' : 'text-[#9E8B75] hover:text-[#F6EAD7]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#C8893F]' : 'text-current'}`} />
              <span className="text-[9px] font-bold mt-1 tracking-tight">{label}</span>

              {isActive && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#C8893F] shadow-glow" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
