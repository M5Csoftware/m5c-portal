"use client";
import React, { useContext, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { GlobalContext } from "../../GlobalContext";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";

function Manifest() {
  const { setManifestOpen, selectedAwbs } = useContext(GlobalContext);

  return (
    <>
      <div className="flex flex-col justify-between w-[45vw] gap-12 text-[#18181B] bg-white rounded-xl shadow-xl px-10 py-9 relative">
        <div className="bg-blue-50 border border-blue-300 text-blue-700 p-3 rounded-md text-xs font-semibold">
          {selectedAwbs.length === 1 ? (
            <span>Selected AWB: {selectedAwbs[0]}</span>
          ) : (
            <span>Selected AWBs: {selectedAwbs.join(", ")}</span>
          )}
        </div>

        <ManifestActionButtons
          setManifestOpen={setManifestOpen}
          ctaButtonLabel={"Create Manifest"}
        />
      </div>
    </>
  );
}

export default Manifest;


const ManifestActionButtons = ({ setManifestOpen, ctaButtonLabel }) => {
  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();
  const {
    selectedAwbs,
    setShowSuccessModal,
    setManifestNumber,
    setSelectedManifest,
  } = useContext(GlobalContext);

  const handleSubmitManifest = async () => {
    if (!selectedAwbs || selectedAwbs.length === 0) {
      alert("Please select at least one shipment (AWB) to create manifest.");
      return;
    }

    const payload = {
      awbNumbers: selectedAwbs,
      pickupType: "",
      pickupAddress: "",
      accountCode: session?.user?.accountCode,
    };

    try {
      const res = await axios.post(
        `${server}/portal/manifest`,
        payload
      );
      setManifestNumber(res.data.manifestNumber);
      setSelectedManifest(res.data.manifestNumber);
      setShowSuccessModal(true);
      setManifestOpen(false);
    } catch (err) {
      console.error("Manifest creation failed:", err);
      alert("Failed to create manifest. Please check console.");
    }
  };

  return (
    <div className="flex w-full items-center justify-between gap-8 text-sm">
      <button
        className="border border-[var(--primary-color)] w-full text-[var(--primary-color)] font-semibold rounded-md px-12 py-3"
        onClick={() => setManifestOpen(false)}
      >
        Not Now
      </button>
      <button
        type="button"
        className="bg-[var(--primary-color)] w-full text-white font-semibold rounded-md px-12 py-3"
        onClick={() => {
          handleSubmitManifest();
        }}
      >
        {ctaButtonLabel}
      </button>
    </div>
  );
};

export const ManifestSuccessModal = ({ manifestNumber, onClose }) => {
  const modalRef = useRef();
  const [copied, setCopied] = useState(false);
  const [originalShipments, setOriginalShipments] = useState({});
  const { server } = useContext(GlobalContext);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchExistingLogo = async () => {
      try {
        const accountCode = session?.user?.accountCode;
        if (!accountCode) return;

        const response = await axios.get(
          `${server}/portal/label-preferences?accountCode=${accountCode}`
        );

        if (response.data.success && response.data.data?.logoUrl) {
          setPreviewUrl(response.data.data.logoUrl);
          console.log("hello harman", response.data);
        }
      } catch (error) {
        console.error("Error fetching existing logo:", error);
      }
    };

    fetchExistingLogo();
  });

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(manifestNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2s
  };

  // Function to download all labels for a manifest
  const downloadAllLabelsForManifest = async (manifestNumber) => {
    try {
      // Fetch shipment details if not already cached
      let shipments = originalShipments[manifestNumber];
      if (!shipments) {
        shipments = await fetchShipmentDetails(manifestNumber);
        setOriginalShipments((prev) => ({
          ...prev,
          [manifestNumber]: shipments,
        }));
      }

      if (shipments.length === 0) {
        alert("No shipments found for this manifest");
        return;
      }

      for (let i = 0; i < shipments.length; i++) {
        const shipment = shipments[i];
        console.log(
          `Downloading label ${i + 1}/${shipments.length} for AWB: ${shipment.awbNo
          }`
        );

        const labelData = createLabelDataFromShipment(shipment);
        await downloadLabelPDF(labelData);

        // Add delay between downloads
        if (i < shipments.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      alert(`Downloaded ${shipments.length} labels successfully!`);
    } catch (error) {
      console.error("Error downloading all labels:", error);
      alert("Error downloading labels. Please try again.");
    } finally {
      console.log("downloading all label");
    }
  };

  // Function to create label data from shipment (same as ManifestOverview)
  const createLabelDataFromShipment = (shipment) => {
    return {
      date: new Date().toLocaleDateString("en-GB"),
      from: {
        name: shipment.shipperFullName || "SENDER NAME",
        address:
          `${shipment.shipperAddressLine1 || ""} ${shipment.shipperAddressLine2 || ""
            }`.trim() || "SENDER ADDRESS",
        city: shipment.shipperCity || "SENDER CITY",
        state: shipment.shipperState || "SENDER STATE",
        zip: shipment.shipperPincode || "000000",
      },
      to: {
        name: shipment.receiverFullName || "RECEIVER NAME",
        attn: "Attn:",
        address:
          `${shipment.receiverAddressLine1 || ""} ${shipment.receiverAddressLine2 || ""
            }`.trim() || "RECEIVER ADDRESS",
        city: shipment.receiverCity || "RECEIVER CITY",
        state: shipment.receiverState || "RECEIVER STATE",
        zip: shipment.receiverPincode || "000000",
      },
      serviceCode:
        shipment.service ||
        shipment.forwarder ||
        shipment.networkName ||
        "STANDARD SERVICE",
      pageInfo: "1/1",
      details: {
        type: shipment.shipmentType || "PKG",
        dim: "N/A",
        actWt: `${shipment.totalActualWt || 0} Kg`,
        volWt: `${shipment.totalVolWt || 0} Kg`,
        chgWt: `${Math.max(
          shipment.totalActualWt || 0,
          shipment.totalVolWt || 0
        )} Kg`,
      },
      trackingNumber: shipment.awbNo,
    };
  };

  // Function to fetch shipment details for a manifest
  const fetchShipmentDetails = async (manifestNumber) => {
    try {
      const response = await axios.get(
        `${server}/portal/get-shipments?manifestNumber=${manifestNumber}`
      );

      if (response.data && response.data.shipments) {
        return response.data.shipments;
      }
      return [];
    } catch (error) {
      console.error("Error fetching shipment details:", error);
      return [];
    }
  };

  // Helper function to download PDF using the label component logic (same as ManifestOverview)
  const downloadLabelPDF = async (labelData) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Import required libraries
        const { jsPDF } = await import("jspdf");
        const html2canvas = (await import("html2canvas")).default;
        const JsBarcode = (await import("jsbarcode")).default;

        // Create temporary container with proper styling
        const tempContainer = document.createElement("div");
        tempContainer.style.cssText = `
        position: fixed !important;
        left: -9999px !important;
        top: 0px !important;
        width: 350px !important;
        background: white !important;
        z-index: -1 !important;
        visibility: hidden !important;
      `;

        // Create a wrapper div for the label
        const labelWrapper = document.createElement("div");
        labelWrapper.style.cssText = `
        width: 350px;
        background: white;
        font-family: Arial, sans-serif;
        font-size: 12px;
        border: 2px solid black;
      `;

        // Create label sections
        labelWrapper.innerHTML = `
        <!-- Header -->
        <div style="border-bottom: 2px solid #374151; padding: 8px; background: white;">
  <div style="font-weight: bold; border-bottom: 2px solid black; font-size: 1.125rem; padding: 8px 0; display: flex; align-items: center; justify-content: space-between;">
    <span>M5C Logistics™</span>
    ${previewUrl
            ? `<img src="${previewUrl}" alt="Company Logo" 
              style="height: 32px; object-fit: contain; max-width: 150px;" />`
            : ""
          }
  </div>
  <div style="padding-top: 4px;">
    <span style="font-weight: 600;">Date: </span>
    ${labelData.date}
  </div>
</div>

        <!-- From Section -->
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

        <!-- Service Code -->
        <div style="padding: 8px; border-bottom: 2px solid black; display: flex; justify-content: space-between; background: white;">
          <div style="font-weight: bold;">${labelData.serviceCode}</div>
          <div style="font-weight: bold;">${labelData.pageInfo}</div>
        </div>

        <!-- To + Details -->
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

        <!-- Barcode -->
        <div style="padding: 8px 16px; display: flex; flex-direction: column; background: white;">
          <div style="display: flex; justify-content: center; margin: 10px 0;">
            <canvas id="barcode-canvas-${labelData.trackingNumber
          }" width="280" height="60"></canvas>
          </div>
          <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: end;">
            <div style="font-weight: bold; font-size: 12px;">TRACKING NUMBER</div>
            <div style="font-weight: bold; font-size: 20px;">${labelData.trackingNumber
          }</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 8px; text-align: center; font-size: 12px; border-top: 2px solid black; background: white;">
          Sender warrants that this item does not contain non-mailable matter
        </div>
      `;

        tempContainer.appendChild(labelWrapper);
        document.body.appendChild(tempContainer);

        // Generate barcode with unique ID
        const barcodeCanvas = labelWrapper.querySelector(
          `#barcode-canvas-${labelData.trackingNumber}`
        );
        if (barcodeCanvas) {
          try {
            JsBarcode(barcodeCanvas, labelData.trackingNumber, {
              format: "CODE128",
              lineColor: "#000",
              width: 2,
              height: 50,
              displayValue: false,
              background: "#ffffff",
              margin: 5,
            });
          } catch (barcodeError) {
            console.warn("Barcode generation failed:", barcodeError);
          }
        }

        // Wait for barcode to render
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Make element temporarily visible for html2canvas
        tempContainer.style.visibility = "visible";
        tempContainer.style.left = "0px";

        // Convert to canvas and PDF
        const canvas = await html2canvas(labelWrapper, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: 350,
          height: labelWrapper.offsetHeight,
          windowWidth: 350,
          windowHeight: labelWrapper.offsetHeight,
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

        // Cleanup
        document.body.removeChild(tempContainer);
        resolve();
      } catch (error) {
        console.error("Error generating PDF:", error);
        reject(error);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg text-center px-10 py-9 w-[622px] relative border-2 border-green-700 m-10"
      >
        <Image
          src="/ManifestSuccess.svg"
          alt="Manifest creation success illustration"
          width={350}
          height={350}
          className="mx-auto"
        />

        <div className="flex flex-row items-center justify-center gap-3 mt-4">
          <Image
            src="/success-icon.svg"
            alt="Success checkmark icon"
            width={30}
            height={30}
            className="mb-2"
          />
          <h2 className="text-green-600 text-2xl font-semibold mb-2">
            Manifest Created
          </h2>
        </div>

        <div className="flex items-center justify-center gap-2">
          <p className="text-xl font-medium">
            Manifest Number: <span className="font-bold">{manifestNumber}</span>
          </p>
          <button onClick={handleCopy} title="Copy Manifest Number">
            <Image
              src="/solar_copy-linear.svg"
              alt="Copy to clipboard"
              width={20}
              height={20}
              className="mt-1"
            />
          </button>
          {copied && (
            <span className="text-green-500 text-xs font-medium mt-1">
              Copied!
            </span>
          )}
        </div>

        {/* <div className="mt-4 flex items-center justify-center  bg-yellow-50 px-4 py-2 rounded-md border border-yellow-400">
          <Image src="/i_icon.svg" alt="Information icon" width={24} height={24} />
          <div className=" text-yellow-700 text-sm pl-4">
            Your pickup is scheduled within the next 2 to 3 working days.
          </div>
        </div> */}

        <div className="w-full flex gap-2">
          <div className="mt-6 border-2 border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-red-100 py-2 font-semibold rounded-md w-[40vw]">
            <button onClick={onClose}>Back to Shipments</button>
          </div>
          <div className="mt-6 border-2 border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-red-100 py-2 font-semibold rounded-md w-[40vw]">
            <Link
              href={`/portal/manifestOverview/${manifestNumber}`}
              className="text-sm hover:underline cursor-pointer"
            >
              Manifest
            </Link>
          </div>
          <div className="mt-6 bg-[var(--primary-color)] hover:bg-red-700 text-white font-semibold py-2 rounded-md w-[40vw]">
            <button onClick={() =>
              downloadAllLabelsForManifest(manifestNumber)
            }>Bulk Print Label</button>
          </div>
        </div>
      </div>
    </div>
  );
};

