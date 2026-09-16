'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  CreditCard,
  Smartphone,
  Building2,
  ArrowRight,
  Copy,
  Check,
  MapPin,
  Calendar,
  X,
  Store,
} from 'lucide-react';
import { useStore, ReservationPass } from '@/store/useStore';

interface ReservationDepositModalProps {
  item: {
    id: string;
    name: string;
    image: string;
    price: number;
    shopId: string;
    shopName: string;
    address: string;
    phone?: string;
    location?: [number, number];
  } | null;
  onClose: () => void;
  onSuccess?: (pass: ReservationPass) => void;
}

export default function ReservationDepositModal({
  item,
  onClose,
  onSuccess,
}: ReservationDepositModalProps) {
  const router = useRouter();
  const { user, createReservation, showToast } = useStore();

  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'CONFIRMED'>('DETAILS');
  const [customerName, setCustomerName] = useState(user?.name || 'Rohan Mehta');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+91 98450 99881');
  const [pickupDate, setPickupDate] = useState('Tomorrow (3 PM - 7 PM)');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('rohan@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedPass, setConfirmedPass] = useState<ReservationPass | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  if (!item) return null;

  const depositAmount = Math.round(item.price * 0.1);
  const counterBalance = item.price - depositAmount;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('Please enter your name and phone number');
      return;
    }
    setStep('PAYMENT');
  };

  const handleProcessDeposit = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const newPass = createReservation({
        productId: item.id,
        productName: item.name,
        productImage: item.image,
        price: item.price,
        shopId: item.shopId,
        shopName: item.shopName,
        shopAddress: item.address,
        shopPhone: item.phone || '+91 80 4123 9988',
        shopLocation: item.location || [12.9716, 77.6412],
        customerName,
        customerPhone,
        pickupDate,
        timeSlot: '3:00 PM - 7:00 PM',
      });

      setConfirmedPass(newPass);
      setStep('CONFIRMED');
      showToast(`10% Deposit Paid! OTP: ${newPass.otp}`);
      onSuccess?.(newPass);
    }, 1200);
  };

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(true);
    showToast(`Copied OTP ${otp}!`);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1b1c19]/70 backdrop-blur-sm animate-fade-in selection:bg-[#f0e9ba]">
      <div className="bg-[#ffffff] border border-[rgba(72,55,47,0.15)] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto no-scrollbar animate-scale-in">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f5f4ef] hover:bg-[#efeee9] text-[#1b1c19] flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── STEP 1: Details & Deposit Breakdown ─────────────────────── */}
        {step === 'DETAILS' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#efeee9] text-[#54512d] text-[10px] font-mono font-bold uppercase tracking-wider">
                10% ADVANCE HOLD DEPOSIT
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b1c19]">
              Reserve Offline Drop
            </h2>
            <p className="text-xs text-[#49473c] mt-1">
              Lock physical stock at {item.shopName}. Pay 10% advance deposit now to secure the piece; pay the remaining 90% at the shop counter.
            </p>

            {/* Item Card with Deposit Breakdown */}
            <div className="my-5 p-4 rounded-xl bg-[#faf9f4] border border-[#cbc6b8]/50 space-y-3">
              <div className="flex gap-3.5 items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#cbc6b8]"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif text-sm font-bold text-[#1b1c19] line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#54512d] font-bold mt-0.5">
                    Total: ₹{item.price.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-[#7a776b] truncate">
                    📍 {item.shopName} • {item.address}
                  </p>
                </div>
              </div>

              {/* Price Calculation Table */}
              <div className="pt-3 border-t border-[#cbc6b8]/40 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#49473c]">
                  <span>Item Retail Value:</span>
                  <span>₹{item.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-[#54512d] bg-[#f0e9ba]/30 p-2 rounded-lg">
                  <span>10% Advance Deposit (Payable Now):</span>
                  <span>₹{depositAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#7a776b]">
                  <span>Counter Balance (Pay at Store):</span>
                  <span>₹{counterBalance.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#49473c] uppercase tracking-wider mb-1">
                  Customer Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8] text-xs text-[#1b1c19] focus:bg-[#ffffff] focus:border-[#54512d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#49473c] uppercase tracking-wider mb-1">
                  Mobile Number (For Pass SMS & 6-Digit OTP)
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8] text-xs text-[#1b1c19] focus:bg-[#ffffff] focus:border-[#54512d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#49473c] uppercase tracking-wider mb-1">
                  Expected Counter Pickup Time
                </label>
                <select
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8] text-xs text-[#1b1c19] focus:bg-[#ffffff] focus:border-[#54512d] focus:outline-none"
                >
                  <option value="Today (Before 8 PM)">Today (Before 8:00 PM)</option>
                  <option value="Tomorrow (Morning 11 AM - 2 PM)">Tomorrow (Morning 11:00 AM – 2:00 PM)</option>
                  <option value="Tomorrow (Evening 3 PM - 8 PM)">Tomorrow (Evening 3:00 PM – 8:00 PM)</option>
                  <option value="This Weekend (Saturday/Sunday)">This Weekend (Saturday / Sunday)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#48372f] hover:bg-[#3d2d26] text-[#faf9f4] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-3"
              >
                <span>Proceed to Pay 10% Deposit (₹{depositAmount.toLocaleString('en-IN')})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: Payment Checkout Gateway ────────────────────────── */}
        {step === 'PAYMENT' && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#f0e9ba] text-[#54512d] text-[10px] font-mono font-bold uppercase">
                  SECURE ADVANCE CHECKOUT
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1b1c19]">
                Pay 10% Deposit: ₹{depositAmount.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-[#49473c]">
                Upon successful payment, your 6-digit OTP and QR pickup pass will be instantly generated.
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'UPI'
                    ? 'bg-[#f0e9ba]/30 border-[#54512d] ring-1 ring-[#54512d]'
                    : 'bg-[#f5f4ef] border-[#cbc6b8]/50 hover:border-[#54512d]/40'
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-1 text-[#54512d]" />
                <span className="text-[11px] font-bold text-[#1b1c19] block">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'CARD'
                    ? 'bg-[#f0e9ba]/30 border-[#54512d] ring-1 ring-[#54512d]'
                    : 'bg-[#f5f4ef] border-[#cbc6b8]/50 hover:border-[#54512d]/40'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-[#54512d]" />
                <span className="text-[11px] font-bold text-[#1b1c19] block">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NETBANKING')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'NETBANKING'
                    ? 'bg-[#f0e9ba]/30 border-[#54512d] ring-1 ring-[#54512d]'
                    : 'bg-[#f5f4ef] border-[#cbc6b8]/50 hover:border-[#54512d]/40'
                }`}
              >
                <Building2 className="w-5 h-5 mx-auto mb-1 text-[#54512d]" />
                <span className="text-[11px] font-bold text-[#1b1c19] block">NetBanking</span>
              </button>
            </div>

            {/* Selected Method Details */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8]/50 space-y-3">
                <label className="block text-[11px] font-bold text-[#49473c] uppercase tracking-wider">
                  Enter VPA / UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. name@okhdfcbank"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#ffffff] border border-[#cbc6b8] text-xs text-[#1b1c19] focus:border-[#54512d] focus:outline-none"
                />
                <div className="flex gap-2 text-[10px] font-mono text-[#7a776b]">
                  <span className="px-2 py-0.5 rounded bg-[#ffffff] border border-[#cbc6b8]">GPay</span>
                  <span className="px-2 py-0.5 rounded bg-[#ffffff] border border-[#cbc6b8]">PhonePe</span>
                  <span className="px-2 py-0.5 rounded bg-[#ffffff] border border-[#cbc6b8]">Paytm</span>
                </div>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="p-4 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8]/50 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#49473c] uppercase tracking-wider mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    defaultValue="4532 •••• •••• 8921"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#ffffff] border border-[#cbc6b8] text-xs text-[#1b1c19] font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    defaultValue="08/28"
                    placeholder="MM/YY"
                    className="px-3.5 py-2.5 rounded-xl bg-[#ffffff] border border-[#cbc6b8] text-xs text-[#1b1c19] font-mono"
                  />
                  <input
                    type="password"
                    defaultValue="891"
                    placeholder="CVV"
                    className="px-3.5 py-2.5 rounded-xl bg-[#ffffff] border border-[#cbc6b8] text-xs text-[#1b1c19] font-mono"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'NETBANKING' && (
              <div className="p-4 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8]/50 space-y-2">
                <label className="block text-[11px] font-bold text-[#49473c] uppercase tracking-wider">
                  Select Bank
                </label>
                <select className="w-full px-3.5 py-2.5 rounded-xl bg-[#ffffff] border border-[#cbc6b8] text-xs text-[#1b1c19]">
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>State Bank of India</option>
                  <option>Axis Bank</option>
                </select>
              </div>
            )}

            {/* Security Badge */}
            <div className="flex items-center gap-2 text-[11px] text-[#54512d]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>256-Bit Encrypted Indian Banking Gateway • Instant Refund on Inspection Discrepancy</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="px-4 py-3 rounded-full border border-[#cbc6b8] text-xs font-bold text-[#49473c] hover:bg-[#f5f4ef] cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleProcessDeposit}
                disabled={isProcessing}
                className="flex-1 py-3.5 rounded-full bg-[#48372f] hover:bg-[#3d2d26] text-[#faf9f4] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{depositAmount.toLocaleString('en-IN')} & Generate OTP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirmed In-Store Pass & OTP ───────────────────── */}
        {step === 'CONFIRMED' && confirmedPass && (
          <div className="text-center py-2 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#f0e9ba] text-[#54512d] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#54512d] font-bold uppercase tracking-widest">
                10% DEPOSIT PAID • PASS ACTIVE
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1b1c19] mt-0.5">
                In-Store Hold Pass Ready
              </h3>
              <p className="text-xs text-[#49473c] mt-1">
                Your physical unit is locked at {confirmedPass.shopName}.
              </p>
            </div>

            {/* OTP Pass Card */}
            <div className="p-5 rounded-2xl bg-[#faf9f4] border-2 border-dashed border-[#54512d]/40 my-3 text-center space-y-2">
              <span className="text-[10px] font-mono text-[#7a776b] uppercase block">
                6-DIGIT COUNTER OTP CODE
              </span>
              <div className="font-mono text-3xl font-black text-[#54512d] tracking-[0.25em]">
                {confirmedPass.otp}
              </div>
              <button
                type="button"
                onClick={() => handleCopyOtp(confirmedPass.otp)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#efeee9] hover:bg-[#e3e3de] text-xs font-bold text-[#54512d] cursor-pointer transition-colors"
              >
                {copiedOtp ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#2e7d32]" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Payment & Balance Summary */}
            <div className="p-3.5 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8]/50 text-xs space-y-1.5 text-left">
              <div className="flex justify-between text-[#2e7d32] font-semibold">
                <span>10% Advance Deposit Paid:</span>
                <span>₹{depositAmount.toLocaleString('en-IN')} (Receipt #TXN_{confirmedPass.otp.replace('LOC-', '')})</span>
              </div>
              <div className="flex justify-between font-bold text-[#1b1c19]">
                <span>Counter Balance to Pay at Shop:</span>
                <span>₹{counterBalance.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#7a776b] text-[11px] pt-1 border-t border-[#cbc6b8]/40">
                <span>Atelier Location:</span>
                <span className="truncate max-w-[220px]">{confirmedPass.shopAddress}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/reservations');
                }}
                className="w-full py-3 rounded-full bg-[#48372f] hover:bg-[#3d2d26] text-[#faf9f4] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>View in My Active Passes</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const lat = confirmedPass.shopLocation?.[0] || 12.9716;
                  const lng = confirmedPass.shopLocation?.[1] || 77.6412;
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                }}
                className="w-full py-2.5 rounded-full bg-[#efeee9] hover:bg-[#e3e3de] text-[#1b1c19] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#54512d]" />
                <span>Open Turn-by-Turn Directions (Google Maps)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
