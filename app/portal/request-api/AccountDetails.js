"use client";
import React, { useState } from "react";
import axios from "axios";

const AccountDetails = ({
  accountDetails,
  setAccountDetails,
  handleNext,
  server,
  session,
  onRequestSubmitted // Add this prop
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const apiList = [
    { name: "Track Shipment", method: "Get", endpoint: "/v1/track" },
    { name: "Create Shipment", method: "Post", endpoint: "/v1/shipments" },
    {
      name: "Cancel Shipment",
      method: "Delete",
      endpoint: "/v1/shipments/{id}",
    },
    { name: "Get Rate", method: "Get", endpoint: "/v1/rates" },
    { name: "Update Shipment", method: "Put", endpoint: "/v1/shipments/{id}" },
    { name: "Create Manifest", method: "Post", endpoint: "/v1/manifest/create" },
    { name: "Dispatch Manifest", method: "Put", endpoint: "/v1/manifest/dispatch" },
    { name: "Get Invoice", method: "Get", endpoint: "/v1/invoices" }
  ];

  // Fetch customer details when account code changes
  const fetchCustomerDetails = async (accountCode) => {
    if (!accountCode || accountCode.trim() === "") {
      return;
    }

    setIsLoading(true);
    setFetchError("");

    try {
      const response = await axios.get(
        `${server}/api-request/customer-details?accountCode=${accountCode}`,
      );

      if (response.data.success) {
        setAccountDetails({
          ...accountDetails,
          customerCode: response.data.data.accountCode,
          customerName: response.data.data.customerName,
          email: response.data.data.email,
          phone: response.data.data.phone || "",
        });
        setFetchError("");
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      if (error.response?.status === 404) {
        setFetchError("Customer not found with this account code");
      } else {
        setFetchError("Failed to fetch customer details");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account code change with debounce
  const handleAccountCodeChange = (e) => {
    const value = e.target.value;
    setAccountDetails({ ...accountDetails, customerCode: value });

    // Fetch details when user stops typing (after 500ms)
    if (window.accountCodeTimeout) {
      clearTimeout(window.accountCodeTimeout);
    }

    window.accountCodeTimeout = setTimeout(() => {
      fetchCustomerDetails(value);
    }, 500);
  };

  const onSubmit = async () => {
    const branch = session?.user.branch;
    try {
      setIsLoading(true);
      const res = await axios.post(`${server}/api-request`, {
        ...accountDetails,
        branch,
      });
      console.log("Success:", res.data);
      setShowSuccessModal(true);
      onRequestSubmitted && onRequestSubmitted();
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        alert(error.response.data.error || "Something went wrong");
      } else {
        alert("Network error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
              onChange={handleAccountCodeChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter account code"
            />
            {isLoading && (
              <p className="text-xs text-blue-600 mt-1">
                Fetching customer details...
              </p>
            )}
            {fetchError && (
              <p className="text-xs text-red-600 mt-1">{fetchError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Customer Name
            </label>
            <input
              type="text"
              value={accountDetails.customerName}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={accountDetails.email}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={accountDetails.phone}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">API Use Case</label>
          <p className="text-xs text-gray-500 mb-4">
            Select one or more API services you want to use for your logistics
            operations.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {apiList.map((api, index) => {
              const isSelected = Array.isArray(accountDetails.apiUseCase)
                ? accountDetails.apiUseCase.includes(api.name)
                : accountDetails.apiUseCase === api.name;

              return (
                <label
                  key={index}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#EA1B40] bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="apiUseCase"
                    value={api.name}
                    checked={isSelected}
                    onChange={(e) => {
                      const currentUseCases = Array.isArray(
                        accountDetails.apiUseCase,
                      )
                        ? accountDetails.apiUseCase
                        : accountDetails.apiUseCase
                          ? [accountDetails.apiUseCase]
                          : [];

                      let updatedUseCases;
                      if (e.target.checked) {
                        updatedUseCases = [...currentUseCases, api.name];
                      } else {
                        updatedUseCases = currentUseCases.filter(
                          (useCase) => useCase !== api.name,
                        );
                      }

                      setAccountDetails({
                        ...accountDetails,
                        apiUseCase: updatedUseCases,
                      });
                    }}
                    className="w-4 h-4 text-[#EA1B40] focus:ring-[#EA1B40] focus:ring-2 rounded"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">
                      {api.name}
                    </span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      {api.method} • {api.endpoint}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="bg-[#EA1B40] hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="relative transform overflow-hidden rounded-2xl bg-white px-8 pb-8 pt-10 text-left shadow-xl transition-all w-full max-w-md">
              <div className="flex flex-col items-center">
                <div className="mx-auto flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div className="mt-6 text-center">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-2">
                    Application Submitted Successfully!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your API request is now under review. Our team will verify your details and approve your application.
                  </p>
                  <p className="text-sm text-gray-600 mb-6">
                    Once approved, we'll send your API key and access details to:
                    <br />
                    <span className="font-medium text-gray-900">{accountDetails.email}</span>
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-yellow-800">Status: Pending Approval</h4>
                        <p className="text-xs text-yellow-700 mt-1">
                          You cannot proceed to Test API until your request is approved.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    window.location.reload(); // Reload to reset the form
                  }}
                  className="mt-2 inline-flex w-full justify-center rounded-lg bg-[#EA1B40] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountDetails;