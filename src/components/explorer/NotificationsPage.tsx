'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppNotification } from '@/types/notification';
import { Bell, Sparkles, Check, ChevronLeft, ArrowRight, Tag, Store, CalendarCheck, Info } from 'lucide-react';

interface Props {
  notifications: AppNotification[];
  unreadCount: number;
  liveStatus: 'idle' | 'connecting' | 'live' | 'error';
  onOpen: (notification: AppNotification) => void;
  onMarkAllRead: () => void;
}

export default function NotificationsPage({
  notifications,
  unreadCount,
  liveStatus,
  onOpen,
  onMarkAllRead,
}: Props) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Reservations', 'Offers', 'Shop Updates', 'Recommendations', 'System'];

  const mockItems = [
    {
      id: 'notif-1',
      title: 'Your order is ready for pickup!',
      shop: 'Hira Sweets • Chandni Chowk',
      time: '18 min ago',
      category: 'Reservations',
      type: 'reservation',
      read: false,
    },
    {
      id: 'notif-2',
      title: '20% off on Handlooms',
      shop: 'Raghu Handlooms • Karol Bagh',
      time: '1 hour ago',
      category: 'Offers',
      type: 'offer',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'New arrivals at Kundan Creations',
      shop: 'Check out the latest bridal collection.',
      time: '3 hours ago',
      category: 'Shop Updates',
      type: 'update',
      read: true,
    },
    {
      id: 'notif-4',
      title: 'Your reservation is confirmed',
      shop: 'LOC-8829-1029 • Ready at 6:30 PM',
      time: '5 hours ago',
      category: 'Reservations',
      type: 'reservation',
      read: true,
    },
  ];

  const filteredItems = mockItems.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <div className="py-4 pb-20 space-y-6 max-w-3xl mx-auto">
      {/* Header matching Mockup Screen 13 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-[#C8893F]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
              ACTIVITY TIMELINE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-fg-heading">
            Notifications
          </h1>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="px-3.5 py-1.5 rounded-xl bg-bg-card hover:bg-bg-cardHover border border-border text-xs font-bold text-[#C8893F] transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs matching Mockup Screen 13 */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#C8893F] text-[#0E0B08] shadow-md'
                  : 'bg-bg-pill text-fg-secondary hover:text-fg hover:bg-bg-pillHover border border-border'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Notification Activity Cards */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
              !item.read
                ? 'bg-bg-card border-[#C8893F]/40 shadow-sm'
                : 'bg-bg-card/70 border-border opacity-85'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-bg-subtle border border-border flex items-center justify-center text-[#C8893F] shrink-0">
                {item.type === 'reservation' ? (
                  <CalendarCheck className="w-5 h-5 text-[#10B981]" />
                ) : item.type === 'offer' ? (
                  <Tag className="w-5 h-5 text-[#E11D48]" />
                ) : (
                  <Store className="w-5 h-5 text-[#C8893F]" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-sm sm:text-base font-bold text-fg-heading truncate">
                    {item.title}
                  </h3>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-[#E11D48] shrink-0" />
                  )}
                </div>
                <p className="text-xs text-fg-muted truncate">{item.shop}</p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-fg-muted shrink-0">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
