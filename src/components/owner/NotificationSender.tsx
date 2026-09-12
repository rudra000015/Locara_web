'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Send, Tag, Sparkles, Megaphone, Clock, CheckCircle2, X } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

type NotifType = 'new_product' | 'offer' | 'open_now' | 'general';

interface Template {
  type: NotifType;
  icon: any;
  label: string;
  defaultTitle: string;
  defaultBody: string;
}

const TEMPLATES: Template[] = [
  {
    type: 'new_product',
    icon: Sparkles,
    label: 'New Product Drop',
    defaultTitle: 'Fresh Batch Arrived Today!',
    defaultBody: 'Our handcrafted specialty items are freshly prepared and ready for tasting.',
  },
  {
    type: 'offer',
    icon: Tag,
    label: 'Festive Offer',
    defaultTitle: 'Exclusive Heritage Discount • Limited Time',
    defaultBody: 'Enjoy up to 20% off on all signature festive gift boxes this week.',
  },
  {
    type: 'open_now',
    icon: Clock,
    label: 'Store Open Alert',
    defaultTitle: 'Our Heritage Doors are Open!',
    defaultBody: 'Visit our traditional bazaar workshop today for fresh preparations.',
  },
  {
    type: 'general',
    icon: Megaphone,
    label: 'Store Broadcast',
    defaultTitle: 'Heritage Announcement',
    defaultBody: 'Special updates and seasonal preparations from our store.',
  },
];

interface NotificationSenderProps {
  shopId?: string;
  shopName?: string;
  onClose?: () => void;
}

export default function NotificationSender({
  shopId: propShopId,
  shopName: propShopName,
  onClose,
}: NotificationSenderProps) {
  const { ownerShopId, ownerShopName, showToast } = useStore();
  const activeShopId = propShopId || ownerShopId;
  const activeShopName = propShopName || ownerShopName;

  const [selectedType, setSelectedType] = useState<NotifType>('new_product');
  const [title, setTitle] = useState(TEMPLATES[0].defaultTitle);
  const [body, setBody] = useState(TEMPLATES[0].defaultBody);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState<number | null>(null);

  const handleSelectType = (tpl: Template) => {
    setSelectedType(tpl.type);
    setTitle(tpl.defaultTitle);
    setBody(tpl.defaultBody);
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      showToast('Title and description are required');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: activeShopId,
          shopName: activeShopName,
          type: selectedType,
          title: title.trim(),
          body: body.trim(),
          url: `/explorer/shop/${activeShopId}`,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to send notification');

      setSentCount(data.sent ?? 1);
      showToast('Broadcast sent to all followers!');
      if (onClose) {
        setTimeout(() => onClose(), 1200);
      }
    } catch (err: any) {
      showToast(err.message || 'Notification failed');
    } finally {
      setSending(false);
    }
  };

  const modalContainer = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
            REAL-TIME BROADCAST
          </span>
          <h3 className="font-serif font-bold text-xl text-[#F5F5F5] mt-0.5">
            Notify Followers & Explorers
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C1C1C] flex items-center justify-center text-[#71717A] hover:text-[#F5F5F5]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Templates */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          const isSelected = selectedType === tpl.type;
          return (
            <button
              key={tpl.type}
              type="button"
              onClick={() => handleSelectType(tpl)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#C9A96E]/15 border-[#C9A96E] text-[#C9A96E]'
                  : 'bg-[#181818] border-white/5 text-[#A1A1AA] hover:bg-[#202020]'
              }`}
            >
              <Icon className="w-4 h-4 mb-2" />
              <p className="text-xs font-bold">{tpl.label}</p>
            </button>
          );
        })}
      </div>

      {/* Title */}
      <div>
        <label className="block text-[10px] font-mono uppercase text-[#71717A] mb-1 font-bold">
          Notification Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E]"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-[10px] font-mono uppercase text-[#71717A] mb-1 font-bold">
          Notification Message
        </label>
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E] resize-none leading-relaxed"
        />
      </div>

      {sentCount !== null && (
        <div className="p-3 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 text-xs text-[#22c55e] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Broadcast successfully delivered to local explorer devices.</span>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-bold text-[#A1A1AA] hover:bg-white/5"
          >
            Cancel
          </button>
        )}
        <PremiumButton
          variant="gold"
          size="md"
          onClick={handleSend}
          disabled={sending}
          icon={Send}
          className={onClose ? 'flex-1' : 'w-full'}
          magnetic
        >
          {sending ? 'Broadcasting...' : 'Send Live Notification'}
        </PremiumButton>
      </div>
    </div>
  );

  if (onClose) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="w-full max-w-lg rounded-3xl bg-[#121212] border border-white/10 p-6 sm:p-8 shadow-2xl animate-scale-in">
          {modalContainer}
        </div>
      </div>
    );
  }

  return modalContainer;
}
