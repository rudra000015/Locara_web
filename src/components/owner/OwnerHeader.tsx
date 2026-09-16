'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Store, Compass, LogOut, Sparkles } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function OwnerHeader({ shopName }: { shopName: string }) {
  const router = useRouter();
  const { user, logout, navTo, ownerPage, ownerNavTo } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-bg-header backdrop-blur-2xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Store Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-serif text-base font-bold text-fg-heading truncate leading-tight">
              {shopName}
            </p>
            <p className="text-[9px] font-mono uppercase tracking-widest text-primary font-bold">
              MERCHANT CONSOLE • LOCARA
            </p>
          </div>
        </div>

        {/* Desktop Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-bg-card p-1 rounded-2xl border border-border">
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
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-fg-secondary hover:text-fg hover:bg-bg-pill'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => {
              navTo('home');
              router.push('/explorer');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bg-card hover:bg-bg-cardHover border border-border text-xs font-bold text-fg-secondary hover:text-fg transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span className="hidden lg:inline">Explorer View</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/');
            }}
            title="Sign Out"
            className="px-3 py-2 rounded-xl bg-bg-card hover:bg-bg-cardHover border border-border text-xs font-bold text-rose-500 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
