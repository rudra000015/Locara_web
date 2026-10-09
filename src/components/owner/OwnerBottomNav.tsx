'use client';

import { useStore, OwnerPage } from '@/store/useStore';
import { LayoutDashboard, ShoppingBag, Calendar, BarChart3, Settings } from 'lucide-react';

export default function OwnerBottomNav() {
  const { ownerPage, ownerNavTo } = useStore();

  const TABS: Array<{ id: OwnerPage; icon: any; label: string }> = [
    { id: 'showcase', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products', icon: ShoppingBag, label: 'Products' },
    { id: 'reservations', icon: Calendar, label: 'Orders' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'profile', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E5E5E5] px-2 py-1 shadow-md">
      <div className="flex items-center justify-around">
        {TABS.map(({ id, icon: Icon, label }) => {
          const isActive = ownerPage === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => ownerNavTo(id)}
              aria-label={label}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 transition-colors ${
                isActive ? 'text-[#A85420] font-bold' : 'text-[#666666] hover:text-[#171717]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#A85420]' : 'text-current'}`} />
              <span className="text-[10px] mt-1">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
