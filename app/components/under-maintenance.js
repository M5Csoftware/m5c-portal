"use client";

import { useParams } from "next/navigation";

export default function AuthErrorPage() {
    const searchParams = useParams();
    const error = searchParams.error;

    let message = "We’re under Maintenance";
    let description =
        "We’re improving the portal to serve you better. Please check back shortly.";

    // Optional dynamic error text, you can remove this if you want static maintenance mode
    if (error === "UserNotRegistered") {
        message = "You are not registered";
        description =
            "Please contact admin or register first before trying to login.";
    } else if (error === "InvalidCredentials") {
        message = "Invalid credentials";
        description =
            "The email or password you entered is incorrect. Please try again.";
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-white">
            <div className="text-center max-w-md w-full">
                {/* Illustration */}
                <div className="mb-8 flex justify-center">
                    <img
                        src="/under-maintenance.svg" // update: your replaced image here
                        alt="Maintenance illustration"
                        className="w-52 h-auto sm:w-64"
                    />
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                    {message}
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-3 leading-relaxed">{description}</p>

                {/* Sub-message like screenshot */}
                <div className="bg-red-50 text-red-500 px-4 py-2 rounded-full text-sm inline-block mb-6 border border-red-100">
                    • Approx. 10 minutes remaining
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center px-6">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 bg-[#EA1B40] hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                        Refresh
                    </button>
                    <a
                        href="/"
                        className="flex-1 bg-white hover:bg-gray-50 text-[#EA1B40] font-medium py-3 rounded-lg border border-[#EA1B40] transition-colors"
                    >
                        Go to homepage
                    </a>
                </div>

                {/* Contact Support */}
                <a
                    href="/contact"
                    className="text-[#EA1B40] hover:text-red-600 font-medium block mb-3"
                >
                    Contact support
                </a>

                {/* Footer */}
                <p className="text-gray-400 text-sm">
                    MSC Portal — Bringing Continents
                </p>
            </div>
        </div>
    );
}
