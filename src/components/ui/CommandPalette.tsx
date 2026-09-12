'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { CATEGORIES } from '@/data/categories';
import { SHOPS } from '@/data/shops';
import { Search, Store, Compass, Heart, Calendar, MapPin, X, ArrowRight, Sparkles, ShoppingBag, Landmark } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectShop?: (shopId: string) => void;
}

export default function CommandPalette({ open, onOpenChange, onSelectShop }: CommandPaletteProps) {
  const router = useRouter();
  const { openShop, openMarket, navTo, addSearchHistory } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter items
  const matchingShops = SHOPS.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.addr.toLowerCase().includes(query.toLowerCase()) ||
      s.cat.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const matchingCategories = CATEGORIES.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const handleSelectShop = (shopId: string) => {
    addSearchHistory(query || 'Heritage Shop');
    openShop(shopId);
    onOpenChange(false);
    if (onSelectShop) {
      onSelectShop(shopId);
    } else {
      router.push(`/explorer/shop/${shopId}`);
    }
  };

  const handleSelectNav = (path: string, pageKey?: string) => {
    onOpenChange(false);
    if (pageKey) navTo(pageKey);
    router.push(path);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md transition-opacity duration-200" />
        <Dialog.Content className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[201] w-full max-w-xl p-0 overflow-hidden bg-[#17120E] border border-[#F6EAD7]/15 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] focus:outline-none animate-scale-in">
          {/* Header Search Bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F6EAD7]/10 bg-[#211A14]">
            <Search className="w-5 h-5 text-[#C8893F] shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shops, physical markets, silk sarees, sweets..."
              className="flex-1 bg-transparent text-sm text-[#F6EAD7] placeholder-[#9E8B75] outline-none font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-[#9E8B75] hover:text-[#F6EAD7] rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-[#9E8B75] bg-[#17120E] border border-[#F6EAD7]/10 rounded-lg">
              ESC
            </kbd>
          </div>

          {/* Body Results */}
          <div className="max-h-[400px] overflow-y-auto p-3 space-y-3 no-scrollbar">
            {/* Quick Actions / Navigation */}
            {!query && (
              <div className="space-y-1">
                <p className="px-3 pt-1 text-[10px] font-mono font-bold uppercase tracking-widest text-[#9E8B75]">
                  Instant Access
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1">
                  {[
                    { label: 'Explore Feed', path: '/explorer', icon: Compass, page: 'home' },
                    { label: 'Hyperlocal Map', path: '/explorer/map', icon: MapPin, page: 'map' },
                    { label: 'Bazaars & Markets', path: '/explorer', icon: Landmark, page: 'home' },
                    { label: '10% Reservations', path: '/explorer/reservations', icon: Calendar, page: 'reservations' },
                    { label: 'My Cart', path: '/explorer/cart', icon: ShoppingBag, page: 'cart' },
                    { label: 'Saved Gems', path: '/explorer/wishlist', icon: Heart, page: 'wishlist' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleSelectNav(item.path, item.page)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-[#D8C4A7] hover:text-[#F6EAD7] bg-[#211A14] hover:bg-[#2A2119] rounded-2xl border border-[#F6EAD7]/5 hover:border-[#C8893F]/30 transition-all text-left cursor-pointer"
                    >
                      <item.icon className="w-4 h-4 text-[#C8893F] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Categories */}
            {matchingCategories.length > 0 && (
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-[#9E8B75]">
                  Categories
                </p>
                {matchingCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onOpenChange(false);
                      router.push(`/explorer?category=${cat.id}`);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-[#F6EAD7] hover:bg-[#211A14] rounded-2xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 flex items-center justify-center text-[#C8893F]">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span>{cat.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9E8B75]" />
                  </button>
                ))}
              </div>
            )}

            {/* Matching Shops */}
            {matchingShops.length > 0 && (
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-[#9E8B75]">
                  Heritage Shops & Boutiques
                </p>
                {matchingShops.map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => handleSelectShop(shop.id)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-[#F6EAD7] hover:bg-[#211A14] rounded-2xl border border-transparent hover:border-[#C8893F]/20 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {shop.photos?.[0] ? (
                          <img src={shop.photos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-5 h-5 text-[#C8893F]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif font-bold text-sm text-[#F6EAD7] truncate group-hover:text-[#E0AF62] transition-colors">
                          {shop.name}
                        </p>
                        <p className="text-[11px] text-[#9E8B75] truncate">
                          {shop.addr.split(',')[0]} • {shop.age} Yrs Legacy
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#E0AF62] shrink-0 pl-2">
                      ⭐ {shop.rating.toFixed(1)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {query && matchingShops.length === 0 && matchingCategories.length === 0 && (
              <div className="py-10 text-center">
                <Store className="w-10 h-10 mx-auto text-[#736350] mb-2" />
                <p className="font-serif text-sm font-bold text-[#F6EAD7]">No heritage shops found</p>
                <p className="text-xs text-[#9E8B75] mt-0.5">Try searching with another neighborhood, city, or specialty</p>
              </div>
            )}
          </div>

          {/* Footer Navigation Hints */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#F6EAD7]/10 bg-[#211A14] text-[10px] font-mono text-[#9E8B75]">
            <div className="flex items-center gap-3">
              <span><strong className="text-[#F6EAD7]">ESC</strong> to close</span>
              <span><strong className="text-[#F6EAD7]">↵</strong> to select</span>
            </div>
            <span className="text-[#E0AF62] font-bold">LOCARA DIRECTORY</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
