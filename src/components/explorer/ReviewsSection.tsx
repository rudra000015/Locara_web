'use client';

import { useEffect, useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { useStore } from '@/store/useStore';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import { Star, MessageSquarePlus, Sparkles } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

interface Props {
  shopId: string;
  shopName?: string;
  isOwner?: boolean;
  autoOpenComposer?: boolean;
}

type SortKey = 'newest' | 'highest' | 'lowest' | 'helpful';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest First' },
  { key: 'highest', label: 'Highest Rated' },
  { key: 'lowest', label: 'Lowest Rated' },
  { key: 'helpful', label: 'Most Helpful' },
];

function RatingBar({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 mb-1.5 text-xs">
      <div className="flex items-center gap-1 w-8 justify-end text-[#A1A1AA] font-mono font-bold">
        <span>{star}</span>
        <Star className="w-3 h-3 text-[#C9A96E] fill-[#C9A96E]" />
      </div>
      <div className="flex-1 h-2 bg-[#202020] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#C9A96E] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-[11px] text-[#71717A] font-mono">{count}</span>
    </div>
  );
}

export default function ReviewsSection({
  shopId,
  shopName = 'Heritage Shop',
  isOwner = false,
  autoOpenComposer = false,
}: Props) {
  const { user } = useStore();
  const { reviews, stats, loading, fetchReviews, submitReview, toggleHelpful } =
    useReviews(shopId);

  const [sort, setSort] = useState<SortKey>('newest');
  const [showForm, setShowForm] = useState(autoOpenComposer);

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sort === 'highest') return b.rating - a.rating;
    if (sort === 'lowest') return a.rating - b.rating;
    if (sort === 'helpful') return (b.helpful || 0) - (a.helpful || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Stats Summary Card */}
      {stats && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121212] border border-white/10 shadow-xl flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="text-center md:text-left">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A96E] font-bold">
              VERIFIED HERITAGE SCORE
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif text-5xl font-bold text-[#F5F5F5]">
                {stats.averageRating.toFixed(1)}
              </span>
              <div className="flex items-center text-[#C9A96E]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(stats.averageRating)
                        ? 'fill-[#C9A96E] text-[#C9A96E]'
                        : 'text-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-[#71717A] mt-1">
              Based on {stats.totalReviews} authentic customer reviews
            </p>
          </div>

          {/* Breakdown Bars */}
          <div className="w-full md:w-64">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar
                key={star}
                star={star}
                count={stats.ratingBreakdown[star as 1 | 2 | 3 | 4 | 5] || 0}
                total={stats.totalReviews}
              />
            ))}
          </div>

          {/* Write Review CTA */}
          <div className="shrink-0">
            <PremiumButton
              variant="gold"
              size="md"
              onClick={() => setShowForm(true)}
              icon={MessageSquarePlus}
              magnetic
            >
              Write Review
            </PremiumButton>
          </div>
        </div>
      )}

      {/* Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <h3 className="font-serif font-bold text-lg text-[#F5F5F5]">
          Community Feedback ({reviews.length})
        </h3>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141414] border border-white/10">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                sort === opt.key
                  ? 'bg-[#C9A96E] text-[#080808]'
                  : 'text-[#71717A] hover:text-[#F5F5F5]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#141414] skeleton-shimmer" />
          ))}
        </div>
      ) : sortedReviews.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#121212] border border-white/5">
          <Star className="w-8 h-8 text-[#52525B] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#A1A1AA]">No reviews yet</p>
          <p className="text-xs text-[#71717A] mt-1">
            Be the first explorer to share your experience with this heritage shop.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              onVoteHelpful={toggleHelpful}
              isOwner={isOwner}
            />
          ))}
        </div>
      )}

      {/* Write Review Dialog */}
      {showForm && (
        <ReviewForm
          shopId={shopId}
          shopName={shopName}
          onClose={() => setShowForm(false)}
          onSubmit={async (data) => {
            await submitReview({
              rating: data.rating,
              title: data.title,
              body: data.body,
              tags: data.tags || [],
            });
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
