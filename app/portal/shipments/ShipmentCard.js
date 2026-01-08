import React, { useContext, useState, useRef, useEffect } from "react";
import { GlobalContext } from "../GlobalContext";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

const ShipmentCard = ({ shipmentData, selected, onCheckboxChange }) => {
  const { setManifestOpen, setSelectedAwbs, setDisptchedOpen, server } = useContext(GlobalContext);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [viewingLabel, setViewingLabel] = useState(null);
  const [downloadingLabels, setDownloadingLabels] = useState(false);
  const router = useRouter();

  const {
    _id,
    awbNo,
    createdAt,
    service,
    totalActualWt,
    totalInvoiceValue,
    receiverFullName,
    receiverPhoneNumber,
    receiverAddressLine1,
    receiverCity,
    receiverState,
    receiverCountry,
    receiverPincode,
    shipperFullName,
    shipperPhoneNumber,
    shipperAddressLine1,
    shipperCity,
    shipperState,
    shipperCountry,
    shipperPincode,
    paymentDetails,
    chargeableWt,
    totalAmt,
    status = "Shipment Created!",
    manifestNo,
  } = shipmentData;

  // Function to create label data from shipment
  const createLabelDataFromShipment = (shipment) => {
    return {
      date: new Date().toLocaleDateString("en-GB"),
      from: {
        name: shipment.shipperFullName || "SENDER NAME",
        address: `${shipment.shipperAddressLine1 || ""} ${shipment.shipperAddressLine2 || ""}`.trim() || "SENDER ADDRESS",
        city: shipment.shipperCity || "SENDER CITY",
        state: shipment.shipperState || "SENDER STATE",
        zip: shipment.shipperPincode || "000000",
      },
      to: {
        name: shipment.receiverFullName || "RECEIVER NAME",
        attn: "Attn:",
        address: `${shipment.receiverAddressLine1 || ""} ${shipment.receiverAddressLine2 || ""}`.trim() || "RECEIVER ADDRESS",
        city: shipment.receiverCity || "RECEIVER CITY",
        state: shipment.receiverState || "RECEIVER STATE",
        zip: shipment.receiverPincode || "000000",
      },
      serviceCode: shipment.service || shipment.forwarder || shipment.networkName || "STANDARD SERVICE",
      pageInfo: "1/1",
      details: {
        type: shipment.shipmentType || "PKG",
        dim: "N/A",
        actWt: `${shipment.totalActualWt || 0} Kg`,
        volWt: `${shipment.totalVolWt || 0} Kg`,
        chgWt: `${shipment.chargeableWt || 0} Kg`,
      },
      trackingNumber: shipment.awbNo,
    };
  };

  // Helper function to download PDF using the label component logic
  const downloadLabelPDF = async (labelData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;
        const JsBarcode = (await import('jsbarcode')).default;

        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
          position: fixed !important;
          left: -9999px !important;
          top: 0px !important;
          width: 350px !important;
          background: white !important;
          z-index: -1 !important;
          visibility: hidden !important;
        `;

        const labelWrapper = document.createElement('div');
        labelWrapper.style.cssText = `
          width: 350px;
          background: white;
          font-family: Arial, sans-serif;
          font-size: 12px;
          border: 2px solid black;
        `;

        labelWrapper.innerHTML = `
          <div style="border-bottom: 2px solid #374151; padding: 8px; background: white;">
            <div style="font-weight: bold; border-bottom: 2px solid black; font-size: 20px; padding: 8px 0;">
              M5C Logistics™
            </div>
            <div style="padding-top: 4px;">
              <span style="font-weight: 600;">Date: </span>
              ${labelData.date}
            </div>
          </div>

          <div style="border-bottom: 2px solid black; position: relative; background: white;">
            <span style="background: black; color: white; padding: 4px 8px; font-weight: bold; position: absolute; top: 0; left: 0;">
              From:
            </span>
            <div style="padding: 32px 8px 8px 8px; font-weight: bold; line-height: 1.2;">
              <div>${labelData.from.name}</div>
              <div>${labelData.from.address}</div>
              <div>${labelData.from.city}, ${labelData.from.state}</div>
              <div>${labelData.from.zip}</div>
            </div>
          </div>

          <div style="padding: 8px; border-bottom: 2px solid black; display: flex; justify-content: space-between; background: white;">
            <div style="font-weight: bold;">${labelData.serviceCode}</div>
            <div style="font-weight: bold;">${labelData.pageInfo}</div>
          </div>

          <div style="border-bottom: 2px solid black; background: white;">
            <div style="display: flex;">
              <div style="flex: 1;">
                <span style="background: black; color: white; padding: 4px 8px; font-weight: bold; display: inline-block;">
                  To:
                </span>
              </div>
              <div style="width: 176px;">
                <span style="background: black; color: white; padding: 4px 8px; font-weight: bold; display: inline-block;">
                  Details
                </span>
              </div>
            </div>

            <div style="display: flex; font-weight: 600;">
              <div style="flex: 1; padding: 8px; font-size: 12px; line-height: 1.2;">
                <div style="font-weight: 600;">${labelData.to.name}</div>
                <div>${labelData.to.attn}</div>
                <div>${labelData.to.address}</div>
                <div>${labelData.to.city}, ${labelData.to.state}</div>
                <div>${labelData.to.zip}</div>
              </div>
              <div style="width: 176px; padding: 8px; font-size: 12px; border-left: 1px solid black; line-height: 1.2;">
                <div>Type: ${labelData.details.type}</div>
                <div>Dim: ${labelData.details.dim}</div>
                <div>Act Wgt: ${labelData.details.actWt}</div>
                <div>Vol Wgt: ${labelData.details.volWt}</div>
                <div>Chg Wgt: ${labelData.details.chgWt}</div>
              </div>
            </div>
          </div>

          <div style="padding: 8px 16px; display: flex; flex-direction: column; background: white;">
            <div style="display: flex; justify-content: center; margin: 10px 0;">
              <canvas id="barcode-canvas-${labelData.trackingNumber}" width="280" height="60"></canvas>
            </div>
            <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: end;">
              <div style="font-weight: bold; font-size: 12px;">TRACKING NUMBER</div>
              <div style="font-weight: bold; font-size: 20px;">${labelData.trackingNumber}</div>
            </div>
          </div>

          <div style="padding: 8px; text-align: center; font-size: 12px; border-top: 2px solid black; background: white;">
            Sender warrants that this item does not contain non-mailable matter
          </div>
        `;

        tempContainer.appendChild(labelWrapper);
        document.body.appendChild(tempContainer);

        const barcodeCanvas = labelWrapper.querySelector(`#barcode-canvas-${labelData.trackingNumber}`);
        if (barcodeCanvas) {
          try {
            JsBarcode(barcodeCanvas, labelData.trackingNumber, {
              format: "CODE128",
              lineColor: "#000",
              width: 2,
              height: 50,
              displayValue: false,
              background: "#ffffff",
              margin: 5
            });
          } catch (barcodeError) {
            console.warn('Barcode generation failed:', barcodeError);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        tempContainer.style.visibility = 'visible';
        tempContainer.style.left = '0px';

        const canvas = await html2canvas(labelWrapper, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 350,
          height: labelWrapper.offsetHeight,
          windowWidth: 350,
          windowHeight: labelWrapper.offsetHeight
        });

        const imgData = canvas.toDataURL("image/png", 1.0);
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pageWidth - 20;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const xOffset = 10;
        const yOffset = (pageHeight - pdfHeight) / 2;

        pdf.addImage(imgData, "PNG", xOffset, yOffset, pdfWidth, pdfHeight);
        pdf.save(`ShippingLabel_${labelData.trackingNumber}.pdf`);

        document.body.removeChild(tempContainer);
        resolve();
      } catch (error) {
        console.error('Error generating PDF:', error);
        try {
          const tempContainer = document.querySelector('[style*="position: fixed"][style*="-9999px"]');
          if (tempContainer && tempContainer.parentNode) {
            tempContainer.parentNode.removeChild(tempContainer);
          }
        } catch (cleanupError) {
          console.warn('Cleanup error:', cleanupError);
        }
        reject(error);
      }
    });
  };

  const viewLabel = () => {
    const labelData = createLabelDataFromShipment(shipmentData);
    setViewingLabel(labelData);
    setShowLabelModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formattedShipmentDetails = `
    ${formatTime(createdAt)}, ${formatDate(createdAt)}
    Service :${service}
    Charged Wt : ${chargeableWt} kg
  `;

  const formatDetails = (name, phone, address, city, state, country, pincode) => {
    return `
      ${name} ${phone}
      ${address}
      ${city},${state}
      ${country},${pincode}
    `;
  };

  const formattedPackageDetails = `
    Actual Wt : ${totalActualWt} kg
    Volumetric Wt : ${shipmentData.totalVolWt} kg
    Invoice Value : ₹${totalInvoiceValue}
    Total Boxes : ${Object.keys(shipmentData.shipmentAndPackageDetails || {}).length}
  `;

  const formattedPaymentDetails = paymentDetails
    ? `Payment Mode : ${paymentDetails.mode}`
    : "Payment Pending";

  const statusConfig = {
    "Shipment Created!": {
      color: "bg-blue-200 text-blue-700",
      btnText: "Create Manifest",
      btnAction: () => {
        setSelectedAwbs([awbNo]);   // ✅ Auto-select this shipment
        setManifestOpen(true);      // ✅ Then open the manifest popup
      }

    },
    "Manifest Created": {
      color: "bg-blue-200 text-blue-700",
      btnText: "Dispatch Shipment",
      btnAction: () => {
        setSelectedAwbs([awbNo]);   // ✅ Auto-select this shipment
        setDisptchedOpen(true);      // ✅ Then open the manifest popup
      }
    },
    "Ready to Ship": {
      color: "bg-blue-200 text-blue-700",
      btnText: "View Label",
      btnAction: viewLabel,
    },
    "Manifest Dispatched": {
      color: "bg-blue-200 text-blue-700",
      btnText: "View Label",
      btnAction: viewLabel,
    },
    "Arrived at Hub": {
      color: "bg-blue-200 text-blue-700",
      btnText: "View Label",
      btnAction: viewLabel,
    },
    Hold: {
      color: "bg-red-200 text-red-700",
      btnText: "Make Payment",
      btnAction: () => alert("Make Payment clicked!"),
    },
    "In Transit": {
      color: "bg-yellow-200 text-yellow-700",
      btnText: "Track Shipment",
      btnAction: () => alert("Track Shipment clicked!"),
    },
    Delivered: {
      color: "bg-green-200 text-green-700",
      btnText: "View POD",
      btnAction: () => alert("View POD clicked!"),
    },
  };

  const { color, btnText, btnAction } = statusConfig[status] || {
    color: "bg-gray-200 text-gray-700",
    btnText: "N/A",
    btnAction: () => { },
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete shipment AWB: ${awbNo}?`
    );

    if (!confirmDelete) return; // ❌ User cancelled

    try {
      const response = await axios.delete(
        `${server}/portal/create-shipment?awbNo=${awbNo}`
      );

      console.log("AWB deleted:", response.data);
      alert(`Shipment ${awbNo} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting AWB:", error);
      alert("Error deleting shipment.");
    }
  };



  return (
    <div className={`bg-white border border-[#E2E8F0] rounded-[4px] ${selected ? "bg-gray-200" : ""} text-[#71717A]`}>
      <ul className="flex justify-between shipment-detail-ul p-4 text-xs text-center items-center">
        <li style={{ width: "10px" }}>
          <input
            type="checkbox"
            name="shipment-detail"
            id={_id}
            checked={selected}
            onChange={() => onCheckboxChange(_id)}
          />
        </li>

        <li className="truncate flex flex-col">
          <Link href={`/portal/ShipmentOverview/${awbNo}`} className="text-sm hover:underline cursor-pointer text-[#EA1B40]">
            {awbNo}
          </Link>
          <Link href={`/portal/manifestOverview/${manifestNo}`} className="text-[12px] underline text-[#EA1B40]">
            {manifestNo}
          </Link>
        </li>

        <li>
          {formattedShipmentDetails.split("\n").map((line, index) => (
            <p key={index} className="truncate whitespace-nowrap text-left">
              {line.trim()}
            </p>
          ))}
        </li>

        <li>
          {formatDetails(shipperFullName, shipperPhoneNumber, shipperAddressLine1, shipperCity, shipperState, shipperCountry, shipperPincode)
            .split("\n")
            .map((line, index) => (
              <p key={index} className="truncate whitespace-nowrap text-left">
                {line.trim()}
              </p>
            ))}
        </li>

        <li>
          {formatDetails(receiverFullName, receiverPhoneNumber, receiverAddressLine1, receiverCity, receiverState, receiverCountry, receiverPincode)
            .split("\n")
            .map((line, index) => (
              <p key={index} className="truncate whitespace-nowrap text-left">
                {line.trim()}
              </p>
            ))}
        </li>

        <li>
          {formattedPackageDetails.split("\n").map((line, index) => (
            <p key={index} className="truncate whitespace-nowrap text-left">
              {line.trim()}
            </p>
          ))}
        </li>

        <li>
          <span className="font-semibold">{totalAmt}</span>
          {formattedPaymentDetails.split("\n").map((line, index) => (
            <p key={index} className="truncate whitespace-nowrap rounded-lg bg-gray-300 py-1 my-2 font-semibold">
              {line.trim()}
            </p>
          ))}
        </li>

        <li>
          <p className={`truncate whitespace-nowrap rounded-lg py-1 my-2 font-semibold ${color}`}>
            {status}
          </p>
          {status === "Hold" && (
            <span className="text-[var(--primary-color)] font-semibold">Credit Limit</span>
          )}
        </li>

        <li className="truncate">
          <button onClick={btnAction} className="px-6 rounded-lg text-xs py-3 bg-[var(--primary-color)] text-white w-[140px]">
            {btnText}
          </button>
        </li>
        <span className="flex flex-row gap-2">

          {/* Edit Button */}
          <button onClick={() => router.push(`/portal/createshipment?editAwb=${awbNo}`)}>
            <Pencil size={16} />
          </button>

          {/* Delete Button */}
          <button
            className="p-1 rounded-full hover:bg-red-500 transition cursor-pointer"
            onClick={handleDelete}
          >
            <Trash2 size={16} className="text-gray-600 hover:text-white" />
          </button>

        </span>

      </ul>

      {showLabelModal && viewingLabel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Shipping Label - {viewingLabel.trackingNumber}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      setDownloadingLabels(true);
                      await downloadLabelPDF(viewingLabel);
                    } catch (error) {
                      console.error('Error downloading label:', error);
                      alert('Error downloading label. Please try again.');
                    } finally {
                      setDownloadingLabels(false);
                    }
                  }}
                  disabled={downloadingLabels}
                  className={`px-3 py-1 text-sm border border-[#EA1B40] text-white rounded hover:bg-red-500 bg-[#EA1B40] transition-colors ${downloadingLabels ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {downloadingLabels ? 'Downloading...' : 'Download'}
                </button>
                <button
                  onClick={() => {
                    setShowLabelModal(false);
                    setViewingLabel(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold w-10 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                <LabelPreview labelData={viewingLabel} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Label Preview Component
const LabelPreview = ({ labelData }) => {
  const barcodeCanvasRef = useRef();

  useEffect(() => {
    if (barcodeCanvasRef.current && labelData?.trackingNumber) {
      const loadJsBarcode = async () => {
        try {
          const JsBarcode = (await import('jsbarcode')).default;
          JsBarcode(barcodeCanvasRef.current, labelData.trackingNumber, {
            format: "CODE128",
            lineColor: "#000",
            width: 2,
            height: 40,
            displayValue: false,
            background: "#ffffff",
            margin: 5
          });
        } catch (error) {
          console.error('Error generating barcode:', error);
        }
      };
      loadJsBarcode();
    }
  }, [labelData]);

  return (
    <div className="bg-white border-2 border-black w-full max-w-sm font-sans text-xs" style={{ width: "300px" }}>
      {/* Header */}
      <div className="border-b-2 border-gray-800 p-2 flex flex-col">
        <div className="font-bold border-b-2 border-black text-lg py-2">
          M5C Logistics™
        </div>
        <div className="pt-1">
          <span className="font-semibold">Date: </span>
          {labelData.date}
        </div>
      </div>

      {/* From Section */}
      <div className="border-b-2 border-black relative">
        <span className="bg-black text-white px-2 py-1 font-bold absolute top-0 left-0 text-xs">
          From:
        </span>
        <div className="space-y-0.5 leading-tight pt-6 pb-2 px-2 font-bold">
          <div className="text-xs">{labelData.from.name}</div>
          <div className="text-xs">{labelData.from.address}</div>
          <div className="text-xs">{labelData.from.city}, {labelData.from.state}</div>
          <div className="text-xs">{labelData.from.zip}</div>
        </div>
      </div>

      {/* Service Code */}
      <div className="p-2 border-b-2 border-black flex justify-between">
        <div className="font-bold text-xs">{labelData.serviceCode}</div>
        <div className="font-bold text-xs">{labelData.pageInfo}</div>
      </div>

      {/* To + Details */}
      <div className="border-b-2 border-black">
        <div className="flex">
          <div className="flex-1">
            <span className="bg-black text-white px-2 py-1 font-bold inline-block text-xs">
              To:
            </span>
          </div>
          <div className="w-32">
            <span className="bg-black text-white px-2 py-1 font-bold inline-block text-xs">
              Details
            </span>
          </div>
        </div>

        <div className="flex font-semibold">
          <div className="flex-1 p-2 text-xs space-y-0.5 leading-tight">
            <div className="font-semibold">{labelData.to.name}</div>
            {labelData.to.attn && <div>{labelData.to.attn}</div>}
            <div>{labelData.to.address}</div>
            <div>{labelData.to.city}, {labelData.to.state}</div>
            <div>{labelData.to.zip}</div>
          </div>

          <div className="w-32 p-2 text-xs space-y-0.5 leading-tight border-l border-black">
            <div>Type: {labelData.details.type}</div>
            <div>Dim: {labelData.details.dim}</div>
            <div>Act Wgt: {labelData.details.actWt}</div>
            <div>Vol Wgt: {labelData.details.volWt}</div>
            <div>Chg Wgt: {labelData.details.chgWt}</div>
          </div>
        </div>
      </div>

      {/* Barcode */}
      <div className="relative px-3 py-2 flex flex-col">
        <div className="flex justify-center">
          <canvas ref={barcodeCanvasRef}></canvas>
        </div>
        <div className="mt-2 flex justify-between items-end">
          <div className="font-bold text-xs">TRACKING NUMBER</div>
          <div className="font-bold text-base">{labelData.trackingNumber}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 text-center text-xs border-t-2 border-black">
        Sender warrants that this item does not contain non-mailable matter
      </div>
    </div>
  );
};

export default ShipmentCard;