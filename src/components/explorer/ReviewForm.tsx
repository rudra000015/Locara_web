'use client';

import { useState } from 'react';
import { Star, X, Sparkles } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

interface Props {
  shopId?: string;
  shopName?: string;
  onSubmit: (data: {
    rating: number;
    title: string;
    body: string;
    tags?: any[];
  }) => Promise<any>;
  submitting?: boolean;
  hasExisting?: boolean;
  onClose: () => void;
}

const STAR_LABELS = ['', 'Needs Improvement', 'Fair', 'Good', 'Very Good', 'Exceptional!'];

export default function ReviewForm({
  shopName = 'Heritage Shop',
  onSubmit,
  submitting = false,
  onClose,
}: Props) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeStar = hovered || rating;

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
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit review. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#121212] border border-white/10 p-6 sm:p-8 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
              VERIFIED EXPERIENCE
            </span>
            <h3 className="font-serif font-bold text-xl text-[#F5F5F5] mt-0.5">
              Review {shopName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C1C1C] flex items-center justify-center text-[#71717A] hover:text-[#F5F5F5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Picker */}
          <div className="text-center p-4 rounded-2xl bg-[#181818] border border-white/5">
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(n)}
                  className="p-1 cursor-pointer transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      activeStar >= n ? 'text-[#C9A96E] fill-[#C9A96E]' : 'text-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-[#C9A96E] font-mono uppercase tracking-wider">
              {STAR_LABELS[activeStar]}
            </p>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1.5 font-bold">
              Headline / Summary
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best traditional sweets in town"
              className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E] transition-colors"
            />
          </div>

          {/* Body textarea */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#71717A] mb-1.5 font-bold">
              Detailed Experience
            </label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share details about the craftsmanship, authenticity, atmosphere, or recommended specialties..."
              className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E] transition-colors resize-none leading-relaxed"
            />
          </div>

          {error && (
            <p className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-xs text-[#ef4444]">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-bold text-[#A1A1AA] hover:bg-white/5 transition-all"
            >
              Cancel
            </button>

            <PremiumButton
              variant="gold"
              size="md"
              type="submit"
              disabled={loading || submitting}
              className="flex-1"
            >
              {loading || submitting ? 'Submitting...' : 'Post Verified Review'}
            </PremiumButton>
          </div>
        </form>
      </div>
    </div>
  );
}