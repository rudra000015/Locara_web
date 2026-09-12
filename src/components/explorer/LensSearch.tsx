'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Image as ImageIcon, Sparkles, X, ChevronRight, Store, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LensSearchResult {
  detected?: string[];
  searchTerm?: string;
  shops?: Array<{
    id: string;
    name: string;
    cat?: string;
    category?: string;
  }>;
  identified?: {
    productName?: string;
    searchKeywords?: string[];
    confidence?: string;
  };
  error?: string;
}

interface Props {
  onClose: () => void;
  city?: string;
  onDetected?: (searchTerm: string, detected: string[]) => void;
}

export default function LensSearch({ onClose, city = 'Meerut', onDetected }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LensSearchResult | null>(null);

  const handleCapture = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setResults(null);

    const form = new FormData();
    form.append('image', file);
    form.append('city', city);

    try {
      const res = await fetch('/api/visual-search', { method: 'POST', body: form });
      const data = (await res.json()) as LensSearchResult;
      setResults(data);

      const detected = data.detected ?? data.identified?.searchKeywords ?? [];
      if (onDetected && data.searchTerm) {
        onDetected(data.searchTerm, detected);
      }
    } catch {
      setResults({ error: 'Visual search failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const openShop = (shopId: string) => {
    router.push(`/explorer/shop/${shopId}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4"
    >
      <div className="relative w-full max-w-md bg-neutral-900/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.1] flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {!preview ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300 mb-6 shadow-[0_0_24px_rgba(201,169,110,0.15)]">
              <Sparkles className="w-9 h-9 animate-pulse" />
            </div>

            <h3 className="font-serif text-2xl text-neutral-100 tracking-tight mb-2">
              Visual Discovery
            </h3>
            <p className="text-neutral-400 text-sm max-w-xs mb-8 leading-relaxed">
              Capture or upload any craft, sweet, or product to instantly locate verified local artisans.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => {
                  if (!fileRef.current) return;
                  fileRef.current.accept = 'image/*';
                  (fileRef.current as any).capture = 'environment';
                  fileRef.current.click();
                }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 hover:bg-amber-400/[0.03] transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.05] group-hover:bg-amber-400/10 flex items-center justify-center text-neutral-300 group-hover:text-amber-300 transition-colors">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-neutral-200 text-xs font-semibold tracking-wider uppercase">Camera</span>
              </button>

              <button
                onClick={() => {
                  if (!fileRef.current) return;
                  fileRef.current.accept = 'image/*';
                  fileRef.current.removeAttribute('capture');
                  fileRef.current.click();
                }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 hover:bg-amber-400/[0.03] transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.05] group-hover:bg-amber-400/10 flex items-center justify-center text-neutral-300 group-hover:text-amber-300 transition-colors">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className="text-neutral-200 text-xs font-semibold tracking-wider uppercase">Gallery</span>
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleCapture(file);
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="relative rounded-2xl overflow-hidden mb-5 border border-white/10 max-h-56 bg-black">
              <img
                src={preview}
                alt="captured"
                className="w-full h-full object-cover"
              />
              {loading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mb-3" />
                  <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold">Analyzing craft patterns...</p>
                </div>
              )}
            </div>

            {results && !loading && (
              <div className="space-y-4">
                {results.error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{results.error}</span>
                  </div>
                )}

                {(results.detected ?? results.identified?.searchKeywords ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(results.detected ?? results.identified?.searchKeywords ?? []).slice(0, 5).map((label) => (
                      <span
                        key={label}
                        className="text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                    {results.shops?.length ?? 0} Matching Heritage Outlets
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(results.shops ?? []).map((shop) => (
                      <button
                        key={shop.id}
                        onClick={() => openShop(shop.id)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/05 hover:border-amber-400/30 hover:bg-white/[0.06] transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300 font-serif font-bold text-xs">
                            {shop.name?.slice(0, 1) ?? 'S'}
                          </div>
                          <div>
                            <p className="text-neutral-200 text-xs font-semibold group-hover:text-amber-300 transition-colors">
                              {shop.name}
                            </p>
                            <p className="text-neutral-500 text-[10px] uppercase tracking-wider">
                              {shop.cat ?? shop.category ?? 'Heritage Store'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-300 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPreview(null);
                    setResults(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs uppercase tracking-wider font-semibold text-neutral-300 hover:text-white transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another Item</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
