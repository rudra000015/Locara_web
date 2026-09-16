'use client';

import React from 'react';
import ShopShutter from '@/components/ui/ShopShutter';
import HomePage from '@/components/explorer/HomePage';
import ExplorerHeader from '@/components/explorer/ExplorerHeader';
import ExplorerNav from '@/components/explorer/ExplorerNav';
import Toast from '@/components/ui/Toast';
import { useShops } from '@/hooks/useShops';
import { DEFAULT_FILTERS } from '@/data/categories';

export default function ShutterLandingPage() {
  const { shops, loading, error, refetch } = useShops({
    radius: 5000,
    city: 'Bangalore',
    autoGps: false,
  });

  return (
    <ShopShutter forceOpen={false}>
      <div className="min-h-screen bg-[#faf9f4] text-[#1b1c19]">
        <ExplorerHeader
          query=""
          onQueryChange={() => {}}
          filters={DEFAULT_FILTERS}
          onFiltersChange={() => {}}
          totalResults={shops.length}
          onRefetch={refetch}
          selectedCity="Bangalore"
          onCityChange={() => {}}
          onUseGps={() => {}}
        />
        <main className="max-w-7xl mx-auto px-4 pt-4 pb-28">
          <HomePage
            query=""
            filters={DEFAULT_FILTERS}
            shops={shops}
            loading={loading}
            error={error}
            refetch={refetch}
            onListShop={() => {}}
          />
        </main>
        <ExplorerNav />
        <Toast />
      </div>
    </ShopShutter>
  );
}
