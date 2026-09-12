'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Sparkles,
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  Lock,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Store,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import PremiumButton from '@/components/ui/PremiumButton';
import { openRazorpayCheckout } from '@/lib/payments/razorpayClient';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, showToast } = useStore();

  const shopId = searchParams.get('shopId') || 'shop_sharma_ethnic';
  const shopName = searchParams.get('shopName') || 'Sharma Ethnic Couture';
  const rawAmount = Number(searchParams.get('amount')) || 2499;
  const productName = searchParams.get('productName') || 'Heritage Couture Piece';
  const productId = searchParams.get('productId') || `prod_${Date.now()}`;
  const quantity = Number(searchParams.get('qty')) || 1;

  const totalAmount = rawAmount * quantity;
  const advanceAmount = Math.max(1, Math.round(totalAmount * 0.1));
  const remainingBalance = totalAmount - advanceAmount;

  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY_MODAL' | 'UPI_QR' | 'CARDS' | 'NETBANKING'>('RAZORPAY_MODAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successReservation, setSuccessReservation] = useState<any | null>(null);

  const handlePayWithRazorpay = async () => {
    setLoading(true);
    setError(null);
    showToast('Launching Razorpay Payment Gateway...');

    try {
      await openRazorpayCheckout({
        amount: advanceAmount,
        shopId,
        shopName,
        customerName: user?.name || 'Locara Explorer',
        customerEmail: user?.email || 'explorer@locara.app',
        customerPhone: '9837000001',
        description: `10% Advance Deposit for ${productName} at ${shopName}`,
        onSuccess: async (paymentResult) => {
          showToast('Payment successful! Locking in-store inventory...');
          const token = localStorage.getItem('auth_token') || '';

          const res = await fetch('/api/reservations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              shopId,
              shopName,
              items: [
                {
                  id: productId,
                  name: productName,
                  price: rawAmount,
                  quantity,
                  unitPrice: rawAmount,
                  totalPrice: totalAmount,
                },
              ],
              paymentMethod: 'RAZORPAY',
              paymentTransactionId: paymentResult.paymentId,
              customerName: user?.name || 'Locara Explorer',
              customerEmail: user?.email || '',
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.reservation) {
            throw new Error(data.error || 'Failed to generate reservation');
          }

          setSuccessReservation(data.reservation);
          showToast('Reservation confirmed! Inventory locked.');
        },
        onDismiss: () => {
          setLoading(false);
        },
        onError: (err: any) => {
          setError(err?.description || err?.message || 'Payment cancelled or failed');
          setLoading(false);
        },
      });
    } catch (err: any) {
      setError(err?.message || 'Payment failed');
      setLoading(false);
    }
  };

  if (successReservation) {
    return (
      <div className="min-h-screen bg-[#0E0B08] py-12 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg rounded-3xl bg-[#17120E] border border-[#C8893F]/40 p-8 shadow-2xl text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-[#1E5544]/20 border border-[#2D7D64] flex items-center justify-center text-[#2D7D64] mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
              RAZORPAY PAYMENT VERIFIED
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#F6EAD7] mt-1">
              Reservation Locked!
            </h2>
            <p className="text-xs text-[#9E8B75] mt-1">
              10% advance deposit paid. Balance payable at the store counter.
            </p>
          </div>

          {/* Token Card */}
          <div className="p-6 rounded-2xl bg-[#211A14] border border-[#F6EAD7]/10 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#9E8B75]">Booking Token:</span>
              <span className="font-mono font-bold text-[#F6EAD7]">{successReservation.reservationNumber}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#9E8B75]">Pickup OTP:</span>
              <span className="font-mono font-bold text-lg text-[#E0AF62] tracking-widest">{successReservation.pickupOtp}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#9E8B75]">Store:</span>
              <span className="font-serif font-bold text-[#F6EAD7]">{successReservation.shopName}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-[#F6EAD7]/10 pt-3">
              <span className="text-[#9E8B75]">Counter Balance (90%):</span>
              <span className="font-mono font-bold text-[#2D7D64]">₹{successReservation.remainingAmount}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <PremiumButton
              variant="gold"
              size="lg"
              className="flex-1"
              onClick={() => router.push('/explorer/reservations')}
            >
              View My Reservations
            </PremiumButton>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0B08] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-[#9E8B75] hover:text-[#F6EAD7] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to store
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#C8893F]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
                SECURE RAZORPAY CHECKOUT
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7]">
              In-Store Advance Deposit
            </h1>
            <p className="text-xs text-[#9E8B75] mt-1">
              Pay 10% advance now to lock physical item at {shopName}.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#211A14] px-4 py-2.5 rounded-2xl border border-[#F6EAD7]/10">
            <Lock className="w-4 h-4 text-[#2D7D64]" />
            <span className="text-xs font-mono text-[#D8C4A7] uppercase font-bold">256-Bit Encrypted</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Payment Method & Gateway */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 space-y-6 shadow-xl">
              <h3 className="font-serif font-bold text-lg text-[#F6EAD7] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#C8893F]" />
                Select Payment Method
              </h3>

              {/* Razorpay Master Gateway Option */}
              <div
                onClick={() => setPaymentMethod('RAZORPAY_MODAL')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'RAZORPAY_MODAL'
                    ? 'bg-[#211A14] border-[#C8893F] shadow-glow-sm'
                    : 'bg-[#17120E] border-[#F6EAD7]/10 hover:border-[#F6EAD7]/20'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#261D16] border border-[#C8893F]/30 flex items-center justify-center text-lg">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#F6EAD7]">Razorpay Standard Checkout</h4>
                    <p className="text-[11px] text-[#9E8B75]">UPI, GPay, PhonePe, Cards, NetBanking</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-[#C8893F] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C8893F]" />
                </div>
              </div>

              {/* Supported payment badges */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="p-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/5 text-center">
                  <Smartphone className="w-4 h-4 text-[#C8893F] mx-auto mb-1" />
                  <span className="text-[10px] font-mono text-[#D8C4A7] font-bold">UPI / GPay</span>
                </div>
                <div className="p-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/5 text-center">
                  <QrCode className="w-4 h-4 text-[#C8893F] mx-auto mb-1" />
                  <span className="text-[10px] font-mono text-[#D8C4A7] font-bold">UPI QR</span>
                </div>
                <div className="p-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/5 text-center">
                  <CreditCard className="w-4 h-4 text-[#C8893F] mx-auto mb-1" />
                  <span className="text-[10px] font-mono text-[#D8C4A7] font-bold">Cards</span>
                </div>
                <div className="p-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/5 text-center">
                  <Building2 className="w-4 h-4 text-[#C8893F] mx-auto mb-1" />
                  <span className="text-[10px] font-mono text-[#D8C4A7] font-bold">NetBanking</span>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Button */}
              <PremiumButton
                variant="gold"
                size="lg"
                className="w-full"
                onClick={handlePayWithRazorpay}
                disabled={loading}
              >
                {loading ? 'Connecting Razorpay...' : `Pay ₹${advanceAmount} Advance via Razorpay`}
              </PremiumButton>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#9E8B75]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D7D64]" />
                <span>100% Refundable if shop cannot fulfill item</span>
              </div>
            </div>
          </div>

          {/* Right: Reservation Summary Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 space-y-6 shadow-xl">
              <h3 className="font-serif font-bold text-lg text-[#F6EAD7] flex items-center gap-2">
                <Store className="w-5 h-5 text-[#C8893F]" />
                Order Summary
              </h3>

              <div className="p-4 rounded-2xl bg-[#211A14] border border-[#F6EAD7]/5 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#F6EAD7]">{productName}</h4>
                    <p className="text-[11px] text-[#9E8B75]">Store: {shopName}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#E0AF62]">
                    ₹{totalAmount}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#9E8B75]">
                  <span>Quantity: {quantity}</span>
                  <span>Physical Pickup</span>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="space-y-3 text-xs border-t border-[#F6EAD7]/10 pt-4">
                <div className="flex justify-between text-[#D8C4A7]">
                  <span>Total Item Price</span>
                  <span className="font-mono">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-[#E0AF62] font-bold">
                  <span>10% Advance Deposit (Payable Now)</span>
                  <span className="font-mono text-sm">₹{advanceAmount}</span>
                </div>
                <div className="flex justify-between text-[#2D7D64]">
                  <span>90% In-Store Balance (Pay at Pickup)</span>
                  <span className="font-mono font-bold">₹{remainingBalance}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#261D16] border border-[#C8893F]/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E0AF62]">
                  <Clock className="w-4 h-4" /> 8-Hour Hold Guarantee
                </div>
                <p className="text-[11px] text-[#9E8B75] leading-relaxed">
                  Your advance deposit guarantees physical hold of this item at {shopName}. Show your pickup OTP at the counter upon arrival.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
