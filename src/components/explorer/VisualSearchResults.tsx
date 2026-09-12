'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { VisualSearchResultItem } from '@/services/visualSearchService';
import { ShopVisualMatchCluster } from '@/services/shopMatchingService';
import VisualSearchMap from './VisualSearchMap';
import ReservationModal from './ReservationModal';
import {
  Sparkles,
  MapPin,
  Store,
  Compass,
  SlidersHorizontal,
  CalendarCheck,
  List,
  Map as MapIcon,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

interface VisualSearchResultsProps {
  queryImage?: string | null;
  queryText?: string;
  results: VisualSearchResultItem[];
  shopClusters: ShopVisualMatchCluster[];
  userLocation?: { lat: number; lng: number } | null;
  onClose: () => void;
}

export default function VisualSearchResults({
  queryImage,
  queryText,
  results,
  shopClusters,
  userLocation,
  onClose,
}: VisualSearchResultsProps) {
  const router = useRouter();
  const { openShop, viewProduct } = useStore();

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filterSort, setFilterSort] = useState<'best_match' | 'nearest' | 'price_low' | 'available'>(
    'best_match'
  );
  const [selectedProductForReservation, setSelectedProductForReservation] =
    useState<VisualSearchResultItem | null>(null);

  // Sorting logic
  const sortedResults = [...results].sort((a, b) => {
    if (filterSort === 'best_match') return b.finalScore - a.finalScore;
    if (filterSort === 'nearest') {
      const distA = a.shop.distanceMeters ?? 999999;
      const distB = b.shop.distanceMeters ?? 999999;
      return distA - distB;
    }
    if (filterSort === 'price_low') return a.price - b.price;
    if (filterSort === 'available') return (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0);
    return 0;
  });

  const handleOpenShop = (shopId: string) => {
    openShop(shopId);
    onClose();
    router.push(`/explorer/shop/${shopId}`);
  };

  const handleViewProduct = (shopId: string, productId: string) => {
    viewProduct(shopId, productId);
    onClose();
    router.push(`/explorer/product/${shopId}/${productId}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search Query Summary Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/15 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {queryImage ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#211A14] border border-[#C8893F]/40 shrink-0 shadow-glow-sm">
              <img src={queryImage} alt="Search Query" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#211A14] border border-[#C8893F]/40 flex items-center justify-center text-[#C8893F] shrink-0">
              <Sparkles className="w-7 h-7" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C8893F]">
                VISUAL STYLE MATCH
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#1E5544]/30 border border-[#1E5544]/50 text-[#2D7D64] font-bold">
                {results.length} Products Found
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#F6EAD7] truncate">
              {queryText ? `"${queryText}"` : 'Visual Style Search Results'}
            </h3>
            <p className="text-xs text-[#9E8B75] truncate">
              Available across {shopClusters.length} verified physical boutiques near you
            </p>
          </div>
        </div>

        {/* View Mode Toggle (List vs Map) */}
        <div className="flex items-center gap-1.5 bg-[#211A14] p-1 rounded-2xl border border-[#F6EAD7]/10 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#C8893F] text-[#0E0B08] shadow-sm'
                : 'text-[#9E8B75] hover:text-[#F6EAD7]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-[#C8893F] text-[#0E0B08] shadow-sm'
                : 'text-[#9E8B75] hover:text-[#F6EAD7]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {(
          [
            { id: 'best_match', label: '⭐ Best Visual Match' },
            { id: 'nearest', label: '📍 Nearest to Me' },
            { id: 'price_low', label: '🏷️ Lowest Price' },
            { id: 'available', label: '✨ In Stock Today' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterSort(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterSort === tab.id
                ? 'bg-[#C8893F]/20 text-[#E0AF62] border border-[#C8893F]/40'
                : 'bg-[#17120E] text-[#9E8B75] border border-[#F6EAD7]/5 hover:text-[#F6EAD7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content View */}
      {viewMode === 'map' ? (
        <VisualSearchMap
          clusters={shopClusters}
          userLocation={userLocation}
          onSelectShop={handleOpenShop}
          onSelectProduct={handleViewProduct}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {sortedResults.map((item) => {
            const isHighMatch = item.visualMatchPercent >= 85;

            return (
              <div
                key={`${item.shop.id}_${item.productId}`}
                className="group rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 hover:border-[#C8893F]/40 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-56 bg-[#211A14] overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0B08] via-transparent to-black/30" />

                    {/* Similarity Match Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0E0B08]/85 backdrop-blur-md border border-[#F6EAD7]/20">
                      <span className="font-mono text-[#E0AF62]">
                        {item.visualMatchPercent}%
                      </span>
                      <span className="text-[#9E8B75]">•</span>
                      <span className="text-[#F6EAD7]">{item.matchLabel}</span>
                    </div>

                    {/* In Stock Badge */}
                    {item.inStock && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#1E5544]/80 text-[#2D7D64] border border-[#1E5544]">
                        In Stock
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#F6EAD7] line-clamp-2 group-hover:text-[#E0AF62] transition-colors leading-snug">
                      {item.productName}
                    </h4>

                    {/* Price & Deposit Breakdown */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="font-mono text-lg font-bold text-[#F6EAD7]">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#9E8B75] ml-1">in-store total</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#E0AF62] font-bold">
                        10% Adv: ₹{Math.round(item.price * 0.1)}
                      </span>
                    </div>

                    {/* Shop Info & Distance */}
                    <div className="pt-2 border-t border-[#F6EAD7]/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Store className="w-3.5 h-3.5 text-[#C8893F] shrink-0" />
                        <span className="font-bold text-[#D8C4A7] truncate">
                          {item.shop.name}
                        </span>
                      </div>
                      {item.shop.distanceText && (
                        <span className="text-[10px] font-mono text-[#9E8B75] shrink-0 ml-2">
                          {item.shop.distanceText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewProduct(item.shop.id, item.productId)}
                    className="py-2.5 rounded-xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-xs font-bold text-[#D8C4A7] hover:text-[#F6EAD7] transition-all cursor-pointer text-center"
                  >
                    View Details
                  </button>

                  <PremiumButton
                    variant="gold"
                    size="sm"
                    onClick={() => setSelectedProductForReservation(item)}
                    icon={CalendarCheck}
                  >
                    Reserve 10%
                  </PremiumButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reservation Modal Trigger if user clicks Reserve */}
      {selectedProductForReservation && (
        <ReservationModal
          isOpen={Boolean(selectedProductForReservation)}
          product={{
            id: selectedProductForReservation.productId,
            name: selectedProductForReservation.productName,
            price: selectedProductForReservation.price,
            unit: 'piece',
            image: selectedProductForReservation.imageUrl,
            category: selectedProductForReservation.category,
          }}
          shop={{
            id: selectedProductForReservation.shop.id,
            name: selectedProductForReservation.shop.name,
            addr: selectedProductForReservation.shop.address,
            loc: [
              selectedProductForReservation.shop.lat,
              selectedProductForReservation.shop.lng,
            ],
          }}
          onClose={() => setSelectedProductForReservation(null)}
          onSuccess={() => {
            setSelectedProductForReservation(null);
            onClose();
            router.push('/explorer/reservations');
          }}
        />
      )}
    </div>
  );
}
