'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { paymentRepository } from '@/lib/api/repositories/payment';

export default function PaymentStatusPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>('loading');
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Get transaction ID from URL or localStorage
        // Avoid using next/navigation's useSearchParams here (causes prerender/suspense issues)
        // Read directly from window.location.search in client runtime
        const params = new URLSearchParams(window.location.search);
        const transactionId = params.get('transactionId') || localStorage.getItem('lastTransactionId');

        if (!transactionId) {
          setError('Transaction ID not found');
          setStatus('error');
          return;
        }

        // Check payment status
        const response = await paymentRepository.checkStatus(transactionId);

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch payment status');
        }

        setPaymentDetails(response.data);
        setStatus(response.data?.status || 'unknown');

        // Clear transaction ID from localStorage
        localStorage.removeItem('lastTransactionId');

      } catch (error) {
        console.error('Error checking payment status:', error);
        setError(error instanceof Error ? error.message : 'Payment status check failed');
        setStatus('error');
      }
    };

    checkPaymentStatus();
  }, []);

  const getStatusDisplay = () => {
    // Our backend maps provider states to: INITIATED, PAID, FAILED, REFUNDED, NONE
    switch (status) {
      case 'PAID':
        return {
          title: 'Payment Successful',
          message: 'Your payment has been processed successfully.',
          icon: (
            <svg
              className="h-12 w-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
        };
      case 'FAILED':
        return {
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please try again.',
          icon: (
            <svg
              className="h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
        };
      case 'INITIATED':
      case 'PENDING':
        return {
          title: 'Payment Pending',
          message: 'Your payment is being processed.',
          icon: (
            <svg
              className="h-12 w-12 text-yellow-500 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ),
        };
      case 'REFUNDED':
        return {
          title: 'Payment Refunded',
          message: 'This payment has been refunded.',
          icon: (
            <svg className="h-12 w-12 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
            </svg>
          ),
        };
      default:
        return {
          title: 'Checking Payment Status',
          message: 'Please wait while we verify your payment.',
          icon: (
            <svg
              className="h-12 w-12 text-blue-500 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ),
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {statusDisplay.icon}
          <h1 className="text-2xl font-semibold text-gray-900">
            {statusDisplay.title}
          </h1>
          <p className="text-gray-600">{statusDisplay.message}</p>

          {error && (
            <p className="text-red-500 text-sm mt-2">Error: {error}</p>
          )}

          {paymentDetails && (
            <div className="w-full mt-6 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">
                  ₹{Number(paymentDetails.amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-medium">{paymentDetails.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium">
                  {new Date(paymentDetails.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <Button
              onClick={() => router.push('/orders')}
              variant="outline"
            >
              View Orders
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="default"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}