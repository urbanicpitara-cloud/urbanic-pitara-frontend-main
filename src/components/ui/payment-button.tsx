'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { paymentRepository } from '@/lib/api/repositories/payment';

interface PaymentButtonProps {
  amount: number;
  orderId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function PhonePePaymentButton({
  amount,
  orderId,
  // onSuccess,
  onError,
  disabled = false,
}: PaymentButtonProps) {
  // const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Start payment process
      const response = await paymentRepository.initiate({
        amount,
        orderId,
        // PhonePe will redirect back to this URL after payment
        redirectUrl: `${window.location.origin}/payment/status`,
      });

      if (!response.success || !response.data?.redirectUrl) {
        throw new Error(response.error || 'Payment initialization failed');
      }

      // Store transaction ID in localStorage for status check
      if (response.data.transactionId) {
        localStorage.setItem('lastTransactionId', response.data.transactionId);
      }

      // Redirect to PhonePe payment page
      window.location.href = response.data.redirectUrl;

    } catch (error) {
      console.error('Payment error:', error);
      onError?.(error instanceof Error ? error.message : 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
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
          Processing...
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-2">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>Pay with PhonePe</span>
        </div>
      )}
    </Button>
  );
}