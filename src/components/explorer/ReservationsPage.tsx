'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  Navigation,
  Store,
  CheckCircle2,
  Phone,
  Copy,
  Check,
  Clock,
  MapPin,
  Ticket,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { useStore, ReservationPass } from '@/store/useStore';
import { gmapsUrl } from '@/data/shops';

export default function ReservationsPage() {
  const router = useRouter();
  const { reservations, cancelReservation, navTo, showToast } = useStore();

  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ALL'>('ACTIVE');
  const [timeLeft, setTimeLeft] = useState('47h : 32m : 10s');

  // Simulated countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = 47 - (now.getHours() % 12);
      const mins = 59 - now.getMinutes();
      const secs = 59 - now.getSeconds();
      setTimeLeft(`${hours}h : ${mins < 10 ? '0' : ''}${mins}m : ${secs < 10 ? '0' : ''}${secs}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activePasses = reservations.filter((r) => r.status === 'CONFIRMED');
  const primaryPass = activePasses[0] || reservations[0];

  const handleCopyCode = (code: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopiedOtp(code);
      showToast(`Copied Pickup Code ${code}`);
      setTimeout(() => setCopiedOtp(null), 2000);
    }
  };

  const handleNavigate = (pass: ReservationPass) => {
    const loc = pass.shopLocation || [28.9845, 77.7064];
    window.open(gmapsUrl(loc, pass.shopName), '_blank');
  };

  const handleCall = (pass: ReservationPass) => {
    if (pass.shopPhone) {
      window.location.href = `tel:${pass.shopPhone}`;
    }
  };

  if (!primaryPass) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-12 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#F5F4F0] text-[#8A8A8A] flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#171717]">No Active Reservations</h2>
          <p className="text-xs text-[#666666] max-w-sm mx-auto">
            Browse local shops, select products, and reserve with 10% advance deposit for guaranteed store collection.
          </p>
          <button
            type="button"
            onClick={() => {
              navTo('home');
              router.push('/');
            }}
            className="px-6 py-2.5 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <span>Browse Shops</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 space-y-8">
      {/* ── 1. Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171717]">Your Pickup Pass</h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Present this code or QR pass at the shop counter to collect your order.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EBF8F0] text-[#16803C] border border-[#A7F3D0]">
          <span className="w-2 h-2 rounded-full bg-[#16803C]" />
          Reserved
        </span>
      </div>

      {/* ── 2. Digital Pickup Pass Card (Mockup Screen 6) ───── */}
      <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl overflow-hidden shadow-md">
        {/* Pass Header */}
        <div className="bg-[#FAFAF8] px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#A85420] text-white flex items-center justify-center font-bold text-sm">
              L
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider block">
                LOCARA IN-STORE PICKUP PASS
              </span>
              <span className="text-xs font-bold text-[#171717]">Order ID: {primaryPass.otp}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#666666] block">Status</span>
            <span className="text-xs font-bold text-[#16803C]">● Ready for Pickup</span>
          </div>
        </div>

        {/* Main Pass Body (QR + Shop Info) */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* QR Code & OTP Column */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-[#FAFAF8] rounded-xl border border-[#E5E5E5] text-center space-y-3">
            <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider">
              Pickup Code
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-[#171717] tracking-wider bg-white px-4 py-1.5 rounded-lg border border-[#E5E5E5] shadow-sm flex items-center gap-2">
              <span>{primaryPass.otp}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(primaryPass.otp)}
                className="text-[#8A8A8A] hover:text-[#A85420]"
                title="Copy Code"
              >
                {copiedOtp === primaryPass.otp ? (
                  <Check className="w-4 h-4 text-[#16803C]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Generated QR Graphic */}
            <div className="w-36 h-36 bg-white p-2.5 rounded-xl border border-[#E5E5E5] shadow-sm flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  primaryPass.otp
                )}`}
                alt="Pickup QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-[10px] text-[#8A8A8A]">
              Show QR code to merchant at counter
            </p>
          </div>

          {/* Shop Details & Payment Breakdown Column */}
          <div className="md:col-span-7 space-y-4">
            {/* Shop info */}
            <div className="flex items-start justify-between border-b border-[#E5E5E5] pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base text-[#171717]">{primaryPass.shopName}</h3>
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] fill-[#2563EB]/10" />
                </div>
                <p className="text-xs text-[#666666] mt-0.5">{primaryPass.shopAddress}</p>
              </div>

              <span className="text-xs font-semibold text-[#16803C] bg-[#EBF8F0] px-2 py-0.5 rounded">
                ● Open
              </span>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3 bg-[#F5F4F0] p-3 rounded-lg text-xs">
              <div>
                <span className="text-[#666666] block text-[11px]">Pickup Date:</span>
                <span className="font-bold text-[#171717]">{primaryPass.pickupDate}</span>
              </div>
              <div>
                <span className="text-[#666666] block text-[11px]">Pickup Time:</span>
                <span className="font-bold text-[#171717]">{primaryPass.timeSlot}</span>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#666666]">
                <span>Total Item Value:</span>
                <span className="font-semibold text-[#171717]">
                  ₹{primaryPass.price.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-[#16803C] font-semibold">
                <span>Paid Online (10% Deposit):</span>
                <span>₹{primaryPass.advancePaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#171717] font-bold pt-1 border-t border-[#E5E5E5]">
                <span>Pay at Shop Counter (90%):</span>
                <span className="text-[#A85420]">
                  ₹{primaryPass.balanceDue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleNavigate(primaryPass)}
                className="flex-1 py-2.5 px-4 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Navigate to Shop</span>
              </button>

              <button
                type="button"
                onClick={() => handleCall(primaryPass)}
                className="py-2.5 px-4 bg-[#F5F4F0] hover:bg-[#EAE8E2] text-[#171717] text-xs font-semibold rounded-lg transition-colors border border-[#E5E5E5] flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Shop</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pass Expiration Bar */}
        <div className="bg-[#F5F4F0] px-6 py-3 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#666666] gap-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#A85420]" />
            <span>Pass expires in:</span>
            <span className="font-mono font-bold text-[#171717]">{timeLeft}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to cancel this reservation pass?')) {
                cancelReservation(primaryPass.id);
              }
            }}
            className="text-[11px] text-[#8A8A8A] hover:text-[#DC2626] transition-colors"
          >
            Cancel Reservation
          </button>
        </div>
      </div>

      {/* ── 3. Your Items Section ──────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#171717]">Your Items</h2>

        <div className="bg-white border border-[#E5E5E5] rounded-xl divide-y divide-[#E5E5E5] shadow-sm">
          <div className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-[#F5F4F0] overflow-hidden shrink-0 border border-[#E5E5E5]">
              <img
                src={primaryPass.productImage}
                alt={primaryPass.productName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-[#171717] truncate">
                {primaryPass.productName}
              </h4>
              <p className="text-xs text-[#666666] mt-0.5 font-medium">
                {primaryPass.shopName}
              </p>
            </div>

            <div className="text-right">
              <span className="font-bold text-sm text-[#171717]">
                ₹{primaryPass.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[#8A8A8A] block">Qty: 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
