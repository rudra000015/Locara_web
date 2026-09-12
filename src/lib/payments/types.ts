export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';

export interface PaymentOrderParams {
  orderId: string;
  reservationId: string;
  amount: number; // in INR (advance deposit)
  currency: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  shop: {
    id: string;
    name: string;
  };
  description: string;
}

export interface PaymentOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  sessionToken: string;
  supportedMethods: PaymentMethod[];
}

export interface PaymentVerificationParams {
  orderId: string;
  paymentId: string;
  signature: string;
  reservationId: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  transactionId: string;
  amountPaid: number;
  verifiedAt: string;
  error?: string;
}

export interface IPaymentProvider {
  createPaymentOrder(params: PaymentOrderParams): Promise<PaymentOrderResult>;
  verifyPayment(params: PaymentVerificationParams): Promise<PaymentVerificationResult>;
  refundPayment(paymentId: string, amount: number): Promise<{ success: boolean; refundId: string }>;
}
