import crypto from 'crypto';
import {
  IPaymentProvider,
  PaymentOrderParams,
  PaymentOrderResult,
  PaymentVerificationParams,
  PaymentVerificationResult,
} from './types';

const PAYMENT_SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.PAYMENT_SECRET;
const PAYMENT_KEY_ID =
  process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.PAYMENT_KEY_ID;

export class LocaraPaymentGateway implements IPaymentProvider {
  async createPaymentOrder(params: PaymentOrderParams): Promise<PaymentOrderResult> {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || PAYMENT_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || PAYMENT_SECRET;

    if (!keyId || !keySecret || !keyId.startsWith('rzp_')) {
      throw new Error('Razorpay credentials are not configured');
    }

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount: Math.round(params.amount * 100),
        currency: params.currency || 'INR',
        receipt: `rcpt_${Date.now().toString().slice(-10)}`,
        notes: {
          reservationId: params.reservationId,
          shopId: params.shop?.id,
          shopName: params.shop?.name,
        },
      }),
    });

    if (!rzpRes.ok) {
      const errorText = await rzpRes.text();
      throw new Error(`Razorpay order creation failed: ${errorText}`);
    }

    const rzpData = await rzpRes.json();

    return {
      orderId: rzpData.id,
      amount: params.amount,
      currency: rzpData.currency || 'INR',
      keyId,
      sessionToken: rzpData.id,
      supportedMethods: ['UPI', 'CARD', 'NETBANKING', 'WALLET'],
    };
  }

  async verifyPayment(params: PaymentVerificationParams): Promise<PaymentVerificationResult> {
    if (!params.orderId || !params.paymentId || !params.signature) {
      return {
        success: false,
        transactionId: '',
        amountPaid: 0,
        verifiedAt: new Date().toISOString(),
        error: 'Missing required signature verification parameters',
      };
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || PAYMENT_SECRET;
    if (!keySecret) {
      return {
        success: false,
        transactionId: params.paymentId,
        amountPaid: 0,
        verifiedAt: new Date().toISOString(),
        error: 'Razorpay secret is not configured',
      };
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${params.orderId}|${params.paymentId}`)
      .digest('hex');

    if (params.signature !== expectedSignature) {
      return {
        success: false,
        transactionId: params.paymentId,
        amountPaid: 0,
        verifiedAt: new Date().toISOString(),
        error: 'Cryptographic signature mismatch. Transaction not verified.',
      };
    }

    return {
      success: true,
      transactionId: params.paymentId,
      amountPaid: 0,
      verifiedAt: new Date().toISOString(),
    };
  }

  async refundPayment(paymentId: string, amount: number): Promise<{ success: boolean; refundId: string }> {
    return {
      success: true,
      refundId: `rfnd_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    };
  }
}

export const paymentProvider = new LocaraPaymentGateway();
