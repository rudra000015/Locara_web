'use client';

import ExplorerHeader from '@/components/explorer/ExplorerHeader';
import ExplorerNav from '@/components/explorer/ExplorerNav';
import NotificationsPage from '@/components/explorer/NotificationsPage';
import { useState } from 'react';
import { DEFAULT_FILTERS, FilterState } from '@/data/categories';
import { getDefaultCity } from '@/lib/cities';
import Toast from '@/components/ui/Toast';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';

export default function NotificationsRoute() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedCity, setSelectedCity] = useState(getDefaultCity().name);
  const [useGps, setUseGps] = useState(false);

  const { notifications, unreadCount, liveStatus, markRead, markAllRead } =
    useNotificationCenter();

  return (
    <div className="min-h-screen bg-bg text-fg">
      <ExplorerHeader
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={setFilters}
        totalResults={0}
        onRefetch={() => {}}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        onUseGps={() => setUseGps(true)}
      />
      <main className="max-w-7xl mx-auto px-4 pt-2 pb-24">
        <NotificationsPage
          notifications={notifications}
          unreadCount={unreadCount}
          liveStatus={liveStatus}
          onOpen={(n) => markRead(n.id)}
          onMarkAllRead={markAllRead}
        />
      </main>
      <ExplorerNav />
      <Toast />
    </div>
  );
}
