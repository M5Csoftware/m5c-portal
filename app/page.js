"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const audioRef = useRef(null);
  const hasPlayedSound = useRef(false);
  const hasAnimated = useRef(false);

  // Reset animation on every mount
  useEffect(() => {
    // Reset animation state
    setShowWelcome(false);
    setAnimationComplete(false);
    hasPlayedSound.current = false;
    hasAnimated.current = false;

    // Start welcome animation after a brief delay
    const timer = setTimeout(() => {
      setShowWelcome(true);
      hasAnimated.current = true;
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Play sound when animation completes
  useEffect(() => {
    if (animationComplete && !hasPlayedSound.current && audioRef.current) {
      hasPlayedSound.current = true;
      audioRef.current.currentTime = 1.2;
      audioRef.current.play().catch((error) => {
        console.log("Audio play failed:", error);
      });
    }
  }, [animationComplete]);

  const handleGoToPortal = async () => {
    setIsLoading(true);

    const autoLogin = localStorage.getItem("autoLogin");

    // Check if auto-login is enabled and session exists
    if (autoLogin === "true" && session?.user) {
      // Auto-login enabled and session exists - go directly to portal
      router.push("/portal");
    } else if (session?.user) {
      // Session exists but auto-login not enabled - still go to portal
      router.push("/portal");
    } else {
      // No session - redirect to login
      router.push("/auth/login");
    }
  };

  const handleLogin = () => {
    // Always go to login page
    // The login page will auto-redirect if valid session exists
    router.push("/auth/login");
  };

  // Handle animation end to trigger sound
  const handleAnimationEnd = () => {
    if (!animationComplete) {
      setAnimationComplete(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 overflow-hidden relative">
      {/* Background animated circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#EA2147] opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#EA2147] opacity-5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Audio element */}
      <audio ref={audioRef} preload="auto">
        <source src="/windows_12.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {isLoading || status === "loading" ? (
        <div className="flex items-center justify-center h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#EA1B40]"></div>
            <div
              className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#EA1B40] opacity-30"
              style={{ animationDirection: "reverse", animationDuration: "1s" }}
            ></div>
          </div>
        </div>
      ) : (
        <div
          className={`flex flex-col gap-9 items-center relative z-10 ${
            showWelcome ? "animate-fadeInUp" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Logo with animation */}
          <div
            className={`transform ${
              showWelcome ? "animate-logoEntry" : "scale-0 opacity-0"
            }`}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-[#EA2147] opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity"></div>
              <Image
                src="/logo.svg"
                alt="M5C Logistics Logo"
                height={100}
                width={100}
                className="relative drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Welcome text with stagger animation */}
          <div
            className={`transform ${
              showWelcome
                ? "animate-fadeInUp delay-500"
                : "opacity-0 translate-y-4"
            }`}
          >
            <h1 className="text-3xl font-bold text-[#18181B] text-center">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-[#EA2147] to-[#d71b3c] bg-clip-text text-transparent">
                M5C Logistics
              </span>
            </h1>
          </div>

          {/* Buttons with stagger animation and underline effect */}
          <div
            className={`flex flex-col sm:flex-row gap-4 transform ${
              showWelcome
                ? "animate-fadeInUp delay-700"
                : "opacity-0 translate-y-4"
            }`}
            onAnimationEnd={handleAnimationEnd}
          >
            {/* Go To Portal Button */}
            <div className="relative group">
              <button
                onClick={handleGoToPortal}
                disabled={isLoading}
                className="group relative px-8 py-3 min-w-[200px] bg-gradient-to-r from-[#EA2147] to-[#d71b3c] text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <span className="relative z-10">Go To Portal</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
              {/* Animated underline bar */}
              <span className="absolute -bottom-1.5 rounded-3xl left-1/2 w-0 h-0.5 bg-[#EA2147] group-hover:w-full group-hover:left-0 transition-all duration-500 ease-out"></span>
            </div>

            {/* Login Button */}
            <div className="relative group">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="relative px-8 py-3 min-w-[200px] bg-gradient-to-r from-[#EA2147] to-[#d71b3c] text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
              {/* Animated underline bar */}
              <span className="absolute -bottom-1.5 rounded-3xl left-1/2 w-0 h-0.5 bg-[#EA2147] group-hover:w-full group-hover:left-0 transition-all duration-500 ease-out"></span>
            </div>

            {/* Sign Up Button */}
            <Link href="/auth/signup" className="relative group">
              <button
                disabled={isLoading}
                className="relative px-8 py-3 min-w-[200px] bg-gradient-to-r from-[#EA2147] to-[#d71b3c] text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <span className="relative z-10">Sign Up</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
              {/* Animated underline bar */}
              <span className="absolute -bottom-1.5 rounded-3xl left-1/2 w-0 h-0.5 bg-[#EA2147] group-hover:w-full group-hover:left-0 transition-all duration-500 ease-out"></span>
            </Link>
          </div>

          {/* Decorative animated line */}
          <div
            className={`w-32 h-1 bg-gradient-to-r from-transparent via-[#EA2147] to-transparent rounded-full transform ${
              showWelcome ? "animate-scaleX delay-1000" : "opacity-0 scale-x-0"
            }`}
          ></div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes logoEntry {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes scaleX {
          0% {
            opacity: 0;
            transform: scaleX(0);
          }
          100% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.05;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.08;
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out forwards;
        }

        .animate-logoEntry {
          animation: logoEntry 1s ease-out forwards;
        }

        .animate-scaleX {
          animation: scaleX 1s ease-out forwards;
        }

        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-700 {
          animation-delay: 0.7s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        /* Underline bar animation */
        .group:hover span {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default Home;
