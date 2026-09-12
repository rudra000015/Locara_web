'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, QrCode, Clock, CheckCircle2, User, Phone, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import VerifyPickupModal from './VerifyPickupModal';
import PremiumButton from '@/components/ui/PremiumButton';

export default function SellerReservationsPage() {
  const { ownerShopId, ownerShopName, showToast } = useStore();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'CONFIRMED' | 'COMPLETED' | 'EXPIRED'>('CONFIRMED');
  const [verifyingReservation, setVerifyingReservation] = useState<any | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      const res = await fetch(`/api/reservations?shopId=${ownerShopId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [ownerShopId]);

  useEffect(() => {
    void fetchReservations();
  }, [fetchReservations]);

  const filtered = reservations.filter((r) => {
    if (activeTab === 'CONFIRMED') return r.status === 'CONFIRMED' || r.status === 'ACTIVE';
    if (activeTab === 'COMPLETED') return r.status === 'COMPLETED';
    if (activeTab === 'EXPIRED') return r.status === 'EXPIRED' || r.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <CalendarCheck className="w-4 h-4 text-[#C8893F]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
              CUSTOMER RESERVATION MANAGER
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7]">
            Store Reservations & Pickups
          </h2>
          <p className="text-xs text-[#9E8B75] mt-1">
            Manage advance deposits, verify customer arrivals with QR/OTP, and record footfall.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setVerifyingReservation({ direct: true })}
          className="px-4 py-2.5 rounded-xl bg-[#C8893F] hover:bg-[#E0AF62] text-xs font-bold text-[#0E0B08] flex items-center gap-2 shadow-glow-sm cursor-pointer shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span>Verify Pickup OTP</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#F6EAD7]/10 gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'CONFIRMED', label: `Awaiting Pickup (${reservations.filter((r) => r.status === 'CONFIRMED' || r.status === 'ACTIVE').length})` },
          { id: 'COMPLETED', label: `Completed (${reservations.filter((r) => r.status === 'COMPLETED').length})` },
          { id: 'EXPIRED', label: 'Expired & Cancelled' },
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

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-[#17120E] skeleton-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 text-center max-w-md mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-[#211A14] flex items-center justify-center text-2xl mx-auto mb-3">
            📋
          </div>
          <h3 className="font-serif text-lg font-bold text-[#F6EAD7]">No reservations found</h3>
          <p className="text-xs text-[#9E8B75] mt-1">
            New explorer reservations for {ownerShopName} will appear here with instant pickup validation codes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r, i) => {
            const item = r.items?.[0] || {};
            const isAwaiting = r.status === 'CONFIRMED' || r.status === 'ACTIVE';

            return (
              <motion.div
                key={r.id || r.reservationNumber || i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 sm:p-6 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 hover:border-[#C8893F]/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover bg-[#211A14] border border-[#F6EAD7]/10 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#261D16] flex items-center justify-center text-2xl shrink-0">
                      🏛️
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#E0AF62]">
                        {r.reservationNumber}
                      </span>
                      <span className="text-xs text-[#9E8B75]">•</span>
                      <span className="text-xs text-[#F6EAD7] flex items-center gap-1">
                        <User className="w-3 h-3 text-[#C8893F]" /> {r.userName}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base text-[#F6EAD7] truncate">{item.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-[#9E8B75] mt-0.5">
                      <span>Qty: {item.quantity || 1}</span>
                      {item.size && <span>• Size: {item.size}</span>}
                      {item.color && <span>• Color: {item.color}</span>}
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                      <span className="text-[#2D7D64] font-bold">10% Advance: ₹{r.advanceAmount}</span>
                      <span className="text-[#E0AF62] font-bold">Collect In-Store: ₹{r.remainingAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#F6EAD7]/10">
                  {isAwaiting && (
                    <button
                      type="button"
                      onClick={() => setVerifyingReservation(r)}
                      className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#C8893F] hover:bg-[#E0AF62] text-xs font-bold text-[#0E0B08] flex items-center justify-center gap-2 shadow-glow-sm cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" /> Verify Customer Pickup
                    </button>
                  )}
                  {r.status === 'COMPLETED' && (
                    <span className="px-3 py-1.5 rounded-xl bg-[#1E5544]/20 border border-[#1E5544]/40 text-xs font-bold text-[#2D7D64] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Verified & Completed
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Verify Pickup Modal */}
      {verifyingReservation && (
        <VerifyPickupModal
          isOpen={Boolean(verifyingReservation)}
          onClose={() => {
            setVerifyingReservation(null);
            void fetchReservations();
          }}
          reservationId={verifyingReservation.reservationNumber || verifyingReservation.id}
          onVerified={() => void fetchReservations()}
        />
      )}
    </div>
  );
}
