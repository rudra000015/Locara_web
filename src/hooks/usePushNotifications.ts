'use client';

import { useState, useEffect, useCallback } from 'react';

export type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

interface UsePushReturn {
  permission: PermissionState;
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: (shopIds?: string[]) => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  followShop: (shopId: string) => Promise<void>;
  unfollowShop: (shopId: string) => Promise<void>;
  followedShops: string[];
  isSupported: boolean;
}

const SW_URL = '/sw.js';
const SUBSCRIBE_URL = '/api/push/subscribe';

// ── Helper: URL-safe base64 → Uint8Array ─────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray as any;
}

export function usePushNotifications(): UsePushReturn {
  const [permission, setPermission]     = useState<PermissionState>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [followedShops, setFollowedShops] = useState<string[]>([]);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const isSupported = typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;

  // ── Init: register SW + check existing subscription ────────
  useEffect(() => {
    if (!isSupported) return;

    setPermission(Notification.permission as PermissionState);

    // Load followed shops from localStorage
    try {
      const saved = localStorage.getItem('purani-dukan-followed-shops');
      if (saved) setFollowedShops(JSON.parse(saved));
    } catch {}

    // Register service worker
    navigator.serviceWorker
      .register(SW_URL, { scope: '/' })
      .then(async reg => {
        setRegistration(reg);
        const existing = await reg.pushManager.getSubscription();
        setIsSubscribed(!!existing);

        // Listen for SW messages (navigation requests)
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data?.type === 'NAVIGATE') {
            window.location.href = event.data.url;
          }
        });
      })
      .catch(err => console.error('[Push] SW registration failed:', err));
  }, [isSupported]);

  // ── Subscribe ─────────────────────────────────────────────
  const subscribe = useCallback(async (shopIds: string[] = []): Promise<boolean> => {
    if (!isSupported || !registration) return false;
    setIsLoading(true);

    try {
      // Request permission
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);

      if (result !== 'granted') {
        setIsLoading(false);
        return false;
      }

      // Get VAPID public key
      const vapidRes = await fetch('/api/push/vapid');
      if (!vapidRes.ok) {
        console.warn('[Push] VAPID endpoint not available');
        return false;
      }
      const { publicKey } = await vapidRes.json();
      if (typeof publicKey !== 'string' || !publicKey.trim()) {
        console.warn('[Push] Missing VAPID public key, push is disabled');
        return false;
      }

      // Subscribe to push manager
      const pushSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as any,
      });

      // Send subscription to server
      const res = await fetch(SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: pushSub.toJSON(),
          shopIds,
          types: ['new_product', 'offer', 'open_now', 'general'],
        }),
      });

      if (res.ok) {
        setIsSubscribed(true);
        if (shopIds.length) {
          setFollowedShops(shopIds);
          localStorage.setItem('purani-dukan-followed-shops', JSON.stringify(shopIds));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Push] Subscribe failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, registration]);

  // ── Unsubscribe ───────────────────────────────────────────
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!registration) return false;
    setIsLoading(true);
    try {
      const sub = await registration.pushManager.getSubscription();
      if (!sub) { setIsSubscribed(false); return true; }

      await fetch(SUBSCRIBE_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });

      await sub.unsubscribe();
      setIsSubscribed(false);
      setFollowedShops([]);
      localStorage.removeItem('purani-dukan-followed-shops');
      return true;
    } catch (err) {
      console.error('[Push] Unsubscribe failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [registration]);

  // ── Follow a shop ─────────────────────────────────────────
  const followShop = useCallback(async (shopId: string) => {
    if (!isSubscribed) {
      await subscribe([shopId]);
      return;
    }
    const updated = [...new Set([...followedShops, shopId])];
    setFollowedShops(updated);
    localStorage.setItem('purani-dukan-followed-shops', JSON.stringify(updated));

    // Update server
    const sub = await registration?.pushManager.getSubscription();
    if (sub) {
      await fetch(SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), shopIds: updated }),
      });
    }
  }, [isSubscribed, followedShops, subscribe, registration]);

  // ── Unfollow a shop ───────────────────────────────────────
  const unfollowShop = useCallback(async (shopId: string) => {
    const updated = followedShops.filter(id => id !== shopId);
    setFollowedShops(updated);
    localStorage.setItem('purani-dukan-followed-shops', JSON.stringify(updated));

    const sub = await registration?.pushManager.getSubscription();
    if (sub) {
      await fetch(SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), shopIds: updated }),
      });
    }
  }, [followedShops, registration]);

  return {
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    followShop,
    unfollowShop,
    followedShops,
    isSupported,
  };
}
