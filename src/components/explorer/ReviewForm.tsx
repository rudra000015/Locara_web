'use client';

import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { ReviewTag, REVIEW_TAGS } from '@/types/review';

interface Props {
  shopId?: string;
  shopName?: string;
  onSubmit: (data: {
    rating: number;
    title: string;
    body: string;
    tags: ReviewTag[];
  }) => Promise<any>;
  submitting?: boolean;
  onClose?: () => void;
}

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Exceptional!'];

export default function ReviewForm({
  shopName = 'Shop',
  onSubmit,
  submitting = false,
  onClose,
}: Props) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<ReviewTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeStar = hovered || rating;

  const toggleTag = (tag: ReviewTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      setError('Please write a brief description of your experience.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onSubmit({
        rating,
        title: title.trim() || `${STAR_LABELS[rating]} Experience`,
        body: body.trim(),
        tags: selectedTags,
      });
      if (onClose) onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit review. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
        <div>
          <h3 className="font-bold text-sm text-[#171717]">Write a Review for {shopName}</h3>
          <p className="text-xs text-[#666666]">Share your feedback with local shoppers</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F5F4F0] flex items-center justify-center text-[#666666] hover:text-[#171717] hover:bg-[#E5E5E5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Star Picker */}
      <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E5] text-center space-y-1.5">
        <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider">
          Your Rating
        </span>
        <div className="flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(n)}
              className="p-1 cursor-pointer transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  activeStar >= n
                    ? 'text-[#D97706] fill-[#D97706]'
                    : 'text-[#E5E5E5]'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-xs font-bold text-[#A85420]">
          {STAR_LABELS[activeStar]}
        </p>
      </div>

      {/* Quick Tags */}
      <div>
        <label className="block text-xs font-bold text-[#171717] mb-1.5">
          Highlight Tags (Optional)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {REVIEW_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-[#A85420]/10 text-[#A85420] border-[#A85420]/30 font-bold'
                    : 'bg-[#FAFAF8] text-[#666666] border-[#E5E5E5] hover:border-[#CCCCCC]'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-[#171717] mb-1">
          Review Headline
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Authentic quality and friendly shop owner"
          className="w-full px-3.5 py-2 text-xs rounded-lg bg-white border border-[#E5E5E5] text-[#171717] placeholder-[#8A8A8A] focus:outline-none focus:border-[#A85420]"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-bold text-[#171717] mb-1">
          Your Review
        </label>
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell others what you liked about the products, pickup experience, and pricing..."
          className="w-full px-3.5 py-2 text-xs rounded-lg bg-white border border-[#E5E5E5] text-[#171717] placeholder-[#8A8A8A] focus:outline-none focus:border-[#A85420] resize-none"
        />
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/20 text-xs text-[#DC2626]">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#666666] hover:text-[#171717] bg-[#F5F4F0] hover:bg-[#E5E5E5] rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || submitting}
          className="px-5 py-2 text-xs font-bold text-white bg-[#A85420] hover:bg-[#873F17] rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {loading || submitting ? 'Submitting...' : 'Post Review'}
        </button>
      </div>
    </form>
  );
}