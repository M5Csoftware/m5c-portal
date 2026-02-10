"use client";
import React, { useState, useEffect } from "react";
import { Copy, Search, CheckCircle2, AlertCircle } from "lucide-react";

const TestAPI = ({ handleNext, server, session }) => {
    const [activeTab, setActiveTab] = useState("nodejs");
    const [copiedKey, setCopiedKey] = useState("");
    const [selectedAPI, setSelectedAPI] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [approvalStatus, setApprovalStatus] = useState("");

    const apiList = [
        { name: "Track Shipment", method: "Get", endpoint: "/v1/track" },
        { name: "Create Shipment", method: "Post", endpoint: "/v1/shipments" },
        { name: "Cancel Shipment", method: "Delete", endpoint: "/v1/shipments/{id}" },
        { name: "Get Rate", method: "Get", endpoint: "/v1/rates" },
        { name: "Update Shipment", method: "Put", endpoint: "/v1/shipments/{id}" },
        { name: "Create Manifest", method: "Post", endpoint: "/v1/manifest/create" },
        { name: "Dispatch Manifest", method: "Put", endpoint: "/v1/manifest/dispatch" },
        { name: "Get Invoice", method: "Get", endpoint: "/v1/invoices" }
    ];

    // API Request Bodies
    const getRequestBody = (apiName) => {
        const bodies = {
            "Track Shipment": null, // GET request, no body
            "Create Shipment": {
                destination: "Delhi",
                payment: "Credit",
                pcs: 2,
                totalActualWt: 5.5,
                chargeableWt: 6.0,
                basicAmt: 500,
                cgst: 45,
                sgst: 45,
                grandTotal: 590,
                service: "Express",
                receiverFullName: "John Doe",
                receiverPhoneNumber: "+91 9876543210",
                receiverCity: "Delhi",
                receiverPincode: "110001",
                shipperFullName: "Jane Smith",
                shipperCity: "Mumbai"
            },
            "Cancel Shipment": null, // DELETE request, no body
            "Get Rate": null, // GET request, no body
            "Update Shipment": {
                destination: "Bangalore",
                grandTotal: 650,
                operationRemark: "Destination changed"
            },
            "Create Manifest": {
                awbNumbers: [
                    "PORTAL17703727241301",
                    "PORTAL17703727241302",
                    "PORTAL17703727241303"
                ]
            },
            "Dispatch Manifest": {
                manifestNumber: "CUST001-01"
            },
            "Get Invoice": null // GET request, no body
        };
        return bodies[apiName];
    };

    // API Response Bodies
    const getResponseBody = (apiName) => {
        const responses = {
            "Track Shipment": {
                success: true,
                data: {
                    awbNo: "PORTAL17703727241301",
                    status: "In Transit",
                    destination: "Delhi",
                    currentLocation: "Mumbai Hub",
                    estimatedDelivery: "2025-02-12"
                },
                meta: {
                    apiVersion: "v1",
                    endpoint: "/v1/track",
                    timestamp: new Date().toISOString()
                }
            },
            "Create Shipment": {
                success: true,
                data: {
                    awbNo: "PORTAL17703727241301",
                    status: "Booked",
                    destination: "Delhi",
                    pcs: 2,
                    totalWeight: 5.5,
                    grandTotal: 590,
                    createdAt: new Date().toISOString()
                },
                meta: {
                    apiVersion: "v1",
                    endpoint: "/v1/shipments",
                    timestamp: new Date().toISOString()
                }
            },
            "Cancel Shipment": {
                success: true,
                data: {
                    message: "Shipment cancelled successfully",
                    awbNo: "PORTAL17703727241301",
                    status: "Cancelled"
                },
                meta: {
                    apiVersion: "v1",
                    endpoint: "/v1/shipments/{id}",
                    timestamp: new Date().toISOString()
                }
            },
            "Get Rate": {
                success: true,
                data: {
                    sector: "DEL",
                    destination: "Mumbai",
                    service: "Express",
                    weight: 5.5,
                    baseRate: 500,
                    cgst: 45,
                    sgst: 45,
                    totalAmount: 590
                },
                meta: {
                    apiVersion: "v1",
                    endpoint: "/v1/rates",
                    timestamp: new Date().toISOString()
                }
            },
            "Update Shipment": {
                success: true,
                data: {
                    message: "Shipment updated successfully",
                    awbNo: "PORTAL17703727241301",
                    destination: "Bangalore",
                    grandTotal: 650
                },
                meta: {
                    apiVersion: "v1",
                    endpoint: "/v1/shipments/{id}",
                    timestamp: new Date().toISOString()
                }
            },
            "Create Manifest": {
                success: true,
                data: {
                    manifestNumber: "CUST001-01",
                    awbCount: 3,
                    totalPieces: 10,
                    totalWeight: 25.5,
                    status: "pending",
                    createdAt: new Date().toISOString()
                },
                meta: {
                    apiVersion: "v1",
                    endpoint: "/v1/manifest/create",
                    timestamp: new Date().toISOString()
                }
            },
            "Dispatch Manifest": {
                success: true,
                data: {
                    manifestNumber: "CUST001-01",
                    status: "dispatched",
                    dispatchedAt: new Date().toISOString(),
                    awbCount: 3,
                    totalPieces: 10,
                    totalWeight: 25.5,
                    documents: {
                        manifestPdf: "base64_encoded_pdf_string...",
                        shippingLabels: "base64_encoded_labels_pdf_string..."
                    }
                },
                meta: {
                    apiVersion: "v1",
                    endpoint: "/v1/manifest/dispatch",
                    timestamp: new Date().toISOString()
                }
            },
            "Get Invoice": {
                success: true,
                data: {
                    invoiceNumber: "INV-2024-001",
                    invoiceDate: "2024-01-15",
                    totalAmount: 5900,
                    shipments: 10,
                    status: "Paid"
                },
                meta: {
                    apiVersion: "v1",
                    endpoint: "/v1/invoices",
                    timestamp: new Date().toISOString()
                }
            }
        };
        return responses[apiName];
    };

    // Get query parameters for GET requests
    const getQueryParams = (apiName) => {
        const params = {
            "Track Shipment": "?awb=PORTAL17703727241301",
            "Get Rate": "?sector=DEL&destination=Mumbai&service=Express&weight=5.5",
            "Get Invoice": "?invoiceNumber=INV-2024-001",
            "Cancel Shipment": "?awb=PORTAL17703727241301",
            "Update Shipment": "?awb=PORTAL17703727241301"
        };
        return params[apiName] || "";
    };

    // Fetch user's API key from ApiKey collection
    useEffect(() => {
        const fetchApiKey = async () => {
            try {
                setLoading(true);
                setError("");
                
                const requestResponse = await fetch(`${server}/api-request?email=${session.user.email}`);
                
                if (!requestResponse.ok) {
                    throw new Error("Failed to fetch API request");
                }
                
                const requestData = await requestResponse.json();
                
                if (Array.isArray(requestData) && requestData.length > 0) {
                    const userRequest = requestData[0];
                    const status = userRequest.Status || userRequest.status || "";
                    
                    setApprovalStatus(status);
                    
                    if (status.toLowerCase() !== "approved") {
                        setError(`Your API request is ${status}. Please wait for approval.`);
                        setLoading(false);
                        return;
                    }
                    
                    const maskedKey = userRequest.apiKey;
                    
                    if (maskedKey) {
                        if (maskedKey.includes("*")) {
                            setApiKey(maskedKey);
                            setError("Your API key was sent to your email. Please check your inbox for the full key.");
                        } else {
                            setApiKey(maskedKey);
                        }
                    } else {
                        setError("No API key found. Please contact support.");
                    }
                } else {
                    setError("No API request found. Please submit a request first.");
                }
            } catch (error) {
                console.error("Error fetching API key:", error);
                setError("Failed to load API key. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.email) {
            fetchApiKey();
        }
    }, [session, server]);

    const filteredApiList = apiList.filter(api =>
        api.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCopy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 2000);
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

    const selectedApiDetails = filteredApiList[selectedAPI] || apiList[0];
    const requestBody = getRequestBody(selectedApiDetails.name);
    const responseBody = getResponseBody(selectedApiDetails.name);
    const queryParams = getQueryParams(selectedApiDetails.name);

    // Generate code samples for different languages
    const generateNodeJsCode = () => {
        const hasBody = requestBody !== null;
        const method = selectedApiDetails.method.toLowerCase();
        const endpoint = selectedApiDetails.endpoint + queryParams;
        
        return `const axios = require('axios');

async function ${selectedApiDetails.name.replace(/\s+/g, '')}() {
  const apiKey = "${apiKey || 'YOUR_API_KEY_HERE'}";
  const baseUrl = "${server}/api";
  
  try {
    const response = await axios.${method}(
      \`\${baseUrl}${endpoint}\`${hasBody ? `,
      ${JSON.stringify(requestBody, null, 2)}` : ''},
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

${selectedApiDetails.name.replace(/\s+/g, '')}();`;
    };

    const generatePythonCode = () => {
        const hasBody = requestBody !== null;
        const method = selectedApiDetails.method.toLowerCase();
        const endpoint = selectedApiDetails.endpoint + queryParams;
        
        return `import requests
import json

def ${selectedApiDetails.name.toLowerCase().replace(/\s+/g, '_')}():
    api_key = "${apiKey || 'YOUR_API_KEY_HERE'}"
    base_url = "${server}/api"
    
    headers = {
        'X-API-Key': api_key,
        'Content-Type': 'application/json'
    }
    
    ${hasBody ? `data = ${JSON.stringify(requestBody, null, 4).replace(/"/g, "'")}
    ` : ''}
    try:
        response = requests.${method}(
            f"{base_url}${endpoint}",
            headers=headers${hasBody ? ',\n            json=data' : ''}
        )
        response.raise_for_status()
        print(json.dumps(response.json(), indent=2))
    except requests.exceptions.RequestException as error:
        print(f"Error: {error}")

${selectedApiDetails.name.toLowerCase().replace(/\s+/g, '_')}()`;
    };

    const generateCurlCode = () => {
        const hasBody = requestBody !== null;
        const method = selectedApiDetails.method.toUpperCase();
        const endpoint = selectedApiDetails.endpoint + queryParams;
        
        return `curl -X ${method} "${server}/api${endpoint}" \\
  -H "X-API-Key: ${apiKey || 'YOUR_API_KEY_HERE'}" \\
  -H "Content-Type: application/json"${hasBody ? ` \\
  -d '${JSON.stringify(requestBody, null, 2)}'` : ''}`;
    };

    const generatePhpCode = () => {
        const hasBody = requestBody !== null;
        const method = selectedApiDetails.method.toUpperCase();
        const endpoint = selectedApiDetails.endpoint + queryParams;
        
        return `<?php

function ${selectedApiDetails.name.replace(/\s+/g, '')}() {
    $apiKey = "${apiKey || 'YOUR_API_KEY_HERE'}";
    $baseUrl = "${server}/api";
    $endpoint = "${endpoint}";
    
    $headers = array(
        'X-API-Key: ' . $apiKey,
        'Content-Type: application/json'
    );
    
    ${hasBody ? `$data = json_encode(${JSON.stringify(requestBody, null, 4)});
    ` : ''}
    $ch = curl_init($baseUrl . $endpoint);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    ${hasBody ? 'curl_setopt($ch, CURLOPT_POSTFIELDS, $data);' : ''}
    
    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        echo 'Error: ' . curl_error($ch);
    } else {
        echo $response;
    }
    
    curl_close($ch);
}

${selectedApiDetails.name.replace(/\s+/g, '')}();
?>`;
    };

    const generateJavaCode = () => {
        const hasBody = requestBody !== null;
        const method = selectedApiDetails.method.toUpperCase();
        const endpoint = selectedApiDetails.endpoint + queryParams;
        
        return `import java.net.http.*;
import java.net.URI;
import java.io.IOException;

public class ${selectedApiDetails.name.replace(/\s+/g, '')} {
    public static void main(String[] args) throws IOException, InterruptedException {
        String apiKey = "${apiKey || 'YOUR_API_KEY_HERE'}";
        String baseUrl = "${server}/api";
        String endpoint = "${endpoint}";
        
        ${hasBody ? `String requestBody = """
            ${JSON.stringify(requestBody, null, 12)}
        """;
        ` : ''}
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + endpoint))
            .header("X-API-Key", apiKey)
            .header("Content-Type", "application/json")
            .${method}(${hasBody ? 'HttpRequest.BodyPublishers.ofString(requestBody)' : 'HttpRequest.BodyPublishers.noBody()'})
            .build();
        
        HttpResponse<String> response = client.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        System.out.println("Status: " + response.statusCode());
        System.out.println("Response: " + response.body());
    }
}`;
    };

    const getCodeSample = () => {
        switch (activeTab) {
            case "nodejs":
                return generateNodeJsCode();
            case "python":
                return generatePythonCode();
            case "curl":
                return generateCurlCode();
            case "php":
                return generatePhpCode();
            case "java":
                return generateJavaCode();
            default:
                return generateNodeJsCode();
        }
    };

    const sampleRequest = getCodeSample();
    const sampleResponse = JSON.stringify(responseBody, null, 2);

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
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedAPI === index
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
                <h3 className="text-lg font-semibold mb-1">{selectedApiDetails.name} API</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Use this endpoint to {selectedApiDetails.name.toLowerCase()} in your logistics operations.
                </p>

                {/* API Key Section */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Your API Key</label>
                    <p className="text-xs text-gray-500 mb-2">
                        Use this key to authenticate your API requests. Keep it secure and never share it publicly.
                    </p>
                    
                    {/* Status Messages */}
                    {loading ? (
                        <div className="flex items-center gap-2 mb-3 text-blue-600">
                            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            <span className="text-sm">Loading API key...</span>
                        </div>
                    ) : error ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">API Key Notice</p>
                                    <p className="text-xs text-yellow-700 mt-1">{error}</p>
                                    {approvalStatus && approvalStatus.toLowerCase() !== "approved" && (
                                        <div className="mt-3 p-3 bg-white rounded border border-yellow-300">
                                            <p className="text-xs font-semibold text-gray-700">Current Status: <span className="text-yellow-700">{approvalStatus}</span></p>
                                            <p className="text-xs text-gray-600 mt-1">You'll receive an email with your API key once your request is approved.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : apiKey.includes("*") ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-800">API Key Sent to Email</p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Your full API key was sent to <strong>{session?.user?.email}</strong>
                                    </p>
                                    <p className="text-xs text-blue-700 mt-2">
                                        For security reasons, we only show the masked version here. Please check your email for the complete key.
                                    </p>
                                    <div className="mt-3 p-2 bg-white rounded border border-blue-300 font-mono text-xs">
                                        {apiKey}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                    
                    {/* API Key Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={loading ? "Loading..." : apiKey || "No API key found"}
                            readOnly
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                        />
                        <button
                            onClick={() => handleCopy(apiKey, "apiKey")}
                            disabled={!apiKey || loading || apiKey.includes("*")}
                            className="bg-[#EA1B40] hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={apiKey.includes("*") ? "Full key sent to email" : "Copy API key"}
                        >
                            {copiedKey === "apiKey" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copiedKey === "apiKey" ? "Copied" : "Copy"}
                        </button>
                    </div>
                    
                    {/* Instructions for using the key */}
                    {apiKey && !apiKey.includes("*") && (
                        <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                            <strong>💡 How to use:</strong> Include this key in the <code className="bg-gray-200 px-1 rounded">X-API-Key</code> header of all your API requests.
                        </div>
                    )}
                </div>

                {/* Sample Request and Response */}
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
                        <div className="bg-gray-50 border border-gray-200 rounded-lg h-[72vh] overflow-hidden">
                            <div className="flex gap-2 px-4 py-2 border-b bg-gray-100 overflow-x-auto">
                                <button
                                    className={`text-xs px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                                        activeTab === "nodejs"
                                            ? "bg-[#EA1B40] text-white"
                                            : "text-gray-600 hover:bg-gray-200"
                                    }`}
                                    onClick={() => setActiveTab("nodejs")}
                                >
                                    Node.js
                                </button>
                                <button
                                    className={`text-xs px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                                        activeTab === "python"
                                            ? "bg-[#EA1B40] text-white"
                                            : "text-gray-600 hover:bg-gray-200"
                                    }`}
                                    onClick={() => setActiveTab("python")}
                                >
                                    Python
                                </button>
                                <button
                                    className={`text-xs px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                                        activeTab === "curl"
                                            ? "bg-[#EA1B40] text-white"
                                            : "text-gray-600 hover:bg-gray-200"
                                    }`}
                                    onClick={() => setActiveTab("curl")}
                                >
                                    cURL
                                </button>
                                <button
                                    className={`text-xs px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                                        activeTab === "php"
                                            ? "bg-[#EA1B40] text-white"
                                            : "text-gray-600 hover:bg-gray-200"
                                    }`}
                                    onClick={() => setActiveTab("php")}
                                >
                                    PHP
                                </button>
                                <button
                                    className={`text-xs px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                                        activeTab === "java"
                                            ? "bg-[#EA1B40] text-white"
                                            : "text-gray-600 hover:bg-gray-200"
                                    }`}
                                    onClick={() => setActiveTab("java")}
                                >
                                    Java
                                </button>
                            </div>
                            <pre className="text-xs text-gray-700 overflow-auto p-4 leading-relaxed h-[calc(100%-40px)]">
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
                        <div className="bg-gray-50 border border-gray-200 h-[72vh] rounded-lg p-4 overflow-auto">
                            <pre className="text-xs text-gray-700 leading-relaxed">
                                {sampleResponse}
                            </pre>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-600">
                        {apiKey && !apiKey.includes("*") ? (
                            <span className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Ready to test your API
                            </span>
                        ) : (
                            <span className="text-yellow-600">
                                Check your email for the API key to get started
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleNext}
                        className="bg-[#EA1B40] hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestAPI;