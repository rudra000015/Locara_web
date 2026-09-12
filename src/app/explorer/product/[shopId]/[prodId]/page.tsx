'use client';

import { useParams } from 'next/navigation';
import ProductPageClient from './ProductPageClient';

export default function ExplorerProductPage() {
  const params = useParams<{ shopId: string; prodId: string }>();
  return (
    <ProductPageClient
      shopId={params?.shopId || ''}
      prodId={params?.prodId || ''}
    />
  );
}

