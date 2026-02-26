//app/portal/shipment-overview/[awb]/page.js
"use client";
import { Phone, MapPin, Download, Search } from "lucide-react";
import Image from "next/image";
import ShipmentStatus from "@/app/portal/ShipmentOverview/ShipmentStatus";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { GlobalContext } from "../../GlobalContext";

const ShipmentOverview = ({ params: { awb } }) => {
  const [shipmentData, setShipmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { server } = useContext(GlobalContext);

  // Function to map API response to shipment data structure
  const mapApiDataToShipmentData = (apiData) => {
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formatAddress = (
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country
    ) => {
      const parts = [
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        country,
      ].filter(Boolean);
      return parts.join(", ");
    };

    // ✅ Payment logic — same as ShipmentCard
    const paymentMode = (apiData.payment || "").trim();
    const isOnHold = apiData.isHold === true;
    const totalAmt = apiData.totalAmt || 0;
    const isPaid = paymentMode !== "" || (totalAmt > 0 && !isOnHold);
    const paymentDisplay = paymentMode !== "" ? paymentMode : "Wallet";

    return {
      shipmentId: apiData.awbNo || "N/A",
      bookingDate: formatDate(apiData.date || apiData.createdAt),
      service: apiData.service || apiData.forwarder || apiData.networkName || "N/A",
      forwardingNumber: apiData.forwardingNo || "N/A",
      chargeableWeight: apiData.chargeableWt || 0,
      actualWeight: apiData.totalActualWt || 0,
      volumetricWeight: apiData.totalVolWt || 0,
      totalBoxes: Array.isArray(apiData.boxes) ? apiData.boxes.length : (apiData.pcs || 0),
      invoiceValue: apiData.totalInvoiceValue || 0,
      totalAmt,
      // ✅ Correct payment fields
      paymentMode: paymentDisplay,
      isPaid,
      paymentStatus: isPaid ? "Paid" : "Pending",
      invoiceNumber: apiData.billNo || `INV-${apiData.awbNo}` || "N/A",
      generatedOn: formatDate(apiData.createdAt),
      consignor: {
        name: apiData.shipperFullName || "N/A",
        phone: apiData.shipperPhoneNumber || "N/A",
        address: formatAddress(
          apiData.shipperAddressLine1,
          apiData.shipperAddressLine2,
          apiData.shipperCity,
          apiData.shipperState,
          apiData.shipperPincode,
          apiData.shipperCountry
        ),
        email: apiData.shipperEmail || "N/A",
      },
      consignee: {
        name: apiData.receiverFullName || "N/A",
        phone: apiData.receiverPhoneNumber || "N/A",
        address: formatAddress(
          apiData.receiverAddressLine1,
          apiData.receiverAddressLine2,
          apiData.receiverCity,
          apiData.receiverState,
          apiData.receiverPincode,
          apiData.receiverCountry
        ),
        email: apiData.receiverEmail || "N/A",
      },
      reference: apiData.reference || "N/A",
      currency: apiData.currency || "INR",
      accountCode: apiData.accountCode || "N/A",
      isOnHold: apiData.isHold || false,
      holdReason: apiData.holdReason || "",
      status: apiData.status || "",
    };
  };

  useEffect(() => {
    if (!awb) return;

    setLoading(true);
    setError(null);

    axios
      .get(`${server}/portal/create-shipment?awbNo=${awb}`)
      .then((res) => {
        console.log("API Response:", res.data);
        if (res.data) {
          const mappedData = mapApiDataToShipmentData(res.data);
          setShipmentData(mappedData);
        }
      })
      .catch((error) => {
        console.error("Error fetching shipment data:", error);
        setError("Failed to fetch shipment data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [awb, server]);

  const downloadInvoice = () => {
    alert("Downloading invoice...");
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (shipmentData?.shipmentId) {
      navigator.clipboard.writeText(shipmentData.shipmentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-8 mb-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#EA1B40]"></div>
          <p className="mt-4 text-gray-600">Loading shipment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-8 mb-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#EA1B40] text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!shipmentData) return null;

  return (
    <div className="w-full px-8 mb-10 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 sticky top-[78px] z-40 bg-gray-50">
        Shipment Overview
      </h1>

      {/* Shipment ID */}
      <div className="mb-4 border border-[#E2E8F0] bg-white rounded-lg p-4 px-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#EA1B40]">
            {shipmentData.shipmentId}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Copy Shipment ID"
          >
            <Image width={24} height={24} src={"/copy.svg"} alt="Copy shipment ID" />
          </button>
          {copied && (
            <span className="text-sm text-green-600 transition-opacity duration-300">
              Copied!
            </span>
          )}
        </div>

        <div className="text-sm text-gray-500 mt-2">
          <span>Booking Date: {shipmentData.bookingDate}</span>
          <span className="mx-4">•</span>
          <span>Service: {shipmentData.service}</span>
          <span className="mx-4">•</span>
          <span>Forwarding Number: {shipmentData.forwardingNumber}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Shipment Details */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 px-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              <Image width={24} height={24} src={"/Shipment-Details.svg"} alt="Shipment details icon" />
            </div>
            <h2 className="text-sm font-bold text-[#EA1B40]">
              Shipment Details
            </h2>
          </div>

          <div className="flex gap-4 rounded-md">
            <div className="w-1/2 flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Chargeable Weight:</span>
                <span className="font-semibold text-sm">
                  {shipmentData.chargeableWeight} Kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Actual Weight:</span>
                <span className="font-semibold text-sm">
                  {shipmentData.actualWeight} Kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Volumetric Weight:</span>
                <span className="font-semibold text-sm">
                  {shipmentData.volumetricWeight} Kg
                </span>
              </div>
            </div>
            <div className="w-1/2 flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Boxes:</span>
                <span className="font-semibold text-sm">
                  {shipmentData.totalBoxes}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice Value:</span>
                <span className="font-semibold text-sm">
                  ₹{shipmentData.invoiceValue}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Grand Total:</span>
                <span className="font-semibold text-sm">
                  ₹{shipmentData.totalAmt}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice and Payment Details */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 px-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              <Image width={24} height={24} src={"/Invoice.svg"} alt="Invoice icon" />
            </div>
            <h2 className="text-sm font-bold text-[#EA1B40]">
              Invoice and Payment Details
            </h2>
          </div>

          <div className="space-y-3 flex gap-9">
            <div className="w-1/2 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Mode:</span>
                <div className="flex items-center gap-1">
                  <Image width={18} height={18} src={"/credit-card.svg"} alt="Credit card icon" />
                  {/* ✅ Fixed: uses paymentMode from mapped data */}
                  <span className="font-semibold text-sm">
                    {shipmentData.paymentMode}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Status:</span>
                {/* ✅ Fixed: green for paid (including Wallet), yellow for pending */}
                <span
                  className={`px-3 rounded-2xl font-semibold text-sm ${
                    shipmentData.isPaid
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {shipmentData.paymentStatus}
                </span>
              </div>
            </div>
            <div className="w-1/2 flex flex-col bg-[#FFE4E9] px-2 py-4 rounded-md gap-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Number:</span>
                <span className="font-semibold text-sm">
                  {/* {shipmentData.invoiceNumber} */}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Generated On:</span>
                <span className="font-semibold text-sm">
                  {shipmentData.generatedOn}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Consignor */}
        <div className="bg-[#FFE4E9] border border-[#E2E8F0] rounded-lg p-4 px-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              <Image width={24} height={24} src={"/consignor.svg"} alt="Consignor icon" />
            </div>
            <h2 className="text-sm font-bold text-[#EA1B40]">Consignor</h2>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-800">
              {shipmentData.consignor.name}
            </h3>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{shipmentData.consignor.phone}</span>
            </div>
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
              <span className="text-sm">{shipmentData.consignor.address}</span>
            </div>
          </div>
        </div>

        {/* Consignee */}
        <div className="bg-[#FFE4E9] border border-[#E2E8F0] rounded-lg p-4 px-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              <Image width={24} height={24} src={"/consignor.svg"} alt="Consignee icon" />
            </div>
            <h2 className="text-sm font-bold text-[#EA1B40]">Consignee</h2>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-800">
              {shipmentData.consignee.name}
            </h3>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{shipmentData.consignee.phone}</span>
            </div>
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
              <span className="text-sm">{shipmentData.consignee.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Status */}
      {shipmentData.isOnHold ? (
        <HoldCard holdReason={shipmentData.holdReason} />
      ) : shipmentData.status === "offloaded" ? (
        <OffloadedCard />
      ) : (
        <ShipmentStatus awb={awb} />
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={downloadInvoice}
          className="flex-1 bg-[#EA1B40] hover:bg-red-600 text-white font-semibold text-sm py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-5 h-5" />
          Download Invoice
        </button>

        <Link href={`/portal/tracking?awb=${awb}`} className="flex-1">
          <button className="w-full border-2 border-[#EA1B40] text-[#EA1B40] hover:bg-red-50 font-semibold text-sm py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Search className="w-5 h-5" />
            Track Shipment
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ShipmentOverview;

const HoldCard = ({ holdReason }) => {
  return (
    <div className="bg-[#EA1B40] rounded-lg p-4 mb-4 border border-gray-200 w-full">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-start">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <Image width={15} height={15} src="/bx_error.svg" alt="hold" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Shipment on Hold
            </h2>
            <p className="text-sm text-white mt-1">
              Reason: {holdReason || "Documentation pending verification"}
            </p>
          </div>
        </div>
        <button className="bg-white text-[#EA1B40] px-4 py-2 rounded-lg text-sm font-semibold">
          Take Action
        </button>
      </div>
    </div>
  );
};

const OffloadedCard = ({ onContactClick }) => {
  return (
    <div className="bg-[#FFA50B] rounded-lg p-4 mb-4 border border-gray-200 w-full">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-start">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <Image width={15} height={15} src="/offloaded.svg" alt="Offloaded" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Shipment Offloaded
            </h2>
            <p className="text-sm text-white mt-1">
              Your shipment was delayed due to customs during the scheduled flight.
            </p>
          </div>
        </div>
        <button className="bg-white text-[#EA1B40] px-4 py-2 rounded-lg text-sm font-semibold">
          Contact Us
        </button>
      </div>
    </div>
  );
};