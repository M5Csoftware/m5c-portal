"use client";
import React, { useContext, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function VerifyPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();


    const resendVerification = async () => {
        if (!session?.user) return;
        try {
            setLoading(true);
            await axios.post("/api/auth/sendVerification", {
                email: session?.user?.email,
                fullName: session?.user?.name,
                userId: session?.user?.id,
            });

            console.log("Verification email resent successfully.");
        } catch (err) {
            console.log("Error resending email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center h-[100vh] w-full mx-[74px]">
            <h2 className="font-black text-3xl text-[#333333] mb-4">
                Please Verify Your Email Address
            </h2>

            <p className="text-gray-400 mb-2 text-xl">We just sent an email to your registered email.</p>
            <p className="text-[#979797] mb-8 text-xl">Click the link in the email to verify your account.</p>

            <div className="flex justify-between w-full">
                <button
                    onClick={resendVerification}
                    className="text-[#c81436] border-[#c81436] border-2 hover:bg-[#c81436] transition-colors hover:text-white text-lg rounded-md px-12 py-2"
                >
                    {loading ? "Resending..." : "Resend Email"}
                </button>
                <button
                    onClick={() => router.push("/auth/updateEmail")}
                    className="text-[#c81436] border-[#c81436] border-2 hover:bg-[#c81436] transition-colors hover:text-white text-lg rounded-md px-12 py-2"
                >
                    Update Email
                </button>
                <a
                    href="mailto:support@m5clogistics.com"
                    className="text-[#c81436] border-[#c81436] border-2 hover:bg-[#c81436] transition-colors hover:text-white text-lg rounded-md px-12 py-2 text-center"
                >
                    Contact Support
                </a>
            </div>
        </div >
    );
}

export default VerifyPage;
