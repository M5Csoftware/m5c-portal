// pages/index.js
"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  const handleClick = () => {
    setIsLoading(true);
  };

  useEffect(() => {
    // Set the audio current time to 2 seconds and play it when the component mounts
    if (audioRef.current) {
      audioRef.current.currentTime = 1.2; // Start from 2 seconds
      audioRef.current.play(); // Automatically play the audio
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Audio will play from 2 seconds */}
      <audio ref={audioRef} preload="auto">
        <source src="/windows_12.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-9 items-center animate-scaled">
          <Image
            src="/logo.svg"
            alt="M5C Logistics Logo"
            height={100}
            width={100}
          />
          <h1 className="text-2xl font-semibold text-[#18181B]">
            Welcome to M5C Logistics
          </h1>
          <div className="flex gap-4">
            <Link href="/portal">
              <button
                onClick={handleClick}
                className="px-6 py-3 w-[10vw]"
                style={{
                  backgroundColor: "#EA2147",
                  color: "white",
                  fontWeight: "600",
                  borderRadius: "0.5rem",
                  transition: "background-color 0.3s ease-in-out",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#d71b3c")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#EA2147")
                }
              >
                Go To Portal
              </button>
            </Link>
            <button
              className="px-6 py-3 w-[10vw]"
              style={{
                backgroundColor: "#EA2147",
                color: "white",
                fontWeight: "600",
                borderRadius: "0.5rem",
                transition: "background-color 0.3s ease-in-out",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#d71b3c")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#EA2147")
              }
            >
              <Link href={`/auth/login`}>Login</Link>
            </button>
            <button
              className="px-6 py-3 w-[10vw]"
              style={{
                backgroundColor: "#EA2147",
                color: "white",
                fontWeight: "600",
                borderRadius: "0.5rem",
                transition: "background-color 0.3s ease-in-out",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#d71b3c")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#EA2147")
              }
            >
              <Link href={`/auth/signup`}>Sign Up</Link>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
