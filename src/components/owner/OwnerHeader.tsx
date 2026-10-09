'use client';

import React from 'react';
import Image from 'next/image';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Store, Compass, LogOut, LayoutDashboard, ShoppingBag, Calendar, BarChart3, Settings } from 'lucide-react';

export default function OwnerHeader({ shopName }: { shopName: string }) {
  const router = useRouter();
  const { user, logout, navTo, ownerPage, ownerNavTo } = useStore();

  const NAV_ITEMS = [
    { id: 'showcase', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Shop Settings', icon: Settings },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Store Name */}
        <div className="flex items-center gap-3 shrink-0">
          <Image src="/locara-mark.svg" alt="Locara" width={36} height={36} className="shrink-0" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-[#171717]">
                {shopName || 'Sharma Handicrafts'}
              </span>
              <span className="text-[10px] font-bold bg-[#FBF3EE] text-[#A85420] px-1.5 py-0.2 rounded border border-[#F5DECD]">
                Merchant
              </span>
            </div>
            <p className="text-[11px] text-[#8A8A8A]">
              Locara Merchant Portal
            </p>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F5F4F0] p-1 rounded-lg border border-[#E5E5E5]">
          {NAV_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const isActive = ownerPage === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => ownerNavTo(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-[#A85420] shadow-sm'
                    : 'text-[#666666] hover:text-[#171717]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              navTo('home');
              router.push('/');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F5F4F0] border border-[#E5E5E5] text-xs font-semibold text-[#171717] transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-[#A85420]" />
            <span className="hidden sm:inline">Customer View</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/auth');
            }}
            title="Sign Out"
            className="p-2 text-[#8A8A8A] hover:text-[#DC2626] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
