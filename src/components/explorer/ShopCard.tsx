'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shop } from '@/types/shop';
import { useStore } from '@/store/useStore';
import { Star, CheckCircle2, ChevronRight, Store } from 'lucide-react';
import { isOpenNow, todayHours } from '@/data/shops';
import { formatDistance } from '@/lib/geo';

interface ShopCardProps {
  shop: Shop;
  index?: number;
  layout?: 'grid' | 'list' | 'horizontal';
}

export default function ShopCard({ shop: s, layout = 'grid' }: ShopCardProps) {
  const router = useRouter();
  const { openShop } = useStore();

  const handleCardClick = () => {
    openShop(s.id);
    router.push(`/explorer/shop/${s.id}`);
  };

  const openStatus = s.openNow ?? isOpenNow(s.hours);
  const closingTime = todayHours(s.hours).split('-')[1]?.trim() || '9:00 PM';
  const distanceStr = s.distanceMeters ? formatDistance(s.distanceMeters) : '1.2 km';
  const ratingVal = (s.rating || 4.6).toFixed(1);
  const reviewCount = s.totalRatings || (s.reviews?.length ? s.reviews.length * 15 : 120);

  const imgSrc =
    s.photos?.[0] ||
    s.images?.[0] ||
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80';

  // List layout (Used in Shop Listing / Directory page)
  if (layout === 'list') {
    return (
      <div
        onClick={handleCardClick}
        className="group relative flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white border border-[#E5E5E5] hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        {/* Shop Image */}
        <div className="w-full sm:w-48 h-36 rounded-lg overflow-hidden bg-[#F5F4F0] shrink-0 relative">
          <img
            src={imgSrc}
            alt={s.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {openStatus ? (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EBF8F0] text-[#16803C] border border-[#A7F3D0] flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16803C]" />
              Open
            </span>
          ) : (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEF3F2] text-[#DC2626] border border-[#FECACA] flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
              Closed
            </span>
          )}
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base text-[#171717] group-hover:text-[#A85420] transition-colors truncate">
                    {s.name}
                  </h3>
                  <span title="Verified Shop" className="inline-flex">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] fill-[#2563EB]/10 shrink-0" />
                  </span>
                </div>
                <p className="text-xs text-[#666666] capitalize mt-0.5 font-medium">
                  {s.subcategory || s.cat}
                </p>
              </div>

              {s.age ? (
                <span className="text-[11px] font-medium text-[#A85420] bg-[#FBF3EE] px-2 py-0.5 rounded border border-[#F5DECD]">
                  Est. {s.est || new Date().getFullYear() - s.age}
                </span>
              ) : null}
            </div>

            {/* Rating & Distance */}
            <div className="flex items-center gap-2 mt-2 text-xs text-[#666666]">
              <div className="flex items-center gap-1 text-[#171717] font-semibold">
                <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
                <span>{ratingVal}</span>
                <span className="text-[#8A8A8A] font-normal">({reviewCount} reviews)</span>
              </div>
              <span>•</span>
              <span>{distanceStr}</span>
            </div>

            {/* Status & Closing info */}
            <div className="flex items-center gap-1.5 text-xs text-[#666666] mt-2">
              <span className={`w-2 h-2 rounded-full ${openStatus ? 'bg-[#16803C]' : 'bg-[#DC2626]'}`} />
              <span className="font-medium text-[#171717]">{openStatus ? 'Open' : 'Closed'}</span>
              <span>·</span>
              <span>Closes {closingTime}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0F0F0] flex items-center justify-between">
            <p className="text-xs text-[#8A8A8A] truncate max-w-[240px]">
              {s.addr.split(',')[0]}
            </p>
            <button
              type="button"
              className="px-4 py-1.5 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
            >
              <span>View Shop</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid / Horizontal Layout (Used in Homepage Featured Shops)
  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white border border-[#E5E5E5] rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Shop Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F5F4F0]">
        <img
          src={imgSrc}
          alt={s.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Heritage Badge if any */}
        {s.age && (
          <div className="absolute top-2.5 left-2.5 bg-white/95 text-[#171717] text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-[#E5E5E5]">
            Est. {s.est || new Date().getFullYear() - s.age}
          </div>
        )}

        {/* Open Pill */}
        <div className="absolute top-2.5 right-2.5">
          {openStatus ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF8F0] text-[#16803C] border border-[#A7F3D0] shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16803C]" />
              Open
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3F2] text-[#DC2626] border border-[#FECACA] shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
              Closed
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-sm text-[#171717] group-hover:text-[#A85420] transition-colors truncate">
              {s.name}
            </h3>
            <span title="Verified Shop" className="inline-flex">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] fill-[#2563EB]/10 shrink-0" />
            </span>
          </div>

          <p className="text-xs text-[#666666] capitalize mt-0.5 font-medium truncate">
            {s.subcategory || s.cat}
          </p>

          <div className="flex items-center justify-between mt-2 text-xs">
            <div className="flex items-center gap-1 text-[#171717] font-semibold text-[11px]">
              <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
              <span>{ratingVal}</span>
              <span className="text-[#8A8A8A] font-normal">({reviewCount})</span>
            </div>
            <span className="text-xs text-[#666666] font-medium">{distanceStr}</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#F0F0F0] flex items-center justify-between">
          <span className="text-[11px] text-[#8A8A8A]">
            Closes {closingTime}
          </span>
          <span className="text-xs font-semibold text-[#A85420] group-hover:underline flex items-center gap-0.5">
            View Shop
          </span>
        </div>
      </div>
    </div>
  );
}