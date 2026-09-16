'use client';

import ExplorerApp from '@/components/explorer/ExplorerApp';
import ShopShutter from '@/components/ui/ShopShutter';

export default function Home() {
  return (
    <ShopShutter>
      <ExplorerApp routePage="home" />
    </ShopShutter>
  );
}
