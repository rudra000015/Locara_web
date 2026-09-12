'use client';

import { useEffect, useMemo } from 'react';
import { useExplorerRuntimeStore } from '@/store/useExplorerRuntimeStore';
import { AppNotification } from '@/types/notification';

const READ_STORAGE_KEY = 'locara_notification_read_ids';

function persistReadIds(ids: string[]) {
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage errors.
  }
}

export function useNotificationCenter() {
  const {
    notifications,
    readIds,
    popupIds,
    liveStatus,
    hydrateReadIds,
    setNotifications,
    upsertNotification,
    markRead,
    markAllRead,
    dismissPopup,
    setLiveStatus,
  } = useExplorerRuntimeStore();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(READ_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) {
          hydrateReadIds(parsed);
        }
      }
    } catch {
      // Ignore storage errors.
    }
  }, [hydrateReadIds]);

  useEffect(() => {
    persistReadIds(readIds);
  }, [readIds]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/notifications?limit=40', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && Array.isArray(data?.notifications)) {
          setNotifications(data.notifications as AppNotification[]);
        }
      } catch {
        // Ignore initial feed failures, SSE/polling will retry.
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [setNotifications]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return;
    }

    setLiveStatus('connecting');
    const stream = new EventSource('/api/notifications/stream');

    const onNotification = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as AppNotification;
        upsertNotification(payload);
      } catch {
        // Ignore malformed event payloads.
      }
    };

    stream.addEventListener('notification', onNotification as EventListener);
    stream.onopen = () => setLiveStatus('live');
    stream.onerror = () => setLiveStatus('error');

    return () => {
      stream.removeEventListener('notification', onNotification as EventListener);
      stream.close();
    };
  }, [setLiveStatus, upsertNotification]);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        const res = await fetch('/api/notifications?limit=10', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (Array.isArray(data?.notifications)) {
          for (const item of data.notifications as AppNotification[]) {
            upsertNotification(item);
          }
        }
      } catch {
        // Keep trying in the background.
      }
    }, 20000);

    return () => window.clearInterval(interval);
  }, [upsertNotification]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !readIds.includes(item.id)).length,
    [notifications, readIds]
  );

  const popups = useMemo(
    () => popupIds
      .map((id) => notifications.find((item) => item.id === id))
      .filter(Boolean) as AppNotification[],
    [notifications, popupIds]
  );

  return {
    notifications,
    popups,
    unreadCount,
    liveStatus,
    markRead,
    markAllRead,
    dismissPopup,
  };
}
