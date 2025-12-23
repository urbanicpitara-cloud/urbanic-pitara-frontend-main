'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { paymentRepository } from '@/lib/api/repositories/payment';
import { useCart } from '@/lib/atoms/cart';
import { toast } from 'sonner';

export default function PhonePeCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const [status, setStatus] = useState<string>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get transaction ID from URL params
                const transactionId = searchParams.get('transactionId');

                if (!transactionId) {
                    setError('Transaction ID not found');
                    setStatus('error');
                    toast.error('Payment verification failed: Transaction ID missing');
                    setTimeout(() => router.push('/'), 3000);
                    return;
                }

                // Check payment status from backend
                const response = await paymentRepository.checkStatus(transactionId);

                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch payment status');
                }

                const paymentStatus = response.data?.status;

                if (paymentStatus === 'PAID') {
                    // Payment successful
                    setStatus('success');
                    toast.success('Payment successful!');
                    clearCart();
                    setTimeout(() => router.push('/orders'), 1500);
                } else if (paymentStatus === 'FAILED') {
                    // Payment failed
                    setStatus('failed');
                    toast.error('Payment failed. Please try again.');
                    setTimeout(() => router.push('/'), 3000);
                } else {
                    // Pending or other status
                    setStatus('pending');
                    toast.info('Payment is being processed. Please check your orders.');
                    setTimeout(() => router.push('/orders'), 3000);
                }

            } catch (err) {
                console.error('Error handling PhonePe callback:', err);
                setError(err instanceof Error ? err.message : 'Payment verification failed');
                setStatus('error');
                toast.error('Payment verification failed');
                setTimeout(() => router.push('/'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, router, clearCart]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-lg p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                    {status === 'loading' && (
                        <>
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
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Verifying Payment
                            </h1>
                            <p className="text-gray-600">Please wait while we verify your payment...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
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
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Payment Successful
                            </h1>
                            <p className="text-gray-600">Redirecting to your orders...</p>
                        </>
                    )}

                    {(status === 'failed' || status === 'error') && (
                        <>
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
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Payment Failed
                            </h1>
                            <p className="text-gray-600">
                                {error || 'Your payment could not be processed. Please try again.'}
                            </p>
                            <Button onClick={() => router.push('/')} variant="default">
                                Return to Home
                            </Button>
                        </>
                    )}

                    {status === 'pending' && (
                        <>
                            <svg
                                className="h-12 w-12 text-yellow-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Payment Pending
                            </h1>
                            <p className="text-gray-600">Your payment is being processed...</p>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}
