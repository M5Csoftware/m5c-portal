// app/payment-failed/page.js
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function FailureContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const txnid = searchParams.get('txnid');
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const status = searchParams.get('status');

    const getErrorMessage = () => {
        if (message) return decodeURIComponent(message);
        if (error === 'invalid_hash') return 'Payment verification failed. Please contact support.';
        if (error === 'customer_not_found') return 'Customer account not found.';
        if (error === 'account_code_missing') return 'Account information missing.';
        if (error === 'server_error') return 'Server error occurred. Please try again.';
        return 'Your payment could not be processed. Please try again.';
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
            <div className='max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center'>
                <div className='mb-6'>
                    <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto'>
                        <svg className='w-10 h-10 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </div>
                </div>

                <h1 className='text-2xl font-bold text-gray-900 mb-2'>Payment Failed</h1>
                <p className='text-gray-600 mb-6'>{getErrorMessage()}</p>

                {(txnid || error || status) && (
                    <div className='bg-gray-50 rounded-lg p-4 mb-6 space-y-2'>
                        {txnid && txnid !== 'unknown' && (
                            <div className='flex justify-between text-sm'>
                                <span className='text-gray-600'>Transaction ID:</span>
                                <span className='font-medium text-gray-900'>{txnid}</span>
                            </div>
                        )}
                        {status && (
                            <div className='flex justify-between text-sm'>
                                <span className='text-gray-600'>Status:</span>
                                <span className='font-medium text-red-600'>{status}</span>
                            </div>
                        )}
                        {error && error !== 'payment_failed' && (
                            <div className='flex justify-between text-sm'>
                                <span className='text-gray-600'>Error Code:</span>
                                <span className='font-medium text-red-600'>{error}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className='flex gap-4'>
                    <Link
                        href='./portal'
                        className='flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors'
                    >
                        Go to Dashboard
                    </Link>
                    <button
                        onClick={() => router.back()}
                        className='flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors'
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PaymentFailed() {
    return (
        <Suspense fallback={
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='text-center'>
                    <div className='w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-600'>Loading...</p>
                </div>
            </div>
        }>
            <FailureContent />
        </Suspense>
    );
}