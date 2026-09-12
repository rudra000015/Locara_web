'use client';

import { useState } from 'react';
import { getShopCategoryChoices } from '@/lib/shopCategories';
import { Sparkles, X, Check, ArrowRight, Store } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

const CATEGORIES = getShopCategoryChoices();

interface Props {
  shopName: string;
  onApply: (data: any) => void;
  onClose: () => void;
}

export default function AutoFillModal({ shopName, onApply, onClose }: Props) {
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const generate = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch('/api/owner/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selected, shopName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to generate auto-fill');
      }
      setPreview(data);
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl rounded-3xl bg-[#121212] border border-white/10 p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-[#C9A96E]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
                AI HERITAGE COPYWRITER
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#F5F5F5]">
              Auto-Generate Profile Story
            </h2>
            <p className="text-xs text-[#71717A] mt-0.5">
              Select category to generate traditional heritage descriptions and tags.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C1C1C] flex items-center justify-center text-[#71717A] hover:text-[#F5F5F5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!preview ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
              {CATEGORIES.map((category) => {
                const isSelected = selected === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelected(category.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#C9A96E]/15 border-[#C9A96E] text-[#C9A96E]'
                        : 'bg-[#181818] border-white/5 text-[#A1A1AA] hover:bg-[#202020]'
                    }`}
                  >
                    <span className="text-xs font-bold block">{category.label}</span>
                  </button>
                );
              })}
            </div>

            <PremiumButton
              variant="gold"
              size="lg"
              onClick={generate}
              disabled={!selected || loading}
              className="w-full"
              magnetic
            >
              {loading ? 'Crafting Heritage Narrative...' : 'Generate AI Heritage Profile'}
            </PremiumButton>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#181818] border border-white/10 space-y-4">
              <div>
                <p className="text-[10px] font-mono uppercase text-[#C9A96E] font-bold mb-1">Tagline</p>
                <p className="font-serif font-bold text-base text-[#F5F5F5]">{preview.tagline}</p>
              </div>

              <div>
                <p className="text-[10px] font-mono uppercase text-[#C9A96E] font-bold mb-1">
                  Heritage Story Narrative
                </p>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">{preview.description || preview.story}</p>
              </div>

              <div>
                <p className="text-[10px] font-mono uppercase text-[#C9A96E] font-bold mb-2">
                  Recommended Specialties
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {preview.specialties?.map((item: string) => (
                    <span
                      key={item}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30"
                    >
                      ✦ {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPreview(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-bold text-[#A1A1AA] hover:bg-white/5"
              >
                Try Another Category
              </button>
              <PremiumButton
                variant="gold"
                size="md"
                onClick={() => {
                  onApply(preview);
                  onClose();
                }}
                className="flex-1"
                magnetic
              >
                Apply to Profile
              </PremiumButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
