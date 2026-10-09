'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  Users,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  Plus,
  QrCode,
  Store,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import VerifyPickupModal from './VerifyPickupModal';

export default function ShowcasePage() {
  const router = useRouter();
  const { ownerShopId, ownerShopName, ownerNavTo, reservations, shopProfiles, updateShopProfile, showToast } = useStore();
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const isOpenToggle = shopProfiles[ownerShopId]?.isOpen ?? true;

  // Mocked/Live recent reservations matching the mockup
  const shopReservations = reservations.filter((reservation) => reservation.shopId === ownerShopId);
  const recentReservations = shopReservations.slice(0, 4).map((reservation) => {
    const completed = reservation.status === 'COMPLETED';
    const cancelled = reservation.status === 'CANCELLED';
    return {
      id: reservation.otp,
      customer: reservation.customerName,
      items: 1,
      pickupTime: reservation.timeSlot,
      status: completed ? 'Picked Up' : cancelled ? 'Cancelled' : 'Reserved',
      statusColor: completed ? 'bg-[#EFF6FF] text-[#2563EB]' : cancelled ? 'bg-[#FEE2E2] text-[#B91C1C]' : 'bg-[#FEF3C7] text-[#D97706]',
      total: reservation.price,
    };
  });
  const activeCount = shopReservations.filter((reservation) => reservation.status === 'CONFIRMED' || reservation.status === 'VISITED').length;
  const completedCount = shopReservations.filter((reservation) => reservation.status === 'COMPLETED').length;
  const revenue = shopReservations.filter((reservation) => reservation.status !== 'CANCELLED').reduce((sum, reservation) => sum + reservation.price, 0);
  const todayKey = new Date().toDateString();
  const todayReservations = shopReservations.filter((reservation) => new Date(reservation.createdAt).toDateString() === todayKey && reservation.status !== 'CANCELLED');
  const todayRevenue = todayReservations.reduce((sum, reservation) => sum + reservation.price, 0);
  const salesHours = [9, 12, 15, 18, 21];
  const salesByHour = salesHours.map((hour) => todayReservations
    .filter((reservation) => new Date(reservation.createdAt).getHours() >= hour && new Date(reservation.createdAt).getHours() < hour + 3)
    .reduce((sum, reservation) => sum + reservation.price, 0));
  const maxSalesHour = Math.max(...salesByHour, 1);
  const formatMoney = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
  const toggleStoreStatus = async () => {
    const isOpen = !isOpenToggle;
    updateShopProfile(ownerShopId, { isOpen });
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      const response = await fetch('/api/owner/shop', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isOpen }),
      });
      if (!response.ok) throw new Error('Could not save store status');
    } catch {
      updateShopProfile(ownerShopId, { isOpen: !isOpen });
      showToast('Store status could not be saved. Please try again.');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ── 1. Top Bar / Header ────────────────────────────── */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#171717]">
            Dashboard
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Managing <strong className="text-[#171717]">{ownerShopName}</strong> • Real-time in-store pickup operations
          </p>
        </div>

        {/* Store Open/Closed Toggle */}
        <div className="flex items-center gap-3 bg-[#F5F4F0] p-1.5 px-3 rounded-lg border border-[#E5E5E5]">
          <span className="text-xs font-bold text-[#171717]">Store Status:</span>
          <button
            type="button"
            onClick={toggleStoreStatus}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              isOpenToggle
                ? 'bg-[#16803C] text-white shadow-sm'
                : 'bg-[#DC2626] text-white shadow-sm'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>{isOpenToggle ? 'Open' : 'Closed'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. 4 Stat Metric Cards (Mockup Screen 7) ────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-[#666666] block">Shop Reservations</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-[#171717]">{shopReservations.length}</span>
            <span className="text-[10px] font-bold text-[#666666] bg-[#F5F4F0] px-1.5 py-0.5 rounded">All time</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-[#666666] block">Reserved Drops</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-[#171717]">{activeCount}</span>
            <span className="text-[10px] font-bold text-[#A85420] bg-[#FBF3EE] px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-[#666666] block">Total Revenue</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-[#171717]">{formatMoney(revenue)}</span>
            <span className="text-[10px] font-bold text-[#666666] bg-[#F5F4F0] px-1.5 py-0.5 rounded">All time</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-xs font-medium text-[#666666] block">Verified Pickups</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-[#171717]">{completedCount}</span>
            <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded">
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Recent Reservations Table ────────────────────── */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#171717]">Recent Reservations</h3>
            <p className="text-xs text-[#666666]">Customer orders waiting for in-store collection</p>
          </div>

          <button
            type="button"
            onClick={() => ownerNavTo('reservations')}
            className="text-xs font-bold text-[#A85420] hover:text-[#873F17] flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Table for Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF8] border-b border-[#E5E5E5] text-[#666666] font-semibold">
              <tr>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Pickup Time</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-[#171717]">
              {recentReservations.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-xs text-[#666666]">No reservations for this shop yet.</td></tr>
              )}
              {recentReservations.map((res) => (
                <tr key={res.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-bold block">{res.customer}</span>
                    <span className="text-[10px] text-[#8A8A8A] font-mono">{res.id}</span>
                  </td>
                  <td className="px-5 py-3.5 font-medium">{res.items} items</td>
                  <td className="px-5 py-3.5 font-medium">{res.pickupTime}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${res.statusColor}`}
                    >
                      {res.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {res.status !== 'Picked Up' && res.status !== 'Cancelled' ? <button
                      type="button"
                      onClick={() => setIsVerifyModalOpen(true)}
                      className="px-3 py-1 bg-[#F5F4F0] hover:bg-[#A85420] hover:text-white text-[#171717] font-semibold text-[11px] rounded transition-colors"
                    >
                      Verify
                    </button> : <span className="text-[10px] text-[#8A8A8A]">Done</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards for Mobile */}
        <div className="sm:hidden divide-y divide-[#E5E5E5] p-3 space-y-3">
          {recentReservations.map((res) => (
            <div key={res.id} className="p-3 bg-[#FAFAF8] rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-sm block">{res.customer}</span>
                  <span className="text-[10px] text-[#8A8A8A] font-mono">{res.id}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${res.statusColor}`}>
                  {res.status}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#666666]">
                <span>{res.items} items</span>
                <span>Pickup: {res.pickupTime}</span>
              </div>
              {res.status !== 'Picked Up' && res.status !== 'Cancelled' && <button
                type="button"
                onClick={() => setIsVerifyModalOpen(true)}
                className="w-full py-1.5 bg-[#A85420] text-white text-xs font-semibold rounded"
              >
                Verify Pickup
              </button>}
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Bottom Row: Quick Actions & Sales Chart ─────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions Card */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-base text-[#171717]">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => ownerNavTo('addproduct')}
              className="py-3 px-4 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>

            <button
              type="button"
              onClick={() => setIsVerifyModalOpen(true)}
              className="py-3 px-4 bg-[#F5F4F0] hover:bg-[#EAE8E2] text-[#171717] border border-[#E5E5E5] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4 text-[#A85420]" />
              <span>Verify Pickup</span>
            </button>
          </div>
        </div>

        {/* Today's Sales Chart Widget */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#171717]">Today&apos;s Sales</h3>
            <span className="text-sm font-black text-[#171717]">{formatMoney(todayRevenue)}</span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-28 flex items-end justify-between gap-3 pt-4 px-2">
            {salesHours.map((hour, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className="w-full bg-[#A85420]/80 hover:bg-[#A85420] rounded-t transition-all"
                  title={formatMoney(salesByHour[i])}
                  style={{ height: `${Math.max(salesByHour[i] ? 8 : 0, (salesByHour[i] / maxSalesHour) * 100)}%` }}
                />
                <span className="text-[10px] font-medium text-[#8A8A8A]">{hour % 12 || 12} {hour < 12 ? 'AM' : 'PM'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Verify Pickup Modal ──────────────────────────── */}
      {isVerifyModalOpen && (
        <VerifyPickupModal
          reservation={null}
          onClose={() => setIsVerifyModalOpen(false)}
        />
      )}
    </div>
  );
}
