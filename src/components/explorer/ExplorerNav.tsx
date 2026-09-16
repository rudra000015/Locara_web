'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Compass, MapPin, CalendarCheck, ShoppingBag, User } from 'lucide-react';

export default function ExplorerNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentPage, navTo, cart, wishlist } = useStore();

  const totalCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  const TABS = [
    { id: 'home', icon: Compass, label: 'Discover', href: '/' },
    { id: 'map', icon: MapPin, label: 'Walking Map', href: '/map' },
    { id: 'reservations', icon: CalendarCheck, label: 'Passes', href: '/reservations' },
    { id: 'cart', icon: ShoppingBag, label: 'Drops', href: '/products' },
    { id: 'profile', icon: User, label: 'Passport', href: '/profile' },
  ];

  const handleTabClick = (tab: typeof TABS[0]) => {
    navTo(tab.id as any);
    router.push(tab.href);
  };

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden w-[calc(100%-1.5rem)] max-w-md pointer-events-auto">
      <div className="bg-[#ffffff]/95 backdrop-blur-xl border border-[rgba(72,55,47,0.12)] rounded-full p-1.5 shadow-[0_12px_32px_-4px_rgba(72,55,47,0.15)] flex items-center justify-between">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname === tab.href ||
            (tab.href !== '/' && pathname.startsWith(tab.href)) ||
            (pathname === '/' && tab.id === 'home');

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab)}
              aria-label={tab.label}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#48372f] text-[#faf9f4] shadow-sm font-bold'
                  : 'text-[#6e5a51] hover:text-[#1b1c19]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#faf9f4]' : 'text-current'}`} />
                {tab.id === 'cart' && totalCart > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-3.5 px-0.5 rounded-full bg-[#ba1a1a] text-white font-black text-[8px] flex items-center justify-center leading-none shadow-sm">
                    {totalCart}
                  </span>
                )}
                {tab.id === 'profile' && wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#805e6d]" />
                )}
              </div>
              <span className="text-[9px] font-semibold mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
