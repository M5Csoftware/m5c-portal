"use client";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

const ComplianceCenter = () => {
    const [expandedCards, setExpandedCards] = useState({});

    const toggleCard = (cardId) => {
        setExpandedCards((prev) => ({
            ...prev,
            [cardId]: !prev[cardId],
        }));
    };

    const documents = [
        {
            id: "privacy",
            title: "Privacy Policy",
            subtitle: "Complete Privacy policy document",
            content:
                "This Privacy Policy describes how we collect, use, and protect your personal information. We are committed to ensuring that your privacy is protected and we comply with all applicable data protection regulations. Your data is encrypted and stored securely, and we never share your information with third parties without your explicit consent.",
        },
        {
            id: "terms",
            title: "Terms of Service",
            subtitle: "Our terms and conditions",
            content:
                "By accessing and using our services, you agree to be bound by these Terms of Service. These terms outline your rights and responsibilities as a user, including acceptable use policies, account management, and dispute resolution procedures. Please read these terms carefully before using our platform.",
        },
        {
            id: "cookies",
            title: "Cookie Policy",
            subtitle: "How we use cookies",
            content:
                "We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand user preferences. You can control cookie settings through your browser preferences. Essential cookies are required for the site to function properly, while analytics and marketing cookies can be disabled.",
        },
        {
            id: "dpa",
            title: "Data Processing Agreement",
            subtitle: "Our data processing terms",
            content:
                "This Data Processing Agreement governs how we process personal data on behalf of our customers. We act as a data processor and comply with GDPR, CCPA, and other relevant data protection laws. This agreement covers data security measures, sub-processor arrangements, and data breach notification procedures.",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-md p-8">
                <div className="mb-6">
                    <h2 className="font-semibold text-xl">Documents and policies</h2>
                    <p className="text-gray-600 text-sm mt-1">
                        Important Documents and Policies
                    </p>
                </div>

                <div className="flex flex-col gap-5">
                    {documents.map((doc) => (
                        <div key={doc.id}>
                            <div className="border rounded-lg overflow-hidden transition-all duration-300 shadow-sm">
                                <button
                                    className="w-full flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 transition-colors text-left"
                                    onClick={() => toggleCard(doc.id)}
                                    aria-expanded={expandedCards[doc.id] || false}
                                    aria-controls={`content-${doc.id}`}
                                >
                                    <div>
                                        <h2 className="font-semibold text-base">{doc.title}</h2>
                                        <span className="text-sm text-gray-600 mt-1 block">
                                            {doc.subtitle}
                                        </span>
                                    </div>
                                    <div>
                                        <ChevronDown
                                            size={24}
                                            className={`text-[#EC3759] transition-transform duration-300 ${
                                                expandedCards[doc.id] ? "rotate-180" : ""
                                            }`}
                                        />
                                    </div>
                                </button>

                                <div
                                    id={`content-${doc.id}`}
                                    className={`transition-all duration-300 ease-in-out tracking-wide overflow-hidden ${
                                        expandedCards[doc.id]
                                            ? "max-h-[1000px] opacity-100"
                                            : "max-h-0 opacity-0"
                                    }`}
                                    role="region"
                                    aria-labelledby={`heading-${doc.id}`}
                                >
                                    <div className="px-6 pb-6 pt-2 text-sm text-gray-700 border-t leading-relaxed">
                                        {doc.content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ComplianceCenter;