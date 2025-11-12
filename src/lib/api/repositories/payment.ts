// src/lib/api/repositories/payment.ts
import { apiClient } from '../client';

interface PaymentResponse {
  success: boolean;
  data?: {
    redirectUrl: string;
    transactionId: string;
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
    callbackUrl?: string;
    redirectUrl?: string;
  }): Promise<PaymentResponse> {
    const response = await apiClient.post<PaymentResponse>('/payment/initiate', params);
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