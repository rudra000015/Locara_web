'use client';

import React, { useState } from 'react';
import { Calendar, QrCode, Clock, CheckCircle2, User, Phone, ShoppingBag } from 'lucide-react';
import { useStore } from '@/store/useStore';
import VerifyPickupModal from './VerifyPickupModal';

export default function SellerReservationsPage() {
  const { reservations, ownerShopId } = useStore();
  const shopReservations = reservations.filter((reservation) => reservation.shopId === ownerShopId);
  const [activeTab, setActiveTab] = useState<'CONFIRMED' | 'COMPLETED' | 'ALL'>('CONFIRMED');
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  const filtered = shopReservations.filter((r) => {
    if (activeTab === 'CONFIRMED') return r.status === 'CONFIRMED';
    if (activeTab === 'COMPLETED') return r.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#171717]">
            Store Reservations & Pickups
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Manage customer pickup orders, verify arrivals with OTP/QR, and collect in-store balances.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsVerifyOpen(true)}
          className="px-4 py-2 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span>Verify Pickup</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E5E5] gap-2">
        {(
          [
            { id: 'CONFIRMED', label: `Awaiting Pickup (${shopReservations.filter((r) => r.status === 'CONFIRMED').length})` },
            { id: 'COMPLETED', label: `Completed (${shopReservations.filter((r) => r.status === 'COMPLETED').length})` },
            { id: 'ALL', label: `All Orders (${shopReservations.length})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#A85420] text-[#A85420]'
                : 'border-transparent text-[#666666] hover:text-[#171717]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center text-xs text-[#666666]">
          No reservations found in this category.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((res) => (
            <div
              key={res.id}
              className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-[#F5F4F0] overflow-hidden border border-[#E5E5E5] shrink-0">
                  <img
                    src={res.productImage}
                    alt={res.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#171717] bg-[#F5F4F0] px-2 py-0.5 rounded border border-[#E5E5E5]">
                      {res.otp}
                    </span>
                    <span className="font-bold text-sm text-[#171717]">{res.customerName}</span>
                  </div>
                  <p className="text-xs text-[#666666]">
                    {res.productName} • Pickup: <strong className="text-[#171717]">{res.pickupDate} ({res.timeSlot})</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E5E5E5]">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#16803C] font-semibold block">
                    Paid Online: ₹{res.advancePaid}
                  </span>
                  <span className="text-sm font-bold text-[#A85420]">
                    Collect: ₹{res.balanceDue}
                  </span>
                </div>

                {res.status === 'CONFIRMED' && (
                  <button
                    type="button"
                    onClick={() => setIsVerifyOpen(true)}
                    className="px-4 py-2 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Verify
                  </button>
                )}
                {res.status === 'COMPLETED' && (
                  <span className="px-3 py-1 bg-[#EBF8F0] text-[#16803C] text-xs font-bold rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Collected</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isVerifyOpen && (
        <VerifyPickupModal onClose={() => setIsVerifyOpen(false)} />
      )}
    </div>
  );
}
