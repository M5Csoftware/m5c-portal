"use client";
import { Download, Trash2, Package } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import Image from "next/image";
import jsPDF from "jspdf";
import { GlobalContext } from "../../GlobalContext";
import { useSession } from "next-auth/react";
import Dispatch, { DisptchedSuccessModal } from "../../component/Dispatch";

const ManifestOverview = ({ params }) => {
  const { manifestId } = params;
  const [manifestData, setManifestData] = useState({
    manifestId: "DL001-01",
    date: "August 15, 2025",
    awbCount: 8,
    totalPcs: 12,
    totalWeight: 30,
    shipments: [
      {
        awb: "MPL1111120",
        pcs: 2,
        actualWeight: 4,
        volWeight: 4,
        service: "EX D&L Premium LHR DPD-UK",
      },
      {
        awb: "MPL1111121",
        pcs: 3,
        actualWeight: 5,
        volWeight: 5,
        service: "EX D&L Premium LHR DPD-UK",
      },
      {
        awb: "MPL1111122",
        pcs: 1,
        actualWeight: 3,
        volWeight: 3,
        service: "EX D&L Premium LHR DPD-UK",
      },
      {
        awb: "MPL1111123",
        pcs: 2,
        actualWeight: 4,
        volWeight: 4,
        service: "EX D&L Premium LHR DPD-UK",
      },
      {
        awb: "MPL1111124",
        pcs: 2,
        actualWeight: 4,
        volWeight: 4,
        service: "EX D&L Premium LHR DPD-UK",
      },
      {
        awb: "MPL1111125",
        pcs: 2,
        actualWeight: 4,
        volWeight: 4,
        service: "EX D&L Premium LHR DPD-UK",
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedShipments, setSelectedShipments] = useState(new Set());
  const [downloadingLabels, setDownloadingLabels] = useState(false);
  const [originalShipments, setOriginalShipments] = useState([]); // Store original API data
  const [viewingLabel, setViewingLabel] = useState(null); // For label modal
  const [showLabelModal, setShowLabelModal] = useState(false);
  const {
    server,
    setDisptchedSuccessModal,
    disptchedSuccessModal,
    dispatchOpen,
    setDisptchedOpen,
    setSelectedManifest,
  } = useContext(GlobalContext);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchExistingLogo = async () => {
      try {
        const accountCode = session?.user?.accountCode;
        if (!accountCode) return;

        const response = await axios.get(
          `${server}/portal/label-preferences?accountCode=${accountCode}`,
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

  // Function to create label data from shipment
  const createLabelDataFromShipment = (shipment) => {
    return {
      date: new Date().toLocaleDateString("en-GB"),
      from: {
        name: shipment.shipperFullName || "SENDER NAME",
        address:
          `${shipment.shipperAddressLine1 || ""} ${
            shipment.shipperAddressLine2 || ""
          }`.trim() || "SENDER ADDRESS",
        city: shipment.shipperCity || "SENDER CITY",
        state: shipment.shipperState || "SENDER STATE",
        zip: shipment.shipperPincode || "000000",
      },
      to: {
        name: shipment.receiverFullName || "RECEIVER NAME",
        attn: "Attn:",
        address:
          `${shipment.receiverAddressLine1 || ""} ${
            shipment.receiverAddressLine2 || ""
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
          shipment.totalVolWt || 0,
        )} Kg`,
      },
      trackingNumber: shipment.awbNo,
    };
  };

  // Helper function to download PDF using the label component logic
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
    ${
      previewUrl
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
                            <div>${labelData.from.city}, ${
                              labelData.from.state
                            }</div>
                            <div>${labelData.from.zip}</div>
                        </div>
                    </div>

                    <!-- Service Code -->
                    <div style="padding: 8px; border-bottom: 2px solid black; display: flex; justify-content: space-between; background: white;">
                        <div style="font-weight: bold;">${
                          labelData.serviceCode
                        }</div>
                        <div style="font-weight: bold;">${
                          labelData.pageInfo
                        }</div>
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
                                <div style="font-weight: 600;">${
                                  labelData.to.name
                                }</div>
                                <div>${labelData.to.attn}</div>
                                <div>${labelData.to.address}</div>
                                <div>${labelData.to.city}, ${
                                  labelData.to.state
                                }</div>
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
                            <canvas id="barcode-canvas-${
                              labelData.trackingNumber
                            }" width="280" height="60"></canvas>
                        </div>
                        <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: end;">
                            <div style="font-weight: bold; font-size: 12px;">TRACKING NUMBER</div>
                            <div style="font-weight: bold; font-size: 20px;">${
                              labelData.trackingNumber
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
          `#barcode-canvas-${labelData.trackingNumber}`,
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
            // Continue without barcode
          }
        }

        // Wait for barcode to render
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Make element temporarily visible for html2canvas
        tempContainer.style.visibility = "visible";
        tempContainer.style.left = "0px";

        // Convert to canvas and PDF with better options
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
          onclone: function (clonedDoc) {
            // Ensure styles are applied in cloned document
            const clonedElement = clonedDoc.querySelector(
              '[id*="barcode-canvas"]',
            );
            if (clonedElement) {
              clonedElement.style.display = "block";
            }
          },
        });

        const imgData = canvas.toDataURL("image/png", 1.0);

        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pageWidth - 20; // 10mm margin on each side
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // Center the image on the page
        const xOffset = 10; // 10mm margin
        const yOffset = (pageHeight - pdfHeight) / 2;

        pdf.addImage(imgData, "PNG", xOffset, yOffset, pdfWidth, pdfHeight);
        pdf.save(`ShippingLabel_${labelData.trackingNumber}.pdf`);

        // Cleanup
        document.body.removeChild(tempContainer);

        resolve();
      } catch (error) {
        console.error("Error generating PDF:", error);
        // Try to cleanup even if error occurs
        try {
          const tempContainer = document.querySelector(
            '[style*="position: fixed"][style*="-9999px"]',
          );
          if (tempContainer && tempContainer.parentNode) {
            tempContainer.parentNode.removeChild(tempContainer);
          }
        } catch (cleanupError) {
          console.warn("Cleanup error:", cleanupError);
        }
        reject(error);
      }
    });
  };

  // Updated downloadLabel function
  const downloadLabel = async (awb) => {
    setDownloadingLabels(true);
    try {
      const shipment = originalShipments.find((s) => s.awbNo === awb);
      if (!shipment) {
        alert("Shipment not found");
        return;
      }

      const labelData = createLabelDataFromShipment(shipment);
      await downloadLabelPDF(labelData);
    } catch (error) {
      console.error("Error downloading label:", error);
      alert("Error downloading label. Please try again.");
    } finally {
      setDownloadingLabels(false);
    }
  };

  // Updated downloadAllLabels function
  const downloadAllLabels = async () => {
    if (originalShipments.length === 0) {
      alert("No shipments available to download");
      return;
    }

    setDownloadingLabels(true);
    try {
      for (let i = 0; i < originalShipments.length; i++) {
        const shipment = originalShipments[i];
        console.log(
          `Downloading label ${i + 1}/${originalShipments.length} for AWB: ${
            shipment.awbNo
          }`,
        );

        const labelData = createLabelDataFromShipment(shipment);
        await downloadLabelPDF(labelData);

        // Add delay between downloads to prevent overwhelming the system
        if (i < originalShipments.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      alert(`Downloaded ${originalShipments.length} labels successfully!`);
    } catch (error) {
      console.error("Error downloading all labels:", error);
      alert("Error downloading labels. Please try again.");
    } finally {
      setDownloadingLabels(false);
    }
  };

  // Function to map API response to manifest data structure
  const mapApiDataToManifestData = (apiData) => {
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Handle the case where apiData has shipments array directly
    const shipments = apiData.shipments || [];

    // Store original shipments data for label generation
    setOriginalShipments(shipments);

    // Get manifest details from the first shipment (since all shipments in same manifest share these)
    const firstShipment = shipments[0];
    const manifestNumber = firstShipment?.manifestNo || manifestId || "N/A";
    const manifestDate = firstShipment?.date || firstShipment?.createdAt;

    return {
      manifestId: manifestNumber,
      date: formatDate(manifestDate),
      awbCount: shipments.length,
      totalPcs: shipments.reduce(
        (sum, shipment) => sum + (shipment?.boxes?.length || 0),
        0,
      ),
      totalWeight: shipments.reduce(
        (sum, shipment) => sum + (shipment.totalActualWt || 0),
        0,
      ),
      shipments: shipments.map((shipment) => ({
        awb: shipment.awbNo || "N/A",
        pcs: shipment?.boxes?.length || 0,
        actualWeight: shipment.totalActualWt || 0,
        volWeight: shipment.totalVolWt || 0,
        service:
          shipment.service ||
          shipment.forwarder ||
          shipment.networkName ||
          "N/A",
      })),
    };
  };

  useEffect(() => {
    console.log(manifestId);
    if (!manifestId) return;

    setLoading(true);
    setError(null);

    // Replace with your actual manifest API endpoint
    axios
      .get(`${server}/portal/get-shipments?manifestNumber=${manifestId}`)
      .then((res) => {
        console.log("API Response:", res.data);

        if (res.data && res.data.shipments) {
          const mappedData = mapApiDataToManifestData(res.data);
          setManifestData(mappedData);
        } else {
          // Handle case where no shipments found
          setManifestData({
            manifestId: manifestId,
            date: "N/A",
            awbCount: 0,
            totalPcs: 0,
            totalWeight: 0,
            shipments: [],
          });
          setOriginalShipments([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching manifest data:", error);
        setError("Failed to fetch manifest data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [manifestId]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedShipments(
        new Set(manifestData.shipments.map((shipment) => shipment.awb)),
      );
    } else {
      setSelectedShipments(new Set());
    }
  };

  const handleSelectShipment = (awb, checked) => {
    const newSelected = new Set(selectedShipments);
    if (checked) {
      newSelected.add(awb);
    } else {
      newSelected.delete(awb);
    }
    setSelectedShipments(newSelected);
  };

  // Optimized downloadPDF function to fit 15 shipments per page
  const downloadPDF = (manifestData) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;

    let currentY = margin;

    // ========== HEADER ==========
    pdf.setFillColor(234, 27, 64);
    pdf.rect(0, 0, pageWidth, 25, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont(undefined, "bold");
    pdf.text("MANIFEST REPORT", margin, 15);
    currentY = 30;

    // ========== MANIFEST SUMMARY ==========
    pdf.setFillColor(245, 245, 245);
    pdf.setDrawColor(200, 200, 200);
    pdf.roundedRect(margin, currentY, usableWidth, 30, 3, 3, "FD");

    pdf.setFillColor(234, 27, 64);
    pdf.rect(margin, currentY, usableWidth, 8, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text("MANIFEST SUMMARY", margin + 5, currentY + 6);
    currentY += 12;

    const colWidth = usableWidth / 3;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.setFont(undefined, "normal");
    pdf.text(`Manifest ID: ${manifestData.manifestId}`, margin + 5, currentY);
    pdf.text(`AWBs: ${manifestData.awbCount}`, margin + colWidth + 5, currentY);
    pdf.text(
      `Pieces: ${manifestData.totalPcs}`,
      margin + colWidth * 2 + 5,
      currentY,
    );

    currentY += 8;
    pdf.text(`Weight: ${manifestData.totalWeight} KG`, margin + 5, currentY);
    pdf.text(`Date: ${manifestData.date}`, margin + colWidth + 5, currentY);
    pdf.text("Status: ACTIVE", margin + colWidth * 2 + 5, currentY);

    currentY += 15;

    // ========== SECTION HEADER ==========
    pdf.setFillColor(234, 27, 64);
    pdf.rect(margin, currentY, usableWidth, 8, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont(undefined, "bold");
    pdf.text("SHIPMENT DETAILS", margin + 5, currentY + 6);

    currentY += 12;

    // ========== TABLE HEADER ==========
    const rowHeight = 8;
    const headerHeight = 8;

    const columnConfig = [
      { header: "AWB", width: 50, align: "left" },
      { header: "PCS", width: 30, align: "center" },
      { header: "ACT WT", width: 30, align: "center" },
      { header: "VOL WT", width: 30, align: "center" },
      { header: "Service", width: usableWidth - 140, align: "left" },
    ];

    columnConfig.forEach((col, index) => {
      col.x =
        index === 0
          ? margin
          : columnConfig[index - 1].x + columnConfig[index - 1].width;
    });

    function drawTableHeader(y) {
      pdf.setFillColor(241, 245, 249);
      pdf.rect(margin, y, usableWidth, headerHeight, "F");
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.rect(margin, y, usableWidth, headerHeight, "S");

      pdf.setTextColor(55, 65, 81);
      pdf.setFontSize(7);
      pdf.setFont(undefined, "bold");

      columnConfig.forEach((col, colIndex) => {
        let textX = col.x + 2;
        if (col.align === "center") {
          textX = col.x + col.width / 2 - pdf.getTextWidth(col.header) / 2;
        }
        pdf.text(col.header, textX, y + 5);

        if (colIndex > 0) {
          pdf.setDrawColor(226, 232, 240);
          pdf.line(col.x, y, col.x, y + headerHeight);
        }
      });
    }

    drawTableHeader(currentY);
    currentY += headerHeight;

    // ========== SHIPMENTS (WITH PAGINATION) ==========
    const shipmentsPerPage = 20;

    manifestData.shipments.forEach((shipment, index) => {
      // New page if limit reached
      if (index > 0 && index % shipmentsPerPage === 0) {
        pdf.addPage();
        currentY = margin;

        pdf.setFillColor(234, 27, 64);
        pdf.rect(margin, currentY, usableWidth, 8, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont(undefined, "bold");
        pdf.text("SHIPMENT DETAILS (contd.)", margin + 5, currentY + 6);

        currentY += 12;
        drawTableHeader(currentY);
        currentY += headerHeight;
      }

      // Alternate row color
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin, currentY, usableWidth, rowHeight, "F");
      }

      pdf.setDrawColor(243, 244, 246);
      pdf.setLineWidth(0.2);
      pdf.rect(margin, currentY, usableWidth, rowHeight, "S");

      columnConfig.forEach((col, colIndex) => {
        if (colIndex > 0) {
          pdf.setDrawColor(248, 250, 252);
          pdf.line(col.x, currentY, col.x, currentY + rowHeight);
        }
      });

      pdf.setFontSize(7);
      const cellY = currentY + 5.5;

      // AWB
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(234, 27, 64);
      pdf.text(shipment.awb, columnConfig[0].x + 2, cellY);

      // PCS
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(0, 0, 0);
      const pcsText = (shipment?.pcs).toString();
      const pcsX =
        columnConfig[1].x +
        columnConfig[1].width / 2 -
        pdf.getTextWidth(pcsText) / 2;
      pdf.text(pcsText, pcsX, cellY);

      // ACT WT
      const actWtText = `${shipment.actualWeight}`;
      const actWtX =
        columnConfig[2].x +
        columnConfig[2].width / 2 -
        pdf.getTextWidth(actWtText) / 2;
      pdf.text(actWtText, actWtX, cellY);

      // VOL WT
      const volWtText = `${shipment.volWeight}`;
      const volWtX =
        columnConfig[3].x +
        columnConfig[3].width / 2 -
        pdf.getTextWidth(volWtText) / 2;
      pdf.text(volWtText, volWtX, cellY);

      // Service
      let serviceName = shipment.service || "N/A";
      pdf.text(serviceName, columnConfig[4].x + 2, cellY);

      currentY += rowHeight;
    });

    currentY += 12;

    // ========== SHIPMENT SUMMARY ==========
    pdf.setFillColor(245, 245, 245);
    pdf.setDrawColor(200, 200, 200);
    pdf.roundedRect(margin, currentY, usableWidth, 25, 3, 3, "FD");

    pdf.setFillColor(234, 27, 64);
    pdf.rect(margin, currentY, usableWidth, 7, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont(undefined, "bold");
    pdf.text("SHIPMENT SUMMARY", margin + 5, currentY + 5);

    currentY += 11;
    const summaryColWidth = usableWidth / 3;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.setFont(undefined, "normal");
    pdf.text(
      `Shipments: ${manifestData.shipments.length}`,
      margin + 5,
      currentY,
    );
    pdf.text(
      `Pieces: ${manifestData.totalPcs}`,
      margin + summaryColWidth + 5,
      currentY,
    );
    pdf.text(
      `Weight: ${manifestData.totalWeight} KG`,
      margin + summaryColWidth * 2 + 5,
      currentY,
    );

    // Save file
    pdf.save(`Manifest_${manifestData.manifestId}.pdf`);
  };

  const dispatch = () => {
    console.log("Dispatching manifest");
    // Implement dispatch logic
    alert("Dispatching manifest...");
  };

  const deleteShipment = (awb) => {
    console.log(`Deleting shipment: ${awb}`);
    // Implement delete logic
    if (confirm(`Are you sure you want to delete shipment ${awb}?`)) {
      setManifestData((prev) => ({
        ...prev,
        shipments: prev.shipments.filter((shipment) => shipment.awb !== awb),
        awbCount: prev.awbCount - 1,
        totalPcs:
          prev.totalPcs - prev.shipments.find((s) => s.awb === awb)?.pcs || 0,
        totalWeight:
          prev.totalWeight -
            prev.shipments.find((s) => s.awb === awb)?.actualWeight || 0,
      }));
      // Also remove from original shipments
      setOriginalShipments((prev) =>
        prev.filter((shipment) => shipment.awbNo !== awb),
      );
    }
  };

  const viewLabel = (awb) => {
    console.log(`Viewing label for AWB: ${awb}`);

    const shipment = originalShipments.find((s) => s.awbNo === awb);
    if (!shipment) {
      alert("Shipment not found");
      return;
    }

    const labelData = createLabelDataFromShipment(shipment);
    setViewingLabel(labelData);
    setShowLabelModal(true);
  };

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (manifestData?.manifestId) {
      navigator.clipboard.writeText(manifestData.manifestId);
      setCopied(true);

      // Hide message after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-8 mb-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#EA1B40]"></div>
          <p className="mt-4 text-gray-600">Loading manifest data...</p>
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

  const allSelected =
    selectedShipments.size === manifestData.shipments.length &&
    manifestData.shipments.length > 0;
  const someSelected =
    selectedShipments.size > 0 &&
    selectedShipments.size < manifestData.shipments.length;

  return (
    <div className="w-full px-8 mb-2">
      <h1 className="text-2xl font-bold text-gray-800 mb-2 sticky top-[70px] z-40 bg-gray-50 py-4">
        Manifest Overview
      </h1>

      {/* Manifest Header */}
      <div className="mb-4 border border-[#E2E8F0] bg-white rounded-lg p-4 px-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-[#EA1B40]">
              {manifestData.manifestId}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Copy Shipment ID"
            >
              <Image width={24} height={24} src={"/copy.svg"} alt="Copy" />
            </button>
            {copied && (
              <span className="text-sm text-green-600 transition-opacity duration-300">
                Copied!
              </span>
            )}
          </div>

          <button
            onClick={downloadAllLabels}
            disabled={downloadingLabels}
            className={`flex items-center gap-2 text-[#EA1B40] hover:text-red-600 text-sm font-medium ${
              downloadingLabels ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Image width={15} height={15} src={"/Vector.svg"} alt="download" />
            {downloadingLabels ? "Downloading..." : "Download All Labels"}
          </button>
        </div>

        <div className="text-sm text-gray-500 mt-2">
          <span>Date: {manifestData.date}</span>
          <span className="mx-4">•</span>
          <span>AWB Count: {manifestData.awbCount}</span>
          <span className="mx-4">•</span>
          <span>Total Pcs Count: {manifestData.totalPcs}</span>
          <span className="mx-4">•</span>
          <span>Total Weitgh Count: {manifestData.totalWeight}</span>
        </div>
      </div>

      {/* Shipments Grid Layout */}
      <div className="overflow-hidden">
        {/* Header Row */}
        <div className="bg-white shadow-sm border border-gray-200 px-4 py-4 rounded-md">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1 flex justify-center">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2 text-sm font-medium text-gray-400 pl-9">
              AWB
            </div>
            <div className="col-span-1 text-sm font-medium text-gray-400 text-center">
              Pcs
            </div>
            <div className="col-span-2 text-sm font-medium text-gray-400 text-center">
              Actual Weight
            </div>
            <div className="col-span-2 text-sm font-medium text-gray-400 text-center">
              Vol. Weight
            </div>
            <div className="col-span-2 text-sm font-medium text-gray-400 pl-20">
              Service
            </div>
            <div className="col-span-2 text-sm font-medium text-gray-400 text-center">
              Action
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="max-h-[315px] overflow-y-auto scrollbar-hide">
          {manifestData.shipments.length > 0 ? (
            <div>
              {manifestData.shipments.map((shipment, index) => (
                <div
                  key={shipment.awb}
                  className={`px-4 py-4 hover:bg-gray-50 transition-colors border mt-2 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        checked={selectedShipments.has(shipment.awb)}
                        onChange={(e) =>
                          handleSelectShipment(shipment.awb, e.target.checked)
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#EA1B40] focus:ring-[#EA1B40]"
                      />
                    </div>
                    <div className="col-span-2">
                      <button
                        className="font-semibold text-[#EA1B40] hover:text-red-600 hover:underline transition-colors"
                        onClick={() =>
                          console.log("View shipment:", shipment.awb)
                        }
                      >
                        {shipment.awb}
                      </button>
                    </div>
                    <div className="col-span-1 text-sm text-gray-600 text-center">
                      {shipment.pcs}
                    </div>
                    <div className="col-span-2 text-sm text-gray-600 text-center">
                      {shipment.actualWeight} Kg
                    </div>
                    <div className="col-span-2 text-sm text-gray-600 text-center">
                      {shipment.volWeight} Kg
                    </div>
                    <div className="col-span-2 text-sm text-gray-600 text-center">
                      {shipment.service}
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center justify-end gap-6">
                        <button
                          onClick={() => viewLabel(shipment.awb)}
                          className="text-[#EA1B40] hover:text-red-600 text-sm font-medium transition-colors"
                        >
                          View Label
                        </button>
                        <div>
                          <button
                            onClick={() => downloadLabel(shipment.awb)}
                            disabled={downloadingLabels}
                            className={`text-gray-400 hover:text-gray-600 transition-colors p-1 ${
                              downloadingLabels
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            title="Download Label"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteShipment(shipment.awb)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Delete Shipment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg font-medium mb-2">No shipments found</div>
              <div className="text-sm">
                No shipments available in this manifest
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-[220px] sticky bottom-0">
        <button
          onClick={() => downloadPDF(manifestData)}
          className="flex-1 bg-[#EA1B40] hover:bg-red-600 text-white font-semibold text-sm py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>

        <button
          // onClick={dispatch}
          onClick={() => {
            setDisptchedOpen(true);
          }}
          className="flex-1 border-2 border-[#EA1B40] text-[#EA1B40] hover:bg-red-100 font-semibold text-sm py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Package className="w-5 h-5" />
          Dispatch
        </button>
      </div>

      {/* Label View Modal */}
      {showLabelModal && viewingLabel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
            {/* Modal Header */}
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
                      console.error("Error downloading label:", error);
                      alert("Error downloading label. Please try again.");
                    } finally {
                      setDownloadingLabels(false);
                    }
                  }}
                  disabled={downloadingLabels}
                  className={`px-3 py-1 text-sm border border-[#EA1B40] text-white rounded hover:bg-red-500 bg-[#EA1B40] transition-colors ${
                    downloadingLabels ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {downloadingLabels ? "Downloading..." : "Download"}
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

            {/* Modal Body */}
            <div className="p-4">
              <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                <LabelPreview
                  labelData={viewingLabel}
                  previewUrl={previewUrl}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {dispatchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <Dispatch />
        </div>
      )}

      {disptchedSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <DisptchedSuccessModal
            manifestNumber={manifestData.manifestId}
            onClose={() => setDisptchedSuccessModal(false)}
          />
        </div>
      )}
    </div>
  );
};

// Label Preview Component
const LabelPreview = ({ labelData, previewUrl }) => {
  const barcodeCanvasRef = useRef();

  useEffect(() => {
    if (barcodeCanvasRef.current && labelData?.trackingNumber) {
      const loadJsBarcode = async () => {
        try {
          const JsBarcode = (await import("jsbarcode")).default;
          JsBarcode(barcodeCanvasRef.current, labelData.trackingNumber, {
            format: "CODE128",
            lineColor: "#000",
            width: 2,
            height: 40,
            displayValue: false,
            background: "#ffffff",
            margin: 5,
          });
        } catch (error) {
          console.error("Error generating barcode:", error);
        }
      };
      loadJsBarcode();
    }
  }, [labelData]);

  return (
    <div
      className="bg-white border-2 border-black w-full max-w-sm font-sans text-xs"
      style={{ width: "300px" }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "2px solid #374151",
          padding: "8px",
          background: "white",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            borderBottom: "2px solid black",
            fontSize: "1.125rem",
            padding: "8px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>M5C Logistics™</span>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Company Logo"
              style={{
                height: "32px",
                objectFit: "contain",
                maxWidth: "150px",
              }}
            />
          )}
        </div>
        <div style={{ paddingTop: "4px" }}>
          <span style={{ fontWeight: "600" }}>Date: </span>
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
          <div className="text-xs">
            {labelData.from.city}, {labelData.from.state}
          </div>
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
            <div>
              {labelData.to.city}, {labelData.to.state}
            </div>
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

export default ManifestOverview;
