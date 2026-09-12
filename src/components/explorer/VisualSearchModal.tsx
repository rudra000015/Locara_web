'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import VisualSearchResults from './VisualSearchResults';
import { VisualSearchResultItem } from '@/services/visualSearchService';
import { ShopVisualMatchCluster } from '@/services/shopMatchingService';
import {
  Camera,
  Upload,
  Sparkles,
  X,
  RefreshCw,
  SlidersHorizontal,
  Image as ImageIcon,
  AlertCircle,
  Zap,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface VisualSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export default function VisualSearchModal({
  open,
  onOpenChange,
  userLocation,
}: VisualSearchModalProps) {
  const { showToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusStep, setStatusStep] = useState('');
  const [results, setResults] = useState<VisualSearchResultItem[] | null>(null);
  const [shopClusters, setShopClusters] = useState<ShopVisualMatchCluster[]>([]);
  const [error, setError] = useState('');

  const resetSearch = () => {
    setImagePreview(null);
    setTextQuery('');
    setResults(null);
    setShopClusters([]);
    setError('');
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPEG, PNG, WEBP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image file size must be under 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      void executeSearch(base64, textQuery);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const executeSearch = async (imgData?: string | null, textVal?: string) => {
    const payloadImage = imgData !== undefined ? imgData : imagePreview;
    const payloadText = textVal !== undefined ? textVal : textQuery;

    if (!payloadImage && !payloadText.trim()) {
      setError('Please take a photo, choose an image, or enter a description.');
      return;
    }

    setError('');
    setLoading(true);
    setStatusStep('Analyzing visual pattern & style...');

    try {
      setTimeout(() => setStatusStep('Generating multimodal vector embedding...'), 400);
      setTimeout(() => setStatusStep('Scanning nearby Locara boutique inventories...'), 900);
      setTimeout(() => setStatusStep('Re-ranking by visual match & proximity...'), 1400);

      const res = await fetch('/api/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: payloadImage || undefined,
          textQuery: payloadText.trim() || undefined,
          lat: userLocation?.lat,
          lng: userLocation?.lng,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to complete visual search');
      }

      setResults(data.results || []);
      setShopClusters(data.shopClusters || []);
    } catch (err: any) {
      setError(err?.message || 'Unable to complete visual search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1200] bg-black/85 backdrop-blur-md transition-opacity duration-200" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[1201] w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0E0B08] border border-[#F6EAD7]/15 sm:rounded-3xl rounded-t-3xl shadow-2xl p-5 sm:p-8 focus:outline-none animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F6EAD7]/10 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#211A14] border border-[#C8893F]/40 flex items-center justify-center text-[#C8893F] shadow-glow-sm">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F6EAD7] flex items-center gap-2">
                  Visual Product Search
                </h2>
                <p className="text-xs text-[#9E8B75]">
                  Search authentic nearby inventory using real-life photos or screenshots
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-2 text-[#9E8B75] hover:text-[#F6EAD7] hover:bg-[#211A14] rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results View */}
          {results && !loading ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={resetSearch}
                  className="px-3.5 py-1.5 rounded-xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-xs font-bold text-[#E0AF62] flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Search Another Item
                </button>
              </div>
              <VisualSearchResults
                queryImage={imagePreview}
                queryText={textQuery}
                results={results}
                shopClusters={shopClusters}
                userLocation={userLocation}
                onClose={() => onOpenChange(false)}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Framing Capture Box */}
              <div className="relative rounded-3xl border-2 border-dashed border-[#F6EAD7]/20 bg-[#17120E] p-8 flex flex-col items-center justify-center text-center overflow-hidden">
                {imagePreview ? (
                  <div className="relative w-full max-w-sm h-64 rounded-2xl overflow-hidden bg-[#211A14] border border-[#C8893F]/40 shadow-xl">
                    <img
                      src={imagePreview}
                      alt="Captured Query"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 backdrop-blur-md text-[#C24136] flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-md">
                    <div className="w-16 h-16 rounded-3xl bg-[#211A14] border border-[#F6EAD7]/10 flex items-center justify-center text-[#C8893F] mx-auto shadow-glow-sm">
                      <Camera className="w-8 h-8" />
                    </div>

                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#F6EAD7]">
                        Snap a photo or upload an image
                      </h3>
                      <p className="text-xs text-[#9E8B75] mt-1 leading-relaxed">
                        Hold camera steady over clothing, silk brocade, jewellery, sweets, or brass handicrafts to scan nearby physical stores.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.removeAttribute('capture');
                            fileInputRef.current.click();
                          }
                        }}
                        className="px-5 py-3 rounded-2xl bg-[#C8893F] hover:bg-[#E0AF62] text-xs font-bold text-[#0E0B08] flex items-center justify-center gap-2 transition-all shadow-glow-sm cursor-pointer"
                      >
                        <Upload className="w-4 h-4" /> Upload from Gallery
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.setAttribute('capture', 'environment');
                            fileInputRef.current.click();
                          }
                        }}
                        className="px-5 py-3 rounded-2xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-xs font-bold text-[#F6EAD7] flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-[#C8893F]" /> Open Camera
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Optional Text Refinement Input */}
              <div className="p-4 rounded-2xl bg-[#17120E] border border-[#F6EAD7]/10 flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#C8893F] shrink-0" />
                <input
                  type="text"
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void executeSearch()}
                  placeholder="Refine search style (e.g. 'pure silk emerald green' or 'antique silver jhumka')..."
                  className="flex-1 bg-transparent text-xs text-[#F6EAD7] placeholder-[#736350] outline-none"
                />
                <button
                  type="button"
                  onClick={() => void executeSearch()}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-[#C8893F] text-[#0E0B08] text-xs font-bold shadow-sm cursor-pointer hover:bg-[#E0AF62] transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="py-8 text-center space-y-3 animate-fade-up">
                  <div className="w-10 h-10 border-2 border-[#C8893F] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-mono text-xs text-[#E0AF62] font-bold tracking-wider uppercase">
                    {statusStep || 'Processing Visual Vectors...'}
                  </p>
                </div>
              )}

              {/* Error Box */}
              {error && (
                <div className="p-4 rounded-2xl bg-[#C24136]/15 border border-[#C24136]/30 text-xs text-[#C24136] flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
