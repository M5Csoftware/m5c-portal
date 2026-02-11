"use client"
import React, { useContext, useState, useEffect } from "react";
import { Check } from "lucide-react";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";
import AccountDetails from "./AccountDetails";
import TestAPI from "./TestApi";
import DocumentVerification from "./DocumentVerification";

const APIRequestForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [requestSubmitted, setRequestSubmitted] = useState(false);
    const [requestStatus, setRequestStatus] = useState(null);
    const { server } = useContext(GlobalContext);
    const { data: session } = useSession();

    // Form state
    const [accountDetails, setAccountDetails] = useState({
        customerCode: "",
        customerName: "",
        email: "",
        phone: "",
        apiUseCase: []
    });

    const steps = [
        { id: 1, label: "Account Details" },
        { id: 2, label: "Test API" },
        { id: 3, label: "Document Verification" }
    ];

    // Check if user has pending or approved request
    useEffect(() => {
        const checkUserRequest = async () => {
            if (session?.user?.email) {
                try {
                    const response = await fetch(`${server}/api-request?email=${session.user.email}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (Array.isArray(data) && data.length > 0) {
                            const latestRequest = data[0]; // Get latest request
                            setRequestStatus(latestRequest.Status);
                            
                            // If approved, allow access to Test API
                            if (latestRequest.Status === "approved" || latestRequest.Status === "active") {
                                setRequestSubmitted(true);
                                setCurrentStep(2); // Auto-navigate to Test API
                            } else if (latestRequest.Status === "pending") {
                                setRequestSubmitted(true);
                                setCurrentStep(1); // Stay on first step
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error checking request status:", error);
                }
            }
        };

        checkUserRequest();
    }, [session, server]);

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleStepClick = (stepId) => {
        // Only allow navigation if request is approved
        if (requestStatus === "approved" || requestStatus === "active") {
            setCurrentStep(stepId);
        } else if (stepId === 1) {
            // Always allow going back to step 1
            setCurrentStep(stepId);
        }
        // Don't allow navigating to other steps if not approved
    };

    const handleRequestSubmitted = () => {
        setRequestSubmitted(true);
        setRequestStatus("pending");
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <AccountDetails
                        accountDetails={accountDetails}
                        setAccountDetails={setAccountDetails}
                        handleNext={handleNext}
                        server={server}
                        session={session}
                        onRequestSubmitted={handleRequestSubmitted}
                    />
                );
            case 2:
                // Only show TestAPI if request is approved
                if (requestStatus === "approved" || requestStatus === "active") {
                    return (
                        <TestAPI
                            handleNext={handleNext}
                            server={server}
                            session={session}
                        />
                    );
                } else {
                    return (
                        <div className="bg-white rounded-lg p-8 shadow-sm">
                            <div className="text-center py-12">
                                <div className="mx-auto flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 mb-4">
                                    <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    API Access Pending Approval
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    Your API request is currently under review. Please wait for our team to approve your application.
                                    Once approved, you will receive an email with your API key and access instructions.
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                                    <p className="text-sm text-gray-600">
                                        Current Status: <span className="font-semibold text-yellow-600">Pending</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        You will be notified at: <span className="font-medium">{session?.user?.email}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                }
            case 3:
                // Only show DocumentVerification if request is approved
                if (requestStatus === "approved" || requestStatus === "active") {
                    return (
                        <DocumentVerification
                            accountDetails={accountDetails}
                        />
                    );
                } else {
                    return (
                        <div className="bg-white rounded-lg p-8 shadow-sm">
                            <div className="text-center py-12">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Complete Step 2 First
                                </h3>
                                <p className="text-gray-600">
                                    Please complete the Test API step before proceeding to document verification.
                                </p>
                            </div>
                        </div>
                    );
                }
            default:
                return null;
        }
    };

    // Function to check if step is clickable
    const isStepClickable = (stepId) => {
        if (stepId === 1) return true; // Step 1 is always clickable
        
        if (requestStatus === "approved" || requestStatus === "active") {
            return true; // All steps clickable if approved
        }
        
        return false; // Other steps not clickable if not approved
    };

    return (
        <div className="bg-gray-50 p-8">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-4">API</h1>
                    <div className="flex gap-8 border-b">
                        <button className="pb-2 border-b-4 rounded-sm border-[#EA1B40] text-[#EA1B40] font-semibold">
                            Request API Key
                        </button>
                    </div>
                </div>

                {/* Step Navigation */}
                <div className="bg-white rounded-lg p-8 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mx-auto relative">
                        {/* Progress Line */}
                        <div className="absolute left-20 right-24 border-t-2 border-dashed border-gray-500 transform -translate-y-1/2 mb-6" />
                        <div
                            className="absolute left-[4.4%] top-5 h-0.5 bg-[#EA1B40] transition-all duration-500 z-10"
                            style={{ width: `${(currentStep - 1) * 45}%` }}
                        />

                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`flex flex-col items-center z-30 ${
                                    isStepClickable(step.id) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                onClick={() => isStepClickable(step.id) && handleStepClick(step.id)}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                                        step.id < currentStep
                                            ? "bg-[#EA1B40] text-white"
                                            : step.id === currentStep
                                            ? "bg-[#EA1B40] text-white ring-4 ring-red-100"
                                            : requestStatus === "approved" && step.id > currentStep
                                            ? "bg-gray-200 text-gray-500"
                                            : "bg-gray-100 text-gray-400"
                                    }`}
                                >
                                    {step.id < currentStep ? <Check className="h-5 w-5" /> : step.id}
                                </div>
                                <span
                                    className={`text-sm py-1 font-semibold transition-colors ${
                                        step.id <= currentStep ? "text-gray-900" : "text-gray-500"
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="transition-all duration-300">
                    {renderStepContent()}
                </div>
            </div>
        </div>
    );
};

export default APIRequestForm;