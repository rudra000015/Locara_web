'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props {
  collection: {
    id: string;
    title: string;
    slug?: string;
    description?: string;
    coverImage: string;
    tag: string;
    shopId: string;
    shopName: string;
    products?: Array<{ id: string; name: string; price: number; image?: string }>;
  };
  index: number;
}

export default function CollectionCard({ collection, index }: Props) {
  const router = useRouter();
  const { openShop, isCollectionSaved, toggleSaveCollection } = useStore();
  const isSaved = isCollectionSaved(collection.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      onClick={() => {
        openShop(collection.shopId);
        router.push(`/explorer/shop/${collection.shopId}?tab=products`);
      }}
      className="group relative shrink-0 w-64 sm:w-72 h-80 rounded-3xl overflow-hidden bg-[#1B140F] border border-[#F6EAD7]/10 hover:border-[#C8893F]/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl flex flex-col justify-between p-4"
    >
      <img
        src={collection.coverImage}
        alt={collection.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0B08] via-[#0E0B08]/50 to-transparent" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#0E0B08]/80 backdrop-blur-md text-[#E0AF62] border border-[#C8893F]/30">
          ✦ {collection.tag}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveCollection({
              id: collection.id,
              title: collection.title,
              shopName: collection.shopName,
              coverImage: collection.coverImage,
              tag: collection.tag,
            });
          }}
          className="w-8 h-8 rounded-full bg-[#0E0B08]/80 backdrop-blur-md border border-[#F6EAD7]/10 flex items-center justify-center text-[#F6EAD7] hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'text-[#C24136] fill-[#C24136]' : 'text-white'}`} />
        </button>
      </div>

      {/* Bottom info */}
      <div className="relative z-10">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#D8C4A7] truncate">
          {collection.shopName}
        </p>
        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#F6EAD7] group-hover:text-[#E0AF62] transition-colors leading-tight mt-0.5">
          {collection.title}
        </h3>
        {collection.description && (
          <p className="text-[11px] text-[#9E8B75] line-clamp-2 mt-1 leading-relaxed">
            {collection.description}
          </p>
        )}
        <div className="mt-3 pt-2.5 border-t border-[#F6EAD7]/10 flex items-center justify-between">
          <span className="text-xs font-bold text-[#E0AF62] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View Collection <ArrowRight className="w-3.5 h-3.5" />
          </span>
          <span className="text-[10px] font-mono text-[#9E8B75]">
            {collection.products?.length || 12} items
          </span>
        </div>
      </div>
    </motion.div>
  );
}
