'use client';

import { useRouter } from 'next/navigation';
import { AppNotification } from '@/types/notification';
import { Bell, Sparkles, Check, ChevronLeft, ArrowRight } from 'lucide-react';

interface Props {
  notifications: AppNotification[];
  unreadCount: number;
  liveStatus: 'idle' | 'connecting' | 'live' | 'error';
  onOpen: (notification: AppNotification) => void;
  onMarkAllRead: () => void;
}

function typeBadge(type: AppNotification['type']) {
  if (type === 'offer') {
    return 'bg-[#C9A96E]/15 text-[#C9A96E] border-[#C9A96E]/30';
  }
  if (type === 'new_product') {
    return 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30';
  }
  if (type === 'open_now') {
    return 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30';
  }
  return 'bg-white/5 text-[#A1A1AA] border-white/10';
}

export default function NotificationsPage({
  notifications,
  unreadCount,
  liveStatus,
  onOpen,
  onMarkAllRead,
}: Props) {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header Card */}
      <div className="mb-6 p-6 sm:p-8 rounded-3xl bg-[#121212] border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Bell className="w-4 h-4 text-[#C9A96E]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
              LIVE UPDATES & ALERTS
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F5F5]">
            Heritage Notification Feed
          </h1>
          <p className="text-xs text-[#71717A] mt-1">
            {unreadCount > 0
              ? `${unreadCount} new shop announcements waiting for you.`
              : 'You are completely caught up with your favorite stores.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-[#181818] border border-white/10 text-right">
            <p className="text-[9px] font-mono uppercase text-[#71717A] tracking-wider">Feed</p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5F5F5] mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  liveStatus === 'live'
                    ? 'bg-[#22c55e] animate-pulse'
                    : liveStatus === 'connecting'
                    ? 'bg-[#f59e0b]'
                    : 'bg-[#71717A]'
                }`}
              />
              <span className="capitalize">{liveStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => router.push('/explorer')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#71717A] hover:text-[#F5F5F5] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to explore
        </button>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#202020] border border-white/10 text-xs font-bold text-[#C9A96E] transition-all flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-[#121212] p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#181818] border border-white/10 flex items-center justify-center text-[#71717A] mx-auto mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#F5F5F5] mb-1">No Updates Yet</h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            When shops you follow post new festive discounts, arrivals, or broadcasts, they will show up here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => onOpen(notification)}
              className="w-full rounded-2xl border border-white/[0.08] hover:border-white/20 bg-[#121212] hover:bg-[#161616] p-5 text-left shadow-sm transition-all duration-200 cursor-pointer group"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border ${typeBadge(
                        notification.type
                      )}`}
                    >
                      {notification.type.replace('_', ' ')}
                    </span>
                    {notification.shopName && (
                      <span className="text-xs font-bold text-[#C9A96E]">
                        {notification.shopName}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#F5F5F5] group-hover:text-[#C9A96E] transition-colors">
                    {notification.title}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mt-1">
                    {notification.body}
                  </p>
                </div>

                <div className="text-right text-[10px] font-mono text-[#71717A]">
                  {new Date(notification.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
