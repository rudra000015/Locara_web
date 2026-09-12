'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, QrCode, Navigation, Store, CheckCircle2, AlertCircle, XCircle, ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useExplorerRuntimeStore } from '@/store/useExplorerRuntimeStore';
import PremiumButton from '@/components/ui/PremiumButton';
import ReservationConfirmationModal from './ReservationConfirmationModal';

export default function ReservationsPage() {
  const router = useRouter();
  const { user, showToast, navTo } = useStore();
  const { startTrip } = useExplorerRuntimeStore();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'>('ACTIVE');
  const [selectedForModal, setSelectedForModal] = useState<any | null>(null);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      const res = await fetch('/api/reservations', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReservations();
  }, []);

  const filtered = reservations.filter((r) => {
    if (activeTab === 'ACTIVE') return r.status === 'CONFIRMED' || r.status === 'ACTIVE' || r.status === 'VISITED';
    if (activeTab === 'COMPLETED') return r.status === 'COMPLETED';
    if (activeTab === 'EXPIRED') return r.status === 'EXPIRED';
    if (activeTab === 'CANCELLED') return r.status === 'CANCELLED';
    return true;
  });

  const handleStartNav = (r: any) => {
    if (r.shopLocation && r.shopLocation.length === 2) {
      startTrip({
        shopId: r.shopId,
        shopName: r.shopName,
        destination: { lat: r.shopLocation[0], lng: r.shopLocation[1] },
      });
      showToast(`Navigating to ${r.shopName}`);
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${r.shopLocation[0]},${r.shopLocation[1]}`,
        '_blank'
      );
    } else {
      navTo('map');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 mb-6 shadow-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-[#C8893F]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
            PHYSICAL STORE PICKUPS
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7]">
          My Reservations
        </h1>
        <p className="text-xs text-[#9E8B75] mt-1">
          Track locked physical items, view your pickup QR codes, and navigate directly to shops.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#F6EAD7]/10 mb-6 gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'ACTIVE', label: 'Active & In-Progress' },
          { id: 'COMPLETED', label: 'Completed Pickups' },
          { id: 'EXPIRED', label: 'Expired' },
          { id: 'CANCELLED', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#C8893F] text-[#E0AF62]'
                : 'border-transparent text-[#9E8B75] hover:text-[#F6EAD7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-[#17120E] skeleton-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 text-center max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-[#211A14] border border-[#F6EAD7]/10 flex items-center justify-center text-2xl mx-auto mb-3">
            🛍️
          </div>
          <h3 className="font-serif text-lg font-bold text-[#F6EAD7]">
            No {activeTab.toLowerCase()} reservations
          </h3>
          <p className="text-xs text-[#9E8B75] mt-1 mb-6">
            Reserve items online with a 10% deposit and visit your favorite local shops to complete purchase.
          </p>
          <PremiumButton variant="gold" size="md" onClick={() => navTo('home')} magnetic>
            Explore Local Stores
          </PremiumButton>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r, i) => {
            const item = r.items?.[0] || {};
            const isActive = r.status === 'CONFIRMED' || r.status === 'ACTIVE';

            return (
              <motion.div
                key={r.id || r.reservationNumber || i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="p-5 sm:p-6 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 hover:border-[#C8893F]/30 transition-all shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-[#211A14] border border-[#F6EAD7]/10 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#261D16] flex items-center justify-center text-2xl shrink-0">
                      🏛️
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#C8893F]/15 text-[#E0AF62] border border-[#C8893F]/30">
                        {r.reservationNumber}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1E5544]/20 text-[#2D7D64] border border-[#1E5544]/40 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Active in Store
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#F6EAD7] truncate">{item.name || 'Handcrafted Item'}</h3>
                    <p className="text-xs text-[#9E8B75] flex items-center gap-1.5 mt-0.5 truncate">
                      <Store className="w-3.5 h-3.5 text-[#C8893F]" />
                      {r.shopName}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                      <span className="text-[#E0AF62] font-bold">10% Paid: ₹{r.advanceAmount}</span>
                      <span className="text-[#9E8B75]">Remaining: ₹{r.remainingAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-row md:flex-col items-stretch gap-2 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#F6EAD7]/10">
                  <button
                    type="button"
                    onClick={() => setSelectedForModal(r)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-xs font-bold text-[#D8C4A7] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-[#C8893F]" /> View QR & OTP
                  </button>

                  {isActive && (
                    <button
                      type="button"
                      onClick={() => handleStartNav(r)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#C8893F] hover:bg-[#E0AF62] text-xs font-bold text-[#0E0B08] flex items-center justify-center gap-1.5 transition-all shadow-glow-sm cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" /> Start Navigation
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedForModal && (
        <ReservationConfirmationModal
          isOpen={Boolean(selectedForModal)}
          onClose={() => setSelectedForModal(null)}
          reservation={selectedForModal}
        />
      )}
    </div>
  );
}
