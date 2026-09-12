'use client';

import { useEffect, useState } from 'react';
import {
  CATEGORIES,
  SORT_OPTIONS,
  FilterState,
  DEFAULT_FILTERS,
} from '@/data/categories';
import { SlidersHorizontal, X, RotateCcw, Check } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
  totalResults: number;
}

export default function FilterPanel({ filters, onChange, onClose, totalResults }: Props) {
  const [local, setLocal] = useState<FilterState>(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  const set = (k: keyof FilterState, v: any) => setLocal((f) => ({ ...f, [k]: v }));

  const apply = () => {
    onChange(local);
    onClose();
  };

  const reset = () => {
    setLocal(DEFAULT_FILTERS);
    onChange(DEFAULT_FILTERS);
  };

  const hasChanges =
    local.category !== DEFAULT_FILTERS.category ||
    local.sort !== DEFAULT_FILTERS.sort ||
    local.openNow !== DEFAULT_FILTERS.openNow ||
    local.minRating !== DEFAULT_FILTERS.minRating ||
    local.priceRange !== DEFAULT_FILTERS.priceRange;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#121212] border border-white/10 w-full md:max-w-lg md:rounded-3xl rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl no-scrollbar animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-[#121212]/95 backdrop-blur-md z-10 px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#C9A96E]" />
            <h2 className="font-serif font-bold text-lg text-[#F5F5F5]">Filter Discovery</h2>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={reset}
                className="text-xs text-[#ef4444] font-bold hover:underline px-2 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1E1E1E] flex items-center justify-center text-[#A1A1AA] hover:text-[#F5F5F5]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 text-xs text-[#F5F5F5]">
          {/* Sorting */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#71717A] mb-3">
              Sort By
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => set('sort', opt.id)}
                  className={`py-2.5 px-3 rounded-xl border text-left font-bold transition-all ${
                    local.sort === opt.id
                      ? 'bg-[#C9A96E]/15 border-[#C9A96E] text-[#C9A96E]'
                      : 'bg-[#181818] border-white/5 text-[#A1A1AA] hover:bg-[#202020]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#71717A] mb-3">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => set('category', 'all')}
                className={`px-3 py-1.5 rounded-full border font-bold transition-all ${
                  local.category === 'all'
                    ? 'bg-[#C9A96E] text-[#080808] border-[#C9A96E] shadow-glow-sm'
                    : 'bg-[#181818] border-white/5 text-[#A1A1AA] hover:bg-[#202020]'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => set('category', cat.id)}
                  className={`px-3 py-1.5 rounded-full border font-semibold transition-all ${
                    local.category === cat.id
                      ? 'bg-[#C9A96E] text-[#080808] border-[#C9A96E] font-bold shadow-glow-sm'
                      : 'bg-[#181818] border-white/5 text-[#A1A1AA] hover:bg-[#202020]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#71717A] mb-3">
              Minimum Rating
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[0, 3.5, 4.0, 4.5].map((r) => (
                <button
                  key={r}
                  onClick={() => set('minRating', r)}
                  className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                    local.minRating === r
                      ? 'bg-[#C9A96E]/15 border-[#C9A96E] text-[#C9A96E]'
                      : 'bg-[#181818] border-white/5 text-[#A1A1AA] hover:bg-[#202020]'
                  }`}
                >
                  {r === 0 ? 'Any' : `⭐ ${r}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Open Now Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#181818] border border-white/5">
            <div>
              <p className="font-bold text-[#F5F5F5]">Currently Open</p>
              <p className="text-[10px] text-[#71717A]">Only display shops open right now</p>
            </div>
            <input
              type="checkbox"
              checked={local.openNow}
              onChange={(e) => set('openNow', e.target.checked)}
              className="w-5 h-5 accent-[#C9A96E] cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-[#121212]/95 backdrop-blur-md p-4 border-t border-white/10 flex gap-3">
          <PremiumButton variant="gold" size="lg" onClick={apply} className="w-full" magnetic>
            Apply Filters ({totalResults} Shops)
          </PremiumButton>
        </div>
      </div>
    </div>
  );
}
