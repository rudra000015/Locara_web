'use client';

import ExplorerHeader from '@/components/explorer/ExplorerHeader';
import ExplorerNav from '@/components/explorer/ExplorerNav';
import ShopsDirectoryPage from '@/components/explorer/ShopsDirectoryPage';
import { useState } from 'react';
import { DEFAULT_FILTERS, FilterState } from '@/data/categories';
import { getDefaultCity } from '@/lib/cities';
import Toast from '@/components/ui/Toast';

export default function ShopsRoute() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedCity, setSelectedCity] = useState(getDefaultCity().name);
  const [useGps, setUseGps] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <ExplorerHeader
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={setFilters}
        totalResults={18}
        onRefetch={() => {}}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        onUseGps={() => setUseGps(true)}
      />
      <main className="max-w-7xl mx-auto px-4 pt-2 pb-24">
        <ShopsDirectoryPage />
      </main>
      <ExplorerNav />
      <Toast />
    </div>
  );
}
