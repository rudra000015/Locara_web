'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Home, Store, MapPin, ShoppingBag, User } from 'lucide-react';

export default function ExplorerNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { navTo, cart, wishlist } = useStore();

  const totalCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  const TABS = [
    { id: 'home', icon: Home, label: 'Home', href: '/' },
    { id: 'shops', icon: Store, label: 'Shops', href: '/explorer/shops' },
    { id: 'map', icon: MapPin, label: 'Map', href: '/map' },
    { id: 'cart', icon: ShoppingBag, label: 'Cart', href: '/explorer/cart' },
    { id: 'profile', icon: User, label: 'Account', href: '/profile' },
  ];

  const handleTabClick = (tab: (typeof TABS)[0]) => {
    navTo(tab.id as any);
    router.push(tab.href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E5E5E5] px-2 py-1 shadow-md">
      <div className="flex items-center justify-around">
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
              className={`flex-1 flex flex-col items-center justify-center py-1.5 transition-colors ${
                isActive ? 'text-[#A85420] font-bold' : 'text-[#666666] hover:text-[#171717]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#A85420]' : 'text-current'}`} />
                {tab.id === 'cart' && totalCart > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#A85420] text-white font-bold text-[9px] flex items-center justify-center leading-none">
                    {totalCart}
                  </span>
                )}
                {tab.id === 'profile' && wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#DC2626]" />
                )}
              </div>
              <span className="text-[10px] mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
