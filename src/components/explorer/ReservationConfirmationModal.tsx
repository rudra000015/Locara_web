'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, QrCode, Navigation, Clock, Store, Copy, ArrowRight, Share2, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useExplorerRuntimeStore } from '@/store/useExplorerRuntimeStore';
import PremiumButton from '@/components/ui/PremiumButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reservation: any;
}

export default function ReservationConfirmationModal({ isOpen, onClose, reservation }: Props) {
  const router = useRouter();
  const { showToast, openShop, navTo } = useStore();
  const { startTrip } = useExplorerRuntimeStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !reservation) return null;

  const item = reservation.items?.[0] || {};
  const resNumber = reservation.reservationNumber || 'LOC-8829-1029';
  const otp = reservation.pickupOtp || '492810';

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    showToast('Pickup OTP copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStartNavigation = () => {
    if (reservation.shopLocation && reservation.shopLocation.length === 2) {
      startTrip({
        shopId: reservation.shopId,
        shopName: reservation.shopName,
        destination: {
          lat: reservation.shopLocation[0],
          lng: reservation.shopLocation[1],
        },
      });
      showToast(`Live navigation started for ${reservation.shopName}`);
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${reservation.shopLocation[0]},${reservation.shopLocation[1]}`,
        '_blank'
      );
    } else {
      showToast(`Heading to ${reservation.shopName}`);
      navTo('map');
    }
    onClose();
  };

  const handleViewAllReservations = () => {
    onClose();
    navTo('reservations');
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="w-full max-w-md rounded-3xl bg-[#17120E] border border-[#C8893F]/30 p-6 sm:p-8 shadow-2xl relative my-8 text-center"
      >
        {/* Glowing Success Badge */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#261D16] to-[#1B140F] border border-[#C8893F]/50 flex items-center justify-center text-[#E0AF62] text-3xl mx-auto mb-4 shadow-glow">
          <CheckCircle2 className="w-9 h-9 text-[#C8893F]" />
        </div>

        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#E0AF62]">
          RESERVATION CONFIRMED
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7] mt-1">
          Item Locked In-Store
        </h2>
        <p className="text-xs text-[#9E8B75] mt-1.5 max-w-xs mx-auto">
          Your reservation is active. Present this QR or 6-digit OTP when you arrive at the shop.
        </p>

        {/* QR Code & OTP Verification Box */}
        <div className="mt-6 p-5 rounded-3xl bg-[#211A14] border border-[#F6EAD7]/10 flex flex-col items-center">
          {/* Stylized QR Code Frame */}
          <div className="p-3 bg-white rounded-2xl shadow-md mb-3 border-4 border-[#0E0B08]">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                reservation.verificationQr || resNumber
              )}&bgcolor=ffffff&color=0e0b08`}
              alt="Pickup Verification QR"
              className="w-32 h-32 object-contain"
            />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-[#9E8B75] font-mono uppercase">PICKUP OTP:</span>
            <span className="font-mono text-xl font-bold tracking-widest text-[#E0AF62] bg-[#17120E] px-3 py-0.5 rounded-lg border border-[#C8893F]/30">
              {otp}
            </span>
            <button
              type="button"
              onClick={handleCopyOtp}
              title="Copy OTP"
              className="p-1 text-[#9E8B75] hover:text-[#F6EAD7]"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] font-mono text-[#6E5D4B] mt-2">
            ID: {resNumber}
          </p>
        </div>

        {/* Product & Store Snapshot */}
        <div className="mt-4 p-4 rounded-2xl bg-[#1B140F] border border-[#F6EAD7]/10 text-left text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#9E8B75] flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#C8893F]" /> Shop
            </span>
            <span className="font-bold text-[#F6EAD7]">{reservation.shopName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#9E8B75]">Product</span>
            <span className="font-semibold text-[#D8C4A7] truncate max-w-[180px]">{item.name || 'Selected Item'}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#F6EAD7]/10">
            <span className="text-[#9E8B75]">10% Paid Online:</span>
            <span className="font-mono font-bold text-[#E0AF62]">₹{reservation.advanceAmount?.toLocaleString('en-IN') || '250'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#9E8B75]">Balance at Store:</span>
            <span className="font-mono text-[#F6EAD7]">₹{reservation.remainingAmount?.toLocaleString('en-IN') || '2,249'}</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-col gap-2.5">
          <PremiumButton
            variant="gold"
            size="lg"
            onClick={handleStartNavigation}
            className="w-full"
            showArrow
            magnetic
          >
            Start Turn-by-Turn Navigation
          </PremiumButton>

          <button
            type="button"
            onClick={handleViewAllReservations}
            className="w-full py-3 rounded-xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-xs font-bold text-[#D8C4A7] transition-all cursor-pointer"
          >
            View Active Reservations
          </button>
        </div>
      </motion.div>
    </div>
  );
}
