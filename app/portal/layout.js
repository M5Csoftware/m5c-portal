"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Sidebar from "./component/Navbar/Sidebar";
import Navbar from "./component/Navbar/Navbar";
import { FormDataProvider } from "./createshipment/FormDataContext";
import ChatBot from "./component/Chatbot/ChatBot";
import { GlobalContext } from "./GlobalContext";
import Wallet from "./component/Wallet/Wallet";
import OnboardingModal from "@/app/components/OnboardingModal";
import { CookieBanner } from "./privacy-security/component/CookieSettings";
// Uncomment this line to enable cookie debug panel for testing
// import CookieDebugPanel from "./component/CookieBanner/CookieDebugPanel";

export default function PortalLayout({ children }) {
  const { walletOpen, server } = useContext(GlobalContext);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Cookie banner functions
  const handleAcceptAllCookies = () => {
    const allAccepted = {
      necessary: true,
      preference: true,
      statistics: true,
      marketing: true,
    };
    localStorage.setItem("cookiePreferences", JSON.stringify(allAccepted));
    localStorage.setItem("cookieConsent", "accepted");
    console.log("All cookies accepted", allAccepted);
  };

  const handleRejectAllCookies = () => {
    const onlyNecessary = {
      necessary: true,
      preference: false,
      statistics: false,
      marketing: false,
    };
    localStorage.setItem("cookiePreferences", JSON.stringify(onlyNecessary));
    localStorage.setItem("cookieConsent", "rejected");
    console.log("Optional cookies rejected", onlyNecessary);
  };

  const handleManageSettings = () => {
    // Set a temporary consent to hide banner when navigating to settings
    localStorage.setItem("cookieConsent", "managing");
    router.push("/portal/privacy-security?tab=cookie");
  };

  const handleCloseBanner = () => {
    // User closed without making a choice - save as "dismissed"
    localStorage.setItem("cookieConsent", "dismissed");
    console.log("Cookie banner dismissed");
  };

  useEffect(() => {
    const fetchProgress = async () => {
      if (!session?.user?.id) return;

      try {
        const res = await axios.get(
          `${server}/portal/auth/register?id=${session.user.id}`
        );
        const user = res.data;

        const progress = user?.onboardingProgress || {};
        const allDone = Object.values(progress).every(Boolean);

        console.log("Onboarding Progress", allDone);

        // Hide onboarding if user is in certain routes or all steps done
        if (
          pathname === "/portal/profile" ||
          pathname === "/portal/createshipment" ||
          allDone
        ) {
          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
        }
      } catch (err) {
        console.error(
          "Failed to fetch onboarding progress:",
          err.response?.data?.error || err.message
        );
      }
    };

    fetchProgress();
  }, [session, pathname, server]);

  // Prevent background scrolling when wallet is open
  useEffect(() => {
    if (walletOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [walletOpen]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen items-center justify-center flex flex-col gap-4">
        <div className="loader"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userStatus = session?.user?.status;
  const verified = session?.user?.verified;

  if (userStatus === "pending" || verified === false) {
    router.push("/auth/thankYouPage");
  }

  if (userStatus === "rejected") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">
            Your request has been rejected. Contact support for more
            information.
          </p>
        </div>
      </div>
    );
  }

  if (userStatus !== "approved") {
    return null;
  }

  return (
    <FormDataProvider>
      <div className="flex overflow-x-clip">
        <Sidebar />
        <div className="bg-[#F8F9FA] relative min-h-dvh max-h-vh flex-grow">
          <div className="sticky top-0 bg-[#F8F9FA] z-50">
            <Navbar />
          </div>
          <div className="relative">{children}</div>
          <div className="bottom-4 right-4 fixed">
            <ChatBot />
          </div>
        </div>
        {walletOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <Wallet />
          </div>
        )}
        {showOnboarding && <OnboardingModal />}

        {/* Cookie Banner */}
        <CookieBanner
          onAcceptAll={handleAcceptAllCookies}
          onRejectAll={handleRejectAllCookies}
          onManageSettings={handleManageSettings}
          onClose={handleCloseBanner}
        />

        {/* Uncomment to enable debug panel for testing */}
        {/* <CookieDebugPanel /> */}
      </div>
    </FormDataProvider>
  );
}
