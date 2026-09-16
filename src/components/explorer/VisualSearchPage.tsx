'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, Sparkles, MapPin, ArrowRight, Store, CheckCircle2, RotateCw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import PremiumButton from '@/components/ui/PremiumButton';

export default function VisualSearchPage() {
  const router = useRouter();
  const { openShop } = useStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'
  );
  const [isScanning, setIsScanning] = useState(false);

  const mockMatches = [
    {
      id: 'm1',
      matchPct: 96,
      name: 'Handcrafted Zari Silk Lehenga',
      price: 18500,
      shopId: 'kb-sharma',
      shopName: 'Sharma Ethnic Studio',
      neighborhood: 'Karol Bagh',
      distance: '1.0 km',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'm2',
      matchPct: 89,
      name: 'Banarasi Brocade Bridal Saree',
      price: 14200,
      shopId: 'cc-chhabra',
      shopName: 'Chhabra 55 Heritage Silk',
      neighborhood: 'Chandni Chowk',
      distance: '2.1 km',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'm3',
      matchPct: 82,
      name: 'Pure Georgette Chikankari Ensemble',
      price: 9800,
      shopId: 'ln-lucknow',
      shopName: 'Avadh Chikankari Emporium',
      neighborhood: 'Lajpat Nagar',
      distance: '3.4 km',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
    },
  ];

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 1200);
    }
  };

  return (
    <div className="py-4 pb-20 space-y-8">
      {/* Header matching Mockup Screen 09 */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Camera className="w-4 h-4 text-[#C8893F]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
            AI VISUAL MARKET RADAR
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-black text-fg-heading">
          Find It In Your City
        </h1>
        <p className="text-xs sm:text-sm text-fg-secondary mt-1 max-w-xl">
          Saw an artisanal dress, sweet delicacy, or jewellery piece you like? Take a photo or upload an image to find identical and similar products in nearby physical shops.
        </p>
      </div>

      {/* Main Split Interface matching Mockup Screen 09 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload / Viewfinder */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-[3/4] sm:aspect-square rounded-3xl bg-[#14100C] border-2 border-dashed border-[#C8893F]/40 p-4 flex flex-col items-center justify-center text-center overflow-hidden shadow-2xl">
            {selectedImage ? (
              <>
                <img
                  src={selectedImage}
                  alt="Scanned item"
                  className="w-full h-full object-cover rounded-2xl"
                />
                {/* Viewfinder Target Frame Overlay */}
                <div className="absolute inset-8 border-2 border-[#C8893F]/60 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-[#E0AF62]" />
                    <span className="w-4 h-4 border-t-2 border-r-2 border-[#E0AF62]" />
                  </div>
                  {isScanning && (
                    <div className="w-full h-1 bg-[#E11D48] animate-pulse shadow-glow" />
                  )}
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-[#E0AF62]" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-[#E0AF62]" />
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex gap-2">
                  <label className="flex-1 btn-gold text-xs py-2 cursor-pointer text-center">
                    <span>Replace Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSimulateUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </>
            ) : (
              <div className="space-y-4 p-6">
                <div className="w-16 h-16 rounded-3xl bg-[#211A14] border border-[#C8893F]/30 flex items-center justify-center text-[#E0AF62] mx-auto shadow-glow-sm">
                  <Camera className="w-8 h-8 text-[#C8893F]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#FAF4EB]">
                    Upload or Snap a Picture
                  </h3>
                  <p className="text-xs text-[#9E8B75] mt-1">
                    PNG, JPG, or Live Camera photo of any product
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 btn-gold text-xs cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSimulateUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Similar Products Nearby */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
                PHYSICAL INVENTORY MATCHES
              </span>
              <h2 className="font-serif text-2xl font-bold text-fg-heading">
                Similar Products Nearby
              </h2>
            </div>
            <button
              onClick={() => router.push('/map')}
              className="btn-secondary text-xs"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C8893F]" />
              <span>View On Map</span>
            </button>
          </div>

          <div className="space-y-3">
            {mockMatches.map((match) => (
              <div
                key={match.id}
                onClick={() => {
                  openShop(match.shopId);
                  router.push(`/shops/${match.shopId}`);
                }}
                className="p-4 sm:p-5 rounded-3xl bg-bg-card border border-border hover:border-[#C8893F] transition-all cursor-pointer shadow-md group flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-bg-subtle shrink-0 border border-border">
                    <img
                      src={match.image}
                      alt={match.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                        {match.matchPct}% MATCH
                      </span>
                      <span className="text-[10px] font-mono text-fg-muted">
                        ● {match.distance} away
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-fg-heading group-hover:text-[#C8893F] transition-colors truncate">
                      {match.name}
                    </h3>

                    <p className="text-xs text-fg-muted flex items-center gap-1 mt-0.5">
                      <Store className="w-3.5 h-3.5 text-[#C8893F]" />
                      {match.shopName} • {match.neighborhood}
                    </p>

                    <p className="font-mono text-sm font-bold text-[#E0AF62] mt-1">
                      ₹{match.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-gold text-xs px-3.5 py-2 shrink-0 hidden sm:inline-flex"
                >
                  <span>Reserve 10%</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
