'use client';

import { useState } from 'react';
import { Review } from '@/types/review';
import { useStore } from '@/store/useStore';
import { Star, ThumbsUp, MessageSquare, CheckCircle2 } from 'lucide-react';

interface Props {
  review: Review;
  onVoteHelpful?: (id: string) => void;
  onHelpful?: (id: string) => void;
  isOwner?: boolean;
  onReply?: (id: string, text: string) => Promise<void>;
}

export default function ReviewCard({
  review: r,
  onVoteHelpful,
  onHelpful,
  isOwner,
  onReply,
}: Props) {
  const { user } = useStore();
  const userId = user?.name ?? 'anon';
  const isMine = r.userId === userId;

  const [expanded, setExpanded] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState(r.ownerReply?.text ?? '');
  const [saving, setSaving] = useState(false);

  const BODY_LIMIT = 160;
  const isLong = r.body.length > BODY_LIMIT;
  const displayBody = isLong && !expanded ? r.body.slice(0, BODY_LIMIT) + '...' : r.body;

  const handleVote = () => {
    if (onVoteHelpful) onVoteHelpful(r.id);
    if (onHelpful) onHelpful(r.id);
  };

  const handleSaveReply = async () => {
    if (!onReply || !replyText.trim()) return;
    setSaving(true);
    await onReply(r.id, replyText);
    setSaving(false);
    setShowReplyBox(false);
  };

  return (
    <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] shadow-sm hover:border-white/[0.14] transition-all">
      {/* User Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1C1C1C] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
            {r.userImg ? (
              <img src={r.userImg} alt={r.userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-[#C9A96E]">
                {r.userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#F5F5F5]">{r.userName}</span>
              {isMine && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/25">
                  You
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex text-[#C9A96E]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < r.rating ? 'fill-[#C9A96E] text-[#C9A96E]' : 'text-white/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-[#71717A]">
                {new Date(r.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Body */}
      <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mb-3">
        {displayBody}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[#C9A96E] font-bold ml-1.5 hover:underline"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>

      {/* Tags */}
      {r.tags && r.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {r.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-md bg-white/5 text-[10px] text-[#71717A] border border-white/5"
            >
              ✓ {tag}
            </span>
          ))}
        </div>
      )}

      {/* Helpful Action */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <button
          type="button"
          onClick={handleVote}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#202020] border border-white/10 text-xs font-bold text-[#A1A1AA] hover:text-[#F5F5F5] transition-all cursor-pointer"
        >
          <ThumbsUp className="w-3.5 h-3.5 text-[#C9A96E]" />
          <span>Helpful {r.helpful ? `(${r.helpful})` : ''}</span>
        </button>

        {isOwner && !r.ownerReply && (
          <button
            onClick={() => setShowReplyBox(!showReplyBox)}
            className="text-xs font-bold text-[#C9A96E] hover:underline"
          >
            Reply to customer
          </button>
        )}
      </div>

      {/* Owner Reply */}
      {r.ownerReply && (
        <div className="mt-3 p-3.5 rounded-xl bg-[#181818] border-l-2 border-[#C9A96E] text-xs">
          <p className="font-bold text-[#C9A96E] mb-1">Response from Store Owner</p>
          <p className="text-[#A1A1AA]">{r.ownerReply.text}</p>
        </div>
      )}
    </div>
  );
}