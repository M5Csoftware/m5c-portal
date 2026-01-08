"use client";
import { X, Info, SquareArrowOutUpRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";

// Cookie Banner Component
const CookieBanner = ({
    onAcceptAll,
    onRejectAll,
    onManageSettings,
    onClose,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const cookieConsent = localStorage.getItem("cookieConsent");
        console.log("Cookie consent status:", cookieConsent);

        if (!cookieConsent || cookieConsent === "") {
            const timer = setTimeout(() => {
                setIsVisible(true);
                console.log("Cookie banner should be visible");
            }, 500);
            return () => clearTimeout(timer);
        } else {
            console.log(
                "Cookie banner hidden - user already made choice:",
                cookieConsent
            );
        }
    }, [mounted]);

    const handleAcceptAll = () => {
        console.log("Accept All clicked");
        onAcceptAll();
        setIsVisible(false);
    };

    const handleRejectAll = () => {
        console.log("Reject All clicked");
        onRejectAll();
        setIsVisible(false);
    };

    const handleManageSettings = () => {
        console.log("Manage Settings clicked");
        onManageSettings();
        setIsVisible(false);
    };

    const handleClose = () => {
        console.log("Banner closed");
        setIsVisible(false);
        onClose();
    };

    if (!mounted || !isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t-2 border-gray-200 shadow-2xl p-6 animate-slide-up">
            <div className="max-w-7xl mx-auto flex justify-between items-start gap-6">
                <div className="flex-1">
                    <h2 className="font-semibold text-lg mb-2">We use cookies 🍪</h2>
                    <p className="text-gray-600 text-sm mb-4">
                        We use cookies to enhance your browsing experience, serve
                        personalized ads or content, and analyze our traffic. By clicking
                        &quot;Accept All&quot;, you consent to our use of cookies.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleAcceptAll}
                            className="bg-[#EA2147] hover:bg-[#c91d3d] text-white font-semibold rounded-md py-2 px-6 transition-colors"
                        >
                            Accept All
                        </button>
                        <button
                            onClick={handleManageSettings}
                            className="border-2 border-[#EA2147] text-[#EA2147] hover:bg-[#EA2147] hover:text-white font-semibold px-6 py-2 rounded-md transition-colors"
                        >
                            Manage Settings
                        </button>
                        <button
                            onClick={handleRejectAll}
                            className="font-semibold text-[#EA2147] hover:underline px-4"
                        >
                            Reject All
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
        </div>
    );
};

// Toggle Switch Component
const Toggle = ({ enabled, onChange, disabled = false }) => {
    return (
        <button
            onClick={() => !disabled && onChange(!enabled)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? "bg-green-500" : "bg-gray-300"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? "translate-x-6" : "translate-x-1"
                }`}
            />
        </button>
    );
};

// Cookie Settings Page Component
const CookieSettings = () => {
    const [cookiePreferences, setCookiePreferences] = useState({
        necessary: true,
        preference: false,
        statistics: false,
        marketing: false,
    });

    useEffect(() => {
        const savedPreferences = localStorage.getItem("cookiePreferences");
        if (savedPreferences) {
            setCookiePreferences(JSON.parse(savedPreferences));
        }
    }, []);

    const handleToggle = (category) => {
        if (category === "necessary") return;

        setCookiePreferences((prev) => {
            const updated = { ...prev, [category]: !prev[category] };
            localStorage.setItem("cookiePreferences", JSON.stringify(updated));
            return updated;
        });
    };

    const handleAcceptAll = () => {
        const allAccepted = {
            necessary: true,
            preference: true,
            statistics: true,
            marketing: true,
        };
        setCookiePreferences(allAccepted);
        localStorage.setItem("cookiePreferences", JSON.stringify(allAccepted));
        localStorage.setItem("cookieConsent", "accepted");
    };

    const handleRejectOptional = () => {
        const onlyNecessary = {
            necessary: true,
            preference: false,
            statistics: false,
            marketing: false,
        };
        setCookiePreferences(onlyNecessary);
        localStorage.setItem("cookiePreferences", JSON.stringify(onlyNecessary));
        localStorage.setItem("cookieConsent", "rejected");
    };

    const handleResetPreferences = () => {
        localStorage.removeItem("cookiePreferences");
        localStorage.removeItem("cookieConsent");
        alert(
            "Cookie preferences have been reset. Please refresh the page to see the cookie banner again."
        );
        window.location.reload();
    };

    const cookieData = [
        {
            id: "necessary",
            title: "Necessary Cookies",
            description:
                "These cookies are essential for the website to function properly. They enable basic functionality like page navigation, security, and access to secure areas. The website cannot function properly without these cookies.",
            info: "Always active - cannot be disabled",
            examples:
                "Session management, authentication tokens, security features, load balancing",
            isInfo: true,
        },
        {
            id: "preference",
            title: "Preference Cookies",
            description:
                "These cookies allow the website to remember choices you make and provide enhanced features. They remember your language, region, and other customization options.",
            examples:
                "Language settings, theme preferences, accessibility options, font size, currency selection",
            isInfo: false,
        },
        {
            id: "statistics",
            title: "Statistics Cookies",
            description:
                "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website performance and user experience.",
            examples:
                "Google Analytics, page views, bounce rate, traffic sources, time on site, user journey tracking",
            isInfo: false,
        },
        {
            id: "marketing",
            title: "Marketing Cookies",
            description:
                "These cookies are used to track visitors across websites and display ads that are relevant and engaging. They may be used to build a profile of your interests and show relevant ads on other sites.",
            examples:
                "Facebook Pixel, Google Ads, retargeting pixels, personalized advertisements, conversion tracking",
            isInfo: false,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Cookie Categories */}
            <div className="bg-white rounded-md p-8 shadow-sm">
                <div className="mb-6">
                    <h2 className="font-semibold text-xl">Cookie Categories</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Control which types of cookies you want to allow
                    </p>
                </div>

                <div className="space-y-6">
                    {cookieData.map((cookie, index) => (
                        <div key={cookie.id}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-base">{cookie.title}</h3>
                                        {cookie.id === "necessary" && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                                Required
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                                        {cookie.description}
                                    </p>
                                    <div className="flex items-start gap-2 text-sm text-gray-500 mt-2">
                                        {cookie.isInfo ? (
                                            <>
                                                <Info size={18} className="mt-0.5 flex-shrink-0" />
                                                <span>{cookie.info}</span>
                                            </>
                                        ) : (
                                            <span className="text-xs">
                                                <strong>Examples:</strong> {cookie.examples}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Toggle
                                        enabled={cookiePreferences[cookie.id]}
                                        onChange={() => handleToggle(cookie.id)}
                                        disabled={cookie.id === "necessary"}
                                    />
                                </div>
                            </div>
                            {index < cookieData.length - 1 && <hr className="mt-6" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-md p-8 shadow-sm">
                <h2 className="font-semibold text-xl mb-2">Quick Actions</h2>
                <p className="text-gray-600 text-sm mt-1 mb-4">
                    Quickly accept all or reject optional cookies
                </p>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleAcceptAll}
                        className="bg-[#EA2147] hover:bg-[#c91d3d] text-white font-semibold rounded-md py-3 px-6 transition-colors"
                    >
                        Accept All Cookies
                    </button>
                    <button
                        onClick={handleRejectOptional}
                        className="text-[#EA2147] font-semibold border-2 border-[#EA2147] hover:bg-[#EA2147] hover:text-white rounded-md py-3 px-6 transition-colors"
                    >
                        Reject Optional Cookies
                    </button>
                    <button
                        onClick={handleResetPreferences}
                        className="text-gray-700 font-semibold border-2 border-gray-300 hover:bg-gray-100 rounded-md py-3 px-6 transition-colors"
                    >
                        Reset All Preferences
                    </button>
                </div>
            </div>

            {/* Learn More */}
            <div className="bg-white rounded-md p-8 shadow-sm">
                <div className="mb-6">
                    <h2 className="font-semibold text-xl">Learn More</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Additional resources about our cookie usage
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/portal/privacy-security?tab=cookie"
                        className="rounded-md border border-gray-300 hover:border-[#EA2147] hover:bg-gray-50 p-4 flex gap-3 items-center transition-colors cursor-pointer"
                    >
                        <SquareArrowOutUpRight size={24} className="text-[#EA2147]" />
                        <span className="font-medium">Read Full Cookie Policy</span>
                    </Link>

                    <Link
                        href="/portal/privacy-security?tab=password"
                        className="rounded-md border border-gray-300 hover:border-[#EA2147] hover:bg-gray-50 p-4 flex gap-3 items-center transition-colors cursor-pointer"
                    >
                        <SquareArrowOutUpRight size={24} className="text-[#EA2147]" />
                        <span className="font-medium">Privacy Policy</span>
                    </Link>

                    <Link
                        href="/portal/privacy-security?tab=compliance"
                        className="rounded-md border border-gray-300 hover:border-[#EA2147] hover:bg-gray-50 p-4 flex gap-3 items-center transition-colors cursor-pointer"
                    >
                        <SquareArrowOutUpRight size={24} className="text-[#EA2147]" />
                        <span className="font-medium">Data Processing Information</span>
                    </Link>

                    <Link
                        href="/portal/privacy-security"
                        className="rounded-md border border-gray-300 hover:border-[#EA2147] hover:bg-gray-50 p-4 flex gap-3 items-center transition-colors cursor-pointer"
                    >
                        <SquareArrowOutUpRight size={24} className="text-[#EA2147]" />
                        <span className="font-medium">Privacy & Security Center</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export { CookieBanner, CookieSettings };