'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';

export default function AnalyticsPage() {
  const { ownerShopName, ownerShopId, reservations } = useStore();
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('today');
  const rangeStart = new Date();
  if (timeRange === 'today') rangeStart.setHours(0, 0, 0, 0);
  else rangeStart.setDate(rangeStart.getDate() - (timeRange === '7days' ? 7 : 30));

  const rangeReservations = reservations.filter((reservation) =>
    reservation.shopId === ownerShopId && new Date(reservation.createdAt) >= rangeStart
  );
  const pickups = rangeReservations.filter((reservation) => reservation.status === 'COMPLETED').length;
  const revenue = rangeReservations
    .filter((reservation) => reservation.status !== 'CANCELLED')
    .reduce((total, reservation) => total + reservation.price, 0);
  const pickupRate = rangeReservations.length
    ? Math.round((pickups / rangeReservations.length) * 100)
    : 0;
  const stages = [
    { label: 'Reservations placed', count: rangeReservations.length, percent: rangeReservations.length ? 100 : 0 },
    { label: 'Pickups verified', count: pickups, percent: pickupRate },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#171717]">Store Analytics</h1>
          <p className="text-xs text-[#666666] mt-0.5">Reservation and pickup performance for {ownerShopName}.</p>
        </div>
        <div className="flex items-center gap-1 bg-[#F5F4F0] p-1 rounded-lg border border-[#E5E5E5]">
          {([
            { id: 'today', label: 'Today' },
            { id: '7days', label: '7 Days' },
            { id: '30days', label: '30 Days' },
          ] as const).map((range) => (
            <button key={range.id} type="button" onClick={() => setTimeRange(range.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${timeRange === range.id ? 'bg-white text-[#A85420] shadow-sm' : 'text-[#666666] hover:text-[#171717]'}`}>
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Reservations', value: rangeReservations.length, color: 'text-[#A85420]' },
          { label: 'Verified Pickups', value: pickups, color: 'text-[#16803C]' },
          { label: 'Reservation Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, color: 'text-[#171717]' },
          { label: 'Pickup Rate', value: `${pickupRate}%`, color: 'text-[#2563EB]' },
        ].map((metric) => (
          <div key={metric.label} className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm space-y-1">
            <span className="text-[11px] text-[#666666] font-medium block">{metric.label}</span>
            <span className={`text-xl font-black ${metric.color}`}>{metric.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-base text-[#171717]">Pickup Completion</h3>
          <p className="text-xs text-[#666666] mt-0.5">Reservations compared with verified pickups in this period</p>
        </div>
        <div className="space-y-4 max-w-2xl">
          {stages.map((stage) => (
            <div key={stage.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#171717]">
                <span>{stage.label}</span><span className="font-bold">{stage.count} ({stage.percent}%)</span>
              </div>
              <div className="w-full h-3 bg-[#F5F4F0] rounded-full overflow-hidden border border-[#E5E5E5]">
                <div className="h-full bg-[#A85420] rounded-full transition-all duration-500" style={{ width: `${stage.percent}%` }} />
              </div>
            </div>
          ))}
          {rangeReservations.length === 0 && <p className="text-xs text-[#666666]">No reservations in this period.</p>}
        </div>
      </div>
    </div>
  );
}
