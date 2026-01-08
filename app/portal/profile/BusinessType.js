"use client";
import React from 'react';

function BusinessType({ onNext, selectedType, setSelectedType }) {
    return (
        <div className="max-w-[100vw] bg-white p-6 rounded-lg">
            <h2 className="font-medium mb-4 text-lg">
                Please select your Business Type
            </h2>

            {/* Sole Proprietor Option */}
            <div
                onClick={() => setSelectedType("Sole Proprietor")}
                className={`cursor-pointer p-4 rounded-lg mb-4 border-2 transition-all ${selectedType === "Sole Proprietor"
                        ? "bg-red-50 border-[var(--primary-color)]"
                        : "bg-white border-gray-200"
                    }`}
            >
                <div className="flex items-start">
                    <input
                        type="radio"
                        name="businessType"
                        value="Sole Proprietor"
                        checked={selectedType === "Sole Proprietor"}
                        onChange={() => setSelectedType("Sole Proprietor")}
                        className="mr-3 mt-1 accent-[var(--primary-color)]"
                    />
                    <div>
                        <span className="font-bold">Sole Proprietor</span>
                        <p className="text-gray-500 text-xs font-medium mt-1">
                            Registered Company as &apos;Sole Proprietor&apos; under Companies Act 2013.
                        </p>
                    </div>
                </div>
            </div>

            {/* Company Option */}
            <div
                onClick={() => setSelectedType("Company")}
                className={`cursor-pointer p-4 rounded-lg mb-4 border-2 transition-all ${selectedType === "Company"
                        ? "bg-red-50 border-[var(--primary-color)]"
                        : "bg-white border-gray-200"
                    }`}
            >
                <div className="flex items-start">
                    <input
                        type="radio"
                        name="businessType"
                        value="Company"
                        checked={selectedType === "Company"}
                        onChange={() => setSelectedType("Company")}
                        className="mr-3 mt-1 accent-[var(--primary-color)]"
                    />
                    <div>
                        <span className="font-bold">Company</span>
                        <p className="text-gray-500 text-xs font-medium mt-1">
                            Registered company as &apos;LLP&apos;, &apos;Private&apos;, &apos;Subsidiary&apos;, &apos;Holding&apos;, etc.,
                            under Companies Act 2013.
                        </p>
                    </div>
                </div>
            </div>

            {/* Next Button */}
            <div className="text-right">
                <button
                    onClick={onNext}
                    disabled={!selectedType}
                    className={`mt-4 px-8 py-2 font-semibold rounded-md transition-colors ${selectedType
                            ? "bg-[var(--primary-color)] text-white hover:bg-red-600"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default BusinessType;