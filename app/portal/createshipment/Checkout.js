import React, { useEffect, useState } from "react";
import Image from "next/image";

function Checkout({ step, onPrev, selectedServiceLocal, filteredServicesWithRates, cgst, sgst, destination, destinationFlag, isEditMode, }) {
  const [summary, setSummary] = useState({})

  useEffect(() => {
    const matchingObject = filteredServicesWithRates.find(
      item => item.service === selectedServiceLocal
    ) ?? {
      service: "",
      zone: "",
      rate: 0,
      shipper: "",
      type: "",
      basicAmt: 0,
      grandTotal: 0,
      cgstAmt: 0,
      sgstAmt: 0
    };

    console.log("Matched Object: ", matchingObject);
    setSummary(matchingObject)
  }, [selectedServiceLocal, filteredServicesWithRates]);


  return (
    <div className="bg-white rounded-3xl p-10 flex flex-col gap-2 ">
      <div className="flex gap-2 items-center">
        <div className="relative w-9 h-9">
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${step <= 6 ? "opacity-100" : "opacity-0"
              }`}
            src="/create-shipment/6.svg"
            alt="step 1"
            width={36}
            height={36}
          />
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${step > 6 ? "opacity-100" : "opacity-0"
              }`}
            src="/create-shipment/done-red.svg"
            alt="step 1"
            width={36}
            height={36}
          />
        </div>
        <h2 className="text-base px-2 font-bold ">Ckeckout</h2>
      </div>

      <div className={`flex flex-col  gap-5  overflow-hidden transition-max-height duration-500 ease-in-out ${step === 6 ? "max-h-[1000px]" : "max-h-0"}`}>

        <div className="text-xs bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-200 w-full mx-auto">

          {/* Header */}
          <div className="flex justify-start">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">
                Order Summary
              </h2>
              <p className="text-gray-500 text-sm mt-2">Review your shipment details</p>
            </div>
          </div>


          {/* Rewards Section */}
          <div className="bg-red-100 rounded-xl p-4 mb-6 border border-[var(--primary-color)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image
                  src="/m5c.svg"
                  width={35}
                  height={35}
                  alt="Coins"
                />

                <div>
                  <p className="font-semibold text-gray-900">0 M5Coins</p>
                  <p className="text-xs text-gray-500">Apply coins for discount</p>
                </div>
              </div>
              <button className="bg-white text-[var(--primary-color)] font-semibold py-2 px-4 rounded-lg border border-[var(--primary-color)] hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md">
                Apply
              </button>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Basic Amount</span>
              <span className="font-semibold">₹{Number(summary.basicAmt).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <span className="text-gray-600">CGST </span>
                <span className="text-xs text-gray-400">({cgst}%)</span>
              </div>
              <span className="font-semibold">₹{Number(summary.cgstAmt).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <span className="text-gray-600">SGST </span>
                <span className="text-xs text-gray-400">({sgst}%)</span>
              </div>
              <span className="font-semibold">₹{Number(summary.sgstAmt).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Coin Discount</span>
              <span className="text-green-600 font-semibold">- ₹0.00</span>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-[var(--primary-color)] to-red-600 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold text-lg">Total Amount</span>
              <span className="text-white font-bold text-xl">
                ₹{Number(summary.grandTotal).toFixed(2)}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-end">
            <button
              className="bg-[var(--primary-color)] text-white font-bold py-4 px-6 rounded-xl  hover:bg-red-600 flex items-center justify-center space-x-2"
              type="submit"
            >
              <span>{isEditMode ? "Update Shipment" : "Create Shipment"}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Security Badge */}
          <div className="text-center mt-4">
            <div className="flex items-center justify-center space-x-2 text-gray-500 text-xs">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure SSL Encryption • 100% Protected</span>
            </div>
          </div>

        </div>

        <div className="flex justify-end ">
          <button
            className="border border-[var(--primary-color)] text-[var(--primary-color)] font-semibold rounded-md px-12 py-2"
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
