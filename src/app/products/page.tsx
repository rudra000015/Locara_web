'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  MapPin,
  Clock,
  QrCode,
  Tag,
  Filter,
  CheckCircle2,
  Calendar,
  X,
  Share2,
  Phone,
  Store,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import ExplorerHeader from '@/components/explorer/ExplorerHeader';
import ExplorerNav from '@/components/explorer/ExplorerNav';
import Toast from '@/components/ui/Toast';
import { useStore } from '@/store/useStore';
import { DEFAULT_FILTERS, FilterState } from '@/data/categories';
import ReservationDepositModal from '@/components/explorer/ReservationDepositModal';

interface DropItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stockCount: number;
  shopId: string;
  shopName: string;
  neighborhood: string;
  distance: string;
  hours: string;
  address: string;
  image: string;
  description: string;
  authenticityProof: string;
}

const VERIFIED_DROPS: DropItem[] = [
  {
    id: 'maya-drop-1',
    name: 'Mulberry Katan Silk Saree with Zari Pallu',
    category: 'Handloom Textiles',
    price: 18500,
    stockCount: 3,
    shopId: 'maya-studio',
    shopName: 'Maya Studio & Atelier',
    neighborhood: 'Indiranagar 100ft',
    distance: '0.4 km',
    hours: '10:30 AM – 8:30 PM',
    address: '428, 100ft Road, Indiranagar, Bangalore',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    description: 'Woven over 32 days on traditional pit looms using certified Mulberry silk and genuine tested zari.',
    authenticityProof: 'Silk Mark Certified • Master Weaver: Govindarajulu',
  },
  {
    id: 'bombay-drop-1',
    name: 'Hand-Cut Emerald Kundan Choker',
    category: 'Artisanal Jewellery',
    price: 34000,
    stockCount: 1,
    shopId: 'bombay-attic',
    shopName: 'The Bombay Attic',
    neighborhood: 'Lavelle Road',
    distance: '1.8 km',
    hours: '11:00 AM – 8:00 PM',
    address: '9/2, Walton Road, Off Lavelle Road, Bangalore',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    description: 'Gold-plated 92.5 silver base set with uncut polki and foil-backed hydrothermal emerald drops.',
    authenticityProof: '92.5 Silver Hallmark • Heritage Karigar Certified',
  },
  {
    id: 'brahmin-pass-1',
    name: "Brahmin's Coffee Bar 1932 Filter Coffee Pass",
    category: 'Heritage Eatery',
    price: 250,
    stockCount: 15,
    shopId: 'brahmins-coffee',
    shopName: "Brahmin's Coffee Bar",
    neighborhood: 'Shankarpuram',
    distance: '3.2 km',
    hours: '6:00 AM – 7:30 PM',
    address: 'Ranga Rao Road, Near Shankar Matt, Shankarpuram, Bangalore',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
    description: 'Complimentary traditional brass dabarah decoction filter coffee & hot vada pass for verified Locara explorers.',
    authenticityProof: 'Est. 1932 • Pure Chicory-Free Arabica/Robusta Blend',
  },
  {
    id: 'clay-drop-1',
    name: 'Wood-Fired Terracotta Serving Urn',
    category: 'Studio Ceramics',
    price: 4200,
    stockCount: 4,
    shopId: 'clay-station',
    shopName: 'Clay Station Art Studio',
    neighborhood: 'Sadashivanagar',
    distance: '2.5 km',
    hours: '10:00 AM – 7:00 PM',
    address: '1st Cross, Sadashivanagar, Bangalore',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop',
    description: 'Thrown on a kick wheel and reduction fired with natural wood ash glaze. Lead-free and food safe.',
    authenticityProof: 'Studio Seal Stamped • Artist: Ananya Sen',
  },
  {
    id: 'vintage-drop-1',
    name: 'British Colonial Brass Magnifying Glass',
    category: 'Antiques & Curios',
    price: 6800,
    stockCount: 2,
    shopId: 'balaji-antiques',
    shopName: 'Balaji Antiques & Curios',
    neighborhood: 'Commercial Street',
    distance: '2.1 km',
    hours: '11:00 AM – 9:00 PM',
    address: '64, Commercial Street, Bangalore',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
    description: 'Heavy solid brass reproduction crafted with antique dual-lens optics and rosewood handle.',
    authenticityProof: 'Vintage Collection Verified',
  },
  {
    id: 'perfume-drop-1',
    name: 'Mysore Sandalwood & Wild Jasmine Attar (12ml)',
    category: 'Natural Perfumery',
    price: 3200,
    stockCount: 6,
    shopId: 'gulab-singh',
    shopName: 'Gulabsingh Johrimal Bangalore Outpost',
    neighborhood: 'Malleshwaram',
    distance: '4.0 km',
    hours: '10:00 AM – 8:30 PM',
    address: '8th Cross, Sampige Road, Malleshwaram, Bangalore',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
    description: 'Hydro-distilled in copper deg-bhapka vessels with zero alcohol or synthetic boosters.',
    authenticityProof: 'GI Tagged Mysore Sandalwood Base',
  },
];

const CATEGORIES = ['All Drops', 'Handloom Textiles', 'Artisanal Jewellery', 'Studio Ceramics', 'Heritage Eatery', 'Antiques & Curios', 'Natural Perfumery'];

export default function ProductsCatalogPage() {
  const router = useRouter();
  const { user, createReservation, showToast } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Drops');
  const [reservationModalItem, setReservationModalItem] = useState<DropItem | null>(null);
  const [activeGeneratedPass, setActiveGeneratedPass] = useState<any | null>(null);

  // Modal form state
  const [phone, setPhone] = useState('+91 98450 99881');
  const [customerName, setCustomerName] = useState(user?.name || 'Rohan Mehta');
  const [pickupDate, setPickupDate] = useState('Tomorrow (Anytime 11 AM - 8 PM)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredDrops = VERIFIED_DROPS.filter((drop) => {
    const matchesCat = selectedCategory === 'All Drops' || drop.category === selectedCategory;
    const matchesSearch =
      drop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drop.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenReserveModal = (item: DropItem) => {
    setReservationModalItem(item);
    setActiveGeneratedPass(null);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationModalItem) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newPass = createReservation({
        productId: reservationModalItem.id,
        productName: reservationModalItem.name,
        productImage: reservationModalItem.image,
        price: reservationModalItem.price,
        shopId: reservationModalItem.shopId,
        shopName: reservationModalItem.shopName,
        shopAddress: reservationModalItem.address,
        shopPhone: '+91 80 4123 9988',
        customerName,
        customerPhone: phone,
        pickupDate,
        timeSlot: '11:00 AM - 8:00 PM',
      });
      setActiveGeneratedPass(newPass);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#faf9f4] text-[#1b1c19] selection:bg-[#f0e9ba]">
      {/* Header */}
      <ExplorerHeader
        query={searchQuery}
        onQueryChange={setSearchQuery}
        filters={DEFAULT_FILTERS}
        onFiltersChange={() => {}}
        totalResults={filteredDrops.length}
        onRefetch={() => {}}
        selectedCity="Bangalore"
        onCityChange={() => {}}
        onUseGps={() => {}}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-32">
        {/* Page Masthead */}
        <div className="border-b border-[#cbc6b8]/50 pb-8 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#efeee9] text-[#54512d] text-[11px] font-bold tracking-widest uppercase">
              <Sparkles className="w-3 h-3 text-[#6d6943]" />
              BANGALORE PHYSICAL INVENTORY
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1b1c19]">
                Verified Offline Drops
              </h1>
              <p className="text-xs sm:text-sm text-[#49473c] font-serif italic mt-1.5 max-w-2xl">
                Rare artisanal pieces and curated neighborhood specials reserved strictly for in-person counter pickup. Lock your item online with zero advance fees and pay upon inspection.
              </p>
            </div>

            <button
              onClick={() => router.push('/reservations')}
              className="self-start md:self-auto px-5 py-2.5 rounded-full bg-[#ffffff] border border-[rgba(72,55,47,0.15)] hover:border-[#54512d] text-xs font-bold text-[#1b1c19] shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#54512d]" />
              View My Active Passes →
            </button>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#48372f] text-[#faf9f4] shadow-sm'
                  : 'bg-[#ffffff] text-[#49473c] border border-[#cbc6b8]/60 hover:border-[#48372f]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Drops Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredDrops.map((drop) => (
            <div
              key={drop.id}
              className="editorial-card group flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Image Container with Floating Badges */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#efeee9]">
                  <img
                    src={drop.image}
                    alt={drop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#1b1c19]/80 backdrop-blur-md text-[#faf9f4] text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {drop.stockCount} LEFT IN ATELIER
                  </div>
                  <div className="absolute top-3 right-3 badge-distance backdrop-blur-md bg-[#ffffff]/90 shadow-sm">
                    <MapPin className="w-3 h-3 text-[#54512d]" />
                    {drop.distance}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div>
                    <span className="text-[11px] font-mono text-[#6d6943] uppercase tracking-wider block font-bold">
                      {drop.shopName} • {drop.neighborhood}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#1b1c19] mt-1 leading-snug group-hover:text-[#54512d] transition-colors">
                      {drop.name}
                    </h3>
                  </div>

                  <p className="text-xs text-[#49473c] line-clamp-2 leading-relaxed">
                    {drop.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-[#f5f4ef] border border-[#cbc6b8]/40 text-[11px] text-[#49473c] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#54512d] shrink-0" />
                    <span className="truncate">{drop.authenticityProof}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-[#cbc6b8]/40 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-[#7a776b] block font-mono uppercase">STORE PRICE</span>
                  <span className="font-serif text-lg font-bold text-[#1b1c19]">
                    ₹{drop.price.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenReserveModal(drop)}
                  className="btn-primary-irl text-xs py-2.5 px-4 shadow-sm"
                >
                  <span>Reserve In-Store Pass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 10% Advance Deposit & Reservation Modal */}
      {reservationModalItem && (
        <ReservationDepositModal
          item={{
            id: reservationModalItem.id,
            name: reservationModalItem.name,
            image: reservationModalItem.image,
            price: reservationModalItem.price,
            shopId: reservationModalItem.shopId,
            shopName: reservationModalItem.shopName,
            address: reservationModalItem.address,
            location: [12.9716, 77.6412],
          }}
          onClose={() => setReservationModalItem(null)}
        />
      )}

      <ExplorerNav />
      <Toast />
    </div>
  );
}
