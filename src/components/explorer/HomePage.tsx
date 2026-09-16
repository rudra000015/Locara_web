'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  MapPin,
  Clock,
  QrCode,
  Tag,
  Store,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  X,
  BookOpen,
  Coffee,
  Heart,
  Filter,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Shop } from '@/types/shop';
import { FilterState } from '@/data/categories';
import ReservationDepositModal from './ReservationDepositModal';

interface Props {
  query: string;
  filters: FilterState;
  shops: Shop[];
  loading: boolean;
  error: string | null;
  refetch: (q?: string) => void;
  onListShop: () => void;
}

const DROPS = [
  {
    id: 'maya-drop-1',
    name: 'Mulberry Katan Silk Saree',
    atelier: 'Maya Studio & Atelier',
    neighborhood: 'Indiranagar 100ft',
    price: 18500,
    distance: '0.4 km',
    stock: 3,
    address: '428, 100ft Road, Indiranagar, Bangalore',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    tag: 'Silk Mark Certified',
  },
  {
    id: 'bombay-drop-1',
    name: 'Hand-Cut Kundan Choker',
    atelier: 'The Bombay Attic',
    neighborhood: 'Lavelle Road',
    price: 34000,
    distance: '1.8 km',
    stock: 1,
    address: '9/2, Walton Road, Off Lavelle Road, Bangalore',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    tag: 'Karigar Masterpiece',
  },
  {
    id: 'clay-drop-1',
    name: 'Wood-Fired Terracotta Urn',
    atelier: 'Clay Station Studio',
    neighborhood: 'Sadashivanagar',
    price: 4200,
    distance: '2.5 km',
    stock: 4,
    address: '1st Cross, Sadashivanagar, Bangalore',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop',
    tag: 'Studio Stamped',
  },
  {
    id: 'vintage-drop-1',
    name: 'Colonial Brass Magnifier',
    atelier: 'Balaji Antiques',
    neighborhood: 'Commercial Street',
    price: 6800,
    distance: '2.1 km',
    stock: 2,
    address: '64, Commercial Street, Bangalore',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
    tag: 'Heritage Reproduction',
  },
];

const BAZAARS = [
  {
    slug: 'indiranagar-100ft',
    name: 'Indiranagar 100ft Cultural Mile',
    tagline: 'Artisanal ateliers, indie roasters & design studios',
    curatorNote: 'Best walked at 4:30 PM for golden hour courtyard access',
    shopCount: 24,
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'commercial-street',
    name: 'Commercial Street & Tasker Town',
    tagline: 'Centuries of bespoke tailoring, embroidery & silk houses',
    curatorNote: 'Bargain with respect in the inner alleys for raw textiles',
    shopCount: 52,
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'malleshwaram',
    name: 'Malleshwaram 8th Cross & Heritage Spine',
    tagline: 'Temple flower lanes, Mysore sandalwood & filter coffee institutions',
    curatorNote: 'Pair with Brahmin’s Coffee Bar filter decoction at 6:30 AM',
    shopCount: 38,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
  },
];

const STORIES = [
  {
    id: 'story-1',
    title: 'The Alchemist of 100ft Road: 40 Years of Natural Dyeing',
    author: 'Suniti Sharma',
    time: '4 min read',
    neighborhood: 'Indiranagar',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    quote: 'Synthetic color is flat. Indigo breathes with humidity and sunlight.',
  },
  {
    id: 'story-2',
    title: 'Why Bangalore’s Filter Coffee Decant Cannot Be Digitized',
    author: 'Arjun Nambiar',
    time: '6 min read',
    neighborhood: 'Shankarpuram',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
    quote: 'The froth in the brass dabarah tells you the water temperature before your lips do.',
  },
  {
    id: 'story-3',
    title: 'Preserving Mysore Zari: Inside a 3rd Generation Weaving Room',
    author: 'Meera Rao',
    time: '5 min read',
    neighborhood: 'Commercial Street',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    quote: 'A single saree takes 280 hours of hand pedal coordination.',
  },
];

export default function HomePage({}: Props) {
  const router = useRouter();
  const { user, createReservation, showToast } = useStore();

  const [reserveModalItem, setReserveModalItem] = useState<any | null>(null);
  const [confirmedPass, setConfirmedPass] = useState<any | null>(null);
  const [customerName, setCustomerName] = useState(user?.name || 'Rohan Mehta');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+91 98450 99881');
  const [pickupWindow, setPickupWindow] = useState('Tomorrow (3 PM - 7 PM)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Free coffee pass state
  const [claimedCoffee, setClaimedCoffee] = useState(false);

  const handleClaimCoffeePass = () => {
    const pass = createReservation({
      productId: 'brahmin-pass-1',
      productName: "Brahmin's Coffee Bar 1932 Filter Coffee Pass",
      productImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
      price: 250,
      shopId: 'brahmins-coffee',
      shopName: "Brahmin's Coffee Bar",
      shopAddress: 'Ranga Rao Road, Shankarpuram, Bangalore',
      shopPhone: '+91 80 2667 9999',
      shopLocation: [12.9463, 77.5684],
      customerName,
      customerPhone,
      pickupDate: 'Valid Today Anytime',
      timeSlot: '6:00 AM - 7:30 PM',
    });
    setClaimedCoffee(true);
    showToast(`Coffee Pass Claimed! OTP: ${pass.otp}`);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveModalItem) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const pass = createReservation({
        productId: reserveModalItem.id,
        productName: reserveModalItem.name,
        productImage: reserveModalItem.image,
        price: reserveModalItem.price,
        shopId: 'maya-studio',
        shopName: reserveModalItem.atelier,
        shopAddress: reserveModalItem.address,
        shopPhone: '+91 80 4123 9988',
        customerName,
        customerPhone,
        pickupDate: pickupWindow,
        timeSlot: '3:00 PM - 7:00 PM',
      });
      setConfirmedPass(pass);
    }, 400);
  };

  return (
    <div className="space-y-16 pb-24 text-[#1b1c19] selection:bg-[#f0e9ba]">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION: "The Return of the Tactile City"
          ───────────────────────────────────────────────────────────── */}
      <section className="relative rounded-3xl overflow-hidden border border-[rgba(72,55,47,0.12)] bg-[#ffffff] shadow-[0_12px_32px_-4px_rgba(72,55,47,0.06)] p-6 sm:p-12 lg:p-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (5 Cols): Editorial Masthead */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#efeee9] text-[#54512d] text-[11px] font-mono font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-[#54512d] animate-pulse" />
              INDIRANAGAR • BANGALORE EDITORIAL
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#1b1c19] leading-[1.1]">
              The Return of the <span className="italic font-normal text-[#54512d]">Tactile City</span>.
            </h1>

            <p className="text-sm sm:text-base text-[#49473c] leading-relaxed font-normal">
              Locara bridges independent physical craft with digital discovery. Reserve verified offline drop items with zero fee, walk your neighborhood, and pay upon real-world inspection.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push('/products')}
                className="btn-primary-irl text-sm py-3 px-6 shadow-md"
              >
                <span>Browse Verified Drops →</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/map')}
                className="btn-secondary-olive text-sm py-3 px-6"
              >
                <MapPin className="w-4 h-4" />
                <span>Live Walking Map</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 border-t border-[#cbc6b8]/40 grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="font-serif text-2xl font-bold text-[#1b1c19] block">120+</span>
                <span className="text-[11px] font-mono text-[#7a776b] uppercase">Ateliers</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-[#54512d] block">100%</span>
                <span className="text-[11px] font-mono text-[#7a776b] uppercase">Verified IRL</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-[#6e5a51] block">48H</span>
                <span className="text-[11px] font-mono text-[#7a776b] uppercase">Free Holds</span>
              </div>
            </div>
          </div>

          {/* Right Column (7 Cols): Staggered Asymmetric Image Gallery */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-[rgba(72,55,47,0.15)] shadow-sm relative group">
                <img
                  src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop"
                  alt="Bangalore Courtyard"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-3 left-3 right-3 bg-[#ffffff]/90 backdrop-blur-md p-2.5 rounded-xl text-[11px] font-bold text-[#1b1c19]">
                  📍 100ft Road Courtyard Atelier
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#f5f4ef] border border-[#cbc6b8]/50 text-center space-y-1">
                <span className="text-[10px] font-mono text-[#54512d] uppercase font-bold">COMMUNITY CURATION</span>
                <p className="font-serif text-xs font-bold text-[#1b1c19]">
                  &ldquo;Support the hands that weave your city.&rdquo;
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="p-4 rounded-2xl bg-[#f0e9ba]/30 border border-[#54512d]/30 space-y-1.5">
                <span className="text-[10px] font-mono text-[#54512d] font-bold uppercase">TODAY&apos;S SPOTLIGHT</span>
                <h4 className="font-serif text-sm font-bold text-[#1b1c19]">Maya Studio & Weavers</h4>
                <p className="text-[11px] text-[#49473c]">Mulberry katan handloom drop just added.</p>
              </div>

              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-[rgba(72,55,47,0.15)] shadow-sm relative group">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop"
                  alt="Silk Weave"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 badge-curator backdrop-blur-md bg-[#ffffff]/90">
                  ★ Curators Pick
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. EXPLORER PASS BANNER: Brahmin's Coffee Bar
          ───────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-[rgba(72,55,47,0.12)] bg-[#faf9f4] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#54512d] text-[#f0e9ba] flex items-center justify-center shrink-0 shadow-sm">
            <Coffee className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#f0e9ba] text-[#54512d] text-[10px] font-mono font-bold uppercase">
                HERITAGE EXPLORER PERK
              </span>
              <span className="text-[11px] text-[#7a776b]">Est. 1932 Shankarpuram</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1b1c19] mt-1">
              Brahmin&apos;s Coffee Bar • Traditional Filter Coffee Pass
            </h3>
            <p className="text-xs text-[#49473c] mt-0.5">
              Locara Level 3 explorers receive a complimentary freshly brewed brass dabarah decoction.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClaimCoffeePass}
          disabled={claimedCoffee}
          className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
            claimedCoffee
              ? 'bg-[#e8f5e9] text-[#2e7d32] border border-[#2e7d32]'
              : 'bg-[#48372f] hover:bg-[#3d2d26] text-[#faf9f4] shadow-sm'
          }`}
        >
          {claimedCoffee ? '✓ Pass Saved in Reservations' : 'Claim In-Store Pass (Free) →'}
        </button>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. VERIFIED OFFLINE DROPS (Physical Inventory)
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#cbc6b8]/50 pb-4">
          <div>
            <span className="text-[10px] font-mono text-[#54512d] font-bold uppercase tracking-widest block mb-1">
              PHYSICAL INVENTORY IN YOUR NEIGHBORHOOD
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1b1c19]">
              Verified Offline Drops
            </h2>
          </div>

          <button
            onClick={() => router.push('/products')}
            className="text-xs font-bold text-[#54512d] hover:text-[#1b1c19] underline underline-offset-4 decoration-[#c8a1b1] self-start sm:self-auto"
          >
            View All 48 Drops →
          </button>
        </div>

        {/* Drops Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DROPS.map((item) => (
            <div
              key={item.id}
              className="editorial-card group flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="relative aspect-[4/3] bg-[#efeee9] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 badge-distance backdrop-blur-md bg-[#ffffff]/90">
                    <MapPin className="w-3 h-3 text-[#54512d]" />
                    {item.distance}
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#1b1c19]/80 text-[#faf9f4] text-[9px] font-mono uppercase">
                    {item.stock} left in atelier
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-mono text-[#6d6943] uppercase font-bold block">
                    {item.atelier} • {item.neighborhood}
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#1b1c19] leading-snug group-hover:text-[#54512d] transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-serif text-base font-bold text-[#1b1c19]">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-mono text-[#7a776b]">
                      48h hold
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() => {
                    setReserveModalItem(item);
                    setConfirmedPass(null);
                  }}
                  className="w-full py-2.5 rounded-full bg-[#48372f] hover:bg-[#3d2d26] text-[#faf9f4] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Reserve In-Store Pass</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. ATELIER OF THE WEEK SPOTLIGHT
          ───────────────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-[rgba(72,55,47,0.12)] bg-[#ffffff] p-6 sm:p-12 shadow-[0_12px_32px_-4px_rgba(72,55,47,0.06)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="px-3 py-1 rounded-full bg-[#f0e9ba] text-[#54512d] text-[10px] font-mono font-bold uppercase tracking-wider inline-block">
              ATELIER OF THE WEEK
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1b1c19]">
              Maya Studio & Weavers
            </h2>
            <p className="text-xs sm:text-sm text-[#49473c] leading-relaxed">
              Founded on Indiranagar 100ft Road, Maya Studio collaborates with master pit-loom weavers from Gadag and Kanchipuram to preserve authentic handloom pure silks and vegetable-dyed ikats.
            </p>

            <div className="space-y-2 pt-2 text-xs text-[#49473c]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#54512d]" />
                <span>428, 100ft Road, Indiranagar, Bangalore</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#54512d]" />
                <span>Open Today: 10:30 AM – 8:30 PM • Walk-ins Welcomed</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={() => router.push('/shops/maya-studio')}
                className="btn-primary-irl text-xs py-2.5 px-5"
              >
                Visit Atelier Profile →
              </button>
              <button
                onClick={() => {
                  window.open('https://www.google.com/maps/dir/?api=1&destination=12.9716,77.6412', '_blank');
                }}
                className="btn-secondary-olive text-xs py-2.5 px-5"
              >
                Get Directions
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop"
              alt="Maya Rao"
              className="w-full aspect-[4/5] object-cover rounded-2xl border border-[#cbc6b8]"
            />
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop"
              alt="Silk Loom"
              className="w-full aspect-[4/5] object-cover rounded-2xl border border-[#cbc6b8]"
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. HOW TO PURCHASE IN PERSON (3 Steps)
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#faf9f4] border border-[rgba(72,55,47,0.12)] rounded-3xl p-6 sm:p-12 text-center space-y-8">
        <div>
          <span className="text-[10px] font-mono text-[#54512d] font-bold uppercase tracking-widest">
            THE TACTILE COMMERCE PROTOCOL
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1b1c19] mt-1">
            How to Purchase In Person
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-[#ffffff] border border-[rgba(72,55,47,0.12)] shadow-sm space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#efeee9] text-[#54512d] font-bold flex items-center justify-center font-mono text-sm">
              01
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1b1c19]">Lock Online</h3>
            <p className="text-xs text-[#49473c] leading-relaxed">
              Find limited offline drops in your neighborhood and reserve your unit with a single click. Zero advance fee required.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#ffffff] border border-[rgba(72,55,47,0.12)] shadow-sm space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#efeee9] text-[#54512d] font-bold flex items-center justify-center font-mono text-sm">
              02
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1b1c19]">Walk to Atelier</h3>
            <p className="text-xs text-[#49473c] leading-relaxed">
              Follow turn-by-turn walking routes through historic bazaars, discover hidden alleys, and meet the artisans.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#ffffff] border border-[rgba(72,55,47,0.12)] shadow-sm space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#efeee9] text-[#54512d] font-bold flex items-center justify-center font-mono text-sm">
              03
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1b1c19]">Inspect & Pay</h3>
            <p className="text-xs text-[#49473c] leading-relaxed">
              Show your 6-digit OTP code at the counter. Feel the textile weight, inspect stitching, and complete counter checkout.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. CULTURAL BAZAARS & MARKETS
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#cbc6b8]/50 pb-4">
          <div>
            <span className="text-[10px] font-mono text-[#54512d] font-bold uppercase tracking-widest block mb-1">
              NEIGHBORHOOD WALKING TRAILS
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1b1c19]">
              Cultural Bazaars & Markets
            </h2>
          </div>
          <button
            onClick={() => router.push('/markets')}
            className="text-xs font-bold text-[#54512d] hover:underline"
          >
            All Markets →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BAZAARS.map((bazaar) => (
            <div
              key={bazaar.slug}
              onClick={() => router.push(`/markets/${bazaar.slug}`)}
              className="editorial-card group cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] bg-[#efeee9] overflow-hidden relative">
                  <img
                    src={bazaar.image}
                    alt={bazaar.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#1b1c19]/80 text-[#faf9f4] text-[10px] font-mono">
                    {bazaar.shopCount} Verified Ateliers
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-serif text-lg font-bold text-[#1b1c19] group-hover:text-[#54512d] transition-colors">
                    {bazaar.name}
                  </h3>
                  <p className="text-xs text-[#49473c] leading-relaxed">
                    {bazaar.tagline}
                  </p>
                  <p className="text-[11px] text-[#54512d] italic font-serif pt-1">
                    &ldquo;{bazaar.curatorNote}&rdquo;
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between text-xs font-bold text-[#54512d]">
                <span>Explore Walking Trail</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. SECRET ADDRESS BOOK CHRONICLES
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#cbc6b8]/50 pb-4">
          <div>
            <span className="text-[10px] font-mono text-[#54512d] font-bold uppercase tracking-widest block mb-1">
              FIELD NOTES & ESSAYS
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1b1c19]">
              The Secret Address Book
            </h2>
          </div>
          <button
            onClick={() => router.push('/stories')}
            className="text-xs font-bold text-[#54512d] hover:underline"
          >
            All Field Notes →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STORIES.map((story) => (
            <div
              key={story.id}
              onClick={() => router.push('/stories')}
              className="p-6 rounded-2xl bg-[#ffffff] border border-[rgba(72,55,47,0.12)] hover:border-[#54512d]/40 shadow-sm transition-all space-y-4 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-[#efeee9]">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#7a776b]">
                  <span>{story.neighborhood}</span>
                  <span>{story.time}</span>
                </div>
                <h3 className="font-serif text-base font-bold text-[#1b1c19] leading-snug">
                  {story.title}
                </h3>
                <p className="text-xs text-[#54512d] font-serif italic">
                  &ldquo;{story.quote}&rdquo;
                </p>
              </div>

              <span className="text-[11px] font-bold text-[#48372f] block pt-2 border-t border-[#cbc6b8]/40">
                By {story.author} →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
          10% ADVANCE PAYMENT & RESERVATION MODAL
          ───────────────────────────────────────────────────────────── */}
      {reserveModalItem && (
        <ReservationDepositModal
          item={{
            id: reserveModalItem.id,
            name: reserveModalItem.name,
            image: reserveModalItem.image,
            price: reserveModalItem.price,
            shopId: 'maya-studio',
            shopName: reserveModalItem.atelier,
            address: reserveModalItem.address,
            location: [12.9716, 77.6412],
          }}
          onClose={() => setReserveModalItem(null)}
        />
      )}
    </div>
  );
}
