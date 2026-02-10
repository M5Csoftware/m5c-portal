"use client";
import React, { useState } from "react";
import { Copy, CheckCircle2, Eye, EyeOff } from "lucide-react";

const DocumentVerification = ({ accountDetails }) => {
    const [copiedKey, setCopiedKey] = useState("");
    const [showAccountCode, setShowAccountCode] = useState(false);

    const handleCopy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 2000);
    };

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
};

export default DocumentVerification;