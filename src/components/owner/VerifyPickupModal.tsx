'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, QrCode, CheckCircle2, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { useStore } from '@/store/useStore';
import PremiumButton from '@/components/ui/PremiumButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reservationId?: string;
  onVerified?: () => void;
}

export default function VerifyPickupModal({ isOpen, onClose, reservationId, onVerified }: Props) {
  const { showToast } = useStore();
  const [otp, setOtp] = useState('');
  const [resIdInput, setResIdInput] = useState(reservationId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleVerify = async () => {
    const targetId = resIdInput.trim() || reservationId;
    if (!targetId && !otp.trim()) {
      setError('Please provide the reservation ID or 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token') || '';
      const res = await fetch(`/api/reservations/${targetId || 'direct'}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          otp: otp.trim(),
          verificationMethod: 'OTP',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed. Please check the code.');
      }

      setSuccessData(data.reservation);
      showToast('Pickup verified! Footfall count updated.');
      if (onVerified) onVerified();
    } catch (err: any) {
      setError(err?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md rounded-3xl bg-[#17120E] border border-[#F6EAD7]/15 p-6 sm:p-8 shadow-2xl relative my-8 text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#9E8B75] hover:text-[#F6EAD7] p-1.5 rounded-full hover:bg-white/5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {successData ? (
          <div className="py-4">
            <div className="w-16 h-16 rounded-3xl bg-[#1E5544]/30 border border-[#1E5544]/60 flex items-center justify-center text-[#2D7D64] mx-auto mb-4 shadow-glow-emerald">
              <CheckCircle2 className="w-9 h-9 text-[#2D7D64]" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#F6EAD7]">
              Pickup Verified!
            </h3>
            <p className="text-xs text-[#9E8B75] mt-1 mb-6">
              Customer store arrival recorded. Collect remaining in-store balance of{' '}
              <strong className="text-[#E0AF62]">₹{successData.remainingAmount}</strong>.
            </p>

            <div className="p-4 rounded-2xl bg-[#211A14] border border-[#F6EAD7]/10 text-left text-xs space-y-1.5 mb-6">
              <div className="flex justify-between">
                <span className="text-[#9E8B75]">Reservation ID:</span>
                <span className="font-mono font-bold text-[#F6EAD7]">{successData.reservationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9E8B75]">Customer:</span>
                <span className="font-bold text-[#F6EAD7]">{successData.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9E8B75]">10% Advance Received:</span>
                <span className="font-mono text-[#E0AF62]">₹{successData.advanceAmount}</span>
              </div>
            </div>

            <PremiumButton variant="gold" size="md" onClick={onClose} className="w-full">
              Done
            </PremiumButton>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#211A14] border border-[#C8893F]/30 flex items-center justify-center text-[#E0AF62] mx-auto mb-3 shadow-glow-sm">
              <QrCode className="w-6 h-6 text-[#C8893F]" />
            </div>

            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
              SELLER VERIFICATION
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#F6EAD7] mt-1 mb-2">
              Verify Customer Pickup
            </h3>
            <p className="text-xs text-[#9E8B75] mb-6">
              Enter the customer&apos;s 6-digit pickup OTP or Reservation ID to record the visit and confirm pickup.
            </p>

            <div className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-[#9E8B75] mb-1">
                  6-Digit Pickup OTP *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 492810"
                  className="w-full px-4 py-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-center font-mono text-xl tracking-widest text-[#E0AF62] placeholder-[#6E5D4B] outline-none focus:border-[#C8893F]"
                />
              </div>

              {!reservationId && (
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-[#9E8B75] mb-1">
                    Reservation ID (Optional if OTP provided)
                  </label>
                  <input
                    type="text"
                    value={resIdInput}
                    onChange={(e) => setResIdInput(e.target.value)}
                    placeholder="e.g. LOC-8829-1029"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs font-mono text-[#F6EAD7] placeholder-[#6E5D4B] outline-none focus:border-[#C8893F]"
                  />
                </div>
              )}
            </div>

            {error && (
              <p className="mt-4 p-3 rounded-xl bg-[#C24136]/15 border border-[#C24136]/30 text-xs text-[#C24136]">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-[#211A14] text-xs font-bold text-[#9E8B75] border border-[#F6EAD7]/10"
              >
                Cancel
              </button>
              <PremiumButton
                variant="gold"
                size="md"
                onClick={handleVerify}
                disabled={loading || !otp}
                className="flex-1"
                magnetic
              >
                {loading ? 'Verifying...' : 'Verify Pickup'}
              </PremiumButton>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
