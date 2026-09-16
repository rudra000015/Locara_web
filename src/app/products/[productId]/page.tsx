'use client';

import ExplorerHeader from '@/components/explorer/ExplorerHeader';
import ExplorerNav from '@/components/explorer/ExplorerNav';
import ProductDetail from '@/components/explorer/ProductDetail';
import { useState, useEffect } from 'react';
import { DEFAULT_FILTERS, FilterState } from '@/data/categories';
import { getDefaultCity } from '@/lib/cities';
import Toast from '@/components/ui/Toast';
import { useParams } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function ProductDetailRoute() {
  const params = useParams();
  const productId = (params?.productId as string) || '';
  const { setProdId } = useStore();

  useEffect(() => {
    if (productId) {
      setProdId(productId);
    }
  }, [productId, setProdId]);

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
        totalResults={1}
        onRefetch={() => {}}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        onUseGps={() => setUseGps(true)}
      />
      <main className="max-w-7xl mx-auto px-4 pt-2 pb-24">
        <ProductDetail />
      </main>
      <ExplorerNav />
      <Toast />
    </div>
  );
}
