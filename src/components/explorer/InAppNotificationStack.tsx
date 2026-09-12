'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppNotification } from '@/types/notification';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface Props {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onRead: (id: string) => void;
}

function typeLabel(type: AppNotification['type']) {
  if (type === 'offer') return 'Special Offer';
  if (type === 'new_product') return 'New Arrival';
  if (type === 'open_now') return 'Open Now';
  return 'Heritage Update';
}

export default function InAppNotificationStack({ notifications, onDismiss, onRead }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!notifications.length) return;

    const timers = notifications.map((notification) =>
      window.setTimeout(() => onDismiss(notification.id), 7000)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [notifications, onDismiss]);

  if (!notifications.length) return null;

  return (
    <div className="fixed top-20 right-4 z-[1200] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2.5">
      {notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className="w-full rounded-2xl border border-white/10 bg-[#141414]/95 p-4 text-left shadow-[0_16px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-scale-in"
        >
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
                {typeLabel(notification.type)}
              </span>
              <h4 className="mt-0.5 font-serif font-bold text-sm text-[#F5F5F5]">
                {notification.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDismiss(notification.id);
              }}
              className="text-xs text-[#71717A] hover:text-[#F5F5F5] p-1"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs leading-relaxed text-[#A1A1AA]">{notification.body}</p>
          <div className="mt-3 flex items-center justify-between gap-3 text-[10px] font-mono text-[#71717A] pt-2 border-t border-white/5">
            <span className="truncate">{notification.shopName || 'Locara Discovery'}</span>
            <button
              type="button"
              onClick={() => {
                onRead(notification.id);
                onDismiss(notification.id);
                router.push(
                  notification.url ||
                    (notification.shopId ? `/explorer/shop/${notification.shopId}` : '/explorer/notifications')
                );
              }}
              className="px-3 py-1 rounded-full bg-[#C9A96E] hover:bg-[#DFC596] text-[#080808] font-bold text-[11px] transition-all flex items-center gap-1 shadow-glow-sm"
            >
              Open <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
