'use client';

import { useParams } from 'next/navigation';
import ShopPageClient from './ShopPageClient';

export default function ExplorerShopPage() {
  const params = useParams<{ shopId: string }>();
  return <ShopPageClient shopId={params?.shopId || ''} />;
}

