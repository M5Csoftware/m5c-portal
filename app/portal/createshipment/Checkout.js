import React, { useEffect, useState, useContext } from "react";
import Image from "next/image";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";

function Checkout({
  step,
  onPrev,
  selectedServiceLocal,
  filteredServicesWithRates,
  destination,
  destinationFlag,
  isEditMode,
  watch,
  creditLimitError,
  isShipmentOnHold,
}) {
  const [summary, setSummary] = useState({
    service: "",
    zone: "",
    rate: 0,
    shipper: "",
    type: "",
    basicAmt: 0,
    grandTotal: 0,
    cgstAmt: 0,
    sgstAmt: 0,
  });

  const [currentBalance, setCurrentBalance] = useState(0);
  const [currentCredit, setCurrentCredit] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceVersion, setBalanceVersion] = useState(0);
  const [hasOutstanding, setHasOutstanding] = useState(false);
  const [outstandingAmount, setOutstandingAmount] = useState(0);

  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();

  // Watch form values for display
  const chargeableWt = watch("chargeableWt") || 0;
  const totalPcs = watch("boxes")?.length || 0;

  const cgstPercent = 9;
  const sgstPercent = 9;

  // Fetch current balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!session?.user?.accountCode) return;

      setLoadingBalance(true);
      try {
        const response = await axios.get(
          `${server}/portal/update-balance?accountCode=${session?.user?.accountCode}`
        );

        if (response.data.success) {
          setCurrentBalance(Number(response.data.data.leftOverBalance) || 0);
          setCurrentCredit(Number(response.data.data.creditLimit) || 0);
          setHasOutstanding(response.data.data.hasOutstanding || false);
          setOutstandingAmount(Number(response.data.data.outstandingAmount) || 0);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [session?.user?.accountCode, server, balanceVersion]);

  // Expose refresh method to parent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.refreshBalance = () => {
        setBalanceVersion(prev => prev + 1);
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.refreshBalance;
      }
    };
  }, []);

  useEffect(() => {
    if (
      !selectedServiceLocal ||
      !filteredServicesWithRates ||
      filteredServicesWithRates.length === 0
    ) {
      return;
    }

    const matchingObject = filteredServicesWithRates.find(
      (item) => item.service === selectedServiceLocal
    );

    if (matchingObject) {
      setSummary({
        service: matchingObject.service || "",
        zone: matchingObject.zone || "",
        rate: Number(matchingObject.rate) || 0,
        shipper: matchingObject.shipper || "",
        type: matchingObject.type || "",
        basicAmt: Number(matchingObject.basicAmt) || 0,
        grandTotal: Number(matchingObject.grandTotal) || 0,
        cgstAmt: Number(matchingObject.cgstAmt) || 0,
        sgstAmt: Number(matchingObject.sgstAmt) || 0,
        network: matchingObject.network || "",
        isCanadaShipment: matchingObject.isCanadaShipment || false,
        isAustraliaShipment: matchingObject.isAustraliaShipment || false,
      });
    } else {
      setSummary({
        service: "",
        zone: "",
        rate: 0,
        shipper: "",
        type: "",
        basicAmt: 0,
        grandTotal: 0,
        cgstAmt: 0,
        sgstAmt: 0,
      });
    }
  }, [selectedServiceLocal, filteredServicesWithRates]);

  // Calculate remaining balance after shipment (negative = has money, positive = debt)
  // Adding shipmentAmount moves balance toward positive (less money)
  const remainingBalance = currentBalance + summary.grandTotal;
  const hasInsufficientBalance = remainingBalance > 0 && (remainingBalance - currentCredit) > 0;
  const isLowBalance = currentBalance < 0 && remainingBalance > currentBalance && remainingBalance <= 0;
  const willUseCredit = remainingBalance > 0 && (remainingBalance - currentCredit) <= 0;

  return (
    <div className="bg-white rounded-3xl p-10 flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <div className="relative w-9 h-9">
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${step <= 6 ? "opacity-100" : "opacity-0"
              }`}
            src="/create-shipment/6.svg"
            alt="step 6"
            width={36}
            height={36}
          />
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${step > 6 ? "opacity-100" : "opacity-0"
              }`}
            src="/create-shipment/done-red.svg"
            alt="step 6 completed"
            width={36}
            height={36}
          />
        </div>
        <h2 className="text-base px-2 font-bold">Checkout</h2>
      </div>

      <div
        className={`flex flex-col gap-5 overflow-hidden transition-max-height duration-500 ease-in-out ${step === 6 ? "max-h-[2000px]" : "max-h-0"
          }`}
      >
        <div className="text-xs bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-200 w-full mx-auto">
          {/* Header */}
          <div className="flex justify-start">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Order Summary</h2>
              <p className="text-gray-500 text-sm mt-2">
                Review your shipment details
              </p>
            </div>
          </div>

          {/* Shipment On Hold Warning */}
          {isShipmentOnHold && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-yellow-800">Shipment on Hold</p>
                  <p className="text-yellow-700 text-xs mt-1">
                    This shipment has been placed on hold due to insufficient credit.
                    Please recharge your account to release the shipment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Credit Limit Error */}
          {creditLimitError && !isShipmentOnHold && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-red-800">Credit Limit Exceeded</p>
                  <p className="text-red-700 text-xs mt-1">
                    {creditLimitError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Balance Display */}
          <div className={`bg-gradient-to-r rounded-xl p-4 mb-6 ${hasOutstanding
            ? 'from-red-50 to-orange-50 border border-red-200'
            : 'from-blue-50 to-indigo-50 border border-blue-200'
            }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {hasOutstanding ? 'Outstanding Balance' : 'Available Balance'}
                </p>
                <p className={`text-lg font-bold ${hasOutstanding ? 'text-red-600' : currentBalance < 0 ? 'text-blue-600' : 'text-red-600'
                  }`}>
                  {loadingBalance
                    ? "Loading..."
                    : hasOutstanding
                      ? `-₹${outstandingAmount.toFixed(2)}`
                      : currentBalance < 0
                        ? `₹${Math.abs(currentBalance).toFixed(2)}`
                        : currentBalance === 0
                          ? '₹0.00'
                          : `In Debt: ₹${currentBalance.toFixed(2)}`}
                </p>
                {currentCredit > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Available Credit: ₹{currentCredit.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Balance After Shipment
                </p>
                <p
                  className={`text-lg font-bold ${isShipmentOnHold
                    ? "text-yellow-600"
                    : hasInsufficientBalance
                      ? "text-red-600"
                      : "text-green-600"
                    }`}
                >
                  {isShipmentOnHold
                    ? "On Hold"
                    : remainingBalance < 0
                      ? `₹${Math.abs(remainingBalance).toFixed(2)}`
                      : remainingBalance === 0
                        ? '₹0.00'
                        : `-₹${remainingBalance.toFixed(2)}`}
                </p>
              </div>
            </div>

            {/* Low Balance Warning */}
            {isLowBalance && !isShipmentOnHold && !hasInsufficientBalance && (
              <div className="mt-3 p-2 bg-yellow-100 rounded text-yellow-700 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                ⚠️ Your balance is getting low after this shipment.
              </div>
            )}

            {/* Will Use Credit */}
            {willUseCredit && !isShipmentOnHold && !hasInsufficientBalance && (
              <div className="mt-3 p-2 bg-purple-100 rounded text-purple-700 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                💳 Credit will be used for this transaction.
              </div>
            )}

            {/* Insufficient Balance */}
            {hasInsufficientBalance && !isShipmentOnHold && (
              <div className="mt-3 p-2 bg-red-100 rounded text-red-700 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                ⚠️ Insufficient balance/credit. Your shipment will be placed on hold.
              </div>
            )}
          </div>

          {/* Outstanding Balance Warning */}
          {hasOutstanding && !isShipmentOnHold && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-orange-800">Outstanding Balance</p>
                  <p className="text-orange-700 text-xs mt-1">
                    You have an outstanding balance of ₹{outstandingAmount.toFixed(2)}.
                    This amount will be adjusted first from your payment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rewards Section */}
          <div className="bg-red-100 rounded-xl p-4 mb-6 border border-[var(--primary-color)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image src="/m5c.svg" width={35} height={35} alt="Coins" />
                <div>
                  <p className="font-semibold text-gray-900">0 M5Coins</p>
                  <p className="text-xs text-gray-500">
                    Apply coins for discount
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="bg-white text-[var(--primary-color)] font-semibold py-2 px-4 rounded-lg border border-[var(--primary-color)] hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Basic Amount</span>
              <span className="font-semibold">
                ₹{summary.basicAmt.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <span className="text-gray-600">CGST </span>
                <span className="text-xs text-gray-400">({cgstPercent}%)</span>
              </div>
              <span className="font-semibold">
                ₹{summary.cgstAmt.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <span className="text-gray-600">SGST </span>
                <span className="text-xs text-gray-400">({sgstPercent}%)</span>
              </div>
              <span className="font-semibold">
                ₹{summary.sgstAmt.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total GST</span>
              <span className="font-semibold text-gray-700">
                ₹{(summary.cgstAmt + summary.sgstAmt).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Coin Discount</span>
              <span className="text-green-600 font-semibold">- ₹0.00</span>
            </div>
          </div>

          {/* Total */}
          <div className={`bg-gradient-to-r rounded-xl p-4 mb-6 ${isShipmentOnHold
            ? 'from-yellow-600 to-yellow-500'
            : 'from-[var(--primary-color)] to-red-600'
            }`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-white font-semibold text-lg">
                  {isShipmentOnHold ? 'Total Amount (On Hold)' : 'Total Amount'}
                </span>
                <p className="text-white text-xs opacity-90 mt-1">
                  Including all taxes
                </p>
              </div>
              <span className="text-white font-bold text-2xl">
                ₹{summary.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Shipment Details Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-3">Shipment Details</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-500">Destination</p>
                <p className="font-medium">{destination || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Chargeable Weight</p>
                <p className="font-medium">{chargeableWt} kg</p>
              </div>
              <div>
                <p className="text-gray-500">Total Pieces</p>
                <p className="font-medium">{totalPcs}</p>
              </div>
              <div>
                <p className="text-gray-500">Service</p>
                <p className="font-medium">{summary.service || 'Not Selected'}</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-end">
            <button
              className={`font-bold py-4 px-6 rounded-xl flex items-center justify-center space-x-2 transition-colors ${isShipmentOnHold
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-[var(--primary-color)] text-white hover:bg-red-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              type="submit"
              disabled={!summary.service}
            >
              <span>
                {isShipmentOnHold
                  ? 'Shipment on Hold'
                  : isEditMode
                    ? 'Update Shipment'
                    : 'Create Shipment'}
              </span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>

          {/* Warning if no service selected */}
          {!summary.service && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-yellow-800 font-semibold text-sm">
                  No Service Selected
                </p>
                <p className="text-yellow-700 text-xs mt-1">
                  Please go back and select a service to continue.
                </p>
              </div>
            </div>
          )}

          {/* Security Badge */}
          <div className="text-center mt-6">
            <div className="flex items-center justify-center space-x-2 text-gray-500 text-xs">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Secure SSL Encryption • 100% Protected</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="border border-[var(--primary-color)] text-[var(--primary-color)] font-semibold rounded-md px-12 py-3 hover:bg-red-50 transition-colors"
            type="button"
            onClick={onPrev}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;