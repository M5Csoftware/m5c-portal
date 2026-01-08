// app/payment-success/page.js
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const txnid = searchParams.get('txnid');
    const amount = searchParams.get('amount');

    useEffect(() => {
        // Auto-redirect to dashboard after 5 seconds
        const timer = setTimeout(() => {
            router.push('./portal/');
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
            <div className='max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center'>
                <div className='mb-6'>
                    <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
                        <svg className='w-10 h-10 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                        </svg>
                    </div>
                </div>

                <h1 className='text-2xl font-bold text-gray-900 mb-2'>Payment Successful!</h1>
                <p className='text-gray-600 mb-6'>Your wallet has been recharged successfully.</p>

                <div className='bg-gray-50 rounded-lg p-4 mb-6 space-y-2'>
                    <div className='flex justify-between'>
                        <span className='text-gray-600'>Transaction ID:</span>
                        <span className='font-medium text-gray-900'>{txnid || 'N/A'}</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='text-gray-600'>Amount:</span>
                        <span className='font-medium text-green-600 text-lg'>
                            ₹ {amount ? new Intl.NumberFormat('en-IN').format(amount) : '0'}
                        </span>
                    </div>
                </div>

                <p className='text-sm text-gray-500 mb-4'>Redirecting to dashboard in 5 seconds...</p>

                <Link
                    href='./portal'
                    className='inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors'
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
}

export default function PaymentSuccess() {
    return (
        <Suspense fallback={
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='text-center'>
                    <div className='w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-600'>Processing payment...</p>
                </div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}