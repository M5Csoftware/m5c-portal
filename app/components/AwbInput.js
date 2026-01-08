"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const AwbInput = ({ onClose, setIsQuickActionActive, shipmentCount = 0 }) => {
    const [awbNumber, setAwbNumber] = useState("");
    const router = useRouter();

    const handleTrack = () => {
        if (!awbNumber.trim()) return;
        router.push(`/portal/tracking?awb=${encodeURIComponent(awbNumber.trim())}`);
        if (setIsQuickActionActive) {
            setIsQuickActionActive(prev => !prev);
        }
        if (onClose) onClose(); // auto close modal after track
    };

    return (
        <div className="bg-[#FFE3E4] rounded-lg p-6 flex flex-col gap-6 shadow-md w-full mx-auto relative">
            {/* Close Button (if passed) */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl leading-none"
                >
                    ×
                </button>
            )}

            {/* Show track image and message when no shipments */}
            {shipmentCount === 0 ? (
                <div className="text-center py-4">
                    {/* Track Image */}
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/track.svg"
                            alt="Track Shipment"
                            width={128}
                            height={128}
                            className="w-32 h-32 object-contain"
                        />
                    </div>

                    {/* Message */}
                    <h3 className="text-xl font-bold text-[#18181B] mb-2">
                        Nothing to track
                    </h3>
                    <p className="text-[#727C88] text-sm">
                        You don&apos;t have any active shipment to track
                    </p>
                </div>
            ) : (
                <>
                    {/* Heading */}
                    <div>
                        <h2 className="text-2xl font-semibold text-[#18181B]">Track Your Shipment</h2>
                        <p className="text-[#18181B] text-sm mt-2">
                            Find and track your shipment effortlessly, in real time
                        </p>
                    </div>

                    {/* Input + Button in one row */}
                    <div className="flex w-full rounded-lg border border-[#E2E8F0] overflow-hidden bg-white">
                        <input
                            type="text"
                            placeholder="Enter Airwaybill Number"
                            className="flex-1 px-4 py-3 text-sm outline-none text-[#979797]"
                            value={awbNumber}
                            onChange={(e) => setAwbNumber(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                        />
                        <button
                            onClick={handleTrack}
                            className="bg-[#EA1B40] hover:bg-red-700 text-white px-8 py-2 m-2 text-sm font-medium transition-all rounded-md"
                        >
                            Track
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AwbInput;