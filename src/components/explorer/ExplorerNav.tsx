'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Compass, MapPin, CalendarCheck, ShoppingBag, User, Heart } from 'lucide-react';

export default function ExplorerNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentPage, navTo, cart, wishlist } = useStore();

  const totalCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  const TABS = [
    { id: 'home', icon: Compass, label: 'Discover' },
    { id: 'map', icon: MapPin, label: 'Live Map' },
    { id: 'reservations', icon: CalendarCheck, label: 'Reservations' },
    { id: 'cart', icon: ShoppingBag, label: 'Cart' },
    { id: 'profile', icon: User, label: 'Account' },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden w-[calc(100%-2rem)] max-w-md safe-area-bottom">
      <div className="bg-[#17120E]/94 backdrop-blur-2xl border border-[#F6EAD7]/10 rounded-3xl p-1.5 shadow-[0_14px_40px_rgba(0,0,0,0.85)] flex items-center justify-between">
        {TABS.map(({ id, icon: Icon, label }) => {
          const isActive = currentPage === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => navTo(id)}
              aria-label={label}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive ? 'bg-[#211A14] text-[#E0AF62] shadow-sm' : 'text-[#9E8B75] hover:text-[#F6EAD7]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C8893F]' : 'text-current'}`} />
                {id === 'cart' && totalCart > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-3.5 px-0.5 rounded-full bg-[#C8893F] text-[#0E0B08] font-black text-[8px] flex items-center justify-center leading-none">
                    {totalCart}
                  </span>
                )}
                {id === 'profile' && wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C24136]" />
                )}
              </div>
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
