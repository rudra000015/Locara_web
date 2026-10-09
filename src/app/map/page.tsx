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
  const [searchedLocation, setSearchedLocation] = useState<{ label: string; lat: number; lng: number } | null>(null);

  const { shops, loading, error, locationError, refetch, userLocation, centerLocation } = useShops({
    radius: 5000,
    lat: searchedLocation?.lat,
    lng: searchedLocation?.lng,
    city: searchedLocation ? undefined : selectedCity,
    autoGps: useGps,
  });

  const handleCityChange = (city: string) => {
    setSearchedLocation(null);
    setSelectedCity(city);
    setUseGps(false);
  };

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
        onCityChange={handleCityChange}
        onUseGps={() => { setSearchedLocation(null); setUseGps(true); }}
        onLocationSearch={(label, lat, lng) => { setSearchedLocation({ label, lat, lng }); setSelectedCity(label); setUseGps(false); }}
      />
      <main className="h-[calc(100vh-120px)] w-full">
        <MapPage
          city={selectedCity}
          query={query}
          shops={shops}
          loading={loading}
          error={error}
          locationError={locationError}
          userLocation={userLocation}
          centerLocation={centerLocation}
          onStartNavigation={handleStartNavigation}
        />
      </main>
      <ExplorerNav />
      <Toast />
    </div>
  );
}
