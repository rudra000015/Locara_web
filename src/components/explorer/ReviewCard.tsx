'use client';

import React, { useState } from 'react';
import { Review } from '@/types/review';
import { useStore } from '@/store/useStore';
import { Star, ThumbsUp, CheckCircle2 } from 'lucide-react';

interface Props {
  review: Review;
  shopId?: string;
  onVoteHelpful?: (id: string) => void;
  onHelpfulToggle?: (id: string) => void;
  isOwner?: boolean;
  onReply?: (id: string, text: string) => Promise<void>;
}

export default function ReviewCard({
  review: r,
  onVoteHelpful,
  onHelpfulToggle,
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

  const BODY_LIMIT = 150;
  const isLong = r.body && r.body.length > BODY_LIMIT;
  const displayBody = isLong && !expanded ? r.body.slice(0, BODY_LIMIT) + '...' : r.body;

  const handleVote = () => {
    const revId = r.id;
    if (onHelpfulToggle) onHelpfulToggle(revId);
    else if (onVoteHelpful) onVoteHelpful(revId);
  };

  const handleSaveReply = async () => {
    if (!onReply || !replyText.trim()) return;
    setSaving(true);
    await onReply(r.id, replyText);
    setSaving(false);
    setShowReplyBox(false);
  };

  return (
    <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] space-y-3">
      {/* User Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#F5F4F0] border border-[#E5E5E5] overflow-hidden flex items-center justify-center shrink-0">
            {r.userImg ? (
              <img src={r.userImg} alt={r.userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-[#A85420]">
                {r.userName ? r.userName.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-[#171717]">{r.userName}</span>
              {r.verified && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#16803C]/10 text-[#16803C]">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Verified Buyer
                </span>
              )}
              {isMine && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#A85420]/10 text-[#A85420]">
                  You
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center text-[#D97706]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < r.rating ? 'fill-[#D97706] text-[#D97706]' : 'text-[#E5E5E5]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#8A8A8A]">
                {new Date(r.createdAt || Date.now()).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Title & Body */}
      {r.title && (
        <h5 className="font-bold text-xs text-[#171717]">{r.title}</h5>
      )}
      <p className="text-xs text-[#666666] leading-relaxed">
        {displayBody}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[#A85420] font-bold ml-1 hover:underline cursor-pointer"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>

      {/* Tags */}
      {r.tags && r.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {r.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-[#F5F4F0] text-[10px] font-medium text-[#666666] border border-[#E5E5E5]"
            >
              ✓ {tag}
            </span>
          ))}
        </div>
      )}

      {/* Helpful Action & Owner Reply */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5]">
        <button
          type="button"
          onClick={handleVote}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAFAF8] hover:bg-[#F5F4F0] border border-[#E5E5E5] text-[11px] font-medium text-[#666666] hover:text-[#171717] transition-colors"
        >
          <ThumbsUp className="w-3 h-3 text-[#A85420]" />
          <span>Helpful {r.helpful ? `(${r.helpful})` : ''}</span>
        </button>

        {isOwner && !r.ownerReply && (
          <button
            onClick={() => setShowReplyBox(!showReplyBox)}
            className="text-xs font-bold text-[#A85420] hover:underline cursor-pointer"
          >
            Reply to customer
          </button>
        )}
      </div>

      {/* Owner Reply Box */}
      {showReplyBox && (
        <div className="space-y-2 pt-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a response as the shop owner..."
            className="w-full p-2 text-xs rounded border border-[#E5E5E5] text-[#171717]"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowReplyBox(false)}
              className="px-2.5 py-1 text-xs text-[#666666] hover:text-[#171717]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveReply}
              disabled={saving}
              className="px-3 py-1 text-xs font-bold text-white bg-[#A85420] rounded"
            >
              {saving ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      )}

      {/* Existing Owner Reply */}
      {r.ownerReply && (
        <div className="p-3 rounded-lg bg-[#F5F4F0] border-l-2 border-[#A85420] text-xs space-y-1">
          <p className="font-bold text-[#A85420] text-[11px]">Response from Store Owner</p>
          <p className="text-[#666666]">{r.ownerReply.text}</p>
        </div>
      )}
    </div>
  );
}