"use client";
import { useSearchParams } from "next/navigation";
import TrackShipment from "./TrackShipment";

export default function TrackingPage() {
    const searchParams = useSearchParams();
    const awb = searchParams.get("awb");

    return (
        <main className="p-6">
            <h1 className="font-bold text-2xl mb-4">Shipment Tracking</h1>
            {awb ? (
                <TrackShipment awbNumber={awb} />
            ) : (
                <p>Enter an AWB number to track your shipment.</p>
            )}
        </main>
    );
}
