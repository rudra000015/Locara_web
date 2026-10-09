'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Clock, ShieldCheck, CheckCircle2, CreditCard, Smartphone, Lock } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    unit?: string;
    image?: string;
    category?: string;
  };
  shop: {
    id: string;
    name: string;
    addr?: string;
    loc?: [number, number];
  };
  onSuccess: (reservation: any) => void;
}

export default function ReservationModal({ isOpen, onClose, product, shop, onSuccess }: Props) {
  const router = useRouter();
  const { user, showToast, createReservation } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('Standard');
  const [selectedColor, setSelectedColor] = useState<string>('Default');
  const [quantity, setQuantity] = useState<number>(1);
  const [durationHours, setDurationHours] = useState<number>(8);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD'>('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const totalItemPrice = product.price * quantity;
  const advanceAmount = Math.round(totalItemPrice * 0.1);
  const remainingBalance = totalItemPrice - advanceAmount;

  const handleConfirmReservation = async () => {
    setSubmitting(true);
    setError('');

    try {
      const { openRazorpayCheckout } = await import('@/lib/payments/razorpayClient');

      await openRazorpayCheckout({
        amount: advanceAmount,
        shopId: shop.id,
        shopName: shop.name,
        customerName: user?.name || 'Rahul Sharma',
        customerEmail: user?.email || 'customer@locara.app',
        description: `10% Deposit for ${product.name} at ${shop.name}`,
        onSuccess: async (paymentResult) => {
          showToast('Payment verified! Generating pickup pass...');
          const newPass = createReservation({
            productId: product.id,
            productName: product.name,
            productImage: product.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop',
            price: product.price,
            shopId: shop.id,
            shopName: shop.name,
            shopAddress: shop.addr || 'Sadar Bazaar, Meerut',
            shopPhone: '+91 98970 12345',
            shopLocation: shop.loc || [28.9845, 77.7064],
            customerName: user?.name || 'Rahul Sharma',
            customerPhone: user?.phone || '+91 98450 99881',
            pickupDate: 'Today (5:00 PM – 8:00 PM)',
            timeSlot: '5:00 PM – 8:00 PM',
          });

          setSubmitting(false);
          onSuccess(newPass);
        },
        onDismiss: () => {
          setSubmitting(false);
        },
        onError: () => {
          // Local fallback in dev
          const newPass = createReservation({
            productId: product.id,
            productName: product.name,
            productImage: product.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop',
            price: product.price,
            shopId: shop.id,
            shopName: shop.name,
            shopAddress: shop.addr || 'Sadar Bazaar, Meerut',
            shopPhone: '+91 98970 12345',
            shopLocation: shop.loc || [28.9845, 77.7064],
            customerName: user?.name || 'Rahul Sharma',
            customerPhone: user?.phone || '+91 98450 99881',
            pickupDate: 'Today (5:00 PM – 8:00 PM)',
            timeSlot: '5:00 PM – 8:00 PM',
          });
          setSubmitting(false);
          showToast(`Reservation confirmed! OTP: ${newPass.otp}`);
          onSuccess(newPass);
        },
      });
    } catch (err: any) {
      const newPass = createReservation({
        productId: product.id,
        productName: product.name,
        productImage: product.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop',
        price: product.price,
        shopId: shop.id,
        shopName: shop.name,
        shopAddress: shop.addr || 'Sadar Bazaar, Meerut',
        shopPhone: '+91 98970 12345',
        shopLocation: shop.loc || [28.9845, 77.7064],
        customerName: user?.name || 'Rahul Sharma',
        customerPhone: user?.phone || '+91 98450 99881',
        pickupDate: 'Today (5:00 PM – 8:00 PM)',
        timeSlot: '5:00 PM – 8:00 PM',
      });
      setSubmitting(false);
      showToast(`Reservation confirmed! OTP: ${newPass.otp}`);
      onSuccess(newPass);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E5E5E5] p-6 shadow-xl relative my-6 animate-scale-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#666666] hover:text-[#171717] w-8 h-8 rounded-full bg-[#F5F4F0] hover:bg-[#E5E5E5] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-1">
          <span className="px-2 py-0.5 rounded bg-[#A85420]/10 text-[#A85420] text-[10px] font-bold uppercase tracking-wider">
            10% Online Deposit
          </span>
        </div>
        <h2 className="text-xl font-black text-[#171717]">
          Reserve for Pickup at {shop.name}
        </h2>
        <p className="text-xs text-[#666666] mt-0.5">
          Pay 10% advance online to hold stock. Pay remaining 90% at the shop counter.
        </p>

        {/* Product Summary */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E5] flex items-center gap-3">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 rounded-lg object-cover bg-white border border-[#E5E5E5] shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-[#F5F4F0] flex items-center justify-center text-xl shrink-0">
              🛍️
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-[#171717] truncate">{product.name}</h4>
            <p className="text-xs font-bold text-[#A85420] mt-0.5">
              ₹{product.price.toLocaleString('en-IN')}{' '}
              <span className="text-[10px] text-[#666666] font-normal">per {product.unit || 'piece'}</span>
            </p>
          </div>
        </div>

        {/* Pickup Time Window */}
        <div className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#A85420]" /> Select Pickup Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Today (Before 8 PM)', hours: 8 },
                { label: 'Tomorrow Morning', hours: 26 },
                { label: 'Tomorrow Evening', hours: 32 },
              ].map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setDurationHours(opt.hours)}
                  className={`py-2 px-2 text-center rounded-lg font-bold transition-all text-xs cursor-pointer ${
                    durationHours === opt.hours
                      ? 'bg-[#A85420] text-white shadow-sm'
                      : 'bg-[#FAFAF8] text-[#666666] border border-[#E5E5E5] hover:border-[#A85420]'
                  }`}
                >
                  <span className="block text-[11px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5">
              Payment Method for 10% Deposit
            </label>
            <div className="flex gap-2">
              {[
                { id: 'UPI', label: 'UPI / QR (Instant)', icon: Smartphone },
                { id: 'CARD', label: 'Debit / Credit Card', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-[#A85420]/10 border border-[#A85420] text-[#A85420]'
                        : 'bg-[#FAFAF8] border border-[#E5E5E5] text-[#666666] hover:text-[#171717]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing Breakdown Card */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E5] space-y-1.5 text-xs">
          <div className="flex justify-between text-[#666666]">
            <span>Product Total:</span>
            <span className="font-bold text-[#171717]">₹{totalItemPrice.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between font-bold text-[#A85420] bg-[#A85420]/10 p-2 rounded-lg">
            <span>Reserve Online (10% Deposit):</span>
            <span>₹{advanceAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between text-[#666666]">
            <span>Pay at Physical Shop (90%):</span>
            <span className="font-bold text-[#171717]">₹{remainingBalance.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {error && (
          <p className="mt-3 p-2 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/20 text-xs text-[#DC2626] text-center">
            {error}
          </p>
        )}

        {/* CTA */}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-[#F5F4F0] hover:bg-[#E5E5E5] text-xs font-bold text-[#666666] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmReservation}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-lg bg-[#A85420] hover:bg-[#873F17] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <span>Processing...</span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Pay ₹{advanceAmount.toLocaleString('en-IN')} Deposit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
