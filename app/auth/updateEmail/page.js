"use client";
import React, { useContext, useState } from "react";
import axios from "axios";
import { GlobalContext } from "@/app/portal/GlobalContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function UpdateEmailPage() {
    const [emailId, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { server } = useContext(GlobalContext);
    const { data: session } = useSession();
    const router = useRouter();


    const handleUpdate = async () => {
        try {
            setLoading(true);

            console.log(session);
            const id = session?.user?.id;
            if (!id) {
                console.log("User ID missing from session");
                return;
            }

            const response = await axios.put(
                `${server}/portal/auth/register?id=${id}`,
                { emailId }
            );

            console.log(response.data.message);
            router.push("/auth/verifyPage");
        } catch (err) {
            console.error("Error updating email:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col justify-center h-[100vh] w-full mx-[74px]">
            <h2 className="font-black text-3xl text-[#333333] mb-4">Update your Email ID</h2>
            <p className="text-gray-400 mb-2 text-xl">Enter the correct Email ID to proceed.</p>
            <input
                type="email"
                placeholder="Email ID"
                value={emailId}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded w-full mb-4"
            />
            <div className="flex flex-row-reverse">
                <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="text-[#c81436] border-[#c81436] border-2 hover:bg-[#c81436] transition-colors hover:text-white text-lg rounded-md px-12 py-2"
                >
                    {loading ? "Updating..." : "Done"}
                </button>
            </div>
        </div>
    );
}

export default UpdateEmailPage;
