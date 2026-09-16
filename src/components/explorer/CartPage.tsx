'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Store, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useStore, CartItem } from '@/store/useStore';
import PremiumButton from '@/components/ui/PremiumButton';
import ReservationConfirmationModal from './ReservationConfirmationModal';

export default function CartPage() {
  const router = useRouter();
  const { cart, getCartByShop, removeFromCart, updateCartQuantity, clearShopCart, navTo, showToast, user } = useStore();
  const [submittingShopId, setSubmittingShopId] = useState<string | null>(null);
  const [completedReservation, setCompletedReservation] = useState<any | null>(null);

  const grouped = getCartByShop();
  const shopIds = Object.keys(grouped);

  const handleReserveShop = async (shopId: string) => {
    const shopGroup = grouped[shopId];
    if (!shopGroup || shopGroup.items.length === 0) return;

    setSubmittingShopId(shopId);
    showToast(`Initializing Razorpay checkout for ${shopGroup.shopName}...`);

    try {
      const totalShopPrice = shopGroup.items.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0
      );
      const advanceDeposit = Math.max(1, Math.round(totalShopPrice * 0.1));

      const { openRazorpayCheckout } = await import('@/lib/payments/razorpayClient');

      await openRazorpayCheckout({
        amount: advanceDeposit,
        shopId,
        shopName: shopGroup.shopName,
        customerName: user?.name || 'Locara Explorer',
        customerEmail: user?.email || 'explorer@locara.app',
        description: `10% In-Store Reservation Deposit at ${shopGroup.shopName}`,
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
              shopId,
              shopName: shopGroup.shopName,
              shopAddress: shopGroup.shopAddress,
              items: shopGroup.items,
              customerName: user?.name || 'Explorer',
              customerEmail: user?.email || '',
              paymentMethod: paymentResult.paymentMethod || 'RAZORPAY',
              paymentTransactionId: paymentResult.paymentId,
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.reservation) {
            throw new Error(data.error || 'Failed to place reservation');
          }

          clearShopCart(shopId);
          setCompletedReservation(data.reservation);
          showToast('Reservation placed! 10% advance deposit processed.');
          setSubmittingShopId(null);
        },
        onDismiss: () => {
          setSubmittingShopId(null);
        },
        onError: (err: any) => {
          showToast(err?.description || err?.message || 'Payment cancelled');
          setSubmittingShopId(null);
        },
      });
    } catch (err: any) {
      showToast(err?.message || 'Unable to place reservation');
      setSubmittingShopId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-32">
      {/* Header */}
      <div className="p-4 sm:p-8 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 mb-6 shadow-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <ShoppingBag className="w-4 h-4 text-[#C8893F]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
            IN-STORE PICKUP CART
          </span>
        </div>
        <h1 className="font-serif text-xl sm:text-3xl font-bold text-[#F6EAD7]">
          Your Shopping Cart
        </h1>
        <p className="text-xs text-[#9E8B75] mt-1">
          Items are grouped by physical shop. You can reserve items with a 10% advance per shop.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 text-center max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-[#211A14] border border-[#F6EAD7]/10 flex items-center justify-center text-2xl mx-auto mb-3">
            🛒
          </div>
          <h3 className="font-serif text-lg font-bold text-[#F6EAD7]">Your Cart is Empty</h3>
          <p className="text-xs text-[#9E8B75] mt-1 mb-6">
            Explore local shops and add authentic products to reserve for physical pickup.
          </p>
          <PremiumButton variant="gold" size="md" onClick={() => navTo('home')} magnetic>
            Explore Local Stores
          </PremiumButton>
        </div>
      ) : (
        <div className="space-y-8">
          {shopIds.map((shopId) => {
            const group = grouped[shopId];
            const isSubmitting = submittingShopId === shopId;

            return (
              <div
                key={shopId}
                className="rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 overflow-hidden shadow-lg"
              >
                {/* Shop Group Header */}
                <div className="p-5 bg-[#211A14] border-b border-[#F6EAD7]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#261D16] flex items-center justify-center text-[#C8893F]">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#F6EAD7]">{group.shopName}</h3>
                      {group.shopAddress && (
                        <p className="text-[11px] text-[#9E8B75]">{group.shopAddress}</p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-[#E0AF62] uppercase tracking-wider bg-[#17120E] px-3 py-1 rounded-full border border-[#C8893F]/20">
                    Physical Pickup Store
                  </span>
                </div>

                {/* Items List */}
                <div className="p-5 divide-y divide-[#F6EAD7]/5">
                  {group.items.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-2xl object-cover bg-[#211A14] border border-[#F6EAD7]/10 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-[#261D16] flex items-center justify-center text-xl shrink-0">
                          🏛️
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif font-bold text-sm text-[#F6EAD7] truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-[#9E8B75]">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>• Color: {item.color}</span>}
                        </div>
                        <p className="font-mono text-xs font-bold text-[#E0AF62] mt-1">
                          ₹{item.price.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] text-[#9E8B75] font-normal">/ {item.unit || 'unit'}</span>
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-[#211A14] p-1 rounded-xl border border-[#F6EAD7]/10">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-[#9E8B75] hover:text-[#F6EAD7]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold w-5 text-center text-[#F6EAD7]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-[#9E8B75] hover:text-[#F6EAD7]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-[#6E5D4B] hover:text-[#C24136] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Shop Group Checkout Footer */}
                <div className="p-5 bg-[#140F0B] border-t border-[#F6EAD7]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left w-full sm:w-auto">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-[#9E8B75]">Total:</span>
                      <span className="font-mono text-sm font-bold text-[#F6EAD7]">₹{group.total.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-[#E0AF62] font-bold">✦ Pay 10% Advance: ₹{group.advance.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[11px] text-[#9E8B75] mt-0.5">
                      Pay remaining ₹{group.balance.toLocaleString('en-IN')} at {group.shopName} upon pickup.
                    </p>
                  </div>

                  <PremiumButton
                    variant="gold"
                    size="md"
                    onClick={() => handleReserveShop(shopId)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                    magnetic
                  >
                    {isSubmitting ? 'Securing...' : `Reserve for ₹${group.advance}`}
                  </PremiumButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reservation Confirmation Modal */}
      {completedReservation && (
        <ReservationConfirmationModal
          isOpen={Boolean(completedReservation)}
          onClose={() => setCompletedReservation(null)}
          reservation={completedReservation}
        />
      )}
    </div>
  );
}
