// src/lib/api/repositories/payment.ts
import { apiClient } from '../client';

interface PaymentResponse {
  success: boolean;
  provider?: string;
  data?: {
    redirectUrl?: string;
    transactionId: string;
    // Razorpay specific
    orderId?: string;
    amount?: number;
    currency?: string;
    keyId?: string;
    // Stripe specific
    clientSecret?: string;
    publishableKey?: string;
  };
  error?: string;
}

interface PaymentStatusResponse {
  success: boolean;
  data?: {
    status: string;
    amount: number;
    orderId: string;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}

export const paymentRepository = {
  /**
   * Initiate a payment
   */
  async initiate(params: {
    amount: number;
    orderId: string;
    provider?: string;
    callbackUrl?: string;
    redirectUrl?: string;
  }): Promise<PaymentResponse> {
    const response = await apiClient.post<PaymentResponse>('/payment/initiate', params);
    return response;
  },

  /**
   * Verify Razorpay payment
   */
  async verifyRazorpay(params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ success: boolean; verified: boolean }> {
    const response = await apiClient.post<{ success: boolean; verified: boolean }>('/payment/verify/razorpay', params);
    return response;
  },

  /**
   * Confirm Stripe payment
   */
  async confirmStripe(params: {
    payment_intent_id: string;
  }): Promise<{ success: boolean; status: string; paymentStatus: string }> {
    const response = await apiClient.post<{ success: boolean; status: string; paymentStatus: string }>('/payment/confirm/stripe', params);
    return response;
  },

  /**
   * Check payment status
   */
  async checkStatus(transactionId: string): Promise<PaymentStatusResponse> {
    const response = await apiClient.get<PaymentStatusResponse>(`/payment/status/${transactionId}`);
    return response;
  },
};