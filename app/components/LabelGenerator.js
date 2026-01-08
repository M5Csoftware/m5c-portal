"use client";
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import html2canvas from "html2canvas";

const mockData = {
  date: "14/11/2023",
  from: {
    name: "SWETA SUBHASH SHARMA",
    address: "1 RAMESH APARTMENT, JESAL PARK NEAR GANES",
    city: "JAIPUR",
    state: "RAJASTHAN",
    zip: "401105",
  },
  to: {
    name: "Bhanu Sargadam",
    attn: "Attn:",
    address: "3132, Paola Terrace",
    city: "Dublin",
    state: "CA",
    zip: "94568",
  },
  serviceCode: "EX-DEL-US-PR-GR-UPS",
  pageInfo: "3/3",
  details: {
    type: "NDOX",
    dim: "18x18x18 cm",
    actWt: "0.220 Kg",
    volWt: "0.220 Kg",
    chgWt: "0.220 Kg",
  },
  trackingNumber: "M5P7535204",
};

const ShippingLabelGenerator = forwardRef(({ labelData, onDownloadComplete, isVisible = true }, ref) => {
  const labelRef = useRef();
  const barcodeCanvasRef = useRef();

  // Use provided labelData or fallback to mockData
  const data = labelData || mockData;

  // Generate Barcode
  useEffect(() => {
    if (barcodeCanvasRef.current && data?.trackingNumber) {
      try {
        JsBarcode(barcodeCanvasRef.current, data.trackingNumber, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 50,
          displayValue: false, // Hide text under barcode
        });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    }
  }, [data]);

  // Handle PDF Download
  const handleDownloadPDF = async () => {
    try {
      const element = labelRef.current;
      if (!element) {
        throw new Error("Label element not found");
      }

      // Convert HTML to canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL("image/png");

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight);
      pdf.save(`ShippingLabel_${data.trackingNumber}.pdf`);

      if (onDownloadComplete) {
        onDownloadComplete();
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  // Expose download function to parent component
  useImperativeHandle(ref, () => ({
    downloadPDF: handleDownloadPDF,
    getLabelElement: () => labelRef.current,
    getLabelData: () => data
  }));

  return (
    <div className={`${isVisible ? 'p-6 bg-gray-100 min-h-screen' : 'absolute left-[-9999px] top-[-9999px]'}`}>
      <div className="max-w-md mx-auto">
        {/* Label Section */}
        <div
          ref={labelRef}
          className="py-8">

          <div
            className="bg-white border-2 border-black w-full max-w-sm mx-auto font-sans text-xs"
            style={{ width: "350px" }}
          >
            {/* Header */}
            <div className="border-b-2 border-gray-800 p-2 flex flex-col">
              <div className="font-bold border-b-2 border-black text-xl py-2">
                M5C Logistics™
              </div>
              <div className="pt-1">
                <span className="font-semibold">Date: </span>
                {data.date}
              </div>
            </div>

            {/* From Section */}
            <div className="border-b-2 border-black relative">
              <span className="bg-black text-white px-2 py-1 font-bold absolute top-0 left-0">
                From:
              </span>
              <div className="space-y-0.5 leading-tight pt-8 pb-2 px-2 font-bold">
                <div>{data.from.name}</div>
                <div>{data.from.address}</div>
                <div>
                  {data.from.city}, {data.from.state}
                </div>
                <div>{data.from.zip}</div>
              </div>
            </div>

            {/* Service Code */}
            <div className="p-2 border-b-2 border-black flex justify-between">
              <div className="font-bold">{data.serviceCode}</div>
              <div className="font-bold">{data.pageInfo}</div>
            </div>

            {/* To + Details */}
            <div className="border-b-2 border-black">
              <div className="flex">
                <div className="flex-1">
                  <span className="bg-black text-white px-2 py-1 font-bold inline-block">
                    To:
                  </span>
                </div>
                <div className="w-44">
                  <span className="bg-black text-white px-2 py-1 font-bold inline-block">
                    Details
                  </span>
                </div>
              </div>

              <div className="flex font-semibold">
                <div className="flex-1 p-2 text-xs space-y-0.5 leading-tight">
                  <div className="font-semibold">{data.to.name}</div>
                  {data.to.attn && <div>{data.to.attn}</div>}
                  <div>{data.to.address}</div>
                  <div>
                    {data.to.city}, {data.to.state}
                  </div>
                  <div>{data.to.zip}</div>
                </div>

                <div className="w-44 p-2 text-xs space-y-0.5 leading-tight border-l border-black">
                  <div>Type: {data.details.type}</div>
                  <div>Dim: {data.details.dim}</div>
                  <div>Act Wgt: {data.details.actWt}</div>
                  <div>Vol Wgt: {data.details.volWt}</div>
                  <div>Chg Wgt: {data.details.chgWt}</div>
                </div>
              </div>
            </div>

            {/* Barcode */}
            <div className="relative px-4 py-2 flex flex-col">
              {/* Slanted border only top & bottom */}
              <div className="absolute inset-0 pointer-events-none 
                  before:content-[''] before:absolute before:inset-0 
                  before:bg-[repeating-linear-gradient(135deg,black,black_25px,transparent_20px,transparent_30px),repeating-linear-gradient(315deg,black,black_25px,transparent_20px,transparent_30px)] 
                  before:bg-[length:100%_6px,100%_6px] 
                  before:bg-[position:0_0,0_100%] 
                  before:bg-no-repeat">
              </div>

              <div className="flex justify-center">
                <canvas ref={barcodeCanvasRef}></canvas>
              </div>
              <div className="mt-2 flex justify-between items-end">
                <div className="font-bold text-xs">TRACKING NUMBER</div>
                <div className="font-bold text-xl">{data.trackingNumber}</div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-2 text-center text-xs border-t-2 border-black">
              Sender warrants that this item does not contain non-mailable matter
            </div>
          </div>
        </div>

        {/* Download Button - only show if visible and no parent is controlling */}
        {isVisible && !labelData && (
          <div className="flex justify-center">
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-2 border-2 border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors font-semibold"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

ShippingLabelGenerator.displayName = "ShippingLabelGenerator";

export default ShippingLabelGenerator;

// Utility function to create label data from shipment (can be imported by other components)
export const createLabelDataFromShipment = (shipment) => {
  return {
    date: new Date().toLocaleDateString("en-GB"), // DD/MM/YYYY format
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
      dim: "N/A", // You can calculate this from package dimensions if available
      actWt: `${shipment.totalActualWt || 0} Kg`,
      volWt: `${shipment.totalVolWt || 0} Kg`,
      chgWt: `${Math.max(shipment.totalActualWt || 0, shipment.totalVolWt || 0)} Kg`,
    },
    trackingNumber: shipment.awbNo || shipment.awb,
  };
};