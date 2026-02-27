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
    const [hasExistingRequest, setHasExistingRequest] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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

    // Helper function to check if status is approved (case insensitive)
    const isApproved = (status) => {
        if (!status) return false;
        const statusLower = status.toString().toLowerCase();
        return statusLower === "approved" || statusLower === "active";
    };

    // Helper function to check if status is pending (case insensitive)
    const isPending = (status) => {
        if (!status) return false;
        const statusLower = status.toString().toLowerCase();
        return statusLower === "pending";
    };

    // Check if user has pending or approved request for THEIR account only
    useEffect(() => {
        const checkUserRequest = async () => {
            setIsLoading(true);
            
            const userEmail = session?.user?.email;
            const accountCode = session?.user?.accountCode;
            
            console.log("Checking request for:", { userEmail, accountCode });
            
            if (userEmail && accountCode) {
                try {
                    // Include both email and customerCode in the query
                    const url = `${server}/api-request?email=${encodeURIComponent(userEmail)}&customerCode=${encodeURIComponent(accountCode)}`;
                    console.log("Fetching from URL:", url);
                    
                    const response = await fetch(url);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log("Response data:", data);
                        
                        // The API now returns an array (even for single record)
                        if (Array.isArray(data) && data.length > 0) {
                            // Since we're filtering by both email and customerCode,
                            // the first record should be the correct one
                            const userRequest = data[0];
                            
                            // Store the original status from database
                            const dbStatus = userRequest.Status || userRequest.status;
                            console.log("Found request with status:", dbStatus);
                            
                            setRequestStatus(dbStatus);
                            setHasExistingRequest(true);
                            
                            // Auto-populate account details if they exist
                            setAccountDetails({
                                customerCode: userRequest.customerCode || accountCode,
                                customerName: userRequest.customerName || "",
                                email: userRequest.email || userEmail,
                                phone: userRequest.phone || "",
                                apiUseCase: userRequest.apiUseCase || []
                            });
                            
                            // If approved, allow access to Test API and auto-navigate
                            if (isApproved(dbStatus)) {
                                console.log("Request approved - navigating to step 2");
                                setRequestSubmitted(true);
                                setCurrentStep(2);
                            } else if (isPending(dbStatus)) {
                                console.log("Request pending - staying on step 1");
                                setRequestSubmitted(true);
                                setCurrentStep(1);
                            } else {
                                console.log("Request has other status:", dbStatus);
                                setRequestSubmitted(true);
                                setCurrentStep(1);
                            }
                        } else {
                            // No existing request found for this account
                            console.log("No request found for this account");
                            setHasExistingRequest(false);
                            setRequestStatus(null);
                            
                            // Set account code and email from session
                            setAccountDetails(prev => ({
                                ...prev,
                                customerCode: accountCode,
                                email: userEmail
                            }));
                        }
                    } else if (response.status === 404) {
                        // No records found (API returns 404 when no data)
                        console.log("No request found (404 response)");
                        setHasExistingRequest(false);
                        setRequestStatus(null);
                        
                        // Set account code and email from session
                        setAccountDetails(prev => ({
                            ...prev,
                            customerCode: accountCode,
                            email: userEmail
                        }));
                    } else {
                        console.error("Failed to fetch requests:", response.status);
                        setHasExistingRequest(false);
                        setRequestStatus(null);
                    }
                } catch (error) {
                    console.error("Error checking request status:", error);
                    setHasExistingRequest(false);
                    setRequestStatus(null);
                } finally {
                    setIsLoading(false);
                }
            } else {
                console.log("Missing user email or account code:", { userEmail, accountCode });
                setIsLoading(false);
            }
        };

        // Only run if we have both email and account code
        if (session?.user?.email && session?.user?.accountCode) {
            checkUserRequest();
        } else {
            setIsLoading(false);
        }
    }, [session, server]);

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleStepClick = (stepId) => {
        // Only allow navigation if request is approved
        if (isApproved(requestStatus)) {
            setCurrentStep(stepId);
        } else if (stepId === 1) {
            // Always allow going back to step 1
            setCurrentStep(stepId);
        }
    };

    const handleRequestSubmitted = () => {
        setRequestSubmitted(true);
        setRequestStatus("pending");
        setHasExistingRequest(true);
    };

    const renderStepContent = () => {
        if (isLoading) {
            return (
                <div className="bg-white rounded-lg p-8 shadow-sm">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[#EA1B40] mb-4"></div>
                        <p className="text-gray-600">Loading your account details...</p>
                    </div>
                </div>
            );
        }

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
                        hasExistingRequest={hasExistingRequest}
                        requestStatus={requestStatus}
                    />
                );
            case 2:
                // Only show TestAPI if request is approved
                if (isApproved(requestStatus)) {
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
                                    {hasExistingRequest 
                                        ? isPending(requestStatus)
                                            ? "API Access Pending Approval"
                                            : "API Request Not Approved"
                                        : "Submit API Request First"}
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    {hasExistingRequest 
                                        ? isPending(requestStatus)
                                            ? "Your API request is currently under review. Please wait for our team to approve your application. Once approved, you will receive an email with your API key and access instructions."
                                            : "Your API request has not been approved yet. Please contact support for more information."
                                        : "You need to submit an API request first. Please complete the Account Details step to request API access."}
                                </p>
                                {hasExistingRequest && isPending(requestStatus) && (
                                    <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                                        <p className="text-sm text-gray-600">
                                            Current Status: <span className="font-semibold text-yellow-600">Pending</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Account: <span className="font-medium">{accountDetails.customerCode}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            You will be notified at: <span className="font-medium">{session?.user?.email}</span>
                                        </p>
                                    </div>
                                )}
                                {hasExistingRequest && !isPending(requestStatus) && !isApproved(requestStatus) && (
                                    <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                                        <p className="text-sm text-gray-600">
                                            Current Status: <span className="font-semibold text-red-600">{requestStatus || "Unknown"}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Account: <span className="font-medium">{accountDetails.customerCode}</span>
                                        </p>
                                    </div>
                                )}
                                {!hasExistingRequest && (
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="bg-[#EA1B40] hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                                    >
                                        Go to Account Details
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                }
            case 3:
                // Only show DocumentVerification if request is approved
                if (isApproved(requestStatus)) {
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
                                    {isPending(requestStatus) 
                                        ? "Complete Step 1 First" 
                                        : "API Request Not Approved"}
                                </h3>
                                <p className="text-gray-600">
                                    {isPending(requestStatus)
                                        ? "Your API request is pending approval. Please wait for approval before proceeding."
                                        : "You need to submit and get approval for your API request before accessing this step."}
                                </p>
                                {!isPending(requestStatus) && !isApproved(requestStatus) && (
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="mt-6 bg-[#EA1B40] hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                                    >
                                        Go to Account Details
                                    </button>
                                )}
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
        
        // Only steps 2 and 3 are clickable if request is approved
        if (isApproved(requestStatus)) {
            return true; // All steps clickable if approved
        }
        
        return false; // Other steps not clickable if not approved
    };

    // Function to check if step is accessible
    const isStepAccessible = (stepId) => {
        if (stepId === 1) return true; // Step 1 always accessible
        
        // Steps 2 and 3 only accessible if request is approved
        return isApproved(requestStatus);
    };

    // Format status for display
    const getDisplayStatus = () => {
        if (!requestStatus) return "No Request";
        if (isApproved(requestStatus)) return "Approved";
        if (isPending(requestStatus)) return "Pending";
        return requestStatus;
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
                                    isStepClickable(step.id) ? 'cursor-pointer' : 'cursor-not-allowed'
                                }`}
                                onClick={() => isStepClickable(step.id) && handleStepClick(step.id)}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                                        step.id < currentStep
                                            ? "bg-[#EA1B40] text-white"
                                            : step.id === currentStep
                                            ? isStepAccessible(step.id)
                                                ? "bg-[#EA1B40] text-white ring-4 ring-red-100"
                                                : "bg-gray-300 text-gray-500 ring-4 ring-gray-100"
                                            : isApproved(requestStatus) && step.id > currentStep
                                            ? "bg-gray-200 text-gray-500"
                                            : "bg-gray-100 text-gray-400"
                                    }`}
                                >
                                    {step.id < currentStep ? <Check className="h-5 w-5" /> : step.id}
                                </div>
                                <span
                                    className={`text-sm py-1 font-semibold transition-colors ${
                                        step.id <= currentStep && isStepAccessible(step.id) 
                                            ? "text-gray-900" 
                                            : step.id === currentStep && !isStepAccessible(step.id)
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {step.label}
                                    {step.id === currentStep && !isStepAccessible(step.id) && (
                                        <span className="block text-xs text-gray-400 font-normal">
                                            (Locked)
                                        </span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    {/* Status indicator */}
                    {hasExistingRequest && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    Account: <span className="font-medium">{accountDetails.customerCode}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Request Status: <span className={`font-semibold ${
                                        isApproved(requestStatus) ? 'text-green-600' : 
                                        isPending(requestStatus) ? 'text-yellow-600' : 'text-red-600'
                                    }`}>{getDisplayStatus()}</span>
                                </p>
                            </div>
                        </div>
                    )}
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