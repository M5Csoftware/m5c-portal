"use client";
import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";

function ThankYouPageContent() {
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const token = searchParams.get("token");
    const router = useRouter();

    const verify = async () => {
        if (token) {
            try {
                const res = await axios.post("/api/auth/verifyToken", { token });
                console.log(res.data);
                router.push("/portal");
            } catch (err) {
                console.log("Verification failed", err);
            }
        } else {
            console.log("Token not provided");
        }
    };

    return (
        <div className="flex flex-col justify-center h-[100vh] w-full mx-[74px]">
            {/* Title */}
            <h2 className="font-black text-3xl text-[#333333] mb-4">
                Thank You for Applying for <br />Your M5C Account!
            </h2>

            {/* Subtitle */}
            <p className="text-gray-400 text-xl  mb-2">
                We&apos;re currently verifying your information. You&apos;ll receive an update
                soon at your registered email address.
            </p>
            <p className="text-[#979797] text-xl mb-8">
                Thank you for choosing us! We&apos;ll be in touch shortly (2-3 business days).
            </p>

            {/* Button */}
            <div
                className={`w-full transition-colors text-lg rounded-md py-3 text-center cursor-pointer
                ${session?.user?.verified ? "bg-[#34A8533D] text-[#34A853]" : "bg-[#EA1B40] hover:bg-[#c81436] text-white"}`}
                onClick={verify}
            >
                {session?.user?.verified ? "Email Verified" : "Verify Email ID"}
                {session?.user?.verified && (
                    <div className="absolute right-[518px] top-[458px]">
                        <Image src={`/success-icon.svg`} alt='Email verification checkmark' width={25} height={25} />
                    </div>
                )}
            </div>
        </div>
    );
}

function ThankYouPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <div className="loader"></div>
            </div>
        }>
            <ThankYouPageContent />
        </Suspense>
    );
}

export default ThankYouPage;