"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const AccountDetails = ({
  accountDetails,
  setAccountDetails,
  handleNext,
  server,
  session,
  onRequestSubmitted
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDetails, setShowDetails] = useState(true); // State to toggle details view

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

  // Fetch customer details using account code from session
  useEffect(() => {
    const fetchCustomerDetailsFromSession = async () => {
      const accountCode = session?.user?.accountCode; // Adjust this path based on your session structure
      
      if (!accountCode) {
        setFetchError("No account code found in session");
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

    fetchCustomerDetailsFromSession();
  }, [session]);

  const onSubmit = async () => {
    const branch = session?.user?.branch;
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

        {/* Customer Information Section - Styled like the reference image */}
        {accountDetails.customerName && (
          <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
            {/* Header with toggle similar to Application/Storage in the image */}
            <div 
              className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
              onClick={() => setShowDetails(!showDetails)}
            >
              <div className="flex items-center space-x-2">
                <svg 
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${showDetails ? 'rotate-90' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-medium text-gray-700">Customer Information</span>
              </div>
              <span className="text-xs text-gray-500">{accountDetails.customerCode}</span>
            </div>

            {/* Details section - collapsible like Storage section in the image */}
            {showDetails && (
              <div className="divide-y divide-gray-100">
                <div className="px-4 py-2 flex items-center hover:bg-gray-50">
                  <span className="text-sm text-gray-500 w-24">Name</span>
                  <span className="text-sm text-gray-900 font-medium">{accountDetails.customerName}</span>
                </div>
                <div className="px-4 py-2 flex items-center hover:bg-gray-50">
                  <span className="text-sm text-gray-500 w-24">Email</span>
                  <span className="text-sm text-gray-900">{accountDetails.email}</span>
                </div>
                <div className="px-4 py-2 flex items-center hover:bg-gray-50">
                  <span className="text-sm text-gray-500 w-24">Phone</span>
                  <span className="text-sm text-gray-900">{accountDetails.phone || 'Not provided'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm text-blue-600">Loading your account details...</p>
            </div>
          </div>
        )}

        {fetchError && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{fetchError}</p>
            </div>
          </div>
        )}

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
            disabled={isLoading || !accountDetails.customerCode || fetchError}
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
                    Once approved, we will send your API key and access details to:
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
                    window.location.reload();
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