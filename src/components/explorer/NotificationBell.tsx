'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useStore } from '@/store/useStore';
import { Bell, Loader2 } from 'lucide-react';

export default function NotificationBell() {
  const { showToast } = useStore();
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushNotifications();

  if (!isSupported) return null;

  const handleClick = async () => {
    if (permission === 'denied') {
      showToast('Notifications browser settings mein blocked hain');
      return;
    }

    const ok = isSubscribed ? await unsubscribe() : await subscribe();
    if (!ok && !isSubscribed) {
      showToast('Notification permission allow karo');
      return;
    }

    showToast(isSubscribed ? 'Notifications off' : 'Notifications on');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="relative w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.08] flex items-center justify-center transition-all duration-300 disabled:opacity-50 group"
      aria-label={isSubscribed ? 'Disable notifications' : 'Enable notifications'}
      title={isSubscribed ? 'Notifications enabled' : 'Enable notifications'}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
      ) : (
        <Bell
          className={`w-4 h-4 transition-colors duration-300 ${
            isSubscribed ? 'text-amber-400 fill-amber-400/20' : 'text-neutral-400 group-hover:text-white'
          }`}
        />
      )}
      {isSubscribed && (
        <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(201,169,110,0.8)] ring-2 ring-neutral-950" />
      )}
    </button>
  );
}

