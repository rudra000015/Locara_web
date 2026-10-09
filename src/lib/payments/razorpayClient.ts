'use client';

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const existing = document.getElementById('razorpay-checkout-sdk');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface RazorpayCheckoutOptions {
  amount: number; // in INR
  reservationId?: string;
  shopId: string;
  shopName: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  onSuccess: (paymentData: {
    paymentId: string;
    orderId: string;
    signature: string;
    paymentMethod: string;
  }) => Promise<void> | void;
  onDismiss?: () => void;
  onError?: (err: any) => void;
}

export async function openRazorpayCheckout({
  amount,
  reservationId,
  shopId,
  shopName,
  customerName = 'Locara Explorer',
  customerEmail = 'explorer@locara.app',
  customerPhone = '9837000001',
  description,
  onSuccess,
  onDismiss,
  onError,
}: RazorpayCheckoutOptions) {
  try {
    const loaded = await loadRazorpayScript();

    // 1. Create order on backend
    const authToken = localStorage.getItem('auth_token') || '';
    const res = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        amount,
        reservationId,
        shopId,
        shopName,
        customerName,
        customerEmail,
        customerPhone,
        description: description || `10% Advance Deposit at ${shopName}`,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to initialize payment order');
    }

    const { order } = await res.json();

    if (!loaded || typeof window === 'undefined' || !(window as any).Razorpay) {
      throw new Error('Razorpay checkout could not be loaded. Please check your network and try again.');
    }

    const options = {
      key: order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100),
      currency: order.currency || 'INR',
      name: 'LOCARA',
      description: description || `10% In-Store Reservation Deposit`,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&q=80',
      order_id: order.orderId,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      notes: {
        shopId,
        shopName,
        purpose: '10% In-Store Reservation Deposit',
      },
      theme: {
        color: '#C8893F',
        backdrop_color: 'rgba(14, 11, 8, 0.95)',
      },
      handler: async function (response: any) {
        try {
          const paymentId = response.razorpay_payment_id;
          const orderId = response.razorpay_order_id;
          const signature = response.razorpay_signature;

          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              paymentId,
              signature,
              reservationId,
            }),
          });

          const verifyData = await verifyRes.json().catch(() => ({}));
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || 'Razorpay payment verification failed');
          }

          await onSuccess({
            paymentId,
            orderId,
            signature,
            paymentMethod: 'RAZORPAY',
          });
        } catch (err) {
          if (onError) onError(err);
        }
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) onDismiss();
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      if (onError) onError(response.error);
    });
    rzp.open();
  } catch (err: any) {
    if (onError) {
      onError(err);
    } else {
      throw err;
    }
  }
}
