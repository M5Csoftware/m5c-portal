"use client";

import { useParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useParams();
  const error = searchParams.error;

  let message = "Something went wrong...";
  let description = "We had some trouble loading this page. Please refresh the page to try again or get in touch if the problem sticks around!";

  if (error === "UserNotRegistered") {
    message = "You are not registered";
    description = "Please contact admin or register first before trying to login.";
  } else if (error === "InvalidCredentials") {
    message = "Invalid credentials";
    description = "The email or password you entered is incorrect. Please try again.";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-red-50 px-4">
      <div className="text-center max-w-md w-full">
        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <img
            src="/Somthing-went.svg"
            alt="Error illustration"
            className="w-[16vw] h-auto"
          />
        </div>

        {/* Error message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{message}</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-[#EA1B40] hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Retry
          </button>
          <a
            href="/auth/signup"
            className="flex-1 bg-white hover:bg-gray-50 text-[#EA2147] font-semibold py-3 px-6 rounded-lg border-2 border-[#EA2147] transition-colors"
          >
            Go Back to Sign Up
          </a>
        </div>

        {/* Contact support link */}
        <a href="/contact" className="text-[#EA2147] hover:text-red-600 font-medium transition-colors">
          Contact support
        </a>

        {/* Footer */}
        <p className="text-[#94949B] text-sm mt-4">
          MSC Portal — Bringing Continents
        </p>
      </div>
    </div>
  );
}