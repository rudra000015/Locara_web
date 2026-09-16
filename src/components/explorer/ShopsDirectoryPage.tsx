'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useShops } from '@/hooks/useShops';
import { useStore } from '@/store/useStore';
import { Shop } from '@/types/shop';
import { CATEGORIES } from '@/data/categories';
import {
  Store,
  MapPin,
  Star,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Phone,
  MessageCircle,
} from 'lucide-react';

export default function ShopsDirectoryPage() {
  const router = useRouter();
  const { openShop } = useStore();
  const { shops, loading, error } = useShops({ radius: 10000 });

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [openOnly, setOpenOnly] = useState(false);

  const filteredShops = useMemo(() => {
    return shops.filter((s) => {
      const matchQuery =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.addr.toLowerCase().includes(search.toLowerCase()) ||
        (s.story ?? '').toLowerCase().includes(search.toLowerCase());

      const matchCat = selectedCat === 'all' || s.cat === selectedCat;
      const matchOpen = !openOnly || s.openNow !== false;

      return matchQuery && matchCat && matchOpen;
    });
  }, [shops, search, selectedCat, openOnly]);

  const handleOpenShop = (shopId: string) => {
    openShop(shopId);
    router.push(`/shops/${shopId}`);
  };

  return (
    <div className="py-4 pb-20 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Store className="w-4 h-4 text-[#C8893F]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
            VERIFIED PHYSICAL STORES
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-black text-fg-heading">
          Local Shops
        </h1>
        <p className="text-xs sm:text-sm text-fg-secondary mt-1">
          Find authentic multi-generational storefronts worth discovering in your city.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by shop name, sweets, silk, jewelry..."
          className="w-full md:w-80 px-4 py-2 rounded-xl bg-bg-subtle border border-border text-xs text-fg placeholder-fg-muted outline-none focus:border-[#C8893F]"
        />

        {/* Category & Open Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 rounded-xl bg-bg-subtle border border-border text-xs text-fg font-medium outline-none cursor-pointer"
          >
            <option value="all">All Specialties</option>
            <option value="sweets">Sweets & Mithai</option>
            <option value="textiles">Bridal & Sarees</option>
            <option value="jewellery">Handcrafted Jewelry</option>
            <option value="crafts">Heritage Handicrafts</option>
            <option value="grocery">Traditional Spices</option>
          </select>

          <button
            type="button"
            onClick={() => setOpenOnly(!openOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              openOnly
                ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                : 'bg-bg-subtle border-border text-fg-muted hover:text-fg'
            }`}
          >
            ● Open Now Only
          </button>
        </div>
      </div>

      {/* Editorial List Layout matching Section 7 */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-36 rounded-3xl bg-bg-card border border-border skeleton-shimmer" />
          ))}
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="text-center py-20 bg-bg-card rounded-3xl border border-border">
          <Store className="w-10 h-10 text-fg-muted mx-auto mb-2" />
          <p className="font-serif text-lg font-bold text-fg-heading">No shops matching filters</p>
          <p className="text-xs text-fg-muted mt-1">Try resetting the search terms or filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              onClick={() => handleOpenShop(shop.id)}
              className="p-5 sm:p-6 rounded-3xl bg-bg-card border border-border hover:border-[#C8893F] transition-all cursor-pointer shadow-md hover:shadow-xl group flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Left Image & Metadata */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
                <div className="w-full sm:w-32 sm:h-32 aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-bg-subtle shrink-0 border border-border relative">
                  <img
                    src={shop.images?.[0] || shop.photos?.[0] || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600'}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-mono text-[#E0AF62] font-bold">
                    Est. {shop.est}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        shop.openNow !== false
                          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                          : 'bg-[#E11D48]/15 text-[#E11D48] border border-[#E11D48]/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${shop.openNow !== false ? 'bg-[#10B981] animate-pulse' : 'bg-[#E11D48]'}`} />
                      {shop.openNow !== false ? 'OPEN NOW' : 'CLOSED'}
                    </span>

                    {shop.rating > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-fg bg-bg-subtle px-2.5 py-0.5 rounded-full border border-border">
                        <Star className="w-3 h-3 text-[#C8893F] fill-[#C8893F]" /> {shop.rating.toFixed(1)}
                      </span>
                    )}

                    <span className="text-[10px] font-mono text-[#E0AF62]">
                      {shop.age} Yrs Heritage
                    </span>
                  </div>

                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-fg-heading group-hover:text-[#C8893F] transition-colors">
                    {shop.name}
                  </h2>

                  <p className="text-xs text-fg-muted flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C8893F] shrink-0" />
                    {shop.addr}
                  </p>

                  <p className="text-xs text-fg-secondary line-clamp-1 mt-1 font-serif italic max-w-xl">
                    {shop.story || 'Celebrated family-run artisan boutique preserving age-old craftsmanship.'}
                  </p>
                </div>
              </div>

              {/* Right CTA */}
              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-mono text-[#10B981] font-bold uppercase block">
                    ● In-Store Pickup Active
                  </span>
                  <span className="text-xs text-fg-muted">
                    {shop.products?.length || 8} items available
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-gold text-xs px-4 py-2"
                >
                  <span>View Shop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
