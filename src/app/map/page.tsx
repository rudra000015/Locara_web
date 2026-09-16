'use client';

import ExplorerHeader from '@/components/explorer/ExplorerHeader';
import ExplorerNav from '@/components/explorer/ExplorerNav';
import MapPage from '@/components/explorer/MapPage';
import { useState } from 'react';
import { DEFAULT_FILTERS, FilterState } from '@/data/categories';
import { getDefaultCity } from '@/lib/cities';
import Toast from '@/components/ui/Toast';
import { useShops } from '@/hooks/useShops';
import { Shop } from '@/types/shop';

export default function MapRoute() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedCity, setSelectedCity] = useState(getDefaultCity().name);
  const [useGps, setUseGps] = useState(false);

  const { shops, loading, error, refetch, userLocation } = useShops({
    radius: 10000,
    city: selectedCity,
    autoGps: useGps,
  });

  const handleStartNavigation = (shop: Shop) => {
    if (!shop.loc || shop.loc.length !== 2) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${shop.loc[0]},${shop.loc[1]}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="min-h-screen bg-bg text-fg">
      <ExplorerHeader
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={setFilters}
        totalResults={shops.length}
        onRefetch={refetch}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        onUseGps={() => setUseGps(true)}
      />
      <main className="h-[calc(100vh-120px)] w-full">
        <MapPage
          city={selectedCity}
          query={query}
          shops={shops}
          loading={loading}
          error={error}
          userLocation={userLocation}
          onRefetch={refetch}
          onStartNavigation={handleStartNavigation}
        />
      </main>
      <ExplorerNav />
      <Toast />
    </div>
  );
}
