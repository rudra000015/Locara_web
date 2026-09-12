'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import ExplorerApp from '@/components/explorer/ExplorerApp';

export default function MarketDetailPageDynamic() {
  const params = useParams<{ slug: string }>();
  const { openMarket } = useStore();

  useEffect(() => {
    if (params?.slug) {
      openMarket(params.slug);
    }
  }, [params?.slug, openMarket]);

  return <ExplorerApp routePage="market" />;
}
