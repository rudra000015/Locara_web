'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellOff, Loader2 } from 'lucide-react';

interface Props {
  shopId: string;
  shopName: string;
}

export default function FollowShopButton({ shopId, shopName }: Props) {
  const {
    isSupported,
    isLoading,
    followedShops,
    followShop,
    unfollowShop,
  } = usePushNotifications();

  if (!isSupported) return null;

  const isFollowing = followedShops.includes(shopId);

  const handleToggle = async () => {
    if (isFollowing) {
      await unfollowShop(shopId);
    } else {
      await followShop(shopId);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-300 disabled:opacity-50 ${
        isFollowing
          ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30 hover:bg-amber-400/20'
          : 'bg-white/[0.04] text-neutral-300 border border-white/10 hover:border-amber-400/40 hover:text-white'
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isFollowing ? (
        <Bell className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
      ) : (
        <BellOff className="w-3.5 h-3.5 text-neutral-400" />
      )}
      <span>{isFollowing ? `Following ${shopName.split(' ')[0]}` : 'Follow Shop'}</span>
      {isFollowing && (
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
      )}
    </button>
  );
}