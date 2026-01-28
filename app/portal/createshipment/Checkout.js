import React, { useEffect, useState } from "react";
import Image from "next/image";

function Checkout({ 
  step, 
  onPrev, 
  selectedServiceLocal, 
  filteredServicesWithRates, 
  destination, 
  destinationFlag, 
  isEditMode,
  watch 
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
    sgstAmt: 0
  });

  // Watch form values for display
  const chargeableWt = watch("chargeableWt") || 0;
  const totalPcs = watch("boxes")?.length || 0;

  // ✅ FIXED: GST percentages (9% each = 18% total)
  const cgstPercent = 9;
  const sgstPercent = 9;

  useEffect(() => {
    console.log("Checkout - selectedServiceLocal:", selectedServiceLocal);
    console.log("Checkout - filteredServicesWithRates:", filteredServicesWithRates);

    if (!selectedServiceLocal || !filteredServicesWithRates || filteredServicesWithRates.length === 0) {
      console.log("Checkout - No service selected or no rates available");
      return;
    }

    const matchingObject = filteredServicesWithRates.find(
      item => item.service === selectedServiceLocal
    );

    if (matchingObject) {
      console.log("Checkout - Matched Object:", matchingObject);
      
      // ✅ FIX: Convert string values to numbers for calculations
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
      console.log("Checkout - No matching service found");
      // Reset to default if no match
      setSummary({
        service: "",
        zone: "",
        rate: 0,
        shipper: "",
        type: "",
        basicAmt: 0,
        grandTotal: 0,
        cgstAmt: 0,
        sgstAmt: 0
      });
    }
  }, [selectedServiceLocal, filteredServicesWithRates]);

  return (
    <div className="bg-white rounded-3xl p-10 flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <div className="relative w-9 h-9">
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${
              step <= 6 ? "opacity-100" : "opacity-0"
            }`}
            src="/create-shipment/6.svg"
            alt="step 6"
            width={36}
            height={36}
          />
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${
              step > 6 ? "opacity-100" : "opacity-0"
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
        className={`flex flex-col gap-5 overflow-hidden transition-max-height duration-500 ease-in-out ${
          step === 6 ? "max-h-[1000px]" : "max-h-0"
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

          {/* Service Details Card */}
          {/* {summary.service && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Selected Service
                  </p>
                  <p className="text-lg font-bold text-[var(--primary-color)]">
                    {summary.service}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Shipper: {summary.shipper}
                    {summary.zone && ` • Zone: ${summary.zone}`}
                    {(summary.isCanadaShipment || summary.isAustraliaShipment) && (
                      <span className="ml-2 bg-blue-100 px-2 py-0.5 rounded">
                        Postal Code Based
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Chargeable Weight</p>
                  <p className="text-lg font-bold text-gray-800">
                    {chargeableWt} kg
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {totalPcs} {totalPcs === 1 ? "Piece" : "Pieces"}
                  </p>
                </div>
              </div>
            </div>
          )} */}

          {/* Rewards Section */}
          <div className="bg-red-100 rounded-xl p-4 mb-6 border border-[var(--primary-color)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image src="/m5c.svg" width={35} height={35} alt="Coins" />

                <div>
                  <p className="font-semibold text-gray-900">0 M5Coins</p>
                  <p className="text-xs text-gray-500">Apply coins for discount</p>
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

          {/* Pricing Breakdown - ✅ FIXED: Now properly displays values */}
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
          <div className="bg-gradient-to-r from-[var(--primary-color)] to-red-600 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-white font-semibold text-lg">
                  Total Amount
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

          {/* Summary Stats */}
          {/* {summary.service && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 mb-1">Rate Type</p>
                <p className="font-semibold text-gray-800">
                  {summary.type === "B" ? "Per Kg" : "Slab Rate"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 mb-1">Base Rate</p>
                <p className="font-semibold text-gray-800">
                  ₹{summary.rate.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 mb-1">Destination</p>
                <p className="font-semibold text-gray-800">
                  {destination || "N/A"}
                </p>
              </div>
            </div>
          )} */}

          {/* CTA Button */}
          <div className="flex justify-end">
            <button
              className="bg-[var(--primary-color)] text-white font-bold py-4 px-6 rounded-xl hover:bg-red-600 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={!summary.service}
            >
              <span>{isEditMode ? "Update Shipment" : "Create Shipment"}</span>
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