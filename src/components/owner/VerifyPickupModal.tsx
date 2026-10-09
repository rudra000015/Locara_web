'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  QrCode,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Check,
  Camera,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props {
  reservation?: any | null;
  onClose: () => void;
  onVerified?: () => void;
  isOpen?: boolean;
}

export default function VerifyPickupModal({ onClose, onVerified }: Props) {
  const { redeemReservationByOtp, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'OTP' | 'QR'>('OTP');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedData, setVerifiedData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = cleanVal;
    setOtpDigits(updated);

    // Auto advance focus
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpDigits.join('').trim();
    if (fullOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the pickup code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const matching = useStore.getState().reservations.find((reservation) => reservation.otp === fullOtp || reservation.otp === `LOC-${fullOtp}`);
      const token = localStorage.getItem('auth_token');
      if (token && matching) {
        const response = await fetch(`/api/reservations/${encodeURIComponent(matching.id)}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ otp: fullOtp, verificationMethod: 'OTP' }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Unable to verify this pickup');
      }

      const res = redeemReservationByOtp(fullOtp);
      if (!res.success || !res.reservation) throw new Error(res.message);
      setVerifiedData({
        customer: res.reservation.customerName,
        orderId: res.reservation.otp,
        items: 1,
        total: res.reservation.price,
        paidOnline: res.reservation.advancePaid,
        balance: res.reservation.balanceDue,
      });
    } catch (error: any) {
      setErrorMsg(error?.message || 'Unable to verify this pickup');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmPickup = () => {
    showToast('Pickup successfully completed & marked delivered!');
    if (onVerified) onVerified();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E5E5] shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#8A8A8A] hover:text-[#171717] rounded-lg hover:bg-[#F5F4F0]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="border-b border-[#E5E5E5] pb-3 mb-4">
          <h2 className="font-bold text-lg text-[#171717]">Verify Pickup</h2>
          <p className="text-xs text-[#666666]">
            Enter customer OTP or scan QR pass to confirm pickup
          </p>
        </div>

        {/* Tabs */}
        {!verifiedData && (
          <div className="flex border-b border-[#E5E5E5] mb-5">
            <button
              type="button"
              onClick={() => setActiveTab('OTP')}
              className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'OTP'
                  ? 'border-[#A85420] text-[#A85420]'
                  : 'border-transparent text-[#666666] hover:text-[#171717]'
              }`}
            >
              Enter OTP
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('QR')}
              className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'QR'
                  ? 'border-[#A85420] text-[#A85420]'
                  : 'border-transparent text-[#666666] hover:text-[#171717]'
              }`}
            >
              Scan QR Code
            </button>
          </div>
        )}

        {/* State 1: Verification Form */}
        {!verifiedData ? (
          <div className="space-y-5">
            {activeTab === 'OTP' ? (
              <div className="space-y-4 text-center">
                <span className="text-xs font-semibold text-[#666666]">
                  Enter 6-digit Pickup Code
                </span>

                {/* 6 Digit Input Boxes (Mockup Screen 8) */}
                <div className="flex items-center justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-lg font-mono font-bold bg-[#F5F4F0] border-2 border-[#E5E5E5] focus:border-[#A85420] focus:bg-white rounded-lg outline-none text-[#171717] transition-all"
                    />
                  ))}
                </div>

                {errorMsg && (
                  <p className="text-xs text-[#DC2626] font-medium">{errorMsg}</p>
                )}

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying}
                  className="w-full py-2.5 px-4 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3 bg-[#F5F4F0] rounded-xl border border-dashed border-[#E5E5E5]">
                <Camera className="w-10 h-10 text-[#A85420] mx-auto" />
                <p className="text-xs text-[#666666] max-w-xs mx-auto">
                  Camera ready. Point camera at customer&apos;s digital QR pass.
                </p>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="px-4 py-1.5 bg-white border border-[#E5E5E5] text-[#171717] text-xs font-semibold rounded-lg hover:bg-[#EAE8E2]"
                >
                  Simulate QR Scan
                </button>
              </div>
            )}
          </div>
        ) : (
          /* State 2: Verification Success Card (Mockup Screen 8) */
          <div className="space-y-4 pt-1">
            {/* Success Banner */}
            <div className="flex items-center gap-2 bg-[#EBF8F0] text-[#16803C] p-3 rounded-lg border border-[#A7F3D0]">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-bold">Pickup Verified</span>
            </div>

            {/* Customer & Order Summary */}
            <div className="bg-[#FAFAF8] border border-[#E5E5E5] rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#666666]">Customer:</span>
                <span className="font-bold text-[#171717]">{verifiedData.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Order ID:</span>
                <span className="font-mono font-bold text-[#171717]">{verifiedData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Items:</span>
                <span className="font-medium text-[#171717]">{verifiedData.items} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Total:</span>
                <span className="font-bold text-[#171717]">
                  ₹{verifiedData.total.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-[#16803C] font-semibold">
                <span>Paid Online:</span>
                <span>₹{verifiedData.paidOnline.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5E5E5] text-[#171717] text-sm">
                <span className="font-bold">Balance to Collect:</span>
                <span className="font-black text-[#A85420]">
                  ₹{verifiedData.balance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Confirm Pickup Button */}
            <button
              type="button"
              onClick={handleConfirmPickup}
              className="w-full py-3 px-4 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Confirm Pickup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
