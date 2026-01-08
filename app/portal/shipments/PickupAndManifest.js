import React, { useContext, useEffect, useState } from "react";
import { Download, Edit, Trash2 } from "lucide-react";
import { GlobalContext } from "../GlobalContext";
import axios from "axios";
import Link from "next/link";
import jsPDF from "jspdf";
import { useSession } from "next-auth/react";

const ManifestTable = () => {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { accountCode, statusFilter, server, setSelectedManifest } = useContext(GlobalContext);

  // Initialize as empty array instead of with dummy data
  const [manifests, setManifests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingLabels, setDownloadingLabels] = useState(false);
  const [originalShipments, setOriginalShipments] = useState({});
  const [manifestData, setManifestData] = useState([]);

  // Ensure manifests is always an array before using array methods
  const manifestsArray = Array.isArray(manifests) ? manifests : [];
  // First filter, then paginate
  const filteredManifests =
    statusFilter === "All"
      ? manifestsArray
      : manifestsArray.filter(
        (m) => m.status.toLowerCase() === statusFilter.toLowerCase()
      );

  const totalPages = Math.ceil(filteredManifests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentManifests = filteredManifests.slice(startIndex, endIndex);

  const [selected, setSelected] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Function to fetch AWB details and calculate totals
  const fetchAwbDetails = async (awbNumbers) => {
    try {
      // Fetch details for all AWBs in this manifest
      const awbPromises = awbNumbers.map((awbNumber) =>
        axios.get(`${server}/portal/get-shipments?awbNo=${awbNumber}`)
      );

      const awbResponses = await Promise.all(awbPromises);
      console.log("AWB Responses:", awbResponses);

      let totalPcs = 0;
      let totalWeight = 0;

      awbResponses.forEach((response) => {
        // Extract shipment data from the nested structure
        const shipmentData = response.data.shipment;

        if (shipmentData) {
          // Add pieces from shipment
          totalPcs += shipmentData.pcs || 0;

          // Add total actual weight from shipment
          totalWeight += shipmentData.totalActualWt || 0;
        }
      });

      return {
        totalPcs,
        totalWeight: `${totalWeight.toFixed(2)} Kg`,
      };
    } catch (err) {
      console.error("Error fetching AWB details:", err);
      return {
        totalPcs: 0,
        totalWeight: "0.00 Kg",
      };
    }
  };

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
    const fetchManifests = async () => {
      if (!accountCode) return; // Don't fetch if no accountCode

      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(
          `${server}/portal/get-manifest?accountCode=${accountCode}`
        );

        // Ensure we always set an array
        console.log(res.data);
        const manifestData = Array.isArray(res.data.manifests)
          ? res.data.manifests
          : [];

        // Transform the data and calculate totals for each manifest
        const transformedManifests = await Promise.all(
          manifestData.map(async (manifest) => {
            // Calculate totals based on AWB data
            const awbNumbers = manifest.awbNumbers || [];
            const { totalPcs, totalWeight } = await fetchAwbDetails(awbNumbers);

            return {
              id: manifest._id,
              manifestNumber: manifest.manifestNumber,
              date: new Date(manifest.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              awbCount: awbNumbers.length,
              totalPcs: totalPcs,
              totalWeight: totalWeight,
              status: manifest.pickupType === "pickup" ? "Pickup" : "Drop",
              type: manifest.pickupType,
              pickupAddress: manifest.pickupAddress,
              awbNumbers: awbNumbers,
            };
          })
        );

        setManifests(transformedManifests);
      } catch (err) {
        console.error("Error fetching manifests:", err);
        setError("Failed to fetch manifests");
        setManifests([]); // Ensure manifests is still an array on error
      } finally {
        setLoading(false);
      }
    };

    fetchManifests();
  }, [accountCode]); // Add accountCode to dependency array

  const toggleSelectAll = () => {
    if (selected.length === currentManifests.length) {
      setSelected([]);
    } else {
      setSelected(currentManifests.map((m) => m.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleEdit = (manifest) => console.log("Edit manifest:", manifest);

  const handleDelete = async (manifest) => {
    if (window.confirm(`Delete manifest ${manifest.manifestNumber}?`)) {
      try {
        await axios.delete(`${server}/portal/delete-manifest/${manifest.id}`);
        setManifests((prev) => prev.filter((m) => m.id !== manifest.id));
      } catch (err) {
        console.error("Error deleting manifest:", err);
        alert("Failed to delete manifest");
      }
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Pickup")
      return "bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-xs font-medium";
    if (status === "Drop")
      return "bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium";
    return "bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium";
  };

  const getActionText = (status) => {
    if (status === "Pickup")
      return "Hand over the shipments to our pickup partner";
    if (status === "Drop") return "Drop the shipments at Hub";
    return "";
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

  // Function to download all labels for a manifest
  const downloadAllLabelsForManifest = async (manifest) => {
    setDownloadingLabels(true);
    try {
      // Fetch shipment details if not already cached
      let shipments = originalShipments[manifest.manifestNumber];
      if (!shipments) {
        shipments = await fetchShipmentDetails(manifest.manifestNumber);
        setOriginalShipments((prev) => ({
          ...prev,
          [manifest.manifestNumber]: shipments,
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
      setDownloadingLabels(false);
    }
  };

  // Function to download manifest summary PDF

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
        (sum, shipment) => sum + (shipment.pcs || 0),
        0
      ),
      totalWeight: shipments.reduce(
        (sum, shipment) => sum + (shipment.totalActualWt || 0),
        0
      ),
      shipments: shipments.map((shipment) => ({
        awb: shipment.awbNo || "N/A",
        pcs: shipment.pcs || 0,
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

  const fetchManifestSummary = (manifestId) => {
    if (!manifestId) return Promise.reject("No Manifest ID");

    return axios
      .get(`${server}/portal/get-shipments?manifestNumber=${manifestId}`)
      .then((res) => {
        if (res.data && res.data.shipments) {
          const mappedData = mapApiDataToManifestData(res.data);
          setManifestData(mappedData);
          return mappedData; // ✅ return data so we can use it later
        } else {
          const emptyData = {
            manifestId,
            date: "N/A",
            awbCount: 0,
            totalPcs: 0,
            totalWeight: 0,
            shipments: [],
          };
          setManifestData(emptyData);
          setOriginalShipments([]);
          return emptyData;
        }
      })
      .catch((error) => {
        console.error("Error fetching manifest data:", error);
        throw error;
      });
  };

  const downloadManifestSummaryPDF = (manifestData) => {
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
      currentY
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
      const pcsText = shipment.pcs.toString();
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
      currentY
    );
    pdf.text(
      `Pieces: ${manifestData.totalPcs}`,
      margin + summaryColWidth + 5,
      currentY
    );
    pdf.text(
      `Weight: ${manifestData.totalWeight} KG`,
      margin + summaryColWidth * 2 + 5,
      currentY
    );

    // Save file
    pdf.save(`Manifest_${manifestData.manifestId}.pdf`);
  };

  const downloadPDF = (manifestID) => {
    fetchManifestSummary(manifestID)
      .then((data) => {
        console.log("Fetched manifestData:", data);
        downloadManifestSummaryPDF(data); // ✅ use the fresh data
      })
      .catch((err) => console.error(err));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg font-medium mb-2">Loading manifests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-t-xl">
          {error}
        </div>
      )}

      {/* Custom Grid Layout with Divs */}
      <div className="overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border border-gray-200 px-4 py-4 rounded-md">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1 flex justify-center">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={
                  selected.length === currentManifests.length &&
                  currentManifests.length > 0
                }
                onChange={toggleSelectAll}
              />
            </div>
            <div className="col-span-2 text-sm font-medium text-gray-400 mx-10">
              Manifest Number
            </div>
            <div className="col-span-1 text-sm font-medium text-gray-400 text-center">
              Date
            </div>
            <div className="col-span-1 text-sm font-medium text-gray-400 text-center">
              AWB Count
            </div>
            <div className="col-span-1 text-sm font-medium text-gray-400 text-center">
              Total Pcs
            </div>
            <div className="col-span-1 text-sm font-medium text-gray-400 text-center">
              Total Weight
            </div>
            <div className="col-span-1 text-sm font-medium text-gray-400 text-center w-[200px]">
              Status
            </div>
            <div className="col-span-4 text-sm font-medium text-gray-400 w-[350px] text-center">
              Action
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="max-h-72 overflow-y-auto">
          {currentManifests.length > 0 ? (
            <div className="">
              {currentManifests.map((manifest) => (
                <div
                  key={manifest.id}
                  className="px-4 py-4 hover:bg-gray-50 transition-colors border mt-2"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(manifest.id)}
                        onChange={() => toggleSelectOne(manifest.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2 mx-14">
                      <Link
                        href={`/portal/manifestOverview/${manifest.manifestNumber}`}
                        className="text-sm hover:underline cursor-pointer"
                        onClick={() => setSelectedManifest(manifest.manifestNumber)}
                      >
                        {manifest.manifestNumber}
                      </Link>
                    </div>
                    <div className="col-span-1 text-sm text-gray-600">
                      {manifest.date}
                    </div>
                    <div className="col-span-1 text-sm text-gray-600 text-center">
                      {manifest.awbCount}
                    </div>
                    <div className="col-span-1 text-sm text-gray-600 text-center">
                      {manifest.totalPcs}
                    </div>
                    <div className="col-span-1 text-sm text-gray-600 text-center">
                      {manifest.totalWeight}
                    </div>
                    <div className="col-span-1 flex justify-center w-[200px]">
                      <span className={getStatusStyle(manifest.status)}>
                        {manifest.status}
                      </span>
                    </div>
                    <div className="col-span-4 w-[400px]">
                      <div className="flex justify-between">
                        {/* Action text (left, can wrap to 2 lines) */}
                        <div
                          className="text-xs text-red-500 cursor-pointer hover:text-red-600 text-center pl-[110px]"
                          style={{ maxWidth: "250px" }} // limit width so wrapping happens
                          title={getActionText(manifest.status)}
                        >
                          {/* {getActionText(manifest.status)} */}

                          <button
                            onClick={() =>
                              downloadAllLabelsForManifest(manifest)
                            }
                            disabled={downloadingLabels}
                            className={`px-6 rounded-lg text-xs py-3 bg-[var(--primary-color)] text-white ${downloadingLabels
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                              }`}
                          >
                            {downloadingLabels
                              ? "Downloading..."
                              : "Download Labels"}
                          </button>
                        </div>

                        {/* Action buttons (right) */}
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            // onClick={() => downloadManifestSummaryPDF(manifestData)}
                            onClick={() => downloadPDF(manifest.manifestNumber)}
                            className="text-gray-400 hover:text-green-600 transition-colors p-1"
                            title="Download Manifest Summary"
                          >
                            <Download className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => handleEdit(manifest)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                            title="Edit manifest"
                          >
                            <Edit className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => handleDelete(manifest)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Delete manifest"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-lg font-medium mb-2">
                  No manifests found
                </div>
                <div className="text-sm">No data available</div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Pagination */}
      {manifestsArray.length > 0 && (
        <div className="sticky bottom-0 border border-gray-200 bg-white px-4 mt-[235px] rounded-lg py-1">
          <div className="flex justify-between items-center">
            {/* Items per page selector */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-400 focus:ring-black"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-gray-400 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:text-gray-700"
              >
                PREV
              </button>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="text-gray-500 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:text-gray-700"
              >
                NEXT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManifestTable;
