'use client';

import React, { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { useStore } from '@/store/useStore';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import { Star, MessageSquarePlus } from 'lucide-react';
import { ReviewTag } from '@/types/review';

interface Props {
  shopId: string;
  shopName?: string;
  isOwner?: boolean;
  autoOpenComposer?: boolean;
}

type SortKey = 'newest' | 'highest' | 'lowest' | 'helpful';

export default function ReviewsSection({
  shopId,
  shopName = 'Sharma Handicrafts',
  isOwner = false,
  autoOpenComposer = false,
}: Props) {
  const { user } = useStore();
  const { reviews, stats, loading, submitting, submitReview, toggleHelpful } = useReviews(shopId);

  const [sort, setSort] = useState<SortKey>('newest');
  const [showForm, setShowForm] = useState(autoOpenComposer);

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sort === 'highest') return b.rating - a.rating;
    if (sort === 'lowest') return a.rating - b.rating;
    if (sort === 'helpful') return (b.helpful || 0) - (a.helpful || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const ratingAvg = stats?.averageRating || 4.6;
  const totalRev = stats?.totalReviews || (reviews.length > 0 ? reviews.length : 120);

  const handleFormSubmit = async (data: {
    rating: number;
    title: string;
    body: string;
    tags: ReviewTag[];
  }) => {
    const success = await submitReview(data);
    if (success) {
      setShowForm(false);
    }
    return success;
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary Card */}
      <div className="p-6 rounded-xl bg-[#FAFAF8] border border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left space-y-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#A85420]">
            Customer Rating
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#171717]">
              {ratingAvg.toFixed(1)}
            </span>
            <div className="flex items-center text-[#D97706]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(ratingAvg)
                      ? 'fill-[#D97706] text-[#D97706]'
                      : 'text-[#E5E5E5]'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-[#666666]">
            Based on {totalRev} verified customer reviews
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="p-5 rounded-xl bg-white border border-[#E5E5E5] shadow-sm animate-fade-in">
          <ReviewForm
            shopId={shopId}
            shopName={shopName}
            onSubmit={handleFormSubmit}
            submitting={submitting}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <h4 className="font-bold text-sm text-[#171717]">All Reviews</h4>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="text-xs font-semibold text-[#171717] bg-[#F5F4F0] border border-[#E5E5E5] px-2.5 py-1 rounded-lg outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#666666]">
            Loading reviews...
          </div>
        ) : sortedReviews.length > 0 ? (
          <div className="space-y-3">
            {sortedReviews.map((review, idx) => (
              <ReviewCard
                key={review.id || idx}
                review={review}
                shopId={shopId}
                isOwner={isOwner}
                onHelpfulToggle={toggleHelpful}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#666666] bg-white border border-[#E5E5E5] rounded-xl">
            Be the first to review this local shop!
          </div>
        )}
      </div>
    </div>
  );
}
