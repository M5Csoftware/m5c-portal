"use client"
import React, { useContext, useEffect, useState } from "react";
import { Check, Copy, Search, CheckCircle2, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";

const APIRequestForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [activeTab, setActiveTab] = useState("request");
    const [copiedKey, setCopiedKey] = useState("");
    const [selectedAPI, setSelectedAPI] = useState(0);
    const [showAccountCode, setShowAccountCode] = useState(false);
    const { server } = useContext(GlobalContext);
    const { data: session } = useSession();


    // Form state
    const [accountDetails, setAccountDetails] = useState({
        customerCode: "DLO01",
        customerName: "John Doe",
        email: "johndoe@gmail.com",
        phone: "9765432456778",
        apiUseCase: ""
    });

    const [testParams, setTestParams] = useState({
        awbNumber: "1",
        trackingNumber: "100"
    });

    const [searchQuery, setSearchQuery] = useState("");

    const steps = [
        { id: 1, label: "Account Details" },
        { id: 2, label: "Test API" },
        { id: 3, label: "Document Verification" }
    ];

    const apiList = [
        { name: "Track Shipment", method: "Get", endpoint: "/v1/track" },
        { name: "Create Shipment", method: "Post", endpoint: "/v1/shipments" },
        { name: "Cancel Shipment", method: "Delete", endpoint: "/v1/shipments/{id}" },
        { name: "Get Rate", method: "Get", endpoint: "/v1/rates" },
        { name: "Update Shipment", method: "Put", endpoint: "/v1/shipments/{id}" },
        { name: "Get Pickup", method: "Get", endpoint: "/v1/pickups" },
        { name: "Schedule Pickup", method: "Post", endpoint: "/v1/pickups" },
        { name: "Get Invoice", method: "Get", endpoint: "/v1/invoices" },
        { name: "Validate Address", method: "Post", endpoint: "/v1/address/validate" }
    ];

    const filteredApiList = apiList.filter(api =>
        api.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCopy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 2000);
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleStepClick = (stepId) => {
        if (stepId <= currentStep) {
            setCurrentStep(stepId);
        }
    };

    const getMethodColor = (method) => {
        switch (method) {
            case "Get":
                return "bg-green-100 text-green-700";
            case "Post":
                return "bg-blue-100 text-blue-700";
            case "Put":
                return "bg-yellow-100 text-yellow-700";
            case "Delete":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const onSubmit = async () => {
        const branch = session?.user.branch;
        try {
            const res = await axios.post(`${server}/api-request`, { ...accountDetails, branch });

            console.log("Success:", res.data);

            // Optionally show a success message
            alert("API Request Saved Successfully!");

        } catch (error) {
            console.error("Error:", error);

            if (error.response) {
                alert(error.response.data.error || "Something went wrong");
            } else {
                alert("Network error");
            }
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="bg-white rounded-lg p-8 shadow-sm">
                        <h2 className="text-xl font-semibold mb-2">Account Details</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            These details will be linked to your API access.
                        </p>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Customer Account Code
                                </label>
                                <input
                                    type="text"
                                    value={accountDetails.customerCode}
                                    onChange={(e) =>
                                        setAccountDetails({ ...accountDetails, customerCode: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Customer Name</label>
                                <input
                                    type="text"
                                    value={accountDetails.customerName}
                                    onChange={(e) =>
                                        setAccountDetails({ ...accountDetails, customerName: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={accountDetails.email}
                                    onChange={(e) =>
                                        setAccountDetails({ ...accountDetails, email: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={accountDetails.phone}
                                    onChange={(e) =>
                                        setAccountDetails({ ...accountDetails, phone: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">API Use Case</label>
                            <textarea
                                value={accountDetails.apiUseCase}
                                onChange={(e) =>
                                    setAccountDetails({ ...accountDetails, apiUseCase: e.target.value })
                                }
                                placeholder="Describe how you're using our API for logistics (e.g., 'Real-time shipment tracking', 'Inventory management', 'Route optimization'"
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    handleNext();
                                    onSubmit();
                                }}
                                className="bg-[#EA1B40] hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                Submit and Next
                            </button>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="grid grid-cols-12 gap-6">
                        {/* Left Panel - API List */}
                        <div className="col-span-3 bg-white rounded-lg p-4 shadow-sm">
                            <h3 className="font-semibold mb-4">API List</h3>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {filteredApiList.map((api, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedAPI(index)}
                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedAPI === index
                                            ? "bg-red-50 border-l-4 border-red-500"
                                            : "hover:bg-gray-50 border-l-4 border-transparent"
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{api.name}</span>
                                        <span className={`${getMethodColor(api.method)} text-xs px-2 py-1 rounded-xl w-[7vh] text-center font-medium`}>
                                            {api.method}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Panel - API Details */}
                        <div className="col-span-9 bg-white rounded-lg p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-1">{filteredApiList[selectedAPI]?.name} API</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Retrieve the latest status, location, and movement history of a shipment using its tracking number.
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">Test API Key</label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Use this key to test the {filteredApiList[selectedAPI]?.name} API in your development environment.
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value="xxxxxxxxxxxxxxxxxxxx"
                                        readOnly
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                                    />
                                    <button
                                        onClick={() => handleCopy("xxxxxxxxxxxxxxxxxxxx", "apiKey")}
                                        className="bg-[#EA1B40] hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        {copiedKey === "apiKey" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copiedKey === "apiKey" ? "Copied" : "Copy"}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-medium mb-3">Path Parameters</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-2">
                                            AWB Number <span className="text-gray-400 text-xs ml-1">String</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={testParams.awbNumber}
                                            onChange={(e) =>
                                                setTestParams({ ...testParams, awbNumber: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-2">
                                            Tracking Number <span className="text-gray-400 text-xs ml-1">String</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={testParams.trackingNumber}
                                            onChange={(e) =>
                                                setTestParams({ ...testParams, trackingNumber: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Sample Request */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium">Sample Request</h4>
                                        <button
                                            onClick={() => handleCopy(sampleRequest, "request")}
                                            className="text-gray-500 hover:text-gray-700 transition-colors"
                                            title="Copy code"
                                        >
                                            {copiedKey === "request" ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg  h-[72vh] overflow-hidden">
                                        <div className="flex gap-2 px-4 py-2 border-b bg-gray-100">
                                            <button
                                                className={`text-xs px-3 py-1.5 rounded transition-colors ${activeTab === "request"
                                                    ? "bg-[#EA1B40] text-white"
                                                    : "text-gray-600 hover:bg-gray-200"
                                                    }`}
                                                onClick={() => setActiveTab("request")}
                                            >
                                                Node
                                            </button>
                                            <button className="text-xs px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors">
                                                Python
                                            </button>
                                            <button className="text-xs px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors">
                                                PHP
                                            </button>
                                        </div>
                                        <pre className="text-xs text-gray-700 overflow-x-auto p-4 leading-relaxed">
                                            {sampleRequest}
                                        </pre>
                                    </div>
                                </div>

                                {/* Sample Response */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium">Sample Response</h4>
                                        <button
                                            onClick={() => handleCopy(sampleResponse, "response")}
                                            className="text-gray-500 hover:text-gray-700 transition-colors"
                                            title="Copy code"
                                        >
                                            {copiedKey === "response" ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 h-[72vh] rounded-lg p-4">
                                        <pre className="text-xs text-gray-700 overflow-x-auto leading-relaxed">
                                            {sampleResponse}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={handleNext}
                                    className="bg-[#EA1B40] hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                                >
                                    Get your API
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="bg-white rounded-lg p-8 shadow-sm">
                        <h2 className="text-xl font-semibold mb-2">API Test Successful</h2>
                        <p className="text-gray-600 mb-6">
                            These details will be linked to your API access.
                        </p>

                        {/* Account Code Box */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                                Customer Account Code
                            </label>

                            {/* Input + Reveal Button */}
                            <div className="relative mb-3">
                                <input
                                    type={showAccountCode ? "text" : "password"}
                                    value={accountDetails.customerCode}
                                    readOnly
                                    className="w-full px-4 py-3 pr-32 border border-green-400 bg-green-100 text-green-700 rounded-lg font-mono text-sm"
                                />

                                {/* Reveal Button inside right side of input */}
                                <button
                                    onClick={() => setShowAccountCode(!showAccountCode)}
                                    className="absolute inset-y-0 right-4 flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm"
                                >
                                    {showAccountCode ? (
                                        <>
                                            <EyeOff className="h-4 w-4" />
                                            <span>Hide Key</span>
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="h-4 w-4" />
                                            <span>Reveal Key</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={() => handleCopy(accountDetails.customerCode, "accountCode")}
                                className="bg-[#EA1B40] hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                {copiedKey === "accountCode" ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        Copy API Key
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Warning Box */}
                        <div className="bg-red-50 border-l-4 border-red-400 rounded p-4">
                            <h4 className="text-red-800 font-semibold mb-1">Note</h4>
                            <p className="text-sm text-red-700">
                                Keep your API Key confidential. Do not share it publicly.
                                If it is compromised, contact Admin immediately.
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const sampleRequest = `const axios = require('axios');

async function trackShipment() {
  const trackingNumber = "${testParams.trackingNumber}";
  const awbNumber = "${testParams.awbNumber}";
  const apiKey = "xxxxxxxxxxxxxxxxxxxx";
  
  try {
    const response = await axios.get(
      \`https://api.logistics.com/v1/track/\${awbNumber}\`,
      {
        headers: {
          'Authorization': \`Bearer \${apiKey}\`,
          'Content-Type': 'application/json'
        },
        params: { trackingNumber }
      }
    );
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}`;

    const sampleResponse = `{
  "success": true,
  "data": {
    "trackingNumber": "ABC123456",
    "awbNumber": "${testParams.awbNumber}",
    "status": "In Transit",
    "currentLocation": "Mumbai, MH",
    "estimatedDelivery": "2025-01-25",
    "history": [
      {
        "timestamp": "2025-01-20T10:30:00Z",
        "location": "Delhi Hub",
        "status": "Dispatched"
      }
    ]
  }
}`;

    return (
        <div className="bg-gray-50 p-8">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-4">API</h1>
                    <div className="flex gap-8 border-b">
                        <button className="pb-2 border-b-4 rounded-sm  border-[#EA1B40]  text-[#EA1B40] font-semibold">
                            Request API Key
                        </button>
                    </div>
                </div>

                {/* Step Navigation */}
                <div className="bg-white rounded-lg p-8 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mx-auto relative">
                        {/* Progress Line */}
                        <div className="absolute left-20 right-24 border-t-2 border-dashed border-gray-500 transform -translate-y-1/2 mb-6" />                        <div
                            className="absolute left-[4.4%] top-5 h-0.5 bg-[#EA1B40] transition-all duration-500 z-10"
                            style={{ width: `${(currentStep - 1) * 45}%` }}
                        />

                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className="flex flex-col items-center cursor-pointer z-30"
                                onClick={() => handleStepClick(step.id)}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${step.id < currentStep
                                        ? "bg-[#EA1B40] text-white"
                                        : step.id === currentStep
                                            ? "bg-[#EA1B40] text-white ring-4 ring-red-100"
                                            : "bg-gray-200 text-gray-500"
                                        }`}
                                >
                                    {step.id < currentStep ? <Check className="h-5 w-5" /> : step.id}
                                </div>
                                <span className={`text-sm py-1 font-semibold transition-colors ${step.id <= currentStep ? "text-gray-900" : "text-gray-500"
                                    }`}>
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