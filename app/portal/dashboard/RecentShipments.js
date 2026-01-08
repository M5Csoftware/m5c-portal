'use client';

import React, { useState, useEffect, useContext } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { GlobalContext } from '../GlobalContext'

const RecentShipmentStatus = (props) => {
    // Determine the status styles and image URL based on the status
    const statusStyles = () => {
        const status = props.status.toLowerCase();
        if (status.includes('delivered')) {
            return 'bg-green-100 text-green-700';
        } else if (status.includes('shipment created') || status.includes('manifest created') || status.includes('Ready To Ship')) {
            return 'bg-yellow-100 text-yellow-700';
        } else if (status.includes('hold') || status.includes('pending')) {
            return 'bg-red-100 text-red-700';
        } else {
            return 'bg-gray-100 text-gray-700';
        }
    };

    const statusImage = () => {
        const status = props.status.toLowerCase();
        if (status.includes('delivered')) {
            return '/dot-green.svg';
        } else if (status.includes('shipment created') || status.includes('manifest created') || status.includes('Ready To Ship')) {
            return '/dot-yellow.svg';
        } else if (status.includes('hold') || status.includes('pending')) {
            return '/dot-red.svg';
        } else {
            return '/dot-red.svg';
        }
    };

    return (
        <div className='text-[#71717A]'>
            <ul className='flex justify-between p-4 text-xs items-center '>
                <li className='w-[12%]'>
                    <div className={`rounded-full w-fit px-4 py-2 flex gap-2 items-center ${statusStyles()}`}>
                        <Image width={10} height={10} src={statusImage()} alt={`${props.status} dot`} />
                        <span className='truncate'>{props.status}</span>
                    </div>
                </li>
                <li className='w-[12%]'>{props.bookingDate}</li>
                <li className='w-[12%]'>{props.awb}</li>
                <li className='w-[12%] truncate'>{props.destination}</li>
                <li className='w-[12%] truncate'>{props.service}</li>
                <li className='w-[10%]'>{props.forwarded}</li>
                <li className='w-[16%] text-[#4F46E5]'>{props.forwordingNo}</li>
                <li className='w-[10%]'>{props.amount} INR</li>
            </ul>
        </div>
    );
};

const RecentShipments = () => {
    const { server } = useContext(GlobalContext);
    const { data: session } = useSession();
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (session?.user?.accountCode) {
            fetchShipments();
        }
    }, [session]);

    const fetchShipments = async () => {
        try {
            setLoading(true);
            const accountCode = session?.user?.accountCode;
            
            const response = await axios.get(
                `${server}/portal/dashboard-shipment?accountCode=${accountCode}`
            );

            if (response.data.success) {
                setShipments(response.data.shipments);
            } else {
                setError('Failed to fetch shipments');
            }
        } catch (error) {
            console.error('Error fetching shipments:', error);
            setError('Error loading shipments');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className='w-full bg-white rounded-lg p-4 border border-[#E2E8F0]'>
                <div className='flex justify-center items-center py-12'>
                    <div className='text-gray-500'>Loading shipments...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='w-full bg-white rounded-lg p-4 border border-[#E2E8F0]'>
                <div className='flex justify-center items-center py-12'>
                    <div className='text-red-500'>{error}</div>
                </div>
            </div>
        );
    }

    // Show empty state when no shipments
    if (shipments.length === 0) {
        return (
            <div className='w-full bg-white rounded-lg p-4 border border-[#E2E8F0]'>
                {/* Header section - always visible */}
                <div className='flex justify-between items-start mb-4'>
                    <div>
                        <span className='font-bold text-lg'>
                            Recent Shipment
                        </span>
                        <div className='flex gap-2 items-center mt-1'>
                            <Image width={10} height={10} src='/green-tick.svg' alt='green tick' />
                            <span className='text-xs text-[#979797]'>0 done this month</span>
                        </div>
                    </div>
                    <div>
                        <Link href='../portal/shipments'>
                            <div className='flex gap-2 items-center text-[#EA2147] cursor-pointer hover:underline'>
                                <span>See all shipments</span>
                                <span>&gt;</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Empty state content */}
                <div className='flex flex-col items-center justify-center py-12'>
                    {/* Recent Shipment Image */}
                    <div className="flex justify-center mb-6">
                        <Image 
                            src="/recent-shipment.svg" 
                            alt="No Recent Shipments" 
                            width={200}
                            height={200}
                            className="object-contain"
                        />
                    </div>
                    
                    {/* Text Content */}
                    <h3 className="text-xl font-bold text-[#18181B] mb-2 text-center">
                        No recent shipments
                    </h3>
                    <p className="text-[#727C88] text-sm mb-6 text-center">
                        Create your first shipment to get started
                    </p>
                    
                    {/* Create Shipment Button */}
                    <Link href="./portal/createshipment" className="inline-flex">
                        <button className="bg-[#EA1B40] hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-all">
                            Create Shipment
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className='w-full bg-white rounded-lg p-4 border border-[#E2E8F0]'>
                <div className='flex justify-between items-start'>
                    <div>
                        <span className='font-bold text-lg'>
                            Recent Shipment
                        </span>
                        <div className='flex gap-2 items-center mt-1'>
                            <Image width={10} height={10} src='/green-tick.svg' alt='green tick' />
                            <span className='text-xs text-[#979797]'>{shipments.length} done this month</span>
                        </div>
                    </div>
                    <div>
                        <Link href='../portal/shipments'>
                            <div className='flex gap-2 items-center text-[#EA2147] cursor-pointer hover:underline'>
                                <span>See all shipments</span>
                                <span>&gt;</span>
                            </div>
                        </Link>
                    </div>
                </div>
                <div className='mt-4'>
                    <div>
                        <ul className='flex justify-between p-4 text-[#A0AEC0] text-xs items-center '>
                            <li className='w-[12%]'>Status</li>
                            <li className='w-[12%]'>Booking Date</li>
                            <li className='w-[12%]'>AWB</li>
                            <li className='w-[12%]'>Destination</li>
                            <li className='w-[12%]'>Service</li>
                            <li className='w-[10%]'>Forwarded</li>
                            <li className='w-[16%]'>Forwarding Number</li>
                            <li className='w-[10%]'>Amount</li>
                        </ul>
                    </div>
                    <div>
                        {shipments.map((shipment, index) => (
                            <RecentShipmentStatus
                                key={index}
                                status={shipment.status}
                                bookingDate={shipment.bookingDate}
                                awb={shipment.awb}
                                destination={shipment.destination}
                                service={shipment.service}
                                forwarded={shipment.forwarded}
                                forwordingNo={shipment.forwordingNo}
                                amount={new Intl.NumberFormat('en-IN').format(shipment.amount)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RecentShipments