'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ShieldCheck, CheckCircle2, QrCode, Navigation, Sparkles, CreditCard, Smartphone } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useExplorerRuntimeStore } from '@/store/useExplorerRuntimeStore';
import PremiumButton from '@/components/ui/PremiumButton';

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
  const { user, showToast } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Black');
  const [quantity, setQuantity] = useState<number>(1);
  const [durationHours, setDurationHours] = useState<number>(8);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'WALLET'>('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const totalItemPrice = product.price * quantity;
  const advanceAmount = Math.round(totalItemPrice * 0.1);
  const remainingBalance = totalItemPrice - advanceAmount;

  const handleConfirmReservation = async () => {
    setSubmitting(true);
    setError('');
    showToast('Initializing Razorpay Checkout...');

    try {
      const { openRazorpayCheckout } = await import('@/lib/payments/razorpayClient');

      await openRazorpayCheckout({
        amount: advanceAmount,
        shopId: shop.id,
        shopName: shop.name,
        customerName: user?.name || 'Locara Explorer',
        customerEmail: user?.email || 'explorer@locara.app',
        description: `10% Advance Deposit for ${product.name} at ${shop.name}`,
        onSuccess: async (paymentResult) => {
          showToast('Payment verified! Finalizing in-store reservation...');
          const token = localStorage.getItem('auth_token') || '';

          const res = await fetch('/api/reservations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              shopId: shop.id,
              shopName: shop.name,
              shopAddress: shop.addr || '',
              shopLocation: shop.loc,
              items: [
                {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  unit: product.unit || 'piece',
                  size: selectedSize,
                  color: selectedColor,
                  quantity,
                  image: product.image,
                },
              ],
              durationHours,
              paymentMethod: paymentResult.paymentMethod || paymentMethod,
              paymentTransactionId: paymentResult.paymentId,
              customerName: user?.name || 'Explorer',
              customerEmail: user?.email || '',
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.reservation) {
            throw new Error(data.error || 'Failed to place reservation');
          }

          showToast('Reservation confirmed! Inventory locked.');
          onSuccess(data.reservation);
        },
        onDismiss: () => {
          setSubmitting(false);
        },
        onError: (err: any) => {
          setError(err?.description || err?.message || 'Payment cancelled or failed');
          setSubmitting(false);
        },
      });
    } catch (err: any) {
      setError(err?.message || 'Unable to complete reservation');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg rounded-3xl bg-[#17120E] border border-[#F6EAD7]/15 p-6 sm:p-8 shadow-2xl relative my-8"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#9E8B75] hover:text-[#F6EAD7] p-1.5 rounded-full hover:bg-white/5 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#C8893F]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
            INSTANT IN-STORE RESERVATION
          </span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#F6EAD7] leading-tight">
          Reserve at {shop.name}
        </h2>
        <p className="text-xs text-[#9E8B75] mt-1">
          Lock this physical item. Pay only 10% advance online, inspect at the shop, and pay the rest.
        </p>

        {/* Selected Product Summary */}
        <div className="mt-5 p-3.5 rounded-2xl bg-[#211A14] border border-[#F6EAD7]/10 flex items-center gap-3.5">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 rounded-xl object-cover bg-[#17120E] border border-[#F6EAD7]/10 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-[#261D16] flex items-center justify-center text-xl shrink-0">
              🏛️
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-serif font-bold text-sm text-[#F6EAD7] truncate">{product.name}</h4>
            <p className="font-mono text-xs font-bold text-[#E0AF62] mt-0.5">
              ₹{product.price.toLocaleString('en-IN')}{' '}
              <span className="text-[10px] text-[#9E8B75] font-normal">per {product.unit || 'unit'}</span>
            </p>
          </div>
        </div>

        {/* Options Selection */}
        <div className="mt-5 space-y-4 text-xs">
          {/* Size Variant */}
          <div>
            <label className="block font-mono text-[10px] uppercase font-bold text-[#9E8B75] mb-1.5">
              Select Size / Format
            </label>
            <div className="flex gap-2">
              {['S', 'M', 'L', 'XL', 'Custom'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                    selectedSize === size
                      ? 'bg-[#C8893F] text-[#0E0B08] shadow-glow-sm'
                      : 'bg-[#211A14] text-[#D8C4A7] border border-[#F6EAD7]/10 hover:border-[#F6EAD7]/20'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Variant */}
          <div>
            <label className="block font-mono text-[10px] uppercase font-bold text-[#9E8B75] mb-1.5">
              Select Color Palette
            </label>
            <div className="flex flex-wrap gap-2">
              {['Black', 'Cream', 'Gold', 'Emerald', 'Crimson'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    selectedColor === color
                      ? 'bg-[#E0AF62] text-[#0E0B08]'
                      : 'bg-[#211A14] text-[#D8C4A7] border border-[#F6EAD7]/10 hover:border-[#F6EAD7]/20'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Reservation Duration */}
          <div>
            <label className="block font-mono text-[10px] uppercase font-bold text-[#9E8B75] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C8893F]" /> Reservation Expiry Window
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Today, 8 PM', hours: 8 },
                { label: 'Tomorrow, 2 PM', hours: 26 },
                { label: 'Tomorrow, 8 PM', hours: 32 },
              ].map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setDurationHours(opt.hours)}
                  className={`py-2 px-2 text-center rounded-xl font-bold transition-all ${
                    durationHours === opt.hours
                      ? 'bg-[#1E5544] text-[#F6EAD7] border border-[#1E5544]/80 shadow-glow-emerald'
                      : 'bg-[#211A14] text-[#9E8B75] border border-[#F6EAD7]/10'
                  }`}
                >
                  <span className="block text-[11px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-mono text-[10px] uppercase font-bold text-[#9E8B75] mb-1.5">
              10% Advance Payment Method
            </label>
            <div className="flex gap-2">
              {[
                { id: 'UPI', label: 'UPI (GPay/PhonePe)', icon: Smartphone },
                { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === m.id
                        ? 'bg-[#2A2119] border border-[#C8893F] text-[#F6EAD7]'
                        : 'bg-[#211A14] border border-[#F6EAD7]/10 text-[#9E8B75]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#C8893F]" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing Breakdown Card */}
        <div className="mt-5 p-4 rounded-2xl bg-[#1B140F] border border-[#C8893F]/20 space-y-2">
          <div className="flex justify-between text-xs text-[#9E8B75]">
            <span>Product Total:</span>
            <span className="font-mono font-bold text-[#F6EAD7]">₹{totalItemPrice.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between text-xs font-bold text-[#E0AF62]">
            <span>10% Advance Online Deposit:</span>
            <span className="font-mono text-sm">₹{advanceAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between text-xs text-[#9E8B75] pt-1.5 border-t border-[#F6EAD7]/10">
            <span>Remaining balance at physical shop:</span>
            <span className="font-mono text-[#D8C4A7]">₹{remainingBalance.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {error && (
          <p className="mt-3 p-3 rounded-xl bg-[#C24136]/15 border border-[#C24136]/30 text-xs text-[#C24136] text-center">
            {error}
          </p>
        )}

        {/* CTA */}
        <div className="mt-6 flex flex-col gap-2.5">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-[#211A14] hover:bg-[#2A2119] text-xs font-bold text-[#9E8B75] border border-[#F6EAD7]/10 cursor-pointer"
            >
              Cancel
            </button>

            <PremiumButton
              variant="gold"
              size="lg"
              onClick={handleConfirmReservation}
              disabled={submitting}
              className="flex-1"
              magnetic
            >
              {submitting ? 'Connecting Razorpay...' : `Pay ₹${advanceAmount} via Razorpay`}
            </PremiumButton>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              const query = new URLSearchParams({
                shopId: shop.id,
                shopName: shop.name,
                amount: String(product.price),
                productName: product.name,
                productId: product.id,
                qty: String(quantity),
              });
              router.push(`/checkout?${query.toString()}`);
            }}
            className="w-full text-center text-[11px] text-[#C8893F] hover:underline font-mono py-1"
          >
            Or open Dedicated Fullscreen Checkout Page →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
